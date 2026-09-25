import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const componentModules = import.meta.glob('../src/components/*.{js,jsx}', { eager: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const legacyProduct = {
  id: 'legacy',
  name: 'Legacy headphones',
  price: 89,
  old: 119,
  image: 'product-headphones.png',
  color: 'black',
  colors: ['black', 'blue'],
  rating: 4.9,
  reviewCount: 121,
  desc: 'A legacy product description.',
  category: 'Headphones',
};

const normalizedProduct = {
  id: 'normalized',
  name: 'Normalized headphones',
  price: { amount: 89, currency: 'USD' },
  oldPrice: { amount: 119, currency: 'USD' },
  images: [{ src: '/assets/product-headphones.png', alt: 'Headphones' }],
  colors: ['black', 'blue'],
  rating: { average: 4.9, count: 121 },
  description: 'A normalized product description.',
  categoryId: 'headphones',
};

const mountedRoots = [];

function render(element) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(element));
  mountedRoots.push({ root, container });
  return container;
}

afterEach(() => {
  for (const { root, container } of mountedRoots.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
});

describe('product UI utilities', () => {
  it('reads legacy and normalized product prices, images, and ratings', () => {
    const productUtils = componentModules['../src/components/productUtils.js'];
    expect(productUtils).toBeDefined();

    for (const product of [legacyProduct, normalizedProduct]) {
      expect(productUtils.getProductPrice(product)).toBe(89);
      expect(productUtils.getProductOldPrice(product)).toBe(119);
      expect(productUtils.getProductImage(product)).toBe('/assets/product-headphones.png');
      expect(productUtils.getProductRating(product)).toBe(4.9);
      expect(productUtils.getProductRatingCount(product)).toBe(121);
      expect(productUtils.getDiscountPercent(product)).toBe(25);
    }
  });

  it('formats USD and omits invalid discounts', () => {
    const productUtils = componentModules['../src/components/productUtils.js'];
    expect(productUtils).toBeDefined();
    expect(productUtils.formatMoney(89)).toBe('$89.00');
    expect(productUtils.getDiscountPercent({ price: 89 })).toBe(0);
    expect(productUtils.getDiscountPercent({ price: 89, old: 89 })).toBe(0);
    expect(productUtils.getDiscountPercent({ price: 89, old: 50 })).toBe(0);
  });

  it('reads names, colors, descriptions, and categories from either product shape', () => {
    const productUtils = componentModules['../src/components/productUtils.js'];
    expect(productUtils).toBeDefined();
    expect(productUtils.getProductName(legacyProduct)).toBe('Legacy headphones');
    expect(productUtils.getProductName(normalizedProduct)).toBe('Normalized headphones');
    expect(productUtils.getProductColors(legacyProduct)).toEqual(['black', 'blue']);
    expect(productUtils.getProductColors({ color: 'green' })).toEqual(['green']);
    expect(productUtils.getProductDescription(legacyProduct)).toBe('A legacy product description.');
    expect(productUtils.getProductDescription(normalizedProduct)).toBe('A normalized product description.');
    expect(productUtils.getProductCategory(legacyProduct)).toBe('Headphones');
    expect(productUtils.getProductCategory(normalizedProduct)).toBe('headphones');
  });
});

describe('Rating', () => {
  it('announces the rating and review count accessibly', () => {
    const Rating = componentModules['../src/components/Rating.jsx']?.Rating;
    expect(Rating).toBeTypeOf('function');
    const container = render(<Rating value={4.9} count={121} />);
    expect(container.querySelector('.rating')?.getAttribute('aria-label')).toBe('4.9 out of 5 stars');
    expect(container.querySelector('.rating small')?.textContent).toBe('(121)');
  });
});

describe('Logo', () => {
  it('exposes an accessible home button and invokes its callback', () => {
    const Logo = componentModules['../src/components/Logo.jsx']?.Logo;
    expect(Logo).toBeTypeOf('function');
    const onHome = vi.fn();
    const container = render(<Logo onHome={onHome} />);
    const button = container.querySelector('button[aria-label="Shopcart home"]');
    expect(button).not.toBeNull();
    act(() => button.click());
    expect(onHome).toHaveBeenCalledOnce();
  });
});

describe('SectionTitle', () => {
  it('renders its title and invokes the optional action', () => {
    const SectionTitle = componentModules['../src/components/SectionTitle.jsx']?.SectionTitle;
    expect(SectionTitle).toBeTypeOf('function');
    const onAction = vi.fn();
    const container = render(<SectionTitle eyebrow="Picks" title="Popular today" action="View all" onAction={onAction} />);
    expect(container.querySelector('h2')?.textContent).toBe('Popular today');
    act(() => container.querySelector('.text-action').click());
    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe('Footer', () => {
  it('forwards home and shop navigation', () => {
    const Footer = componentModules['../src/components/Footer.jsx']?.Footer;
    expect(Footer).toBeTypeOf('function');
    const onNavigate = vi.fn();
    const container = render(<Footer onNavigate={onNavigate} />);
    act(() => container.querySelector('[aria-label="Shopcart home"]').click());
    act(() => [...container.querySelectorAll('button')].find((button) => button.textContent.includes('Audio & headphones')).click());
    expect(onNavigate).toHaveBeenNthCalledWith(1, 'home');
    expect(onNavigate).toHaveBeenNthCalledWith(2, 'listing', 'Headphones');
  });
});

describe('Header', () => {
  const products = [
    { id: 'airpods', name: 'AirPods Max', price: 559, image: 'product-airpods.png' },
    { id: 'earbuds', name: 'Wireless Earbuds', price: 89, image: 'product-headphones.png' },
  ];
  const categories = [
    { title: 'Furniture' },
    { title: 'Travel' },
  ];

  it('exposes controlled search semantics and clears the query', () => {
    const Header = componentModules['../src/components/Header.jsx']?.Header;
    expect(Header).toBeTypeOf('function');
    const setQuery = vi.fn();
    const container = render(
      <Header
        query="Air"
        setQuery={setQuery}
        products={products}
        categories={categories}
        activeCategory="Headphones"
        onNavigate={vi.fn()}
        onCart={vi.fn()}
        onAccount={vi.fn()}
      />,
    );
    const input = container.querySelector('[role="combobox"]');
    act(() => input.focus());
    expect(input?.getAttribute('aria-expanded')).toBe('true');
    expect(input?.getAttribute('aria-controls')).toBe('search-suggestions');
    expect(container.querySelector('[role="option"]')?.textContent).toContain('AirPods Max');
    act(() => container.querySelector('[aria-label="Clear search"]').click());
    expect(setQuery).toHaveBeenCalledWith('');
  });

  it('selects a search suggestion with arrow and enter keys', () => {
    const Header = componentModules['../src/components/Header.jsx']?.Header;
    expect(Header).toBeTypeOf('function');
    const onNavigate = vi.fn();
    const container = render(
      <Header query="Air" setQuery={vi.fn()} products={products} onNavigate={onNavigate} onCart={vi.fn()} onAccount={vi.fn()} />,
    );
    const input = container.querySelector('[role="combobox"]');
    act(() => input.focus());
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
    expect(input.getAttribute('aria-activedescendant')).toBe('search-option-airpods');
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(onNavigate).toHaveBeenCalledWith('product', 'airpods');
  });

  it('marks the active category and navigates from desktop and mobile menus', () => {
    const Header = componentModules['../src/components/Header.jsx']?.Header;
    expect(Header).toBeTypeOf('function');
    const onNavigate = vi.fn();
    const container = render(
      <Header
        query=""
        setQuery={vi.fn()}
        products={products}
        categories={categories}
        activeCategory="Headphones"
        onNavigate={onNavigate}
        onCart={vi.fn()}
        onAccount={vi.fn()}
      />,
    );
    act(() => [...container.querySelectorAll('button')].find((button) => button.textContent.includes('Categories')).click());
    const audioCategory = [...container.querySelectorAll('.category-menu button')]
      .find((button) => button.textContent.includes('Audio & Headphones'));
    expect(audioCategory?.getAttribute('aria-current')).toBe('page');
    act(() => audioCategory.click());
    expect(onNavigate).toHaveBeenCalledWith('listing', 'Headphones');

    const mobileMenu = container.querySelector('.mobile-menu');
    act(() => mobileMenu.click());
    expect(mobileMenu.getAttribute('aria-expanded')).toBe('true');
    const furnitureCategory = container.querySelector('.mobile-navigation [data-category-target="Furniture"]');
    act(() => furnitureCategory.click());
    expect(onNavigate).toHaveBeenCalledWith('listing', 'Furniture');
    expect(mobileMenu.getAttribute('aria-expanded')).toBe('false');
  });

  it('uses normalized catalog defaults and the route category when props are omitted', () => {
    const Header = componentModules['../src/components/Header.jsx']?.Header;
    expect(Header).toBeTypeOf('function');
    const previousHash = window.location.hash;
    window.location.hash = '#listing/Furniture';
    const container = render(<Header query="Wireless" setQuery={vi.fn()} onNavigate={vi.fn()} onCart={vi.fn()} onAccount={vi.fn()} />);
    const input = container.querySelector('[role="combobox"]');
    act(() => input.focus());
    const suggestion = container.querySelector('[role="option"]');
    expect(suggestion).not.toBeNull();
    expect(suggestion.textContent).toContain('Wireless Earbuds');
    act(() => [...container.querySelectorAll('button')].find((button) => button.textContent.includes('Categories')).click());
    const furnitureCategory = container.querySelector('.category-menu [data-category-target="Furniture"]');
    expect(furnitureCategory?.getAttribute('aria-current')).toBe('page');
    window.location.hash = previousHash;
  });
});

describe('ProductCard', () => {
  const product = {
    id: 'sale-headphones',
    name: 'Sale headphones',
    price: 80,
    old: 100,
    image: 'product-headphones.png',
    tag: 'SALE',
    color: 'black',
    colors: ['black', 'blue'],
    rating: 4.8,
    reviewCount: 20,
    desc: 'Clear sound for every day.',
  };

  it('opens the product with a native keyboard-operable button', () => {
    const ProductCard = componentModules['../src/components/ProductCard.jsx']?.ProductCard;
    expect(ProductCard).toBeTypeOf('function');
    const onOpen = vi.fn();
    const container = render(<ProductCard product={product} onOpen={onOpen} onAdd={vi.fn()} onFavorite={vi.fn()} />);
    const productButton = container.querySelector('.product-open-target');
    expect(productButton?.tagName).toBe('BUTTON');
    expect(productButton?.getAttribute('aria-label')).toBe('View Sale headphones');
    act(() => productButton.click());
    expect(onOpen).toHaveBeenCalledWith('sale-headphones');
  });

  it('shows discount and color indicators and exposes favorite and quick-add controls', () => {
    const ProductCard = componentModules['../src/components/ProductCard.jsx']?.ProductCard;
    expect(ProductCard).toBeTypeOf('function');
    const onAdd = vi.fn();
    const onFavorite = vi.fn();
    const container = render(<ProductCard product={product} favorite={false} onOpen={vi.fn()} onAdd={onAdd} onFavorite={onFavorite} />);
    expect(container.querySelector('.product-discount')?.textContent).toBe('20% OFF');
    expect(container.querySelectorAll('.card-swatch')).toHaveLength(2);
    expect(container.querySelector('.card-swatch[aria-label="Black color"]')).not.toBeNull();
    const favoriteButton = container.querySelector('.heart-button');
    expect(favoriteButton?.getAttribute('aria-pressed')).toBe('false');
    act(() => favoriteButton.click());
    act(() => container.querySelector('.quick-add button').click());
    expect(onFavorite).toHaveBeenCalledWith('sale-headphones');
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('shows an accessible fallback when the product image fails', () => {
    const ProductCard = componentModules['../src/components/ProductCard.jsx']?.ProductCard;
    expect(ProductCard).toBeTypeOf('function');
    const container = render(<ProductCard product={product} onOpen={vi.fn()} onAdd={vi.fn()} onFavorite={vi.fn()} />);
    act(() => container.querySelector('.product-image').dispatchEvent(new Event('error')));
    expect(container.querySelector('.product-image-fallback[role="img"]')?.getAttribute('aria-label')).toBe('Sale headphones image unavailable');
  });
});

describe('ProductGrid', () => {
  it('renders a helpful empty state when there are no products', () => {
    const ProductGrid = componentModules['../src/components/ProductGrid.jsx']?.ProductGrid;
    expect(ProductGrid).toBeTypeOf('function');
    const container = render(<ProductGrid items={[]} favorites={[]} onOpen={vi.fn()} onAdd={vi.fn()} onFavorite={vi.fn()} />);
    expect(container.querySelector('.empty-state h3')?.textContent).toBe('No matches just yet');
    expect(container.querySelector('.empty-state p')?.textContent).toContain('clear your filters');
  });
});

describe('CartDrawer', () => {
  const product = {
    id: 'travel-mug',
    name: 'Travel mug',
    price: 20,
    color: 'green',
    image: 'product-bottle.png',
  };

  it('calculates line totals and shipping progress toward $50', () => {
    const CartDrawer = componentModules['../src/components/CartDrawer.jsx']?.CartDrawer || componentModules['../src/components/CartDrawer.jsx']?.default || componentModules['../src/components/CartDrawer.js']?.CartDrawer || componentModules['../src/components/CartDrawer.js']?.default;
    expect(CartDrawer).toBeTypeOf('function');
    const container = render(
      <CartDrawer items={[{ product, qty: 2 }]} onClose={vi.fn()} onNavigate={vi.fn()} onChangeQty={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(container.querySelector('.drawer-item-total')?.textContent).toBe('$40.00');
    expect(container.querySelector('.drawer-subtotal b')?.textContent).toBe('$40.00');
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('40');
    expect(container.querySelector('.shipping-progress-fill')?.style.width).toBe('80%');
    expect(container.querySelector('.shipping-message')?.textContent).toContain('$10.00 away');
    expect(container.querySelector('.shipping-tracker > small')?.textContent).toBe('Free shipping on orders of $50 or more');
  });

  it('supports quantity updates, removal, and checkout navigation', () => {
    const CartDrawer = componentModules['../src/components/CartDrawer.jsx']?.CartDrawer || componentModules['../src/components/CartDrawer.jsx']?.default || componentModules['../src/components/CartDrawer.js']?.CartDrawer || componentModules['../src/components/CartDrawer.js']?.default;
    expect(CartDrawer).toBeTypeOf('function');
    const onChangeQty = vi.fn();
    const onRemove = vi.fn();
    const onNavigate = vi.fn();
    const container = render(
      <CartDrawer items={[{ product, qty: 2 }]} onClose={vi.fn()} onNavigate={onNavigate} onChangeQty={onChangeQty} onRemove={onRemove} />,
    );
    act(() => container.querySelector('[aria-label="Decrease Travel mug quantity"]').click());
    act(() => container.querySelector('[aria-label="Increase Travel mug quantity"]').click());
    act(() => container.querySelector('.remove-item').click());
    act(() => container.querySelector('.drawer-footer .button').click());
    expect(onChangeQty).toHaveBeenNthCalledWith(1, 'travel-mug', 1);
    expect(onChangeQty).toHaveBeenNthCalledWith(2, 'travel-mug', 3);
    expect(onRemove).toHaveBeenCalledWith('travel-mug');
    expect(onNavigate).toHaveBeenCalledWith('checkout');
  });

  it('announces free shipping at $50 and shows a browse action when empty', () => {
    const CartDrawer = componentModules['../src/components/CartDrawer.jsx']?.CartDrawer || componentModules['../src/components/CartDrawer.jsx']?.default || componentModules['../src/components/CartDrawer.js']?.CartDrawer || componentModules['../src/components/CartDrawer.js']?.default;
    expect(CartDrawer).toBeTypeOf('function');
    const freeShippingProduct = { ...product, price: 50 };
    const freeShipping = render(
      <CartDrawer items={[{ product: freeShippingProduct, qty: 1 }]} onClose={vi.fn()} onNavigate={vi.fn()} onChangeQty={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(freeShipping.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('50');
    expect(freeShipping.querySelector('.shipping-message')?.textContent).toContain('Free shipping unlocked');

    const empty = render(<CartDrawer items={[]} onClose={vi.fn()} onNavigate={vi.fn()} onChangeQty={vi.fn()} onRemove={vi.fn()} />);
    expect(empty.querySelector('.drawer-empty h3')?.textContent).toContain('cart is waiting');
    expect(empty.querySelector('.drawer-empty .button')?.textContent).toContain('Explore best sellers');
  });

  it('closes through its close button, backdrop, or Escape key', () => {
    const CartDrawer = componentModules['../src/components/CartDrawer.jsx']?.CartDrawer || componentModules['../src/components/CartDrawer.jsx']?.default || componentModules['../src/components/CartDrawer.js']?.CartDrawer || componentModules['../src/components/CartDrawer.js']?.default;
    expect(CartDrawer).toBeTypeOf('function');
    const onClose = vi.fn();
    const container = render(<CartDrawer items={[]} onClose={onClose} onNavigate={vi.fn()} onChangeQty={vi.fn()} onRemove={vi.fn()} />);
    act(() => container.querySelector('[aria-label="Close cart"]').click());
    expect(onClose).toHaveBeenCalledOnce();
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('AccountModal', () => {
  it('provides a labeled sign-in dialog and closes on Escape or backdrop', () => {
    const AccountModal = componentModules['../src/components/AccountModal.jsx']?.AccountModal;
    expect(AccountModal).toBeTypeOf('function');
    const onClose = vi.fn();
    const container = render(<AccountModal onClose={onClose} />);
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(container.querySelector(`#${dialog.getAttribute('aria-labelledby')}`)?.textContent).toBe('Good to see you.');
    expect(container.querySelector('input[type="email"]')).not.toBeNull();
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(onClose).toHaveBeenCalledOnce();
    act(() => container.querySelector('.modal-layer').dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('OrderModal', () => {
  it('provides a labeled confirmation dialog with close and continue actions', () => {
    const OrderModal = componentModules['../src/components/OrderModal.jsx']?.OrderModal;
    expect(OrderModal).toBeTypeOf('function');
    const onClose = vi.fn();
    const onContinue = vi.fn();
    const container = render(<OrderModal onClose={onClose} onContinue={onContinue} />);
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(container.querySelector(`#${dialog.getAttribute('aria-labelledby')}`)?.textContent).toContain('Your order has');
    act(() => container.querySelector('[aria-label="Close order confirmation"]').click());
    act(() => container.querySelector('.button-orange').click());
    expect(onClose).toHaveBeenCalledOnce();
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('closes from Escape and backdrop interactions', () => {
    const OrderModal = componentModules['../src/components/OrderModal.jsx']?.OrderModal;
    expect(OrderModal).toBeTypeOf('function');
    const onClose = vi.fn();
    const container = render(<OrderModal onClose={onClose} onContinue={vi.fn()} />);
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    act(() => container.querySelector('.modal-layer').dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
