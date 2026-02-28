import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

process.env.APP_BASE_URL = 'http://localhost:3000';
process.env.CORS_ORIGIN = 'http://localhost:3000';

test('POST api route requires X-Requested-With header', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/payments/checkout-session')
    .set('Content-Type', 'application/json')
    .send({ priceId: 'price_demo', planName: 'Professional Plan' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Missing required X-Requested-With header.');
});

test('POST api route requires application/json', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/payments/checkout-session')
    .set('X-Requested-With', 'XMLHttpRequest')
    .type('form')
    .send({ priceId: 'price_demo', planName: 'Professional Plan' });

  assert.equal(response.status, 415);
  assert.equal(response.body.error, 'Content-Type must be application/json.');
});
