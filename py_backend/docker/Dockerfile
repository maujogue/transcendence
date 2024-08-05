FROM python:3.10

RUN mkdir -p /code/staticfiles

COPY requirements.txt code/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r code/requirements.txt

COPY ./entrypoint.sh /code/entrypoint.sh

ARG CACHEBUST
RUN echo $CACHEBUST
COPY .. /code
WORKDIR /code
CMD ["sh","docker/entrypoint.sh"]