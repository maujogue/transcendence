.PHONY:	all up down clean fclean re fre removecontainers armageddon clean-migrations-cache-db
NAME				=	transcendence

DOCKER_COMPOSE		=	docker-compose 


all: $(NAME)

$(NAME): 
		$(MAKE) re

up:
		$(DOCKER_COMPOSE) up -d --build

down:
		$(DOCKER_COMPOSE) down

clean:
		$(DOCKER_COMPOSE) down --volumes --rmi all

fclean: clean clean-migrations-cache-db

re:
	$(DOCKER_COMPOSE) build --build-arg CACHEBUST=$(shell date +%s)
	$(DOCKER_COMPOSE) up -d 

fre:	fclean
		$(DOCKER_COMPOSE) build --no-cache
		$(DOCKER_COMPOSE) up -d 

fclean:	clean	removecontainers 

removecontainers:
		@if [ -n "$$(docker ps -aq)" ]; then \
			docker stop $$(docker ps -aq); \
			docker rm $$(docker ps -aq); \
		fi; \

armageddon: removecontainers clean-migrations-cache-db
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

clean-migrations-cache-db:
		@rm -rf py_backend/migrations
		@rm -rf py_backend/__pycache__
		@rm -rf py_backend/*/migrations
		@rm -rf py_backend/*/__pycache__