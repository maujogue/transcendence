from django.test import TestCase
from django.urls import reverse
from django.test import Client

from users.models import CustomUser
from tournaments.models import Tournament

import json


class TournamentModeTest(TestCase):
# set-up
	def setUp(self):
		self.client = Client()
		self.user_host = CustomUser.objects.create_user(username='testuser1',
										 email='testuser1@gmail.com',
										 password='Password1+')
		# self.user2 = CustomUser.objects.create_user(username='testuser2',
		# 								 email='testuser2@gmail.com',
		# 								 password='Password2+')
		# self.user3 = CustomUser.objects.create_user(username='testuser3',
		# 								 email='testuser3@gmail.com',
		# 								 password='Password3+')
		# self.user4 = CustomUser.objects.create_user(username='testuser4',
		# 								 email='testuser4@gmail.com',
		# 								 password='Password4+')
		# self.user5 = CustomUser.objects.create_user(username='testuser5',
		# 								 email='testuser5@gmail.com',
		# 								 password='Password5+')

	def create_test_tournament(self, name, max_players, is_private, password):
		data = {
			'name': name,
			'max_players': max_players,
			'is_private': is_private,
			'password': password,
		}
		response = self.client.post(
			reverse('create_tournament'),
			data=json.dumps(data),
			content_type='application/json')
		return response

# tests create a tournament

	def test_create_right_tournament_private(self):
		name = "test1"
		max_players = 5
		is_private = True
		password = "password"
		
		self.client.login(username='testuser1', password='Password1+')
		response = self.create_test_tournament(name, max_players, is_private, password)
		self.assertEqual(response.status_code, 201)
		
		try:
			tournament = Tournament.objects.get(name=name)
			self.assertEqual(tournament.name, name)
			self.assertEqual(tournament.max_players, max_players)
			self.assertEqual(tournament.is_private, is_private)
			self.assertEqual(tournament.password, password)
		except Tournament.DoesNotExist:
			self.fail("Tournament was not created")

	def test_create_right_tournament_public(self):
		name = "test2"
		max_players = 5
		is_private = False
		password = ""
		
		self.client.login(username='testuser1', password='Password1+')
		response = self.create_test_tournament(name, max_players, is_private, password)
		self.assertEqual(response.status_code, 201)
		
		try:
			tournament = Tournament.objects.get(name=name)
			self.assertEqual(tournament.name, name)
			self.assertEqual(tournament.max_players, max_players)
			self.assertEqual(tournament.is_private, is_private)
			self.assertIsNone(tournament.password)
		except Tournament.DoesNotExist:
			self.fail("Tournament was not created")

	def test_player_max(self):
		name = "test3"
		max_players = 33
		is_private = False
		password = ""
		
		self.client.login(username='testuser1', password='Password1+')
		response = self.create_test_tournament(name, max_players, is_private, password)
		self.assertEqual(response.status_code, 400)

	def test_player_min(self):
		name = "test4"
		max_players = 1
		is_private = False
		password = ""
		
		self.client.login(username='testuser1', password='Password1+')
		response = self.create_test_tournament(name, max_players, is_private, password)
		self.assertEqual(response.status_code, 400)

	def test_private_no_password(self):
		name = "test5"
		max_players = 8
		is_private = True
		password = ""
		
		self.client.login(username='testuser1', password='Password1+')
		response = self.create_test_tournament(name, max_players, is_private, password)
		self.assertEqual(response.status_code, 400)

	def test_no_name(self):
		name = ""
		max_players = 8
		is_private = True
		password = "password"
		
		self.client.login(username='testuser1', password='Password1+')
		response = self.create_test_tournament(name, max_players, is_private, password)
		self.assertEqual(response.status_code, 400)

	def test_invalid_data_format(self):
		name = "Hi there"
		max_players = "5"
		is_private = True
		password = "password"
		
		self.client.login(username='testuser1', password='Password1+')
		response = self.create_test_tournament(name, max_players, is_private, password)
		self.assertEqual(response.status_code, 400)

	def test_response_content_no_password(self):
		name = "Hi theree"
		max_players = 8
		is_private = True
		password = ""
		
		self.client.login(username='testuser1', password='Password1+')
		response = self.create_test_tournament(name, max_players, is_private, password)
		response_data = json.loads(response.content)
		self.assertIn('errors', response_data)
		self.assertEqual("A private tournament must have a password.", response_data['errors'])

	def test_no_login(self):
		name = "Hi there"
		max_players = 8
		is_private = True
		password = "password"
		
		response = self.create_test_tournament(name, max_players, is_private, password)
		self.assertEqual(response.status_code, 302)

# tests join a tournament
		
