import random
from collections import deque

from main.game_data import MONSTER_MULTIPLIERS


def generate_map(zones, monsters):
    map_grid = {}
    location_details = {}
    queue = deque(sorted([(zone_name, sub_zone) for zone_name, zone_info in zones.items()
                          for sub_zone in zone_info['sub_zones']],
                         key=lambda x: x[1]['level_required']))

    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    direction_names = ['up', 'right', 'down', 'left']

    def get_neighbors(x, y):
        return [(x + dx, y + dy) for dx, dy in directions]

    def can_place(x, y, current_level):
        neighbors = get_neighbors(x, y)
        for nx, ny in neighbors:
            if (nx, ny) in map_grid:
                neighbor_zone, neighbor_sub_zone = map_grid[(nx, ny)]['zone_info']
                neighbor_level = next(sz['level_required'] for sz in zones[neighbor_zone]['sub_zones'] if
                                      sz['sub_zone_name'] == neighbor_sub_zone)
                if abs(neighbor_level - current_level) > 30:
                    return False
        return True

    def generate_monster(monster_type, zone_level):
        monster_level = random.randint(zone_level, min(zone_level + 9, 100))
        multipliers = MONSTER_MULTIPLIERS.get(monster_type, {'hp': 1, 'str': 1, 'dex': 1, 'int': 1})

        base_str = monster_level * multipliers['str']
        base_dex = monster_level * multipliers['dex']
        base_int = monster_level * multipliers['int']

        main_stat = max(base_str, base_dex, base_int)

        if main_stat == base_str:
            str_value = monster_level
            dex_value = max(1, monster_level - 5)
            int_value = max(1, monster_level - 5)
        elif main_stat == base_dex:
            str_value = max(1, monster_level - 5)
            dex_value = monster_level
            int_value = max(1, monster_level - 5)
        else:
            str_value = max(1, monster_level - 5)
            dex_value = max(1, monster_level - 5)
            int_value = monster_level

        hp = int((monster_level + str_value + (dex_value // 2) + (int_value // 2)) * multipliers['hp'])

        return {
            'type': monster_type,
            'level': monster_level,
            'hp': hp,
            'str': str_value,
            'dex': dex_value,
            'int': int_value
        }

    while queue:
        zone_name, sub_zone = queue.popleft()
        level = sub_zone['level_required']
        size = random.randint(10, 30)

        if not map_grid:
            start_x, start_y = 0, 0
        else:
            placed = False
            for _ in range(100):
                existing_cell = random.choice(list(map_grid.keys()))
                for dx, dy in directions:
                    new_x, new_y = existing_cell[0] + dx, existing_cell[1] + dy
                    if (new_x, new_y) not in map_grid and can_place(new_x, new_y, level):
                        start_x, start_y = new_x, new_y
                        placed = True
                        break
                if placed:
                    break
            if not placed:
                continue

        cells = [(start_x, start_y)]
        subzone_locations = []

        for _ in range(size):
            if not cells:
                break
            x, y = random.choice(cells)
            neighbors = get_neighbors(x, y)
            random.shuffle(neighbors)
            for nx, ny in neighbors:
                if (nx, ny) not in map_grid and can_place(nx, ny, level):
                    location_id = f"{zone_name.replace(' ', '')}_{sub_zone['sub_zone_name'].replace(' ', '')}_{nx}_{ny}"
                    monster_type = random.choice(monsters.get(sub_zone['sub_zone_name'], ['Unknown Monster']))
                    location_monster = generate_monster(monster_type, level)
                    map_grid[(nx, ny)] = {
                        'zone_info': (zone_name, sub_zone['sub_zone_name']),
                        'location_id': location_id
                    }
                    location_details[location_id] = {
                        'zone': zone_name,
                        'sub_zone': sub_zone['sub_zone_name'],
                        'level': level,
                        'description': sub_zone['description'],
                        'dungeon': None,
                        'monsters': monsters.get(sub_zone['sub_zone_name'], []),
                        'location_monster': location_monster,
                        'coords': [nx, ny],
                        'neighbors': {'up': '', 'right': '', 'down': '', 'left': ''}
                    }
                    subzone_locations.append(location_id)
                    cells.append((nx, ny))
                    break

        if sub_zone.get('dungeon') and subzone_locations:
            dungeon_location = random.choice(subzone_locations)
            location_details[dungeon_location]['dungeon'] = sub_zone['dungeon']

    # Update neighbors
    for key, value in map_grid.items():
        x, y = key
        location_id = value['location_id']
        neighbors = get_neighbors(x, y)
        for direction, (nx, ny) in zip(direction_names, neighbors):
            neighbor_key = (nx, ny)
            if neighbor_key in map_grid:
                neighbor_id = map_grid[neighbor_key]['location_id']
                location_details[location_id]['neighbors'][direction] = neighbor_id

    return map_grid, location_details

def print_map(map_grid, full_names=False):
    # Gather all coordinates
    all_x = [x for x, y in map_grid.keys()]
    all_y = [y for x, y in map_grid.keys()]
    min_x, max_x = min(all_x), max(all_x)
    min_y, max_y = min(all_y), max(all_y)

    # Create a grid representation
    grid = [[' ' for _ in range(min_y, max_y + 1)] for _ in range(min_x, max_x + 1)]

    for (x, y), info in map_grid.items():
        zone_name, sub_zone_name = info['zone_info']
        if full_names:
            grid[x - min_x][y - min_y] = f"{zone_name}_{sub_zone_name}"
        else:
            acronym = ''.join([word[0] for word in (zone_name + ' ' + sub_zone_name).split()])
            grid[x - min_x][y - min_y] = acronym

    # Print the grid
    for row in grid:
        print(' '.join(row))

#
# map_grid, location_details = generate_map(zones, monsters)
#
# print("Complete map:")
# print_map(map_grid, full_names=True)
#
# print("\n" + "="*50 + "\n")  # Separator
#
# print("Map with initials:")
# print_map(map_grid, full_names=False)
#
# print("\n" + "="*50 + "\n")  # Separator
#
# print("Details of all locations:")
# print(location_details)
# print(map_grid)
