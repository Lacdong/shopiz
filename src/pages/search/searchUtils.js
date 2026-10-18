import { products } from "../../data/catalog";
import { getProductDetails } from "../../data/productDetails";
export const searchCatalog = products.map((product) => ({
  ...product,
  brand: getProductDetails(product).brand,
  freeShipping: true,
}));
export const searchCategories = [
  ...new Set(searchCatalog.map((p) => p.category)),
];
export const searchLocations = [
  ...new Set(searchCatalog.map((p) => p.location)),
];
export const searchBrands = [...new Set(searchCatalog.map((p) => p.brand))];
const normalize = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function matchesQuery(product, query) {
  const words = normalize(query).match(/[\p{L}\p{N}]+/gu) || [];
  const text = normalize(
    `${product.title} ${product.category} ${product.brand}`,
  );
  return words.every((word) => text.includes(word));
}
export function filterSearch(params) {
  const query = params.get("q") || "";
  const categories = params.getAll("category");
  const locations = params.getAll("location");
  const brands = params.getAll("brand");
  const min = params.get("min");
  const max = params.get("max");
  const rating = Number(params.get("rating")) || 0;
  const base = searchCatalog.filter((p) => matchesQuery(p, query));
  const filtered = base.filter(
    (p) =>
      (!categories.length || categories.includes(p.category)) &&
      (!locations.length || locations.includes(p.location)) &&
      (!brands.length || brands.includes(p.brand)) &&
      (!min || !Number.isFinite(Number(min)) || p.price >= Number(min)) &&
      (!max || !Number.isFinite(Number(max)) || p.price <= Number(max)) &&
      Number(p.rating) >= rating &&
      (params.get("mall") !== "1" || p.mall) &&
      (params.get("shipping") !== "1" || p.freeShipping),
  );
  const sort = params.get("sort") || "relevance";
  filtered.sort((a, b) =>
    sort === "price-asc"
      ? a.price - b.price
      : sort === "price-desc"
        ? b.price - a.price
        : sort === "latest"
          ? Number(b.id) - Number(a.id)
          : sort === "sales"
            ? b.sold - a.sold
            : 0,
  );
  return { base, filtered };
}
