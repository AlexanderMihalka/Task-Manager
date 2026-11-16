# Task Manager

A personal task manager with a REST API, JWT authentication, a Next.js web interface, tests, and one-command startup via Docker Compose.

![Task list](docs/screenshots/tasks-list.png)

## Features

- Sign up with email and password; logging in returns a JWT. Passwords are stored only as bcrypt hashes.
- Task CRUD: title, description, status (`todo` / `in_progress` / `done`), priority (`low` / `medium` / `high`), deadline, created and updated timestamps.
- Every user sees and changes only their own tasks. Someone else's task returns `403`.
- Filtering by status and priority, search by title, sorting by creation date or deadline, pagination (`limit` / `offset`).
- Clear `400 / 401 / 403 / 404 / 422` errors.
- UI: task cards, a modal form, one-click status change, delete with confirmation, loading and empty states, responsive layout, soft pastel colors that are easy on the eyes.
- The interface is available in Ukrainian and English. Switch with the UK / EN buttons; the choice is remembered in the browser.

## Tech stack

| Layer | Technologies |
|---|---|
| API | Python 3.14, FastAPI, Pydantic v2 |
| Database | PostgreSQL 16, SQLAlchemy 2, Alembic, psycopg 3 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Tests | pytest, httpx (TestClient) |
| Frontend | Next.js (React), Tailwind CSS |
| Infrastructure | Docker, Docker Compose, GitHub Actions |

## Architecture

```
 Browser ──► frontend (Next.js, :3000)
    │
    └──────► api (FastAPI, :8000) ──► db (PostgreSQL, :5432)
              JWT in the                  users 1 ──< * tasks
              Authorization header
```

Data model:

```
users                          tasks
├── id (PK)                    ├── id (PK)
├── email (unique)             ├── owner_id (FK → users.id, ON DELETE CASCADE)
├── password_hash              ├── title, description
└── created_at                 ├── status, priority
                               ├── due_date
                               └── created_at, updated_at
```

## Getting started

You need Docker and Docker Compose.

```bash
cp .env.example .env     # change the secrets if needed
docker compose up --build
```

On Windows PowerShell, `cp` works as well (it is an alias for `Copy-Item`). Docker Desktop must be running.

Once everything is up:

| Service | URL |
|---|---|
| Web interface | http://localhost:3000 |
| API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

The API has no page at `http://localhost:8000/`, so opening the bare address returns `404`. Use `/docs` or `/health` instead.

Alembic migrations are applied automatically when the `api` container starts. Without a `.env` file everything still starts with default values, but for anything other than local development set your own `SECRET_KEY`:

```bash
# macOS / Linux
openssl rand -hex 32

# any OS with Python (including Windows)
python -c "import secrets; print(secrets.token_hex(32))"
```

> `NEXT_PUBLIC_API_URL` is baked into the frontend at build time. If you change it, run with `--build`.

### Running without Docker (for development)

API (needs a running PostgreSQL; use `localhost` as the host in `DATABASE_URL`):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://taskmanager:taskmanager@localhost:5432/taskmanager
export SECRET_KEY=dev-secret
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend
pytest
```

The tests run on in-memory SQLite, so PostgreSQL is not required. They cover registration, login, CRUD, filters, search, sorting, pagination, and the inaccessibility of other users' tasks. In CI the migrations are additionally run against a real PostgreSQL (`alembic upgrade head` and `alembic check`).

## Request examples

```bash
# register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# log in: the response contains access_token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

TOKEN=<access_token from the previous response>

# create a task
curl -X POST http://localhost:8000/tasks \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title": "Prepare the report", "priority": "high", "due_date": "2026-12-01T18:00:00Z"}'

# list with filters, search and pagination
curl "http://localhost:8000/tasks?status=todo&priority=high&q=report&sort=due_date&limit=20&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# change the status (PATCH updates only the fields you send)
curl -X PATCH http://localhost:8000/tasks/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# delete
curl -X DELETE http://localhost:8000/tasks/1 -H "Authorization: Bearer $TOKEN"
```

## REST API

| Method and URL | Description | Access |
|---|---|---|
| `POST /auth/register` | Register | public |
| `POST /auth/login` | Log in, get a JWT | public |
| `GET /auth/me` | Current user | token |
| `POST /tasks` | Create a task | token |
| `GET /tasks` | List your tasks | token |
| `GET /tasks/{id}` | Get one task | token, owner |
| `PATCH /tasks/{id}` | Update a task | token, owner |
| `DELETE /tasks/{id}` | Delete a task | token, owner |
| `GET /health` | Health check | public |

`GET /tasks` parameters: `status`, `priority`, `q` (search by title), `sort` (`-created_at`, `created_at`, `due_date`, `-due_date`), `limit` (1–100, default 20), `offset`. The response looks like `{ "items": [...], "total": 42, "limit": 20, "offset": 0 }`. Tasks without a deadline always come last when sorting by deadline.

Status codes: `400` for an empty update, `401` for a missing or invalid token, `403` for another user's task, `404` for a missing task, `422` for validation errors. Error messages returned by the API are in Ukrainian; the web interface translates the known ones into the selected language.

Full interactive documentation: `/docs` (Swagger UI) and `/redoc`.

<!-- Add a Swagger UI screenshot: docs/screenshots/swagger.png
![Swagger UI](docs/screenshots/swagger.png) -->

## Interface screenshots

The screenshots show the Ukrainian version of the interface.

| Sign in | Task form |
|---|---|
| ![Sign in](docs/screenshots/login.png) | ![Task form](docs/screenshots/task-form.png) |

| Validation errors | Delete confirmation |
|---|---|
| ![Validation](docs/screenshots/register-validation.png) | ![Confirmation](docs/screenshots/delete-confirm.png) |

Mobile version:

<img src="docs/screenshots/tasks-mobile.png" alt="Mobile version" width="300">

## Repository structure

```
task-manager/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI entry point, CORS
│   │   ├── config.py      # settings from env
│   │   ├── database.py    # database connection
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── security.py    # hashing, JWT
│   │   ├── deps.py        # "current user" dependency
│   │   └── routers/       # auth.py, tasks.py
│   ├── alembic/           # migrations
│   ├── tests/             # conftest.py, test_auth.py, test_tasks.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/               # login, register, tasks
│   ├── components/        # TaskCard, TaskForm, Filters, Modal, LangSwitch, ...
│   ├── lib/               # api.js (REST client), auth, dates, i18n.js (UK/EN strings)
│   └── Dockerfile
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env.example
├── README.md              # this file (English)
└── README.uk.md           # Ukrainian version
```

## Environment variables

| Variable | Purpose |
|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | PostgreSQL credentials |
| `DATABASE_URL` | Connection string the API uses to reach the database |
| `SECRET_KEY` | Secret used to sign JWTs |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default 60) |
| `CORS_ORIGINS` | Frontend origins, comma-separated |
| `NEXT_PUBLIC_API_URL` | API address as seen by the browser |

## Troubleshooting

- **"Couldn't reach the server. Check that the API is running."** The browser can't reach the API. Run `docker compose ps -a` and `docker compose logs api` to see whether the `api` container is up.
- **`404 Not Found` at `http://localhost:8000/`.** Expected: the API has no root page. Open `/docs` or `/health`.
- **Changed `NEXT_PUBLIC_API_URL` but nothing happened.** It is applied at build time; run `docker compose up --build`.

## Known limitations

- The JWT is stored in `localStorage`. That is acceptable for a learning project; in production an httpOnly cookie is a better choice.
- There are no refresh tokens: when the token expires, the user is redirected to `/login`.
- The language switcher translates the web interface only; API error texts come from the backend in Ukrainian and are translated on the frontend only for known messages.
