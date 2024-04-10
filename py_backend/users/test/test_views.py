from django.test import TestCase
from django.urls import reverse
from django.test import Client
from requests_toolbelt.multipart.encoder import MultipartEncoder
from django.core.files.uploadedfile import SimpleUploadedFile


import json

from users.models import CustomUser
from users.models import Profile




class RegisterTests(TestCase):

    def setUp(self):
        CustomUser.objects.create(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Damiendubocal75")
    
    def test_basic_user(self):
        user = CustomUser.objects.get(username="lboulatr")
        user = CustomUser.objects.get(email="lboulatr@gmail.com")
        self.assertEqual(user.username, 'lboulatr')
        self.assertEqual(user.email, 'lboulatr@gmail.com')

    def test_new_user_in_database(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'bobseger@gmail.com',
            'password': 'Mewtransse9+',
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

    def test_new_user_username_too_short(self):
        newUser = {
            'username': 'bo',
            'email': 'bobseger@gmail.com',
            'password': 'Newtrans9+',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_new_user_username_has_forbidden_characters(self):
        newUser = {
            'username': 'bob+seger',
            'email': 'bobseger@gmail.com',
            'password': 'Newtrans9+',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_username_is_already_used(self):
        newUser = {
            'username': 'lboulatr',
            'email': 'routine@gmail.com',
            'password': 'Newtrans9+',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_new_user_password_too_short(self):
        newUser = {
            'username': 'bobby_seger',
            'email': 'bobseger@gmail.com',
            'password': 'Newtr',
            'password1': 'Newtr',
            'password2': 'Newtr'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_new_user_same_username_and_password(self):
        newUser = {
            'username': 'bobbyseger',
            'email': 'bonjour@gmail.com',
            'password': 'Bobbyseger2',
            'password1': 'Bobbyseger2+',
            'password2': 'Bobbyseger2+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_username_too_long(self):
        newUser = {
            'username': 'ochoaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'email': 'ochoaloco@gmail.com',
            'password': 'Km4C47_x£6v,',
            'password1': 'Km4C47_x£6v,',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_invalid_email(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'lboulatrgmail.com',
            'password': 'Newtrans9+',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_invalid_email_2(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'lboulatr@gmailcom',
            'password': 'Newtrans9+',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_email_is_already_used(self):
        newUser = {
            'username': 'bob_seger',
            'email': 'lboulatr@gmail.com',
            'password': 'Newtrans9+',
            'password1': 'Newtrans9+',
            'password2': 'Newtrans9+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_weak_password(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password': '+',
            'password1': '+',
            'password2': '+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_different_password_1(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password': 'Km4C47_x£6v,',
            'password1': 'Km4C47_x£6v,',
            'password2': 'Km4C47_x£6v,+'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_different_password_2(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password': 'Km4C47_x£6v,+',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_missing_username(self):
        newUser = {
            'username': '',
            'email': 'ochoaloco@gmail.com',
            'password': 'Km4C47_x£6v,+',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_missing_email(self):
        newUser = {
            'username': 'ochoa',
            'email': '',
            'password': 'Km4C47_x£6v,+',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_missing_password_1(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password': 'Km4C47_x£6v,',
            'password': '',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_missing_password_2(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password': 'Km4C47_x£6v,',
            'password1': 'Km4C47_x£6v,',
            'password2': ''
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_not_json_register(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmail.com',
            'password': 'Km4C47_x£6v,+',
            'password1': 'Km4C47_x£6v,+',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=newUser)

        self.assertEqual(response.status_code, 406)

    def test_missing_datas(self):
        newUser = {}

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_invalid_email(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoalocogmail.com',
            'password': 'Km4C47_x£6v,',
            'password1': 'Km4C47_x£6v,',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)
    
    def test_invalid_email_2(self):
        newUser = {
            'username': 'ochoa',
            'email': 'ochoaloco@gmailcom',
            'password': 'Km4C47_x£6v,',
            'password1': 'Km4C47_x£6v,',
            'password2': 'Km4C47_x£6v,'
        }

        response = self.client.post(
            reverse('register'), 
            data=json.dumps(newUser), 
            content_type='application/json')

        self.assertEqual(response.status_code, 400)

# =========================================================================================

class LoginTests(TestCase):

    def setUp(self):
        CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="Damiendubocal75")

    def test_basic_user(self):
        user = CustomUser.objects.get(username="lboulatr")
        user = CustomUser.objects.get(email="lboulatr@gmail.com")
        self.assertEqual(user.username, 'lboulatr')
        self.assertEqual(user.email, 'lboulatr@gmail.com')

    def test_basic_login(self):
        user = {
            'username': 'lboulatr',
            'password': 'Damiendubocal75'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue('_auth_user_id' in self.client.session)

    def test_not_json_login(self):
        user = {
            'username': 'lboulatr',
            'password': 'Damiendubocal75'
        }

        response = self.client.post(
            reverse('login'), 
            data=user)

        self.assertEqual(response.status_code, 406)
        
    def test_wrong_login(self):
        user = {
            'username': 'lboulatx',
            'password': 'Damiendubocal75'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_wrong_password(self):
        user = {
            'username': 'lboulatr',
            'password': 'Damiendubocal75*'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_missing_username(self):
        user = {
            'username': '',
            'password': 'Damiendubocal75'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_missing_password(self):
        user = {
            'username': 'lboulatr',
            'password': ''
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_missing_datas(self):
        user = {}

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_login_invalid_credentials(self):
        user = {
            'username': 'lboulatr',
            'password': 'Damiendubocal75+'
        }

        response = self.client.post(
            reverse('login'), 
            data=json.dumps(user), 
            content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse('_auth_user_id' in self.client.session)

# =========================================================================================

class LogoutTests(TestCase):

    def setUp(self):
        CustomUser.objects.create_user(
            username="lboulatr",
            email="lboulatr@gmail.com",
            password="UserPassword9+")
        
    def test_logout_success(self):
        self.client.login(username='lboulatr', password='UserPassword9+')
        response = self.client.post(
            reverse('logout_view'), 
            content_type='application/json')

        self.assertEqual(response.status_code, 200)

    def test_logout_but_not_login(self):
        response = self.client.post(
            reverse('logout_view'), 
            content_type='application/json')

        self.assertEqual(response.status_code, 302)

# =========================================================================================

class CSRFTokenTest(TestCase):
    def setUp(self):
        self.csrf_client = Client(enforce_csrf_checks=True)

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

    def test_token(self):
        response = self.client.get(reverse('get_csrf_token'))

        response = self.client.post(
            reverse('logout_view'), 
            content_type='application/json')

        # Assert the expected outcome
        self.assertEqual(response.status_code, 200)


# # =========================================================================================
        
class ProfileUpdate(TestCase):
    def setUp(self):
        self.client = Client()

        self.user = CustomUser.objects.create_user(
            username="osterga",
            email="osterga@gmail.com",
            password="UserPassword9+",
            bio="Bonjours a tous, c'est Osterga")

        self.user2 = CustomUser.objects.create_user(
            username="ochoa",
            email="ochoa@gmail.com",
            password="UserPassword9+",
            bio="Bonjours a tous, c'est Ochoa")

        self.profile = Profile.objects.create(user=self.user)
        
        self.client.login(username='osterga', password='UserPassword9+')

    def test_user_is_not_login(self):
        self.client.logout()
        update_datas = {
            'bio': 'Lorem ipsum dolor sit amet'
        }

        response = self.client.post(
            reverse('update_profile'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 302)


    def test_update_datas_bio(self):
        update_datas = {
            'bio': 'Lorem ipsum dolor sit amet'
        }

        response = self.client.post(
            reverse('update_profile'), 
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
            reverse('update_profile'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(self.user.bio, '')
        self.assertEqual(response.status_code, 200)


    def test_change_username(self):
        update_datas = {
            'username': 'damien'
        }

        response = self.client.post(
            reverse('update_profile'), 
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
            reverse('update_profile'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        response_data = response.json()

        self.assertEqual(response_data.get('error'), 'Username is already used.')
        self.assertEqual(response.status_code, 400)

    
    def test_change_username_camelcase(self):
        update_datas = {
            'username': 'OchoA',
            'avatar': 'hunter.jpg'
        }

        response = self.client.post(
            reverse('update_profile'), 
            data=json.dumps(update_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()
        response_data = response.json()

        self.assertEqual(response_data.get('error'), 'Username is already used.')
        self.assertEqual(response.status_code, 400)


    def test_avatar_upload(self):
        avatar_datas = {
            'avatar': 'hunter.jpg'
        }
        response = self.client.post(
            reverse('update_profile'), 
            data=json.dumps(avatar_datas), 
            content_type='application/json'
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.avatar.name, 'hunter.jpg')
