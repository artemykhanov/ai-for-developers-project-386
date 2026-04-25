.PHONY: install api-openapi api-mock frontend-dev frontend-build frontend-typecheck

install:
	npm install
	npm --prefix frontend install

api-openapi:
	npm run typespec:compile

api-mock:
	npm run frontend:mock:api

frontend-dev:
	npm run frontend:dev

frontend-build:
	npm run frontend:build

frontend-typecheck:
	npm --prefix frontend run typecheck
