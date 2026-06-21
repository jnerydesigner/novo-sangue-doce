SHELL := /bin/sh

DEV_LOCK := .next/dev/lock
PORT := 3010
ROOT_DIR := ..

.PHONY: help install dev dev-backend dev-all start stop restart build lint biome biome-fix format check clean

help:
	@printf "Comandos disponiveis:\\n"
	@printf "  make install    Instala dependencias com yarn\\n"
	@printf "  make dev        Inicia o Next.js com yarn dev\\n"
	@printf "  make dev-backend Inicia o backend pela raiz do projeto\\n"
	@printf "  make dev-all    Sobe PostgreSQL, backend e frontend pela raiz\\n"
	@printf "  make start      Alias para make dev\\n"
	@printf "  make stop       Para o servidor dev do Next.js\\n"
	@printf "  make restart    Reinicia o servidor dev do Next.js\\n"
	@printf "  make build      Gera build de producao\\n"
	@printf "  make lint       Roda ESLint\\n"
	@printf "  make biome      Roda Biome check\\n"
	@printf "  make biome-fix  Corrige com Biome quando possivel\\n"
	@printf "  make format     Formata arquivos com Biome\\n"
	@printf "  make check      Roda lint, biome e build\\n"
	@printf "  make clean      Remove .next\\n"

install:
	yarn install

dev:
	@if [ -f "$(DEV_LOCK)" ]; then \
		PID=$$(node -e "try { console.log(JSON.parse(require('fs').readFileSync('$(DEV_LOCK)', 'utf8')).pid || '') } catch { console.log('') }"); \
		URL=$$(node -e "try { console.log(JSON.parse(require('fs').readFileSync('$(DEV_LOCK)', 'utf8')).appUrl || 'http://localhost:3010') } catch { console.log('http://localhost:3010') }"); \
		if [ -n "$$PID" ] && kill -0 "$$PID" 2>/dev/null; then \
			printf "Next dev ja esta rodando em %s (PID %s).\\n" "$$URL" "$$PID"; \
			exit 0; \
		fi; \
		printf "Removendo lock antigo do Next dev.\\n"; \
		rm -f "$(DEV_LOCK)"; \
	fi; \
	yarn dev -p $(PORT)

dev-backend:
	$(MAKE) -C $(ROOT_DIR) dev-backend

dev-all:
	$(MAKE) -C $(ROOT_DIR) dev

start: dev

stop:
	@if [ -f "$(DEV_LOCK)" ]; then \
		PID=$$(node -e "try { console.log(JSON.parse(require('fs').readFileSync('$(DEV_LOCK)', 'utf8')).pid || '') } catch { console.log('') }"); \
		if [ -n "$$PID" ] && kill -0 "$$PID" 2>/dev/null; then \
			printf "Parando Next dev (PID %s).\\n" "$$PID"; \
			kill "$$PID"; \
		else \
			printf "Nenhum processo Next dev ativo encontrado no lock.\\n"; \
		fi; \
		rm -f "$(DEV_LOCK)"; \
	else \
		printf "Nenhum servidor dev registrado.\\n"; \
	fi

restart: stop dev

build:
	yarn build

lint:
	yarn lint

biome:
	yarn biome

biome-fix:
	yarn biome:fix

format:
	yarn format

check: lint biome build

clean:
	rm -rf .next
