from django.db import models
from accounts.models import WorldOfRuinUser
from django.core.validators import MinValueValidator


class MapLocation(models.Model):
    location_id = models.CharField(max_length=100, primary_key=True)
    x = models.IntegerField()
    y = models.IntegerField()
    zone = models.CharField(max_length=100)
    sub_zone = models.CharField(max_length=100)
    description = models.TextField()
    level = models.IntegerField()
    monsters = models.JSONField()
    dungeon = models.JSONField(null=True, blank=True)
    up = models.CharField(max_length=100, blank=True, default="")
    down = models.CharField(max_length=100, blank=True, default="")
    left = models.CharField(max_length=100, blank=True, default="")
    right = models.CharField(max_length=100, blank=True, default="")
    location_monster = models.JSONField(null=True, blank=True)


class CharacterDetails(models.Model):
    CLASS_CHOICES = [
        ('ROGUE', 'Rogue'),
        ('WARRIOR', 'Warrior'),
        ('MAGE', 'Mage'),
    ]

    user = models.OneToOneField(WorldOfRuinUser, on_delete=models.CASCADE)
    current_location = models.ForeignKey(MapLocation, on_delete=models.CASCADE)
    discovered_locations = models.JSONField(default=dict, blank=True)
    level = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    xp = models.PositiveIntegerField(default=0)
    character_class = models.CharField(max_length=10, choices=CLASS_CHOICES, null=True, blank=True)
    strength = models.PositiveIntegerField(default=0)
    dexterity = models.PositiveIntegerField(default=0)
    intelligence = models.PositiveIntegerField(default=0)
    hit_points_total = models.PositiveIntegerField(default=0)
    hit_points_remaining = models.PositiveIntegerField(default=0)
    danger_zone_steps = models.PositiveIntegerField(default=0)

    def add_xp(self, amount):
        self.xp += amount
        while self.xp >= self.xp_to_next_level():
            self.level_up()

    def xp_to_next_level(self):
        return self.level * 100

    def level_up(self):
        self.xp -= self.xp_to_next_level()
        self.level += 1
        self.calculate_total_hp()
        self.save()

    def calculate_total_hp(self):
        self.hit_points_total = self.strength * 2 + (self.dexterity // 2) + (self.intelligence // 3)
        self.save()
        return self.hit_points_total

    def set_class_stats(self):
        if self.character_class == 'ROGUE':
            self.strength = 8
            self.dexterity = 15
            self.intelligence = 7
        elif self.character_class == 'WARRIOR':
            self.strength = 15
            self.dexterity = 10
            self.intelligence = 5
        elif self.character_class == 'MAGE':
            self.strength = 5
            self.dexterity = 9
            self.intelligence = 16
        self.calculate_total_hp()
        self.save()
