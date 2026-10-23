import api from "./api";

export const chatService = {
  /**
   * Fetches recent message history between a shop and a buyer
   */
  async getMessages(shopId, buyerUserId = 1001) {
    const data = await api.get(
      `/simulator/chat/messages?shop_id=${shopId}&buyer_user_id=${buyerUserId}`,
    );
    return data.messages || [];
  },

  /**
   * Sends a message from the buyer or shop
   */
  async sendMessage({
    shopId,
    buyerUserId = 1001,
    buyerUsername = "demo",
    senderType = "BUYER",
    message,
    orderSn = null,
  }) {
    const data = await api.post("/simulator/chat/send", {
      shop_id: shopId,
      buyer_user_id: buyerUserId,
      buyer_username: buyerUsername,
      sender_type: senderType,
      message,
      order_sn: orderSn,
    });
    return data;
  },

  /**
   * Marks unread messages as read
   */
  async markRead(shopId, buyerUserId = 1001) {
    try {
      await api.post("/simulator/chat/mark_read", {
        shop_id: shopId,
        buyer_user_id: buyerUserId,
      });
    } catch {
      // Non-critical background sync
    }
  },
};

export default chatService;
