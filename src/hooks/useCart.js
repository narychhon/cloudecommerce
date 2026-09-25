import { useEffect, useState } from 'react';

const STORAGE_KEY = 'shopcart_cart';
const FREE_SHIPPING_THRESHOLD = 50;

function readCart() {
  if (typeof window === 'undefined') return [];

  try {
    const storedCart = window.localStorage.getItem(STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.filter((item) => (
      item?.product?.id
      && Number.isFinite(item.qty)
      && item.qty > 0
    ));
  } catch {
    return [];
  }
}

function getProductPrice(product) {
  const price = typeof product?.price === 'number'
    ? product.price
    : product?.price?.amount;

  return Number.isFinite(price) ? price : 0;
}

export function useCart() {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Keep cart interactions available when storage is unavailable or full.
    }
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    if (!product?.id || !Number.isFinite(quantity) || quantity <= 0) return;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (!existingItem) return [...currentItems, { product, qty: quantity }];

      return currentItems.map((item) => (
        item.product.id === product.id
          ? { product, qty: item.qty + quantity }
          : item
      ));
    });
  };

  const changeQuantity = (productId, quantity) => {
    if (!productId || !Number.isFinite(quantity)) return;

    if (quantity < 1) {
      setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
      return;
    }

    setItems((currentItems) => currentItems.map((item) => (
      item.product.id === productId ? { ...item, qty: quantity } : item
    )));
  };

  const removeItem = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setItems([]);
  const subtotal = items.reduce((total, item) => total + getProductPrice(item.product) * item.qty, 0);

  return {
    items,
    addToCart,
    changeQuantity,
    removeItem,
    clearCart,
    subtotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountUntilFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    isFreeShippingEligible: subtotal >= FREE_SHIPPING_THRESHOLD,
  };
}
