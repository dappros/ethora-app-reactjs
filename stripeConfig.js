import { loadStripe } from '@stripe/stripe-js';

/** @type {Promise<import('@stripe/stripe-js').Stripe | null>} */
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLICK_KEY);
