# Chefs Delights — backend

A small Express API for products and orders, with Razorpay order creation and
payment verification. Data is stored in SQLite using Node's built-in
`node:sqlite`, so there is no database server to install.

## Setup

Requires Node.js 22.13 or newer.

```bash
cd backend
npm install
cp .env.example .env   # then fill in your Razorpay keys and an admin key
npm run dev            # or: npm start
```

The first start creates `data/store.db` and seeds the 36 products from
`src/data/products.ts`.

## Environment (`.env`)

| Variable                  | Required | Purpose                                                    |
| ------------------------- | -------- | ---------------------------------------------------------- |
| `RAZORPAY_KEY_ID`         | yes      | Razorpay key id (`rzp_test_…` or `rzp_live_…`)             |
| `RAZORPAY_KEY_SECRET`     | yes      | Razorpay key secret. Server only, never ship it to the browser. |
| `RAZORPAY_WEBHOOK_SECRET` | no       | Enables `POST /api/webhooks/razorpay`                      |
| `ADMIN_API_KEY`           | yes      | Sent as `x-admin-key` for admin routes                     |
| `PORT`                    | no       | Default `4000`                                             |
| `CORS_ORIGINS`            | no       | Comma-separated allowed frontend origins                   |
| `DATABASE_PATH`           | no       | Default `./data/store.db`                                  |

`.env` and `data/` are git-ignored.

## API

🔒 = needs the `x-admin-key` header.

### Products

| Method | Path                  | Notes                                                   |
| ------ | --------------------- | ------------------------------------------------------- |
| GET    | `/api/products`       | Active products. `?category=Muesli` to filter. Admin also sees inactive ones. |
| GET    | `/api/products/:slug` | One product                                             |
| POST   | `/api/products` 🔒    | `{ name, category, weight, price, note?, image?, slug?, active? }`. Slug is generated from the name if omitted. |
| PATCH  | `/api/products/:slug` 🔒 | Any subset of the fields above                       |
| DELETE | `/api/products/:slug` 🔒 | Removes it. Past orders keep their copy of the name and price. Use `PATCH {"active": false}` to hide it instead. |

### Orders

| Method | Path                      | Notes                                                |
| ------ | ------------------------- | ---------------------------------------------------- |
| POST   | `/api/orders`             | Creates the order and a Razorpay order (see below)   |
| POST   | `/api/orders/:id/verify`  | Checks the Razorpay signature and marks it `paid`     |
| GET    | `/api/orders/:id`         | One order (ids are random UUIDs)                      |
| GET    | `/api/orders` 🔒          | List. `?status=paid&email=…&limit=50&offset=0`        |
| PATCH  | `/api/orders/:id/status` 🔒 | `{ "status": "shipped" }` — one of `created, paid, failed, shipped, delivered, cancelled` |

Prices are always read from the database, so the browser can't change what it pays.

### Webhook

`POST /api/webhooks/razorpay` — in Razorpay → Webhooks, point it here, set the
same secret as `RAZORPAY_WEBHOOK_SECRET`, and enable `payment.captured`,
`order.paid` and `payment.failed`. This marks orders paid even if the buyer
closes the tab before `/verify` runs.

## Checkout flow

```js
// 1. Create the order
const res = await fetch(`${API}/api/orders`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer: { name, email, phone, address },
    items: [{ slug: "moringa-puttu-powder", quantity: 1 }],
  }),
});
const { order, checkout } = await res.json();

// 2. Open Razorpay with the server's order_id
new window.Razorpay({
  ...checkout,
  name: "Chefs Delights",
  handler: async (payment) => {
    // 3. Verify on the server. Only treat the order as paid if this succeeds.
    await fetch(`${API}/api/orders/${order.id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
  },
}).open();
```

## Example admin calls

```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{"name":"Pepper Powder","category":"Essential Powders","weight":"100g","price":99}'

curl http://localhost:4000/api/orders?status=paid -H "x-admin-key: $ADMIN_API_KEY"
```
