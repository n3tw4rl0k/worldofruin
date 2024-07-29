from django.urls import path
from . import views

urlpatterns = [
    path('intro/', views.game_intro, name='game_intro'),
    path('choose-class/', views.choose_class, name='choose_class'),
    path('game/', views.game_main, name='game_main'),
    path('game/move/', views.move, name='move'),
    path('game/over/', views.game_over, name='game_over'),
    path('game/attack/', views.attack_monster, name='attack_monster'),
]
