import Stripe from 'stripe';
import { getEnv } from './env.js';

let stripe;

export function getStripeClient() {
  if (!stripe) {
    const env = getEnv();
    stripe = new Stripe(env.stripeSecretKey);
  }
  return stripe;
}
