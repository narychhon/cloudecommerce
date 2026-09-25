import { describe, expect, it } from 'vitest';
import { applyCoupon, calculateOrderSummary, validateCheckoutForm } from '../src/pages/CheckoutPage.jsx';

const completeForm = {
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex@example.com',
  streetAddress: '10 Main Street',
  city: 'Austin',
  postalCode: '78701',
  state: 'Texas',
};

describe('checkout form validation', () => {
  it('requires each delivery field, including state', () => {
    expect(validateCheckoutForm({})).toEqual({
      firstName: 'First name is required',
      lastName: 'Last name is required',
      email: 'Email address is required',
      streetAddress: 'Street address is required',
      city: 'City is required',
      postalCode: 'Postal code is required',
      state: 'State / province is required',
    });
  });

  it('accepts a complete form and validates the email format', () => {
    expect(validateCheckoutForm(completeForm)).toEqual({});
    expect(validateCheckoutForm({ ...completeForm, email: 'not-an-email' })).toEqual({
      email: 'Enter a valid email address',
    });
  });
});

describe('checkout promo coupon', () => {
  it('applies a ten percent discount for a nonblank coupon', () => {
    expect(applyCoupon(' SAVE10 ', 100)).toEqual({ applied: true, discount: 10 });
  });

  it('does not apply a coupon when its code is blank', () => {
    expect(applyCoupon('   ', 100)).toEqual({ applied: false, discount: 0 });
  });

  it('calculates subtotal, discount, delivery, and total', () => {
    expect(calculateOrderSummary([
      { product: { price: { amount: 50 } }, qty: 2 },
    ], true)).toEqual({ subtotal: 100, discount: 10, delivery: 0, total: 90 });
    expect(calculateOrderSummary([
      { product: { price: { amount: 20 } }, qty: 1 },
    ])).toEqual({ subtotal: 20, discount: 0, delivery: 5.9, total: 25.9 });
  });
});
