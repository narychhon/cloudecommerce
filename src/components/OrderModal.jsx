import React, { useEffect } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

export function OrderModal({ onClose = () => {}, onContinue = () => {} }) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
        <button className="modal-close" type="button" aria-label="Close order confirmation" onClick={onClose}><X size={18} /></button>
        <div className="success-halo">
          <div><Check size={34} /></div>
          <i />
          <b />
        </div>
        <span className="eyebrow">All set</span>
        <h2 id="order-modal-title">Your order has<br />been accepted</h2>
        <p>Thanks for shopping with us. We’ll send your order details and tracking link by email.</p>
        <div className="order-number">Order number <b>#SC-894294820</b></div>
        <button className="button button-orange" type="button" onClick={onContinue}>Continue shopping <ArrowRight size={15} /></button>
      </div>
    </div>
  );
}

export default OrderModal;
