"use client";

import { useState } from "react";
import type { Task } from "@/lib/adapters/types";

interface Props {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

export function TaskDetail({ task, onClose, onUpdate }: Props) {
  const [status, setStatus] = useState(task.status);
  const [checklist, setChecklist] = useState(task.checklist || []);

  async function handleStatusChange(newStatus: Task["status"]) {
    setStatus(newStatus);
    onUpdate({ ...task, status: newStatus });
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function formatFullDate(iso: string) {
    return new Date(iso).toLocaleDateString("en", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const isDone = status === "done";
  const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-surface-1 rounded-2xl border border-outline overflow-hidden max-h-[85vh] flex flex-col"
        style={{ boxShadow: "var(--shadow-3)" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-0">
          <button
            onClick={() => handleStatusChange(isDone ? "pending" : "done")}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              isDone ? "bg-primary border-primary" : "border-outline-strong hover:border-primary"
            }`}
          >
            {isDone && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h2 className={`text-lg font-semibold leading-snug ${isDone ? "line-through text-text-dim" : "text-text"}`}>
              {task.title}
            </h2>
            {task.taskType === "personal" && (
              <span className="text-xs text-text-dim mt-1 inline-block">Personal task</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-2 text-text-dim hover:text-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Description */}
          {task.description && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-dim uppercase tracking-wider mb-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
                Description
              </div>
              <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOverdue ? "bg-danger-light" : "bg-surface-2"}`}>
                <svg className={`w-4 h-4 ${isOverdue ? "text-danger" : "text-text-muted"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${isOverdue ? "text-danger" : "text-text"}`}>
                  {formatFullDate(task.dueDate)}
                </p>
                {isOverdue && <p className="text-xs text-danger">Overdue</p>}
              </div>
            </div>
          )}

          {/* Reminder */}
          {task.reminderEnabled && task.reminderTime && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <p className="text-sm text-text-2">
                Reminder: {formatFullDate(task.reminderTime)}
              </p>
            </div>
          )}

          {/* Recurrence */}
          {task.recurrence && task.recurrence !== "none" && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </div>
              <p className="text-sm text-text-2 capitalize">{task.recurrence}</p>
            </div>
          )}

          {/* Checklist */}
          {checklist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-text-dim uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Checklist
                </div>
                <span className="text-xs text-text-dim">
                  {checklist.filter((c) => c.done).length} / {checklist.length}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1 rounded-full bg-surface-3 mb-3 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${checklist.length > 0 ? (checklist.filter((c) => c.done).length / checklist.length) * 100 : 0}%`,
                    transitionDuration: "var(--dur-2)",
                  }}
                />
              </div>
              <div className="space-y-1">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 px-1">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        item.done ? "bg-primary border-primary" : "border-outline-strong"
                      }`}
                    >
                      {item.done && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${item.done ? "line-through text-text-dim" : "text-text"}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned */}
          {task.assignedEmails && task.assignedEmails.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-dim uppercase tracking-wider mb-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
                Assigned to
              </div>
              <div className="flex flex-wrap gap-2">
                {task.assignedEmails.map((email) => (
                  <span key={email} className="px-3 py-1 rounded-lg bg-surface-2 text-xs text-text-2">
                    {email}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="pt-3 border-t border-outline/50">
            <p className="text-xs text-text-dim">
              Created {formatFullDate(task.createdAt)}
              {task.updatedAt && ` · Updated ${formatFullDate(task.updatedAt)}`}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-outline/50">
          <div className="flex gap-2">
            {status !== "done" && (
              <button
                onClick={() => handleStatusChange("done")}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                Mark done
              </button>
            )}
            {status === "done" && (
              <button
                onClick={() => handleStatusChange("pending")}
                className="px-4 py-2 rounded-lg bg-surface-2 text-text-muted text-sm font-medium hover:bg-surface-3 transition-colors"
              >
                Reopen
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-surface-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
