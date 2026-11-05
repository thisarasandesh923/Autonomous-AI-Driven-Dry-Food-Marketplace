# DryLeaf application integration

> Frontend-only development is now the active workflow. Use
> [frontend/README.md](frontend/README.md) for API-free previews and
> [frontend/API_CONTRACTS.md](frontend/API_CONTRACTS.md) for future integration.
> The backend instructions below are historical, not prerequisites for UI preview.

The marketplace screens and additive catalogue API are now implemented. See
[MARKETPLACE.md](MARKETPLACE.md) for current routes, schema migration, run commands,
demo isolation, contracts, and verification. The sections below document the
original authentication integration and its historical verification results.

The existing `integration/auth-frontend` branch already contains both Git merges.
The login and registration UI, artwork, typography, colors, and responsive styles
are retained. There were no dashboard pages or React Router dependency in this
checkout. Buyer and seller routes now use a minimal dashboard view built from the
existing layout and controls, displaying the real API message and user profile.

## Run locally (PowerShell, from repository root)

Use an installed Python 3.10+ interpreter and Node compatible with Vite 8.
On this machine the working Python executable is
`C:\Users\SINETH MUTHUMALA\AppData\Local\Python\bin\python.exe`;
the `python` and `py` WindowsApps aliases did not launch. Substitute that full
path (with PowerShell's `&` operator) if necessary. A local backend `.venv`
was already created during verification.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` with the existing PostgreSQL database settings and a strong,
random JWT secret. Do not overwrite an existing `.env`. Required variables are
`DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET_KEY`; defaults are
`DB_HOST=localhost` and `DB_PORT=5432`. `CORS_ORIGINS` is a comma-separated list
of allowed browser origins; the example permits only the two Vite local origins.
Set explicit deployment origins in production.

```powershell
# In backend/, with PostgreSQL running and the existing users table available:
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

No database initialization or destructive operation is run by the integration.
`create_tables.py` was inspected but not executed. If the existing database is
missing its schema, arrange schema initialization separately before running.

In a second terminal, from the repository root:

```powershell
cd frontend
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev -- --port 5173 --strictPort
```

`frontend/.env` contains only `VITE_API_URL=http://127.0.0.1:8000`.
Restart Vite after changing it. Never put backend secrets in `VITE_*` variables.
Open `http://127.0.0.1:5173`. Production frontend hosting must serve `index.html`
for application routes such as `/login`, `/register`, and `/buyer/dashboard`.

## Authentication and API contract

`src/api/client.js` provides JSON GET/POST methods, bearer headers, cancellation,
network errors, and FastAPI error parsing. Registration maps `fullName` to `name`
and sends one role, `buyer` or `seller`. Success navigates to `/login`.
Login reads `{ access_token, token_type, user }` from the existing endpoint.

`AuthProvider` owns the token and user. Only the token persists in `sessionStorage`
(per tab, surviving reloads); passwords and user details are not persisted.
Storage failures fall back to memory. On reload, `/auth/me` retrieves the user
before protected content is rendered. Storage is accessible to JavaScript, so
preventing XSS remains necessary. An HttpOnly cookie approach would require a
different backend contract. The existing backend issues HS256 JWTs with a
30-minute expiry and no refresh/revocation endpoint; logout clears the browser
session, and expired tokens require login again.

The existing native-history routing is retained. Authenticated users are routed
to `/{role}/dashboard`; visiting the other role's route safely redirects to their
own dashboard. Unauthenticated protected visits go to `/login`. Dashboard requests
use the corresponding backend endpoint through the authenticated client. The
backend still checks the role from the database on each protected request.

Protected 401 responses clear the session. A 403 displays the backend access
message without logging out. Registration conflicts (409), field validation
(422), invalid credentials, and network failures appear in the existing notices.
Network failure during session restoration offers retry without deleting the
stored session.

## Verification

```powershell
cd frontend
npm.cmd run build
npm.cmd run lint
npm.cmd test
$env:PLAYWRIGHT_CHANNEL='msedge' # Or install Playwright Chromium and omit this.
npm.cmd run test:e2e
```

Normal browser tests cover layout, accessibility, keyboard behavior, and mocked
API failures. Live API tests are skipped unless explicitly enabled.

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
```

Backend tests use isolated SQLite and the real hashing, JWT, schemas, routes, and
authorization dependencies. They never write to the configured PostgreSQL DB.

For real browser-to-FastAPI tests, start the disposable API in a separate terminal:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn tests.live_api:app --host 127.0.0.1 --port 8001
```

Then, in `frontend/` with the default Vite API URL:

```powershell
$env:PLAYWRIGHT_CHANNEL='msedge'
$env:DRYLEAF_LIVE_API='http://127.0.0.1:8001'
npm.cmd run test:e2e -- auth-integration.spec.js
```

This fixture uses a temporary SQLite file and a generated test secret; it does
not alter PostgreSQL settings or records. Stop it after testing. PostgreSQL
connectivity and persistence still require verification with actual credentials.

## Results in this checkout

- Production frontend build and ESLint: passed.
- Frontend component/application/API tests: 27 passed.
- Responsive/accessibility/browser tests in installed Microsoft Edge: 14 passed.
- Live browser-to-FastAPI account flows against disposable SQLite: 2 passed.
- Backend API tests against isolated SQLite: 3 passed.
- PostgreSQL: not verified; no backend `.env` was present and neither IPv4 nor
  IPv6 localhost accepted a connection on port 5432.
- npm installation reported four moderate dependency vulnerabilities. No forced
  dependency upgrades were applied.
- Backend tests emitted a Starlette TestClient deprecation warning for httpx;
  this did not fail the tests.

No push, merge, branch creation, or existing database modification was performed.
