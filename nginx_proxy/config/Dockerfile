FROM nginx:1.25

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

RUN		mkdir -p /etc/nginx/ssl
RUN		apt-get install -y openssl

RUN 	openssl req -x509 \
                -nodes \
                -out /etc/nginx/ssl/ssl_certificate.crt \
                -keyout /etc/nginx/ssl/ssl_certificate_key.key \
                -subj "/C=FR/ST=IDF/L=Lyon/O=42/OU=42/CN=maujogue.42.fr/UID=maujogue"
