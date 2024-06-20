from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
import json

from users.utils import convert_image_to_base64

class GetUserDatas(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="osterga",
            email="osterga@gmail.com",
            password="UserPassword9+",
            bio="Bonjours a tous, c'est Osterga",
            title='L\'Inusable')
        
        user = {
            'username': 'osterga',
            'password': 'UserPassword9+'
        }

        self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.user.email_is_verified = True
        self.user.save()
        self.user.refresh_from_db()

    def test_basic_get_user_data(self):
        self.client.login(username='osterga', password='UserPassword9+')
        response = self.client.post(reverse('get_user_data'))

        self.assertEqual(response.status_code, 200)

    def test_get_user_data(self):
        response = self.client.post(
            reverse('get_user_data'))
        
        response_data = response.json()

        encoded_string = convert_image_to_base64(self.user.avatar)

        self.assertEqual(response_data.get('user').get('username'), 'osterga')
        self.assertEqual(response_data.get('user').get('email'), 'osterga@gmail.com')
        self.assertEqual(response_data.get('user').get('avatar'), encoded_string)
        self.assertEqual(response_data.get('user').get('bio'), "Bonjours a tous, c'est Osterga")
        self.assertEqual(response_data.get('user').get('title'), 'L\'Inusable')
        self.assertEqual(response_data.get('user').get('winrate'), None)
        self.assertEqual(response_data.get('user').get('rank'), None)
        self.assertEqual(response_data.get('user').get('n_games_played'), None),
        self.assertEqual(response_data.get('user').get('is_42auth'), False),
        self.assertEqual(response_data.get('user').get('is_online'), True),

        self.assertEqual(response_data.get('user').get('n_games_played'), None)
        self.assertEqual(response_data.get('user').get('lang'), "en")

    def test_without_login(self):
        self.client.logout()
        response = self.client.post(reverse('get_user_data'))
        self.assertEqual(response.status_code, 302)