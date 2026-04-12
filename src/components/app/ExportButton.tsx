"use client";

import { useState } from "react";

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  }

  async function exportCSV(includeAll: boolean) {
    setExporting(true);
    try {
      let tasks = await fetchTasks();
      if (!includeAll) tasks = tasks.filter((t: any) => t.status !== "cancelled");

      const headers = ["Title", "Description", "Status", "Due Date", "Created", "Checklist", "Type"];
      const rows = tasks.map((t: any) => {
        const checklist = (t.checklist || [])
          .map((c: any) => `${c.done ? "[x]" : "[ ]"} ${c.text}`)
          .join("; ");
        return [
          `"${(t.title || "").replace(/"/g, '""')}"`,
          `"${(t.description || "").replace(/"/g, '""')}"`,
          t.status,
          t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-GB") : "",
          new Date(t.createdAt).toLocaleDateString("en-GB"),
          `"${checklist}"`,
          t.taskType || "personal",
        ];
      });

      const bom = "\uFEFF"; // UTF-8 BOM for Excel Turkish chars
      const csv = bom + [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
      download(csv, `taskative-tasks-${today()}.csv`, "text/csv;charset=utf-8");
    } catch { /* */ }
    setExporting(false);
    setOpen(false);
  }

  async function exportJSON() {
    setExporting(true);
    try {
      const tasks = await fetchTasks();
      const clean = tasks
        .filter((t: any) => t.status !== "cancelled")
        .map((t: any) => ({
          title: t.title,
          description: t.description || "",
          status: t.status,
          dueDate: t.dueDate || null,
          createdAt: t.createdAt,
          checklist: t.checklist || [],
          taskType: t.taskType || "personal",
        }));
      download(JSON.stringify(clean, null, 2), `taskative-tasks-${today()}.json`, "application/json");
    } catch { /* */ }
    setExporting(false);
    setOpen(false);
  }

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  function download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
        style={{ transitionDuration: "var(--dur-1)" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Export
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-surface-1 border border-outline rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-2)" }}>
            <button
              onClick={() => exportCSV(false)}
              disabled={exporting}
              className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-surface-2 transition-colors flex items-center gap-2"
            >
              <span className="text-xs font-mono text-text-dim">.csv</span>
              Active tasks
            </button>
            <button
              onClick={() => exportCSV(true)}
              disabled={exporting}
              className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-surface-2 transition-colors flex items-center gap-2 border-t border-outline/50"
            >
              <span className="text-xs font-mono text-text-dim">.csv</span>
              All tasks
            </button>
            <button
              onClick={exportJSON}
              disabled={exporting}
              className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-surface-2 transition-colors flex items-center gap-2 border-t border-outline/50"
            >
              <span className="text-xs font-mono text-text-dim">.json</span>
              JSON (active)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
