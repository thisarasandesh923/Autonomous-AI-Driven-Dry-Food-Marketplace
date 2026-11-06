# Seller dashboard integration

The authenticated `/seller/dashboard` screen now reads the actual FastAPI
`GET /seller/dashboard` response. Its existing bearer client and role guard are
reused. `/demo/seller/dashboard` remains an explicitly separate frontend preview.
No migrations, production records or authentication policies are changed.

## Response and ownership

The existing `message` and `user` fields are retained. The response also contains:

- `snapshot_at`: UTC snapshot time; `is_demo: false`.
- `inventory`: the seller's actual `ProductRead` records, ordered by ID.
- `summary.total_products`: count of those records, including zero-stock products.
- `summary.available_packs`: sum of their stored `stock_quantity` values. This is
  recorded inventory, not an invented reservation or order-adjusted balance.
- `profile`, `orders`, `forecast`, and unsupported summary metrics: `null`.
- `unavailable`: explanations for missing business profiles, approvals, currency,
  restock thresholds, revenue, orders and forecasts.

The server filters by the authenticated account ID. A supplied `seller_id` query
parameter cannot change ownership. Missing/invalid tokens receive 401; buyers
receive 403. The response excludes password hashes and other accounts' records.

The current product schema has a single `pack_size`, decimal `price`, and
`stock_quantity`, not variants or approval fields. The live inventory renders
those values directly. It does not label products approved/pending, assign USD,
or invent low-stock thresholds. Demo variant rendering remains supported only
for the explicit preview data.

## Run with your configured backend

From `backend/`, using Python 3.12 or another supported interpreter:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
# Configure .env using .env.example; preserve existing credentials.
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The existing `users` and `products` tables must already be present. This task
does not run database initialization or migrations. Products can be created via
the existing authenticated `POST /seller/products` API; the dashboard is read-only.

From `frontend/`, with dependencies installed:

```powershell
npm run dev -- --port 5173 --strictPort
```

Set `VITE_API_URL` for a non-default API origin. Sign in with a seller account at
`http://127.0.0.1:5173/login`; the application routes to `/seller/dashboard`.
That protected screen always uses the real API, including in development demo
mode. Buyer catalogue integration is separate and is not changed by this task.

## Isolated verification

```powershell
# backend/
.\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
.\.venv\Scripts\python.exe -m uvicorn tests.live_api:app --host 127.0.0.1 --port 8001
```

The test server redirects all existing database-using routers to temporary SQLite.
It never writes to PostgreSQL. The browser tests create their own test accounts
and products through the real authentication and seller-product APIs.

```powershell
# frontend/, with the isolated API running in another terminal
npm run build
npm run lint
npm test
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:DRYLEAF_LIVE_API = 'http://127.0.0.1:8001'
npm run test:e2e -- seller-integration.spec.js auth-integration.spec.js
```

The older `marketplace.spec.js` suite expects a different seeded catalogue and
variant contract. It is not the integration suite for the current backend.
Real PostgreSQL connectivity and production data still need deployment verification.
