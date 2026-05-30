"use client";

import { useEffect, useState } from "react";
import { Download, BarChart3, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

type ReportData = {
  totalPlants: number;
  totalValue: number;
  lowStockCount: number;
  locationsCount: number;
  inventoryByLocation: Array<{ location: string; count: number }>;
  valueByCategory: Array<{ category: string; value: number }>;
  lowStockItems: Array<{ plantName: string; cultivar: string | null; containerSize: string | null; quantityAvailable: number; lowStockThreshold: number; location: { name: string } | null }>;
  topInventory: Array<{ plantName: string; cultivar: string | null; containerSize: string | null; quantityAvailable: number; retailPrice: number | null; location: { name: string } | null }>;
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const exportCsv = (type: string) => window.open(`/api/export?type=${type}`, "_blank");

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ color: "var(--muted)" }}>
      <RefreshCw className="animate-spin mr-2" size={20} /> Loading reports...
    </div>
  );

  if (!data) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <BarChart3 size={22} style={{ color: "var(--accent)" }} />
            Reports
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Inventory analytics and export tools</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => exportCsv("inventory")} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <Download size={14} /> Export Inventory
          </button>
          <button onClick={() => exportCsv("transactions")} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <Download size={14} /> Export Transactions
          </button>
          <button onClick={() => exportCsv("locations")} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <Download size={14} /> Export Locations
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Plants", value: data.totalPlants.toLocaleString(), sub: "units in stock" },
          { label: "Retail Value", value: `$${data.totalValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: "total retail" },
          { label: "Low Stock Items", value: String(data.lowStockCount), sub: "below threshold" },
          { label: "Locations", value: String(data.locationsCount), sub: "growing areas" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Inventory by Location */}
        <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4">Inventory by Location</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.inventoryByLocation} layout="vertical">
              <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="location" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Value by Category */}
        <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4">Inventory Value by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.valueByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={false}>
                {data.valueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Value"]} contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="rounded-xl border overflow-hidden mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold">Low Stock Report</h3>
        </div>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {["Plant", "Container Size", "Location", "Available", "Threshold", "Status"].map((h) => (
                <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lowStockItems.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>No low stock items</td></tr>
            ) : (
              data.lowStockItems.map((item, i) => (
                <tr key={i} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3 text-sm font-medium">{item.plantName}{item.cultivar ? ` ${item.cultivar}` : ""}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.containerSize || "—"}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.location?.name || "Unassigned"}</td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: item.quantityAvailable <= 5 ? "var(--danger)" : "var(--warning)" }}>{item.quantityAvailable}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: item.quantityAvailable <= 5 ? "#ef444415" : "#f59e0b15", color: item.quantityAvailable <= 5 ? "var(--danger)" : "var(--warning)" }}>
                      {item.quantityAvailable <= 5 ? "Critical" : "Low"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Top Inventory Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold">Highest Inventory Items</h3>
        </div>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {["Plant", "Container Size", "Location", "Available", "Retail Price", "Total Value"].map((h) => (
                <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.topInventory.map((item, i) => (
              <tr key={i} className="border-b" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 text-sm font-medium">{item.plantName}{item.cultivar ? ` ${item.cultivar}` : ""}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.containerSize || "—"}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{item.location?.name || "Unassigned"}</td>
                <td className="px-4 py-3 text-sm font-bold">{item.quantityAvailable}</td>
                <td className="px-4 py-3 text-sm">{item.retailPrice ? `$${Number(item.retailPrice).toFixed(2)}` : "—"}</td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--success)" }}>
                  {item.retailPrice ? `$${(Number(item.retailPrice) * item.quantityAvailable).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
