from users.models import CustomUser
from django.contrib.auth.hashers import check_password
from py_backend import settings

SPECIAL_CHARS = "+/*.,!#%^&\{}[]=:;\'\"`~"

def email_is_unique(email):
	if not email or email == '':
		return False, f'Missing email.'
	response = CustomUser.objects.filter(email=email).exists()
	if response:
		return False, f'Email is already used.'
	return True, None

def username_exists(username):
	if CustomUser.objects.filter(username=username).exists():
		return True, None
	return False, f'This username does not exist.'


def password_is_correct(username, password):
    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return False, 'User does not exist.'
    
    if check_password(password, user.password):
        return True, None
    else:
        return False, 'The password is incorrect.'

	
def username_is_valid(username):
	if not username or username == '':
		return False, f'Missing username.'
	if len(username) < settings.MIN_LEN_USERNAME:
		return False, f'Username is too short.'
	if len(username) > settings.MAX_LEN_USERNAME:
		return False, f'Username is too long.'
	if any(char in SPECIAL_CHARS for char in username):
		return False, f'Username contains forbidden characters.'
	if CustomUser.objects.filter(username=username).exists():
		return False, f'Username already exists.'
	return True, None


def username_is_unique(username):
	if not username or username == '':
		return False, f'Username cannot be empty.'
	converted_usernane = username.lower()
	response = CustomUser.objects.filter(username=converted_usernane).exists()
	if response:
		return False, f'Username is already used.'
	return True, None
	

def validation_register(data):
	validation_errors = []

	username = data.get('username')
	email = data.get('email')
	
	valid_username, response_username = username_is_valid(username)
	valid_email, response_email = email_is_unique(email)

	if not valid_username:
		validation_errors.append(response_username)
	if not valid_email:
		validation_errors.append(response_email)
	return validation_errors


def validation_login(data):
	validation_errors = []

	username = data.get('username')
	password = data.get('password')

	valid_username, response_username = username_exists(username)
	valid_password, response_password = password_is_correct(username, password)

	if not valid_username:
		validation_errors.append(response_username)
	if not valid_password:
		validation_errors.append(response_password)
	return validation_errors


def get_image_format_from_base64(base64_string):
    try:
        image_format = base64_string.split(';base64')[0].split('/')[1]
        return image_format
    except Exception:
        return None