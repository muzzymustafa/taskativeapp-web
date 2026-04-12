"use client";

import { useState } from "react";

type DetailField = "date" | "repeat" | "checklist" | "start" | null;

export function CreateTaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeField, setActiveField] = useState<DetailField>(null);

  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [checklist, setChecklist] = useState<string[]>([]);
  const [checklistInput, setChecklistInput] = useState("");

  function buildISO(date: string, time: string): string | null {
    if (!date) return null;
    const t = time || "23:59";
    return new Date(`${date}T${t}:00`).toISOString();
  }

  function addChecklistItem() {
    if (checklistInput.trim()) {
      setChecklist([...checklist, checklistInput.trim()]);
      setChecklistInput("");
    }
  }

  function reset() {
    setTitle("");
    setDescription("");
    setStartDate("");
    setStartTime("");
    setDueDate("");
    setDueTime("");
    setRecurrence("none");
    setChecklist([]);
    setChecklistInput("");
    setShowDetails(false);
    setActiveField(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: buildISO(startDate, startTime),
          dueDate: buildISO(dueDate, dueTime),
          recurrence: recurrence !== "none" ? recurrence : undefined,
          checklist: checklist.length > 0 ? checklist.map((text) => ({ text, done: false })) : undefined,
        }),
      });

      if (res.ok) {
        reset();
        onCreated();
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }

  function toggleField(field: DetailField) {
    setActiveField(activeField === field ? null : field);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      {/* Main input — always visible */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-outline bg-surface-1 focus-within:border-primary transition-colors" style={{ transitionDuration: "var(--dur-1)" }}>
        <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
        />
        {title.trim() && (
          <button
            type="submit"
            disabled={loading}
            className="text-sm font-medium text-primary hover:text-primary-hover disabled:opacity-40 transition-colors"
            style={{ transitionDuration: "var(--dur-1)" }}
          >
            {loading ? "..." : "Save"}
          </button>
        )}
      </div>

      {/* Add details link — only after typing */}
      {title.trim() && !showDetails && (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="mt-2 ml-12 text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1"
          style={{ transitionDuration: "var(--dur-1)" }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add details
        </button>
      )}

      {/* Details panel — collapsed by default */}
      {showDetails && (
        <div className="mt-3 ml-0 p-4 rounded-xl bg-surface-2/50 border border-outline space-y-3">
          {/* Notes */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2 rounded-lg bg-surface-1 border border-outline text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-primary transition-colors"
            style={{ transitionDuration: "var(--dur-1)" }}
          />

          {/* Chip toolbar */}
          <div className="flex flex-wrap gap-2">
            <Chip
              active={activeField === "start" || !!startDate}
              onClick={() => toggleField("start")}
              icon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              }
              label={startDate ? `Start · ${new Date(startDate).toLocaleDateString("en", { month: "short", day: "numeric" })}` : "Start"}
            />
            <Chip
              active={activeField === "date" || !!dueDate}
              onClick={() => toggleField("date")}
              icon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
              label={dueDate ? `Due · ${new Date(dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}` : "Due"}
            />
            <Chip
              active={activeField === "repeat" || recurrence !== "none"}
              onClick={() => toggleField("repeat")}
              icon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              }
              label={recurrence === "none" ? "Repeat" : recurrence}
            />
            <Chip
              active={activeField === "checklist" || checklist.length > 0}
              onClick={() => toggleField("checklist")}
              icon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label={checklist.length > 0 ? `Checklist · ${checklist.length}` : "Checklist"}
            />
          </div>

          {/* Start field */}
          {activeField === "start" && (
            <div className="flex gap-2 pt-2 border-t border-outline/50">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-surface-1 border border-outline text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface-1 border border-outline text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
              {startDate && (
                <button
                  type="button"
                  onClick={() => { setStartDate(""); setStartTime(""); setActiveField(null); }}
                  className="px-2 text-text-dim hover:text-danger transition-colors"
                  title="Clear"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Date field */}
          {activeField === "date" && (
            <div className="flex gap-2 pt-2 border-t border-outline/50">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-surface-1 border border-outline text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface-1 border border-outline text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => { setDueDate(""); setDueTime(""); setActiveField(null); }}
                  className="px-2 text-text-dim hover:text-danger transition-colors"
                  title="Clear"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Repeat field */}
          {activeField === "repeat" && (
            <div className="pt-2 border-t border-outline/50">
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-1 border border-outline text-xs text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          {/* Checklist field */}
          {activeField === "checklist" && (
            <div className="pt-2 border-t border-outline/50 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem(); } }}
                  placeholder="Add subtask and press Enter"
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-1 border border-outline text-xs text-text placeholder:text-text-dim focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {checklist.length > 0 && (
                <div className="space-y-1">
                  {checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface-1 group">
                      <span className="text-text-dim text-xs">•</span>
                      <span className="flex-1 text-xs text-text">{item}</span>
                      <button
                        type="button"
                        onClick={() => setChecklist(checklist.filter((_, x) => x !== i))}
                        className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cancel link */}
          <button
            type="button"
            onClick={() => { setShowDetails(false); setActiveField(null); }}
            className="text-xs text-text-dim hover:text-text transition-colors"
          >
            Hide details
          </button>
        </div>
      )}
    </form>
  );
}

function Chip({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-surface-1 text-text-muted border-outline hover:border-outline-strong hover:text-text"
      }`}
      style={{ transitionDuration: "var(--dur-1)" }}
    >
      {icon}
      <span className="capitalize">{label}</span>
    </button>
  );
}
