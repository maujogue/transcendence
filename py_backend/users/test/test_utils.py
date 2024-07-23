from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse

class UtilsFunctionsTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="osterga",
            email="osterga@gmail.com",
            password="UserPassword9+",
            bio="Bonjours a tous, c'est Osterga",)
        
        self.client.login(username='osterga', password='UserPassword9+')

    def test_unique_username(self):
        update_datas = {
            'username': 'damien-cooper'
        }

        response = self.client.post(
            reverse('username_available'), 
            data=update_datas, 
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
    
    def test_username_already_used(self):
        update_datas = {
            'username': 'osterga'
        }

        response = self.client.post(
            reverse('username_available'), 
            data=update_datas, 
            content_type='application/json'
        )

        response_data = response.json()
        self.assertEqual(response_data.get('error'), 'username_used')
        self.assertEqual(response.status_code, 200)

    def test_username_already_used_letter_case(self):
        update_datas = {
            'username': 'OSTERGA'
        }

        response = self.client.post(
            reverse('username_available'), 
            data=update_datas, 
            content_type='application/json'
        )

        response_data = response.json()
        self.assertEqual(response_data.get('error'), 'username_used')
        self.assertEqual(response.status_code, 200)

    def test_empty_username(self):
        update_datas = {
            'username': ''
        }

        response = self.client.post(
            reverse('username_available'), 
            data=update_datas, 
            content_type='application/json'
        )

        response_data = response.json()
        self.assertEqual(response_data.get('status'), 'missing_username')
        self.assertEqual(response.status_code, 400)

    def test_unique_email(self):
        update_datas = {
            'email': 'damien-cooper@gmail.com'
        }

        response = self.client.post(
            reverse('email_available'), 
            data=update_datas, 
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
    
    def test_email_already_used(self):
        update_datas = {
            'email': 'osterga@gmail.com'
        }

        response = self.client.post(
            reverse('email_available'), 
            data=update_datas, 
            content_type='application/json'
        )

        response_data = response.json()
        self.assertEqual(response_data.get('error'), 'email_used')
        self.assertEqual(response.status_code, 200)

    def test_empty_email(self):
        update_datas = {
            'email': ''
        }

        response = self.client.post(
            reverse('email_available'), 
            data=update_datas, 
            content_type='application/json'
        )

        response_data = response.json()
        self.assertEqual(response_data.get('status'), 'missing_email')
        self.assertEqual(response.status_code, 400)


    def test_post_without_data(self):
        response = self.client.post('email_available', {})
        self.assertEqual(response.status_code, 404)
