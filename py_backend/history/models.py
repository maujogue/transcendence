from django.db import models

# Create your models here.
class Match(models.Model):
    player1 = models.CharField(max_length=100, default='')
    player2 = models.CharField(max_length=100, default='')
    winner = models.CharField(max_length=100, default='')
    loser = models.CharField(max_length=100, default='')
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)