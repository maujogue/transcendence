from django.test import TestCase
from users.models import CustomUser
from django.urls import reverse
from django.test import Client
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from users.tokens import email_update_token
import json

class ProfileUpdate(TestCase):
    def setUp(self):
        self.client = Client()
        self.client2  = Client()
        self.client3 = Client()

        self.user = CustomUser.objects.create_user(
            username="osterga",
            email="osterga@gmail.com",
            password="UserPassword9+",
            bio="Bonjours a tous, c'est Osterga",
            tournament_username="osterga")

        self.user2 = CustomUser.objects.create_user(
            username="Ochoa",
            email="ochoa@gmail.com",
            password="UserPassword9+",
            bio="Bonjours a tous, c'est Ochoa",
            tournament_username="Ochoa")
        
        self.user3 = CustomUser.objects.create_user(
            username="42boula",
            email="42boula@gmail.com",
            password="UserPassword9+",
            bio="Bonjours a tous, c'est 42boula",
            is_42auth=True)
        
        self.client.login(username='osterga', password='UserPassword9+')
        self.user.is_online = True
        self.user.email_is_verified = True
        self.user.save()

        self.user2.is_online = True
        self.user2.email_is_verified = True
        self.user2.save()

        self.client3.login(username='42boula', password='UserPassword9+')
        self.user3.is_online = True
        self.user3.email_is_verified = True
        self.user3.save()


        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.token = email_update_token.make_token(self.user)

    def test_user_is_not_login(self):
        self.client.logout()
        update_datas = {
            'bio': 'Lorem ipsum dolor sit amet'
        }

        response = self.client.post(
            reverse('update_bio'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 302)


    def test_change_username(self):
        update_datas = {
            'username': 'damien'
        }

        response = self.client.post(
            reverse('update_username'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(self.user.username, 'damien')
        self.assertEqual(response.status_code, 200)

    def test_change_username_is_already_used(self):
        update_datas = {
            'username': 'ochoa'
        }

        response = self.client.post(
            reverse('update_username'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        response_data = response.json()

        self.assertEqual(response_data.get('error'), 'Username is already used.')
        self.assertEqual(response.status_code, 400)

    def test_name_already_used_lower(self):
        update_datas = {
            'username': 'ochoa'
        }

        response = self.client.post(
            reverse('update_username'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)

    def test_name_already_used_upper(self):
        update_datas = {
            'username': 'OCHOA'
        }

        response = self.client.post(
            reverse('update_username'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)

    def test_name_already_used_random_set_of_upper_lower(self):
        update_datas = {
            'username': 'OcHoA'
        }

        response = self.client.post(
            reverse('update_username'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)

    def test_change_username_camelcase(self):
        update_datas = {
            'username': 'OchoA',
        }

        response = self.client.post(
            reverse('update_username'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        response_data = response.json()

        self.assertEqual(response_data.get('error'), 'Username is already used.')
        self.assertEqual(response.status_code, 400)


    def test_update_bio(self):
        update_datas = {
            'bio': 'Lorem ipsum dolor sit amet'
        }

        response = self.client.post(
            reverse('update_bio'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(self.user.bio, 'Lorem ipsum dolor sit amet')
        self.assertEqual(response.status_code, 200)


    def test_empty_bio(self):
        update_datas = {
            'bio': ''
        }

        response = self.client.post(
            reverse('update_bio'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(self.user.bio, '')
        self.assertEqual(response.status_code, 200)

    def test_missing_bio(self):
        update_datas = {}

        response = self.client.post(
            reverse('update_bio'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)

    def test_bio_too_long(self):
        update_datas = {'bio': 'fG08ptDo07C1keR6B7idYblHCcwyIDjk6MrIWBYhbeuE3QjgGhbbEz99f85kQstbLJmEy7l16YXR1ZPVJoajotgUNFkQg9rhrFHvHNvr3Q9wWHKBmoWnQgcjms1zpHx31geUz44aSSVbZiMd9yYPAYiskX26hGWhihhY6QoBVT1yczy4IfVgcvqHkViKNeyGnTKEFVorjZfBVbBBa1jiKDK47SFqnd7iPT0uazYjtRNyK3dDj4198X0jYtqh59Yim3zuzRRGnPt72xjjrguyc9XgWodVLTKMV2s7xcK4fCp5Q4VEs5UR4DplYgwAhH36pEsYWMDQQ7fqViX3r1UWPSZB0XkOZu5AwhobNZhQ9jfEAHj3G39lnSANhNovEavVZH6zG1pa8dBWWJJCh3s0L5RIW4eht7e77iCPh38l2IOLeL8VFfKR3uYQObwwGcqQaRzO8j4g38GhaKj2FRIRwFbXLP4DRlRmKlaavUaDtbUtYi7kTDoRc'}

        response = self.client.post(
            reverse('update_bio'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)


    def test_update_password(self):
        update_datas = {
            'new_password1': 'Zxcvbnm98+',
            'new_password2': 'Zxcvbnm98+'
        }
        old_password = self.user.password

        response = self.client.post(
            reverse('update_password'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        new_password = self.user.password

        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(old_password, new_password)


    def test_update_wrong_password(self):
        update_datas = {
            'new_password1': 'Zxcvbnm98+',
            'new_password2': 'Zxcvbnm98'
        }

        response = self.client.post(
            reverse('update_password'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        response_data = response.json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response_data.get('status'), 'Passwords do not match.')


    def test_update_empty_password(self):
        update_datas = {
            'new_password1': 'Zxcvbnm98+',
            'new_password2': ''
        }

        response = self.client.post(
            reverse('update_password'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        response_data = response.json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response_data.get('status'), 'One password is missing.')


    def test_update_no_datas(self):
        update_datas = {}

        response = self.client.post(
            reverse('update_password'), 
            data=update_datas, 
        )

        self.assertEqual(response.status_code, 406)


    def test_update_email(self):
        update_datas = {
            'email': 'damian-cooper@gmail.com'
        }
        new_email = 'damian-cooper@gmail.com'

        response = self.client.post(
            reverse('update_email'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 200)

        url = reverse('confirm_new_email', kwargs={'uidb64': self.uid, 'token': self.token, 'new_email': new_email})
        response_confirm = self.client.get(url)
        self.assertEqual(response_confirm.status_code, 302)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, new_email)


    def test_update_email_already_used(self):
        update_datas = {
            'email': 'ochoa@gmail.com'
        }

        response = self.client.post(
            reverse('update_email'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 400)

    def test_update_email_empty(self):
        update_datas = {
            'email': ''
        }

        response = self.client.post(
            reverse('update_email'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 400)

    def test_update_email_missing(self):
        update_datas = {}

        response = self.client.post(
            reverse('update_email'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        
    def test_42auth_email(self):
        update_datas = {
            'email': '42boulanew@gmail.com'
        }

        response = self.client3.post(
            reverse('update_email'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 400)

    def test_42auth_username(self):
        update_datas = {
            'username': 'zebulon55'
        }

        response = self.client3.post(
            reverse('update_username'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 400)

    def test_42auth_password(self):
        update_datas = {
            'new_password1': 'Zxcvbnm98+',
            'new_password2': 'Zxcvbnm98+'
        }

        response = self.client3.post(
            reverse('update_password'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        
    def test_update_lang(self):
        update_datas = {
            'lang': 'fr'
        }
        
        response = self.client.post(
            reverse('update_lang'), 
            data=update_datas,
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.lang, 'fr')

    def test_update_tournament_name(self):
        update_datas = {
            'username': 'zebulon55'
        }

        response = self.client.post(
            reverse('update_tournament_name'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(self.user.tournament_username, 'zebulon55')
        self.assertEqual(response.status_code, 200)

    def test_tournament_name_already_used(self):
        update_datas = {
            'username': 'Ochoa'
        }

        response = self.client.post(
            reverse('update_tournament_name'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)

    def test_tournament_name_already_used_lower(self):
        update_datas = {
            'username': 'ochoa'
        }

        response = self.client.post(
            reverse('update_tournament_name'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)

    def test_tournament_name_already_used_upper(self):
        update_datas = {
            'username': 'OCHOA'
        }

        response = self.client.post(
            reverse('update_tournament_name'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)

    def test_tournament_name_already_used_random_set_of_upper_lower(self):
        update_datas = {
            'username': 'OcHoA'
        }

        response = self.client.post(
            reverse('update_tournament_name'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)

    def test_missing_tournament_name(self):
        update_datas = {
            'username': ''
        }

        response = self.client.post(
            reverse('update_tournament_name'), 
            data=update_datas, 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)