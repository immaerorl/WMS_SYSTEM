# WIEMS — Warehouse Inventory & Expiry Management System

A full-stack warehouse inventory app that replaces spreadsheet-based tracking: one master record per SKU, batch-level stock with expiry monitoring, FEFO issuing, and automatic expiry alerts.

**Live demo (static):** https://immaerorl.github.io/WMS_SYSTEM/

## Features

- **Dashboard** — KPI cards for total SKUs, units, inventory value, and healthy / warning (≤90d) / critical (≤30d) / expired stock, plus a recent-movements audit log
- **Item Master** — register items with category and barcode; enforces *One SKU = One Item* (duplicate SKUs are rejected); search by SKU, name, or barcode
- **Inventory Receiving** — record batches against a PO with batch number, unit cost, and expiry date
- **Stock Out** — issues stock using FEFO (First Expired, First Out); blocks over-issuing with the available quantity
- **Expiry Alerts** — automatic status per batch (Healthy / Warning / Critical / Expired) with days left and value at risk
- **Audit trail** — every receiving / issue / adjustment writes a `stock_movements` record

## Tech stack

| Layer      | Choice                                        |
|------------|-----------------------------------------------|
| Frontend   | Next.js 16 (App Router), React 19, Tailwind 4 |
| Backend    | Next.js API routes (REST, `/api/...`)         |
| Database   | Prisma ORM + SQLite (swap to PostgreSQL via one schema line) |
| Demo mode  | In-browser localStorage store for static hosting |

## Running locally (full stack)

```bash
cd wiems
npm install
npx prisma db push        # create SQLite database
npx tsx prisma/seed.ts    # sample items incl. expired/near-expiry batches
npm run dev               # http://localhost:3000
```

The dev server runs the real API + database; all data persists in `wiems/prisma/dev.db`.

## Running locally (static demo)

```bash
cd wiems
npm run build:static
npx serve out             # or open any static file server on ./out
```

In static mode the UI uses an in-browser demo store (localStorage) instead of the API — same behavior, no backend needed. Data can be reset by clearing the site's localStorage key `wiems-demo-v1`.

## Deployment (GitHub Pages)

A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) builds the static export and deploys it on every push to `main`. Requires the repo's **Settings → Pages → Source** to be set to **GitHub Actions**. The build uses `basePath: /WMS_SYSTEM` to match the `github.io/<repo>/` URL.

> The GitHub Pages deployment is a demo only — the real backend (API routes + database) requires a server host such as Vercel, Render, or a VPS.

## API endpoints (dev/full-stack mode)

| Method | Endpoint              | Purpose                        |
|--------|-----------------------|--------------------------------|
| GET    | `/api/items?keyword=` | List/search items              |
| POST   | `/api/items`          | Create item (rejects dup SKU)  |
| GET    | `/api/categories`     | List active categories         |
| POST   | `/api/receiving`      | Receive batch against a PO     |
| POST   | `/api/stock-out`      | Issue stock (FEFO)             |
| GET    | `/api/expiry-alerts`  | Expiring batches + summary     |
| GET    | `/api/dashboard`      | KPI summary + recent movements |
| GET/POST | `/api/movements`    | Audit log / stock adjustment   |

## Project structure

```
wiems/
├── prisma/
│   ├── schema.prisma     # DB schema (users, roles, categories, items, batches, movements, POs…)
│   └── seed.ts           # sample data
├── scripts/
│   └── static-build.mjs  # static export build (moves API routes aside)
├── src/
│   ├── app/
│   │   ├── api/…         # REST API routes (server mode)
│   │   ├── inventory/ receiving/ stock-out/ expiry/   # UI pages
│   │   └── page.tsx      # dashboard
│   ├── components/Navbar.tsx
│   └── lib/
│       ├── prisma.ts     # Prisma client singleton
│       ├── api.ts        # API client (switches server/demo)
│       └── demo-store.ts # localStorage demo backend
└── .github/workflows/deploy-pages.yml
```

## Roadmap

Planned per the systems design doc (`SYSTEMS_DESIGN_DOCUMENT.txt` at the repo root):

- [ ] User authentication (JWT) + role-based access control
- [ ] Barcode scanning (ZXing, mobile camera + USB scanners)
- [ ] Excel import/migration from Google Sheets export
- [ ] Email / WhatsApp expiry notifications
- [ ] PostgreSQL production database
