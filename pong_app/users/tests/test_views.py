from django.test import TestCase
from django.urls import reverse
from users.models import CustomUser
import json

class RegisterTests(TestCase):

    def setUp(self):
        CustomUser.objects.create(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Damiendubocal75")
    
    def test_new_user_in_database(self):
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

    def test_weak_password(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password1': '+',
            'password2': '+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_different_password1(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password1': 'Km4C47_x£6v,',
            'password2': 'Km4C47_x£6v,+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_different_password2(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_not_json(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=newUser)

        self.assertEqual(response.status_code, 406)

    def test_missing_username(self):
        newUser = {
            'email': 'ochoaloco@gmail.com',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_missing_email(self):
        newUser = {
            'username': 'ochoa',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_missing_password1(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_missing_password2(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password1': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

