// API client that switches between the real backend (npm run dev / production server)
// and the in-browser demo store (static export for GitHub Pages).

const DEMO =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" ||
  (typeof window !== "undefined" && (window as { __WIEMS_DEMO__?: boolean }).__WIEMS_DEMO__ === true);

async function jsonOrThrow(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Request failed");
  return body;
}

export async function getItems(keyword?: string) {
  if (DEMO) {
    const { demoGetItems } = await import("./demo-store");
    return demoGetItems(keyword);
  }
  const res = await fetch(`/api/items${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""}`);
  return jsonOrThrow(res);
}

export async function createItem(body: {
  sku: string;
  itemName: string;
  categoryId: string;
  barcode?: string;
}) {
  if (DEMO) {
    const { demoCreateItem } = await import("./demo-store");
    return demoCreateItem(body);
  }
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return jsonOrThrow(res);
}

export async function getCategories() {
  if (DEMO) {
    const { demoGetCategories } = await import("./demo-store");
    return demoGetCategories();
  }
  const res = await fetch("/api/categories");
  return jsonOrThrow(res);
}

export async function receiveStock(body: {
  poNumber: string;
  sku: string;
  quantity: number;
  unitCost?: number;
  batchNo: string;
  mfgDate?: string;
  expiryDate: string;
}) {
  if (DEMO) {
    const { demoReceiveStock } = await import("./demo-store");
    return demoReceiveStock(body);
  }
  const res = await fetch("/api/receiving", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return jsonOrThrow(res);
}

export async function issueStock(body: {
  sku: string;
  quantity: number;
  requestor?: string;
  department?: string;
  remarks?: string;
}) {
  if (DEMO) {
    const { demoIssueStock } = await import("./demo-store");
    return demoIssueStock(body);
  }
  const res = await fetch("/api/stock-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return jsonOrThrow(res);
}

export async function getDashboard() {
  if (DEMO) {
    const { demoGetDashboard } = await import("./demo-store");
    return demoGetDashboard();
  }
  const res = await fetch("/api/dashboard");
  return jsonOrThrow(res);
}

export async function getExpiryAlerts() {
  if (DEMO) {
    const { demoGetExpiryAlerts } = await import("./demo-store");
    return demoGetExpiryAlerts();
  }
  const res = await fetch("/api/expiry-alerts");
  return jsonOrThrow(res);
}

export async function resetDemo() {
  const { demoReset } = await import("./demo-store");
  demoReset();
}
