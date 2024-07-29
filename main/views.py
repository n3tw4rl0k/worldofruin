from django.shortcuts import render, redirect
from .models import MapLocation, CharacterDetails
from django.contrib.auth.decorators import login_required
from main.map_generator import generate_map
from main.game_data import ZONES, MONSTERS, SAFE_STARTING_ZONE, DANGER_WARNINGS
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist

import logging

logger = logging.getLogger('main')
DEBUG_DISABLE_DANGER_CHECK = False


@login_required
def game_intro(request):
    if request.method == 'POST':
        return redirect('choose_class')
    return render(request, 'game_intro.html')


@login_required
def choose_class(request):
    user = request.user
    character_details, created = CharacterDetails.objects.get_or_create(user=user)

    if character_details.character_class:
        return redirect('game_main')

    if request.method == 'POST':
        chosen_class = request.POST.get('class')
        if chosen_class in ['ROGUE', 'WARRIOR', 'MAGE']:
            character_details.character_class = chosen_class
            character_details.set_class_stats()
            character_details.save()
            return redirect('game_main')

    return render(request, 'choose_class.html')


@login_required
def game_main(request):
    user = request.user
    character_details, created = CharacterDetails.objects.get_or_create(user=user)

    if not character_details.character_class:
        return redirect('choose_class')

    if not MapLocation.objects.exists():
        map_grid, location_details = generate_map(ZONES, MONSTERS)

        # noinspection DuplicatedCode
        for location_id, details in location_details.items():
            MapLocation.objects.create(
                location_id=location_id,
                x=details['coords'][0],
                y=details['coords'][1],
                zone=details['zone'],
                sub_zone=details['sub_zone'],
                description=details['description'],
                level=details['level'],
                monsters=details['monsters'],
                dungeon=details['dungeon'],
                up=details['neighbors'].get('up', ''),
                down=details['neighbors'].get('down', ''),
                left=details['neighbors'].get('left', ''),
                right=details['neighbors'].get('right', ''),
                location_monster=details['location_monster']
            )

    if created:
        start_location = MapLocation.objects.filter(zone="Red Desert", level=1).first()
        if not start_location:
            start_location = MapLocation.objects.first()
        character_details.current_location = start_location
        character_details.save()

    current_location = character_details.current_location

    context = {
        'location': {
            'zone': current_location.zone,
            'sub_zone': current_location.sub_zone,
            'description': current_location.description,
            'level': current_location.level,
            'monsters': current_location.monsters,
            'dungeon': current_location.dungeon,
        },
        'character': {
            'level': character_details.level,
            'xp': character_details.xp,
            'xp_to_next_level': character_details.xp_to_next_level(),
            'strength': character_details.strength,
            'dexterity': character_details.dexterity,
            'intelligence': character_details.intelligence,
            'hp_total': character_details.hit_points_total,
            'hp_remaining': character_details.hit_points_remaining,
            'class': character_details.get_character_class_display(),
        }
    }

    return render(request, 'game.html', context)


@login_required
def game_over(request):
    if request.method == 'POST':
        # Reset character position and danger_zone_steps
        player_position = CharacterDetails.objects.get(user=request.user)
        start_location = MapLocation.objects.filter(zone="Red Desert", sub_zone=SAFE_STARTING_ZONE).first()
        if not start_location:
            start_location = MapLocation.objects.first()
        player_position.current_location = start_location
        player_position.danger_zone_steps = 0
        player_position.save()
        return redirect('game_main')
    return render(request, 'game_over.html')


def is_danger_zone(player_level, zone_level, sub_zone):
    if sub_zone == SAFE_STARTING_ZONE:
        return False
    return zone_level - player_level > 5


def get_danger_warning(sub_zone, step):
    warnings = DANGER_WARNINGS.get(sub_zone, ["You sense danger.", "The danger grows.", "You should turn back.",
                                              "This is your last warning.", "You've gone too far."])
    return warnings[min(step, len(warnings) - 1)]


@login_required
@require_POST
def move(request):
    user = request.user
    direction = request.POST.get('direction')
    player_position = CharacterDetails.objects.get(user=user)
    current_location = player_position.current_location
    logger.info(f"Current location: {current_location}")

    if direction == 'initial':
        new_location = current_location
    else:
        try:
            if direction == 'up' and current_location.up:
                new_location = MapLocation.objects.get(location_id=current_location.up)
            elif direction == 'down' and current_location.down:
                new_location = MapLocation.objects.get(location_id=current_location.down)
            elif direction == 'left' and current_location.left:
                new_location = MapLocation.objects.get(location_id=current_location.left)
            elif direction == 'right' and current_location.right:
                new_location = MapLocation.objects.get(location_id=current_location.right)
            else:
                return JsonResponse({'error': 'Nothing in that direction but the solar winds.'})
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'Invalid move'})

    # check if new zone is a dangerous zone
    danger_check = new_location.level - player_position.level > 2

    warning = None
    game_over_check = False

    if danger_check and not DEBUG_DISABLE_DANGER_CHECK:
        if new_location.level != current_location.level:
            player_position.danger_zone_steps = 0

        player_position.danger_zone_steps += 1

        if player_position.danger_zone_steps >= 6:
            game_over_check = True
            warning = '... you should have heeded the warning signs!'
        else:
            warning = get_danger_warning(new_location.sub_zone, player_position.danger_zone_steps - 1)
    else:
        player_position.danger_zone_steps = 0

    if direction != 'initial':
        player_position.current_location = new_location
        player_position.add_xp(10)
        player_position.save()

    # Update discovered locations
    discovered_locations = player_position.discovered_locations or {}
    for dx in range(-1, 2):
        for dy in range(-1, 2):
            x = new_location.x + dx
            y = new_location.y + dy
            location_key = f"{x}_{y}"
            if location_key not in discovered_locations:
                location = MapLocation.objects.filter(x=x, y=y).first()
                if location:
                    discovered_locations[location_key] = {
                        'zone': location.zone,
                        'sub_zone': location.sub_zone
                    }

    player_position.discovered_locations = discovered_locations
    player_position.save()

    data = {
        'zone': new_location.zone,
        'sub_zone': new_location.sub_zone,
        'description': new_location.description,
        'level': new_location.level,
        'monsters': new_location.monsters,
        'location_monster': {
            'type': new_location.location_monster['type'] if new_location.location_monster else None,
            'level': new_location.location_monster['level'] if new_location.location_monster else None
        } if new_location.location_monster else None,
        'dungeon': new_location.dungeon,
        'discovered_locations': discovered_locations,
        'current_coords': [new_location.x, new_location.y],
        'neighbors': {
            'up': bool(new_location.up),
            'down': bool(new_location.down),
            'left': bool(new_location.left),
            'right': bool(new_location.right)
        },
        'character': {
            'level': player_position.level,
            'xp': player_position.xp,
            'xp_to_next_level': player_position.xp_to_next_level(),
            'strength': player_position.strength,
            'dexterity': player_position.dexterity,
            'intelligence': player_position.intelligence,
        },
        'warning': warning,
        'game_over': game_over_check
    }

    return JsonResponse(data)


@login_required
@require_POST
def attack_monster(request):
    user = request.user
    player = CharacterDetails.objects.get(user=user)
    current_location = player.current_location
    monster = current_location.location_monster

    if not monster:
        return JsonResponse({'error': 'No monster to attack'})

    qte_result = request.POST.get('qte_result')
    if qte_result == 'success':
        xp_gained = calculate_xp_gain(player.level, monster['level'])
        player.add_xp(xp_gained)
        player.save()
        return JsonResponse({
            'success': True,
            'xp_gained': xp_gained,
            'character': {
                'level': player.level,
                'xp': player.xp,
                'xp_to_next_level': player.xp_to_next_level(),
                'strength': player.strength,
                'dexterity': player.dexterity,
                'intelligence': player.intelligence
            }
        })
    else:
        start_location = MapLocation.objects.filter(zone="Red Desert", sub_zone=SAFE_STARTING_ZONE).first()
        if not start_location:
            start_location = MapLocation.objects.first()
        player.current_location = start_location
        player.danger_zone_steps = 0
        player.save()
        return JsonResponse({'success': False, 'game_over': True})


def calculate_xp_gain(player_level, monster_level):
    xp_to_next_level = player_level * 100

    if player_level <= 20:
        base_percent = 5
        divisor = 5
    elif player_level <= 40:
        base_percent = 4
        divisor = 10
    elif player_level <= 60:
        base_percent = 3
        divisor = 15
    elif player_level <= 80:
        base_percent = 2
        divisor = 20
    else:
        base_percent = 1
        divisor = 25

    xp_gain = (base_percent / 100 * xp_to_next_level) + (xp_to_next_level / divisor)

    level_difference = player_level - monster_level

    if level_difference > 0:
        penalty_percent = min(level_difference * 10, 90)
        xp_gain *= (1 - penalty_percent / 100)
    elif level_difference < 0:
        xp_gain *= (1 + (abs(level_difference) * 0.1))

    return int(max(1, xp_gain))
