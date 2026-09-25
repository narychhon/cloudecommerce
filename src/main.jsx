import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle2 } from 'lucide-react';
import './style.css';

import { getProductById, getProductBySlug, getProducts } from './services/catalogService.js';
import { useCart } from './hooks/useCart.js';
import { useFavorites } from './hooks/useFavorites.js';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import AccountModal from './components/AccountModal.jsx';
import OrderModal from './components/OrderModal.jsx';

import HomePage from './pages/HomePage.jsx';
import ListingPage from './pages/ListingPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';

function parseHashLocation() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { page: 'home', target: '' };
  
  const [route, ...rest] = hash.split('/');
  const param = decodeURIComponent(rest.join('/') || '');

  if (route === 'product') return { page: 'product', target: param || 'airpods' };
  if (route === 'listing' || route === 'category') return { page: 'listing', target: param || 'Headphones' };
  if (route === 'search') return { page: 'listing', target: 'Search results', query: param };
  if (route === 'checkout') return { page: 'checkout', target: '' };
  return { page: 'home', target: '' };
}

function updateHashLocation(page, target, query = '') {
  if (page === 'home') {
    window.location.hash = target === 'services' ? '#services' : '#home';
  } else if (page === 'product') {
    window.location.hash = `#product/${encodeURIComponent(target || 'airpods')}`;
  } else if (page === 'listing') {
    if (target === 'Search results' && query) {
      window.location.hash = `#search/${encodeURIComponent(query)}`;
    } else {
      window.location.hash = `#listing/${encodeURIComponent(target || 'Headphones')}`;
    }
  } else if (page === 'checkout') {
    window.location.hash = '#checkout';
  }
}

export function App() {
  const [locationState, setLocationState] = useState(parseHashLocation);
  const [category, setCategory] = useState(locationState.target || 'Headphones');
  const [query, setQuery] = useState(locationState.query || '');
  const [selectedProductId, setSelectedProductId] = useState('airpods');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [toast, setToast] = useState('');

  const { items: cartItems, cartCount, addToCart, updateQuantity, removeItem, clearCart } = useCart();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Handle browser back/forward and hash changes
  useEffect(() => {
    function handleHashChange() {
      const parsed = parseHashLocation();
      setLocationState(parsed);
      if (parsed.page === 'listing') {
        if (parsed.query) setQuery(parsed.query);
        if (parsed.target && parsed.target !== 'Search results') setCategory(parsed.target);
      } else if (parsed.page === 'product' && parsed.target) {
        setSelectedProductId(parsed.target);
      }
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch product detail whenever selectedProductId changes
  useEffect(() => {
    let active = true;
    async function loadProduct() {
      try {
        let prod = await getProductBySlug(selectedProductId);
        if (!prod) prod = await getProductById(selectedProductId);
        if (!prod) {
          const all = await getProducts();
          prod = all[0];
        }
        if (active) setSelectedProduct(prod);
      } catch {
        if (active) setSelectedProduct(null);
      }
    }
    loadProduct();
    return () => { active = false; };
  }, [selectedProductId]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__shopcartToast);
    window.__shopcartToast = window.setTimeout(() => setToast(''), 2500);
  };

  const navigate = (nextPage, target = '', searchVal = '') => {
    if (nextPage === 'product') {
      setSelectedProductId(target || 'airpods');
    } else if (nextPage === 'listing') {
      setCategory(target || 'Headphones');
      if (target === 'Search results') {
        setQuery(searchVal || query);
      } else {
        setQuery('');
      }
    }
    setLocationState({ page: nextPage, target, query: searchVal });
    updateHashLocation(nextPage, target, searchVal);
    setCartOpen(false);
    setAccountOpen(false);

    if (nextPage === 'home' && target === 'services') {
      setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product, quantity = 1) => {
    addToCart(product, quantity);
    showToast(`${product.name || 'Item'} added to your cart`);
  };

  const currentPage = locationState.page;

  return (
    <div className="app-shell">
      <Header
        onNavigate={navigate}
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        query={query}
        setQuery={setQuery}
        onAccount={() => setAccountOpen(true)}
      />

      {currentPage === 'home' && (
        <HomePage
          onNavigate={navigate}
          onOpen={(id) => navigate('product', id)}
          onAdd={handleAddToCart}
          favorites={favorites}
          onFavorite={toggleFavorite}
        />
      )}

      {currentPage === 'listing' && (
        <ListingPage
          onNavigate={navigate}
          onOpen={(id) => navigate('product', id)}
          onAdd={handleAddToCart}
          favorites={favorites}
          onFavorite={toggleFavorite}
          searchQuery={query}
          category={category}
          setCategory={setCategory}
        />
      )}

      {currentPage === 'product' && selectedProduct && (
        <ProductDetailPage
          key={selectedProduct.id}
          product={selectedProduct}
          onNavigate={navigate}
          onAdd={handleAddToCart}
        />
      )}

      {currentPage === 'checkout' && (
        <CheckoutPage
          items={cartItems}
          onChangeQty={updateQuantity}
          onNavigate={navigate}
          onPlaceOrder={() => {
            if (cartItems.length) {
              setOrderOpen(true);
            } else {
              showToast('Your cart is empty');
            }
          }}
        />
      )}

      <Footer onNavigate={navigate} />

      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onNavigate={navigate}
          onChangeQty={updateQuantity}
          onRemove={removeItem}
        />
      )}

      {accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}

      {orderOpen && (
        <OrderModal
          onClose={() => setOrderOpen(false)}
          onContinue={() => {
            setOrderOpen(false);
            clearCart();
            navigate('home');
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={17} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
