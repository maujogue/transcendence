from django.test import TestCase
from django.urls import reverse
from users.models import CustomUser
import json

class SignUpTest(TestCase):

    def test_register(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'bobseger@gmail.com',
            'password': 'Newtrans9+'
        }

        initial_user_count = CustomUser.objects.count()

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)
        # self.assertRedirects(response, reverse('register_success'))
        # self.assertEqual(CustomUser.objects.count(), initial_user_count + 1)