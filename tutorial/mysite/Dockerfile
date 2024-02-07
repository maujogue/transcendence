# Dockerfile

# The first instruction is what image we want to base our container on
# We Use an official Python runtime as a parent image
FROM python:3.7

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Allows docker to cache installed dependencies between builds

RUN mkdir -p /code/static
COPY . code
WORKDIR /code
COPY requirements.txt code/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install django-bootstrap-v5
RUN pip install whitenoise


EXPOSE 8000

COPY ./entrypoint.sh $APP_HOME
CMD ["/entrypoint.sh"]