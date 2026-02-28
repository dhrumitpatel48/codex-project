import express, { Router } from 'express';
import { getStripeClient } from '../config/stripe.js';
import { getEnv } from '../config/env.js';
import { persistPaymentEvent } from '../services/payment-service.js';

const router = Router();

router.post('/', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const env = getEnv();
    const signature = req.headers['stripe-signature'];
    const stripe = getStripeClient();

    const event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
    await persistPaymentEvent(event);

    return res.json({ received: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
