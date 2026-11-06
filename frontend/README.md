# Ceylon Pantry — frontend-only development

The current team workflow develops the frontend independently. Do not start or
modify FastAPI/PostgreSQL, run migrations, or use backend demo fixtures to preview
these screens. Earlier backend changes remain in the working tree for team review;
they were neither reverted nor modified in the frontend-only task.

## Start the frontend

From the repository root in PowerShell:

```powershell
cd frontend
$env:VITE_DATA_MODE='demo'
npm.cmd run dev -- --port 5173 --strictPort
```

If Vite is already running, stop it with Ctrl+C and restart so the mode is clear.
Existing dependencies are sufficient; no new dependencies were added. On a fresh
checkout, install the existing lockfile with `npm.cmd ci` first.

Exact preview URLs:

- Catalogue: http://127.0.0.1:5173/products
- Details (existing frontend demo product 1): http://127.0.0.1:5173/products/1
- Seller preview: http://127.0.0.1:5173/demo/seller/dashboard

The seller preview is deliberately separate from `/seller/dashboard`, which
retains real JWT/role protection. No demo login, fake token, registration, or
persistent transaction is created. Login/registration and the AuthProvider
continue using the real API; backend access is needed only to exercise actual
account authentication, not to preview the three screens.

## Demo data isolation

- `src/config/dataMode.js`: development defaults to demo; production and unit tests
  default to API mode. `VITE_DATA_MODE` explicitly selects demo or api.
- `src/mocks/data.js`: labelled sample products/variants, seller identity, order,
  inventory and synthetic forecast. None is presented as production business data.
- `src/mocks/catalogueService.js`: in-memory search/filter/sort before pagination,
  detail lookup and related products. Responses are cancellable and cloned.
- `src/mocks/sellerService.js`: read-only sample dashboard response.
- `src/assets/demo/`: intentional SVG placeholders, not product photographs.
- `features/catalogue/apiService.js`: real HTTP implementation using the existing
  API client. It does not import fixtures or fall back silently on request failure.
- The seller preview is lazy-loaded; the authenticated seller service is unchanged.

All mock-backed pages show DEMO DATA. Cart, wishlist, contact, AI, payment and
management mutations remain unavailable. Quantity and variants update only a
local displayed subtotal. Mock services never call fetch, write browser storage,
or perform backend operations. Changing mock fixtures affects previews only.

Catalogue search, filters, sorting and pagination are URL state. Details preserve
origin URL and scroll through browser history, including detail reload and Back.
Direct/new-tab details without origin state return to the catalogue root.

## Future backend integration

See [API_CONTRACTS.md](API_CONTRACTS.md) for the proposed schemas and unresolved
team decisions. To explicitly use the real services later:

```powershell
$env:VITE_DATA_MODE='api'
$env:VITE_API_URL='http://127.0.0.1:8000'
npm.cmd run dev -- --port 5173 --strictPort
```

Changing environment values requires restarting Vite. Production builds default
to API mode. If a different backend shape is agreed, adapt the feature service
layer; UI components should keep their existing view-data shape. No backend
endpoint is implemented as part of this frontend-only work.

## Frontend verification

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
$env:VITE_DATA_MODE='demo'
$env:PLAYWRIGHT_CHANNEL='msedge'
Remove-Item Env:DRYLEAF_LIVE_API -ErrorAction SilentlyContinue
npm.cmd run test:e2e
```

Use installed Edge, or an already available Playwright browser. No database or
API process is required. Live-API test files remain opt-in and are skipped when
DRYLEAF_LIVE_API is absent. Frontend demo tests assert no API requests/token
creation, interactions, routes, query/scroll restoration, and accessibility at
1440px, 768px and 390px. Existing authentication unit and browser tests remain.

## Design and structure

Official Figma file: eZh7aN3OQ5Glv2JKg0EOzr. Catalogue 5:2275, Product Details
5:2500, Seller Dashboard 5:2710. Supplied exports remain the visual reference.
Cream/terracotta, DM Serif Display, Inter, local fonts, existing semantic Tailwind
tokens and authentication artwork are retained. Responsive adaptations are tested;
mobile frames were not supplied. No new global state or styling dependency exists.

Original authentication references used file RUAeTIAlYdTFPZIE4l2tmX, frames
2024:2 and 2024:24. Those completed pages remain unchanged.

## Verified frontend-only results

- Production build: passed (defaults to real API mode).
- ESLint: passed with zero warnings.
- Vitest: 37 tests passed in eight files.
- Browser suite in Microsoft Edge: 20 passed, nine live-backend tests explicitly
  skipped. The six new frontend demo tests require no API/database; existing
  login/registration browser checks also passed using their HTTP stubs.
- All three preview screens passed responsive/accessibility checks at 1440px,
  768px and 390px. Screenshots are under ignored `test-results/`.
- Backend file hashes matched the snapshot from before this frontend-only task.
  No backend tests, servers, migrations, environment edits, or dependency commands
  were run. Earlier backend changes remain untouched for team review.

See [FRONTEND_ONLY_CHANGELOG.md](FRONTEND_ONLY_CHANGELOG.md) for every frontend file
created/modified in this task and the complete pre-existing backend change list.
