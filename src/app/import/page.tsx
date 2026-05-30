"use client";

import { useState, useCallback } from "react";
import { Upload, X, Check, AlertCircle, ChevronRight } from "lucide-react";
import Papa from "papaparse";

type ParsedRow = Record<string, string>;

const FIELD_MAPPINGS = [
  { key: "plantName", label: "Plant Name", required: true },
  { key: "botanicalName", label: "Botanical Name" },
  { key: "cultivar", label: "Cultivar" },
  { key: "containerSize", label: "Container Size" },
  { key: "quantityAvailable", label: "Qty Available" },
  { key: "quantityReserved", label: "Qty Reserved" },
  { key: "quantitySold", label: "Qty Sold" },
  { key: "location", label: "Location" },
  { key: "costPerUnit", label: "Cost Per Unit" },
  { key: "retailPrice", label: "Retail Price" },
  { key: "wholesalePrice", label: "Wholesale Price" },
  { key: "category", label: "Category" },
  { key: "notes", label: "Notes" },
];

type Step = "upload" | "map" | "preview" | "done";

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const parseFile = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cols = Object.keys((results.data[0] as ParsedRow) || {});
        setColumns(cols);
        setRows(results.data as ParsedRow[]);

        // Auto-map obvious columns
        const autoMap: Record<string, string> = {};
        for (const field of FIELD_MAPPINGS) {
          const match = cols.find((c) =>
            c.toLowerCase().replace(/[\s_-]/g, "").includes(field.key.toLowerCase().replace(/[\s_-]/g, "")) ||
            (field.key === "quantityAvailable" && c.toLowerCase().includes("qty")) ||
            (field.key === "plantName" && (c.toLowerCase().includes("name") || c.toLowerCase().includes("plant")))
          );
          if (match) autoMap[field.key] = match;
        }
        setMapping(autoMap);
        setStep("map");
      },
    });
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      alert("Please upload a CSV file");
      return;
    }
    parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const doImport = async () => {
    setImporting(true);
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, mapping }),
    });
    const data = await res.json();
    setResult(data);
    setImporting(false);
    setStep("done");
  };

  const reset = () => { setStep("upload"); setRows([]); setColumns([]); setMapping({}); setResult(null); };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Import CSV</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Upload your existing inventory spreadsheet</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {(["upload", "map", "preview", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: step === s ? "var(--accent)" : ["done", "preview"].includes(step) && i < ["upload", "map", "preview", "done"].indexOf(step) ? "var(--success)" : "var(--surface-2)", color: step === s || (["done", "preview"].includes(step) && i < ["upload", "map", "preview", "done"].indexOf(step)) ? "#fff" : "var(--muted)" }}>
                {i + 1}
              </div>
              <span className="text-xs font-medium capitalize" style={{ color: step === s ? "var(--foreground)" : "var(--muted)" }}>{s}</span>
            </div>
            {i < 3 && <ChevronRight size={14} style={{ color: "var(--border)" }} />}
          </div>
        ))}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div
          className="rounded-xl border-2 border-dashed p-16 text-center transition-colors"
          style={{ borderColor: dragOver ? "var(--accent)" : "var(--border)", background: dragOver ? "#6366f108" : "var(--surface)" }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload size={40} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
          <p className="text-base font-medium mb-2">Drop your CSV file here</p>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Or click to select a file from your computer</p>
          <label className="px-6 py-2.5 rounded-lg text-sm text-white cursor-pointer inline-block" style={{ background: "var(--accent)" }}>
            Choose File
            <input type="file" accept=".csv,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>
          <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>Supports CSV files exported from Excel, Google Sheets, or any spreadsheet software</p>
        </div>
      )}

      {/* Step: Map */}
      {step === "map" && (
        <div>
          <div className="rounded-xl border p-5 mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Map Your Columns</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{rows.length} rows detected · {columns.length} columns</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FIELD_MAPPINGS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-36 flex-shrink-0" style={{ color: field.required ? "var(--foreground)" : "var(--muted)" }}>
                    {field.label}{field.required && <span style={{ color: "var(--danger)" }}> *</span>}
                  </span>
                  <select
                    value={mapping[field.key] || ""}
                    onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                    style={{ fontSize: 12 }}
                  >
                    <option value="">— not mapped —</option>
                    {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>← Back</button>
            <button onClick={() => setStep("preview")} disabled={!mapping.plantName} className="px-4 py-2 rounded-lg text-sm text-white cursor-pointer disabled:opacity-50" style={{ background: "var(--accent)" }}>
              Preview Import →
            </button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div>
          <div className="rounded-xl border overflow-hidden mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-medium">Preview ({Math.min(rows.length, 10)} of {rows.length} rows)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)" }}>
                    {FIELD_MAPPINGS.filter((f) => mapping[f.key]).map((f) => (
                      <th key={f.key} className="text-left text-xs font-medium px-4 py-2" style={{ color: "var(--muted)" }}>{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                      {FIELD_MAPPINGS.filter((f) => mapping[f.key]).map((f) => (
                        <td key={f.key} className="px-4 py-2 text-xs truncate max-w-32">{row[mapping[f.key]] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("map")} className="px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>← Back</button>
            <button onClick={doImport} disabled={importing} className="px-4 py-2 rounded-lg text-sm text-white cursor-pointer disabled:opacity-50 flex items-center gap-2" style={{ background: "var(--accent)" }}>
              {importing ? "Importing..." : `Import ${rows.length} Records →`}
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && result && (
        <div className="rounded-xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: result.imported > 0 ? "#10b98120" : "#ef444420" }}>
            {result.imported > 0 ? <Check size={28} style={{ color: "var(--success)" }} /> : <X size={28} style={{ color: "var(--danger)" }} />}
          </div>
          <h2 className="text-xl font-bold mb-2">Import Complete</h2>
          <div className="flex justify-center gap-8 my-6">
            <div><div className="text-3xl font-bold" style={{ color: "var(--success)" }}>{result.imported}</div><div className="text-sm" style={{ color: "var(--muted)" }}>Imported</div></div>
            <div><div className="text-3xl font-bold" style={{ color: "var(--warning)" }}>{result.skipped}</div><div className="text-sm" style={{ color: "var(--muted)" }}>Skipped</div></div>
          </div>
          {result.errors.length > 0 && (
            <div className="text-left rounded-lg p-3 mb-4" style={{ background: "#ef444415" }}>
              <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: "var(--danger)" }}><AlertCircle size={12} /> Errors</p>
              {result.errors.slice(0, 5).map((e, i) => <p key={i} className="text-xs" style={{ color: "var(--muted)" }}>{e}</p>)}
            </div>
          )}
          <div className="flex justify-center gap-3">
            <button onClick={reset} className="px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>Import Another File</button>
            <a href="/inventory" className="px-4 py-2 rounded-lg text-sm text-white inline-block" style={{ background: "var(--accent)" }}>View Inventory →</a>
          </div>
        </div>
      )}
    </div>
  );
}
