"use client";

import { useState } from "react";
import { issueStock } from "@/lib/api";

export default function StockOutPage() {
  const [form, setForm] = useState({ sku: "", quantity: "", requestor: "", department: "", remarks: "" });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await issueStock({ ...form, quantity: Number(form.quantity) });
      setMessage({ ok: true, text: `Issued ${form.quantity} units of ${form.sku} (FEFO).` });
      setForm({ sku: "", quantity: "", requestor: "", department: "", remarks: "" });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Failed" });
    }
  };

  const field = (name: keyof typeof form, label: string, required = false) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        required={required}
        className="w-full rounded border px-3 py-2 text-sm"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory Issue (Stock Out)</h1>
      <p className="text-sm text-slate-600">
        Stock is deducted from the batches with the nearest expiry first (FEFO).
      </p>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 shadow-sm sm:grid-cols-3"
      >
        {field("sku", "SKU", true)}
        {field("quantity", "Quantity", true)}
        {field("requestor", "Requestor")}
        {field("department", "Department")}
        {field("remarks", "Remarks")}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Issue Stock
          </button>
        </div>
      </form>

      {message && (
        <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-700"}`}>{message.text}</p>
      )}
    </div>
  );
}
