# TaskFlow

A small team task tracker. Spring Boot (Java) REST API (`backend/`) and a React + TypeScript frontend (`frontend/`).

## Run the backend

Needs Java 17 and Maven.

```
cd backend
mvn spring-boot:run
```

Runs on http://localhost:8080. Uses an in-memory H2 database, so data resets on restart.
Optional: set `JWT_SECRET` as an environment variable (a dev default is used otherwise).

## Run the frontend

Needs Node 18+.

```
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173. Calls to `/api` are proxied to the backend.

## Run the tests

```
cd backend && mvn test
cd frontend && npm test
```

## Sample login

TODO (added with seed data)

## Architecture

TODO

## Patterns used

TODO

## State management choice

TODO

## Assumptions and trade-offs

- Frontend tests use Vitest instead of Jest. It has the same API (describe / it / expect) and works directly with Vite, so no extra config is needed.

## What I would do next

TODO
