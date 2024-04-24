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

prod_up: prod_down
		$(DOCKER_COMPOSE_PROD) up -d --build

dev_up:	dev_down
		$(DOCKER_COMPOSE_DEV) up -d --build

prod_down:
		$(DOCKER_COMPOSE_PROD) down

dev_down:
		$(DOCKER_COMPOSE_DEV) down

prod_clean:
		$(DOCKER_COMPOSE_PROD) down --volumes --rmi all

dev_clean:
		$(DOCKER_COMPOSE_DEV) down --volumes --rmi all

prod_fclean: prod_clean

dev_fclean: dev_clean

prod_re: prod_down prod_up

dev_re: dev_down dev_up

prod_fre:	prod_fclean dev_fclean
		$(DOCKER_COMPOSE_PROD) build --no-cache
		$(DOCKER_COMPOSE_PROD) up -d

dev_fre:	prod_fclean dev_fclean
		$(DOCKER_COMPOSE_DEV) build --no-cache
		$(DOCKER_COMPOSE_DEV) up -d

clean:	prod_clean dev_clean

fclean:	prod_fclean dev_fclean	removecontainers

removecontainers:
		docker stop	$$(docker ps -aq)
		docker	rm	$$(docker ps -aq)


armageddon:	removecontainers
		docker	network	prune	-f
		docker	rmi	-f	$$(docker images --filter dangling=true -qa)
		docker	volume	rm $$(docker volume ls --filter dangling=true -q)
		docker	rmi	-f $$(docker images -qa)
