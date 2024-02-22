from django.contrib import admin
from users.models import CustomUser, Tournament, Leaderboard

admin.site.register(CustomUser)
admin.site.register(Tournament)
admin.site.register(Leaderboard)