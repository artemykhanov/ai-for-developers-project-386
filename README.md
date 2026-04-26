### Hexlet tests and linter status:
[![Actions Status](https://github.com/artemykhanov/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/artemykhanov/ai-for-developers-project-386/actions)

## CalKing

Приложение задеплоено на Render: https://calking.onrender.com

Фронтенд находится в отдельной директории `frontend/` и работает только через HTTP API по TypeSpec/OpenAPI контракту.
Backend находится в отдельной директории `backend/`, реализован на FastAPI и пока хранит данные в памяти процесса.
E2E-тесты находятся в отдельной директории `tests/` и используют Python, pytest и Playwright.

### Установка

```bash
npm install
npm --prefix frontend install
uv sync --project backend
```

Или через Makefile:

```bash
make install
```

E2E-зависимости и браузер Chromium устанавливаются отдельно:

```bash
make tests-install
```

### Mock API через Prism

Сначала TypeSpec компилируется в OpenAPI, затем Prism поднимает mock server на `http://localhost:3000`:

```bash
npm run frontend:mock:api
```

Файл контракта для Prism:

```text
tsp-output/@typespec/openapi3/openapi.yaml
```

### Запуск фронтенда

В отдельном терминале:

```bash
npm run frontend:dev
```

По умолчанию фронтенд использует API base URL:

```text
/api
```

### Запуск backend

Backend запускается на `http://localhost:8000`, API доступен под префиксом `/api`:

```bash
make backend-dev
```

То же самое без Makefile:

```bash
uv run --directory backend fastapi dev app/main.py
```

Данные backend хранятся в памяти и сбрасываются при перезапуске процесса.

### Запуск с отдельно поднятым backend

Создайте `frontend/.env` или передайте переменную окружения:

```bash
VITE_API_BASE_URL=http://localhost:3000/api npm run frontend:dev
```

Если backend запущен на другом адресе:

```bash
VITE_API_BASE_URL=http://localhost:8080/api npm run frontend:dev
```

Для локального FastAPI backend:

```bash
VITE_API_BASE_URL=http://localhost:8000/api npm run frontend:dev
```

### Проверка сборки

```bash
npm run frontend:build
```

Проверка backend:

```bash
make backend-check
```

### E2E-тесты

Тесты поднимают FastAPI backend и Vite frontend на свободных локальных портах, затем прогоняют браузерные сценарии через Playwright:

```bash
make tests-e2e
```

Сейчас покрыты сценарии публичного бронирования и создания типа события в кабинете владельца. Подробности описаны в `tests/README.md`.

### Реализованные сценарии

- `/` - публичное бронирование гостя: список типов событий, выбор слота, создание бронирования.
- `/owner` - кабинет владельца: профиль, список бронирований, CRUD типов событий.
