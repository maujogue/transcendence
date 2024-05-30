from django.db import models
from django.conf import settings

from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

from users.models import CustomUser
from multiplayer.models import Lobby

class TournamentMatch(models.Model):
	round = models.fields.CharField(max_length=15)
	player_1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='player1_match')
	player_2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='player2_match', null=True, blank=True)
	winner = models.CharField(max_length=15, null=True, blank=True)
	score_player_1 = models.IntegerField(default=0)
	score_player_2 = models.IntegerField(default=0)
	lobby = models.ForeignKey(Lobby, on_delete=models.CASCADE)
	finished = models.BooleanField(default=False)

	def __str__(self):
		return f"{self.round}: {self.player_1} vs {self.player_2}"

class Tournament(models.Model):
	name = models.fields.CharField(max_length=15, unique=True)
	max_players = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(32)])
	participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_tournaments', blank=True)
	started = models.BooleanField(default=False)
	matchups = models.ManyToManyField(TournamentMatch, blank=True)

	def __str__(self):
		return f'{self.name}'

	def clean(self):
		super().clean()

	def get_matches_by_player(self, player_id):
		return self.matchups.filter(models.Q(player_1_id=player_id) | models.Q(player_2_id=player_id))
	
