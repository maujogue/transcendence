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

	def __str__(self):
		return f'{self.name}'

	def clean(self):
		super().clean()

#TODO add the number of points to win a match in the tournament model
#TODO create a model for the player
#TODO create a model for the brackets