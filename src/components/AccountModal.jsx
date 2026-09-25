import React, { useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';

export function AccountModal({ onClose = () => {} }) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
        <button className="modal-close" type="button" aria-label="Close sign in dialog" onClick={onClose}><X size={18} /></button>
        <span className="eyebrow">Welcome back</span>
        <h2 id="account-modal-title">Good to see you.</h2>
        <p>Sign in to see your orders and save your favourites.</p>
        <label htmlFor="account-email">Email address</label>
        <input id="account-email" type="email" autoComplete="email" placeholder="you@example.com" />
        <label htmlFor="account-password">Password</label>
        <input id="account-password" type="password" autoComplete="current-password" placeholder="Your password" />
        <button className="button button-green" type="button" onClick={onClose}>Sign in <ArrowRight size={15} /></button>
        <div className="account-create">New to Shopcart? <button type="button" onClick={onClose}>Create an account</button></div>
      </div>
    </div>
  );
}

export default AccountModal;
