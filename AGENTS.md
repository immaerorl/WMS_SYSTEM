# AGENTS.md

## Purpose

Greenfield project: build the **Warehouse Inventory & Expiry Management System (WIEMS)** — a warehouse app that replaces a Google-Sheets-based inventory process. The full spec lives in `SYSTEMS_DESIGN_DOCUMENT.txt`; read it before implementing any module.

## Current state

- The repo contains only the design document. No code, no package files, no git repo yet. Scaffold the project when starting implementation work.

## Planned stack (per the design doc)

- Frontend: React / Next.js with Tailwind CSS (mobile-friendly)
- Backend: Node.js / NestJS, REST API under `/api/...`
- Database: PostgreSQL, UUID primary keys, schema defined in section 11 of the design doc
- Auth: JWT + role-based access control (4 roles: Administrator, Warehouse Supervisor, Warehouse Staff, Viewer — permission matrices in section 3)
- Barcode: ZXing library (mobile camera + USB scanner)

## Domain rules that matter for edits

- **One SKU = one item.** Never allow duplicate SKU creation; items are classified in exactly one category. Category creation is restricted to Administrators.
- Stock is tracked per **batch** (`inventory_batches`) with batch number, unit cost, and expiry date — not just a single quantity on the item.
- Expiry status thresholds: Healthy > 90 days, Warning ≤ 90, Critical ≤ 30, Expired (past date). Alerts fire at 90/60/30/7 days before expiry.
- Every mutation (receiving, issuing, adjustments) must write a `stock_movements` row and an audit-trail entry (user, timestamp, action, quantity, SKU).
- Receiving follows PO flow: create PO → receive → record batch + expiry. Issuing requires requestor/department.

## API surface

Routes and examples are in section 13 of the design doc (`/api/items`, `/api/items/search`, `/api/receiving`, `/api/stock-out`, `/api/expiry-alerts`). Keep new endpoints consistent with this naming.

## Notes

- Initial data will be migrated from a Google Sheets Excel (.xlsx) export; import must validate SKU uniqueness, category existence, and date formats (section 10).
- Build/test/lint commands should be added to this file once the project is scaffolded.
