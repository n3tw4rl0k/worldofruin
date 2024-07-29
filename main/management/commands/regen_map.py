from run_command import setup_django
setup_django()

from django.core.management.base import BaseCommand
from main.models import MapLocation
from main.map_generator import generate_map
from main.game_data import ZONES, MONSTERS


class Command(BaseCommand):
    help = 'Regenerates the game map'

    def handle(self, *args, **options):
        self.stdout.write('Deleting existing locations...')
        MapLocation.objects.all().delete()

        self.stdout.write('Generating new map...')
        map_grid, location_details = generate_map(ZONES, MONSTERS)

        self.stdout.write('Creating new locations...')
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

        self.stdout.write(self.style.SUCCESS('Map regenerated successfully!'))


if __name__ == "__main__":
    command = Command()
    command.handle()
