from django.contrib.auth.models import AbstractUser
from django.db import models

class WorldOfRuinUser(AbstractUser):
    view_intro = models.BooleanField(default=True)
    current_x = models.IntegerField(default=0)
    current_y = models.IntegerField(default=0)
