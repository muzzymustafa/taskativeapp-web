"use client";

import { useState } from "react";

interface ExtractedTask {
  title: string;
  selected: boolean;
}

export function SmartImport({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<ExtractedTask[]>([]);
  const [step, setStep] = useState<"input" | "review">("input");
  const [importing, setImporting] = useState(false);

  function extractTasks(raw: string): ExtractedTask[] {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    const extracted: ExtractedTask[] = [];

    for (const line of lines) {
      // Skip headers, empty lines, very short lines
      if (line.length < 3) continue;

      // Clean up common prefixes
      let clean = line
        .replace(/^[-*•▪▸►→]\s*/, "") // bullet points
        .replace(/^\d+[.)]\s*/, "") // numbered lists
        .replace(/^\[[ x]\]\s*/i, "") // checkboxes [ ] [x]
        .replace(/^(TODO|TASK|GÖREV|YAPILACAK)[:\s]*/i, "") // todo prefixes
        .replace(/^(buy|get|call|send|write|fix|update|check|review|create|prepare|finish|complete)\s/i, (m) => m) // keep action verbs
        .trim();

      if (clean.length < 3) continue;
      if (clean.length > 200) clean = clean.substring(0, 200);

      // Skip lines that look like headers or metadata
      if (/^(#|={2,}|-{3,}|date:|time:|from:|to:|subject:|re:)/i.test(clean)) continue;
      if (/^(toplantı|meeting|notes|agenda|minutes|özet|summary)/i.test(clean) && clean.length < 30) continue;

      // Capitalize first letter
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);

      // Avoid duplicates
      if (!extracted.some((t) => t.title === clean)) {
        extracted.push({ title: clean, selected: true });
      }
    }

    return extracted;
  }

  function handleExtract() {
    const result = extractTasks(text);
    if (result.length === 0) {
      // If no structured items found, treat each sentence as a task
      const sentences = text
        .split(/[.!?;\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3 && s.length < 200);
      setTasks(sentences.map((s) => ({ title: s.charAt(0).toUpperCase() + s.slice(1), selected: true })));
    } else {
      setTasks(result);
    }
    setStep("review");
  }

  function toggleTask(idx: number) {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, selected: !t.selected } : t)));
  }

  async function handleImport() {
    const selected = tasks.filter((t) => t.selected);
    if (selected.length === 0) return;

    setImporting(true);
    try {
      for (const task of selected) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: task.title }),
        });
      }
      setOpen(false);
      setText("");
      setTasks([]);
      setStep("input");
      onImported();
    } catch {
      /* ignore */
    }
    setImporting(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-primary hover:bg-primary/5 transition-colors mb-4"
        style={{ transitionDuration: "var(--dur-1)" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        Smart Import — paste text to create tasks
      </button>
    );
  }

  return (
    <div className="mb-6 p-5 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-2)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          <h3 className="text-sm font-semibold text-text">Smart Import</h3>
        </div>
        <button onClick={() => { setOpen(false); setStep("input"); setText(""); setTasks([]); }} className="text-text-dim hover:text-text">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {step === "input" ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Paste your text here...\n\nExamples:\n- Meeting notes\n- Email with action items\n- Todo list\n- Any text with tasks"}
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-bg border border-outline text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-primary resize-none leading-relaxed"
            style={{ transitionDuration: "var(--dur-1)" }}
            autoFocus
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-text-dim">
              Paste meeting notes, emails, or lists — we&apos;ll extract tasks automatically
            </p>
            <button
              onClick={handleExtract}
              disabled={text.trim().length < 5}
              className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40"
              style={{ transitionDuration: "var(--dur-1)" }}
            >
              Extract tasks
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-text-muted mb-3">
            {tasks.filter((t) => t.selected).length} of {tasks.length} tasks selected
          </p>
          <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
            {tasks.map((task, i) => (
              <label
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  task.selected ? "bg-primary/5" : "hover:bg-surface-2"
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.selected}
                  onChange={() => toggleTask(i)}
                  className="w-4 h-4 rounded border-outline-strong text-primary focus:ring-primary accent-primary"
                />
                <span className={`text-sm ${task.selected ? "text-text" : "text-text-dim line-through"}`}>
                  {task.title}
                </span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep("input")}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setTasks((prev) => prev.map((t) => ({ ...t, selected: !prev.every((p) => p.selected) })))}
                className="px-3 py-2 rounded-lg text-xs text-text-muted hover:bg-surface-2 transition-colors"
              >
                Toggle all
              </button>
              <button
                onClick={handleImport}
                disabled={importing || tasks.filter((t) => t.selected).length === 0}
                className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40"
                style={{ transitionDuration: "var(--dur-1)" }}
              >
                {importing ? `Importing...` : `Import ${tasks.filter((t) => t.selected).length} tasks`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
