import api from "./api";

export const orderService = {
  async getOrders(buyerId) {
    const url = buyerId
      ? `/simulator/orders?buyer_id=${buyerId}`
      : "/simulator/orders";
    const data = await api.get(url);
    return data.orders || [];
  },

  async getOrderDetail(orderSn) {
    const data = await api.get(`/simulator/order/detail?order_sn=${orderSn}`);
    return data.order;
  },

  async confirmDelivery(orderSn, buyerUserId) {
    const data = await api.post("/simulator/order/confirm_delivery", {
      order_sn: orderSn,
      buyer_user_id: buyerUserId,
    });
    return data;
  },

  async cancelOrder(orderSn, reason, status) {
    // If order is PROCESSED, buyer submits a cancellation request; otherwise instant cancel
    const endpoint =
      status === "PROCESSED"
        ? "/simulator/order/buyer_request_cancel"
        : "/simulator/order/buyer_cancel";
    const data = await api.post(endpoint, {
      order_sn: orderSn,
      cancel_reason: reason || "Buyer changed mind",
    });
    return data;
  },

  async createReview({ orderSn, itemId, modelId, ratingStar, comment, buyerUsername, buyerUserId }) {
    const data = await api.post("/simulator/review/create", {
      order_sn: orderSn,
      item_id: itemId,
      model_id: modelId,
      rating_star: ratingStar || 5,
      comment: comment || "",
      buyer_username: buyerUsername,
      buyer_user_id: buyerUserId,
    });
    return data;
  },

  async requestReturn(formDataOrPayload) {
    const isFormData = formDataOrPayload instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    const data = await api.post(
      "/simulator/returns/buyer_request",
      formDataOrPayload,
      config,
    );
    return data;
  },
};

export default orderService;
