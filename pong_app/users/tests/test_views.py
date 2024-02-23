from django.test import TestCase
from django.urls import reverse
from users.models import CustomUser
import json

class SignUpTest(TestCase):

    def setUp(self):
        CustomUser.objects.create(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Damiendubocal98")
    
    def test_register(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'bobseger@gmail.com',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        initial_user_count = CustomUser.objects.count()

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(CustomUser.objects.count(), initial_user_count + 1)

    def test_email_is_already_used(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'lboulatr@gmail.com',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_username_is_already_used(self):
        newUser = {
            'username': 'lboulatr',
            'email': 'routine@gmail.com',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
