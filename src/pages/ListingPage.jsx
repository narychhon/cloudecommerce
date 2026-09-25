import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Heart, SlidersHorizontal } from 'lucide-react';
import { categories as catalogCategories, products as catalogProducts } from '../data/mockData.js';
import { getProductImage, getProductOldPrice, getProductPrice, getProductRating, getProductRatingCount } from '../components/productUtils.js';
import './pages.css';

const money = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
}).format(amount ?? 0);

function ProductTile({ product, onOpen, onAdd, favorites, onFavorite }) {
  const isFavorite = favorites.includes(product.id);
  const price = getProductPrice(product);
  const oldPrice = getProductOldPrice(product);
  const rating = getProductRating(product);
  const count = getProductRatingCount(product);

  return (
    <article className="product-card">
      <div className="product-picture">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <button className={`heart-button ${isFavorite ? 'hearted' : ''}`} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={isFavorite} onClick={() => onFavorite(product.id)}>
          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <img className={`product-image tint-${product.color || 'black'}`} src={getProductImage(product)} alt={product.name} loading="lazy" />
        <div className="quick-add"><button onClick={() => onAdd(product)}>＋ Quick add</button></div>
      </div>
      <div className="product-info">
        <div className="product-name-line"><button className="product-title" onClick={() => onOpen(product.slug || product.id)}>{product.name}</button><strong>{money(price)}</strong></div>
        <p className="product-description">{product.description || product.desc}</p>
        <div className="rating-line"><span className="rating" aria-label={`${rating} out of 5 stars`}><span>★★★★★</span><small>({count})</small></span>{oldPrice > price && <del>{money(oldPrice)}</del>}</div>
        <button className="outline-add" onClick={() => onAdd(product)}>Add to Cart</button>
      </div>
    </article>
  );
}

function ProductGrid({ items, onOpen, onAdd, favorites, onFavorite }) {
  if (!items.length) return <div className="empty-state"><h3>No matches just yet</h3><p>Try another search or clear your filters.</p></div>;
  return <div className="product-grid">{items.map((product) => <ProductTile key={product.id} product={product} onOpen={onOpen} onAdd={onAdd} favorites={favorites} onFavorite={onFavorite} />)}</div>;
}

function FilterChip({ label, value, options, onChange }) {
  return (
    <label className="listing-filter">
      <span className="visually-hidden">{label}</span>
      <select className="filter-chip" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function ActiveChip({ label, onRemove }) {
  return <button className="active-filter-chip" onClick={onRemove}>{label}<span aria-hidden="true">×</span></button>;
}

export default function ListingPage({
  products: productList = catalogProducts,
  categories: categoryList = catalogCategories,
  categoryId = '',
  setCategoryId,
  searchQuery = '',
  onNavigate = () => {},
  onOpen = (slug) => onNavigate('product', slug),
  onAdd = () => {},
  favorites = [],
  onFavorite = () => {},
  pageSize = 8,
}) {
  const [selectedCategory, setSelectedCategory] = useState(categoryId);
  const [priceRange, setPriceRange] = useState('');
  const [color, setColor] = useState('');
  const [minimumRating, setMinimumRating] = useState('');
  const [saleOnly, setSaleOnly] = useState(false);
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelectedCategory(categoryId);
    setPage(1);
  }, [categoryId]);

  const updateCategory = (value) => {
    setSelectedCategory(value);
    setCategoryId?.(value);
    setPage(1);
  };
  const resetFilters = () => {
    setSelectedCategory('');
    setCategoryId?.('');
    setPriceRange('');
    setColor('');
    setMinimumRating('');
    setSaleOnly(false);
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = productList.filter((product) => {
      if (searchQuery && !`${product.name} ${product.description || product.desc || ''}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory && product.categoryId !== selectedCategory && product.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      const price = getProductPrice(product);
      const oldPrice = getProductOldPrice(product);
      const rating = getProductRating(product);
      if (priceRange === 'under-100' && price >= 100) return false;
      if (priceRange === '100-300' && (price < 100 || price > 300)) return false;
      if (priceRange === 'over-300' && price <= 300) return false;
      if (color && !(product.colors || []).includes(color)) return false;
      if (minimumRating && rating < Number(minimumRating)) return false;
      if (saleOnly && oldPrice <= price) return false;
      return true;
    });

    if (sort === 'price-ascending') result = result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    if (sort === 'price-descending') result = result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    if (sort === 'rating') result = result.sort((a, b) => getProductRating(b) - getProductRating(a) || getProductRatingCount(b) - getProductRatingCount(a));
    return result;
  }, [productList, searchQuery, selectedCategory, priceRange, color, minimumRating, saleOnly, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const activeCount = [selectedCategory, priceRange, color, minimumRating, saleOnly].filter(Boolean).length;
  const categoryName = categoryList.find((category) => category.id === selectedCategory)?.name;

  return (
    <main className="container listing-page">
      <div className="breadcrumbs"><button onClick={() => onNavigate('home')}>Home</button><ChevronRight size={13} /><span>Shop</span></div>

      <section className="listing-promo">
        <div className="listing-promo-copy"><span className="sale-pill"><span /> SHOP THE DROP</span><h1>Grab up to <em>50% off</em><br />on selected favourites</h1><p>Find your next everyday favourite at a price worth a closer look.</p><button className="button button-green" onClick={() => { setSaleOnly(true); setPage(1); }}>Shop sale <ArrowRight size={15} /></button></div>
        <div className="listing-promo-art"><div className="promo-glow" /><img src="/assets/product-airpods.png" alt="Featured wireless headphones" /></div>
        <div className="banner-corner">UP TO<br /><b>50%</b><br />OFF</div>
      </section>

      <section className="listing-toolbar" aria-label="Product filters and sorting">
        <div className="filter-list">
          <FilterChip label="Category" value={selectedCategory} onChange={updateCategory} options={[{ label: 'All categories', value: '' }, ...categoryList.map(({ id, name }) => ({ label: name, value: id }))]} />
          <FilterChip label="Price" value={priceRange} onChange={(value) => { setPriceRange(value); setPage(1); }} options={[{ label: 'Any price', value: '' }, { label: 'Under $100', value: 'under-100' }, { label: '$100–$300', value: '100-300' }, { label: 'Over $300', value: 'over-300' }]} />
          <FilterChip label="Color" value={color} onChange={(value) => { setColor(value); setPage(1); }} options={[{ label: 'Any color', value: '' }, ...[...new Set(productList.flatMap((item) => item.colors))].sort().map((tone) => ({ label: tone.charAt(0).toUpperCase() + tone.slice(1), value: tone }))]} />
          <FilterChip label="Rating" value={minimumRating} onChange={(value) => { setMinimumRating(value); setPage(1); }} options={[{ label: 'Any rating', value: '' }, { label: '4.5 & up', value: '4.5' }, { label: '4.8 & up', value: '4.8' }]} />
          <button className={`filter-chip ${saleOnly ? 'filter-active' : ''}`} aria-pressed={saleOnly} onClick={() => { setSaleOnly((value) => !value); setPage(1); }}>On sale</button>
          <button className="filter-chip all-filters" onClick={resetFilters}><SlidersHorizontal size={14} /> Reset all filters</button>
        </div>
        <label className="sort-label">Sort by <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="featured">Featured</option><option value="rating">Top rated</option><option value="price-ascending">Price: low to high</option><option value="price-descending">Price: high to low</option></select></label>
      </section>

      <div className="active-filters" role="group" aria-label="Active filters">
        <span>Active filters{activeCount ? ` (${activeCount})` : ''}</span>
        {categoryName && <ActiveChip label={categoryName} onRemove={() => updateCategory('')} />}
        {priceRange && <ActiveChip label={{ 'under-100': 'Under $100', '100-300': '$100–$300', 'over-300': 'Over $300' }[priceRange]} onRemove={() => { setPriceRange(''); setPage(1); }} />}
        {color && <ActiveChip label={color} onRemove={() => { setColor(''); setPage(1); }} />}
        {minimumRating && <ActiveChip label={`${minimumRating}+ stars`} onRemove={() => { setMinimumRating(''); setPage(1); }} />}
        {saleOnly && <ActiveChip label="On sale" onRemove={() => { setSaleOnly(false); setPage(1); }} />}
        {searchQuery && <ActiveChip label={`Search: ${searchQuery}`} onRemove={() => onNavigate('listing', '')} />}
      </div>

      <div className="listing-heading"><div><span className="eyebrow">Thoughtful finds, everyday value</span><h2>{categoryName || (searchQuery ? `Results for “${searchQuery}”` : 'Shop all products')}</h2><p>Find your next favourite from our latest picks.</p></div><span className="result-count">Showing <b>{filteredProducts.length}</b> products</span></div>
      <ProductGrid items={visibleProducts} onOpen={onOpen} onAdd={onAdd} favorites={favorites} onFavorite={onFavorite} />

      {pageCount > 1 && (
        <nav className="pagination" aria-label="Product pages">
          <button className="page-next" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronRight size={16} className="previous-chevron" /></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} className={page === pageNumber ? 'selected' : ''} aria-current={page === pageNumber ? 'page' : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}
          <button className="page-next" aria-label="Next page" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button>
        </nav>
      )}
      <div className="listing-bottom-note"><span><Check size={17} /></span><p><b>Thoughtful finds, straightforward service.</b><small>Every Shopcart order is packed with care and backed by easy returns.</small></p></div>
    </main>
  );
}
