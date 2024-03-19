from django.test import TestCase
from django.contrib.auth.models import User
from .models import Tournament


class TournamentModeTest(TestCase):
	@classmethod
	def setUp(cls):
		cls.user = User.objects.create(username='testuser', password='12345')
		cls.tournament = Tournament.objects.create(
			name='Example Tournament',
			max_players=16,
			is_public=False,
			password='secret',
			host=cls.user,
		)