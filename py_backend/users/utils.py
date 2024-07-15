from users.models import CustomUser
from django.http import JsonResponse
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode 
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from users.tokens import account_activation_token, email_update_token
from py_backend import settings
import base64


import json
import os
import re

SPECIAL_CHARS = "+/*.,!?#%^&\{}[]=:;\'\"`~"


def email_is_valid(email):
	if not email or email == '':
		return False, f'Missing email.'
	try:
		validate_email(email)
	except ValidationError as e:
		return False, f'Invalid email.'
	return True, None


def email_is_unique(email):
	if not email or email == '':
		return False, f'Missing email.'
	response = CustomUser.objects.filter(email=email).exists()
	if response:
		return False, f'Email is already used.'
	return True, None


def username_is_valid(username):
	if not username or username == '':
		return False, f'Missing username.'
	if len(username) < settings.MIN_LEN_USERNAME:
		return False, f'Username is too short.'
	if len(username) > settings.MAX_LEN_USERNAME:
		return False, f'Username is too long.'
	if any(char in SPECIAL_CHARS for char in username):
		return False, f'Username contains forbidden characters.'
	if re.search(r'\s', username):
		return False, 'Username cannot contain spaces.'
	return True, None


def username_is_unique(username):
	if not username or username == '':
		return False, f'Username cannot be empty.'
	response = CustomUser.objects.filter(username__iexact=username).exists()
	if response:
		return False, f'Username is already used.'
	return True, None


def tournament_username_is_unique(username):
	if not username or username == '':
		return False, f'Tournament username cannot be empty.'
	response = CustomUser.objects.filter(tournament_username__iexact=username).exists()
	if response:
		return False, f'Tournament username is already used.'
	return True, None


def validation_register(data):
	validation_errors = []

	username = data.get('username')
	email = data.get('email')
	
	is_valid_username, valid_username_response = username_is_valid(username)
	already_used_username, response_already_used_username = username_is_unique(username)
	is_valid_email, valid_email_response = email_is_valid(email)
	is_unique_email, unique_email_response = email_is_unique(email)

	if not is_valid_username:
		validation_errors.append(valid_username_response)
	if not already_used_username:
		validation_errors.append(response_already_used_username)
	if not is_valid_email:
		validation_errors.append(valid_email_response)
	if not is_unique_email:
		validation_errors.append(unique_email_response)
	return validation_errors


def decode_json_body(request):
	try:
		data = json.loads(request.body.decode("utf-8"))

		for key, value in data.items():
			if isinstance(value, int):
				data[key] = str(value)

		return data
	except json.JSONDecodeError:
		return JsonResponse(data={'error': "Invalid JSON format"}, status=406)
	

def image_extension_is_valid(image_name):
	name, ext = os.path.splitext(image_name)
	if ext == '.png':
		return True
	if ext == '.jpg' or ext == '.jpeg' or ext == '.JPG' or ext == '.JPEG':
		return True
	return False


def convert_image_to_base64(image_field):
    with open(image_field.path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string


def send_confirmation_email(user, request):
	if user.is_authenticated:
		if user.email_is_verified != True:
			current_site = get_current_site(request)
			email = user.email
			subject = "Verify Email"
			message = render_to_string('../templates/verification_email_message.html', {
				'request': request,
				'username': user.username,
				'domain': current_site.domain,
				'uid':urlsafe_base64_encode(force_bytes(user.pk)),
				'token':account_activation_token.make_token(user),
			})
			email = EmailMessage(
				subject, message, to=[email]
			)
			email.content_subtype = 'html'
			return email.send()
		return False
	return False


def send_update_email(request, new_email):
	current_site = get_current_site(request)
	subject = "Update your email"
	message = render_to_string('../templates/update_email.html', {
		'request': request,
		'username': request.user.username,
		'domain': current_site.domain,
		'uid': urlsafe_base64_encode(force_bytes(request.user.pk)),
		'token': email_update_token.make_token(request.user),
		'new_email': new_email,
	})
	email = EmailMessage(
		subject, message, to=[new_email]
	)
	email.content_subtype = 'html'
	return email.send()


def utils_get_friendslist_data(user):
	friendslist = []
	friendslist = user.friends.all()
	friends_count = len(friendslist)
	friends_list_data = [{'username': friend.username, 'avatar': convert_image_to_base64(friend.avatar)} for friend in friendslist]
	if friends_count == 0:
		return False
	return friends_list_data


def lang_is_valid(lang):
	if not lang or lang == '':
		return False
	if len(lang) > 2 or lang.isnumeric() or lang.isspace():
		return False
	if lang not in settings.LANG:
		return False
	return True