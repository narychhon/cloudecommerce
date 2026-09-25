import React from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from './ProductCard.jsx';

export function ProductGrid({
  items = [],
  onOpen,
  onAdd,
  favorites = [],
  onFavorite,
  compact = false,
}) {
  if (items.length === 0) {
    return (
      <div className="empty-state" role="status">
        <Search size={24} aria-hidden="true" />
        <h3>No matches just yet</h3>
        <p>Try another search or clear your filters.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpen={onOpen}
          onAdd={onAdd}
          favorite={favorites.includes(product.id)}
          onFavorite={onFavorite}
          compact={compact}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
