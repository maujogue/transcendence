from django.test import TestCase
from django.urls import reverse
from users.models import CustomUser

class SignUpTest(TestCase):

    def test_sign_up(self):
