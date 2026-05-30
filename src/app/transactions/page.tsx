"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react";

type InventoryItem = { id: string; plantName: string; cultivar: string | null; containerSize: string | null };
type Location = { id: string; name: string };
type Transaction = {
  id: string;
  type: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
  isDemo: boolean;
  inventory: InventoryItem;
  fromLocation: Location | null;
};

const TX_TYPES = [
  { value: "ADD", label: "Add Inventory", color: "var(--success)" },
  { value: "REMOVE", label: "Remove Inventory", color: "var(--danger)" },
  { value: "MOVE", label: "Move Inventory", color: "var(--accent)" },
  { value: "ADJUST", label: "Adjust Inventory", color: "var(--warning)" },
  { value: "SALE", label: "Record Sale", color: "#06b6d4" },
  { value: "RESERVATION", label: "Reservation", color: "#8b5cf6" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ inventoryId: "", type: "ADD", quantity: 1, fromLocationId: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?page=${page}&limit=30`);
    const data = await res.json();
    setTransactions(data.transactions);
    setTotal(data.total);
    setPages(data.pages);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch("/api/inventory?limit=500").then((r) => r.json()).then((d) => setInventory(d.items));
    fetch("/api/locations").then((r) => r.json()).then(setLocations);
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quantity: parseInt(String(form.quantity)) || 1, fromLocationId: form.fromLocationId || null }),
    });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const txColor = (type: string) => TX_TYPES.find((t) => t.value === type)?.color || "var(--muted)";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Transactions</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{total.toLocaleString()} total records</p>
        </div>
        <button onClick={() => { setForm({ inventoryId: "", type: "ADD", quantity: 1, fromLocationId: "", notes: "" }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white cursor-pointer" style={{ background: "var(--accent)" }}>
          <Plus size={14} /> Record Transaction
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                {["Date", "Plant", "Type", "Quantity", "From Location", "Notes", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12" style={{ color: "var(--muted)" }}>Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <ArrowLeftRight size={32} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
                    <p style={{ color: "var(--muted)" }}>No transactions yet</p>
                    <button onClick={() => setShowForm(true)} className="text-sm mt-2 cursor-pointer" style={{ color: "var(--accent)" }}>Record first transaction →</button>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b" style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{tx.inventory.plantName}</div>
                      {tx.inventory.cultivar && <div className="text-xs" style={{ color: "var(--muted)" }}>{tx.inventory.cultivar} · {tx.inventory.containerSize}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: txColor(tx.type) + "22", color: txColor(tx.type) }}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">×{tx.quantity}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{tx.fromLocation?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: "var(--muted)" }}>{tx.notes || "—"}</td>
                    <td className="px-4 py-3">
                      {tx.isDemo && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#6366f122", color: "var(--accent)" }}>demo</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--muted)" }}>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded cursor-pointer" style={{ color: page === 1 ? "var(--border)" : "var(--muted)" }}><ChevronLeft size={15} /></button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded cursor-pointer" style={{ color: page === pages ? "var(--border)" : "var(--muted)" }}><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-base font-semibold">Record Transaction</h2>
              <button onClick={() => setShowForm(false)} className="cursor-pointer" style={{ color: "var(--muted)" }}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Plant *</label>
                <select value={form.inventoryId} onChange={(e) => setForm({ ...form, inventoryId: e.target.value })}>
                  <option value="">Select plant...</option>
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.plantName}{i.cultivar ? ` ${i.cultivar}` : ""}{i.containerSize ? ` (${i.containerSize})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Transaction Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TX_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>
                  Quantity {form.type === "ADJUST" ? "(set to)" : ""}
                </label>
                <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>From Location (optional)</label>
                <select value={form.fromLocationId} onChange={(e) => setForm({ ...form, fromLocationId: e.target.value })}>
                  <option value="">None</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Notes</label>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>Cancel</button>
              <button onClick={save} disabled={!form.inventoryId || saving} className="px-4 py-2 rounded-lg text-sm text-white cursor-pointer disabled:opacity-50" style={{ background: "var(--accent)" }}>
                {saving ? "Saving..." : "Record Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
