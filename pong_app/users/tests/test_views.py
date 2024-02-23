from django.test import TestCase
from django.urls import reverse
from users.models import CustomUser

class SignUpTest(TestCase):

    def test_sign_up(self):
        username = 'nouvel_utilisateur'
        email = 'nouvel_utilisateur@example.com'
        password = 'mot_de_passe_secure'

        initial_user_count = CustomUser.objects.count()

        response = self.client.post(reverse('register'), {
            'username': username,
            'email': email,
            'password1': password,
            'password2': password,
        })

        self.assertEqual(CustomUser.objects.count(), initial_user_count + 1)