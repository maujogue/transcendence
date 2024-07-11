from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from py_backend import settings

SPECIAL_CHARS = "@+/*.,!?#%^&\{}[]=:;\'\"`~"

def contains_special_char(string):
	for char in SPECIAL_CHARS:
		if char in string:
			return True
	return False

class ContainsDigitValidator:
    def validate(self, password, user=None):
        if not any(char.isdigit() for char in password):
            raise ValidationError(
                _("Your password must contain at least one number."),
                code='password_no_number')

    def get_help_text(self):
        return _("Your password must contain at least one number.")
    
class ContainsSpecialCharValidator:
    def validate(self, password, user=None):
        if not contains_special_char(password):
            raise ValidationError(
                _("Your password must contain at least one special character."),
                code='password_no_special_char')

    def get_help_text(self):
        return _("Your password must contain at least one special character.")
    
class ContainsUppercaseValidator:
    def validate(self, password, user=None):
        if not any(char.isupper() for char in password):
            raise ValidationError(
                _("Your password must contain at least one uppercase character."),
                code='password_no_uppercase')

    def get_help_text(self):
        return _("Your password must contain at least one uppercase character.")
    
class ContainsLowercaseValidator:
    def validate(self, password, user=None):
        if not any(char.islower() for char in password):
            raise ValidationError(
                _("Your password must contain at least one lowercase character."),
                code='password_no_lowercase')

    def get_help_text(self):
        return _("Your password must contain at least one lowercase character.")
    
class MinLengthValidator:
    def validate(self, password, user=None):
        if len(password) < settings.MIN_LEN_PASSWORD:
            raise ValidationError(
                _("Your password is too short."),
                code='password_too_short')
    
    def get_help_text(self):
        return _("Your password is too short.")


class PasswordValidators:
    def __init__(self):
        self.validators = [
            ContainsDigitValidator(),
            ContainsSpecialCharValidator(),
            ContainsUppercaseValidator(),
            ContainsLowercaseValidator(),
            MinLengthValidator(),
        ]

    def validate(self, password):
        for validator in self.validators:
            try:
                validator.validate(password)
            except ValidationError as e:
                raise ValidationError(f"{validator.get_help_text()}")