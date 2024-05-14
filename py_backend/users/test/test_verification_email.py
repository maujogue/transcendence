from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
from django.core import mail
import json

class VerificationEmail(TestCase):
        
    def setUp(self):
        self.user = CustomUser.objects.create(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Damiendubocal75")
        
    def test_new_user_in_database(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'damian4cooper@gmail.com',
            'password1': 'Mewtransse9+',
            'password2': 'Mewtransse9+'
        }

        initial_user_count = CustomUser.objects.count()

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(CustomUser.objects.count(), initial_user_count + 1)


    def test_email_confirmation(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'bobseger@gmail.com',
            'password1': 'Mewtransse9+',
            'password2': 'Mewtransse9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(mail.outbox), 1)

        email = mail.outbox[0]
        self.assertEqual(email.subject, 'Verify Email')

    def test_verif(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'bobseger@gmail.com',
            'password1': 'Mewtransse9+',
            'password2': 'Mewtransse9+'
        }

        self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')
        
        self.client.login(username='bob_seger', password='Mewtransse9+')
        
        response = self.client.post(reverse('get_user_data'))
        response_data = response.json()
        self.assertEqual(response_data.get('user').get('email_is_verified'), False)


