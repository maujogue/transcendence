#!/bin/sh
python manage.py migrate --noinput
python manage.py collectstatic --noinput
gunicorn py_backend.wsgi:application --bind 0.0.0.0:8000

if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    python manage.py createsuperuser \
        --noinput \
        --username $DJANGO_SUPERUSER_USERNAME \
        --email $DJANGO_SUPERUSER_EMAIL
fi