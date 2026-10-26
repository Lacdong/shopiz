# Shopiz

Independent SmartOmni marketplace simulator built with React 19, JavaScript/JSX, Vite 6, React Router 7, CSS Modules, Lucide React and Axios. Fully integrated with the **Shopee Open API v2 Mock Simulator backend** (`http://127.0.0.1:8080`) supporting live buyer authentication, category hierarchy, catalog sync, dynamic carrier shipping calculation, live shop chat, multi-shop batch checkout, delivery confirmation, returns/refunds, reviews, cloud media uploads, and an enterprise multi-store Seller Center console with offline test fallback.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
npm run check:integration
npm run check:shop-select
npm run check:seller
npm run check:seller-vouchers
npm run check:chat-management
npm run check:shipping-chat
npm run check:checkout
npm run check:purchases
```

## Backend Integration Architecture

- `vite.config.js`: reverse-proxy routes `/api/*` and `/uploads/*` directly to `http://127.0.0.1:8080`.
- `src/services/api.js`: centralized Axios client configured with `/api/v2` base URL, session token interceptors, and standard Shopee envelope unwrap (`{ error, message, response }`).
- `src/services/authService.js`: live login, registration, password recovery, and buyer profile synchronization.
- `src/services/addressService.js`: buyer shipping address book CRUD, multi-address selection in checkout, and default address management with PostgreSQL sync.
- `src/services/catalogService.js`: live category tree, product search, multi-tier variation attributes, dynamic shipping calculation (`POST /simulator/logistics/calculate_fee`), shop storefront profiles (`GET /simulator/shop/detail`), and product extra metrics, visit tracking, and buyer-like operations (`/simulator/product/extra_info`, `/view`, `/like`). Seller metric requests are batched at no more than 50 IDs.
- `src/services/chatService.js`: live messaging with shop sellers, buyer conversation history, Seller Center Chat Management metrics (`getChatPerformance`), Auto-Reply settings & persistence (`getAutoReplySettings`, `updateAutoReplySettings`), Quick Reply groups with 13 authentic templates (`getQuickReplySettings`, `updateQuickReplySettings`), and right-side persistent Webchat widget integration.
- `src/services/checkoutService.js`: dynamic carrier channels (`SPX Express`, `SPX Instant`, `SPX Economy`), basket voucher eligibility validation, and atomic multi-shop batch checkout.
- `src/services/orderService.js`: live purchases synchronization, buyer delivery confirmation (escrow release), cancellation, 5-star product reviews, and return/refund claims.
- `src/services/sellerService.js`: multi-shop listing (`GET /simulator/shops`), live orders retrieval, order shipment arrangement (`POST /simulator/order/ship`), printable Air Waybill generation/PDF download, inventory stock management, and Seller Center live business metrics.
- `src/services/mediaService.js`: cloud photo/video upload directly to Google Drive (with local storage fallback).

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
- Buyer sign-in and account registration use the simulator Layer B auth APIs when available, with the existing mock account fallback for offline development. Password recovery, SMS, OAuth and QR sign-in remain previews; this is a local simulator flow, not production authentication.
- Demo login: `demo@shopiz.com` / `Shopiz@123` (also accepts `demo` or `0901234567`). Second demo account: `alex@shopiz.com` / `Shopiz@123` (also accepts `alex` or `0912345678`). The simulator stores account records in PostgreSQL; the mock fallback supports offline development.
- `AuthProvider` exposes the current demo user to the header and provides logout. Keep-me-logged-in stores only a demo user ID in localStorage; otherwise the ID goes to sessionStorage. Passwords are sent to the local simulator for authentication but are not persisted in browser storage. This public mock session is not a production authentication mechanism.
- `npm run check:auth` checks validation, navigation and responsive layouts without screenshots. Both browser scripts accept `SHOPIZ_URL` to select the running server; their defaults are 5173 for auth and 5174 for marketplace regression checks.

## Product detail

- `src/pages/product/ProductPage.jsx` follows the `product-detail.png` reference: gallery and purchase controls, seller information, specifications, description, ratings, related collection and recommendations.
- `ProductGallery.jsx` provides thumbnails, detail crops, an accessible native enlargement dialog, share-link copying and favorites. For simulator-backed products, signed-in buyers read and toggle persisted likes through Layer B; guests are routed through login and returned to the same product. Mock catalog items remain illustrative and do not persist likes.
- `ProductReviews.jsx` provides illustrative reviews, seller replies, photo/rating filters, pagination and helpful toggles.
- `src/data/productDetails.js` supplies category-specific sample variants, sizes, seller details and review data, shared with the cart. The catalog supplies stock. Opening a simulator-backed product detail page records one visit; its lifetime sales, views, likes, average rating and review count come from backend metrics rather than Seller Center placeholders.
- Quantity is bounded to the sample stock. Destination and delivery-method selectors update the Buy Now preview. Add to Cart saves the selected product/variation/size/quantity immediately and shows a non-blocking notification that disappears after three seconds. It opens no dialog and has no Continue browsing button. Use the header cart icon to view the cart. Stock-limit errors appear as notifications. Buy Now remains a preview; seller chat displays an availability notice.
- `npm run check:product` checks responsive layouts and interactions without screenshots; its default server is `http://127.0.0.1:5173`, overridable with `SHOPIZ_URL`.

## Shopping cart

- `src/components/cart/CartProvider.jsx` shares cart state between product pages, the header badge and `/cart`. `cartUtils.js` validates persisted items against the catalog, merges matching product/variant/size combinations and enforces stock across all variations of a product.
- `src/pages/cart/` contains the cart page and CSS Module, following the grouped-seller layout in `shopee-cart.png` with monochrome Shopiz styling.
- The updated cart upper section follows the supplied reference: a white logo/title/search header under the black utility bar, aligned product/variation/price/quantity columns, shop-level selection, shop-offer and voucher rows, and a three-row summary. Coins are visibly unavailable in the simulator. The A LITTLE MORE TO LOVE section retains its existing product grid and load-more behavior.
- Cart contents persist in this browser under `shopiz-cart-v1`. The cart is shared between guests and mock accounts on the same browser. Only product IDs, selected variations, sizes, quantities and selection flags are stored; prices and stock come from the catalog.
- Supports selection, select all, quantity changes, individual deletion, deleting selected rows, total/savings calculations and an empty state. Header count includes all item quantities. Standard delivery is free in the cart preview.
- Checkout opens `/checkout` with the selected products grouped by shop, delivery address, seller notes, shipping options, voucher and payment summary.
- `npm run check:cart` verifies additions, merging, variant separation, stock limits, persistence, selection, totals, deletion and responsive layouts without screenshots; accepts `SHOPIZ_URL` (default port 5173).

## Voucher popup

- The cart’s Select or enter a code and shop-voucher buttons open `src/pages/cart/VoucherDialog.jsx`, styled with its own CSS Module. The original recommendations section remains unchanged.
- The modal includes code entry, grouped voucher cards, terms, eligibility notices, selection, Back, Clear selection and Confirm. Applying a typed code selects it inside the dialog; only Confirm updates the cart. Back, Escape and backdrop dismissal discard the draft.
- `src/data/vouchers.js` defines sample offers and eligibility: `SHOPIZ10` (10% off, minimum $25, maximum $15), `SHOPIZ5` ($5 off, minimum $50), `WELCOME15` (15% off, minimum $100, maximum $25), plus `FREESHIP` and `SHIPPLUS` delivery offers. These demo offers expire December 31, 2026 in Vietnam time.
- One voucher can be applied at a time, using only selected-item spend. Discounts round to cents, respect caps and re-evaluate after selection/quantity changes. The selected code persists as `shopiz-cart-voucher-v1`, while its discount is always calculated from the current cart. Cart and checkout totals include the eligible discount.
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

## Checkout

- `/checkout` follows `references/marketplace/checkout.png` using Shopiz’s monochrome theme. Cart items appear grouped by their seller.
- **Multiple Saved Addresses & Backend Sync**: Connected to `useAccount()` and `addressService`. Displays all saved addresses from PostgreSQL `buyer_addresses`. Buyers can choose any saved address, edit an address, or add a new delivery address directly during checkout with automatic background synchronization.
- **Dynamic Shipping Quotes**: Automatically checks cart items against backend product IDs. Calls `catalogService.calculateShippingFee` with cart item dimensions and recipient destination city (`Ho Chi Minh City`, `Hanoi`, `Da Nang`, etc.) to return live carrier options (`SPX Express`, `SPX Instant`, `SPX Economy`). Recalculates shipping fees and totals immediately when switching addresses or delivery options. Fallback mock methods ($0 Standard, $2.90 Express) are seamlessly maintained for simulated offline carts.
- **Multi-Shop Atomic Batch Checkout**: Places orders atomically across multiple shops via `checkoutService.batchCheckout`, preserving individual seller notes, carrier selection, and voucher codes.
- `npm run check:checkout` verifies layout at five sizes, address validation/editing, dynamic shipping, voucher recalculations, payment choices, duplicate submission protection and cart preservation without screenshots.

## My Purchases

- `/account/purchases` follows the supplied `user-purchase_.png` and `shopee-user-purchase_.png` references: account sidebar, status tabs, order search, seller/product rows, order totals and action buttons.
- Newly placed orders appear first, map to **To Ship**, survive reloads and show their original product variations, quantities and checkout totals.
- **Interactive Live Seller Chat**: "Contact Seller" opens the live [`ChatDialog`](file:///Users/nguyetminh/Dev/shopee-docs/shopee-markdown/shopiz/src/components/chat/ChatDialog.jsx) pre-populated with seller details and order items context, supporting instant merchant replies and a direct "View Shop" link.
- **Delivery Confirmation & Escrow Release**: "Confirm Delivery" button for shipped orders transitions status to `COMPLETED` and releases escrow payment on the backend simulator.
- `npm run check:purchases` checks the popup-to-history flow, header links, five responsive layouts, status/search/reload behavior, detail totals, live seller chat dialog, Buy Again, and seller links without screenshots.

## Shop Storefronts & Live Chat

- `src/pages/shop/ShopPage.jsx` and its CSS Module follow `references/marketplace/view-shop.png`: seller profile and statistics, navigation tabs, recommended products, original editorial banners, collection tiles, marketplace offers, shopping benefits and category product groups.
- Supports both simulated shops (`/shop/sonora`, `/shop/atelier`) and live backend stores (`/shop/727720655`, `/shop/839910244`, `/shop/910283751`).
- **Dynamic Shop Metrics & Campaign Vouchers**: Fetches live shop statistics (followers, rating, response rate, response time, joined date duration) from `catalogService.getShopDetail`. The voucher and campaign section dynamically renders active store vouchers (`VCHP77T`, `PCT15`) when a campaign is active, and cleanly hides when no active campaign is running.
- **Header Live Chat**: "Chat Now" in the shop header opens [`ChatDialog`](file:///Users/nguyetminh/Dev/shopee-docs/shopee-markdown/shopiz/src/components/chat/ChatDialog.jsx) to interact directly with the store owner.
- `npm run check:shipping-chat` verifies dynamic shipping rate calculation, live shop chat, backend shop storefront profile with active campaign vouchers, and legacy shop compatibility.

## Multi-Shop Seller Center & Control Console

- `/seller/select-shop` (alias `/seller/select`): dedicated multi-store selection portal rendered by `ShopSelectPage.jsx`. Lists all stores from backend PostgreSQL (`SmartOmni Official Flagship`, `Hanoi Streetwear Co.`, `Saigon Modern Living`, and simulated `SONORA`) with active product counts, order counts, and Mall badges.
- `/seller`: dedicated English seller interface inspired by Shopee, with Shopiz branding, monochrome palette, and responsive navigation.
- **Header & Sidebar Switch Shop**: One-click "Switch Shop" shortcuts in both the header and sidebar allow instant switching between stores.
- **Live Order Management & Shipment**: Fetches live backend orders for the active shop. "Confirm" / "Arrange Shipment" transitions pending orders to `SHIPPED` and generates tracking numbers. Shipped orders provide a direct **"Print AWB"** button downloading printable Shopee PDF Air Waybills.
- **Product Inventory & Metrics**: Displays live store catalog items with database stock levels and API-backed lifetime completed-order sales, detail views, unique likes, average rating and review count. Metrics requests are chunked at 50 items. If a metric batch fails, the affected values display `—`. "Hide / Show" toggles product visibility between `NORMAL` and `UNLIST` in PostgreSQL via `sellerService.toggleUnlist`.
- **Review Management (`?tab=reviews`)**: The `Quản lý Đánh Giá` sidebar item opens a shop-scoped dashboard with the backend shop rating, rolling 30-day and prior-period review metrics, unanswered 1–2 star reviews, and reviews since the selected shop’s previous visit. The UI includes status and multi-star filters, keyword/date search, pagination, product and variation details, copyable order IDs, and inline seller replies. The unsupported review-reward card is intentionally omitted.
- Review data uses the simulator Layer B APIs: `GET /api/v2/simulator/reviews/summary`, `GET /api/v2/simulator/reviews`, and `POST /api/v2/simulator/review/reply`. The summary’s review rate uses completed-order cohorts; positive-review rate counts 4–5 stars. Missing denominators/baselines display as unavailable (`—`). Replies include the active `shop_id` and are ownership-checked by the backend.
- `npm run check:reviews` verifies the Seller Center review dashboard, filters, empty-search state and reset flow.
- **Shop Voucher Management (`?tab=marketing_vouchers` / `?tab=vouchers`)**: The `Mã Giảm Giá Của Shop` sidebar menu opens the comprehensive vouchers management interface. State A (Landing page) presents 3 grouped card sections (`Cải thiện tỷ lệ chuyển đổi`, `Kênh hiển thị Voucher`, `Khách hàng mục tiêu`) supporting all official Shopee usecases including `Ưu đãi Follower` (`usecase = 9`), with an interactive `Thu gọn` / `Mở rộng` toggle. State B (List view) provides status sub-tabs (`Tất cả`, `Đang diễn ra`, `Sắp diễn ra`, `Đã kết thúc`), search by voucher name or code, usage metrics with tooltip, and actions (`Chi tiết`, `Đơn hàng`, `Sao chép`, `Kết thúc`, `Xóa`). State C (Creation & edit workflow) configures codes with shop prefixes (`SMAR`, `HANO`, `SAIG`), validates dates/spend, visibly greys out unsupported Shopee Coins (`Hoàn Xu`), and provides `ProductSelectModal` for item-level selection. Follower Prize vouchers feature a 20-character program name limit, auto-distributed code messaging, receiving period controls, relative 7-day wallet expiry, and informational applicable products (`Tất cả sản phẩm`). Smart Voucher sections are omitted across all creation cards.
- `npm run check:seller-vouchers` verifies the complete Seller Center vouchers landing page, status filtering, details and orders modal inspection, voucher creation workflow, Follower voucher creation and modal inspection, and product selector modal.
- **Marketing Center**: Displays active store vouchers and campaign discounts directly from the database.
- `npm run check:shop-select` verifies responsive layouts, store listing, card selection, navigation, and header switcher.
- `npm run check:seller` verifies responsive layouts, order actions, CSV download, product actions, marketing, shop editing and navigation. `npm run check:extra-info` verifies metric batching/rendering, one visit increment per detail visit, guest login return, and persisted likes. Set `SHOPIZ_URL` to the local preview URL when needed.

## Authentication & Role-Based Navigation

- **Single Source of Truth**: All buyer and seller credentials reside in the backend PostgreSQL database (`prisma/seed.ts`).
- **Seed Accounts**:
  - **Buyer**: `demo@shopiz.com` / `Shopiz@123` (Username: `demo`, Phone: `0901234567`, Role: `buyer`).
  - **Buyer (Secondary)**: `alex@shopiz.com` / `Shopiz@123` (Username: `alex`, Role: `buyer`).
  - **Seller (SmartOmni)**: `seller@shopiz.com` / `Shopiz@123` (Username: `seller`, Role: `seller`, Shop ID: `727720655`, Shop Name: `SmartOmni Official Flagship`).
  - **Seller (Hanoi)**: `hanoiseller@shopiz.com` / `Shopiz@123` (Username: `hanoiseller`, Role: `seller`, Shop ID: `839910244`, Shop Name: `Hanoi Streetwear Co.`).
- **Navigation Flow**:
  - Clicking **Seller Center** in the header or mobile drawer routes unauthenticated users or buyers to `/login` with `state: { returnTo: "/seller" }`.
  - Logging in as a **Buyer** redirects to `/` (Marketplace Homepage to browse products).
  - Attempting to access `/seller` as a Buyer displays a clear warning notice: *"Vui lòng đăng nhập với tài khoản Người bán để truy cập Kênh Người Bán (Seller Center)."*
  - Logging in as a **Seller** redirects directly to `/seller` (Seller Center) and automatically binds the active merchant shop context (`shopiz-active-seller-shop-id` & `shopiz-active-seller-shop-name`).
  - `npm run check:seller-auth` validates this complete end-to-end authentication and redirection lifecycle.

## Vercel Frontend & Render Backend Deployment Guide

Shopiz (`frontend`) is deployed on **Vercel**, while the Shopee Simulator (`backend`) is deployed on **Render**. Follow these steps to connect them:

### 1. Set Frontend Environment Variable on Vercel
1. Go to your **Vercel Dashboard** $\rightarrow$ select the **Shopiz** project.
2. Navigate to **Settings** $\rightarrow$ **Environment Variables**.
3. Add a new variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://<your-render-backend>.onrender.com/api/v2` (e.g. `https://shopee-simulator.onrender.com/api/v2`).
   - **Target**: Production, Preview, and Development.
4. Click **Save** and trigger a **Redeploy** on Vercel so Vite bakes the production backend API URL into the client bundle.

### 2. Single-Page Application (SPA) Routing on Vercel
- The repository includes [`vercel.json`](file:///Users/nguyetminh/Dev/shopee-docs/shopee-markdown/shopiz/vercel.json) at the root of `shopiz/` configured with:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- This ensures direct visits to client-side routes (e.g. `/seller`, `/login`, `/cart`, `/product/1`) are served `index.html` without 404 errors.

### 3. Backend CORS Configuration on Render
- Ensure your Render backend service allows requests from your Vercel domain. In `src/app.ts`, CORS is configured to accept configured origins or all origins in simulator mode:
  ```typescript
  app.use(cors({ origin: true, credentials: true }));
  ```
- If you have an active database on Render (PostgreSQL), ensure migrations/seeds have executed:
  ```sh
  npm run prisma:deploy
  npm run prisma:seed
  ```

