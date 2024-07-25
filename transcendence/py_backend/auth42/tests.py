from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch
from django.conf import settings
from users.models import CustomUser
from django.contrib.auth import get_user_model

User = get_user_model()

class OAuthCallbackTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.oauth_callback_url = reverse('oauth_callback')


    @patch('requests.post')
    @patch('requests.get')
    def test_failure_to_obtain_user_information(self, mock_get, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {'access_token': 'fake_access_token'}

        mock_get.return_value.status_code = 400

        response = self.client.get(self.oauth_callback_url, {'code': 'fake_code'})

        self.assertEqual(response.status_code, 302)
        self.assertIn('/dash?success=false&message=42_auth_error_user_info', response.url)


    @patch('requests.post')
    @patch('requests.get')
    def test_incomplete_user_information(self, mock_get, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {'access_token': 'fake_access_token'}
        
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            'login': 'testuser',
            'email': 'testuser@example.com'
            # Missing 'image' key
        }

        response = self.client.get(self.oauth_callback_url, {'code': 'fake_code'})

        self.assertEqual(response.status_code, 302)
        self.assertIn('/dash?success=false&message=42_auth_error_missing_info', response.url)

