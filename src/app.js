import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health.js';
import paymentRoutes from './routes/payment.js';
import paymentWebhookRoutes from './routes/payment-webhook.js';
import profileRoutes from './routes/profile.js';
import { notFound, errorHandler } from './middleware/error-handler.js';
import { getEnv } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const env = getEnv();
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://www.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'https://*.googleapis.com', 'https://api.stripe.com']
      }
    }
  }));

  app.use(cors({
    origin: env.corsOrigin,
    methods: ['GET', 'POST', 'PUT'],
    credentials: false
  }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  }));

  app.use('/api/payments/webhook', paymentWebhookRoutes);
  app.use(express.json({ limit: '250kb' }));

  app.use('/api/health', healthRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/payments', paymentRoutes);

  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
