# Shopiz

Independent SmartOmni marketplace simulator built with React, JavaScript/JSX, Vite, React Router, CSS Modules, Lucide React and Axios. No backend or production marketplace API is connected.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Implementation

- `src/App.jsx`: route configuration and page-scroll management only.
- `src/layouts/`: shared marketplace layout and the separate authentication layout.
- `src/pages/`: one folder per page, with JSX and its CSS Module together: `home`, `search`, `product`, `flash-sale`, `top-products`, `mall`, `login`, `register`, and `placeholder`.
- `src/components/Header.jsx`: utility navigation, responsive navigation, search and cart.
- `src/components/Discovery.jsx`: three-slide automatic/manual carousel, eight shortcuts, 20 categories.
- `src/components/Commerce.jsx`: session-persistent deal countdown, reusable product cards, flash deals, original fictional brand strip, six-column recommendations, load more and trust messages.
- `src/components/collection/`: common breadcrumbs, category filters, empty states and shared collection styling. Individual collection pages and their styles live under `src/pages/`.
- `src/components/auth/`: shared password field, provider buttons, legal links and form styles.
- `src/styles/Page.module.css`: common page-level styles; page-specific styles remain with each page.
- `src/components/Footer.jsx`: customer service, company, payment, shipping, social and legal information.
- Component styles live in adjacent CSS Modules. Global tokens are in `src/global.css`.
- `src/data/catalog.js`: mock products, categories and original banner copy.
- `src/services/api.js`: unused Axios client reserved for future local simulator APIs.

## Design and scope

The local `references/marketplace/home.png` guides section order, proportions, two-row categories and six-column desktop density. The original orange design system is overridden by the requested monochrome tokens. Category line icons and original promotional compositions replace proprietary artwork. Product photos are remotely loaded Unsplash images, styled in grayscale; they require internet access. Prices are illustrative USD values. Seller Center, cart, vouchers, informational and social destinations remain simulator placeholder pages. No transactions occur.

Responsive layouts target 1440, 1280, 1024, 768 and 375 pixels. Recommendations use six desktop columns, four at 1024, three at tablet and two on phones. Flash deals scroll horizontally on mobile. Search matches all entered words against product names and categories. Categories without mock inventory display an empty state.

## Collection pages

- `/collection/flash-deals` (alias `/flash-sale`): four-column deals, live countdown, session previews, category filtering, price/discount sorting and visit-only reminder toggles. Reminders do not send notifications.
- `/collection/top-products` (alias `/top-product`): five-column desktop rankings, popular-search topic tabs, best-selling/rating/price sorting, and shareable topic filters via `?q=`.
- `/collection/mall` (alias `/shopiz-mall`): promotional carousel, shopping benefits, five shortcuts, category grid, three fictional brand collections, category and sort controls. Brand selections use `?brand=sonora`, `atelier`, or `north-form`.
- Homepage shortcuts, Top Searches cards, Mall brand cards and See all links open the corresponding pages.
- `npm run check:ui` performs browser checks without capturing screenshots.

## Login and registration

- `/login`: phone/email/username and password validation, show/hide password, preference checkbox, QR/provider availability notices, and a clearly identified form-completion preview.
- `/register` (alias `/signup`): two steps for phone validation and account details, password confirmation and terms consent, followed by a demo completion state. The phone number can be passed to Login without passing the password.
- `/forgot-password`: validated email form with an explicit preview completion message.
- `references/marketplace/login.png` and `register.png` guide the separate white auth header, dark promotional panel, right-aligned white form card and shared footer. Mobile displays a single form column.
- Authentication is frontend-only. `src/data/mockData.js` contains two public demo accounts and matches email, username or phone plus an exact password. No real account, SMS, recovery email, OAuth or QR authentication service is connected. Registration remains a form preview and does not add users to this file.
- Demo login: `demo@shopiz.com` / `Shopiz@123` (also accepts `demo` or `0901234567`). Second account: `alex@shopiz.com` / `Shopiz@123` (also accepts `alex` or `0912345678`).
- `AuthProvider` exposes the current demo user to the header and provides logout. Keep-me-logged-in stores only a demo user ID in localStorage; otherwise the ID goes to sessionStorage. Entered passwords are never persisted or sent. This public mock session is not a production authentication mechanism.
- `npm run check:auth` checks validation, navigation and responsive layouts without screenshots. Both browser scripts accept `SHOPIZ_URL` to select the running server; their defaults are 5173 for auth and 5174 for marketplace regression checks.
