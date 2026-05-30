"use client";

import { useEffect, useState } from "react";
import {
  Package, DollarSign, AlertTriangle, MapPin,
  TrendingUp, Clock, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import Link from "next/link";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

type DashboardData = {
  totalPlants: number;
  totalValue: number;
  lowStockCount: number;
  locationsCount: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    quantity: number;
    createdAt: string;
    inventory: { plantName: string };
    fromLocation: { name: string } | null;
  }>;
  topInventory: Array<{ id: string; plantName: string; cultivar: string | null; containerSize: string | null; quantityAvailable: number; location: { name: string } | null }>;
  lowStockItems: Array<{ id: string; plantName: string; cultivar: string | null; containerSize: string | null; quantityAvailable: number; lowStockThreshold: number; location: { name: string } | null }>;
  inventoryByLocation: Array<{ location: string; count: number }>;
  valueByCategory: Array<{ category: string; value: number }>;
  insights: Array<{ id: string; type: string; title: string; severity: string }>;
};

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm font-medium" style={{ color: "var(--muted)" }}>{label}</div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + "22" }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: "var(--muted)" }}>{sub}</div>}
    </div>
  );
}

const txTypeColors: Record<string, string> = {
  ADD: "var(--success)", REMOVE: "var(--danger)", ADJUST: "var(--warning)",
  MOVE: "var(--accent)", SALE: "#06b6d4", RESERVATION: "#8b5cf6",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ color: "var(--muted)" }}>
        <RefreshCw className="animate-spin mr-2" size={20} />
        Loading dashboard...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Overview of your nursery inventory</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Total Plants" value={data.totalPlants.toLocaleString()} sub="units in inventory" color="var(--accent)" />
        <StatCard icon={DollarSign} label="Inventory Value" value={`$${data.totalValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} sub="retail value" color="var(--success)" />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={String(data.lowStockCount)} sub="items below threshold" color="var(--warning)" />
        <StatCard icon={MapPin} label="Locations" value={String(data.locationsCount)} sub="growing areas" color="#8b5cf6" />
      </div>

      {/* AI Alerts */}
      {data.insights.filter((i) => i.severity !== "INFO").length > 0 && (
        <div className="mb-8 rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold">AI Alerts</div>
            <Link href="/ai" className="text-xs" style={{ color: "var(--accent)" }}>View all →</Link>
          </div>
          <div style={{ background: "var(--surface)" }}>
            {data.insights.filter((i) => i.severity !== "INFO").slice(0, 3).map((insight) => (
              <div key={insight.id} className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: insight.severity === "CRITICAL" ? "var(--danger)" : "var(--warning)" }} />
                <span className="text-sm">{insight.title}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: insight.severity === "CRITICAL" ? "#ef444422" : "#f59e0b22", color: insight.severity === "CRITICAL" ? "var(--danger)" : "var(--warning)" }}>
                  {insight.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4">Inventory by Location</h3>
          {data.inventoryByLocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.inventoryByLocation} layout="vertical">
                <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="location" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center" style={{ color: "var(--muted)" }}>No data yet</div>
          )}
        </div>
        <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4">Value by Category</h3>
          {data.valueByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.valueByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={false}>
                  {data.valueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, "Value"]} contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center" style={{ color: "var(--muted)" }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: "var(--warning)" }} />
              Low Stock Items
            </div>
            <Link href="/inventory" className="text-xs" style={{ color: "var(--accent)" }}>View all →</Link>
          </div>
          {data.lowStockItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>No low stock items</div>
          ) : (
            data.lowStockItems.slice(0, 6).map((item) => (
              <div key={item.id} className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="text-sm font-medium">{item.plantName}{item.cultivar ? ` ${item.cultivar}` : ""}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{item.containerSize} · {item.location?.name || "No location"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: item.quantityAvailable <= 5 ? "var(--danger)" : "var(--warning)" }}>{item.quantityAvailable}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>of {item.lowStockThreshold} min</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold flex items-center gap-2">
              <Clock size={14} style={{ color: "var(--accent)" }} />
              Recent Transactions
            </div>
            <Link href="/transactions" className="text-xs" style={{ color: "var(--accent)" }}>View all →</Link>
          </div>
          {data.recentTransactions.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>No transactions yet</div>
          ) : (
            data.recentTransactions.slice(0, 6).map((tx) => (
              <div key={tx.id} className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: txTypeColors[tx.type] || "var(--muted)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{tx.inventory.plantName}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold" style={{ color: txTypeColors[tx.type] }}>{tx.type}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>×{tx.quantity}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Most Abundant */}
      <div className="mt-6 rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp size={14} style={{ color: "var(--success)" }} />
            Most Abundant Plants
          </div>
          <Link href="/inventory" className="text-xs" style={{ color: "var(--accent)" }}>View inventory →</Link>
        </div>
        <div className="grid grid-cols-4 gap-0">
          {data.topInventory.slice(0, 8).map((item, i) => (
            <div key={item.id} className="px-4 py-3 border-r border-b" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-medium truncate mb-1">{item.plantName}</div>
              <div className="text-xs truncate mb-2" style={{ color: "var(--muted)" }}>{item.containerSize || "—"}</div>
              <div className="text-lg font-bold" style={{ color: COLORS[i % COLORS.length] }}>{item.quantityAvailable}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>units</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
