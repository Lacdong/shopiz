import api from "./api";

export const checkoutService = {
  async getLogisticsChannels() {
    const data = await api.get("/simulator/logistics/channels");
    return data.channels || [];
  },

  async validateVoucher({ voucherCode, shopId, basketAmount }) {
    const data = await api.post("/simulator/voucher/validate", {
      voucher_code: voucherCode,
      shop_id: shopId,
      basket_amount: basketAmount,
    });
    return data; // { valid, discount_amount, voucher }
  },

  async batchCheckout(payload) {
    const data = await api.post("/simulator/order/batch_checkout", payload);
    return data; // { total_orders, total_amount, orders }
  },
};

export default checkoutService;
