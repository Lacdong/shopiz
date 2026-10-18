export const mockShops = [
  {
    id: "sonora",
    brand: "SONORA",
    name: "SONORA Official Store",
    tagline: "Sound made personal.",
    offer: "Up to 40% off",
    products: ["1", "5", "13", "15"],
    followers: 12800,
    rating: "4.9",
    responseRate: "98%",
    joined: "2 years ago",
    heroTitle: "A little more\nin every listen.",
    heroText: "Find your rhythm. Build your setup. Make more of the everyday.",
    story:
      "From a quieter commute to a desk that feels like yours, SONORA brings considered tech into everyday life. Explore sound, creative tools and compact essentials in our sample collection.",
  },
  {
    id: "atelier",
    brand: "atelier.",
    name: "atelier. Official Store",
    tagline: "Considered essentials.",
    offer: "Your everyday, elevated",
    products: ["6", "8", "9", "14", "16", "18"],
    followers: 18200,
    rating: "4.9",
    responseRate: "99%",
    joined: "2 years ago",
    heroTitle: "Small details.\nBetter everyday.",
    heroText:
      "Thoughtful finds for your space, your rituals and your little moments.",
    story:
      "A slower morning. A favorite corner. A little time for yourself. The atelier. collection brings simple shapes and thoughtful details to the things you reach for every day.",
  },
  {
    id: "north-form",
    brand: "NORTH / FORM",
    name: "NORTH / FORM Official Store",
    tagline: "Made for the everyday.",
    offer: "New season essentials",
    products: ["2", "3", "4", "7", "10", "11", "12", "17"],
    followers: 9600,
    rating: "4.9",
    responseRate: "98%",
    joined: "2 years ago",
    heroTitle: "Made for\nwherever you go.",
    heroText:
      "Wear it your way. Everyday staples with a little more character.",
    story:
      "Your everyday rotation, considered. NORTH / FORM brings together easy staples, useful accessories and familiar silhouettes for wherever the day takes you.",
  },
];
export const findShop = (id) =>
  mockShops.find((shop) => shop.id === id) || null;
export const findShopByBrand = (brand) =>
  mockShops.find((shop) => shop.brand === brand) || null;
