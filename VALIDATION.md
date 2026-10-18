# Validation

- Read the supplied reference design document and homepage screenshot.
- Vite production build succeeds. React Router emits harmless ignored `use client` directive warnings during bundling.
- Local Vite preview responds with HTTP 200.
- Headless Chrome checks pass at 1440, 1280, 1024, 768 and 375 pixels: no horizontal page overflow, 20 category links, six flash deal cards.
- Interaction checks pass for manual carousel changes, countdown updates, filtered search, product preview, cart route, category navigation, loading more products and mobile Seller Center navigation.
- No browser runtime errors during those checks.
- Current browser validation does not capture screenshots, per the Shopiz project preference. Earlier homepage captures remain in `artifacts/` as historical files.
- Dedicated Flash Sale, Top Products and Mall pages follow the added `flash-sale.png`, `top-product.png` and `shopee-mall.png` references, with original monochrome branding. Mall reference sections that were blank are populated with fictional brand collections.
- All three collection pages pass overflow checks at 1440, 1280, 1024, 768 and 375 pixels. Sale category filters, session previews and reminder toggles; top-product topic filters and price ranking; Mall brand selection, empty category states and filter reset pass browser checks. No screenshots are captured.

## Reproduce

Start `npm run dev`, then run `npm run check:ui` in a second terminal. The check expects Chrome installed and the server at `http://127.0.0.1:5174`; set `SHOPIZ_URL` if Vite selects a different port.

## Limitations

The product catalog, inventory and sold counts are mock data. Product photos load from Unsplash and require network access. Unimplemented pages use explicit placeholders. Authentication forms are interactive frontend previews without account services. Checkout simulates browser-local orders; no backend, real payments, shipping integration or production Shopee API is present. No pixel-perfect similarity score is claimed.

## Authentication and page-folder refactor

- Production build succeeds after separating routing, layouts, per-page JSX/CSS Modules and shared controls.
- Login, Register, the signup alias and password recovery pass overflow checks at 1440, 1280, 1024, 768 and 375 pixels.
- Authentication checks cover blank/invalid identity, password visibility, provider and QR notices, mock account matching and incorrect passwords, phone validation, two-step registration, short/mismatched passwords, terms consent, registration-to-login handoff, and recovery preview.
- The authentication test observes no non-GET requests, no persisted demo password and no browser runtime errors.
- The full existing marketplace browser suite passes after the refactor, including the homepage, search, product preview, collection pages and mobile navigation. No screenshots were captured.

## Redesigned product detail

- Read `references/marketplace/product-detail.png`; retained its dense marketplace structure with monochrome Shopiz branding and sample catalog content.
- Product layouts pass overflow checks at 1440, 1280, 1024, 768 and 375 pixels, including a product with size options.
- Browser checks pass for thumbnail changes, enlarged-image dialog and Escape handling, favorites, variant/size selections, minimum/maximum stock bounds, delivery destination and method, preview totals, cart/chat notices, review filters and pagination, helpful toggles, product-state reset and the missing-product fallback.
- No browser runtime errors or screenshots during product validation. Add to Cart now persists locally; Buy Now remains a simulator preview.

## Add to Cart and cart page

- Production build succeeds with shared cart state, product feedback, live header count and the dedicated `/cart` page.
- End-to-end cart checks pass at 1440, 1280, 1024, 768 and 375 pixels without horizontal page overflow or screenshots.
- Verified initial addition, persistence after reload, merging identical options, separate variants/sizes, header badge, selection and totals, quantity edits, stock limits across all variants, full-stock feedback, checkout preview, individual/bulk deletion, persistent empty state and malformed-storage recovery.
- Product-page regression checks also pass after the Add to Cart integration. No browser runtime errors were observed.

## Cart upper-section redesign

- Preserved the A LITTLE MORE TO LOVE component, catalog and load-more behavior.
- Added a cart-specific white header with compact search and retained the black utility navigation; other marketplace routes keep their original header.
- Restructured seller groups with group selection, a separate variation column, shop-offer/voucher rows and a voucher/coins/checkout summary. Coin redemption remains disabled.
- Populated-cart checks pass at all five requested widths without page overflow. Group selection, recommendation loading, compact search sizing and existing cart interactions pass without screenshots.

## Voucher popup

- Added a monochrome voucher selector based on the supplied popup image, without changing A LITTLE MORE TO LOVE.
- Eligibility checks cover selected products, minimum spend, expiry, cent rounding, discount caps and already-free shipping.
- Browser tests pass at 1440, 1280, 1024, 768 and 375 pixels: popup stays inside the viewport, input receives focus, Escape closes it and body scrolling is restored.
- Verified invalid and insufficient-spend codes, normalized code input, draft/confirm/cancel, persistence after reload, quantity-driven recalculation and cap, deselection invalidation, checkout total, clearing/removing vouchers and shipping vouchers.
- No runtime errors or screenshots during voucher validation.

## Search-result layout

- Read the added `search-result.png` and implemented its filter/sidebar, related-shop, sorting and dense five-column desktop layout with Shopiz branding. Existing generic category/collection layouts are preserved.
- Search layouts with and without related-shop content pass overflow checks at 1440, 1280, 1024, 768 and 375 pixels.
- Browser checks pass for keyword/brand matching, 15-product pagination, price/latest/sales sorting, combined category/origin/brand filters, invalid price ranges, empty/reset states, Mall filtering and reload persistence, filter chips, ratings, query synchronization on Back, mobile filters and product navigation.
- No screenshots or browser runtime errors during search validation.

## View-shop storefronts

- Read `view-shop.png`; implemented seller profile/statistics, tabs, product groups, original promotional content, collection tiles, offers and shopping benefits with monochrome Shopiz branding.
- All three storefronts and their catalog tabs pass overflow checks at 1440, 1280, 1024, 768 and 375 pixels.
- Verified following/unfollowing, persistence after reload and separation across shops; chat availability/Escape; tab navigation; scoped search and browser Back synchronization; category reload persistence; price/latest/sales sorting; six-item pagination; and the missing-shop fallback.
- Search, product-detail and cart seller links were checked end to end. Store product links reach product detail pages. No screenshots or runtime errors during shop validation.

## Checkout

- Implemented `checkout.png` as `/checkout` with a compact checkout header, delivery address, seller groups, notes, shipping, voucher, payment and order summary. Cart Checkout now opens this page.
- Build, cart, voucher and checkout checks pass. Layout and address-dialog bounds were checked at 1440, 1280, 1024, 768 and 375 pixels without screenshots.
- Verified selected products only, address editing and required-name validation, per-shop express/standard shipping, shipping voucher recalculation, payment confirmation/cancel, duplicate submission protection, receipt totals and persistence of unselected cart products.
- Mock order summaries exclude recipient address/phone and seller notes. Refreshing checkout after completion shows the empty-selection state and creates no duplicate order. No real payment or backend order is sent.

## My Purchases and checkout success popup

- Read both supplied user-purchase references and implemented their sidebar, status tabs, search, shop/product cards, totals and actions with English copy and Shopiz branding.
- Checkout success opens an accessible dialog linking to `/account/purchases`; the header account menu opens the same route. Checkout records appear before labelled sample history and persist across reloads.
- Purchases and order-details layout checks pass at 1440, 1280, 1024, 768 and 375 pixels. Verified phone popup bounds, status/search URL state, empty results, checkout totals across multiple shops, Buy Again quantities/options, seller navigation and malformed storage recovery.
- Checkout and authentication regression checks pass. No screenshots or browser runtime errors; payments, shipping and seller messages remain simulated.

## Account profile, addresses and purchase status actions

- Profile/address layouts and address editor fit 1440, 1280, 1024, 768 and 375 pixels. Verified name/contact/date validation, leap dates, avatar format and preview/save, reload persistence, sidebar/header identity, address create/edit/cancel/default/delete, account separation and malformed storage.
- Shared account sidebar is used across Profile, Addresses and My Purchases. Authentication, checkout and purchase regression suites passed after the refactor.
- Purchase actions now follow Completed, Cancelled and pending status groups. Verified review rating validation and persistence, cancellation reason/confirmation and keep-order flow, persisted Cancelled state and details, and existing Buy Again/Contact Seller behavior. No screenshots were captured.
