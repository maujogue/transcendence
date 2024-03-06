#!/bin/sh
python manage.py makemigrations
python manage.py migrate --noinput
python manage.py collectstatic --noinput
# mkcert -install
# mkcert -cert-file docker/cert.pem -key-file docker/key.pem localhost 127.0.0.1
# python manage.py runserver # --cert-file docker/cert.pem --key-file docker/key.pem 0.0.0.0:8000

daphne -e ssl:8000:privateKey=/etc/nginx/ssl/ssl_certificate_key.key:certKey=/etc/nginx/ssl/ssl_certificate.crt -u /tmp/daphne.sock py_backend.asgi:application

# python3 manage.py runserver