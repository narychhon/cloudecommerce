import React, { useState } from 'react';
import { ArrowRight, Check, CheckCircle2, ChevronRight, CreditCard, Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { getProductImage, getProductPrice } from '../components/productUtils.js';
import './pages.css';

const requiredFields = {
  firstName: 'First name is required',
  lastName: 'Last name is required',
  email: 'Email address is required',
  streetAddress: 'Street address is required',
  city: 'City is required',
  postalCode: 'Postal code is required',
  state: 'State / province is required',
};

const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

export function validateCheckoutForm(values = {}) {
  const errors = {};
  Object.entries(requiredFields).forEach(([field, message]) => {
    if (!String(values[field] ?? '').trim()) errors[field] = message;
  });

  const email = String(values.email ?? '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address';
  }
  return errors;
}

export function applyCoupon(code, subtotal) {
  if (!String(code ?? '').trim()) return { applied: false, discount: 0 };
  return { applied: true, discount: roundMoney(Math.max(0, Number(subtotal) || 0) * 0.1) };
}

export function calculateOrderSummary(items = [], couponApplied = false) {
  const subtotal = roundMoney(items.reduce((sum, item) => {
    const price = getProductPrice(item.product);
    const quantity = Math.max(0, Number(item.qty) || 0);
    return sum + price * quantity;
  }, 0));
  const discount = couponApplied ? applyCoupon('applied', subtotal).discount : 0;
  const delivery = subtotal === 0 || subtotal > 50 ? 0 : 5.9;
  return { subtotal, discount, delivery, total: roundMoney(subtotal - discount + delivery) };
}

const money = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
}).format(amount ?? 0);

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  state: '',
};

function CheckoutField({ name, label, value, error, onChange, type = 'text', className = '', children }) {
  const errorId = `${name}-error`;
  return (
    <label className={`checkout-field ${className} ${error ? 'has-error' : ''}`} htmlFor={name}>
      {label}
      {children || <input id={name} name={name} type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />}
      {error && <small className="field-error" id={errorId} role="alert">{error}</small>}
    </label>
  );
}

export default function CheckoutPage({
  items = [],
  onChangeQty = () => {},
  onNavigate = () => {},
  onPlaceOrder = () => {},
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderMessage, setOrderMessage] = useState('');
  const { subtotal, discount, delivery, total } = calculateOrderSummary(items, couponApplied);
  const itemCount = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
    setOrderMessage('');
  };

  const handleCoupon = () => {
    const result = applyCoupon(coupon, subtotal);
    setCouponApplied(result.applied);
    setCouponMessage(result.applied ? '10% discount applied.' : 'Enter a promo code first.');
  };

  const placeOrder = (event) => {
    event.preventDefault();
    const validationErrors = validateCheckoutForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setOrderMessage('Please correct the highlighted fields.');
      return;
    }
    setOrderMessage('Your order details are ready for secure checkout.');
    onPlaceOrder({ ...values, paymentMethod, summary: { subtotal, discount, delivery, total } });
  };

  return (
    <main className="container checkout-page">
      <div className="breadcrumbs"><button onClick={() => onNavigate('home')}>Home</button><ChevronRight size={13} /><button onClick={() => onNavigate('listing', '')}>Shopping cart</button><ChevronRight size={13} /><span>Checkout</span></div>
      <div className="checkout-heading"><div><span className="eyebrow">Almost yours</span><h1>Review &amp; checkout</h1><p>Just a few details and we’ll get your order on its way.</p></div><div className="checkout-progress"><span className="complete"><Check size={12} /></span><i /><span className="active">2</span><i /><span>3</span><small>Cart <b>Shipping</b> Payment</small></div></div>

      <form className="checkout-layout" noValidate onSubmit={placeOrder}>
        <div className="checkout-left">
          <section className="checkout-card">
            <div className="checkout-card-head"><div><span className="step-number">01</span><h2>Review your items</h2></div><button type="button" onClick={() => onNavigate('listing', '')}>Continue shopping <ArrowRight size={14} /></button></div>
            {items.length ? items.map(({ product, qty }) => (
              <div className="review-item" key={product.id}>
                <img src={getProductImage(product)} alt={product.name} />
                <div className="review-product"><button type="button" onClick={() => onNavigate('product', product.slug || product.id)}>{product.name}</button><small>Color: {product.color || 'Standard'} · {product.stock?.status || 'In stock'}</small></div>
                <div className="review-quantity"><button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => onChangeQty(product.id, qty - 1)}><Minus size={12} /></button><span>{qty}</span><button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => onChangeQty(product.id, qty + 1)}><Plus size={12} /></button></div>
                <b className="review-total">{money(getProductPrice(product) * qty)}</b>
              </div>
            )) : <div className="empty-cart"><ShoppingCart size={22} /><p>Your cart is empty.</p><button type="button" onClick={() => onNavigate('listing', '')}>Find something you’ll love</button></div>}
          </section>

          <section className="checkout-card">
            <div className="checkout-card-head"><div><span className="step-number">02</span><h2>Delivery information</h2></div><span className="secure-small"><ShieldCheck size={14} /> Your details are secure</span></div>
            <div className="form-grid">
              <CheckoutField name="firstName" label="First name" value={values.firstName} error={errors.firstName} onChange={updateField} />
              <CheckoutField name="lastName" label="Last name" value={values.lastName} error={errors.lastName} onChange={updateField} />
              <CheckoutField name="email" label="Email address" type="email" value={values.email} error={errors.email} onChange={updateField} />
              <CheckoutField name="phone" label="Phone number" type="tel" value={values.phone || ''} error="" onChange={updateField} />
              <CheckoutField name="streetAddress" label="Street address" value={values.streetAddress} error={errors.streetAddress} onChange={updateField} className="full-field" />
              <CheckoutField name="city" label="City" value={values.city} error={errors.city} onChange={updateField} />
              <CheckoutField name="postalCode" label="Postal code" value={values.postalCode} error={errors.postalCode} onChange={updateField} />
              <CheckoutField name="state" label="State / province" value={values.state} error={errors.state} onChange={updateField}>
                <select id="state" name="state" value={values.state} onChange={updateField} aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? 'state-error' : undefined}>
                  <option value="">Select state or province</option>
                  {['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Ontario', 'Quebec', 'British Columbia'].map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </CheckoutField>
              <label className="checkout-field"><span>Country</span><select defaultValue="United States"><option>United States</option><option>Canada</option><option>United Kingdom</option></select></label>
              <label className="checkout-field full-field"><span>Delivery notes <small className="optional">Optional</small></span><textarea placeholder="Anything we should know about delivery?" rows="3" /></label>
            </div>
            <label className="checkbox-line"><input type="checkbox" defaultChecked /><span /> Save this address for next time</label>
          </section>

          <section className="checkout-card payment-card">
            <div className="checkout-card-head"><div><span className="step-number">03</span><h2>Payment method</h2></div><span className="secure-small"><ShieldCheck size={14} /> Secure payment</span></div>
            <div className="payment-options">
              <label className="payment-option"><input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={(event) => setPaymentMethod(event.target.value)} /><span className="fake-radio" /><span className="payment-title"><b>Credit or debit card</b><small>Visa, Mastercard, Amex</small></span><CreditCard size={20} /></label>
              <label className="payment-option"><input type="radio" name="paymentMethod" value="shopcart-card" checked={paymentMethod === 'shopcart-card'} onChange={(event) => setPaymentMethod(event.target.value)} /><span className="fake-radio" /><span className="payment-title"><b>Shopcart Card</b><small>Get 5% cash back on this order</small></span></label>
              <label className="payment-option"><input type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === 'paypal'} onChange={(event) => setPaymentMethod(event.target.value)} /><span className="fake-radio" /><span className="payment-title"><b>PayPal</b><small>Fast and secure checkout</small></span><strong className="paypal-word">PayPal</strong></label>
              <label className="payment-option"><input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={(event) => setPaymentMethod(event.target.value)} /><span className="fake-radio" /><span className="payment-title"><b>Cash on delivery</b><small>Pay when your order arrives</small></span></label>
            </div>
          </section>
        </div>

        <aside className="order-summary">
          <div className="summary-header"><h2>Order summary</h2><span>{itemCount} items</span></div>
          <div className="coupon-form"><label htmlFor="coupon">Promo code</label><div><input id="coupon" placeholder="Enter coupon code" value={coupon} onChange={(event) => { setCoupon(event.target.value); setCouponApplied(false); setCouponMessage(''); }} /><button type="button" onClick={handleCoupon}>{couponApplied ? 'Applied' : 'Apply'}</button></div>{couponMessage && <small className={couponApplied ? 'coupon-success' : 'coupon-error'} role="status">{couponApplied && <CheckCircle2 size={13} />}{couponMessage}</small>}</div>
          <div className="summary-items">{items.map(({ product, qty }) => <div key={product.id}><span>{product.name} <small>× {qty}</small></span><b>{money(getProductPrice(product) * qty)}</b></div>)}</div>
          <div className="summary-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div className="summary-row"><span>Delivery</span><b className={delivery === 0 ? 'free-shipping' : ''}>{delivery === 0 ? 'Free' : money(delivery)}</b></div>
          {discount > 0 && <div className="summary-row discount-row"><span>Discount</span><b>-{money(discount)}</b></div>}
          <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
          <button className="button button-green pay-button" type="submit">Place order <ArrowRight size={16} /></button>
          {orderMessage && <p className={Object.keys(errors).length ? 'checkout-submit-error' : 'checkout-submit-success'} role="status">{orderMessage}</p>}
          <p className="terms-note"><ShieldCheck size={14} /> Your payment details are encrypted and secure.</p>
          <div className="summary-promise"><Truck size={18} /><span><b>Free delivery</b><small>On all orders over $50</small></span></div>
          <div className="summary-promise"><RotateCcw size={18} /><span><b>30-day returns</b><small>Shop with peace of mind</small></span></div>
        </aside>
      </form>
    </main>
  );
}
