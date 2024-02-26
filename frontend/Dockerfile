FROM nginx:1.25

COPY .. /usr/share/nginx/html

RUN	chmod 777 /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY /config/nginx.conf /etc/nginx/conf.d/
