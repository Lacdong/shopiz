import api from "./api";

export function getNumericBuyerId(userOrId) {
  const idStr = typeof userOrId === "object" ? userOrId?.id : userOrId;
  if (!idStr) return 1001;
  if (idStr === "user-001" || idStr === "1001") return 1001;
  if (idStr === "user-002" || idStr === "1002") return 1002;
  const num = parseInt(idStr, 10);
  return isNaN(num) ? 1001 : num;
}

export const authService = {
  /**
   * Login with email, username or phone number
   */
  async login(identity, password) {
    const data = await api.post("/simulator/auth/login", {
      identity,
      password,
    });
    return data; // { token, user }
  },

  /**
   * Register a new buyer account
   */
  async register({ username, password, name, phone, email }) {
    const data = await api.post("/simulator/auth/register", {
      username,
      password,
      name,
      phone,
      email,
    });
    return data; // { token, user }
  },

  /**
   * Request password reset code
   */
  async forgotPassword(identity) {
    const data = await api.post("/simulator/auth/forgot_password", {
      identity,
    });
    return data; // { message, otp_preview }
  },

  /**
   * Retrieve buyer profile
   */
  async getProfile(buyerId) {
    const data = await api.get(`/simulator/buyer/profile?buyer_id=${buyerId}`);
    return data.user;
  },

  /**
   * Update buyer profile
   */
  async updateProfile(buyerId, { name, email, phone, avatarUrl }) {
    const data = await api.put("/simulator/buyer/profile", {
      buyer_id: buyerId,
      name,
      email,
      phone,
      avatar_url: avatarUrl,
    });
    return data.user;
  },
};

export default authService;
