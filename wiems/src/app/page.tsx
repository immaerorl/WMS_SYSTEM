"use client";

import { useEffect, useState } from "react";

type Dashboard = {
  inventory: { totalSkus: number; totalUnits: number; inventoryValue: number };
  expiry: { HEALTHY: number; WARNING: number; CRITICAL: number; EXPIRED: number };
  recentMovements: {
    id: string;
    movementType: string;
    quantity: number;
    createdAt: string;
    item: { sku: string; itemName: string };
  }[];
};

const statusColors: Record<string, string> = {
  HEALTHY: "bg-green-100 text-green-800",
  WARNING: "bg-yellow-100 text-yellow-800",
  CRITICAL: "bg-orange-100 text-orange-800",
  EXPIRED: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return <p className="text-slate-500">Loading dashboard…</p>;

  const cards = [
    { label: "Total SKUs", value: data.inventory.totalSkus },
    { label: "Total Units", value: data.inventory.totalUnits },
    {
      label: "Inventory Value",
      value: `$${data.inventory.inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    },
    { label: "Healthy Stock", value: data.expiry.HEALTHY, color: "text-green-700" },
    { label: "Warning (≤90d)", value: data.expiry.WARNING, color: "text-yellow-700" },
    { label: "Critical (≤30d)", value: data.expiry.CRITICAL, color: "text-orange-700" },
    { label: "Expired", value: data.expiry.EXPIRED, color: "text-red-700" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color ?? "text-slate-900"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Movements</h2>
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {data.recentMovements.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2 text-slate-600">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        m.movementType === "RECEIVING"
                          ? statusColors.HEALTHY
                          : m.movementType === "ISSUE"
                            ? statusColors.WARNING
                            : statusColors.CRITICAL
                      }`}
                    >
                      {m.movementType}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono">{m.item.sku}</td>
                  <td className="px-4 py-2">{m.item.itemName}</td>
                  <td className="px-4 py-2">{m.quantity}</td>
                </tr>
              ))}
              {data.recentMovements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-slate-500">
                    No movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
