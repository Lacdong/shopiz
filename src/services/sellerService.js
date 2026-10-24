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

  async getReviewSummary(shopId, lastVisitAt) {
    const query = new URLSearchParams({ shop_id: String(shopId) });
    if (lastVisitAt) query.set("last_visit_at", String(lastVisitAt));
    return api.get(`/simulator/reviews/summary?${query.toString()}`);
  },

  async getReviews(shopId, { pageSize = 20, cursor = 0, status = "ALL", ratings = [], keyword = "", dateFrom = "", dateTo = "" } = {}) {
    const query = new URLSearchParams({ shop_id: String(shopId), page_size: String(pageSize), cursor: String(cursor), status });
    if (ratings.length) query.set("rating_star_list", ratings.join(","));
    if (keyword) query.set("keyword", keyword);
    if (dateFrom) query.set("date_from", dateFrom);
    if (dateTo) query.set("date_to", dateTo);
    return api.get(`/simulator/reviews?${query.toString()}`);
  },

  async replyToReview(shopId, commentId, reply) {
    return api.post("/simulator/review/reply", { shop_id: shopId, comment_id: commentId, reply });
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

  async getProductDetail(itemId) {
    const data = await api.get(`/simulator/product/detail?item_id=${encodeURIComponent(itemId)}`);
    return data.product;
  },

  async updateProduct(payload) {
    return api.post("/simulator/product/update", payload);
  },

  async getProductCreationConfig(shopId) {
    return api.get(`/simulator/product-creation/config?shop_id=${encodeURIComponent(shopId)}`);
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
