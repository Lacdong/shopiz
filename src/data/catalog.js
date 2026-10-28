export const image = (id, width = 500) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
export const categories = [
  "Women’s Fashion",
  "Men’s Fashion",
  "Beauty & Skincare",
  "Mobile & Gadgets",
  "Home & Living",
  "Electronics",
  "Bags & Accessories",
  "Shoes",
  "Watches",
  "Sports & Outdoors",
  "Health & Wellness",
  "Baby & Toys",
  "Groceries",
  "Books & Stationery",
  "Pet Supplies",
  "Automotive",
  "Jewelry",
  "Travel & Luggage",
  "Gaming",
  "More Categories",
];
const entries = [
  [
    "Studio Wireless Headphones · Noise Cancelling",
    "photo-1546435770-a3e426bf472b",
    49.9,
    89.9,
    "Electronics",
  ],
  [
    "Everyday Canvas Backpack · Classic Black",
    "photo-1553062407-98eeb64c6a62",
    12.5,
    25,
    "Bags & Accessories",
  ],
  [
    "Essential Minimalist Analog Watch",
    "photo-1524805444758-089113d48a6d",
    35.9,
    59.9,
    "Watches",
  ],
  [
    "Classic Court Sneakers · Everyday Comfort",
    "photo-1549298916-b41d501d3772",
    39.0,
    65,
    "Shoes",
  ],
  [
    "Portable Bluetooth Speaker · Deep Bass",
    "photo-1608043152269-423dbba4e7e1",
    24.9,
    49.9,
    "Electronics",
  ],
  [
    "Ceramic Coffee Cup · Slow Morning Collection",
    "photo-1514228742587-6b1558fcca3d",
    9.9,
    19.9,
    "Home & Living",
  ],
  [
    "Everyday Cotton Tee · Relaxed Fit",
    "photo-1521572163474-6864f9cf17ab",
    14.9,
    24.9,
    "Men’s Fashion",
  ],
  [
    "Daily Hydrating Skincare Essentials",
    "photo-1608571423902-eed4a5ad8108",
    22.5,
    35,
    "Beauty & Skincare",
  ],
  [
    "Minimal Desk Lamp · Adjustable Reading Light",
    "photo-1507473885765-e6ed057f782c",
    29.9,
    49.9,
    "Home & Living",
  ],
  [
    "Classic Leather Crossbody Shoulder Bag",
    "photo-1548036328-c9fa89d128fa",
    32.9,
    59.9,
    "Bags & Accessories",
  ],
  [
    "Retro Sunglasses · UV400 Protection",
    "photo-1511499767150-a48a237f0083",
    15.9,
    29.9,
    "Bags & Accessories",
  ],
  [
    "Everyday Running Shoes · Lightweight Edition",
    "photo-1542291026-7eec264c27ff",
    45.9,
    79.9,
    "Sports & Outdoors",
  ],
  [
    "Compact Mirrorless Camera · Creator Kit",
    "photo-1516035069371-29a1b244cc32",
    299,
    429,
    "Electronics",
  ],
  [
    "Modern Accent Chair · Home Collection",
    "photo-1598300042247-d088f8ab3a91",
    79.9,
    120,
    "Home & Living",
  ],
  [
    "Mechanical Keyboard · Compact Wireless",
    "photo-1587829741301-dc798b83add3",
    42.9,
    69,
    "Gaming",
  ],
  [
    "Premium Eau de Parfum · Signature Collection",
    "photo-1541643600914-78b084683601",
    29.9,
    49.9,
    "Beauty & Skincare",
  ],
  [
    "Minimal Leather Wallet · Everyday Carry",
    "photo-1627123424574-724758594e93",
    19.9,
    35,
    "Men’s Fashion",
  ],
  [
    "Indoor Plant · A Little Green for Your Space",
    "photo-1485955900006-10f4d324d411",
    11.9,
    20,
    "Home & Living",
  ],
];
export const mockProducts = entries.map(
  ([title, photo, price, original, category], index) => ({
    id: String(index + 1),
    title,
    image: image(photo),
    price,
    original,
    category,
    stock: 36,
    discount: Math.round((1 - price / original) * 100),
    rating: index % 3 === 0 ? "4.9" : "4.8",
    sold: [1200, 856, 2300, 647, 1500, 980][index % 6],
    location: ["Ho Chi Minh City", "Hanoi", "Da Nang"][index % 3],
    progress: [79, 62, 86, 45, 71, 56][index % 6],
    mall: index % 3 === 0,
  }),
);
export const products = [...mockProducts];
// Illustrative search trends for the marketplace simulator.
export const topSearches = [
  {
    label: "Wireless Headphones",
    query: "headphones",
    productId: "1",
    searches: "12.8k",
  },
  {
    label: "Everyday Sneakers",
    query: "shoes",
    productId: "4",
    searches: "10.2k",
  },
  {
    label: "Skincare Essentials",
    query: "skincare",
    productId: "8",
    searches: "8.6k",
  },
  {
    label: "Shoulder Bags",
    query: "shoulder bag",
    productId: "10",
    searches: "7.4k",
  },
  {
    label: "Classic Watches",
    query: "watch",
    productId: "3",
    searches: "6.9k",
  },
  { label: "Home & Living", query: "home", productId: "6", searches: "5.8k" },
].map((item) => ({
  ...item,
  image: products.find((p) => p.id === item.productId).image,
}));

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
