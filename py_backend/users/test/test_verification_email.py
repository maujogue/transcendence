from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
from django.core import mail
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


    # def test_email_confirmation(self):
    #     user = CustomUser.objects.create_user(username='userTest', email='user@example.com', password='TestpassUltra1')
        
    #     # Assuming you have a function to send the confirmation email and it sets a confirmation key
    #     send_confirmation_email(user.email)
        
    #     # Retrieve the confirmation key from the user's email
    #     email = mail.outbox[0]
    #     confirmation_key = extract_confirmation_key(email.body) # You need to implement this function
        
    #     # Send a request to the confirmation URL with the confirmation key
    #     response = self.client.get(reverse('confirm_email', args=[confirmation_key]))
        
    #     # Check that the user's email is confirmed
    #     user.refresh_from_db()
    #     self.assertTrue(user.is_active)
