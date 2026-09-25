import React from 'react';
import {
  ArrowRight, Check, Heart, PackageCheck, RotateCcw, ShieldCheck, Truck,
} from 'lucide-react';
import { brands, categories, heroPromotions, products as catalogProducts } from '../data/mockData.js';
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
        <button
          className={`heart-button ${isFavorite ? 'hearted' : ''}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          onClick={() => onFavorite(product.id)}
        >
          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <img className={`product-image tint-${product.color || 'black'}`} src={getProductImage(product)} alt={product.name} loading="lazy" />
        <div className="quick-add">
          <button onClick={() => onAdd(product)}><span aria-hidden="true">＋</span> Quick add</button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-name-line">
          <button className="product-title" onClick={() => onOpen(product.slug || product.id)}>{product.name}</button>
          <strong>{money(price)}</strong>
        </div>
        <p className="product-description">{product.description || product.desc}</p>
        <div className="rating-line">
          <span className="rating" aria-label={`${rating} out of 5 stars`}>
            <span>★★★★★</span><small>({count})</small>
          </span>
          {oldPrice > price && <del>{money(oldPrice)}</del>}
        </div>
        <button className="outline-add" onClick={() => onAdd(product)}>Add to Cart</button>
      </div>
    </article>
  );
}

function ProductGrid({ items, onOpen, onAdd, favorites, onFavorite }) {
  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductTile
          key={product.id}
          product={product}
          onOpen={onOpen}
          onAdd={onAdd}
          favorites={favorites}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
}

function SectionHeading({ eyebrow, title, titleId, action, onAction }) {
  return (
    <div className="section-title">
      <div><span className="eyebrow">{eyebrow}</span><h2 id={titleId}>{title}</h2></div>
      {action && <button className="text-action" onClick={onAction}>{action}<ArrowRight size={16} /></button>}
    </div>
  );
}

const services = [
  { title: 'Free delivery', detail: 'On orders over $50', Icon: Truck },
  { title: 'Easy returns', detail: '30 day return policy', Icon: RotateCcw },
  { title: 'Secure checkout', detail: 'Protected payment', Icon: ShieldCheck },
  { title: 'Great support', detail: 'Here whenever you need us', Icon: PackageCheck },
];

export default function HomePage({
  products: productList = catalogProducts,
  categories: categoryList = categories,
  brands: brandList = brands,
  promotion = heroPromotions[0],
  onNavigate = () => {},
  onOpen = (slug) => onNavigate('product', slug),
  onAdd = () => {},
  favorites = [],
  onFavorite = () => {},
}) {
  const popularProducts = [...productList]
    .sort((a, b) => getProductRating(b) - getProductRating(a) || getProductRatingCount(b) - getProductRatingCount(a))
    .slice(0, 4);

  return (
    <main>
      <section className="hero container" aria-labelledby="home-hero-title">
        <div className="hero-copy">
          <span className="hero-eyebrow"><span /> Fresh finds, everyday favourites</span>
          <h1 id="home-hero-title">Shopping And<br />Department Store.</h1>
          <p>Find thoughtful essentials and little joys for every part of your day.</p>
          <button className="button button-green" onClick={() => onNavigate('listing', 'headphones')}>
            Explore the collection <ArrowRight size={16} />
          </button>
          <div className="hero-proof">
            <span className="proof-avatars" aria-hidden="true"><span>J</span><span>A</span><span>M</span></span>
            <p><strong>4.9/5</strong><small>from 2,400+ happy shoppers</small></p>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <img className="stage" src={promotion.image.src} alt="" />
          <div className="float-note float-note-one"><span><Truck size={16} /></span><div><b>Free delivery</b><small>on your first order</small></div></div>
          <div className="float-note float-note-two"><span className="note-check"><Check size={17} /></span><div><b>Shop with confidence</b><small>Easy returns, always</small></div></div>
        </div>
      </section>

      <section className="container section-space categories-section" aria-labelledby="home-categories-title">
        <SectionHeading eyebrow="Find your next favourite" title="Shop Our Top Categories" titleId="home-categories-title" action="Explore all" onAction={() => onNavigate('listing', '')} />
        <div className="category-grid">
          {categoryList.map((category) => (
            <button
              key={category.id}
              className={`category-card tone-${category.tone}`}
              onClick={() => onNavigate('listing', category.slug)}
            >
              <span>{category.name}</span>
              <img src={category.image.src} alt={category.image.alt} loading="lazy" />
              <i aria-hidden="true"><ArrowRight size={15} /></i>
            </button>
          ))}
        </div>
      </section>

      <section className="container section-space" aria-labelledby="popular-products-title">
        <SectionHeading eyebrow="The ones everyone wants" title="Popular Products" titleId="popular-products-title" action="View all" onAction={() => onNavigate('listing', '')} />
        <ProductGrid items={popularProducts} onOpen={onOpen} onAdd={onAdd} favorites={favorites} onFavorite={onFavorite} />
      </section>

      <section className="container promo-band" aria-labelledby="home-promo-title">
        <div className="promo-copy">
          <span className="sale-pill"><span /> {promotion.eyebrow}</span>
          <h2 id="home-promo-title">Grab up to <em>50% off</em><br />on selected favourites</h2>
          <p>{promotion.description}</p>
          <button className="button button-green" onClick={() => onNavigate('listing', promotion.categoryId)}>
            {promotion.ctaLabel} <ArrowRight size={16} />
          </button>
        </div>
        <div className="promo-art">
          <div className="promo-orbit orbit-one" />
          <div className="promo-orbit orbit-two" />
          <img src={promotion.image.src} alt={promotion.image.alt} loading="lazy" />
          <span className="promo-percent">-50%<small>limited time</small></span>
        </div>
      </section>

      <section className="container section-space brand-section" aria-labelledby="home-brands-title">
        <SectionHeading eyebrow="Good things, trusted names" title="Choose By Brand" titleId="home-brands-title" action="See all brands" onAction={() => onNavigate('listing', '')} />
        <div className="brand-grid">
          {brandList.slice(0, 8).map((brand, index) => (
            <button className={`brand-tile brand-tile-${index}`} key={brand.id} onClick={() => onNavigate('listing', brand.slug)}>
              <span>{brand.name}</span>
              <small><Check size={12} /> Official store</small>
            </button>
          ))}
        </div>
      </section>

      <section className="container service-strip" aria-label="Shopcart services">
        {services.map(({ title, detail, Icon }) => (
          <div key={title}><Icon /><span><b>{title}</b><small>{detail}</small></span></div>
        ))}
      </section>
    </main>
  );
}
