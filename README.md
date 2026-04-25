### Hexlet tests and linter status:
[![Actions Status](https://github.com/artemykhanov/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/artemykhanov/ai-for-developers-project-386/actions)

## Booking Frontend

Фронтенд находится в отдельной директории `frontend/` и работает только через HTTP API по TypeSpec/OpenAPI контракту.

### Установка

```bash
npm install
npm --prefix frontend install
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
http://localhost:3000/api
```

### Запуск с отдельно поднятым backend

Создайте `frontend/.env` или передайте переменную окружения:

```bash
VITE_API_BASE_URL=http://localhost:3000/api npm run frontend:dev
```

Если backend запущен на другом адресе:

```bash
VITE_API_BASE_URL=http://localhost:8080/api npm run frontend:dev
```

### Проверка сборки

```bash
npm run frontend:build
```

### Реализованные сценарии

- `/` - публичное бронирование гостя: список типов событий, выбор слота, создание бронирования.
- `/owner` - кабинет владельца: профиль, список бронирований, CRUD типов событий.
