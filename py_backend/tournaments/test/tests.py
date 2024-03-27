from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from models import Tournament


class TournamentModeTest(TestCase):
	@classmethod
	def setUp(cls):
		cls.user = User.objects.create(username='testuser', password='12345')
		cls.tournament = Tournament.objects.create(
			name='Example Tournament',
			max_players=16,
			is_private=False,
			password='secret',
			host=cls.user,
		)

	def test_create_right_tournament_private(self):
		self.client.login(username='testuser', password='12345')

		data = {
			'name': 'New Tournament',
			'max_players': 8,
			'is_private': True,
			'password': '67890'
		}

		response = self.client.post(reverse('create_tournament'), data)
		self.assertEqual(response.status_code, 200)