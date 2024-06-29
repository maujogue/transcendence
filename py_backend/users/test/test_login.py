from django.test import TestCase
from django.urls import reverse
from users.models import CustomUser
import json

class LoginTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Mewtransse9+")
        self.user.email_is_verified = True
        self.user.save()

    def test_basic_user(self):
        user = CustomUser.objects.get(username="lboulatr")
        user = CustomUser.objects.get(email="lboulatr@gmail.com")
        self.assertEqual(user.username, 'lboulatr')
        self.assertEqual(user.email, 'lboulatr@gmail.com')
        self.assertEqual(CustomUser.objects.count(), 1)

    def test_basic_login(self):
        user = {
            'username': 'lboulatr',
            'password': 'Mewtransse9+'
        }
        self.assertFalse(self.user.is_online)

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue('_auth_user_id' in self.client.session)

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_online)


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
            'password': 'Mewtransse9+'
        }

        response = self.client.post(
            reverse('login'), 
            data=user)

        self.assertEqual(response.status_code, 406)
        
    def test_wrong_login(self):
        user = {
            'username': 'lboulatx',
            'password': 'Mewtransse9+'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_wrong_password(self):
        user = {
            'username': 'lboulatr',
            'password': 'Mewtransse9+*'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_missing_username(self):
        user = {
            'username': '',
            'password': 'Mewtransse9+'
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
            'password': 'Mewtransse9++'
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
            'password': 'Mewtransse9+'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertEqual(response_data.get('error'), "Your email is not verified yet.")


class SessionKeyTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Mewtransse9+")
        self.user.email_is_verified = True
        self.user.save()

    def test_session_key_is_equal_to_request_session_key(self):
        user = {
            'username': 'lboulatr',
            'password': 'Mewtransse9+'
        }
        self.assertFalse(self.user.is_online)

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue('_auth_user_id' in self.client.session)   
        self.user.refresh_from_db()

        self.assertEqual(self.user.session_key, self.client.session.session_key)

    def test_session_key_is_deleted_when_logout(self):
        user = {
            'username': 'lboulatr',
            'password': 'Mewtransse9+'
        }
                
        self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        self.user.refresh_from_db()
        first_session_key = self.user.session_key
        self.assertEqual(self.user.session_key, self.client.session.session_key)

        self.client.post(
            reverse('logout'), 
            data=json.dumps(user), 
            content_type='application/json')
        self.user.refresh_from_db()
        self.assertEqual(self.user.session_key, None)
        
        self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        self.user.refresh_from_db()
        self.assertEqual(self.user.session_key, self.client.session.session_key)
        self.assertNotEqual(self.user.session_key, first_session_key)

    def test_already_logged_in(self):
        user = {
            'username': 'lboulatr',
            'password': 'Mewtransse9+'
        }

        self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        self.user.refresh_from_db()
        self.assertEqual(self.user.session_key, self.client.session.session_key)

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        self.assertEqual(response.status_code, 400)

        
    