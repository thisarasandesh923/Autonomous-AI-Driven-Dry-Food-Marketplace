# Ceylon Pantry buyer accounts

React, Vite, JavaScript/JSX and plain CSS. Login and registration follow Figma frames `2024:2` and `2024:24`, sharing styles, fonts and the pantry photograph.

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open http://localhost:5173/register for registration, or `/login` (or `/`) for login. Use the port printed by Vite if 5173 is occupied. For a production build, run `npm.cmd run build`; use `npm.cmd run preview` to inspect it locally. Production hosting must rewrite `/login` and `/register` to `index.html`.

The browser validates required fields and email format. Registration also rejects whitespace-only names and displays validation messages. Valid registration clears the form and displays "Backend integration pending". Login retains its existing pending-backend behavior. No credentials are sent, logged, or persisted. Links connect login and registration.

The original Figma photograph and the DM Serif Display / Inter fonts are served from `public/assets/`, without external runtime asset requests. Font licenses are included alongside the fonts.
