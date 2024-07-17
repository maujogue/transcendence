#!/bin/sh

sleep 1
echo launching crontab.sh ...
cd py_backend
python3 manage.py crontab add
python3 manage.py crontab add
cd ..