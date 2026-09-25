import React, { useEffect, useState } from 'react';
import { Heart, ImageOff, Plus, ShoppingCart } from 'lucide-react';
import { Rating } from './Rating.jsx';
import {
  formatMoney,
  getDiscountPercent,
  getProductColors,
  getProductDescription,
  getProductImage,
  getProductName,
  getProductOldPrice,
  getProductPrice,
  getProductRating,
  getProductRatingCount,
} from './productUtils.js';

export function ProductCard({
  product,
  onOpen = () => {},
  onAdd = () => {},
  favorite = false,
  onFavorite = () => {},
  compact = false,
}) {
  const name = getProductName(product);
  const image = getProductImage(product);
  const price = getProductPrice(product);
  const oldPrice = getProductOldPrice(product);
  const colors = getProductColors(product);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [image]);

  return (
    <article className={`product-card ${compact ? 'compact' : ''}`}>
      <div className="product-picture">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        {getDiscountPercent(product) > 0 && <span className="product-discount">{getDiscountPercent(product)}% OFF</span>}
        <button className="product-open-target" type="button" aria-label={`View ${name}`} onClick={() => onOpen(product.id)}>
          {imageFailed || !image ? (
            <span className="product-image-fallback" role="img" aria-label={`${name} image unavailable`}>
              <ImageOff size={25} aria-hidden="true" />
              <span>Image unavailable</span>
            </span>
          ) : (
            <img
              className={`product-image tint-${product.color ?? colors[0] ?? ''}`}
              src={image}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
        </button>
        <button
          className={`heart-button ${favorite ? 'hearted' : ''}`}
          type="button"
          aria-label={favorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
          aria-pressed={favorite}
          onClick={() => onFavorite(product.id)}
        >
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        <div className="quick-add">
          <button type="button" aria-label={`Quick add ${name}`} onClick={() => onAdd(product)}>
            <Plus size={15} aria-hidden="true" /> Quick add
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-name-line">
          <button className="product-title" type="button" onClick={() => onOpen(product.id)}>{name}</button>
          <strong>{formatMoney(price)}</strong>
        </div>
        {!compact && <p className="product-description">{getProductDescription(product)}</p>}
        <div className="rating-line">
          <Rating value={getProductRating(product)} count={getProductRatingCount(product)} />
          {oldPrice > price && <del>{formatMoney(oldPrice)}</del>}
        </div>
        {colors.length > 0 && (
          <div className="card-swatches" aria-label="Available colors">
            {colors.map((color) => (
              <span
                className={`card-swatch swatch-${color.toLowerCase()}`}
                key={color}
                role="img"
                aria-label={`${color.charAt(0).toUpperCase()}${color.slice(1)} color`}
              />
            ))}
          </div>
        )}
        <button className="outline-add" type="button" onClick={() => onAdd(product)}>
          <ShoppingCart size={15} aria-hidden="true" /> Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
