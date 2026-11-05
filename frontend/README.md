# Ceylon Pantry frontend

React, Vite, JavaScript/JSX and plain CSS. Login and registration follow Figma frames `2024:2` and `2024:24`, sharing styles, fonts and the pantry photograph.

The product catalog at `/shop` follows Figma frame `5:2275`. Search, category/seller filters, maximum price and sorting work locally on six illustrative products. All demo products are in stock and UK eligible, so availability toggles do not change this dataset. Cart, saved products, destination selection, assistant and unavailable destination pages show pending-integration feedback; no server action is claimed. Catalog photographs and icons are stored in `public/assets/catalog/`.

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open http://localhost:5173/shop for the catalog, `/register` for registration, or `/login` (or `/`) for login. Use the port printed by Vite if 5173 is occupied. For a production build, run `npm.cmd run build`; use `npm.cmd run preview` to inspect it locally. Production hosting must rewrite `/shop`, `/login` and `/register` to `index.html`.

The browser validates required fields and email format. Registration also rejects whitespace-only names and displays validation messages. Valid registration clears the form and displays "Backend integration pending". Login retains its existing pending-backend behavior. No credentials are sent, logged, or persisted. Links connect login and registration.

The original Figma photograph and the DM Serif Display / Inter fonts are served from `public/assets/`, without external runtime asset requests. Font licenses are included alongside the fonts.

## Source organization

`main.jsx` mounts `App`. `App.jsx` selects the page using the existing pathname routes and sets the document title. No router dependency is required.

- `pages/AccountPage.jsx` owns account submission and feedback, composing `AccountLayout` and `AccountForm` through props and callbacks.
- `layouts/AccountLayout.jsx` supplies the shared account masthead, photograph and editorial panel.
- `components/account/AccountForm.jsx` renders labeled fields and keeps the existing native validation.
- `pages/CatalogPage.jsx` composes storefront navigation, search, filters, results, footer and feedback components.
- `components/catalog/` contains these catalog sections, reusable product cards, icons and filter options. Parent callbacks handle user actions.
- `hooks/useCatalog.js` owns search, filter, sort and feedback state and handlers.
- `data/catalogData.js` contains the illustrative product data and existing pure filtering function.
- `styles/` contains the original stylesheets, unchanged.

There are currently no backend services or API integrations, so no placeholder service layer is included. There is no configured lint script; the available production check is `npm.cmd run build`.
