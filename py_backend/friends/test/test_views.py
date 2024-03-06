from django.test import TestCase
from django.urls import reverse
from django.http import JsonResponse
from users.models import CustomUser
from django.test import Client
import json

class FriendRequest(TestCase):
    def setUp(self):
        self.user1 = CustomUser.objects.create(
            username="osterga",
            email="osterga@gmail.com",
            password="Damiendubocal75")
        self.user2 = CustomUser.objects.create(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Damiendubocal75")
        self.client = Client()

        
    
    def test_two_users_in_database(self):
        user_count = CustomUser.objects.count()
        self.assertEqual(user_count, 2)
    
    def test_send_friend_request(self):
        response = self.client.post(reverse('send_friend_request', args=[self.user2.id]))
        self.assertEqual(response.status_code, 200)
        # self.assertJSONEqual(response.content, {'status': 'success'})
