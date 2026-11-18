// Client-side demo data layer used when NEXT_PUBLIC_DEMO_MODE=1 (static export).
// Mirrors the server API's JSON shapes so the same UI runs on GitHub Pages.

export type DemoBatch = {
  id: string;
  itemId: string;
  batchNo: string;
  quantity: number;
  unitCost: number;
  mfgDate: string | null;
  expiryDate: string;
  locationId: string | null;
};

export type DemoItem = {
  id: string;
  sku: string;
  itemName: string;
  categoryId: string;
  barcode: string | null;
  active: boolean;
  category: { id: string; categoryName: string; active: boolean };
  batches: DemoBatch[];
  totalQuantity: number;
  totalValue: number;
  nearestExpiry: string | null;
};

export type DemoMovement = {
  id: string;
  itemId: string;
  movementType: "RECEIVING" | "ISSUE" | "ADJUSTMENT";
  quantity: number;
  batchId: string | null;
  referenceNumber: string | null;
  requestor: string | null;
  department: string | null;
  remarks: string | null;
  createdBy: string;
  createdAt: string;
  item: { sku: string; itemName: string };
};

const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

const CATEGORIES = [
  { id: "cat-first-aid", categoryName: "First Aid", active: true },
  { id: "cat-ppe", categoryName: "PPE", active: true },
  { id: "cat-meddev", categoryName: "Medical Devices", active: true },
  { id: "cat-cons", categoryName: "Consumables", active: true },
];

const SEED_ITEMS: Omit<DemoItem, "totalQuantity" | "totalValue" | "nearestExpiry">[] = [
  { id: "i1", sku: "GZ001", itemName: "Sterile Gauze 10x10", categoryId: "cat-first-aid", barcode: "BCGZ001", active: true, category: CATEGORIES[0], batches: [{ id: "b1", itemId: "i1", batchNo: "B2026-GZ001", quantity: 500, unitCost: 1.25, mfgDate: null, expiryDate: daysFromNow(100), locationId: null }] },
  { id: "i2", sku: "GZ001B", itemName: "Sterile Gauze 10x10 (Bulk)", categoryId: "cat-first-aid", barcode: "BCGZ001B", active: true, category: CATEGORIES[0], batches: [{ id: "b2", itemId: "i2", batchNo: "B2026-GZ001B", quantity: 500, unitCost: 1.25, mfgDate: null, expiryDate: daysFromNow(15), locationId: null }] },
  { id: "i3", sku: "MSK001", itemName: "Surgical Mask 3-ply", categoryId: "cat-ppe", barcode: "BCMSK001", active: true, category: CATEGORIES[1], batches: [{ id: "b3", itemId: "i3", batchNo: "B2026-MSK001", quantity: 500, unitCost: 1.25, mfgDate: null, expiryDate: daysFromNow(60), locationId: null }] },
  { id: "i4", sku: "GLV001", itemName: "Nitrile Gloves M", categoryId: "cat-ppe", barcode: "BCGLV001", active: true, category: CATEGORIES[1], batches: [{ id: "b4", itemId: "i4", batchNo: "B2026-GLV001", quantity: 500, unitCost: 1.25, mfgDate: null, expiryDate: daysFromNow(400), locationId: null }] },
  { id: "i5", sku: "SYR005", itemName: "Syringe 5ml", categoryId: "cat-meddev", barcode: "BCSYR005", active: true, category: CATEGORIES[2], batches: [{ id: "b5", itemId: "i5", batchNo: "B2026-SYR005", quantity: 500, unitCost: 1.25, mfgDate: null, expiryDate: daysFromNow(-10), locationId: null }] },
  { id: "i6", sku: "ALC500", itemName: "Alcohol Swabs 500pk", categoryId: "cat-cons", barcode: "BCALC500", active: true, category: CATEGORIES[3], batches: [{ id: "b6", itemId: "i6", batchNo: "B2026-ALC500", quantity: 500, unitCost: 1.25, mfgDate: null, expiryDate: daysFromNow(85), locationId: null }] },
  { id: "i7", sku: "TAP001", itemName: "Medical Tape 1in", categoryId: "cat-first-aid", barcode: "BCTAP001", active: true, category: CATEGORIES[0], batches: [{ id: "b7", itemId: "i7", batchNo: "B2026-TAP001", quantity: 500, unitCost: 1.25, mfgDate: null, expiryDate: daysFromNow(200), locationId: null }] },
];

const STORAGE_KEY = "wiems-demo-v1";

type DemoState = {
  items: DemoItem[];
  movements: DemoMovement[];
  seq: number;
};

function initialState(): DemoState {
  return {
    items: JSON.parse(JSON.stringify(SEED_ITEMS)),
    movements: [],
    seq: 1,
  };
}

function load(): DemoState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {}
  const fresh = initialState();
  save(fresh);
  return fresh;
}

function save(state: DemoState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function decorate(item: Omit<DemoItem, "totalQuantity" | "totalValue" | "nearestExpiry">): DemoItem {
  const totalQuantity = item.batches.reduce((s, b) => s + b.quantity, 0);
  const totalValue = item.batches.reduce((s, b) => s + b.quantity * b.unitCost, 0);
  const nearestExpiry =
    item.batches
      .filter((b) => b.quantity > 0)
      .map((b) => b.expiryDate)
      .sort()[0] ?? null;
  return { ...item, totalQuantity, totalValue, nearestExpiry };
}

export function expiryStatus(expiryDate: string): {
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "EXPIRED";
  daysLeft: number;
} {
  const daysLeft = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (daysLeft < 0) return { status: "EXPIRED", daysLeft };
  if (daysLeft <= 30) return { status: "CRITICAL", daysLeft };
  if (daysLeft <= 90) return { status: "WARNING", daysLeft };
  return { status: "HEALTHY", daysLeft };
}

export class DemoApiError extends Error {}

// ---- API-shaped functions (mirror the server routes) ----

export function demoGetItems(keyword?: string): DemoItem[] {
  const kw = keyword?.toLowerCase();
  return load()
    .items.map(decorate)
    .filter((i) =>
      kw
        ? i.sku.toLowerCase().includes(kw) ||
          i.itemName.toLowerCase().includes(kw) ||
          (i.barcode ?? "").toLowerCase().includes(kw)
        : true
    );
}

export function demoGetCategories() {
  return CATEGORIES;
}

export function demoCreateItem(body: {
  sku: string;
  itemName: string;
  categoryId: string;
  barcode?: string;
}): DemoItem {
  const state = load();
  if (state.items.some((i) => i.sku === body.sku)) {
    throw new DemoApiError(`SKU ${body.sku} already exists. One SKU = One Item.`);
  }
  const category = CATEGORIES.find((c) => c.id === body.categoryId);
  if (!category) throw new DemoApiError("Unknown category");
  const item = {
    id: `i${state.seq++}`,
    sku: body.sku,
    itemName: body.itemName,
    categoryId: body.categoryId,
    barcode: body.barcode || null,
    active: true,
    category,
    batches: [] as DemoBatch[],
  };
  const decorated = decorate(item);
  state.items.push(decorated);
  save(state);
  return decorated;
}

export function demoReceiveStock(body: {
  poNumber: string;
  sku: string;
  quantity: number;
  unitCost?: number;
  batchNo: string;
  mfgDate?: string;
  expiryDate: string;
}): DemoBatch {
  const state = load();
  const item = state.items.find((i) => i.sku === body.sku);
  if (!item) throw new DemoApiError(`Unknown SKU: ${body.sku}`);
  const batch: DemoBatch = {
    id: `b${state.seq++}`,
    itemId: item.id,
    batchNo: body.batchNo,
    quantity: Number(body.quantity),
    unitCost: body.unitCost ? Number(body.unitCost) : 0,
    mfgDate: body.mfgDate || null,
    expiryDate: new Date(body.expiryDate).toISOString(),
    locationId: null,
  };
  item.batches.push(batch);
  state.movements.unshift({
    id: `m${state.seq++}`,
    itemId: item.id,
    movementType: "RECEIVING",
    quantity: Number(body.quantity),
    batchId: batch.id,
    referenceNumber: body.poNumber,
    requestor: null,
    department: null,
    remarks: null,
    createdBy: "demo",
    createdAt: new Date().toISOString(),
    item: { sku: item.sku, itemName: item.itemName },
  });
  save(state);
  return batch;
}

export function demoIssueStock(body: {
  sku: string;
  quantity: number;
  requestor?: string;
  department?: string;
  remarks?: string;
}): { ok: true; issued: number } {
  const state = load();
  const item = state.items.find((i) => i.sku === body.sku);
  if (!item) throw new DemoApiError(`Unknown SKU: ${body.sku}`);
  const available = item.batches
    .filter((b) => b.quantity > 0)
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const total = available.reduce((s, b) => s + b.quantity, 0);
  if (body.quantity > total) throw new DemoApiError(`Insufficient stock. Available: ${total}`);
  let remaining = body.quantity;
  for (const b of available) {
    if (remaining <= 0) break;
    const take = Math.min(b.quantity, remaining);
    b.quantity -= take;
    remaining -= take;
  }
  state.movements.unshift({
    id: `m${state.seq++}`,
    itemId: item.id,
    movementType: "ISSUE",
    quantity: body.quantity,
    batchId: null,
    referenceNumber: null,
    requestor: body.requestor || null,
    department: body.department || null,
    remarks: body.remarks || null,
    createdBy: "demo",
    createdAt: new Date().toISOString(),
    item: { sku: item.sku, itemName: item.itemName },
  });
  save(state);
  return { ok: true, issued: body.quantity };
}

export function demoGetDashboard() {
  const state = load();
  const batches = state.items.flatMap((i) => i.batches).filter((b) => b.quantity > 0);
  const expiry = { HEALTHY: 0, WARNING: 0, CRITICAL: 0, EXPIRED: 0 };
  for (const b of batches) expiry[expiryStatus(b.expiryDate).status]++;
  return {
    inventory: {
      totalSkus: state.items.length,
      totalUnits: batches.reduce((s, b) => s + b.quantity, 0),
      inventoryValue: batches.reduce((s, b) => s + b.quantity * b.unitCost, 0),
    },
    expiry,
    recentMovements: state.movements.slice(0, 50),
  };
}

export function demoGetExpiryAlerts() {
  const state = load();
  const alerts = state.items
    .flatMap((item) =>
      item.batches
        .filter((b) => b.quantity > 0)
        .map((b) => ({ item, batch: b }))
    )
    .map(({ item, batch }) => ({
      batchId: batch.id,
      sku: item.sku,
      itemName: item.itemName,
      category: item.category.categoryName,
      batchNo: batch.batchNo,
      quantity: batch.quantity,
      unitCost: batch.unitCost,
      valueAtRisk: batch.quantity * batch.unitCost,
      expiryDate: batch.expiryDate,
      ...expiryStatus(batch.expiryDate),
    }))
    .filter((a) => a.status !== "HEALTHY")
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  return {
    summary: {
      warning: alerts.filter((a) => a.status === "WARNING").length,
      critical: alerts.filter((a) => a.status === "CRITICAL").length,
      expired: alerts.filter((a) => a.status === "EXPIRED").length,
      valueAtRisk: alerts.reduce((s, a) => s + a.valueAtRisk, 0),
    },
    alerts,
  };
}

export function demoReset() {
  save(initialState());
}
