import { afterEach, describe, expect, it, vi } from 'vitest';
import { brands, categories, heroPromotions, products } from '../src/data/mockData.js';
import {
  getBrands,
  getCategories,
  getProductById,
  getProductBySlug,
  getProducts,
  getPromotions,
} from '../src/services/catalogService.js';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('catalogService', () => {
  it('returns products with pagination metadata', async () => {
    const result = await getProducts();

    expect(result).toEqual({
      items: products.slice(0, 12),
      total: products.length,
      page: 1,
      pageSize: 12,
      totalPages: Math.ceil(products.length / 12),
    });
  });

  it('filters products by category and inclusive price range', async () => {
    const result = await getProducts({
      filters: {
        categoryId: 'headphones',
        priceRange: { min: 89, max: 89 },
      },
      pageSize: products.length,
    });

    expect(result.items.map((product) => product.id)).toEqual(['earbuds']);
  });

  it('matches any selected color', async () => {
    const result = await getProducts({
      filters: { colors: ['pink'] },
      pageSize: products.length,
    });

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((product) => product.colors.includes('pink'))).toBe(true);
  });

  it('filters to products whose sale price is below their old price', async () => {
    const result = await getProducts({
      filters: { onSale: true },
      pageSize: products.length,
    });

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((product) => product.oldPrice.amount > product.price.amount)).toBe(true);
  });

  it('searches product names, descriptions, categories, and brands case-insensitively', async () => {
    const byBrand = await getProducts({ query: 'APPLE', pageSize: products.length });
    const byName = await getProducts({ query: 'AIRPODS MAX', pageSize: products.length });
    const byDescription = await getProducts({ query: 'ROOM-FILLING', pageSize: products.length });
    const byCategory = await getProducts({ query: 'FURNITURE', pageSize: products.length });

    expect(byBrand.items.map((product) => product.id)).toEqual(['airpods', 'homepod', 'macbook']);
    expect(byName.items.map((product) => product.id)).toEqual(['airpods']);
    expect(byDescription.items.map((product) => product.id)).toEqual(['homepod']);
    expect(byCategory.items.map((product) => product.id)).toEqual(['sofa']);
  });

  it('sorts products by price in ascending and descending order', async () => {
    const ascending = await getProducts({ sortBy: 'price-asc', pageSize: products.length });
    const descending = await getProducts({ sortBy: 'price-desc', pageSize: products.length });

    expect(ascending.items.map((product) => product.price.amount)).toEqual(
      [...products].map((product) => product.price.amount).sort((a, b) => a - b),
    );
    expect(descending.items.map((product) => product.price.amount)).toEqual(
      [...products].map((product) => product.price.amount).sort((a, b) => b - a),
    );
  });

  it('paginates the filtered and sorted product list', async () => {
    const result = await getProducts({ page: 2, pageSize: 5 });

    expect(result.items).toEqual(products.slice(5, 10));
    expect(result).toMatchObject({ total: products.length, page: 2, pageSize: 5 });
  });

  it('looks products up by ID and slug', async () => {
    await expect(getProductById('earbuds')).resolves.toEqual(products[0]);
    await expect(getProductBySlug('airpods-max')).resolves.toEqual(products[1]);
    await expect(getProductById('missing')).resolves.toBeNull();
    await expect(getProductBySlug('missing')).resolves.toBeNull();
  });

  it('returns categories, brands, and promotions', async () => {
    await expect(getCategories()).resolves.toEqual(categories);
    await expect(getBrands()).resolves.toEqual(brands);
    await expect(getPromotions()).resolves.toEqual(heroPromotions);
  });

  it('reads Strapi config values from the Vite environment', async () => {
    vi.stubEnv('VITE_STRAPI_API_URL', 'https://cms.example.test');
    vi.stubEnv('VITE_STRAPI_TOKEN', 'test-token');
    vi.resetModules();

    const { apiConfig } = await import('../src/services/apiConfig.js');

    expect(apiConfig).toEqual({
      strapiApiUrl: 'https://cms.example.test',
      strapiToken: 'test-token',
    });
  });
});
