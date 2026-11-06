# Future backend integration contracts

These are frontend expectations for agreement with the backend developer, not
claims that the teammate's branch already implements them. No backend work was
performed in the frontend-only task. Existing backend changes from earlier work
remain untouched for team review.

## Source selection and authentication

- `npm.cmd run dev` defaults to isolated frontend demo data.
- Production builds and Vitest default to `api` mode.
- Explicit `VITE_DATA_MODE=demo` or `VITE_DATA_MODE=api` overrides the default.
- API mode uses `src/api/client.js` and `VITE_API_URL`; it never falls back to demo
  data if the server fails. Change adapters in `features/catalogue/apiService.js`
  and `features/seller/api.js` if agreed response names differ.
- Mock fixtures/services live only under `src/mocks/`, loaded separately.
- `/demo/seller/dashboard` is enabled only in demo mode and is not an authenticated
  seller route. It creates no token/user/session and calls no seller endpoint.
- `/seller/dashboard` remains protected and always uses the real authenticated
  service. Login, registration and `/auth/me` are never mocked by the application.

## Existing authentication contract (preserved)

| Endpoint | Input | Response / requirement |
| --- | --- | --- |
| POST `/auth/register` | `{name,email,password,role}` with one buyer/seller role | `{message,user:{id,name,email,role}}`; 201; then login |
| POST `/auth/login` | `{email,password}` | `{access_token,token_type:"bearer",user:{id,name,email,role}}` |
| GET `/auth/me` | Bearer JWT | `{id,name,email,role}` |
| GET `/buyer/dashboard` | Buyer bearer JWT | Existing `{message,user}` |

The existing AuthProvider owns token/sessionStorage, restoration, logout and
protected 401 handling. Preserve 403 without automatic logout. No frontend demo
login credentials exist. Frontend tests may intercept HTTP; the application does
not intercept authentication requests.

## Public catalogue

`GET /products`: public read; no token required.

| Query | Meaning |
| --- | --- |
| `q` | Search product name, description, ingredients and public seller name |
| Repeated `category` | Category values; OR within the group |
| Repeated `seller` | Stable seller identifiers; OR within the group |
| `min_price`, `max_price` | Integer USD minor units, inclusive, matching the same variant |
| `in_stock` | Boolean; defaults true |
| `destination` | Country code; current UI uses GB |
| `sort` | `featured`, `price_asc`, `price_desc`, `name` |
| `page`, `page_size` | One-based page; page size 1–48, default 12 |

Filter/sort the full result set before pagination on the eventual backend.
The frontend mock service applies the same order locally for preview only.
Cards and price ordering must use the qualifying `display_variant`.

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 12,
  "pages": 0,
  "destination": "GB",
  "currency": "USD",
  "facets": {
    "categories": [{"value":"Dried fruits","count":1}],
    "sellers": [{"id":1,"name":"Public business name","count":1}],
    "eligible_count": 1,
    "in_stock_count": 1,
    "min_price": 350,
    "max_price": 1800
  }
}
```

Facet values/counts currently describe visible destination-eligible listings
before optional search/filter groups. Confirm this rule with the backend team.
Only active, approved products from approved sellers should appear publicly.
Destination eligibility is authoritative and cannot be bypassed through UI state.

## Product shape and details

`GET /products/{productId}?destination=GB`: public read. Return the product plus
`related`, an array of up to four eligible in-stock product summaries. Return 404
for missing or no-longer-public listings. Public facts may still be displayed
when the selected destination is ineligible; UI shows that restriction.

```json
{
  "id": 1,
  "name": "Product name",
  "description": "Seller description",
  "category": "Spices & spice mixes",
  "origin": "Matale, Sri Lanka",
  "ingredients": "Seller-provided ingredients",
  "facts": {"Allergens":"Not provided","Net weight":"100 g"},
  "images": [{"url":"/media/product.jpg","alt":"Product and pack description"}],
  "destinations": ["GB"],
  "shipping": "Seller-provided shipping information",
  "returns": "Seller-provided return terms",
  "currency": "USD",
  "approved": true,
  "active": true,
  "is_demo": false,
  "seller": {"id":1,"name":"Business name","location":"Matale, Sri Lanka","description":"Public description","approved":true},
  "variants": [{"id":10,"pack":"100 g","price_minor":800,"stock":82,"restock_threshold":15}],
  "display_variant": {"id":10,"pack":"100 g","price_minor":800,"stock":82,"restock_threshold":15},
  "related": []
}
```

`display_variant` is used for listing cards and can be omitted on details.
`related` is only needed on details. Empty images produce intentional placeholders.
Keep prices as integers; quantity × selected variant price determines the displayed
subtotal only. It does not create an order, cart or payment.

## Protected seller dashboard

`GET /seller/dashboard`: bearer JWT, seller role. Ownership must come from the
verified account, never a frontend-supplied seller identifier. Retain the existing
`message` and `user` fields when extending the current contract.

| Field | Expected structure |
| --- | --- |
| `user` | `{id,name,email,role:"seller"}` |
| `profile` | `{name,location,description,approved}` or null |
| `snapshot_at` | ISO timestamp; displayed in UTC |
| `destination` | Country code, currently GB |
| `is_demo` | Explicit provenance flag |
| `summary` | `{revenue_minor,open_suborders,low_stock,forecast_error,approved_products,available_packs}` |
| `inventory` | Array of owned product shapes with variants |
| `orders` | Read-only summaries or null if not connected |
| `forecast` | Supplied forecast object or null if unavailable |
| `unavailable` | Optional `{orders,revenue,forecast}` explanatory strings |

Order summary fields used by the UI:
`id`, `reference`, `product_name`, `quantity`, `seller_total_minor`,
optional authorized `buyer_total_minor`, `shipping_minor`, `payment_status`,
`fulfillment_status`, `updated_at` (display text), `estimated_transit`, `is_demo`.
Payment and fulfillment are separate statuses. No status mutation is implemented.

Forecast fields used by the UI:
`product_name`, `history_weeks`, `horizon_weeks`, `estimated_units`, `source`,
`history:[{period,units}]`, `predicted:[{period,units}]`, `error_metric`,
`error_value`, `baseline`, `summary`, `note`, `recommendation`, `is_demo`.
The chart only renders supplied series. The frontend does not train a model or
calculate a claimed accuracy metric. Mock forecast/error values are synthetic.

Use null for unconnected revenue/orders/forecast, and an empty array for a known
empty collection. Do not substitute zero for unknown business values.

## Errors and unresolved dependencies

The existing client accepts `{detail:"message"}` and FastAPI 422 arrays with
`loc`/`msg`. Expected statuses: 401 invalid token, 403 role/access denial, 404
missing product, 409 conflicts, 422 invalid query/fields, 5xx service failure.
Configure the future backend's CORS for the actual local Vite origins.

Still to agree: seller revenue period/recognition; available versus reserved stock;
whether sellers may see a whole buyer-order total; facet semantics; product media
hosting; complete product facts/return terms; forecast evaluation period and
source; production destination/currency coverage. No checkout, wishlist persistence,
messaging, admin, mutation, or AI endpoint is required for this phase.
