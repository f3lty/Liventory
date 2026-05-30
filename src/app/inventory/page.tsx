"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Download, Edit2, Trash2, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";

type Location = { id: string; name: string };
type InventoryItem = {
  id: string;
  plantName: string;
  botanicalName: string | null;
  cultivar: string | null;
  containerSize: string | null;
  quantityAvailable: number;
  quantityReserved: number;
  quantitySold: number;
  locationId: string | null;
  location: Location | null;
  propagationMethod: string;
  costPerUnit: number | null;
  retailPrice: number | null;
  wholesalePrice: number | null;
  category: string | null;
  lowStockThreshold: number;
  notes: string | null;
  isDemo: boolean;
};

const PROPAGATION_METHODS = ["CUTTING", "SEED", "DIVISION", "GRAFTING", "LAYERING", "TISSUE_CULTURE", "PURCHASED", "OTHER"];
const CATEGORIES = ["Evergreen Trees", "Deciduous Trees", "Flowering Shrubs", "Broadleaf Evergreens", "Conifers", "Perennials", "Ornamental Grasses", "Roses", "Native Plants", "Groundcovers", "Deciduous Shrubs", "Propagation Stock", "Other"];

const emptyForm = {
  plantName: "", botanicalName: "", cultivar: "", containerSize: "",
  quantityAvailable: 0, quantityReserved: 0, quantitySold: 0,
  locationId: "", propagationMethod: "CUTTING",
  costPerUnit: "", retailPrice: "", wholesalePrice: "",
  category: "", lowStockThreshold: 10, notes: "",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (search) params.set("search", search);
    if (locationFilter) params.set("location", locationFilter);
    const res = await fetch(`/api/inventory?${params}`);
    const data = await res.json();
    setItems(data.items);
    setTotal(data.total);
    setPages(data.pages);
    setLoading(false);
  }, [page, search, locationFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch("/api/locations").then((r) => r.json()).then(setLocations);
  }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({
      plantName: item.plantName,
      botanicalName: item.botanicalName || "",
      cultivar: item.cultivar || "",
      containerSize: item.containerSize || "",
      quantityAvailable: item.quantityAvailable,
      quantityReserved: item.quantityReserved,
      quantitySold: item.quantitySold,
      locationId: item.locationId || "",
      propagationMethod: item.propagationMethod,
      costPerUnit: item.costPerUnit != null ? String(item.costPerUnit) : "",
      retailPrice: item.retailPrice != null ? String(item.retailPrice) : "",
      wholesalePrice: item.wholesalePrice != null ? String(item.wholesalePrice) : "",
      category: item.category || "",
      lowStockThreshold: item.lowStockThreshold,
      notes: item.notes || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    const body = {
      ...form,
      costPerUnit: form.costPerUnit ? parseFloat(form.costPerUnit) : null,
      retailPrice: form.retailPrice ? parseFloat(form.retailPrice) : null,
      wholesalePrice: form.wholesalePrice ? parseFloat(form.wholesalePrice) : null,
      locationId: form.locationId || null,
    };
    const url = editItem ? `/api/inventory/${editItem.id}` : "/api/inventory";
    const method = editItem ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this inventory item?")) return;
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    load();
  };

  const exportCsv = () => window.open("/api/export?type=inventory", "_blank");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Inventory</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{total.toLocaleString()} items total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors" style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white cursor-pointer" style={{ background: "var(--accent)" }}>
            <Plus size={14} /> Add Plant
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search plants, botanical names, cultivars..."
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--muted)" }} />
          <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }} style={{ width: "auto" }}>
            <option value="">All Locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        {(search || locationFilter) && (
          <button onClick={() => { setSearch(""); setLocationFilter(""); setPage(1); }} className="flex items-center gap-1 text-sm cursor-pointer" style={{ color: "var(--muted)" }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                {["Plant Name", "Cultivar", "Size", "Location", "Available", "Reserved", "Sold", "Retail Price", "Category", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12" style={{ color: "var(--muted)" }}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <p style={{ color: "var(--muted)", marginBottom: 8 }}>No inventory found</p>
                    <button onClick={openCreate} className="text-sm cursor-pointer" style={{ color: "var(--accent)" }}>Add your first plant →</button>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b" style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{item.plantName}</div>
                      {item.botanicalName && <div className="text-xs italic" style={{ color: "var(--muted)" }}>{item.botanicalName}</div>}
                      {item.isDemo && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#6366f122", color: "var(--accent)" }}>demo</span>}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.cultivar || "—"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.containerSize || "—"}</td>
                    <td className="px-4 py-3 text-sm">{item.location?.name || <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span style={{ color: item.quantityAvailable <= item.lowStockThreshold ? "var(--warning)" : "var(--foreground)" }}>
                        {item.quantityAvailable}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.quantityReserved}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.quantitySold}</td>
                    <td className="px-4 py-3 text-sm">{item.retailPrice ? `$${Number(item.retailPrice).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {item.category && (
                        <span className="px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{item.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded cursor-pointer" style={{ color: "var(--muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.background = "var(--border)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => remove(item.id)} className="p-1.5 rounded cursor-pointer" style={{ color: "var(--muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "#ef444422"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--muted)" }}>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded cursor-pointer" style={{ color: page === 1 ? "var(--border)" : "var(--muted)" }}>
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-1.5 rounded cursor-pointer" style={{ color: page === pages ? "var(--border)" : "var(--muted)" }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-2xl rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-base font-semibold">{editItem ? "Edit Plant" : "Add Plant"}</h2>
              <button onClick={() => setShowForm(false)} className="cursor-pointer" style={{ color: "var(--muted)" }}><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Plant Name *</label>
                  <input value={form.plantName} onChange={(e) => setForm({ ...form, plantName: e.target.value })} placeholder="e.g. Green Giant Arborvitae" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Botanical Name</label>
                  <input value={form.botanicalName} onChange={(e) => setForm({ ...form, botanicalName: e.target.value })} placeholder="e.g. Thuja standishii × plicata" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Cultivar</label>
                  <input value={form.cultivar} onChange={(e) => setForm({ ...form, cultivar: e.target.value })} placeholder="e.g. Green Giant" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Container Size</label>
                  <input value={form.containerSize} onChange={(e) => setForm({ ...form, containerSize: e.target.value })} placeholder="e.g. 3 Gal, 5 Gal, Liner" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Location</label>
                  <select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
                    <option value="">No location</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Qty Available</label>
                  <input type="number" value={form.quantityAvailable} onChange={(e) => setForm({ ...form, quantityAvailable: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Qty Reserved</label>
                  <input type="number" value={form.quantityReserved} onChange={(e) => setForm({ ...form, quantityReserved: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Qty Sold</label>
                  <input type="number" value={form.quantitySold} onChange={(e) => setForm({ ...form, quantitySold: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Propagation Method</label>
                  <select value={form.propagationMethod} onChange={(e) => setForm({ ...form, propagationMethod: e.target.value })}>
                    {PROPAGATION_METHODS.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Cost Per Unit ($)</label>
                  <input type="number" step="0.01" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Retail Price ($)</label>
                  <input type="number" step="0.01" value={form.retailPrice} onChange={(e) => setForm({ ...form, retailPrice: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Wholesale Price ($)</label>
                  <input type="number" step="0.01" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Low Stock Threshold</label>
                  <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: parseInt(e.target.value) || 10 })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Notes</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes about this plant..." />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>Cancel</button>
              <button onClick={save} disabled={!form.plantName || saving} className="px-4 py-2 rounded-lg text-sm text-white cursor-pointer disabled:opacity-50" style={{ background: "var(--accent)" }}>
                {saving ? "Saving..." : editItem ? "Update" : "Add Plant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
