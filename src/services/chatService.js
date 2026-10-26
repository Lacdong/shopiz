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
   * Fetches shop conversation threads
   */
  async getShopConversations(shopId) {
    const data = await api.get(`/simulator/chat/conversations?shop_id=${shopId}`);
    return data.conversations || [];
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
  async markRead(shopId, buyerUserId = 1001, readerType = "SELLER") {
    try {
      await api.post("/simulator/chat/mark_read", {
        shop_id: shopId,
        buyer_user_id: buyerUserId,
        reader_type: readerType,
      });
    } catch {
      // Non-critical background sync
    }
  },

  /**
   * Fetches 30-day chat performance metrics for the active shop
   */
  async getChatPerformance(shopId) {
    const data = await api.get(`/simulator/chat/performance?shop_id=${shopId}`);
    return data;
  },

  /**
   * Fetches auto-reply configuration
   */
  async getAutoReplySettings(shopId) {
    const data = await api.get(`/simulator/chat/auto_reply?shop_id=${shopId}`);
    return data;
  },

  /**
   * Updates auto-reply configuration
   */
  async updateAutoReplySettings(shopId, settings) {
    const data = await api.post("/simulator/chat/auto_reply", {
      shop_id: shopId,
      ...settings,
    });
    return data;
  },

  /**
   * Fetches quick-reply configuration and groups
   */
  async getQuickReplySettings(shopId) {
    const data = await api.get(`/simulator/chat/quick_reply?shop_id=${shopId}`);
    return data;
  },

  /**
   * Updates quick-reply configuration and groups
   */
  async updateQuickReplySettings(shopId, settings) {
    const data = await api.post("/simulator/chat/quick_reply", {
      shop_id: shopId,
      ...settings,
    });
    return data;
  },
};

export default chatService;
