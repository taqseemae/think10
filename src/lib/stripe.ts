import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia', // using latest stable or provided string
  appInfo: {
    name: 'Think10 Advisory',
    version: '1.0.0',
  },
});
