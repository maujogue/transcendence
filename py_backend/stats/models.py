from django.db import models
from django.utils import timezone
import uuid
from users.models import CustomUser

# Create your models here.
class Match(models.Model):
    lobby_id = models.CharField(max_length=100, editable=False, blank=False, default="default", unique=False)
    player1 = models.ForeignKey(CustomUser, related_name='player1',on_delete=models.SET_DEFAULT, default=None)
    player2 = models.ForeignKey(CustomUser, related_name='player2',on_delete=models.SET_DEFAULT, default=None)
    player1_average_exchange = models.IntegerField(default=0)
    player2_average_exchange = models.IntegerField(default=0)
    winner = models.ForeignKey(CustomUser, related_name='winner',on_delete=models.SET_DEFAULT, default=None)
    loser = models.ForeignKey(CustomUser, related_name='loser',on_delete=models.SET_DEFAULT, default=None)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.player1} vs {self.player2}: {self.winner} wins!"