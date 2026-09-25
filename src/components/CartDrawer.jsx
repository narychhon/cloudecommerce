import React, { useEffect } from 'react';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingCart, X } from 'lucide-react';
import { formatMoney, getProductColors, getProductImage, getProductName, getProductPrice } from './productUtils.js';

const FREE_SHIPPING_THRESHOLD = 50;

export function CartDrawer({
  items = [],
  onClose = () => {},
  onNavigate = () => {},
  onChangeQty = () => {},
  onRemove = () => {},
}) {
  const subtotal = items.reduce((sum, { product, qty }) => sum + getProductPrice(product) * qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountRemaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const hasFreeShipping = amountRemaining === 0;

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="drawer-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Saved for you</span>
            <h2 id="cart-drawer-title">Your cart <small>({itemCount})</small></h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close cart"><X size={21} /></button>
        </div>
        {items.length > 0 ? (
          <>
            <div className="drawer-items">
              {items.map(({ product, qty }) => {
                const name = getProductName(product);
                const color = product.color ?? getProductColors(product)[0];
                return (
                  <div className="drawer-item" key={product.id}>
                    <img src={getProductImage(product)} alt="" />
                    <div className="drawer-item-main">
                      <button className="drawer-item-name" type="button" onClick={() => onNavigate('product', product.id)}>{name}</button>
                      {color && <small>Color: {color}</small>}
                      <div className="drawer-line-bottom">
                        <div className="quantity-control" aria-label={`${name} quantity`}>
                          <button type="button" aria-label={`Decrease ${name} quantity`} onClick={() => onChangeQty(product.id, qty - 1)}><Minus size={12} /></button>
                          <span aria-live="polite">{qty}</span>
                          <button type="button" aria-label={`Increase ${name} quantity`} onClick={() => onChangeQty(product.id, qty + 1)}><Plus size={12} /></button>
                        </div>
                        <button className="remove-item" type="button" onClick={() => onRemove(product.id)}>Remove</button>
                      </div>
                    </div>
                    <b className="drawer-item-total">{formatMoney(getProductPrice(product) * qty)}</b>
                  </div>
                );
              })}
            </div>
            <div className="drawer-footer">
              <div className="shipping-tracker">
                <p className="shipping-message" role="status">
                  {hasFreeShipping ? 'Free shipping unlocked!' : `${formatMoney(amountRemaining)} away from free shipping`}
                </p>
                <div
                  className="shipping-progress"
                  role="progressbar"
                  aria-label="Progress toward free shipping"
                  aria-valuemin={0}
                  aria-valuemax={FREE_SHIPPING_THRESHOLD}
                  aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
                >
                  <span className="shipping-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <small>Free shipping on orders of $50 or more</small>
              </div>
              <div className="drawer-subtotal"><span>Subtotal</span><b>{formatMoney(subtotal)}</b></div>
              <p>Shipping and taxes calculated at checkout.</p>
              <button className="button button-green" type="button" onClick={() => onNavigate('checkout')}>Go to checkout <ArrowRight size={16} /></button>
              <button className="continue-shopping" type="button" onClick={onClose}>Continue shopping</button>
              <div className="drawer-secure"><ShieldCheck size={14} /> Secure checkout <i /> Easy returns</div>
            </div>
          </>
        ) : (
          <div className="drawer-empty">
            <div><ShoppingCart size={24} /></div>
            <h3>Your cart is waiting for a little joy.</h3>
            <p>Discover something lovely and it’ll be right here.</p>
            <button className="button button-green" type="button" onClick={() => onNavigate('listing', 'Headphones')}>
              Explore best sellers <ArrowRight size={15} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
