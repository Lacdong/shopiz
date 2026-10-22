import api from "./api";

export const addressService = {
  async getAddresses(buyerId) {
    const data = await api.get(`/simulator/buyer/addresses?buyer_id=${buyerId}`);
    return data.addresses || [];
  },

  async createAddress(buyerId, address) {
    const data = await api.post("/simulator/buyer/addresses", {
      buyer_id: buyerId,
      recipient_name: address.name || address.recipient_name,
      recipient_phone: address.phone || address.recipient_phone,
      address_line: address.street || address.address_line,
      ward: address.ward || "",
      district: address.district || "",
      city: address.city || "",
      state: address.state || "",
      zipcode: address.zipcode || "",
      is_default: Boolean(address.isDefault || address.is_default),
    });
    return data.address;
  },

  async updateAddress(addressId, address) {
    const data = await api.put(`/simulator/buyer/addresses/${addressId}`, {
      buyer_id: address.buyerId || address.buyer_id,
      recipient_name: address.name || address.recipient_name,
      recipient_phone: address.phone || address.recipient_phone,
      address_line: address.street || address.address_line,
      ward: address.ward,
      district: address.district,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      is_default: address.isDefault !== undefined ? address.isDefault : address.is_default,
    });
    return data.address;
  },

  async deleteAddress(addressId) {
    const data = await api.delete(`/simulator/buyer/addresses/${addressId}`);
    return data.deleted;
  },

  async setDefaultAddress(addressId) {
    const data = await api.post(`/simulator/buyer/addresses/${addressId}/set_default`);
    return data;
  },
};

export default addressService;
