from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from py_backend import settings
from PIL import Image

class CustomUser(AbstractUser):
	class Meta:
		verbose_name = 'Custom User'

	username = models.CharField(max_length=settings.MAX_LEN_USERNAME, unique=True)
	email = models.EmailField(max_length=settings.MAX_LEN_EMAIL, unique=True)
	title = models.CharField(max_length=50, null=True)
	avatar = models.ImageField(default='avatar.jpg', upload_to='profile_pictures')
	bio = models.TextField(max_length=settings.MAX_LEN_TEXT, default="")
	banner = models.ImageField(null=True)
	winrate = models.DecimalField(max_digits=4, decimal_places=4, validators=[MinValueValidator(0), MaxValueValidator(1)], null=True)
	rank = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(50)], null=True)
	n_games_played = models.IntegerField(null=True)
	friends = models.ManyToManyField("self", blank=True)
	# groups = models.ManyToManyField('auth.Group', related_name='custom_user_set')
	# user_permissions = models.ManyToManyField('auth.Permission', related_name='custom_user_set')
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		img = Image.open(self.avatar.path)
		if img.height > 300 or img.width > 300:
			output_size = (300, 300)
			img.thumbnail(output_size)
			img.save(self.avatar.path)


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    avatar = models.ImageField(default='default.jpg', upload_to='profile_images')
    bio = models.TextField(max_length=settings.MAX_LEN_TEXT)
