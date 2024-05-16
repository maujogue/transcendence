from django.test import TestCase
from django.urls import reverse
from users.models import CustomUser
import json

class LoginTests(TestCase):

    def setUp(self):
        CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Damiendubocal75")

    def test_basic_user(self):
        user = CustomUser.objects.get(username="lboulatr")
        user = CustomUser.objects.get(email="lboulatr@gmail.com")
        self.assertEqual(user.username, 'lboulatr')
        self.assertEqual(user.email, 'lboulatr@gmail.com')
        self.assertEqual(CustomUser.objects.count(), 1)

    def test_wrong_password(self):
        user = {
            'username': 'lboulatr',
            'password': 'IncorrectPassword'
        }
        response = self.client.post(
            reverse('login'),
            data=user,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_basic_login(self):
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

    def test_not_json_login(self):
        user = {
            'username': 'lboulatr',
            'password': 'Damiendubocal75'
        }

        response = self.client.post(
            reverse('login'), 
            data=user)

        self.assertEqual(response.status_code, 406)
        
    def test_wrong_login(self):
        user = {
            'username': 'lboulatx',
            'password': 'Damiendubocal75'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_wrong_password(self):
        user = {
            'username': 'lboulatr',
            'password': 'Damiendubocal75*'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_missing_username(self):
        user = {
            'username': '',
            'password': 'Damiendubocal75'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_missing_password(self):
        user = {
            'username': 'lboulatr',
            'password': ''
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_missing_datas(self):
        user = {}

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_login_invalid_credentials(self):
        user = {
            'username': 'lboulatr',
            'password': 'Damiendubocal75+'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse('_auth_user_id' in self.client.session)