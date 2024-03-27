from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
from tournaments.models import Tournament
from django.test import Client
import json


class TournamentModeTest(TestCase):
	@classmethod
	def setUp(self):
		self.client = Client()
		self.user = CustomUser.objects.create_user(username='testuser',
										 email='testuser@gmail.com',
										 password='Password99+')
		self.tournament = Tournament.objects.create(
			name='Example Tournament',
			max_players=16,
			is_private=False,
			password='secret',
			host=self.user,
		)

	def test_create_right_tournament_private(self):
		self.client.login(username='testuser', password='Password99+')

		data = {
			'name': 'New Tournament',
			'max_players': 8,
			'is_private': True,
			'password': '67890'
		}

		response = self.client.post(
			reverse('create_tournament'),
			data=json.dumps(data),
			content_type='application/json')
		self.assertEqual(response.status_code, 200)