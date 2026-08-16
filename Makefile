SHELL := /bin/sh

ifneq (,$(wildcard .env))
include .env
export
endif

FRONT_DIR := front-sangue-doce
BACK_DIR := back-sangue-doce
SMART_DIR := smart-sangue-doce
FRONT_PORT ?= 3010
BACK_PORT ?= 3011
SERVER_PORT ?= $(BACK_PORT)
SMART_PORT ?= 8040
API_URL := http://localhost:$(BACK_PORT)
SMART_URL := http://localhost:$(SMART_PORT)

.PHONY: help install install-frontend install-backend install-smart install-smart-ocr infra-up infra-wait-postgres infra-down prisma-deploy prisma-generate prisma-migrate prisma-seed dev dev-frontend dev-backend dev-smart start stop restart build build-frontend build-backend build-smart lint lint-frontend lint-backend test-smart biome biome-frontend biome-backend biome-fix biome-fix-frontend biome-fix-backend format format-frontend format-backend check clean

help:
	@printf "Comandos disponiveis na raiz:\\n"
	@printf "  make install    Instala dependencias do backend e frontend\\n"
	@printf "  make install-smart Instala dependencias do smart-sangue-doce\\n"
	@printf "  make install-smart-ocr Instala Tesseract para OCR local\\n"
	@printf "  make infra-up   Sobe o PostgreSQL com Docker Compose\\n"
	@printf "  make infra-down Para o PostgreSQL\\n"
	@printf "  make prisma-deploy   Aplica migrations Prisma em ambiente preparado\\n"
	@printf "  make prisma-generate Gera o Prisma Client\\n"
	@printf "  make prisma-migrate  Cria/aplica migration Prisma em desenvolvimento\\n"
	@printf "  make prisma-seed     Executa o seed Prisma\\n"
	@printf "  make dev        Sobe PostgreSQL, backend e frontend\\n"
	@printf "  make dev-backend   Inicia o backend Nest em modo watch\\n"
	@printf "  make dev-frontend  Inicia o frontend Next em modo dev\\n"
	@printf "  make dev-smart     Inicia o smart-sangue-doce FastAPI em modo reload\\n"
	@printf "  make start      Alias para make dev\\n"
	@printf "  make stop       Para o frontend registrado e processos na porta do backend\\n"
	@printf "  make restart    Reinicia backend e frontend\\n"
	@printf "  make build      Gera build do backend e frontend\\n"
	@printf "  make lint       Roda ESLint no backend e frontend\\n"
	@printf "  make biome      Roda Biome check no backend e frontend\\n"
	@printf "  make biome-fix  Corrige com Biome quando possivel\\n"
	@printf "  make format     Formata arquivos com Biome no backend e frontend\\n"
	@printf "  make check      Roda lint, biome e build\\n"
	@printf "  make clean      Remove builds do backend e frontend\\n"

install: install-backend install-frontend

install-frontend:
	$(MAKE) -C $(FRONT_DIR) install

install-backend:
	cd $(BACK_DIR) && yarn install
	$(MAKE) prisma-generate

install-smart:
	cd $(SMART_DIR) && python3 -m venv .venv
	cd $(SMART_DIR) && . .venv/bin/activate && pip install -r requirements-dev.txt

install-smart-ocr:
	sudo apt update
	sudo apt install -y tesseract-ocr tesseract-ocr-por

infra-up:
	docker compose up -d --remove-orphans postgres
	$(MAKE) infra-wait-postgres

infra-wait-postgres:
	@printf "Aguardando PostgreSQL ficar pronto...\\n"
	@for i in $$(seq 1 60); do \
		if docker compose exec -T postgres sh -c 'pg_isready -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' >/dev/null 2>&1; then \
			printf "PostgreSQL pronto.\\n"; \
			exit 0; \
		fi; \
		sleep 1; \
	done; \
	printf "PostgreSQL nao ficou pronto em 60 segundos.\\n"; \
	docker compose ps postgres; \
	exit 1

infra-down:
	docker compose down --remove-orphans

prisma-deploy:
	cd $(BACK_DIR) && yarn prisma:deploy

prisma-generate:
	cd $(BACK_DIR) && yarn prisma:generate

prisma-migrate:
	cd $(BACK_DIR) && yarn prisma:migrate

prisma-seed:
	cd $(BACK_DIR) && yarn prisma:seed

dev: infra-up
	$(MAKE) prisma-deploy
	$(MAKE) prisma-generate
	$(MAKE) prisma-seed
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

dev-smart:
	@printf "Smart API: $(SMART_URL)\\n"
	cd $(SMART_DIR) && . .venv/bin/activate && uvicorn app.main:app --reload --port $(SMART_PORT)

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
	$(MAKE) prisma-generate
	cd $(BACK_DIR) && yarn build

build-smart:
	cd $(SMART_DIR) && . .venv/bin/activate && python -m compileall app tests

lint: lint-backend lint-frontend

lint-frontend:
	$(MAKE) -C $(FRONT_DIR) lint

lint-backend:
	cd $(BACK_DIR) && yarn lint

test-smart:
	cd $(SMART_DIR) && . .venv/bin/activate && python -m pytest

biome: biome-backend biome-frontend

biome-frontend:
	$(MAKE) -C $(FRONT_DIR) biome

biome-backend:
	cd $(BACK_DIR) && yarn biome

biome-fix: biome-fix-backend biome-fix-frontend

biome-fix-frontend:
	$(MAKE) -C $(FRONT_DIR) biome-fix

biome-fix-backend:
	cd $(BACK_DIR) && yarn biome:fix

format: format-backend format-frontend

format-frontend:
	$(MAKE) -C $(FRONT_DIR) format

format-backend:
	cd $(BACK_DIR) && yarn biome:format

check:
	$(MAKE) lint biome build

clean:
	$(MAKE) -C $(FRONT_DIR) clean
	rm -rf $(BACK_DIR)/dist
