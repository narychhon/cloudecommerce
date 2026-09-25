import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Logo } from './Logo.jsx';

export function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Logo onHome={() => onNavigate('home')} />
          <p>Good things for the everyday.<br />A little joy in every delivery.</p>
          <div className="social-links">
            <button type="button" aria-label="Instagram">ig</button>
            <button type="button" aria-label="Facebook">f</button>
            <button type="button" aria-label="Pinterest">p</button>
          </div>
        </div>
        <div>
          <h3>Shop</h3>
          <button type="button" onClick={() => onNavigate('listing', 'Headphones')}>Audio &amp; headphones</button>
          <button type="button" onClick={() => onNavigate('listing', 'Tech')}>Tech &amp; electronics</button>
          <button type="button" onClick={() => onNavigate('listing', 'Travel')}>Travel essentials</button>
          <button type="button" onClick={() => onNavigate('listing', 'Headphones')}>Weekly deals</button>
        </div>
        <div>
          <h3>Help &amp; support</h3>
          <a href="#services">Delivery information</a>
          <a href="#services">Returns &amp; refunds</a>
          <a href="#services">Track an order</a>
          <a href="#services">Contact us</a>
        </div>
        <div className="footer-newsletter">
          <h3>Good news, occasionally.</h3>
          <p>Get thoughtful finds and little surprises in your inbox.</p>
          <form onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset(); }}>
            <input type="email" placeholder="Your email address" aria-label="Your email address" required />
            <button type="submit" aria-label="Subscribe"><ArrowRight size={16} /></button>
          </form>
          <small>By subscribing you agree to our Privacy Policy.</small>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2024 Shopcart. All rights reserved.</span>
        <div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#accessibility">Accessibility</a></div>
        <span className="payment-brands"><b>VISA</b><i>●●</i><b>PayPal</b></span>
      </div>
    </footer>
  );
}

export default Footer;
