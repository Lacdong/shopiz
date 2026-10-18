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

The local `references/marketplace/home.png` guides section order, proportions, two-row categories and six-column desktop density. The original orange design system is overridden by the requested monochrome tokens. Category line icons and original promotional compositions replace proprietary artwork. Product photos are remotely loaded Unsplash images, styled in grayscale; they require internet access. Prices are illustrative USD values. Seller Center, vouchers, informational and social destinations remain simulator placeholder pages. No transactions occur.

Responsive layouts target 1440, 1280, 1024, 768 and 375 pixels. Recommendations use six desktop columns, four at 1024, three at tablet and two on phones. Flash deals scroll horizontally on mobile. Search matches all entered words against product names, categories and mock brands. Categories without mock inventory display an empty state.

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

## Product detail

- `src/pages/product/ProductPage.jsx` follows the `product-detail.png` reference: gallery and purchase controls, seller information, specifications, description, ratings, related collection and recommendations.
- `ProductGallery.jsx` provides thumbnails, detail crops, an accessible native enlargement dialog, share-link copying and visit-only favorites. Crop labels describe the reused product photo rather than claiming separate product angles.
- `ProductReviews.jsx` provides illustrative reviews, seller replies, photo/rating filters, pagination and helpful toggles.
- `src/data/productDetails.js` supplies category-specific sample variants, sizes, seller details and review data, shared with the cart. The catalog supplies stock.
- Quantity is bounded to the sample stock. Destination and delivery-method selectors update the Buy Now preview. Add to Cart saves the selected product/variation/size/quantity immediately and shows a non-blocking notification that disappears after three seconds. It opens no dialog and has no Continue browsing button. Use the header cart icon to view the cart. Stock-limit errors appear as notifications. Buy Now remains a preview; seller chat displays an availability notice.
- `npm run check:product` checks responsive layouts and interactions without screenshots; its default server is `http://127.0.0.1:5173`, overridable with `SHOPIZ_URL`.

## Shopping cart

- `src/components/cart/CartProvider.jsx` shares cart state between product pages, the header badge and `/cart`. `cartUtils.js` validates persisted items against the catalog, merges matching product/variant/size combinations and enforces stock across all variations of a product.
- `src/pages/cart/` contains the cart page and CSS Module, following the grouped-seller layout in `shopee-cart.png` with monochrome Shopiz styling.
- The updated cart upper section follows the supplied reference: a white logo/title/search header under the black utility bar, aligned product/variation/price/quantity columns, shop-level selection, shop-offer and voucher rows, and a three-row summary. Coins are visibly unavailable in the simulator. The A LITTLE MORE TO LOVE section retains its existing product grid and load-more behavior.
- Cart contents persist in this browser under `shopiz-cart-v1`. The cart is shared between guests and mock accounts on the same browser. Only product IDs, selected variations, sizes, quantities and selection flags are stored; prices and stock come from the catalog.
- Supports selection, select all, quantity changes, individual deletion, deleting selected rows, total/savings calculations and an empty state. Header count includes all item quantities. Standard delivery is free in the cart preview.
- Checkout shows an explicit summary preview. No payment, order submission or inventory reservation occurs.
- `npm run check:cart` verifies additions, merging, variant separation, stock limits, persistence, selection, totals, deletion and responsive layouts without screenshots; accepts `SHOPIZ_URL` (default port 5173).

## Voucher popup

- The cart’s Select or enter a code and shop-voucher buttons open `src/pages/cart/VoucherDialog.jsx`, styled with its own CSS Module. The original recommendations section remains unchanged.
- The modal includes code entry, grouped voucher cards, terms, eligibility notices, selection, Back, Clear selection and Confirm. Applying a typed code selects it inside the dialog; only Confirm updates the cart. Back, Escape and backdrop dismissal discard the draft.
- `src/data/vouchers.js` defines sample offers and eligibility: `SHOPIZ10` (10% off, minimum $25, maximum $15), `SHOPIZ5` ($5 off, minimum $50), `WELCOME15` (15% off, minimum $100, maximum $25), plus `FREESHIP` and `SHIPPLUS` delivery offers. These demo offers expire December 31, 2026 in Vietnam time.
- One voucher can be applied at a time, using only selected-item spend. Discounts round to cents, respect caps and re-evaluate after selection/quantity changes. The selected code persists as `shopiz-cart-voucher-v1`, while its discount is always calculated from the current cart. Cart and checkout preview totals include the eligible discount.
- Standard shipping is already free, so shipping vouchers explicitly report that condition and do not fabricate additional savings. No voucher redemption or usage tracking is sent to a backend.
- `npm run check:vouchers` verifies coupon rules and the modal flow at all five target sizes without screenshots; supports `SHOPIZ_URL` (default port 5173).

## Search results

- `/search?q=...` follows `references/marketplace/search-result.png`: a left filter sidebar, related-shop panel, search heading, sorting bar, five-column desktop grid and pagination. Tablet and phone grids adapt to four/three/two columns, with a collapsible filter panel at 768px and below.
- `src/pages/search/SearchResultsPage.jsx`, `SearchFilters.jsx`, `searchUtils.js` and the page CSS Module implement the search experience. `BrowseResultsPage.jsx` retains the existing category and generic collection layouts.
- Filters include multiple categories, shipping origins and brands, min/max price, Mall products, minimum rating and free shipping. Price ranges are validated before applying. All catalog items currently have free standard shipping.
- Relevance retains catalog order among keyword matches; Latest uses mock catalog ID order. Top Sales sorts by sold count; price supports both directions. Pages contain at most 15 products.
- Query, filters, sort and pagination are URL parameters. Changing a filter or sort resets pagination. Active filters can be removed individually or cleared. The header input follows query changes during browser navigation.
- Related-shop links open the matching `/shop/:shopId` storefront based on the same seller metadata as product detail and cart pages.
- `npm run check:search` verifies layout, combined filtering, sorting, pagination, invalid ranges, empty states, URL persistence, navigation and mobile filters without screenshots; accepts `SHOPIZ_URL` (default port 5173).

## Shop storefronts

- `src/pages/shop/ShopPage.jsx` and its CSS Module follow `references/marketplace/view-shop.png`: seller profile and statistics, navigation tabs, recommended products, original editorial banners, collection tiles, marketplace offers, shopping benefits and category product groups.
- `/shop/sonora`, `/shop/atelier` and `/shop/north-form` use the shared fictional shop catalog in `src/data/shops.js`. Mall collections, product seller metadata and storefronts share seller IDs and inventories.
- Home, All Products, New Arrivals, Top Sales and About Shop tabs are available. Product tabs support shop-scoped keyword search, categories, sorting and six-item pagination through URL parameters. Back/reload preserves the selected query/filter state.
- Following is a browser-local preference under `shopiz-followed-shops-v1`, independent for each shop. No subscription or notification is sent. Seller messaging opens an availability notice.
- Product detail View Shop, search-related-shop links and cart Visit Shop/Shop more links open the corresponding storefront. Product cards link back to existing product detail pages. Unknown shop IDs show an explicit not-found page.
- `npm run check:shop` checks three storefronts at all five target sizes, follow persistence, tabs/search/filters/sorting/pagination and seller links without screenshots. Accepts `SHOPIZ_URL` (default port 5173).
