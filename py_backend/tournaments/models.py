from django.db import models
from django.conf import settings

from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

from users.models import CustomUser

class Tournament(models.Model):
	name = models.fields.CharField(max_length=100, unique=True)
	max_players = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(32)])
	is_private = models.BooleanField()
	password = models.fields.CharField(max_length=100, blank=True, null=True)
	host = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_tournaments', blank=True)
	score_to_win = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(20)])

	def __str__(self):
		return f'{self.name}'

	def clean(self):
		super().clean()

class Participant(models.Model):
	nickname = models.fields.CharField(max_length=100, unique=True)
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tournament_participation')
	tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='participant_info')
	is_admin = models.BooleanField(default=False)

	def __str__(self):
		return f"{self.nickname} in {self.tournament.name}"

#TODO create a model for the player
"""
-delete 'host' from tournament model
-check for participants because I'm not sure it takes the participant class right now
-change the tests
-to delete a tournament, check if admin instead of if host.
-be sure tournament in participant model is correctly set
-add in all join test the nickname for the tournament
"""
#TODO create a model for the brackets