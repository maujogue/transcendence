from django.db import models
from django.utils import timezone
import uuid
from users.models import CustomUser

# Create your models here.
class Match(models.Model):
    lobby_id = models.CharField(max_length=100, editable=False, blank=False, default="default", unique=False)
    player1 = models.IntegerField(default=None, null=True)
    player2 = models.IntegerField(default=None, null=True)
    player1_average_exchange = models.IntegerField(default=0)
    player2_average_exchange = models.IntegerField(default=0)
    winner = models.IntegerField(default=None, null=True)
    loser = models.IntegerField(default=None, null=True)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.player1} vs {self.player2}: {self.winner} wins!"