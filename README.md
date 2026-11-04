# HEJI · 禾集

A demo for exploring farm equipment sales and rentals. Product requirements and the business model are still being validated.

Only the React/TypeScript Web demo is implemented. The mini-program, backend services, and infrastructure directories are placeholders. Listings are fictional; published equipment, favorites, and transaction intents stay in the current browser. There is no real authentication, payment, or inventory reservation.

## Run locally

Use Node.js 20.12 or newer (Node.js 22 recommended).

```bash
npm ci
npm run dev:web
```

Open <http://127.0.0.1:5173/>.

## Validate and build

```bash
npm run check
```

The production files are generated in `apps/web/dist`.
