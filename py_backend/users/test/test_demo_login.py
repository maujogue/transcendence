from django.test import TestCase, override_settings
from django.urls import reverse
from users.models import CustomUser


@override_settings(DEMO_MODE=True)
class DemoLoginTests(TestCase):

    def test_demo_login_creates_verified_user_and_logs_in(self):
        response = self.client.post(reverse('demo_login'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'logged_in')

        username = response.json()['user']['username']
        user = CustomUser.objects.get(username=username)
        self.assertTrue(user.email_is_verified)
        self.assertFalse(user.has_usable_password())
        self.assertEqual(int(self.client.session['_auth_user_id']), user.pk)

    def test_each_demo_login_gets_a_new_user(self):
        first = self.client.post(reverse('demo_login')).json()['user']['username']
        self.client.post(reverse('logout'))
        second = self.client.post(reverse('demo_login')).json()['user']['username']
        self.assertNotEqual(first, second)
        self.assertEqual(CustomUser.objects.count(), 2)

    def test_demo_login_rejects_get(self):
        response = self.client.get(reverse('demo_login'))
        self.assertEqual(response.status_code, 405)

    @override_settings(DEMO_MODE=False)
    def test_demo_login_disabled_without_demo_mode(self):
        response = self.client.post(reverse('demo_login'))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(CustomUser.objects.count(), 0)
