from django.test import TestCase
from django.urls import reverse
from django.http import JsonResponse
from users.models import CustomUser
from friends.models import FriendRequest
from django.test import Client
import json
from django.contrib.auth import get_user_model


class FriendsInteractions(TestCase):
	def setUp(self):
		self.user1 = CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Damiendubocal75")
		self.user2 = CustomUser.objects.create_user(
            username="osterga",
            email="osterga@gmail.com",
            password="Damiendubocal75")
		self.user3 = CustomUser.objects.create_user(
			username="oxford-mate",
			email="oxford@gmail.com",
			password="Damiendubocal75")
		
		user1 = {
			'username': 'lboulatr',
			'password': 'Damiendubocal75'
		}

		self.client.post(
		    reverse('login'), 
		    data=json.dumps(user1), 
		    content_type='application/json')
		
		response_request = self.client.post(
			reverse('send_request',
			args=[self.user2.id]),
			follow=True)
		friend_request_id = response_request.json()['id']

		self.client.post(
			reverse('accept_friend',
			args=[friend_request_id]),
			follow=True)


	def test_check_if_login(self):
		self.assertTrue('_auth_user_id' in self.client.session)
		self.assertEqual(int(self.client.session['_auth_user_id']), self.user1.id)


	def test_check_if_user1_and_user2_are_friends(self):
		self.assertEqual(self.user1.friends.count(), 1)
		self.assertEqual(self.user2.friends.count(), 1)

		user_friendslist = self.user1.friends.all()
		self.assertIn(self.user2, user_friendslist)

	def test_send_request_success(self):

		response_request = self.client.post(
			reverse('send_request',
			args=[self.user3.id]),
			follow=True)
		self.assertEqual(response_request.status_code, 200)


	def test_send_request_bad_id(self):
		id = 0

		response_request = self.client.post(
			reverse('send_request',
			args=[id]),
			follow=True)
		
		self.assertEqual(response_request.status_code, 404)
		

	def test_friend_request_success(self):
		self.assertEqual(self.user1.friends.count(), 1)
		self.assertEqual(self.user3.friends.count(), 0)

		response_request = self.client.post(
			reverse('send_request',
			args=[self.user3.id]),
			follow=True)
		
		friend_request_id = response_request.json()['id']
		self.assertEqual(response_request.status_code, 200)

		response_accept = self.client.post(
		    reverse('accept_friend',
			args=[friend_request_id]),
			follow=True)

		self.assertEqual(response_accept.status_code, 200)
		self.assertEqual(self.user1.friends.count(), 2)
		self.assertEqual(self.user3.friends.count(), 1)


	def test_users_already_friends(self):

		response_request = self.client.post(
			reverse('send_request',
			args=[self.user2.id]),
			follow=True)
		
		friend_request_id = response_request.json()['id']
		self.assertEqual(response_request.status_code, 200)

		response_accept = self.client.post(
		    reverse('accept_friend',
			args=[friend_request_id]),
			follow=True)

		self.assertEqual(response_accept.status_code, 400)
		response_data = response_accept.json()
		self.assertEqual(response_data.get('status'), 'Users are already friends')


	def test_remove_friend(self):
		self.assertEqual(self.user1.friends.count(), 1)
		self.assertEqual(self.user2.friends.count(), 1)

		response_request = self.client.post(
			reverse('send_request',
			args=[self.user2.id]),
			follow=True)
		
		remove_request_id = response_request.json()['id']
		self.assertEqual(response_request.status_code, 200)

		response_remove = self.client.post(
		    reverse('remove_friend',
			args=[remove_request_id]),
			follow=True)

		self.assertEqual(response_remove.status_code, 200)
		self.assertEqual(self.user1.friends.count(), 0)
		self.assertEqual(self.user2.friends.count(), 0)


	def test_remove_friend_but_users_not_friends(self):
		self.assertEqual(self.user1.friends.count(), 1)
		self.assertEqual(self.user3.friends.count(), 0)

		response_request = self.client.post(
			reverse('send_request',
			args=[self.user3.id]),
			follow=True)
		
		remove_request_id = response_request.json()['id']
		self.assertEqual(response_request.status_code, 200)

		response_remove = self.client.post(
		    reverse('remove_friend',
			args=[remove_request_id]),
			follow=True)

		self.assertEqual(response_remove.status_code, 400)
		response_data = response_remove.json()
		self.assertEqual(response_data.get('status'), 'Users are not friends')
		self.assertEqual(self.user1.friends.count(), 1)
		self.assertEqual(self.user3.friends.count(), 0)
	
	def test_multiple_friends_requests(self):
		self.user4 = CustomUser.objects.create_user(
			username="ochoa",
			email="ocha@gmail.com",
			password="Damiendubocal75")
		self.user5 = CustomUser.objects.create_user(
			username="banger-tweet",
			email="banger-tweet@gmail.com",
			password="Damiendubocal75")

		self.assertEqual(self.user1.friends.count(), 1)

		response_request_4 = self.client.post(
			reverse('send_request',
			args=[self.user4.id]),
			follow=True)
	
		response_request_5 = self.client.post(
			reverse('send_request',
			args=[self.user5.id]),
			follow=True)
		
		friend_request_id_4 = response_request_4.json()['id']
		response_accept_4 = self.client.post(
		    reverse('accept_friend',
			args=[friend_request_id_4]),
			follow=True)
		
		friend_request_id_5 = response_request_5.json()['id']
		response_accept_5 = self.client.post(
		    reverse('accept_friend',
			args=[friend_request_id_5]),
			follow=True)

		self.assertEqual(response_accept_4.status_code, 200)
		self.assertEqual(response_accept_5.status_code, 200)
		self.assertEqual(self.user1.friends.count(), 3)

		response = self.client.post(
		    reverse('friendslist'),
		    content_type='application/json')
		data = response.json()
		friendslist = data['friends']
		print(self.user1.id)
		print(friendslist)

	# def test_get_friendslist(self):
	# 	response = self.client.post(
	# 	    reverse('friendslist'),
	# 	    content_type='application/json')
	# 	data = response.json()
	# 	friendslist = data['friends']
	# 	print(friendslist)

