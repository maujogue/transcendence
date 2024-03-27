from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from users.models import CustomUser

class Tournament(models.Model):
	name = models.fields.CharField(max_length=100)
	max_players = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(32)])
	is_private = models.BooleanField()
	password = models.fields.CharField(max_length=100, blank=True, null=True)
	host = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

	def __str__(self):
		return f'{self.name}'

	def clean(self):
		if self.is_private and not self.password:
			raise ValidationError("A private tournament must have a password.")
		super().clean()

"""
For tournaments, the easier I think is to make all tournaments visible by anyone, but it's written
if it's public or private. If it's private, when you try to join, a password is asked. If it's
public, anyone can join if the maximum number of players isn't reached.
"""