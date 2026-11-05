# Ceylon Pantry frontend

React + JavaScript (JSX) + Vite + Tailwind CSS implementation of the approved buyer login screen. This
frontend is isolated from the future FastAPI backend. The Figma branding is kept
as **Ceylon Pantry**; the repository's project name is unchanged.

## Run locally

Use Node.js 24 LTS and npm (the implementation was verified with Node 24.14.1).
From this directory:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/login`. The root URL renders the same login screen.
Only the login page is implemented; no routing library is needed yet.

## Quality checks

```sh
npm run build
npm run lint
npm run format:check
npm test
npx playwright install chromium
npm run test:e2e
```

`npm run preview` serves the production build. Playwright starts the development
server if necessary. Browser-test screenshots and failure traces are written to
the ignored `test-results/` directory. Browser binaries must be installed once
per machine. Tests use injected handlers, not a simulated application login.

Alternatively, use an already installed Chrome browser by setting
`PLAYWRIGHT_CHANNEL=chrome` before running the browser tests. In PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

## Structure

- [Application entry](src/app/App.jsx): renders the login page.
- [Login page](src/pages/LoginPage.jsx): composes the screen and registration handoff.
- [Authentication feature](src/features/auth/): form UI, validation and submission state.
- [Shared components](src/components/): Button, Input, FormField, BrandLogo and PageContainer.
- [Authentication layout](src/layouts/AuthLayout.jsx): masthead and editorial image panel.
- [Design tokens](src/styles/tokens.css): Tailwind theme with semantic palette, typography, spacing, dimensions and responsive variables.
- [Assets](src/assets/): the original Figma food photograph, bundled locally.
- [Browser tests](e2e/login.spec.js): keyboard interactions, responsive screenshots and automated accessibility checks.

## Authentication integration

There is no authentication API, fabricated endpoint, credential persistence or
successful-login simulation. A valid submission currently reports:

> Sign-in is not available yet. Your details have not been sent.

The optional handler documented in [useLoginForm](src/features/auth/useLoginForm.js)
accepts an object containing email and password and returns a promise. Once the backend contract is approved, supply
`onLogin` to the page. The adapter must handle the real session and successful
navigation. The form handles pending/disabled controls, duplicate submission
protection and a generic failure message. Email is trimmed; passwords are not.
Never log or persist credentials in browser storage.

Until registration exists, its action reports that registration is unavailable.
Pass the approved `registrationHref` when a real destination exists. No unrelated
registration screen has been added.

## Design reference and deliberate adaptations

[Figma buyer login, node 2024:2](https://www.figma.com/design/RUAeTIAlYdTFPZIE4l2tmX?node-id=2024-2)
is the visual reference at 1440 × 960. The photograph was exported through Figma
MCP and downloaded into this project; runtime assets do not use expiring URLs.
DM Serif Display (400) and Inter (400/600) are self-hosted through Fontsource and
bundled by Vite, so rendering does not depend on Google Fonts requests. Font
licenses are included in their installed Fontsource packages.

The initial semantic palette is primary `#A0522D`, secondary `#C9932E`, background
`#FAF7F0`, surface `#FEFCF8`, primary text `#2B211B`, secondary text `#71645C` and
border `#E4DDD3`. Components use semantic Tailwind utilities such as `bg-primary`,
`text-text-secondary`, `font-display` and `rounded-control` rather than repeating
hex colors. The official `@tailwindcss/vite` plugin builds the stylesheet.

The [global stylesheet](src/styles/global.css) imports Tailwind and the shared
theme. Global defaults and accessibility rules live in Tailwind's base layer;
component styling uses utility classes directly. CSS Modules are no longer used.
Figma-specific dimensions use shared variables through Tailwind's custom-property
utilities, while standard padding and gaps use its quarter-rem spacing scale.

- Small gold text on terracotta uses `secondary-on-primary` (`#FFE6B8`) for
  readable contrast; the original secondary color remains available.
- A keyboard-accessible Show/Hide password control is added as requested.
- The two-column layout becomes a form-first single column at 64rem. Compact
  spacing applies at 40rem. These breakpoint rules are centralized in the token
  stylesheet; native CSS variables cannot be used as media-query conditions.
- Mobile/tablet arrangements are implementation adaptations because the supplied
  frame defines desktop only. The editorial image remains present below the form.
- The layout expands for validation messages and enlarged text rather than using
  a fixed-height form. Reduced-motion preferences are respected.

## Scope

This change contains only the login screen, its shared foundations and relevant
tests. Real authentication, account registration, password recovery, 2FA and
other marketplace pages require separate approval and backend/design contracts.
