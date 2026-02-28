# Professional Data Platform (Secure MVP)

This repository contains a production-oriented MVP for managing personal/professional records with:
- **Frontend**: HTML/CSS/JavaScript
- **Backend**: Node.js + Express (JavaScript)
- **Data**: Firebase Admin SDK + Firestore
- **Payments**: Stripe Checkout + webhook logging
- **Automation**: Scheduled synchronization from a remote data source

## 1) Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## 2) Security baseline included

- Strict HTTP security headers with Helmet
- CORS allowlist through environment variable
- API rate limiting (including stricter limits for checkout sessions)
- API mutation header checks (`X-Requested-With` + JSON content-type enforcement)
- Firebase ID token verification for protected endpoints
- Firestore write/read isolation rules (`firebase/firestore.rules`)
- Input validation via `express-validator`
- Stripe webhook signature verification
- No secrets hardcoded in code

## 3) Production checklist

1. Use managed secret storage (not `.env` file in production).
2. Enable Firebase App Check for frontend-to-backend calls.
3. Replace anonymous sign-in with email/password or SSO.
4. Add audit logs and alerting (SIEM/log monitoring).
5. Enable WAF and DDoS protection at the hosting layer.
6. Configure Stripe products/prices and webhook endpoint.
7. Set strict IAM roles for Firebase service account.
8. Run dependency scanning in CI and patch monthly.

## 4) API overview

- `GET /api/health`
- `GET /api/profiles/me` (auth)
- `PUT /api/profiles/me` (auth)
- `POST /api/payments/checkout-session` (auth)
- `POST /api/payments/webhook` (Stripe)

## 5) Automation

A cron job runs every 6 hours to fetch external records and upsert into `externalDirectory` collection.

## 6) Deploy recommendations

- Deploy API on Cloud Run, Fly.io, or Render with HTTPS only.
- Use Firebase Hosting or CDN for static assets.
- Configure production domain in `APP_BASE_URL` and `CORS_ORIGIN`.
- Use Stripe live keys only in production environment.

## 7) Important legal/privacy steps before launch

- Create privacy policy and terms for your country/region.
- Add user consent and data-retention controls.
- Create account deletion and data export workflows.
- Maintain a breach-response procedure.


## 8) New UX features in this version

- Theme toggle (light/dark) with local persistence
- Draft autosave for profile edits
- Live profile preview card
- Completion and security-strength indicators
- One-click export of profile draft to JSON
- Improved responsive layout, spacing, and visual hierarchy
- Toast notifications for major actions

> For security and compliance reasons, do not use unknown credentials from the internet.
> Use your own Firebase and Stripe test credentials in `.env` and browser localStorage.

