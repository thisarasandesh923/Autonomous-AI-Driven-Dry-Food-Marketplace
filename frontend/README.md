# Ceylon Pantry frontend

React + JavaScript (JSX) + Vite + Tailwind CSS implementation of the approved buyer login and registration screens. This
frontend is isolated from the future FastAPI backend. The Figma branding is kept
as **Ceylon Pantry**; the repository's project name is unchanged.

## Run locally

Use Node.js 24 LTS and npm (the implementation was verified with Node 24.14.1).
From this directory:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/login` or `http://127.0.0.1:5173/register`.
The root URL renders the login screen. Native links and a small pathname switch
in the application entry use Vite's existing SPA fallback; no routing dependency
is added. Production hosting must serve the application entry for both paths.

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

- [Application entry](src/app/App.jsx): selects the login or registration page.
- [Login page](src/pages/LoginPage.jsx): composes the screen and registration handoff.
- [Register page](src/pages/RegisterPage.jsx): composes the registration screen and login link.
- [Authentication feature](src/features/auth/): form UI, validation and submission state.
- [Shared components](src/components/): Button, Input, FormField, PasswordInput, FormNotice, BrandLogo and PageContainer.
- [Authentication layout](src/layouts/AuthLayout.jsx): masthead and editorial image panel.
- [Design tokens](src/styles/tokens.css): Tailwind theme with semantic palette, typography, spacing, dimensions and responsive variables.
- [Assets](src/assets/): the original Figma food photograph, bundled locally.
- [Browser tests](e2e/login.spec.js): keyboard interactions, responsive screenshots and automated accessibility checks.
- [Registration browser tests](e2e/register.spec.js): field validation, keyboard flow, navigation, asset geometry and responsive accessibility checks.

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

The application supplies `/register` as the login page's `registrationHref`.
Registration accepts exactly the Figma fields: full name, email and password.
It checks nonblank trimmed name/email, email format and a required password.
It accepts single-part and international names and preserves password whitespace.
No confirmation field, consent checkbox, password-length rule or 2FA step is
invented. The approved backend password policy must be added before real signup.

The [registration callback](src/features/auth/useRegisterForm.js) accepts
`{ fullName, email, password }` and returns a promise. This is a frontend handoff,
not an assumed API payload. Supply `onRegister` to the register page only after
the backend contract is established; its adapter owns account creation and
next-step navigation. Without it, submission reports:

> Account registration is not available yet. Your details have not been sent.

Both forms share [submission state](src/features/auth/useAuthForm.js), error focus,
duplicate-request protection, password visibility and accessible status messages.
Tests inject adapters to exercise loading/failure states; the application never
simulates successful authentication or registration.

## Design reference and deliberate adaptations

[Figma buyer login, node 2024:2](https://www.figma.com/design/RUAeTIAlYdTFPZIE4l2tmX?node-id=2024-2)
is the visual reference at 1440 × 960. The photograph was exported through Figma
MCP and downloaded into this project; runtime assets do not use expiring URLs.
DM Serif Display (400) and Inter (400/600) are self-hosted through Fontsource and
bundled by Vite, so rendering does not depend on Google Fonts requests. Font
licenses are included in their installed Fontsource packages.

[Figma buyer registration, node 2024:24](https://www.figma.com/design/RUAeTIAlYdTFPZIE4l2tmX?node-id=2024-24)
uses the same masthead, photograph and editorial panel. Its image was retrieved
through Figma MCP and confirmed to match the existing asset by SHA-256, so it is
reused. Only two layout variables were added to the existing token stylesheet:
the registration form's desktop top offset and its spacing above the fields.
Colors, typography, control sizes and responsive breakpoints remain shared.

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

This frontend contains only the login and registration screens, their shared foundations and relevant
tests. Real authentication, backend account creation, password recovery, 2FA and
other marketplace pages require separate approval and backend/design contracts.
