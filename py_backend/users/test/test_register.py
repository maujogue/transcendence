from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
import json

class RegisterTests(TestCase):

    def setUp(self):
        CustomUser.objects.create(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Mewtransse9+")
    
    def test_basic_user(self):
        user = CustomUser.objects.get(username="lboulatr")
        user = CustomUser.objects.get(email="lboulatr@gmail.com")
        self.assertEqual(user.username, 'lboulatr')
        self.assertEqual(user.email, 'lboulatr@gmail.com')

    def test_new_user_in_database(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'bobseger@gmail.com',
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

    def test_new_user_username_too_short(self):
        newUser = {
            'username': 'bo',
            'email': 'bobseger@gmail.com',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_new_user_username_has_forbidden_characters(self):
        newUser = {
            'username': 'bob+seger',
            'email': 'bobseger@gmail.com',
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

    def test_new_user_password_too_short(self):
        newUser = {
            'username': 'bobby_seger',
            'email': 'bobseger@gmail.com',
            'password1': 'Newtr',
            'password2': 'Newtr'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_new_user_same_username_and_password(self):
        newUser = {
            'username': 'bobbyseger',
            'email': 'bonjour@gmail.com',
            'password1': 'Bobbyseger2+',
            'password2': 'Bobbyseger2+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_username_too_long(self):
        newUser = {
            'username': 'ochoaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'email': 'ochoaloco@gmail.com',
            'password1': 'Km4C47_x£6v,',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_invalid_email(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'lboulatrgmail.com',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_invalid_email_2(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'lboulatr@gmailcom',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

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

    def test_different_password_1(self):
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

    def test_different_password_2(self):
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

    def test_missing_username(self):
        newUser = {
            'username': '',
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
            'email': '',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_missing_password_1(self):
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

    def test_missing_password_2(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password1': 'Km4C47_x£6v,',
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_not_json_register(self):
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

    def test_missing_datas(self):
        newUser = {}

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_invalid_email(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoalocogmail.com',
            'password1': 'Km4C47_x£6v,',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_invalid_email_2(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmailcom',
            'password1': 'Km4C47_x£6v,',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)