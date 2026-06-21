SHELL := /bin/sh

FRONT_DIR := front-sangue-doce
BACK_DIR := back-sangue-doce
FRONT_PORT := 3010
BACK_PORT := 3011
API_URL := http://localhost:$(BACK_PORT)

.PHONY: help install install-frontend install-backend infra-up infra-down dev dev-frontend dev-backend start stop restart build build-frontend build-backend lint lint-frontend lint-backend biome biome-fix format check clean

help:
	@printf "Comandos disponiveis na raiz:\\n"
	@printf "  make install    Instala dependencias do backend e frontend\\n"
	@printf "  make infra-up   Sobe o PostgreSQL com Docker Compose\\n"
	@printf "  make infra-down Para o PostgreSQL\\n"
	@printf "  make dev        Sobe PostgreSQL, backend e frontend\\n"
	@printf "  make dev-backend   Inicia o backend Nest em modo watch\\n"
	@printf "  make dev-frontend  Inicia o frontend Next em modo dev\\n"
	@printf "  make start      Alias para make dev\\n"
	@printf "  make stop       Para o frontend registrado e processos na porta do backend\\n"
	@printf "  make restart    Reinicia backend e frontend\\n"
	@printf "  make build      Gera build do backend e frontend\\n"
	@printf "  make lint       Roda ESLint no backend e frontend\\n"
	@printf "  make biome      Roda Biome check no frontend\\n"
	@printf "  make biome-fix  Corrige com Biome quando possivel\\n"
	@printf "  make format     Formata arquivos do frontend com Biome\\n"
	@printf "  make check      Roda lint, biome e build\\n"
	@printf "  make clean      Remove builds do backend e frontend\\n"

install: install-backend install-frontend

install-frontend:
	$(MAKE) -C $(FRONT_DIR) install

install-backend:
	cd $(BACK_DIR) && yarn install
	cd $(BACK_DIR) && yarn prisma generate

infra-up:
	docker compose up -d --remove-orphans postgres

infra-down:
	docker compose down --remove-orphans

dev: infra-up
	cd $(BACK_DIR) && yarn prisma migrate deploy
	cd $(BACK_DIR) && yarn prisma generate
	cd $(BACK_DIR) && yarn prisma:seed
	@printf "Backend:  $(API_URL)\\n"
	@printf "Frontend: http://localhost:$(FRONT_PORT)\\n"
	@trap 'kill "$$BACK_PID" "$$FRONT_PID" 2>/dev/null || true' INT TERM EXIT; \
	$(MAKE) --no-print-directory dev-backend 2>&1 | sed -u 's/^/[backend] /' & \
	BACK_PID=$$!; \
	printf "Aguardando backend em $(API_URL)/health...\\n"; \
	for i in $$(seq 1 60); do \
		if curl -fsS "$(API_URL)/health" >/dev/null 2>&1; then \
			break; \
		fi; \
		if ! kill -0 "$$BACK_PID" 2>/dev/null; then \
			printf "Backend encerrou antes de ficar pronto.\\n"; \
			wait "$$BACK_PID"; \
			exit 1; \
		fi; \
		if [ "$$i" -eq 60 ]; then \
			printf "Backend nao ficou pronto em $(API_URL)/health.\\n"; \
			exit 1; \
		fi; \
		sleep 1; \
	done; \
	$(MAKE) --no-print-directory dev-frontend 2>&1 | sed -u 's/^/[frontend] /' & \
	FRONT_PID=$$!; \
	wait "$$BACK_PID" "$$FRONT_PID"

dev-frontend:
	cd $(FRONT_DIR) && NEXT_PUBLIC_API_URL=$(API_URL) yarn dev

dev-backend:
	cd $(BACK_DIR) && SERVER_PORT=$(BACK_PORT) yarn nest start --watch --preserveWatchOutput

start:
	$(MAKE) dev

stop:
	$(MAKE) -C $(FRONT_DIR) stop
	@if command -v lsof >/dev/null 2>&1; then \
		PIDS=$$(lsof -ti tcp:$(BACK_PORT)); \
		if [ -n "$$PIDS" ]; then \
			printf "Parando processos na porta $(BACK_PORT): %s\\n" "$$PIDS"; \
			kill $$PIDS; \
		else \
			printf "Nenhum processo encontrado na porta $(BACK_PORT).\\n"; \
		fi; \
	else \
		printf "lsof nao encontrado; pare o backend manualmente se ele estiver rodando.\\n"; \
	fi

restart:
	$(MAKE) stop
	$(MAKE) dev

build: build-backend build-frontend

build-frontend:
	$(MAKE) -C $(FRONT_DIR) build

build-backend:
	cd $(BACK_DIR) && yarn prisma generate
	cd $(BACK_DIR) && yarn build

lint: lint-backend lint-frontend

lint-frontend:
	$(MAKE) -C $(FRONT_DIR) lint

lint-backend:
	cd $(BACK_DIR) && yarn lint

biome:
	$(MAKE) -C $(FRONT_DIR) biome

biome-fix:
	$(MAKE) -C $(FRONT_DIR) biome-fix

format:
	$(MAKE) -C $(FRONT_DIR) format

check:
	$(MAKE) lint biome build

clean:
	$(MAKE) -C $(FRONT_DIR) clean
	rm -rf $(BACK_DIR)/dist
