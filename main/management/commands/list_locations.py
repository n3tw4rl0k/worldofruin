from django.core.management.base import BaseCommand
from main.models import MapLocation

class Command(BaseCommand):
    help = 'List all map locations'

    def handle(self, *args, **kwargs):
        locations = MapLocation.objects.all()
        if not locations:
            self.stdout.write(self.style.WARNING('No locations found'))
        for location in locations:
            self.stdout.write(f'{location.location_id} - ({location.x}, {location.y}) - Zone: {location.zone}, Sub-zone: {location.sub_zone}, Details: {location.details}')
