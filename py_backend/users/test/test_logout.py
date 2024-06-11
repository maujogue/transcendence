from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
import json

class LogoutTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="UserPassword9+")
        
    def test_logout_success(self):
        user = {
            'username': 'lboulatr',
            'password': 'UserPassword9+'}

        self.client.post(
            reverse('login'),
             data=json.dumps(user), 
            content_type='application/json')

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_online)

        response = self.client.post(
            reverse('logout'), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_online)

    def test_logout_but_not_login(self):
        response = self.client.post(
            reverse('logout'), 
            content_type='application/json')

        self.assertEqual(response.status_code, 302)