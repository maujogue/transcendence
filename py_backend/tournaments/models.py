from django.db import models
from django.conf import settings
import uuid

from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

from users.models import CustomUser
from multiplayer.models import Lobby

class TournamentMatch(models.Model):
	lobby_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	round = models.fields.CharField(max_length=15)
	player1 = models.CharField(max_length=100, default='')
	player2 = models.CharField(max_length=100, default='')
	winner = models.CharField(max_length=15, null=True, blank=True)
	score_player_1 = models.IntegerField(default=0)
	score_player_2 = models.IntegerField(default=0)
	finished = models.BooleanField(default=False)

	def __str__(self):
		return f"{self.round}: {self.player1} vs {self.player2}: {self.winner} wins!"

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

	def get_matches_by_player(self, username):
		return self.matchups.filter(models.Q(player1=username) | models.Q(player2=username))
	
	def get_disqualified_players(self):
		disqualified_players = []
		for match in self.matchups.all().filter(finished=True):
			disqualified_player = match.player1 if match.player1.tournament_username != match.winner else match.player2.tournament_username
			disqualified_players.append(disqualified_player)
		return disqualified_players
	
	def check_if_player_is_disqualified(self, username):
		disqualified_players = self.get_disqualified_players()
		return username in disqualified_players
	
	def get_player_tournament_username(self, username):
		try:
			return CustomUser.objects.get(username=username).tournament_username
		except CustomUser.DoesNotExist:
			return username
		
	def get_tournament_bracket(self):
		rounds = self.matchups.values_list('round', flat=True).distinct()
		bracket = {
			"tournament": {
				"name": self.name,
				"rounds": []
			}
		}

		for round_name in rounds:
			matches = self.matchups.filter(round=round_name)
			round_info = {
				"name": round_name,
				"matches": []
			}

			for match in matches:
				player1 = self.get_player_tournament_username(match.player1)
				player2 = self.get_player_tournament_username(match.player2) if match.player2 else None
				winner = self.get_player_tournament_username(match.winner) if match.winner else None
				match_info = {
					"match_id": str(match.lobby_id),
					"player1": player1,
					"player2": player2 if match.player2 else None,
					"winner": winner,
					"player1_score": match.score_player_1,
					"player2_score": match.score_player_2
				}
				round_info["matches"].append(match_info)
			
			bracket["tournament"]["rounds"].append(round_info)
			return bracket
	
