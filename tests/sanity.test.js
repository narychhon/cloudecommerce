import { describe, expect, it } from 'vitest';
import { brands, categories, heroPromotions, products } from '../src/data/mockData.js';

describe('Shopcart mock catalog', () => {
  it('exposes complete products linked to normalized categories', () => {
    const categoryIds = new Set(categories.map((category) => category.id));
    const productIds = products.map((product) => product.id);

    expect(products.length).toBeGreaterThan(0);
    expect(new Set(productIds).size).toBe(products.length);

    for (const product of products) {
      expect(product.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(categoryIds.has(product.categoryId)).toBe(true);
      expect(product.price.amount).toEqual(expect.any(Number));
      expect(product.oldPrice.amount).toBeGreaterThan(product.price.amount);
      expect(product.rating.average).toBeGreaterThanOrEqual(0);
      expect(product.rating.average).toBeLessThanOrEqual(5);
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.variants.length).toBeGreaterThan(0);
      expect(product.stock.count).toBeGreaterThanOrEqual(0);
      expect(Object.keys(product.specifications).length).toBeGreaterThan(0);
    }
  });

  it('exports category, brand, and hero-promotion records', () => {
    expect(categories.length).toBeGreaterThan(0);
    expect(brands.length).toBeGreaterThan(0);
    expect(heroPromotions.length).toBeGreaterThan(0);
  });
});
