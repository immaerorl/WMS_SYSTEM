"use client";

import { useEffect, useState } from "react";

type ItemRow = {
  id: string;
  sku: string;
  itemName: string;
  barcode: string | null;
  category: { categoryName: string };
  totalQuantity: number;
  totalValue: number;
  nearestExpiry: string | null;
};

type Category = { id: string; categoryName: string };

export default function InventoryPage() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({ sku: "", itemName: "", categoryId: "", barcode: "" });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = (kw = "") =>
    fetch(`/api/items${kw ? `?keyword=${encodeURIComponent(kw)}` : ""}`)
      .then((r) => r.json())
      .then(setItems);

  useEffect(() => {
    load();
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await res.json();
    if (res.ok) {
      setMessage({ ok: true, text: `Item ${form.sku} created.` });
      setForm({ sku: "", itemName: "", categoryId: "", barcode: "" });
      load();
    } else {
      setMessage({ ok: false, text: body.error });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Item Master</h1>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Register New Item</h2>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
          />
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Item name"
            value={form.itemName}
            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            required
          />
          <select
            className="rounded border px-3 py-2 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">Category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.categoryName}
              </option>
            ))}
          </select>
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Barcode (optional)"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
          />
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Create
          </button>
        </form>
        {message && (
          <p className={`mt-2 text-sm ${message.ok ? "text-green-700" : "text-red-700"}`}>
            {message.text}
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex gap-2">
          <input
            className="w-72 rounded border px-3 py-2 text-sm"
            placeholder="Search SKU, name or barcode…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            onClick={() => load(keyword)}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Search
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Nearest Expiry</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-2 font-mono">{i.sku}</td>
                  <td className="px-4 py-2">{i.itemName}</td>
                  <td className="px-4 py-2">{i.category.categoryName}</td>
                  <td className="px-4 py-2">{i.totalQuantity}</td>
                  <td className="px-4 py-2">
                    ${i.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2">
                    {i.nearestExpiry ? new Date(i.nearestExpiry).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-slate-500">
                    No items found.
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
