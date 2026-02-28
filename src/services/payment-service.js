import { FieldValue } from 'firebase-admin/firestore';
import { getStripeClient } from '../config/stripe.js';
import { getFirestore } from '../config/firebase.js';
import { getEnv } from '../config/env.js';

export async function createCheckout({ userId, email, priceId, planName }) {
  const stripe = getStripeClient();
  const env = getEnv();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    customer_email: email || undefined,
    metadata: {
      userId,
      planName
    },
    success_url: `${env.appBaseUrl}/?payment=success`,
    cancel_url: `${env.appBaseUrl}/?payment=cancelled`
  });

  return { id: session.id, url: session.url };
}

export async function persistPaymentEvent(event) {
  const db = getFirestore();
  await db.collection('paymentEvents').doc(event.id).set({
    eventType: event.type,
    payload: event.data.object,
    createdAt: FieldValue.serverTimestamp()
  });
}
