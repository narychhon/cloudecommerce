import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';
import { formatMoney, getProductImage, getProductName, getProductPrice } from './productUtils.js';
import { Logo } from './Logo.jsx';
import { categories as catalogCategories, products as catalogProducts } from '../data/mockData.js';

const departmentItems = [
  { label: 'Electronics', target: 'Electronics' },
  { label: 'Audio & Headphones', target: 'Headphones' },
  { label: 'Computers & Tablets', target: 'Tech' },
  { label: 'Home & Living', target: 'Furniture' },
  { label: 'Travel accessories', target: 'Travel' },
  { label: 'New arrivals', target: 'New arrivals' },
];

function getCategoryLabel(category) {
  return category?.title ?? category?.name ?? '';
}

function getRouteCategory() {
  if (typeof window === 'undefined') return '';
  const match = window.location.hash.match(/^#\/?(?:listing|category)\/(.+)$/i);
  return match ? decodeURIComponent(match[1]) : '';
}

export function Header({
  onNavigate = () => {},
  cartCount = 0,
  onCart = () => {},
  query = '',
  setQuery = () => {},
  onAccount = () => {},
  products = catalogProducts,
  categories = catalogCategories,
  activeCategory = '',
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchInputRef = useRef(null);
  const currentCategory = activeCategory || getRouteCategory();
  const isActiveCategory = (target) => (
    String(currentCategory).toLowerCase().replace(/[^a-z0-9]/g, '')
    === String(target).toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  const suggestions = products
    .filter((product) => getProductName(product).toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 4);
  const suggestionsVisible = searchOpen && Boolean(query.trim());
  const categoryItems = [
    ...departmentItems,
    ...categories
      .map((category) => getCategoryLabel(category))
      .filter((label) => label && !departmentItems.some((item) => item.target === label))
      .map((label) => ({ label, target: label })),
  ];
  const mobileItems = [
    ...categoryItems,
    { label: 'Deals', target: 'Headphones' },
    { label: 'Delivery', target: 'services' },
  ];

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setCategoryOpen(false);
        setMobileOpen(false);
        setActiveSuggestion(-1);
      }
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  function navigateToCategory(target) {
    setCategoryOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
    if (target === 'services') onNavigate('home', 'services');
    else onNavigate('listing', target);
  }

  function selectSuggestion(product) {
    if (!product) return;
    setSearchOpen(false);
    setActiveSuggestion(-1);
    setQuery('');
    onNavigate('product', product.id);
  }

  function submitSearch() {
    setSearchOpen(false);
    setActiveSuggestion(-1);
    onNavigate('listing', query.trim() ? 'Search results' : 'Headphones');
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'Escape') {
      setSearchOpen(false);
      setActiveSuggestion(-1);
      return;
    }
    if (!suggestionsVisible || suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeSuggestion >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeSuggestion]);
    }
  }

  return (
    <header className="site-header">
      <div className="topline">
        <div className="topline-inner">
          <a className="phone-line" href="tel:+001234567890"><Phone size={12} aria-hidden="true" /> +001234567890</a>
          <button className="top-promo" type="button" onClick={() => navigateToCategory('Headphones')}>
            Get 50% Off on Selected Items <span>|</span> <u>Shop Now</u>
          </button>
          <div className="top-selects">
            <button type="button">Eng <ChevronDown size={12} aria-hidden="true" /></button>
            <button type="button"><MapPin size={12} aria-hidden="true" /> Location <ChevronDown size={12} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
      <div className="nav-wrap">
        <nav className="nav-main container" aria-label="Main navigation">
          <button
            className="mobile-menu"
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Logo onHome={() => onNavigate('home')} />
          <div className="nav-links">
            <div className="nav-categories-wrap">
              <button
                className={`nav-link ${categoryOpen ? 'active' : ''}`}
                type="button"
                aria-expanded={categoryOpen}
                aria-controls="category-menu"
                onClick={() => setCategoryOpen((open) => !open)}
              >
                Categories <ChevronDown size={14} aria-hidden="true" />
              </button>
              {categoryOpen && (
                <div className="category-menu" id="category-menu">
                  <div className="menu-kicker">Shop by department</div>
                  {categoryItems.map(({ label, target }) => (
                    <button
                      key={`${label}-${target}`}
                      type="button"
                      data-category-target={target}
                      aria-current={isActiveCategory(target) ? 'page' : undefined}
                      onClick={() => navigateToCategory(target)}
                    >
                      {label}<ChevronRight size={14} aria-hidden="true" />
                    </button>
                  ))}
                  <div className="menu-note"><span>Up to 50% off</span><small>on selected electronics</small></div>
                </div>
              )}
            </div>
            <button className="nav-link" type="button" onClick={() => navigateToCategory('Headphones')}>Deals</button>
            <button className="nav-link" type="button" onClick={() => navigateToCategory('New arrivals')}>What’s New</button>
            <button className="nav-link" type="button" onClick={() => navigateToCategory('services')}>Delivery</button>
          </div>
          <div className="search-wrap">
            <form className="search-box" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
              <input
                ref={searchInputRef}
                type="search"
                role="combobox"
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={suggestionsVisible}
                aria-controls="search-suggestions"
                aria-activedescendant={activeSuggestion >= 0 ? `search-option-${suggestions[activeSuggestion]?.id}` : undefined}
                placeholder="Search Product"
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); setActiveSuggestion(-1); }}
                onKeyDown={handleSearchKeyDown}
              />
              {query && (
                <button className="clear-search" type="button" onClick={() => { setQuery(''); setSearchOpen(false); setActiveSuggestion(-1); searchInputRef.current?.focus(); }} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
              <button type="submit" aria-label="Search"><Search size={19} /></button>
            </form>
            {suggestionsVisible && (
              <div className="search-results">
                {suggestions.length > 0 ? (
                  <div id="search-suggestions" role="listbox" aria-label="Product suggestions">
                    {suggestions.map((product, index) => (
                      <div
                        className="search-suggestion"
                        id={`search-option-${product.id}`}
                        key={product.id}
                        role="option"
                        aria-selected={index === activeSuggestion}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectSuggestion(product)}
                      >
                        <img src={getProductImage(product)} alt="" />
                        <span>{getProductName(product)}<small>{formatMoney(getProductPrice(product))}</small></span>
                        <ArrowRight size={15} aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p role="status">No products found for “{query}”.</p>
                )}
                <button className="search-all" type="button" onClick={submitSearch}>See all results <ArrowRight size={14} /></button>
              </div>
            )}
          </div>
          <div className="nav-actions">
            <button className="account-action" type="button" onClick={onAccount}><UserRound size={19} aria-hidden="true" /><span>Account</span></button>
            <button className="cart-action" type="button" onClick={onCart}>
              <span className="cart-icon-wrap"><ShoppingCart size={20} aria-hidden="true" />{cartCount > 0 && <i>{cartCount}</i>}</span>
              <span>Cart</span>
            </button>
          </div>
        </nav>
        {mobileOpen && (
          <>
            <button className="mobile-nav-backdrop" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
            <nav className="mobile-navigation" id="mobile-navigation" aria-label="Mobile navigation">
              {mobileItems.map(({ label, target }) => (
                <button
                  key={`${label}-${target}`}
                  type="button"
                  data-category-target={target}
                  aria-current={isActiveCategory(target) ? 'page' : undefined}
                  onClick={() => navigateToCategory(target)}
                >
                  {label}<ChevronRight size={15} aria-hidden="true" />
                </button>
              ))}
            </nav>
          </>
        )}
      </div>
      {categoryOpen && <button aria-label="Close category menu" className="menu-backdrop" type="button" onClick={() => setCategoryOpen(false)} />}
      {suggestionsVisible && <button aria-label="Close search results" className="search-backdrop" type="button" onClick={() => setSearchOpen(false)} />}
    </header>
  );
}

export default Header;
