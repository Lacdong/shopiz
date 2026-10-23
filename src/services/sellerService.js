import api from "./api";

export const sellerService = {
  async getShops() {
    const data = await api.get("/simulator/shops");
    return data.shops || [];
  },

  async getOrders(shopId, status = "") {
    const query = new URLSearchParams();
    if (shopId) query.set("shop_id", shopId);
    if (status && status !== "ALL" && status !== "all") query.set("status", status);
    query.set("page_size", "50");
    const data = await api.get(`/simulator/orders?${query.toString()}`);
    return data.orders || [];
  },

  async shipOrder(orderSn, trackingNumber = "") {
    const data = await api.post("/simulator/order/ship", {
      order_sn: orderSn,
      ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
    });
    return data;
  },

  async generateAwb(orderSn) {
    const data = await api.post("/simulator/order/generate_awb", {
      order_sn: orderSn,
    });
    return data;
  },

  getAwbDownloadUrl(orderSn) {
    return `/api/v2/simulator/order/download_awb?order_sn=${encodeURIComponent(orderSn)}`;
  },

  async getAnalytics(shopId, period = "today") {
    const data = await api.get(
      `/simulator/seller/analytics?shop_id=${shopId}&period=${period}`,
    );
    return data; // { metrics, chart }
  },

  async createProduct(formDataOrPayload) {
    const isFormData = formDataOrPayload instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    const data = await api.post(
      "/simulator/product/create",
      formDataOrPayload,
      config,
    );
    return data;
  },

  async deleteProduct(itemId, shopId) {
    const data = await api.post("/simulator/product/delete", {
      item_id: itemId,
      shop_id: shopId,
    });
    return data;
  },

  async toggleUnlist(itemId, shopId, unlist) {
    const data = await api.post("/simulator/product/toggle_unlist", {
      item_id: itemId,
      shop_id: shopId,
      unlist: Boolean(unlist),
    });
    return data;
  },

  async quickUpdateStock(itemId, modelId, normalStock, shopId) {
    const data = await api.post("/simulator/product/quick_update_stock", {
      item_id: itemId,
      model_id: modelId,
      normal_stock: Number(normalStock),
      shop_id: shopId,
    });
    return data;
  },
};

export default sellerService;
