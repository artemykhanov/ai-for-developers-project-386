# AGENTS.md

## Структура Проекта
- Корневой пакет содержит TypeSpec-контракт в `api/main.tsp`; `npm run typespec:compile` генерирует `tsp-output/@typespec/openapi3/openapi.yaml`.
- `frontend/` — отдельный npm-пакет со своим `package-lock.json`; frontend-команды запускай через корневые скрипты или `npm --prefix frontend ...`.
- `backend/` — отдельный `uv`-проект с FastAPI backend; данные хранятся в памяти процесса.
- `tests/` — отдельный `uv`-проект с e2e-тестами на `pytest` и `playwright`; сценарии описаны в `tests/README.md`.
- API-типы фронтенда в `frontend/src/api/types.ts` написаны вручную, а не генерируются; при изменении `api/main.tsp` держи их синхронизированными.

## Язык И Контент
- Для документации и примеров данных используй русский язык.

## Команды
- Предпочитай корневой `Makefile` как короткий слой алиасов; npm-скрипты остаются источником правды.
- Установка основных зависимостей: `make install` (`npm install`, затем `npm --prefix frontend install`, затем `uv sync --project backend`).
- Установка e2e-зависимостей и Chromium: `make tests-install` (`uv sync --project tests`, затем `uv run --project tests playwright install chromium`).
- Только компиляция OpenAPI: `make api-openapi` (`npm run typespec:compile`).
- Запуск mock API: `make api-mock`; сначала компилирует TypeSpec, затем запускает Prism на порту `3000`.
- Запуск FastAPI backend для разработки: `make backend-dev`.
- Запуск FastAPI backend без reload: `make backend-run`.
- Проверка backend: `make backend-check` (`python -m compileall app`).
- Запуск dev-сервера фронтенда отдельно: `make frontend-dev`.
- Проверка сборки и типов фронтенда: `make frontend-build` (`tsc -b && vite build`).
- Быстрая проверка типов без Vite-сборки: `make frontend-typecheck`.
- Запуск e2e-тестов: `make tests-e2e` (`uv run --project tests pytest --browser chromium`).
- Цели Makefile разделены префиксами `api-*`, `backend-*`, `frontend-*` и `tests-*`.
- В репозитории нет отдельных lint-скриптов, кроме Hexlet CI workflow.

## Runtime-Связи
- TypeSpec-сервис находится на `/api` относительно `http://localhost:3000`; дефолтный `VITE_API_BASE_URL` фронтенда — `http://localhost:3000/api`.
- Backend URL можно переопределить через `VITE_API_BASE_URL=... npm run frontend:dev` или `frontend/.env`.
- Разрешенные CORS origins FastAPI можно переопределить через `CORS_ALLOW_ORIGINS` со списком origins через запятую; e2e-тесты используют это для динамического frontend-порта.
- Публичные маршруты: `/` для гостевого бронирования и `/owner` для кабинета владельца.

## Доменные Ограничения
- В приложении один заранее заданный владелец календаря; регистрации, входа и модели нескольких владельцев нет.
- Слоты бронирования рассчитываются динамически на ближайшие 14 дней; два бронирования не могут иметь одинаковое время начала даже для разных типов событий.
- Перед созданием гостевого бронирования нужно повторно проверять доступность слота; `409` использует код ошибки `slot_unavailable`.

## Рабочие Заметки
- Не редактируй `.github/workflows/hexlet-check.yml`; README workflow указывает, что файл сгенерирован и нужен Hexlet.
- При изменении API-операций обнови `api/main.tsp`, заново запусти `make api-openapi` и при необходимости поправь `frontend/src/api/client.ts` и `frontend/src/api/types.ts`.
- При изменении пользовательских сценариев обновляй e2e-тесты в `tests/` и описание сценариев в `tests/README.md`.
