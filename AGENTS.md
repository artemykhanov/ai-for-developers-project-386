# AGENTS.md

## Структура Проекта
- Корневой пакет содержит TypeSpec-контракт в `api/main.tsp`; `npm run typespec:compile` генерирует `tsp-output/@typespec/openapi3/openapi.yaml`.
- `frontend/` — отдельный npm-пакет со своим `package-lock.json`; frontend-команды запускай через корневые скрипты или `npm --prefix frontend ...`.
- API-типы фронтенда в `frontend/src/api/types.ts` написаны вручную, а не генерируются; при изменении `api/main.tsp` держи их синхронизированными.

## Команды
- Предпочитай корневой `Makefile` как короткий слой алиасов; npm-скрипты остаются источником правды.
- Установка обоих пакетов: `make install` (`npm install`, затем `npm --prefix frontend install`).
- Только компиляция OpenAPI: `make api-openapi` (`npm run typespec:compile`).
- Запуск mock API: `make api-mock`; сначала компилирует TypeSpec, затем запускает Prism на порту `3000`.
- Запуск dev-сервера фронтенда отдельно: `make frontend-dev`.
- Проверка сборки и типов фронтенда: `make frontend-build` (`tsc -b && vite build`).
- Быстрая проверка типов без Vite-сборки: `make frontend-typecheck`.
- Цели Makefile разделены префиксами `api-*` и `frontend-*`, чтобы позже добавить отдельные `backend-*` команды без конфликта.
- В репозитории нет отдельных lint/test-скриптов, кроме Hexlet CI workflow.

## Runtime-Связи
- TypeSpec-сервис находится на `/api` относительно `http://localhost:3000`; дефолтный `VITE_API_BASE_URL` фронтенда — `http://localhost:3000/api`.
- Backend URL можно переопределить через `VITE_API_BASE_URL=... npm run frontend:dev` или `frontend/.env`.
- Публичные маршруты: `/` для гостевого бронирования и `/owner` для кабинета владельца.

## Доменные Ограничения
- В приложении один заранее заданный владелец календаря; регистрации, входа и модели нескольких владельцев нет.
- Слоты бронирования рассчитываются динамически на ближайшие 14 дней; два бронирования не могут иметь одинаковое время начала даже для разных типов событий.
- Перед созданием гостевого бронирования нужно повторно проверять доступность слота; `409` использует код ошибки `slot_unavailable`.

## Рабочие Заметки
- Не редактируй `.github/workflows/hexlet-check.yml`; README workflow указывает, что файл сгенерирован и нужен Hexlet.
- При изменении API-операций обнови `api/main.tsp`, заново запусти `make api-openapi` и при необходимости поправь `frontend/src/api/client.ts` и `frontend/src/api/types.ts`.
