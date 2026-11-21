# TaskFlow

A small team task tracker built with a Spring Boot 3 REST API in Java 17 and a React 18 + TypeScript frontend bundled with Vite. It uses an in-memory H2 database for zero-setup execution and JWT for stateless authentication.

## How to Run

### Backend

Prerequisites: Java 17 and Maven (or the included `./mvnw` wrapper).

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`.
An H2 web console is enabled at `http://localhost:8080/h2-console` with JDBC URL `jdbc:h2:mem:taskflow` and user `sa` (empty password).
By default, a local development secret is used for JWT signing. You can override it by setting the `JWT_SECRET` environment variable.

### Frontend

Prerequisites: Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. Vite proxies `/api` calls directly to the Spring Boot backend on port 8080, avoiding CORS configuration during development.

## How to Run Tests

### Backend Tests

Runs unit tests for `TaskService` (JUnit 5 + Mockito) and context startup tests:

```bash
cd backend
./mvnw test
```

### Frontend Tests

Runs tests for components and pages using Vitest and React Testing Library:

```bash
cd frontend
npm test
```

## Sample Login

A data seeder automatically initializes sample users and tasks when the backend boots:

- Email: `alex@taskflow.dev`
- Password: `password123`

A second user (`sarah@taskflow.dev` / `password123`) is also seeded to test task assignments. You can also register a new account through the registration page.

## Architecture

The backend follows a classic layered architecture with strict separation of concerns:

- Controller layer (`com.taskflow.controller`): Handles HTTP routing, input validation via Jakarta Validation (`@Valid`), and HTTP response codes. Controllers never access repositories directly.
- Service layer (`com.taskflow.service`): Contains business logic, ownership checks, task status transitions, and overdue calculations. Entities are converted to DTO records before leaving this layer.
- Repository layer (`com.taskflow.repository`): Spring Data JPA repositories interfacing with the in-memory H2 database.
- Security layer (`com.taskflow.config`): Stateless Spring Security filter chain with a custom `JwtFilter` extending `OncePerRequestFilter`.

Data Transfer Objects (DTOs) are modeled as immutable Java records (`CreateTaskRequest`, `TaskResponse`, `AuthResponse`, etc.). Entities are never exposed directly to the API clients.

## Patterns Used

1. Repository Pattern: Spring Data JPA repositories abstract database access behind type-safe interfaces, isolating persistence logic from business services.
2. Strategy Pattern: A dedicated `TaskSortStrategy` encapsulates dynamic sorting resolution (mapping sort field names to JPA `Sort` properties and directions), keeping sorting decoupled and testable.
3. Controller Advice: Centralized exception handling using `@RestControllerAdvice` maps domain and validation exceptions into a uniform JSON error structure.

## Why React Query

I chose TanStack React Query (`@tanstack/react-query`) for frontend state management because server state and client state have different lifecycles. React Query handles cache invalidation, background refetching, and request deduplication out of the box. Mutating a task automatically invalidates both the board tasks and the project summary queries, keeping counts in sync without maintaining complex manual state in Redux or Context.

## Assumptions

- User Listing API (`GET /api/users`): Added a simple authenticated endpoint so the task creation and editing modal can display available team members in an assignee dropdown.
- Testing Library: Used Vitest instead of Jest on the frontend. Vitest shares the same syntax (`describe`, `it`, `expect`) and works natively with Vite's module resolution and TypeScript without extra Babel or ts-jest transformers.
- Soft Isolation: Each user can only view, create, edit, and delete tasks within projects they own. Cross-project modification attempts are blocked at the service layer.

## Trade-offs

- In-memory database: H2 in-memory mode requires zero setup for testing and demonstration, but all records reset when the application restarts.
- JWT storage: The token is stored in `localStorage` for simplicity in this take-home scope. In production, I would use httpOnly secure cookies to mitigate XSS risks.
- Dropdown status updates: Tasks use an explicit status dropdown instead of HTML5 drag-and-drop to keep the UI reliable, mobile-friendly, and accessible within the 45-minute explanation constraint.

## What I Would Do With More Time

1. Add refresh tokens with httpOnly cookies and token revocation.
2. Implement drag-and-drop column reordering on the board with optimistic UI updates.
3. Switch from H2 to PostgreSQL with Flyway database migrations for production deployments.
4. Add project collaborator roles (Owner, Editor, Viewer) instead of single-owner isolation.
