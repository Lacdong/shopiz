export const image = (id, width = 500) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

// Categories are dynamically populated from Shopee Simulator backend via CatalogProvider
export const categories = [];

// Products are dynamically populated from Shopee Simulator backend via CatalogProvider
export const mockProducts = [];
export const products = [];

// Search trends with direct imagery (retained for UI discovery)
export const topSearches = [
  {
    label: "Wireless Headphones",
    query: "headphones",
    searches: "12.8k",
    image: image("photo-1546435770-a3e426bf472b"),
  },
  {
    label: "Everyday Sneakers",
    query: "shoes",
    searches: "10.2k",
    image: image("photo-1549298916-b41d501d3772"),
  },
  {
    label: "Skincare Essentials",
    query: "skincare",
    searches: "8.6k",
    image: image("photo-1608571423902-eed4a5ad8108"),
  },
  {
    label: "Shoulder Bags",
    query: "shoulder bag",
    searches: "7.4k",
    image: image("photo-1548036328-c9fa89d128fa"),
  },
  {
    label: "Classic Watches",
    query: "watch",
    searches: "6.9k",
    image: image("photo-1524805444758-089113d48a6d"),
  },
  {
    label: "Home & Living",
    query: "home",
    searches: "5.8k",
    image: image("photo-1514228742587-6b1558fcca3d"),
  },
];

export const money = (value) => {
  const num = Number(value) || 0;
  if (num >= 1000) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};
export const banners = [
  {
    eyebrow: "THE EVERYDAY EDIT",
    title: "A little more\neveryday.",
    description: "Good finds. Great prices. All in one place.",
    cta: "Explore the edit",
    photo: "photo-1546435770-a3e426bf472b",
    tag: "UP TO 50% OFF",
    to: "/collection/everyday",
  },
  {
    eyebrow: "MAKE ROOM FOR BETTER",
    title: "Your space.\nYour style.",
    description: "Thoughtful essentials for a home that feels like you.",
    cta: "Shop home & living",
    photo: "photo-1598300042247-d088f8ab3a91",
    tag: "FRESH FINDS",
    to: "/category/Home%20%26%20Living",
  },
  {
    eyebrow: "THE NEW ROTATION",
    title: "Less ordinary.\nMore you.",
    description: "Everyday staples with a little something extra.",
    cta: "Discover new arrivals",
    photo: "photo-1521572163474-6864f9cf17ab",
    tag: "JUST DROPPED",
    to: "/collection/new-arrivals",
  },
];
