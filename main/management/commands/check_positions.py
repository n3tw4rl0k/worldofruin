from run_command import setup_django
setup_django()

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from main.models import CharacterDetails, MapLocation

User = get_user_model()

class Command(BaseCommand):
    help = 'Check and create PlayerPosition for users without one'

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        for user in users:
            if not CharacterDetails.objects.filter(user=user).exists():
                starting_location = MapLocation.objects.first()
                if starting_location:
                    CharacterDetails.objects.create(user=user, current_location=starting_location)
                    self.stdout.write(self.style.SUCCESS(f'Created PlayerPosition for user: {user.username}'))
                else:
                    self.stdout.write(self.style.ERROR(f'No starting location found for user: {user.username}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'PlayerPosition already exists for user: {user.username}'))


if __name__ == "__main__":
    command = Command()
    command.handle()
