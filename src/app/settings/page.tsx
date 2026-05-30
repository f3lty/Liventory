"use client";

import { useState } from "react";
import { Database, RefreshCw, Trash2, PlayCircle, CheckCircle, AlertTriangle } from "lucide-react";

type DemoStatus = { hasDemo: boolean; inventoryCount: number; locationCount: number } | null;
type Toast = { msg: string; type: "success" | "error" } | null;

export default function SettingsPage() {
  const [demoStatus, setDemoStatus] = useState<DemoStatus>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const checkStatus = async () => {
    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status" }),
    });
    setDemoStatus(await res.json());
  };

  const demoAction = async (action: string) => {
    setLoading(action);
    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, "success");
    } else {
      showToast(data.error || "Action failed", "error");
    }
    await checkStatus();
    setLoading(null);
  };

  return (
    <div className="p-8 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2"
          style={{ background: toast.type === "success" ? "var(--success)" : "var(--danger)", color: "#fff" }}
        >
          {toast.type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Application configuration and demo data management</p>
      </div>

      {/* Demo Data Section */}
      <div className="rounded-xl border overflow-hidden mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Database size={16} style={{ color: "var(--accent)" }} />
            Demo Data Management
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Load realistic nursery data for investor demos and presentations. All demo data is clearly labeled and can be removed at any time.
          </p>
        </div>

        <div className="p-6">
          {/* Status Check */}
          <div className="rounded-lg p-4 mb-6" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-0.5">Demo Data Status</p>
                {demoStatus === null ? (
                  <p className="text-xs" style={{ color: "var(--muted)" }}>Click Check Status to see current state</p>
                ) : demoStatus.hasDemo ? (
                  <p className="text-xs" style={{ color: "var(--warning)" }}>
                    Active: {demoStatus.inventoryCount} inventory records · {demoStatus.locationCount} locations loaded
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: "var(--success)" }}>No demo data currently loaded</p>
                )}
              </div>
              <button
                onClick={checkStatus}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                style={{ background: "var(--border)", color: "var(--muted)" }}
              >
                <RefreshCw size={12} /> Check Status
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Load Demo Data */}
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
              <PlayCircle size={20} className="mb-2" style={{ color: "var(--success)" }} />
              <p className="text-sm font-medium mb-1">Load Demo Data</p>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                Loads 60+ inventory items, 8 locations, and AI insights for demonstration
              </p>
              <button
                onClick={() => demoAction("load")}
                disabled={loading !== null}
                className="w-full py-2 rounded-lg text-xs font-medium text-white cursor-pointer disabled:opacity-50"
                style={{ background: "var(--success)" }}
              >
                {loading === "load" ? "Loading..." : "Load Demo Data"}
              </button>
            </div>

            {/* Delete Demo Data */}
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
              <Trash2 size={20} className="mb-2" style={{ color: "var(--danger)" }} />
              <p className="text-sm font-medium mb-1">Delete Demo Data</p>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                Removes all demo records. Your real inventory data is not affected.
              </p>
              <button
                onClick={() => { if (confirm("Delete all demo data?")) demoAction("delete"); }}
                disabled={loading !== null}
                className="w-full py-2 rounded-lg text-xs font-medium text-white cursor-pointer disabled:opacity-50"
                style={{ background: "var(--danger)" }}
              >
                {loading === "delete" ? "Deleting..." : "Delete Demo Data"}
              </button>
            </div>

            {/* Reset Demo */}
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
              <RefreshCw size={20} className="mb-2" style={{ color: "var(--accent)" }} />
              <p className="text-sm font-medium mb-1">Reset Demo Environment</p>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                Deletes and reloads fresh demo data. Use to restore a pristine demo state.
              </p>
              <button
                onClick={() => { if (confirm("Reset the demo environment? This will delete and reload all demo data.")) demoAction("reset"); }}
                disabled={loading !== null}
                className="w-full py-2 rounded-lg text-xs font-medium text-white cursor-pointer disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                {loading === "reset" ? "Resetting..." : "Reset Demo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="text-base font-semibold mb-4">Configuration</h2>
        <div className="space-y-3">
          {[
            { label: "Application", value: "Liventory v1.0" },
            { label: "Stack", value: "Next.js + PostgreSQL + Prisma" },
            { label: "AI Engine", value: "Claude (Anthropic)" },
            { label: "Database", value: process.env.NODE_ENV === "production" ? "Production" : "Development" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between py-2 border-b text-sm" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-xs font-medium mb-1">Setup AI Agents</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Add <code className="px-1 py-0.5 rounded" style={{ background: "var(--border)" }}>ANTHROPIC_API_KEY=sk-ant-...</code> to your <code className="px-1 py-0.5 rounded" style={{ background: "var(--border)" }}>.env.local</code> file to enable real-time AI analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
