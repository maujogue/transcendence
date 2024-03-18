from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

class Tournament(models.Model):
	
	name = models.fields.CharField(max_length=100)
	# host = models.ForeignKey(CustomUser, null=True, on_delete=models.SET_NULL)
	n_players = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(32)])
	start_date = models.DateTimeField()
	end_date = models.DateTimeField()

	def __str__(self):
		return f'{self.name}'