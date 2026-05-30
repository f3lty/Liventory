"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, MapPin } from "lucide-react";

type Location = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isDemo: boolean;
  _count: { inventory: number };
};

const LOCATION_TYPES = [
  { value: "GREENHOUSE", label: "Greenhouse" },
  { value: "HOOP_HOUSE", label: "Hoop House" },
  { value: "FIELD", label: "Field" },
  { value: "SHADE_HOUSE", label: "Shade House" },
  { value: "OVERWINTERING", label: "Overwintering House" },
  { value: "NURSERY_BED", label: "Nursery Bed" },
  { value: "OTHER", label: "Other" },
];

const typeColors: Record<string, string> = {
  GREENHOUSE: "#10b981", HOOP_HOUSE: "#f59e0b", FIELD: "#84cc16",
  SHADE_HOUSE: "#8b5cf6", OVERWINTERING: "#06b6d4", NURSERY_BED: "#f97316", OTHER: "#64748b",
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Location | null>(null);
  const [form, setForm] = useState({ name: "", description: "", type: "GREENHOUSE" });
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/locations").then((r) => r.json()).then(setLocations);
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ name: "", description: "", type: "GREENHOUSE" }); setShowForm(true); };
  const openEdit = (loc: Location) => {
    setEditItem(loc);
    setForm({ name: loc.name, description: loc.description || "", type: loc.type });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    if (editItem) {
      await fetch(`/api/locations/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setShowForm(false);
    setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this location? Inventory assigned to it will be unassigned.")) return;
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Locations</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{locations.length} growing areas</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white cursor-pointer" style={{ background: "var(--accent)" }}>
          <Plus size={14} /> Add Location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="rounded-xl border p-16 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <MapPin size={32} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
          <p className="text-base font-medium mb-2">No locations yet</p>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Add your growing areas to organize inventory</p>
          <button onClick={openCreate} className="px-4 py-2 rounded-lg text-sm text-white cursor-pointer" style={{ background: "var(--accent)" }}>Add First Location</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.id} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: (typeColors[loc.type] || "#64748b") + "22" }}>
                    <MapPin size={16} style={{ color: typeColors[loc.type] || "#64748b" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{loc.name}</div>
                    {loc.isDemo && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#6366f122", color: "var(--accent)" }}>demo</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(loc)} className="p-1.5 rounded cursor-pointer" style={{ color: "var(--muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--foreground)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => remove(loc.id)} className="p-1.5 rounded cursor-pointer" style={{ color: "var(--muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#ef444422"; e.currentTarget.style.color = "var(--danger)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {loc.description && <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{loc.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                  {LOCATION_TYPES.find((t) => t.value === loc.type)?.label || loc.type}
                </span>
                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{loc._count.inventory} <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>plants</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-base font-semibold">{editItem ? "Edit Location" : "Add Location"}</h2>
              <button onClick={() => setShowForm(false)} className="cursor-pointer" style={{ color: "var(--muted)" }}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Greenhouse 1" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Primary propagation greenhouse" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {LOCATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>Cancel</button>
              <button onClick={save} disabled={!form.name || saving} className="px-4 py-2 rounded-lg text-sm text-white cursor-pointer disabled:opacity-50" style={{ background: "var(--accent)" }}>
                {saving ? "Saving..." : editItem ? "Update" : "Add Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
