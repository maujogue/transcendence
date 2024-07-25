.PHONY:	all
NAME				=	transcendence

DOCKER_COMPOSE_PATH	=	$(DIR_SRC)docker-compose.yaml

DOCKER_COMPOSE		=	docker-compose -f $(DOCKER_COMPOSE_PATH)

DIR_SRC				=	./docker/


all: $(NAME)

$(NAME): 
		$(MAKE) prod_up

prod_up:
		$(DOCKER_COMPOSE) up -d --build

prod_down:
		$(DOCKER_COMPOSE) down

prod_clean:
		$(DOCKER_COMPOSE) down --volumes --rmi all

prod_fclean: prod_clean clean-migrations-cache-db

prod_re:
	$(DOCKER_COMPOSE) build --build-arg CACHEBUST=$(shell date +%s)
	$(DOCKER_COMPOSE) up -d 

prod_fre:	prod_fclean
		$(DOCKER_COMPOSE) build --no-cache
		$(DOCKER_COMPOSE) up -d

clean:	prod_clean 

fclean:	prod_fclean	removecontainers 

removecontainers:
		@if [ -n "$$(docker ps -aq)" ]; then \
			docker stop $$(docker ps -aq); \
			docker rm $$(docker ps -aq); \
		fi; \

armageddon: removecontainers clean-migrations-cache-db
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

clean-migrations-cache-db:
		@rm -rf py_backend/migrations
		@rm -rf py_backend/__pycache__
		@rm -rf py_backend/*/migrations
		@rm -rf py_backend/*/__pycache__
		@if [ -f py_backend/db.sqlite3 ]; then \
			rm py_backend/db.sqlite3; \
		fi