from django.test import TestCase
from django.urls import reverse
from django.http import JsonResponse
from users.models import CustomUser
from friends.models import FriendRequest
from django.test import Client
import json

class FriendRequest(TestCase):
    # def setUp(self):
    #     self.user1 = CustomUser.objects.create(
    #         username="osterga",
    #         email="osterga@gmail.com",
    #         password="Damiendubocal75")
    #     self.user2 = CustomUser.objects.create(
    #         username="lboulatr",
    #         email="lboulatr@gmail.com",
    #         password="Damiendubocal75")
    #     self.client = Client()

        
    
    # def test_two_users_in_database(self):
    #     user_count = CustomUser.objects.count()
    #     self.assertEqual(user_count, 2)
    
    # def test_send_friend_request(self):
    #     response = self.client.post(reverse('send_friend_request', args=[self.user2.id]))
    #     self.assertEqual(response.status_code, 200)
    #     # self.assertJSONEqual(response.content, {'status': 'success'})

    def setUp(self):
        self.user1 = CustomUser.objects.create_user(username='user1', password='password1', email='test@gmail.com')
        self.user2 = CustomUser.objects.create_user(username='user2', password='password2', email='damien@gmail.com')
        self.client.login(username='user1', password='password1')

    def test_send_friend_request_success(self):
        # Test sending a friend request successfully
        response = self.client.post(reverse('send_friend_request', args=[self.user2.id]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(FriendRequest.objects.count(), 1)

    def test_send_friend_request_failure(self):
        # Test sending a friend request when one already exists
        FriendRequest.objects.create(from_user=self.user1, to_user=self.user2)
        response = self.client.post(reverse('send_friend_request', args=[self.user2.id]))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(FriendRequest.objects.count(), 1)