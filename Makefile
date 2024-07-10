.PHONY:	all
NAME				=	transcendence

DOCKER_COMPOSE_DEV_PATH	=	$(DIR_SRC)docker-compose.yaml
DOCKER_COMPOSE_PROD_PATH	=	$(DIR_SRC)docker-compose.prod.yaml

DOCKER_COMPOSE_DEV		=	docker compose -f $(DOCKER_COMPOSE_DEV_PATH)
DOCKER_COMPOSE_PROD		=	docker compose -f $(DOCKER_COMPOSE_PROD_PATH)

DIR_SRC				=	./docker/


all: $(NAME)

$(NAME): 
		$(MAKE) up

prod_up:
		$(DOCKER_COMPOSE_PROD) up -d --build

dev_up:
		$(DOCKER_COMPOSE_DEV) up -d --build

prod_down:
		$(DOCKER_COMPOSE_PROD) down

dev_down:
		$(DOCKER_COMPOSE_DEV) down

prod_clean:
		$(DOCKER_COMPOSE_PROD) down --volumes --rmi all

dev_clean:
		$(DOCKER_COMPOSE_DEV) down --volumes --rmi all

prod_fclean: prod_clean clean-migrations-cache

dev_fclean: dev_clean clean-migrations-cache

prod_re:
	$(DOCKER_COMPOSE_PROD) build --build-arg CACHEBUST=$(shell date +%s)
	$(DOCKER_COMPOSE_PROD) up -d 

dev_re:
	$(DOCKER_COMPOSE_DEV) build --no-cache
	$(DOCKER_COMPOSE_DEV) up -d

prod_fre:	prod_fclean dev_fclean
		$(DOCKER_COMPOSE_PROD) build --no-cache
		$(DOCKER_COMPOSE_PROD) up -d

dev_fre:	prod_fclean dev_fclean
		$(DOCKER_COMPOSE_DEV) build --no-cache
		$(DOCKER_COMPOSE_DEV) up -d

clean:	prod_clean dev_clean

fclean:	prod_fclean dev_fclean	removecontainers 

nomail:
		python3 disableMailVerification.py

removecontainers:
		@if [ -n "$$(docker ps -aq)" ]; then \
			docker stop $$(docker ps -aq); \
			docker rm $$(docker ps -aq); \
		fi; \

armageddon: removecontainers clean-migrations-cache
		@if [ -f py_backend/db.sqlite3 ]; then \
			rm py_backend/db.sqlite3; \
		fi
		@-docker network prune -f
		@if [ -n "$$(docker volume ls --filter dangling=true -q)" ]; then \
			docker volume rm $$(docker volume ls --filter dangling=true -q); \
		fi
		@if [ -n "$$(docker images --filter dangling=true -qa)" ]; then \
			docker rmi -f $$(docker images --filter dangling=true -qa); \
		fi
		@if [ -n "$$(docker images -qa)" ]; then \
			docker rmi -f $$(docker images -qa); \
		fi

clean-migrations-cache:
		@rm -rf py_backend/migrations
		@rm -rf py_backend/__pycache__
		@rm -rf py_backend/*/migrations
		@rm -rf py_backend/*/__pycache__
