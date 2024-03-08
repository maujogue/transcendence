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
		
	def test_nbr(self):
		self.assertEqual(CustomUser.objects.count(), 2)


	def test_basic_login(self):
		user = {
			'username': 'lboulatr',
			'password': 'Damiendubocal75'
		}

		response = self.client.post(
		    reverse('login'), 
		    data=json.dumps(user), 
		    content_type='application/json')

		self.assertTrue('_auth_user_id' in self.client.session)


	def test_send_friend_request_success(self):
		user = {
			'username': 'lboulatr',
			'password': 'Damiendubocal75'
		}

		response = self.client.post(
		    reverse('login'), 
		    data=json.dumps(user), 
		    content_type='application/json')

		self.assertEqual(response.status_code, 200)
		self.assertTrue('_auth_user_id' in self.client.session)
		self.assertEqual(self.user1.friends.count(), 0)

		response_request = self.client.post(
			reverse('send_friend_request',
			args=[self.user2.id]),
			follow=True)
		
		friend_request_id = response_request.json()['id']
		self.assertEqual(response_request.status_code, 200)

		response_accept = self.client.post(
		    reverse('accept_friend_request',
			args=[friend_request_id]),
			follow=True)

		self.assertEqual(response_accept.status_code, 200)
		self.assertJSONEqual(response.content, {'status': 'success'})

		# # Check that a FriendRequest object has been created
		# friend_request = FriendRequest.objects.get(from_user=self.user1, to_user=self.user2)
		# self.assertIsNotNone(friend_request)