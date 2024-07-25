from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
import json

class LogoutTests(TestCase):

    def setUp(self):
        self.assertEqual(CustomUser.objects.count(), 0)
        self.user = CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="UserPassword9+")
        self.assertEqual(CustomUser.objects.count(), 1)
        self.user.email_is_verified = True
        self.user.save()
        self.user.refresh_from_db()
        
    def test_logout_success(self):
        user = {
            'username': 'lboulatr',
            'password': 'UserPassword9+'}

        response = self.client.post(
            reverse('login'),
             data=json.dumps(user), 
            content_type='application/json')
        self.assertEqual(response.status_code, 200)

        self.client.post(reverse('logout'))

        self.user.refresh_from_db()


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



    def test_not_json_login(self):
        user = {
            'username': 'lboulatr',
            'password': 'UserPassword9+'
        }

        response = self.client.post(
            reverse('login'), 
            data=user)

        self.assertEqual(response.status_code, 406)
        
    def test_wrong_login(self):
        user = {
            'username': 'lboulatx',
            'password': 'UserPassword9+'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_wrong_password(self):
        user = {
            'username': 'lboulatr',
            'password': 'UserPassword9+*'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_missing_username(self):
        user = {
            'username': '',
            'password': 'UserPassword9+'
        }

    def test_logout_but_not_login(self):
        response = self.client.post(
            reverse('logout'), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 302)

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
            'password': 'UserPassword9++'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse('_auth_user_id' in self.client.session)


    def test_email_is_not_verified(self):
        self.user.email_is_verified = False
        self.user.save()

        user = {
            'username': 'lboulatr',
            'password': 'UserPassword9+'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertEqual(response_data.get('error'), "email_unverified")
      


