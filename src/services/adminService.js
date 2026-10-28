import api from "./api";

export const adminService = {
  // =========================================================================
  // 1. Returns & Dispute Arbitration
  // =========================================================================
  async getReturns(shopId = "ALL") {
    const query = new URLSearchParams();
    if (shopId && shopId !== "ALL") {
      query.set("shop_id", String(shopId));
    }
    const data = await api.get(`/simulator/returns?${query.toString()}`);
    return {
      summary: data?.summary || {
        total: 0,
        requested: 0,
        judging: 0,
        processing: 0,
        accepted: 0,
        closed: 0,
        disputed: 0,
      },
      returns: data?.returns || [],
    };
  },

  async reviewReturn(returnSn, action, reason = "") {
    return await api.post("/simulator/admin/returns/review", {
      return_sn: returnSn,
      action, // "APPROVE" | "REJECT"
      reason,
    });
  },

  async warehouseInbound(returnSn, result, inspectionNotes = "") {
    return await api.post("/simulator/admin/returns/warehouse_inbound", {
      return_sn: returnSn,
      result, // "PASS" | "FAIL"
      inspection_notes: inspectionNotes,
    });
  },

  async arbitrateDispute(returnSn, verdict, compensationAmount = 0, rulingNotes = "") {
    return await api.post("/simulator/admin/returns/arbitrate_dispute", {
      return_sn: returnSn,
      verdict, // "BUYER_WIN" | "SELLER_WIN"
      compensation_amount: Number(compensationAmount) || 0,
      ruling_notes: rulingNotes,
    });
  },

  // =========================================================================
  // 2. Webhooks
  // =========================================================================
  async getWebhookLogs(filters = {}) {
    const query = new URLSearchParams();
    if (filters.push_code) query.set("push_code", String(filters.push_code));
    if (filters.status) query.set("status", String(filters.status));
    if (filters.ordersn) query.set("ordersn", String(filters.ordersn));
    if (filters.shop_id) query.set("shop_id", String(filters.shop_id));

    const data = await api.get(`/webhook/logs?${query.toString()}`);
    return {
      total: data?.total || 0,
      logs: data?.logs || [],
    };
  },

  async setWebhookUrl(webhookUrl, partnerId = 1001141) {
    return await api.post("/public/set_webhook_url", {
      partner_id: Number(partnerId),
      webhook_url: webhookUrl,
    });
  },

  async triggerWebhook(payload) {
    return await api.post("/simulator/webhook/trigger", {
      partner_id: payload.partner_id || 1001141,
      push_code: Number(payload.push_code) || 3,
      shop_id: Number(payload.shop_id) || 727720655,
      ordersn: payload.ordersn || undefined,
      data: payload.data || {},
    });
  },

  async retryFailedWebhooks() {
    return await api.post("/webhook/retry");
  },

  async clearWebhookLogs() {
    return await api.delete("/webhook/logs/clear");
  },

  // =========================================================================
  // 3. Fault Injection
  // =========================================================================
  async getFaultConfig() {
    return await api.get("/simulator/config");
  },

  async updateFaultConfig(config) {
    return await api.post("/simulator/config", config);
  },

  async resetFaultConfig() {
    return await api.post("/simulator/config", {
      rateLimitEnabled: false,
      rateLimitPerMin: 100,
      forceExpiredToken: false,
      forceInvalidSign: false,
      artificialDelayMs: 0,
      strictTimestamp: true,
    });
  },

  // =========================================================================
  // 4. Order Fast-Forward & SLA
  // =========================================================================
  async getOrders(shopId = "", status = "") {
    const query = new URLSearchParams();
    if (shopId && shopId !== "ALL") query.set("shop_id", String(shopId));
    if (status && status !== "ALL") query.set("status", status);
    query.set("page_size", "50");
    const data = await api.get(`/simulator/orders?${query.toString()}`);
    return data?.orders || [];
  },

  async advanceOrderPaid(orderSn, shopId = 727720655) {
    return await api.post("/simulator/order/pay", {
      order_sn: orderSn,
      shop_id: Number(shopId),
    });
  },

  async advanceOrderCarrierPickup(orderSn, shopId = 727720655) {
    return await api.post("/simulator/order/carrier_pickup", {
      order_sn: orderSn,
      shop_id: Number(shopId),
    });
  },

  async advanceOrderDelivered(orderSn, shopId = 727720655) {
    return await api.post("/simulator/order/deliver", {
      order_sn: orderSn,
      shop_id: Number(shopId),
    });
  },

  async expireOverdueOrders(shopId = 727720655) {
    return await api.post("/simulator/order/expire_overdue", {
      shop_id: Number(shopId),
    });
  },

  // =========================================================================
  // 5. OAuth & Store Management
  // =========================================================================
  async getShops() {
    const data = await api.get("/simulator/shops");
    return data?.shops || [];
  },

  async getShopOverview(shopId = 727720655) {
    return await api.get(`/simulator/shop/overview?shop_id=${Number(shopId)}`);
  },

  async toggleVacation(shopId, vacation) {
    return await api.post("/simulator/shop/vacation", {
      shop_id: Number(shopId),
      is_vacation: Boolean(vacation),
      vacation: Boolean(vacation),
    });
  },

  async refreshToken(shopId) {
    return await api.post("/simulator/shop/refresh_token", {
      shop_id: Number(shopId),
    });
  },
};

export default adminService;
