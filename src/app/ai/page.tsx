"use client";

import { useEffect, useState } from "react";
import { Bot, RefreshCw, Check, AlertTriangle, Info, Zap } from "lucide-react";

type Insight = {
  id: string;
  type: string;
  title: string;
  body: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
};

const AGENTS = [
  {
    type: "INVENTORY_ANALYST",
    name: "Inventory Analyst",
    description: "Detects low stock, excess inventory, discrepancies, and recommends adjustments",
    icon: "📊",
    color: "#6366f1",
  },
  {
    type: "PRODUCTION_PLANNER",
    name: "Production Planner",
    description: "Identifies propagation priorities and production scheduling recommendations",
    icon: "🌱",
    color: "#10b981",
  },
  {
    type: "OPERATIONS_ADVISOR",
    name: "Operations Advisor",
    description: "Identifies inefficiencies, recommends relocations, and generates weekly summaries",
    icon: "⚙️",
    color: "#f59e0b",
  },
];

const severityConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  CRITICAL: { color: "var(--danger)", bg: "#ef444415", icon: AlertTriangle },
  WARNING: { color: "var(--warning)", bg: "#f59e0b15", icon: AlertTriangle },
  INFO: { color: "var(--accent)", bg: "#6366f115", icon: Info },
};

export default function AiPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>("ALL");

  const loadInsights = async () => {
    setLoading(true);
    const res = await fetch("/api/ai");
    setInsights(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadInsights(); }, []);

  const runAgent = async (agentType: string) => {
    setRunning(agentType);
    await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentType }),
    });
    await loadInsights();
    setRunning(null);
  };

  const markRead = async (id: string) => {
    await fetch("/api/ai", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setInsights((prev) => prev.map((i) => i.id === id ? { ...i, isRead: true } : i));
  };

  const filtered = activeType === "ALL" ? insights : insights.filter((i) => i.type === activeType);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <Bot size={22} style={{ color: "var(--accent)" }} />
            AI Agents
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>AI-powered operational recommendations for your nursery</p>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {AGENTS.map((agent) => (
          <div key={agent.type} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">{agent.icon}</div>
              <div>
                <div className="font-semibold text-sm mb-1">{agent.name}</div>
                <p className="text-xs" style={{ color: "var(--muted)", lineHeight: 1.5 }}>{agent.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {insights.filter((i) => i.type === agent.type).length} insights
              </span>
              <button
                onClick={() => runAgent(agent.type)}
                disabled={running !== null}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white cursor-pointer disabled:opacity-50"
                style={{ background: agent.color }}
              >
                {running === agent.type ? (
                  <><RefreshCw size={12} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Zap size={12} /> Run Analysis</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["ALL", ...AGENTS.map((a) => a.type)].map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            style={{
              background: activeType === type ? "var(--accent)" : "var(--surface-2)",
              color: activeType === type ? "#fff" : "var(--muted)",
            }}
          >
            {type === "ALL" ? "All Insights" : AGENTS.find((a) => a.type === type)?.name || type}
          </button>
        ))}
      </div>

      {/* Insights */}
      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: "var(--muted)" }}>
          <RefreshCw className="animate-spin mr-2" size={18} />
          Loading insights...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border p-16 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Bot size={32} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
          <p className="text-base font-medium mb-2">No insights yet</p>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Run an AI agent to get operational recommendations</p>
          <button onClick={() => runAgent("INVENTORY_ANALYST")} className="px-4 py-2 rounded-lg text-sm text-white cursor-pointer" style={{ background: "var(--accent)" }}>
            Run Inventory Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((insight) => {
            const cfg = severityConfig[insight.severity] || severityConfig.INFO;
            const SeverityIcon = cfg.icon;
            return (
              <div
                key={insight.id}
                className="rounded-xl border p-5 transition-opacity"
                style={{ background: "var(--surface)", borderColor: "var(--border)", opacity: insight.isRead ? 0.65 : 1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                    <SeverityIcon size={15} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="text-sm font-semibold mb-0.5">{insight.title}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                            {AGENTS.find((a) => a.type === insight.type)?.name || insight.type}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>
                            {insight.severity}
                          </span>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            {new Date(insight.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {!insight.isRead && (
                        <button
                          onClick={() => markRead(insight.id)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer flex-shrink-0"
                          style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                        >
                          <Check size={11} /> Mark Read
                        </button>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: "var(--muted)", lineHeight: 1.6 }}>{insight.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
