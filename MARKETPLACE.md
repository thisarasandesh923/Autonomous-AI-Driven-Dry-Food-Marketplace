# Ceylon Pantry — current implementation

> **Current team workflow: frontend development only.** The frontend now previews
> all three screens using isolated local demo services, with no API/database needed.
> Follow [frontend/README.md](frontend/README.md) and
> [frontend/API_CONTRACTS.md](frontend/API_CONTRACTS.md). Backend instructions below
> are historical from the earlier integration work; do not run migrations or change
> backend files for frontend preview. Earlier backend changes remain for team review.

Implemented locally on the existing `feature/seller-dashboard` branch. No commit,
push, production data seeding, or production migration was performed.

## Run with the existing PostgreSQL database

From the repository root, in PowerShell:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
# Configure backend/.env from .env.example if it does not exist.
# Preserve existing DB_* values and JWT_SECRET_KEY.
.\.venv\Scripts\python.exe migrate_catalogue.py
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The explicit migration adds `seller_profiles`, `products`, and `product_variants`
only when absent. It does not alter, delete, or reset existing tables/records.
Run it once before accessing the new APIs; running it again is safe. It is not
an automatic schema evolution tool for future changes to these tables.

In another terminal:

```powershell
cd frontend
npm.cmd ci
# Optional frontend/.env: VITE_API_URL=http://127.0.0.1:8000
npm.cmd run dev -- --port 5173 --strictPort
```

Open `/products`, `/products/<id>`, `/login`, or `/seller/dashboard` at
`http://127.0.0.1:5173`. An empty production catalogue is intentional until real
approved seller profiles, products, and variants are provisioned. There are no
product/stock mutation endpoints in this phase. Registration does not invent a
business profile or automatically approve a seller.

Backend variables remain `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD`, `JWT_SECRET_KEY`, and optional `CORS_ORIGINS`. No secrets belong
in frontend variables. No new runtime dependencies were added.

## Disposable demonstration

To explore six explicitly labelled sample products without touching PostgreSQL,
stop the normal API and run this from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn tests.live_api:app --host 127.0.0.1 --port 8000
```

This uses a temporary SQLite database and seeds demo data only in that database.
Two **test-only** seller accounts are `demo-seller-1@example.com` and
`demo-seller-2@example.com`, password `DemoPassword123!`. Never deploy this test
server. Data disappears with its temporary database. Orders, revenue and
forecasts are unavailable even in this fixture; they are never faked as live data.

## API contract

- `GET /products`: public approved/active USD listings from approved sellers.
  Query parameters: `q`, repeated `category`, repeated integer `seller`,
  `min_price`/`max_price` in integer minor units, `in_stock` (default true),
  ISO destination code (default GB), `sort` (`featured`, `price_asc`,
  `price_desc`, `name`), `page`, `page_size` (1–48).
  Search covers name, description, ingredients and public seller name.
  Server filtering/sorting precedes pagination. Facet counts and price bounds
  describe all visible destination-eligible listings before optional filters.
  Price filters qualify a variant; `display_variant` identifies the matching
  minimum-priced variant used for card display and sorting.
- `GET /products/{id}`: public details, variants, seller facts, and up to four
  destination-eligible/in-stock related products, preferring the same category.
  Destination restrictions do not hide public facts; purchasing eligibility is
  displayed separately. Missing/unapproved/inactive listings return 404.
- `GET /seller/dashboard`: existing bearer/role protection retained. Includes
  account, snapshot timestamp, optional business profile, own products/variants,
  aggregate available packs, approved count and low-stock product count. Stock
  is the stored available quantity; no reservation/order deduction is simulated.
  Products are low-stock if any variant is below its restock threshold.
  Unconnected metrics, orders and forecast are null, not zero. Caller-supplied
  seller IDs do not affect ownership. Original `message` and `user` remain.
  The destination query defaults to GB and limits the inventory snapshot to
  products eligible for that destination, matching the dashboard context.

Product prices are integers in minor units; images are ordered `{url, alt}`
records. `is_demo` is returned explicitly. No product photographs were available
as standalone source assets, so the UI uses deliberate placeholders.

The initial service evaluates eligible rows in Python on the server, after a
bounded number of SQL reads. This is suitable for the current small catalogue;
move predicates and pagination into optimized PostgreSQL queries before scale.
The response format need not change.

## Frontend behavior

The explicit dependency-free route dispatcher uses one native-history navigation
module. Public product routes remain accessible while signed in. Protected buyer
and seller dashboards retain role-based redirects. Unknown routes render 404.
Authentication pages, styles, token persistence, and `/auth/me` restoration remain.

Catalogue filters/search/sorting/page are URL state. Product links carry the
catalogue origin and scroll in history state. Browser Back and the explicit
return action restore them, including after detail reload. New-tab product links
cannot inherit browser history state and fall back to the catalogue root.

Destination/currency are currently UK/USD, matching supplied designs. Wishlist,
cart, contact, AI, settings, payments and management actions are visibly deferred.
Circular product-card `+` links open product selection rather than imply an add.
Forecast chart rendering is present and tested, with a table alternative; no
chart is shown without supplied forecast data. No forecasting engine was added.

Marketplace CSS is scoped separately from authentication tokens. Desktop follows
the supplied exports; tablet/mobile layouts are implementation adaptations.

## Verification commands

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
# Leave this process running for browser tests:
.\.venv\Scripts\python.exe -m uvicorn tests.live_api:app --host 127.0.0.1 --port 8001
```

```powershell
cd frontend
npm.cmd run build
npm.cmd run lint
npm.cmd test
$env:PLAYWRIGHT_CHANNEL='msedge'
$env:DRYLEAF_LIVE_API='http://127.0.0.1:8001'
npm.cmd run test:e2e
```

Live browser tests use the default frontend API URL and forward requests to the
isolated server. Browser binaries must be available; installed Edge was used.
Screenshots and traces are written under ignored `frontend/test-results/`.
Backend tests use isolated SQLite. PostgreSQL connectivity, production data and
the new migration against PostgreSQL still require the real configured database.

## Verified results

- Frontend production build: passed.
- ESLint with zero warnings: passed.
- Frontend unit/component tests: 29 passed across six files.
- Browser tests in installed Microsoft Edge: 23 passed. Includes live API buyer
  and seller registration/login/restoration/logout, role guards, public catalogue,
  filters/sorting, product detail quantity and tabs, URL/scroll restoration,
  error/retry/empty/404 states, and accessibility/no-horizontal-overflow checks
  for all three new screens at 1440px, 768px and 390px.
- Backend tests: eight passed, including listing visibility, filter/sort before
  pagination, matching variant pricing, seller ownership, and repeatable additive
  migration preserving an existing user.
- `git diff --check`: passed. Git reports normal Windows line-ending notices.
- Backend TestClient emitted one dependency deprecation warning for httpx; tests
  still passed. No dependency changes were introduced.

Live browser tests used the disposable SQLite API, not the configured PostgreSQL
database. The production migration was not run. Authentication source components,
AuthLayout, API client, token handling, original CSS tokens and backend auth/core
were verified unchanged.

## File inventory

Created files:

- `MARKETPLACE.md`
- `backend/app/models/catalogue.py`
- `backend/app/routers/products.py`
- `backend/app/schemas/catalogue.py`
- `backend/app/services/__init__.py`
- `backend/app/services/catalogue.py`
- `backend/migrate_catalogue.py`
- `backend/tests/__init__.py`
- `backend/tests/demo_data.py`
- `backend/tests/test_catalogue.py`
- `frontend/e2e/marketplace.spec.js`
- `frontend/src/api/useResource.js`
- `frontend/src/app/navigation.js`
- `frontend/src/components/Link.jsx`
- `frontend/src/components/marketplace/Icon.jsx`
- `frontend/src/components/marketplace/States.jsx`
- `frontend/src/features/catalogue/api.js`
- `frontend/src/features/catalogue/components/CatalogueFilters.jsx`
- `frontend/src/features/catalogue/components/ProductCard.jsx`
- `frontend/src/features/catalogue/components/ProductGallery.jsx`
- `frontend/src/features/catalogue/components/ProductInformation.jsx`
- `frontend/src/features/catalogue/components/ProductPurchasePanel.jsx`
- `frontend/src/features/seller/api.js`
- `frontend/src/features/seller/components/DemandForecastChart.jsx`
- `frontend/src/features/seller/components/DemandForecastChart.test.jsx`
- `frontend/src/features/seller/components/SellerForecastPanel.jsx`
- `frontend/src/features/seller/components/SellerKpiGrid.jsx`
- `frontend/src/features/seller/components/SellerSummaries.jsx`
- `frontend/src/layouts/BuyerLayout.jsx`
- `frontend/src/layouts/SellerLayout.jsx`
- `frontend/src/pages/NotFoundPage.jsx`
- `frontend/src/pages/buyer/CataloguePage.jsx`
- `frontend/src/pages/buyer/ProductDetailsPage.jsx`
- `frontend/src/pages/seller/SellerDashboardPage.jsx`
- `frontend/src/styles/marketplace.css`

Modified files:

- `INTEGRATION.md`
- `backend/app/main.py`
- `backend/app/routers/seller.py`
- `backend/tests/live_api.py`
- `backend/tests/test_auth.py`
- `frontend/README.md`
- `frontend/e2e/auth-integration.spec.js`
- `frontend/src/app/App.jsx`
- `frontend/src/app/App.test.jsx`
- `frontend/src/main.jsx`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/test/setup.js`
