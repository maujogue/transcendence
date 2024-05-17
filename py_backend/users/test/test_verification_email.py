from django.test import TestCase, Client
from users.models import CustomUser
from django.urls import reverse
from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from users.tokens import account_activation_token
from django.test import TestCase
from django.contrib.auth import get_user_model

import json

CustomUser = get_user_model()


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
        self.assertEqual(email.subject, 'Activate your user account.')

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



class ConfirmEmailViewTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.token = account_activation_token.make_token(self.user)


    def test_confirm_email_success(self):
        self.assertFalse(self.user.email_is_verified)
        url = reverse('confirm_email', kwargs={'uidb64': self.uid, 'token': self.token})
        
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_is_verified)
        self.assertTrue(response.json()['status'], 'success')


    def test_confirm_email_invalid_token(self):
        invalid_token = 'invalidtoken'
        url = reverse('confirm_email', kwargs={'uidb64': self.uid, 'token': invalid_token})
        
        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.email_is_verified)
        self.assertTrue(response.json()['status'], 'error')


    def test_confirm_email_invalid_uid(self):
        invalid_uid = 'invaliduid'
        url = reverse('confirm_email', kwargs={'uidb64': invalid_uid, 'token': self.token})
        
        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.email_is_verified)
        self.assertTrue(response.json()['status'], 'error')


    def test_confirm_email_user_does_not_exist(self):
        non_existent_uid = urlsafe_base64_encode(force_bytes(9999))
        url = reverse('confirm_email', kwargs={'uidb64': non_existent_uid, 'token': self.token})
        
        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
        self.assertFalse(CustomUser.objects.filter(pk=9999).exists())
        self.assertTrue(response.json()['status'], 'error')


    def test_check_iud_and_token(self):
        url = reverse('confirm_email', kwargs={'uidb64': self.uid, 'token': self.token})
        
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data.get('datas').get('uidb64'), self.uid)
        self.assertEqual(response_data.get('datas').get('token'), self.token)
