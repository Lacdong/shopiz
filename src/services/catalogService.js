import api from "./api";

const fallbackCategoryImages = {
  Electronics:
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85",
  "Fashion & Apparel":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=85",
  "Men’s Fashion":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=85",
  "Women’s Fashion":
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=85",
  Shoes:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=85",
  "Home & Living":
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=500&q=85",
  "Beauty & Skincare":
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=500&q=85",
};

export function mapBackendProduct(item) {
  if (!item) return null;
  const price = Number(item.current_price || item.original_price || 0);
  const original = Number(item.original_price || price);
  const discount =
    item.discount_percentage !== undefined && item.discount_percentage !== null
      ? Number(item.discount_percentage)
      : original > price
        ? Math.round((1 - price / original) * 100)
        : 0;

  // Extract images from array, object, or string
  let imgList = [];
  if (Array.isArray(item.images)) {
    imgList = item.images.filter(Boolean);
  } else if (item.images && typeof item.images === "object") {
    if (Array.isArray(item.images.image_url_list)) {
      imgList = item.images.image_url_list.filter(Boolean);
    }
  } else if (typeof item.image === "string") {
    imgList = [item.image];
  }

  // Handle category both as string name or as object { category_id, category_name }
  const categoryName =
    typeof item.category === "string"
      ? item.category
      : item.category?.category_name || item.category_name || "General";

  const categoryId =
    item.category_id ||
    (typeof item.category === "object" ? item.category?.category_id : null);

  let primaryImage = imgList[0];

  // If missing or mock URL, select appropriate high-res Unsplash photo
  if (
    !primaryImage ||
    primaryImage.includes("mock_default_image") ||
    primaryImage.includes("custom_product_image")
  ) {
    const titleLower = (item.item_name || "").toLowerCase();
    if (
      titleLower.includes("trouser") ||
      titleLower.includes("pant") ||
      titleLower.includes("denim") ||
      titleLower.includes("tee") ||
      titleLower.includes("jacket")
    ) {
      primaryImage =
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=85";
    } else if (titleLower.includes("sneaker") || titleLower.includes("shoe")) {
      primaryImage =
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=85";
    } else if (titleLower.includes("watch")) {
      primaryImage =
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=85";
    } else if (
      titleLower.includes("earbud") ||
      titleLower.includes("headphone") ||
      titleLower.includes("audio")
    ) {
      primaryImage =
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85";
    } else if (titleLower.includes("keyboard")) {
      primaryImage =
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=85";
    } else {
      primaryImage =
        fallbackCategoryImages[categoryName] ||
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85";
    }
  }

  const finalImages = imgList.length
    ? imgList.map((url) =>
        url.includes("mock_default_image") || url.includes("custom_product_image")
          ? primaryImage
          : url,
      )
    : [primaryImage];

  const stock =
    Array.isArray(item.models) && item.models.length
      ? item.models.reduce(
          (sum, m) => sum + Number(m.seller_stock || m.normal_stock || 0),
          0,
        )
      : Number(item.stock || item.normal_stock || 50);

  const rawComments =
    Array.isArray(item.comments) && item.comments.length
      ? item.comments
      : Array.isArray(item.reviews?.items)
        ? item.reviews.items
        : [];

  return {
    id: String(item.item_id),
    itemId: item.item_id,
    title: item.item_name || "Untitled Product",
    image: primaryImage,
    images: finalImages,
    price,
    original,
    category: categoryName,
    categoryId,
    stock,
    discount,
    rating: item.shop_rating
      ? String(item.shop_rating)
      : item.rating
        ? String(item.rating)
        : item.reviews?.average_rating
          ? String(item.reviews.average_rating)
          : "4.9",
    sold: Number(item.sales || item.sold || 48),
    location: item.location || "Ho Chi Minh City",
    progress: Math.min(
      100,
      Math.max(25, ((Number(item.sales || 20) * 3) % 85) + 15),
    ),
    mall: Boolean(item.is_official_shop || item.shop_name?.includes("Official")),
    shopId: item.shop_id || item.seller?.shop_id,
    shopName: item.shop_name || item.seller?.shop_name || "Official Store",
    tierVariation: item.tier_variation,
    models: item.models || [],
    description: item.description || "",
    comments: rawComments,
    reviews: item.reviews || null,
    seller: {
      id: item.seller?.shop_id || item.shop_id || "shop-001",
      name: item.seller?.shop_name || item.shop_name || "Official Flagship",
      rating: String(item.seller?.rating || item.shop_rating || "4.9"),
      ratingCount: Number(item.seller?.rating_count || 0),
      isVacation: Boolean(item.seller?.is_vacation),
      responseRate:
        item.seller?.response_rate || item.seller?.responseRate || "98%",
      responseTime: item.seller?.responseTime || "Within a few hours",
      joined: item.seller?.joined || "2 years ago",
      followers: item.seller?.followers || "15.4k",
      products: Number(
        item.seller?.total_products ||
          item.seller?.products?.length ||
          item.seller?.products ||
          24,
      ),
    },
  };
}

export const catalogService = {
  async getCategories() {
    const data = await api.get("/simulator/categories");
    return data.categories || [];
  },

  async getProducts({ query, categoryId, sort, page = 1, pageSize = 50 } = {}) {
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

  async calculateShippingFee({ shopId, recipientCity, items = [] }) {
    const data = await api.post("/simulator/logistics/calculate_fee", {
      shop_id: shopId,
      recipient_city: recipientCity,
      items,
    });
    return data;
  },
};

export default catalogService;
