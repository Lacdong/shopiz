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

- `src/App.jsx`: layout, homepage, filtered search and collection/category results, product preview and placeholder routes.
- `src/components/Header.jsx`: utility navigation, responsive navigation, search and cart.
- `src/components/Discovery.jsx`: three-slide automatic/manual carousel, eight shortcuts, 20 categories.
- `src/components/Commerce.jsx`: session-persistent deal countdown, reusable product cards, flash deals, original fictional brand strip, six-column recommendations, load more and trust messages.
- `src/components/CollectionPages.jsx` and its CSS Module: dedicated Flash Sale, Top Products and Shopiz Mall layouts based on the three additional reference screenshots.
- `src/components/Footer.jsx`: customer service, company, payment, shipping, social and legal information.
- Component styles live in adjacent CSS Modules. Global tokens are in `src/global.css`.
- `src/data/catalog.js`: mock products, categories and original banner copy.
- `src/services/api.js`: unused Axios client reserved for future local simulator APIs.

## Design and scope

The local `references/marketplace/home.png` guides section order, proportions, two-row categories and six-column desktop density. The original orange design system is overridden by the requested monochrome tokens. Category line icons and original promotional compositions replace proprietary artwork. Product photos are remotely loaded Unsplash images, styled in grayscale; they require internet access. Prices are illustrative USD values. Seller Center, cart, authentication, vouchers, informational and social destinations are explicit simulator placeholder pages. No transactions occur.

Responsive layouts target 1440, 1280, 1024, 768 and 375 pixels. Recommendations use six desktop columns, four at 1024, three at tablet and two on phones. Flash deals scroll horizontally on mobile. Search matches all entered words against product names and categories. Categories without mock inventory display an empty state.

## Collection pages

- `/collection/flash-deals` (alias `/flash-sale`): four-column deals, live countdown, session previews, category filtering, price/discount sorting and visit-only reminder toggles. Reminders do not send notifications.
- `/collection/top-products` (alias `/top-product`): five-column desktop rankings, popular-search topic tabs, best-selling/rating/price sorting, and shareable topic filters via `?q=`.
- `/collection/mall` (alias `/shopiz-mall`): promotional carousel, shopping benefits, five shortcuts, category grid, three fictional brand collections, category and sort controls. Brand selections use `?brand=sonora`, `atelier`, or `north-form`.
- Homepage shortcuts, Top Searches cards, Mall brand cards and See all links open the corresponding pages.
- `npm run check:ui` performs browser checks without capturing screenshots.
