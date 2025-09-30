# Razorpay Payment Integration (Node.js + Postgres)

```
A ready-to-run backend for Razorpay subscriptions and one-time payments.  
Clone, configure environment variables, run migrations and start the server — no backend code required.
```
---

## Features

```
- Create/manage Razorpay plans & subscriptions
- One-time payment support
- Webhook signature verification & event handling (HMAC SHA256)
- Persistence with PostgreSQL (Drizzle / SQL)
- Local webhook testing with ngrok
- Exact `.env` variables used by the project
```
---

## Environment Variables

Create a `.env` file in the project root with:

```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
CALLBACK_URL
RAZORPAY_WEBHOOK_KEY
DATABASE_URL
PORT (optional, default 3000)
NODE_ENV (optional)
```

Example `.env`:

```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_KEY=whsec_XXXXXXXXXXXXXXXX
CALLBACK_URL=https://your-frontend.com/checkout/callback

DATABASE_URL=postgres://dbuser:dbpassword@localhost:5432/razorpay_integration
PORT=3000
NODE_ENV=development
```
---

## Quickstart

### 1. Clone the repo

```
git clone https://github.com/WeDigIT-Tech-pvt-ltd/razorpay-payment-integration.git

cd razorpay-payment-integration
```

### 2. Install dependencies

```
npm install

or

pnpm install

or

yarn
```

### 3. Create Postgres Database

```
createdb razorpay_integration
```

### 4. Add `.env`

```
Use the exact variable names above.
```

### 5. Run Database Migrations

```
npm run migrate

or using drizzle-kit

npx drizzle-kit migrate:dev --connection "$DATABASE_URL" --schema ./src/db/schema.ts
```

### 6. Start the Server

```
npm run dev

or

node index.js

Server will be available at `http://localhost:3000`.
```
---

## Local Webhook Testing (ngrok + signature)

### 1. Expose local server

```ngrok http 3000```

### 2. Configure Razorpay Webhook in Dashboard

```
- URL: `https://<ngrok-id>.ngrok.io/webhook/razorpay`
- Webhook secret: set to `RAZORPAY_WEBHOOK_KEY`
- Subscribe to events: `subscription.charged`, `payment.captured`, `subscription.cancelled`, etc.
```

### 3. Send a signed test webhook

```
cat > payload.json <<'JSON'
{
"event": "payment.captured",
"payload": {
"payment": {
"entity": {
"id": "pay_test_123",
"amount": 10000,
"currency": "INR"
}
}
}
}
JSON

WEBHOOK_SECRET="whsec_XXXXXXXXXXXXXXXX"
SIGNATURE=$(openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary payload.json | base64)

curl -X POST https://<ngrok-id>.ngrok.io/webhook/razorpay
-H "Content-Type: application/json"
-H "X-Razorpay-Signature: $SIGNATURE"
--data-binary @payload.json


> Adjust header if your app expects a different signature header.
```
---

## API Endpoints

```
POST /api/plans — create a Razorpay plan
POST /api/subscriptions — create a subscription for a customer
POST /api/payments/one-time — create a one-time order / checkout flow
POST /webhook/razorpay — webhook endpoint
GET /subscriptions/:id — fetch subscription state
```
---

## Testing Subscriptions

```
- Create a Plan in Razorpay Dashboard or via API.

- Call POST /api/subscriptions to create a subscription.

- Use Razorpay Checkout in test mode or trigger flows via Dashboard.

- Verify webhook events update the DB correctly.
```
---

## Troubleshooting

Webhook signature verification fails:

```
Ensure RAZORPAY_WEBHOOK_KEY matches Dashboard
Use raw request body for HMAC computation
```

DB connection issues:

```
Confirm DATABASE_URL and Postgres access
```

Subscription creation errors:

```
Verify RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET and test keys
```
---

## Contributing

```
PRs welcome — add Docker support, sample frontend, tests, or improved migrations.
If this project helped you, a ⭐ would be appreciated!
```
