from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
from django.test import Client

class CSRFTokenTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="osterga",
            email="osterga@gmail.com",
            password="UserPassword9+",
            bio="Bonjours a tous, c'est Osterga")
        self.client.login(username='osterga', password='UserPassword9+')

    def test_get_csrf_token(self):
    
        response = self.client.get(reverse('get_csrf_token'))

        self.assertEqual(response.status_code, 200)
        self.assertIn('csrfToken', response.json())
        self.assertIn('csrftoken', response.cookies)
    
    def test_post_response(self):
    
        response = self.client.post(reverse('get_csrf_token'))
        self.assertEqual(response.status_code, 405)

    def test_get_request_for_post_function(self):
    
        response = self.client.get(reverse('register'))
        self.assertEqual(response.status_code, 405)

    def test_csrf_token_is_unique(self):
    
        response1 = self.client.get(reverse('get_csrf_token'))
        response2 = self.client.get(reverse('get_csrf_token'))
        self.assertNotEqual(response1.json()['csrfToken'], response2.json()['csrfToken'])
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

    def test_token_logout_with_token(self):
        response = self.client.get(reverse('get_csrf_token'))

        response = self.client.post(
            reverse('logout'), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)

    def test_token_logout_without_token(self):
        response = self.client.post(
            reverse('logout'), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)

    def test_post_without_csrf_token(self):
        self.csrf_client = Client(enforce_csrf_checks=True)
        response = self.csrf_client.post(reverse('update_username'), data={'key': 'value'})
        self.assertEqual(response.status_code, 403)

    def test_csrf_token_generated(self):
        response = self.client.get(reverse('get_csrf_token'))
        self.assertContains(response, 'csrfToken')