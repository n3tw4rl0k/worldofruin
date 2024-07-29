from run_command import setup_django
setup_django()

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from main.models import CharacterDetails, MapLocation

class Command(BaseCommand):
    help = 'Create or reset a default test user, this can be used during development'

    @transaction.atomic
    def create_test_user(self, username='', password='', email='test@localhost.local'):
        user_obj = get_user_model()
        try:
            user, created = user_obj.objects.get_or_create(username=username)
            user.set_password(password)
            user.email = email
            user.view_intro = True
            user.save()

            # Delete existing CharacterDetails if any
            CharacterDetails.objects.filter(user=user).delete()

            # Create new CharacterDetails
            start_location = MapLocation.objects.filter(zone="Red Desert", level=1).first()
            if not start_location:
                start_location = MapLocation.objects.first()

            CharacterDetails.objects.create(
                user=user,
                current_location=start_location,
                level=1,
                xp=0,
                character_class=None,
                strength=0,
                dexterity=0,
                intelligence=0,
                hit_points_total=0,
                hit_points_remaining=0,
                danger_zone_steps=0
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"User '{username}' created and initialized."))
            else:
                self.stdout.write(self.style.SUCCESS(f"User '{username}' reset and reinitialized."))
            return user
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating/resetting user: {e}"))
            return None

    def handle(self, *args, **options):
        hc_username = 'test'
        hc_password = '123'
        user = self.create_test_user(username=hc_username, password=hc_password)
        if user:
            self.stdout.write(self.style.SUCCESS("You can now authenticate with:"))
            self.stdout.write(self.style.SUCCESS(f"Username: {hc_username}"))
            self.stdout.write(self.style.SUCCESS(f"Password: {hc_password}"))


if __name__ == "__main__":
    command = Command()
    command.handle()
