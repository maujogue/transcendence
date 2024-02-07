.PHONY:	all
NAME				=	transcendence

DOCKER_COMPOSE_DEV_PATH	=	$(DIR_SRC)docker-compose.yaml
DOCKER_COMPOSE_PROD_PATH	=	$(DIR_SRC)docker-compose.prod.yaml

DOCKER_COMPOSE_DEV		=	docker compose -f $(DOCKER_COMPOSE_DEV_PATH)
DOCKER_COMPOSE_PROD		=	docker compose -f $(DOCKER_COMPOSE_PROD_PATH)

DIR_SRC				=	./


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

prod_fclean: prod_clean
		rm -rf $(VOLUMES)

dev_fclean: dev_clean
		rm -rf $(VOLUMES)

prod_re: prod_fclean
		$(MAKE) prod_up

dev_re: dev_fclean
		$(MAKE) all

fclean:	prod_fclean dev_fclean

clean:	prod_clean dev_clean

