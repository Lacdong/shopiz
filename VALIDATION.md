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

The product catalog, inventory and sold counts are mock data. Product photos load from Unsplash and require network access. Unimplemented pages use explicit placeholders. Authentication forms are interactive frontend previews without account services. No backend, checkout, payments, shipping integration or production Shopee API is present. No pixel-perfect similarity score is claimed.

## Authentication and page-folder refactor

- Production build succeeds after separating routing, layouts, per-page JSX/CSS Modules and shared controls.
- Login, Register, the signup alias and password recovery pass overflow checks at 1440, 1280, 1024, 768 and 375 pixels.
- Authentication checks cover blank/invalid identity, password visibility, provider and QR notices, mock account matching and incorrect passwords, phone validation, two-step registration, short/mismatched passwords, terms consent, registration-to-login handoff, and recovery preview.
- The authentication test observes no non-GET requests, no persisted demo password and no browser runtime errors.
- The full existing marketplace browser suite passes after the refactor, including the homepage, search, product preview, collection pages and mobile navigation. No screenshots were captured.
