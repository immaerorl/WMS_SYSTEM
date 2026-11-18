"use client";

import { useState } from "react";

export default function ReceivingPage() {
  const [form, setForm] = useState({
    poNumber: "",
    sku: "",
    quantity: "",
    unitCost: "",
    batchNo: "",
    mfgDate: "",
    expiryDate: "",
  });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/receiving", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await res.json();
    if (res.ok) {
      setMessage({
        ok: true,
        text: `Batch ${form.batchNo} received for ${form.sku} (qty ${form.quantity}).`,
      });
      setForm({ poNumber: "", sku: "", quantity: "", unitCost: "", batchNo: "", mfgDate: "", expiryDate: "" });
    } else {
      setMessage({ ok: false, text: body.error });
    }
  };

  const field = (name: keyof typeof form, label: string, type = "text", required = false) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        type={type}
        required={required}
        className="w-full rounded border px-3 py-2 text-sm"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory Receiving</h1>
      <p className="text-sm text-slate-600">
        Record a batch against a PO. Expiry date is required — the system tracks expiry status
        automatically.
      </p>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 shadow-sm sm:grid-cols-3"
      >
        {field("poNumber", "PO Number", "text", true)}
        {field("sku", "SKU", "text", true)}
        {field("batchNo", "Batch Number", "text", true)}
        {field("quantity", "Quantity", "number", true)}
        {field("unitCost", "Unit Cost")}
        {field("mfgDate", "MFG Date", "date")}
        {field("expiryDate", "Expiry Date", "date", true)}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Receive Stock
          </button>
        </div>
      </form>

      {message && (
        <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-700"}`}>{message.text}</p>
      )}
    </div>
  );
}
