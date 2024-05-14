from django.contrib import admin
from .models import Tournament
from multiplayer.models import Lobby
from stats.models import Match

# Register your models here.
admin.site.register(Tournament)
admin.site.register(Match)
admin.site.register(Lobby)