import { findShopByBrand } from "./shops";
const profiles = {
  Electronics: {
    brand: "SONORA",
    material: "ABS and aluminum",
    option: "Color",
    variants: ["Midnight", "Cloud"],
    sizes: [],
    highlights: [
      "Designed for a clean, everyday setup.",
      "Compact construction with a considered finish.",
      "Includes the main product and a quick-start guide.",
    ],
  },
  Gaming: {
    brand: "SONORA",
    material: "ABS and aluminum",
    option: "Color",
    variants: ["Black", "White"],
    sizes: [],
    highlights: [
      "A compact addition to your everyday setup.",
      "Comfortable layout for work and play.",
      "Includes the main product and a quick-start guide.",
    ],
  },
  Shoes: {
    brand: "NORTH / FORM",
    material: "Synthetic upper, rubber sole",
    option: "Color",
    variants: ["Classic", "Monochrome"],
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43"],
    highlights: [
      "A classic shape for your everyday rotation.",
      "Comfortable lining with a durable rubber sole.",
      "Wipe clean and air dry after use.",
    ],
  },
  "Sports & Outdoors": {
    brand: "NORTH / FORM",
    material: "Textile upper, rubber sole",
    option: "Color",
    variants: ["Classic", "Monochrome"],
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43"],
    highlights: [
      "Lightweight styling for everyday movement.",
      "Textile construction with a cushioned feel.",
      "Wipe clean and allow to air dry.",
    ],
  },
  "Men’s Fashion": {
    brand: "NORTH / FORM",
    material: "See individual product care label",
    option: "Style",
    variants: ["Classic", "Everyday"],
    sizes: [],
    highlights: [
      "A versatile staple for your everyday rotation.",
      "Thoughtful details with a minimal finish.",
      "Follow the included care instructions.",
    ],
  },
  "Beauty & Skincare": {
    brand: "atelier.",
    material: "See product packaging for ingredients",
    option: "Edition",
    variants: ["Original", "Gift set"],
    sizes: [],
    highlights: [
      "An everyday addition to your personal-care collection.",
      "Sealed packaging for convenient storage.",
      "Read the product label and directions before use.",
    ],
  },
};
export function getProductDetails(product) {
  const categoryStr =
    typeof product?.category === "string"
      ? product.category
      : product?.category?.category_name || "General";

  const profile = profiles[categoryStr] || {
    brand:
      categoryStr === "Watches" || categoryStr === "Bags & Accessories"
        ? "NORTH / FORM"
        : "atelier.",
    material: "See individual product specifications",
    option: "Style",
    variants: ["Original", "Classic"],
    sizes: [],
    highlights: [
      "A considered essential for everyday use.",
      "Simple design with a refined finish.",
      "Follow the included care instructions.",
    ],
  };

  const shop = findShopByBrand(profile.brand) || {
    id: product?.shopId || "shop-001",
    rating: "4.9",
    responseRate: "98%",
    joined: "2 years ago",
    followers: 12800,
    products: [1, 2, 3],
  };

  let tierVar = product?.tierVariation || product?.tier_variation;
  if (typeof tierVar === "string") {
    try {
      tierVar = JSON.parse(tierVar);
    } catch {
      tierVar = [];
    }
  }

  let variants = profile.variants || ["Standard"];
  let sizes = product?.id === "7" ? ["S", "M", "L", "XL"] : profile.sizes || [];
  let option = profile.option || "Style";

  if (Array.isArray(tierVar) && tierVar.length > 0) {
    option = tierVar[0]?.name || "Option";
    const tier0List = tierVar[0]?.option_list || tierVar[0]?.options;
    if (Array.isArray(tier0List) && tier0List.length > 0) {
      const parsed0 = tier0List
        .map((opt) =>
          typeof opt === "object" ? opt.option || opt.name || "" : String(opt),
        )
        .filter(Boolean);
      if (parsed0.length > 0) variants = parsed0;
    }
    const tier1List = tierVar[1]?.option_list || tierVar[1]?.options;
    if (Array.isArray(tier1List) && tier1List.length > 0) {
      const parsed1 = tier1List
        .map((opt) =>
          typeof opt === "object" ? opt.option || opt.name || "" : String(opt),
        )
        .filter(Boolean);
      if (parsed1.length > 0) sizes = parsed1;
    }
  } else if (Array.isArray(product?.models) && product.models.length > 0) {
    const fromModels = product.models
      .map((m) => m.model_name || m.name || "")
      .filter(Boolean);
    if (fromModels.length > 0) variants = fromModels;
  }

  if (!variants || variants.length === 0) {
    variants = ["Standard"];
  }

  const defaultReviews = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    name: [
      "Alex N.",
      "Jamie L.",
      "Sam T.",
      "Taylor P.",
      "Morgan D.",
      "Casey H.",
      "Robin V.",
      "Jordan K.",
    ][index],
    rating: index < (product?.rating === "4.9" ? 7 : 6) ? 5 : 4,
    date: `2026-10-${String(16 - index).padStart(2, "0")}`,
    variant: variants[index % variants.length] || "Standard",
    text: [
      "Just what I was looking for. The finish is clean and it fits nicely into my everyday routine.",
      "Arrived neatly packed. The product looks like the listing and feels well made for the price.",
      "A lovely everyday find. Simple, practical, and easy to recommend.",
      "Good value overall. Delivery took a little longer than expected, but everything arrived safely.",
    ][index % 4],
    hasPhoto: index % 3 === 0,
    response:
      index % 2 === 0
        ? "Thank you for sharing your experience. We’re happy you found a new everyday favorite."
        : null,
  }));

  const commentsList =
    Array.isArray(product?.comments) && product.comments.length
      ? product.comments
      : Array.isArray(product?.reviews?.items) && product.reviews.items.length
        ? product.reviews.items
        : null;

  const reviews = commentsList
    ? commentsList.map((c, i) => ({
        id: c.comment_id || i + 1,
        name: c.buyer_username || "Shopper",
        rating: Number(c.rating_star || 5),
        date: c.created_at
          ? String(c.created_at).slice(0, 10)
          : c.create_time
            ? new Date(c.create_time * 1000).toISOString().slice(0, 10)
            : "2026-10-22",
        variant: variants[0] || "Standard",
        text: c.comment || "Great product!",
        hasPhoto: Boolean(c.images?.length),
        response: c.reply || null,
      }))
    : defaultReviews;

  const seller =
    product?.seller?.shop_name || product?.seller?.name
      ? {
          id:
            product.seller.shop_id ||
            product.seller.id ||
            product.shopId ||
            "shop-001",
          name: product.seller.shop_name || product.seller.name,
          rating: String(
            product.seller.rating_star || product.seller.rating || "4.9",
          ),
          responseRate:
            product.seller.responseRate ||
            product.seller.response_rate ||
            "99%",
          responseTime:
            product.seller.responseTime || "Within a few hours",
          joined: product.seller.joined || "2 years ago",
          followers: product.seller.followers || "15.4k",
          products: Number(
            product.seller.total_products ||
              product.seller.products?.length ||
              product.seller.products ||
              24,
          ),
        }
      : product?.shopName
        ? {
            id: product.shopId || "shop-001",
            name: product.shopName,
            rating: "4.9",
            responseRate: "99%",
            responseTime: "Within a few hours",
            joined: "2 years ago",
            followers: "15.4k",
            products: 24,
          }
        : {
            id: shop.id,
            name: `${profile.brand} Official Store`,
            rating: shop.rating,
            responseRate: shop.responseRate,
            responseTime: "Within a few hours",
            joined: shop.joined,
            followers: new Intl.NumberFormat("en-US", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(shop.followers),
            products: shop.products.length,
          };

  return {
    ...profile,
    option,
    variants,
    sizes,
    stock: Number(product?.stock || 50),
    sku: `SZ-${String(product?.id || "0001").padStart(4, "0")}`,
    seller,
    reviews,
    gallery: [
      { label: "Overview", scale: 1, position: "center" },
      { label: "Detail crop", scale: 1.45, position: "60% 40%" },
      { label: "Close-up", scale: 1.9, position: "35% 55%" },
    ],
  };
}
