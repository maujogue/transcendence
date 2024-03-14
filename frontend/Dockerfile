FROM nginx:1.25

COPY .. /usr/share/nginx/html

RUN	chmod 777 /usr/share/nginx/html

RUN		mkdir -p /etc/nginx/ssl

RUN 	openssl req -x509 \
                -nodes \
                -out /etc/nginx/ssl/ssl_certificate.crt \
                -keyout /etc/nginx/ssl/ssl_certificate_key.key \
                -subj "/C=FR/ST=IDF/L=Lyon/O=42/OU=42/CN=maujogue.42.fr/UID=maujogue"

RUN rm /etc/nginx/conf.d/default.conf
COPY /config/nginx.conf /etc/nginx/conf.d/default.conf
