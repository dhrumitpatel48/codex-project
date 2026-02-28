import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

process.env.APP_BASE_URL = 'http://localhost:3000';
process.env.CORS_ORIGIN = 'http://localhost:3000';

test('GET /api/health returns ok', async () => {
  const app = createApp();
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
});
