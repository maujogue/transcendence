from users.models import CustomUser
from py_backend import settings

SPECIAL_CHARS = "+/*.,!#%^&\{}[]=:;\'\"`~"

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
	if CustomUser.objects.filter(username=username).exists():
		return False, f'Username already exists.'
	return True, None

def username_is_unique(username):
	if not username or username == '':
		return False, f'Username cannot be empty.'
	response = CustomUser.objects.filter(username=username).exists()
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

	