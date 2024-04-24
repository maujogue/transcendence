from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
import json

class VerificationEmail(TestCase):
        
    def setUp(self):
        CustomUser.objects.create(
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


    # def test_email_confirmation(self):
    #     response = self.client.post(reverse('register'), {
    #         'username': 'testuser',
    #         'email': 'testuser@example.com',
    #         'password1': 'testpassword',
    #         'password2': 'testpassword',
    #     })

    #     # Check that the response is as expected
    #     self.assertEqual(response.status_code, 200)

    #     # Check that one email was sent
    #     self.assertEqual(len(mail.outbox), 1)

    #     email = mail.outbox[0]
    #     # self.assertEqual(email.subject, 'Your subject here')
    #     # self.assertIn('Your confirmation link here', email.body)