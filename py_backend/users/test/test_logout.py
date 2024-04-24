from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse

class LogoutTests(TestCase):

    def setUp(self):
        CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="UserPassword9+")
        
    def test_logout_success(self):
        self.client.login(username='lboulatr', password='UserPassword9+')
        response = self.client.post(
            reverse('logout'), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)

    def test_logout_but_not_login(self):
        response = self.client.post(
            reverse('logout'), 
            content_type='application/json')

        self.assertEqual(response.status_code, 302)