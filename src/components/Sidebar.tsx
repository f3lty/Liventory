"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, MapPin, ArrowLeftRight,
  BarChart3, Upload, Bot, Settings, Leaf
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/import", label: "Import CSV", icon: Upload },
  { href: "/ai", label: "AI Agents", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col border-r z-40"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent)" }}
        >
          <Leaf size={16} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-base leading-tight" style={{ color: "var(--foreground)" }}>
            Liventory
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Nursery Management
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--muted)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.color = "var(--foreground)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--muted)";
                }
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          Liventory MVP v1.0
        </div>
      </div>
    </aside>
  );
}
