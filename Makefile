.PHONY: help up down build logs logs-backend logs-frontend install dev-backend dev-frontend

help:
	@echo "G-HUB Development Commands"
	@echo ""
	@echo "Docker:"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make build           - Build Docker images"
	@echo "  make logs            - View all logs"
	@echo "  make logs-backend    - View backend logs"
	@echo "  make logs-frontend   - View frontend logs"
	@echo ""
	@echo "Development:"
	@echo "  make install         - Install dependencies"
	@echo "  make dev-backend     - Start backend dev server"
	@echo "  make dev-frontend    - Start frontend dev server"

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

install:
	cd apps/backend && npm install
	cd apps/frontend && npm install

dev-backend:
	cd apps/backend && npm run start:dev

dev-frontend:
	cd apps/frontend && npm run dev
