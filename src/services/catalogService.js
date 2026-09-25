import { brands, categories, heroPromotions, products } from '../data/mockData.js';

const DEFAULT_PAGE_SIZE = 12;

function priceOf(product) {
  return product.price.amount;
}

function matchesPriceRange(product, priceRange = {}) {
  const price = priceOf(product);
  return (priceRange.min == null || price >= priceRange.min)
    && (priceRange.max == null || price <= priceRange.max);
}

function matchesSearch(product, query) {
  if (!query) return true;

  const categoryName = categories.find((category) => category.id === product.categoryId)?.name ?? '';
  const brandName = brands.find((brand) => brand.id === product.brandId)?.name ?? '';
  const searchableText = [product.name, product.description, categoryName, brandName]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(query);
}

function sortProducts(items, sortBy) {
  const sortedItems = [...items];

  switch (sortBy) {
    case 'price-asc':
      return sortedItems.sort((first, second) => priceOf(first) - priceOf(second));
    case 'price-desc':
      return sortedItems.sort((first, second) => priceOf(second) - priceOf(first));
    case 'rating-desc':
      return sortedItems.sort((first, second) => second.rating.average - first.rating.average);
    case 'name-asc':
      return sortedItems.sort((first, second) => first.name.localeCompare(second.name));
    case 'featured':
    default:
      return sortedItems;
  }
}

/**
 * @param {{
 *   filters?: { categoryId?: string|null, priceRange?: { min?: number|null, max?: number|null }, colors?: string[], onSale?: boolean },
 *   query?: string,
 *   sortBy?: 'featured'|'price-asc'|'price-desc'|'rating-desc'|'name-asc',
 *   page?: number,
 *   pageSize?: number,
 * }} [options]
 */
export async function getProducts({
  filters = {},
  query = '',
  sortBy = 'featured',
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedColors = (filters.colors ?? []).map((color) => color.toLowerCase());
  const filteredProducts = products.filter((product) => {
    if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
    if (!matchesPriceRange(product, filters.priceRange)) return false;
    if (selectedColors.length && !product.colors.some((color) => selectedColors.includes(color.toLowerCase()))) {
      return false;
    }
    if (filters.onSale && product.oldPrice.amount <= product.price.amount) return false;

    return matchesSearch(product, normalizedQuery);
  });

  const sortedProducts = sortProducts(filteredProducts, sortBy);
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const start = (safePage - 1) * safePageSize;

  return {
    items: sortedProducts.slice(start, start + safePageSize),
    total: sortedProducts.length,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(sortedProducts.length / safePageSize),
  };
}

/** @param {string} id */
export async function getProductById(id) {
  return products.find((product) => product.id === id) ?? null;
}

/** @param {string} slug */
export async function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCategories() {
  return categories;
}

export async function getBrands() {
  return brands;
}

export async function getPromotions() {
  return heroPromotions;
}
