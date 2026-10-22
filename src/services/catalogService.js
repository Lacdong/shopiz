import api from "./api";

export function mapBackendProduct(item) {
  if (!item) return null;
  const price = Number(item.current_price || item.original_price || 0);
  const original = Number(item.original_price || price);
  const discount =
    item.discount_percentage !== undefined
      ? Number(item.discount_percentage)
      : original > price
        ? Math.round((1 - price / original) * 100)
        : 0;

  const images = Array.isArray(item.images)
    ? item.images
    : item.image
      ? [item.image]
      : [];

  return {
    id: String(item.item_id),
    itemId: item.item_id,
    title: item.item_name,
    image: item.image || images[0] || "",
    images,
    price,
    original,
    category: item.category_name || item.category || "General",
    categoryId: item.category_id,
    stock: Number(item.stock || item.normal_stock || 0),
    discount,
    rating: item.shop_rating
      ? String(item.shop_rating)
      : item.rating
        ? String(item.rating)
        : "4.9",
    sold: Number(item.sales || item.sold || 0),
    location: item.location || "Ho Chi Minh City",
    progress: Math.min(100, Math.max(15, ((Number(item.sales || 0) * 3) % 95) + 10)),
    mall: Boolean(item.is_official_shop || item.mall),
    shopId: item.shop_id,
    shopName: item.shop_name || "Official Store",
    tierVariation: item.tier_variation,
    models: item.models || [],
    description: item.description || "",
    seller: item.seller || {
      id: item.shop_id,
      name: item.shop_name || "Official Store",
      rating: "4.9",
      followers: "12.8k",
      responseRate: "98%",
    },
  };
}

export const catalogService = {
  async getCategories() {
    const data = await api.get("/simulator/categories");
    return data.categories || [];
  },

  async getProducts({ query, categoryId, sort, page = 1, pageSize = 24 } = {}) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoryId) params.set("category_id", categoryId);
    if (sort) params.set("sort", sort);
    if (page) params.set("page", String(page));
    if (pageSize) params.set("page_size", String(pageSize));

    const data = await api.get(`/simulator/products?${params.toString()}`);
    return {
      products: data.products || [],
      total: data.total || 0,
      page: data.page || page,
      pageSize: data.page_size || pageSize,
    };
  },

  async getProductDetail(itemId) {
    const data = await api.get(`/simulator/product/detail?item_id=${itemId}`);
    return data.product;
  },

  async getShopDetail(shopId) {
    const data = await api.get(`/simulator/shop/detail?shop_id=${shopId}`);
    return data.shop;
  },
};

export default catalogService;
