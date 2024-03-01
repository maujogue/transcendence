"""
Django settings for py_backend project.

Generated by 'django-admin startproject' using Django 5.0.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
from django.core.management.utils import get_random_secret_key
import os

AUTH_USER_MODEL = 'users.CustomUser'

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", get_random_secret_key())

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(os.environ.get("DEBUG", default=0))

# ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS").split(" ")
ALLOWED_HOSTS = ["*"]

# Application definition

INSTALLED_APPS = [
	'corsheaders',
	'daphne',
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'multiplayer',
	'bootstrap5',
	'users',
	# 'django_extensions',
]

ASGI_APPLICATION = 'py_backend.asgi.application'

CHANNEL_LAYERS = {
	"default": {
		 "BACKEND": "channels.layers.InMemoryChannelLayer"
		# "BACKEND": "channels_redis.core.RedisChannelLayer",
		# "CONFIG": {
		#     "hosts": [("127.0.0.1", 6379)],
		# },
	},
}

MIDDLEWARE = [
	'corsheaders.middleware.CorsMiddleware',
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'py_backend.urls'

TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'DIRS': [],
		# 'DIRS': [os.path.join(BASE_DIR, 'frontend', 'templates')],
		'APP_DIRS': True,
		'OPTIONS': {
			'context_processors': [
				'django.template.context_processors.debug',
				'django.template.context_processors.request',
				'django.contrib.auth.context_processors.auth',
				'django.contrib.messages.context_processors.messages',
			],
		},
	},
]

WSGI_APPLICATION = 'py_backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / "db.sqlite3",
    }
}

# DATABASES = {
# 	"default": {
# 		"ENGINE": os.environ.get("SQL_ENGINE", "django.db.backends.postgresql"),
# 		"NAME": os.environ.get("SQL_DATABASE"),
# 		"USER": os.environ.get("SQL_USER", "user"),
# 		"PASSWORD": os.environ.get("SQL_PASSWORD", "password"),
# 		"HOST": os.environ.get("SQL_HOST", "localhost"),
# 		"PORT": os.environ.get("SQL_PORT", "5432"),
# 	}
# }

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
	{
		'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
	},
]

PASSWORD_MIN_LENGTH = 8
PASSWORD_MIN_DIGITS = 1
PASSWORD_MIN_UPPERCASE = 1
PASSWORD_MIN_LOWERCASE = 1
PASSWORD_MIN_SPECIAL_CHARACTERS = 1
PASSWORD_CHANGE_DAYS = 90  # par exemple, 90 jours


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

# USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
# STATICFILES_DIRS = [
#     BASE_DIR / "frontend/static",  # Path to your "frontend" folder
# ]


MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"


# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
	"http://127.0.0.1:5500",  # Add this origin
	"http://127.0.0.1:8000",
	"http://localhost:8000",
	"http://localhost:5500",
]

CSRF_TRUSTED_ORIGINS = [
	"http://127.0.0.1:8000",
	"http://127.0.0.1:5500",
	"http://127.0.0.1:5501",
	"http://127.0.0.1:3000",
]

ALLOWED_HOSTS = [
	"localhost",
	"127.0.0.1",
]

CORS_ORIGIN_WHITELIST = [
	"http://127.0.0.1:8000",
	"http://127.0.0.1:5500",
	"http://127.0.0.1:3000",
]