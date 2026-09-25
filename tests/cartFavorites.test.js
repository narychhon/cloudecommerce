import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useCart } from '../src/hooks/useCart.js';
import { useFavorites } from '../src/hooks/useFavorites.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots = [];

function HookProbe({ useHook, onValue }) {
  onValue(useHook());
  return null;
}

function renderHook(useHook) {
  const result = { current: undefined };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(createElement(HookProbe, { useHook, onValue: (value) => { result.current = value; } }));
  });

  mountedRoots.push({ root, container });
  return result;
}

function product(id, amount) {
  return {
    id,
    name: `${id} product`,
    price: { amount, currency: 'USD' },
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  act(() => {
    for (const { root, container } of mountedRoots.splice(0)) {
      root.unmount();
      container.remove();
    }
  });
  localStorage.clear();
});

describe('useCart', () => {
  it('adds products, increments existing quantities, and persists cart items', () => {
    const cart = renderHook(useCart);
    const headphones = product('headphones', 35);

    act(() => {
      cart.current.addToCart(headphones);
      cart.current.addToCart(headphones, 2);
    });

    expect(cart.current.items).toEqual([{ product: headphones, qty: 3 }]);
    expect(JSON.parse(localStorage.getItem('shopcart_cart'))).toEqual([
      { product: headphones, qty: 3 },
    ]);
  });

  it('changes quantity and removes an item when its quantity drops below one', () => {
    const cart = renderHook(useCart);
    const headphones = product('headphones', 35);

    act(() => {
      cart.current.addToCart(headphones, 2);
      cart.current.changeQuantity('headphones', 4);
    });
    expect(cart.current.items).toEqual([{ product: headphones, qty: 4 }]);

    act(() => cart.current.changeQuantity('headphones', 0));

    expect(cart.current.items).toEqual([]);
    expect(JSON.parse(localStorage.getItem('shopcart_cart'))).toEqual([]);
  });

  it('removes a selected item and clears all persisted items', () => {
    const cart = renderHook(useCart);
    const headphones = product('headphones', 35);
    const speaker = product('speaker', 20);

    act(() => {
      cart.current.addToCart(headphones);
      cart.current.addToCart(speaker);
      cart.current.removeItem('headphones');
    });
    expect(cart.current.items).toEqual([{ product: speaker, qty: 1 }]);

    act(() => cart.current.clearCart());

    expect(cart.current.items).toEqual([]);
    expect(JSON.parse(localStorage.getItem('shopcart_cart'))).toEqual([]);
  });

  it('calculates subtotal and free-shipping eligibility at the $50 threshold', () => {
    const cart = renderHook(useCart);
    const headphones = product('headphones', 35);
    const caseItem = product('case', 15);

    act(() => cart.current.addToCart(headphones));
    expect(cart.current.subtotal).toBe(35);
    expect(cart.current.freeShippingThreshold).toBe(50);
    expect(cart.current.amountUntilFreeShipping).toBe(15);
    expect(cart.current.isFreeShippingEligible).toBe(false);

    act(() => cart.current.addToCart(caseItem));
    expect(cart.current.subtotal).toBe(50);
    expect(cart.current.amountUntilFreeShipping).toBe(0);
    expect(cart.current.isFreeShippingEligible).toBe(true);
  });

  it('restores persisted cart data and falls back to empty for malformed storage', () => {
    const headphones = product('headphones', 35);
    localStorage.setItem('shopcart_cart', JSON.stringify([{ product: headphones, qty: 2 }]));

    const restoredCart = renderHook(useCart);
    expect(restoredCart.current.items).toEqual([{ product: headphones, qty: 2 }]);
    expect(restoredCart.current.subtotal).toBe(70);

    act(() => restoredCart.current.clearCart());
    localStorage.setItem('shopcart_cart', '{malformed');

    const emptyCart = renderHook(useCart);
    expect(emptyCart.current.items).toEqual([]);
  });
});

describe('useFavorites', () => {
  it('toggles favorite IDs, checks membership, and persists the list', () => {
    const favorites = renderHook(useFavorites);

    act(() => favorites.current.toggleFavorite('headphones'));

    expect(favorites.current.favorites).toEqual(['headphones']);
    expect(favorites.current.isFavorite('headphones')).toBe(true);
    expect(JSON.parse(localStorage.getItem('shopcart_favorites'))).toEqual(['headphones']);

    act(() => favorites.current.toggleFavorite('headphones'));

    expect(favorites.current.favorites).toEqual([]);
    expect(favorites.current.isFavorite('headphones')).toBe(false);
  });

  it('restores favorites and clears persisted IDs', () => {
    localStorage.setItem('shopcart_favorites', JSON.stringify(['headphones', 'speaker']));

    const favorites = renderHook(useFavorites);
    expect(favorites.current.isFavorite('speaker')).toBe(true);

    act(() => favorites.current.clearFavorites());

    expect(favorites.current.favorites).toEqual([]);
    expect(JSON.parse(localStorage.getItem('shopcart_favorites'))).toEqual([]);
  });

  it('uses an empty list when persisted favorites are malformed', () => {
    localStorage.setItem('shopcart_favorites', '{malformed');

    const favorites = renderHook(useFavorites);

    expect(favorites.current.favorites).toEqual([]);
    expect(favorites.current.isFavorite('headphones')).toBe(false);
  });
});
