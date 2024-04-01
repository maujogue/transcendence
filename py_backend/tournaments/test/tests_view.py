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
		self.user2 = CustomUser.objects.create_user(username='testuser2',
										 email='testuser2@gmail.com',
										 password='Password2+')
		self.user3 = CustomUser.objects.create_user(username='testuser3',
										 email='testuser3@gmail.com',
										 password='Password3+')
		self.user4 = CustomUser.objects.create_user(username='testuser4',
										 email='testuser4@gmail.com',
										 password='Password4+')
		self.user5 = CustomUser.objects.create_user(username='testuser5',
										 email='testuser5@gmail.com',
										 password='Password5+')

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

	def find_tournament_id(self, tournament):
		if tournament.status_code == 201:
			tournament_data = json.loads(tournament.content)
		return tournament_data.get('id')

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
		
# join public with host working fine
	def test_join_with_host(self):
		self.client.login(username='testuser1', password='Password1+')

		name = "Hi there"
		max_players = 8
		is_private = False
		password = ""
		
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

# join public with other account working fine
	def test_join_with_other(self):
		self.client.login(username='testuser1', password='Password1+')

		name = "Hi there"
		max_players = 8
		is_private = False
		password = ""
		
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)

		self.client.login(username='testuser2', password='Password2+')

		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

# join multiple player
	def test_multiplie_join_working(self):

		name = "Hi there"
		max_players = 3
		is_private = False
		password = ""

		self.client.login(username='testuser1', password='Password1+')
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

		self.client.logout()
		self.client.login(username='testuser2', password='Password2+')
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

		self.client.logout()
		self.client.login(username='testuser3', password='Password3+')
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)


# join a tournament already full
	def test_already_full_tournament(self):

		name = "Hi there"
		max_players = 4
		is_private = False
		password = ""

		self.client.login(username='testuser1', password='Password1+')
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

		self.client.logout()
		self.client.login(username='testuser2', password='Password2+')
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

		self.client.logout()
		self.client.login(username='testuser3', password='Password3+')
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

		self.client.login(username='testuser4', password='Password4+')
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

		self.client.login(username='testuser5', password='Password5+')
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 400)

# join a tournament already joined
	def test_already_joined(self):

		name = "Hi there"
		max_players = 4
		is_private = False
		password = ""

		self.client.login(username='testuser1', password='Password1+')
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

		self.client.logout()
		self.client.login(username='testuser2', password='Password2+')
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 200)

		self.client.logout()
		self.client.login(username='testuser1', password='Password1+')
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 400)

# join without authentification
	def test_join_not_login(self):

		name = "Hi there"
		max_players = 4
		is_private = False
		password = ""

		self.client.login(username='testuser1', password='Password1+')
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)
		self.client.logout()
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 302)

# join multiple tournaments
	def test_join_multiple_tournaments(self):

		name = "First tournament"
		max_players = 4
		is_private = False
		password = ""

		self.client.login(username='testuser1', password='Password1+')

		tournament1 = self.create_test_tournament(name, max_players, is_private, password)
		id1 = self.find_tournament_id(tournament1)
		response = self.client.post(reverse("join_tournament", args=[id1]))
		self.assertEqual(response.status_code, 200)

		name = "Second tournament"
		max_players = 5
		is_private = False
		password = ""

		tournament2 = self.create_test_tournament(name, max_players, is_private, password)
		id2 = self.find_tournament_id(tournament2)
		response = self.client.post(reverse("join_tournament", args=[id2]))
		self.assertEqual(response.status_code, 200)

		name = "Third tournament"
		max_players = 7
		is_private = False
		password = ""

		tournament3 = self.create_test_tournament(name, max_players, is_private, password)
		id3 = self.find_tournament_id(tournament3)
		response = self.client.post(reverse("join_tournament", args=[id3]))
		self.assertEqual(response.status_code, 200)

# join private with right password
	def test_join_private_right_password(self):
		self.client.login(username='testuser1', password='Password1+')

		name = "Hi there"
		max_players = 8
		is_private = True
		password = "Salade1+"
		
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)
		response = self.client.post(reverse("join_tournament", args=[id]), {'password': 'Salade1+'}, content_type='application/json')
		self.assertEqual(response.status_code, 200)

# join private with wrong password
	def test_join_private_wrong_password(self):
		self.client.login(username='testuser1', password='Password1+')

		name = "Hi there"
		max_players = 8
		is_private = True
		password = "Salade1+"
		
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)
		response = self.client.post(reverse("join_tournament", args=[id]), {'password': 'Burger1+'}, content_type='application/json')
		self.assertEqual(response.status_code, 403)

# join private without password
	def test_join_private_without_password(self):
		self.client.login(username='testuser1', password='Password1+')

		name = "Hi there"
		max_players = 8
		is_private = True
		password = "Salade1+"
		
		tournament = self.create_test_tournament(name, max_players, is_private, password)
		id = self.find_tournament_id(tournament)
		response = self.client.post(reverse("join_tournament", args=[id]), {'password': None}, content_type='application/json')
		self.assertEqual(response.status_code, 403)

# join non existant tournament
	def test_join_non_existant_tournament(self):
		self.client.login(username='testuser1', password='Password1+')
		
		id = 999
		response = self.client.post(reverse("join_tournament", args=[id]))
		self.assertEqual(response.status_code, 404)