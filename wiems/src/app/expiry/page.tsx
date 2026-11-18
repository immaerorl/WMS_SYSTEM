"use client";

import { useEffect, useState } from "react";

type Alert = {
  batchId: string;
  sku: string;
  itemName: string;
  category: string;
  batchNo: string;
  quantity: number;
  valueAtRisk: number;
  expiryDate: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "EXPIRED";
  daysLeft: number;
};

type Payload = {
  summary: { warning: number; critical: number; expired: number; valueAtRisk: number };
  alerts: Alert[];
};

const badge: Record<string, string> = {
  HEALTHY: "bg-green-100 text-green-800",
  WARNING: "bg-yellow-100 text-yellow-800",
  CRITICAL: "bg-orange-100 text-orange-800",
  EXPIRED: "bg-red-100 text-red-800",
};

export default function ExpiryPage() {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    fetch("/api/expiry-alerts")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-slate-500">Loading alerts…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Expiry Alerts</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Warning (≤90 days)</p>
          <p className="text-2xl font-bold text-yellow-700">{data.summary.warning}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Critical (≤30 days)</p>
          <p className="text-2xl font-bold text-orange-700">{data.summary.critical}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Expired</p>
          <p className="text-2xl font-bold text-red-700">{data.summary.expired}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Value at Risk</p>
          <p className="text-2xl font-bold text-slate-900">
            ${data.summary.valueAtRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Expiry</th>
              <th className="px-4 py-2">Days Left</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Value at Risk</th>
            </tr>
          </thead>
          <tbody>
            {data.alerts.map((a) => (
              <tr key={a.batchId} className="border-t">
                <td className="px-4 py-2 font-mono">{a.sku}</td>
                <td className="px-4 py-2">{a.itemName}</td>
                <td className="px-4 py-2">{a.batchNo}</td>
                <td className="px-4 py-2">{a.quantity}</td>
                <td className="px-4 py-2">{new Date(a.expiryDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{a.daysLeft}</td>
                <td className="px-4 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${badge[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  ${a.valueAtRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {data.alerts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-slate-500">
                  Nothing expiring within 90 days. 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
