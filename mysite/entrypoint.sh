#!/usr/bin/env bash
pdm run manage.py collectstatic --noinput
pdm run manage.py migrate --noinput