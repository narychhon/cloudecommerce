import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ChevronRight, Heart, Minus, PackageCheck, Plus, RotateCcw, ShieldCheck, Truck,
} from 'lucide-react';
import { products as catalogProducts } from '../data/mockData.js';
import './pages.css';

const money = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
}).format(amount ?? 0);

const extraGallery = [
  { src: '/assets/product-headphones.png', alt: 'Product side view' },
  { src: '/assets/product-airpods.png', alt: 'Product detail view' },
  { src: '/assets/product-homepod.png', alt: 'Product lifestyle view' },
];

function ProductTile({ product, onOpen, onAdd, favorites, onFavorite }) {
  const image = product.images?.[0];
  const isFavorite = favorites.includes(product.id);
  return (
    <article className="product-card">
      <div className="product-picture">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <button className={`heart-button ${isFavorite ? 'hearted' : ''}`} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={isFavorite} onClick={() => onFavorite(product.id)}><Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} /></button>
        <img className={`product-image tint-${product.color}`} src={image?.src} alt={image?.alt || product.name} loading="lazy" />
      </div>
      <div className="product-info"><div className="product-name-line"><button className="product-title" onClick={() => onOpen(product.slug)}>{product.name}</button><strong>{money(product.price.amount)}</strong></div><div className="rating-line"><span className="rating"><span>★★★★★</span><small>({product.rating.count})</small></span><button className="outline-add" onClick={() => onAdd(product)}>Add to Cart</button></div></div>
    </article>
  );
}

function ProductGrid({ items, onOpen, onAdd, favorites, onFavorite }) {
  return <div className="product-grid">{items.map((product) => <ProductTile key={product.id} product={product} onOpen={onOpen} onAdd={onAdd} favorites={favorites} onFavorite={onFavorite} />)}</div>;
}

export default function ProductDetailPage({
  product,
  products: productList = catalogProducts,
  onNavigate = () => {},
  onAdd = () => {},
  favorites = [],
  onFavorite = () => {},
}) {
  const [color, setColor] = useState(product?.color || product?.colors?.[0] || 'black');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [postalCode, setPostalCode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');

  useEffect(() => {
    if (!product) return;
    setColor(product.color || product.colors?.[0] || 'black');
    setQuantity(1);
    setActiveImageIndex(0);
    setPostalCode('');
    setDeliveryMessage('');
  }, [product?.id]);

  const gallery = useMemo(() => {
    const productImages = product?.images || [];
    const images = [...productImages, ...extraGallery.map((image, index) => ({
      id: `${product?.id}-gallery-${index}`,
      ...image,
    }))];
    return images.filter((image, index, all) => all.findIndex((candidate) => candidate.src === image.src) === index);
  }, [product]);

  if (!product) return <main className="container product-page"><div className="empty-state"><h1>Product not found</h1><button className="button button-green" onClick={() => onNavigate('listing', '')}>Browse products</button></div></main>;

  const activeImage = gallery[activeImageIndex] || gallery[0];
  const selectedVariant = product.variants?.find((variant) => variant.color === color);
  const stock = selectedVariant?.stock || product.stock;
  const stockCount = stock?.count ?? 0;
  const relatedProducts = productList.filter((item) => item.id !== product.id && item.categoryId === product.categoryId).slice(0, 4);
  const visibleRelated = relatedProducts.length ? relatedProducts : productList.filter((item) => item.id !== product.id).slice(0, 4);

  const checkDelivery = (event) => {
    event.preventDefault();
    const normalized = postalCode.trim();
    setDeliveryMessage(normalized.length >= 3
      ? `Great news — delivery is available for ${normalized}.`
      : 'Enter a valid postal code to check delivery.');
  };

  return (
    <main className="container product-page">
      <div className="breadcrumbs"><button onClick={() => onNavigate('home')}>Home</button><ChevronRight size={13} /><button onClick={() => onNavigate('listing', product.categoryId)}>{product.categoryId}</button><ChevronRight size={13} /><span>{product.name}</span></div>
      <section className="product-detail-grid">
        <div className="detail-gallery">
          <div className="main-product-image">
            {product.tag && <span className="product-tag detail-tag">{product.tag}</span>}
            <img className={`product-image tint-${color}`} src={activeImage?.src} alt={activeImage?.alt || product.name} />
            <button className="gallery-arrow prev" aria-label="Previous image" onClick={() => setActiveImageIndex((index) => (index - 1 + gallery.length) % gallery.length)}><ArrowLeft size={17} /></button>
            <button className="gallery-arrow next" aria-label="Next image" onClick={() => setActiveImageIndex((index) => (index + 1) % gallery.length)}><ArrowRight size={17} /></button>
            <span className="image-counter">{String(activeImageIndex + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}</span>
          </div>
          <div className="thumb-row" aria-label="Choose product image">
            {gallery.map((image, index) => <button key={image.id || image.src} className={`thumb ${activeImageIndex === index ? 'active' : ''}`} aria-label={`Show image ${index + 1}`} aria-pressed={activeImageIndex === index} onClick={() => setActiveImageIndex(index)}><img src={image.src} alt={image.alt || `${product.name} view ${index + 1}`} /></button>)}
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-overline"><span className="eyebrow">{product.categoryId}</span><span className="secure-small"><ShieldCheck size={14} /> Shopcart verified</span></div>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-rating"><span className="rating"><span>★★★★★</span><small>({product.rating.count})</small></span><span>{product.rating.average} out of 5</span></div>
          <div className="detail-price">{money(product.price.amount)} <del>{money(product.oldPrice.amount)}</del><span className="save-chip">Save {money(product.oldPrice.amount - product.price.amount)}</span></div>
          <div className="detail-divider" />

          <div className="selection-heading"><span>Choose a color</span><b>{color.charAt(0).toUpperCase() + color.slice(1)}</b></div>
          <div className="color-swatches" role="group" aria-label="Choose product color">
            {product.colors.map((tone) => <button key={tone} className={`swatch swatch-${tone} ${color === tone ? 'selected' : ''}`} aria-label={tone} aria-pressed={color === tone} onClick={() => { setColor(tone); setQuantity(1); setActiveImageIndex(0); }}><span /></button>)}
          </div>

          <div className="stock-and-qty">
            <div className={stockCount === 0 ? 'stock-unavailable' : ''}><span className="stock-dot" />{stockCount === 0 ? 'Out of stock' : stock?.status === 'low-stock' ? `Only ${stockCount} left` : 'In stock'}<small>{stockCount > 0 ? ' — ships in 1–2 days' : ''}</small></div>
            <div className="quantity-control"><button disabled={quantity <= 1} aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span aria-live="polite">{quantity}</span><button disabled={quantity >= stockCount} aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(stockCount, value + 1))}><Plus size={14} /></button></div>
          </div>
          <div className="detail-buttons"><button className="button button-green" disabled={stockCount === 0} onClick={() => { onAdd(product, quantity); onNavigate('checkout'); }}>Buy Now <ArrowRight size={16} /></button><button className="button button-outline" disabled={stockCount === 0} onClick={() => onAdd(product, quantity)}>Add to Cart</button></div>

          <div className="delivery-card">
            <div><span><Truck size={17} /></span><p><b>Free delivery</b><small>On orders over $50 · estimated 2–4 business days</small></p></div>
            <div className="postal-check"><span><PackageCheck size={16} /></span><div><b>Check delivery to your area</b><form onSubmit={checkDelivery}><input aria-label="Postal code" placeholder="Enter your postal code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} /><button>Check</button></form>{deliveryMessage && <small className="postal-result" role="status">{deliveryMessage}</small>}</div></div>
            <div><span><RotateCcw size={17} /></span><p><b>Easy 30 day returns</b><small>Free returns on eligible items</small></p></div>
          </div>
          <div className="secure-note"><ShieldCheck size={16} /> Secure checkout <i /> Free shipping on orders over $50</div>
        </div>
      </section>

      <section className="specifications" aria-labelledby="product-specifications-heading">
        <div className="section-title"><div><span className="eyebrow">A closer look</span><h2 id="product-specifications-heading">{product.name} — Full Specifications</h2></div></div>
        <table className="spec-table"><tbody>{Object.entries(product.specifications || {}).map(([name, value]) => <tr key={name}><th scope="row">{name.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}</th><td>{String(value)}</td></tr>)}</tbody></table>
      </section>

      <section className="section-space similar-section" aria-labelledby="related-items-heading">
        <div className="section-title"><div><span className="eyebrow">More to love</span><h2 id="related-items-heading">Related Items You Might Like</h2></div><button className="text-action" onClick={() => onNavigate('listing', product.categoryId)}>View all <ArrowRight size={16} /></button></div>
        <ProductGrid items={visibleRelated} onOpen={(slug) => onNavigate('product', slug)} onAdd={onAdd} favorites={favorites} onFavorite={onFavorite} />
      </section>
    </main>
  );
}
