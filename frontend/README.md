# Ceylon Pantry buyer login

React, Vite, JavaScript/JSX and plain CSS. Only the buyer login screen is implemented from Figma frame `2024:2`.

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open http://localhost:5173/login (or `/`). For a production build, run `npm.cmd run build`; use `npm.cmd run preview` to inspect it locally. Production hosting must rewrite `/login` to `index.html`.

The browser validates required email/password fields and email format. Valid submission clears the form and displays “Backend integration pending.” No credentials are sent, logged, or persisted. The registration link announces that registration is coming soon.

The original Figma photograph and the DM Serif Display / Inter fonts are served from `public/assets/`, without external runtime asset requests. Font licenses are included alongside the fonts.
