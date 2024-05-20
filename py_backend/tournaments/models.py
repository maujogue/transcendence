from django.db import models
from django.conf import settings

from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

from users.models import CustomUser

class Tournament(models.Model):
	name = models.fields.CharField(max_length=15, unique=True)
	max_players = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(32)])
	participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_tournaments', blank=True)
	started = models.BooleanField()

	def __str__(self):
		return f'{self.name}'

	def clean(self):
		super().clean()
#TODO finish add started status, check if str and clean is useful