# Frontend-only change inventory

This inventory describes the frontend-only direction-change task, separately
from earlier implementation changes already present in the working tree.

## Created in this task

- `frontend/API_CONTRACTS.md`
- `frontend/FRONTEND_ONLY_CHANGELOG.md`
- `frontend/src/config/dataMode.js`
- `frontend/src/config/dataMode.test.js`
- `frontend/src/mocks/data.js`
- `frontend/src/mocks/catalogueService.js`
- `frontend/src/mocks/catalogueService.test.js`
- `frontend/src/mocks/sellerService.js`
- `frontend/src/assets/demo/product-view.svg`
- `frontend/src/assets/demo/pack-view.svg`
- `frontend/src/assets/demo/detail-view.svg`
- `frontend/src/components/marketplace/DemoBanner.jsx`
- `frontend/src/features/catalogue/apiService.js`
- `frontend/src/pages/seller/SellerPreviewPage.jsx`
- `frontend/e2e/frontend-demo.spec.js`

## Modified in this task

- `frontend/.env.example` — documents optional data-mode selection, no actual environment file changes.
- `frontend/README.md` — frontend-only startup and test instructions.
- `frontend/src/app/App.jsx` — explicit, demo-only seller preview route.
- `frontend/src/features/catalogue/api.js` — selects the isolated demo or real service.
- `frontend/src/layouts/BuyerLayout.jsx` — demo banner on mock-backed buyer screens.
- `frontend/src/layouts/SellerLayout.jsx` — demo banner for seller preview.
- `frontend/src/pages/seller/SellerDashboardPage.jsx` — preview service/identity without authentication mutation.
- `frontend/src/features/seller/components/SellerKpiGrid.jsx` — labelled sample KPI presentation.
- `frontend/src/features/seller/components/SellerSummaries.jsx` — labelled sample order/status and inventory summaries.
- `frontend/src/features/seller/components/SellerForecastPanel.jsx` — synthetic forecast metadata and labels.
- `frontend/src/features/seller/components/DemandForecastChart.jsx` — period labels.
- `frontend/src/features/seller/components/DemandForecastChart.test.jsx` — table-specific assertion after period labels added.
- `frontend/src/styles/marketplace.css` — demo presentation and wrapping gallery thumbnails.

Documentation-only notices were added to root `INTEGRATION.md` and `MARKETPLACE.md`
to mark earlier backend setup instructions as historical and point to the current
frontend-only workflow. No authentication source, API client, semantic tokens,
package manifest, lockfile, or dependencies were changed in this task.

## Earlier backend changes retained unchanged

Modified before this task:

- `backend/app/main.py`
- `backend/app/routers/seller.py`
- `backend/tests/live_api.py`
- `backend/tests/test_auth.py`

New files already present before this task:

- `backend/app/models/catalogue.py`
- `backend/app/routers/products.py`
- `backend/app/schemas/catalogue.py`
- `backend/app/services/__init__.py`
- `backend/app/services/catalogue.py`
- `backend/migrate_catalogue.py`
- `backend/tests/__init__.py`
- `backend/tests/demo_data.py`
- `backend/tests/test_catalogue.py`

These files were reported and left untouched. They were not reverted, deleted,
reset, executed or expanded during the frontend-only task. Backend file hashes
were compared with the task-start snapshot to verify this.
