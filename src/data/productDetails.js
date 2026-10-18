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
  const profile = profiles[product.category] || {
    brand:
      product.category === "Watches" ||
      product.category === "Bags & Accessories"
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
  const sizes = product.id === "7" ? ["S", "M", "L", "XL"] : profile.sizes;
  const reviews = Array.from({ length: 8 }, (_, index) => ({
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
    rating: index < (product.rating === "4.9" ? 7 : 6) ? 5 : 4,
    date: `2026-10-${String(16 - index).padStart(2, "0")}`,
    variant: profile.variants[index % profile.variants.length],
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
  return {
    ...profile,
    sizes,
    stock: product.stock,
    sku: `SZ-${product.id.padStart(4, "0")}`,
    seller: {
      name: `${profile.brand} Official Store`,
      rating: "4.9",
      responseRate: "98%",
      responseTime: "Within a few hours",
      joined: "2 years ago",
      followers: "12.8k",
      products: 128,
    },
    reviews,
    gallery: [
      { label: "Overview", scale: 1, position: "center" },
      { label: "Detail crop", scale: 1.45, position: "60% 40%" },
      { label: "Close-up", scale: 1.9, position: "35% 55%" },
    ],
  };
}
