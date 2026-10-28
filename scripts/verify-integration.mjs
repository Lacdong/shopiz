import assert from "node:assert/strict";

const BASE_URL = process.env.SIMULATOR_URL || "http://127.0.0.1:8080";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();
  return { status: res.status, json };
}

async function run() {
  console.log("================================================================");
  console.log("🛒 SHOPIZ ↔ SHOPEE SIMULATOR E2E INTEGRATION VERIFICATION");
  console.log(`Backend Target: ${BASE_URL}`);
  console.log("================================================================\n");

  // 1. Categories & Catalog
  console.log("▶ [1/7] Testing Catalog & Categories API...");
  const catRes = await request("/api/v2/simulator/categories");
  assert.equal(catRes.json.error, "", "Categories returned without error");
  assert.ok(catRes.json.response.categories.length > 0, "Categories list populated");
  console.log(`  ✓ Found ${catRes.json.response.categories.length} categories`);

  const prodRes = await request("/api/v2/simulator/products?page_size=10");
  assert.equal(prodRes.json.error, "", "Products returned without error");
  assert.ok(prodRes.json.response.products.length > 0, "Products list populated");
  const firstProd = prodRes.json.response.products[0];
  console.log(`  ✓ Found product: "${firstProd.item_name}" (ID: ${firstProd.item_id}, Shop: ${firstProd.shop_name})`);

  // 2. Buyer Authentication
  console.log("\n▶ [2/7] Testing Buyer Authentication...");
  const authRes = await request("/api/v2/simulator/auth/login", {
    method: "POST",
    body: { identity: "demo", password: "Shopiz@123" },
  });
  assert.equal(authRes.json.error, "", "Buyer demo login succeeds");
  assert.equal(authRes.json.response.user.username, "demo");
  assert.equal(authRes.json.response.user.id, 1001);
  const token = authRes.json.response.token;
  console.log(`  ✓ Buyer authenticated: demo (ID: 1001), token issued: ${token.slice(0, 20)}...`);

  // 3. Buyer Address Book
  console.log("\n▶ [3/7] Testing Buyer Address Book...");
  const addrRes = await request("/api/v2/simulator/buyer/addresses?buyer_id=1001");
  assert.equal(addrRes.json.error, "", "Fetched buyer addresses");
  assert.ok(addrRes.json.response.addresses.length > 0, "Saved address exists");
  console.log(`  ✓ Primary address: ${addrRes.json.response.addresses[0].address_line}, ${addrRes.json.response.addresses[0].city}`);

  // 4. Logistics Channels
  console.log("\n▶ [4/7] Testing Logistics Fulfillment Channels...");
  const logRes = await request("/api/v2/simulator/logistics/channels");
  assert.equal(logRes.json.error, "", "Logistics channels loaded");
  assert.ok(logRes.json.response.channels.length > 0, "Active carriers found");
  console.log(`  ✓ Active carriers: ${logRes.json.response.channels.map(c => c.channel_name).join(", ")}`);

  // 5. Multi-Shop Batch Checkout
  console.log("\n▶ [5/7] Testing Multi-Shop Batch Order Placement...");
  const batchRes = await request("/api/v2/simulator/order/batch_checkout", {
    method: "POST",
    body: {
      buyer_user_id: 1001,
      buyer_username: "demo",
      recipient_name: "Demo Shopper",
      recipient_phone: "0901234567",
      recipient_address: "123 Le Loi Boulevard",
      recipient_district: "District 1",
      recipient_city: "Ho Chi Minh City",
      payment_method: "ShopeePay",
      orders: [
        {
          shop_id: 727720655,
          channel_id: 30001,
          shipping_carrier: "Shopee Xpress",
          message_to_seller: "Fragile items, handle with care",
          items: [{ item_id: firstProd.item_id, quantity: 1 }],
        },
      ],
    },
  });
  assert.equal(batchRes.json.error, "", "Batch checkout succeeded");
  assert.equal(batchRes.json.response.total_orders, 1);
  const createdOrder = batchRes.json.response.orders[0];
  console.log(`  ✓ Order created in database: order_sn = ${createdOrder.order_sn}, package = ${createdOrder.package_number}`);

  // 6. Confirm Delivery & Review
  console.log("\n▶ [6/7] Testing Delivery Confirmation & Review Submission...");
  const confirmRes = await request("/api/v2/simulator/order/confirm_delivery", {
    method: "POST",
    body: {
      order_sn: createdOrder.order_sn,
      buyer_user_id: 1001,
    },
  });
  assert.equal(confirmRes.json.error, "", "Order delivery confirmed");
  assert.equal(confirmRes.json.response.order_status, "COMPLETED");
  console.log(`  ✓ Order ${createdOrder.order_sn} transitioned to COMPLETED; Escrow released`);

  const reviewRes = await request("/api/v2/simulator/review/create", {
    method: "POST",
    body: {
      order_sn: createdOrder.order_sn,
      item_id: firstProd.item_id,
      rating_star: 5,
      comment: "Excellent product from Shopiz integration!",
      buyer_username: "demo",
      buyer_user_id: 1001,
    },
  });
  assert.equal(reviewRes.json.error, "", "Review created successfully");
  console.log(`  ✓ Review created for item ${firstProd.item_id}: 5 stars`);

  // 7. Seller Analytics
  console.log("\n▶ [7/7] Testing Seller Center Analytics...");
  const sellerRes = await request("/api/v2/simulator/seller/analytics?shop_id=727720655&period=today");
  assert.equal(sellerRes.json.error, "", "Seller analytics loaded");
  assert.ok(sellerRes.json.response.metrics.revenue >= 0, "Revenue metric valid");
  assert.ok(sellerRes.json.response.metrics.orders_count >= 1, "Orders count reflects placed order");
  console.log(`  ✓ Seller Analytics: Revenue = ₫${sellerRes.json.response.metrics.revenue.toLocaleString()}, Orders = ${sellerRes.json.response.metrics.orders_count}`);

  console.log("\n================================================================");
  console.log("🎉 ALL 7 E2E INTEGRATION CHECKS PASSED WITH 100% SUCCESS!");
  console.log("================================================================");
}

run().catch((err) => {
  console.error("\n❌ Integration check failed:", err);
  process.exit(1);
});
