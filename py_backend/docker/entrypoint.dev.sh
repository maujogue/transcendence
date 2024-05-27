#!/bin/sh
python manage.py makemigrations
python manage.py migrate --noinput
python manage.py collectstatic --noinput

python manage.py runserver 127.0.0.1:8000
