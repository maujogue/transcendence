#!/bin/sh
python manage.py makemigrations
python manage.py migrate --noinput
# python manage.py collectstatic --noinput
# mkcert -install
# mkcert -cert-file docker/cert.pem -key-file docker/key.pem localhost 127.0.0.1
python manage.py runserver 0.0.0.0:8000