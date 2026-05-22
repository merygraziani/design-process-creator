"use client";

import { useState } from "react";
import clsx from "clsx";
import { Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { TASKS, EPIC_GROUPS, PHASES, ProcessConfig, Task, Phase, State } from "@/lib/data";
import { PhaseColumn } from "./PhaseColumn";
import type { ProjectInfo } from "@/app/questionnaire/page";

type JiraResult = { taskId: string; jiraKey: string; jiraUrl: string };

type Props = {
  config: ProcessConfig;
  projectInfo: ProjectInfo;
};

type EditingTask = {
  id: string;
  title: string;
  owner: string;
  phase: Phase;
  state: State;
};

export function StateBoard({ config, projectInfo }: Props) {
  const projectName = projectInfo.projectName;
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set(config.skippedTaskIds));
  const [jiraUrls, setJiraUrls] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [initiativeLink, setInitiativeLink] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [pendingTeamName, setPendingTeamName] = useState("");
  const [editing, setEditing] = useState<EditingTask | null>(null);
  const [adding, setAdding] = useState<{ phase: Phase; state: State } | null>(null);
  const [addForm, setAddForm] = useState({ title: "", owner: "" });
  const [scratchOpen, setScratchOpen] = useState(false);

  const includedTasks = tasks.filter((t) => !skippedIds.has(t.id));

  function handleSkipToggle(taskId: string) {
    setSkippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  function handleSkipPhase(phase: Phase) {
    const phaseTaskIds = tasks.filter((t) => t.phase === phase).map((t) => t.id);
    const allSkipped = phaseTaskIds.every((id) => skippedIds.has(id));
    setSkippedIds((prev) => {
      const next = new Set(prev);
      if (allSkipped) phaseTaskIds.forEach((id) => next.delete(id));
      else phaseTaskIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function handleSkipState(stateId: State) {
    const stateTaskIds = tasks.filter((t) => t.state === stateId).map((t) => t.id);
    const allSkipped = stateTaskIds.every((id) => skippedIds.has(id));
    setSkippedIds((prev) => {
      const next = new Set(prev);
      if (allSkipped) stateTaskIds.forEach((id) => next.delete(id));
      else stateTaskIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function handleEditSave() {
    if (!editing) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editing.id ? { ...t, title: editing.title, owner: editing.owner } : t
      )
    );
    setEditing(null);
  }

  function handleAddSave() {
    if (!adding || !addForm.title.trim()) return;
    const newTask: Task = {
      id: `custom-${Date.now()}`,
      title: addForm.title.trim(),
      owner: addForm.owner.trim(),
      phase: adding.phase,
      state: adding.state,
      optional: false,
      jiraTemplate: {
        summary: addForm.title.trim(),
        description: `## What\n${addForm.title.trim()}\n\n## Owner\n${addForm.owner.trim()}`,
        labels: ["design-process", adding.state, adding.phase],
      },
    };
    setTasks((prev) => [...prev, newTask]);
    config.includedTaskIds.add(newTask.id);
    setAdding(null);
    setAddForm({ title: "", owner: "" });
  }

  async function submitTickets(teamNameToUse: string) {
    setCreating(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/jira/create-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: includedTasks, projectInfo, initiativeLink: initiativeLink.trim(), teamName: teamNameToUse.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create tickets");
      }
      const data: { results: JiraResult[] } = await res.json();
      const map: Record<string, string> = {};
      for (const r of data.results) map[r.taskId] = r.jiraUrl;
      setJiraUrls(map);
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    } finally {
      setCreating(false);
    }
  }

  function handleCreateTickets() {
    if (!initiativeLink.trim()) {
      setPendingTeamName("");
      setShowTeamModal(true);
      return;
    }
    submitTickets("");
  }

  function handleTeamConfirm() {
    setShowTeamModal(false);
    submitTickets(pendingTeamName);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Action bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{projectName}</h2>
          <p className="text-sm text-gray-500">
            {includedTasks.length} tasks included ·{" "}
            {skippedIds.size} skipped
            {projectInfo.markets.length > 0 && <> · {projectInfo.markets.join(", ")}</>}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={initiativeLink}
            onChange={(e) => setInitiativeLink(e.target.value)}
            placeholder="Initiative link (optional)"
            disabled={creating || status === "success"}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 transition-colors w-64 disabled:opacity-50"
          />
          {status === "success" && (
            <span className="flex items-center gap-1.5 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" /> Tickets created
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </span>
          )}
          <button
            onClick={handleCreateTickets}
            disabled={creating || status === "success"}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {creating ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" /> Creating…
              </span>
            ) : status === "success" ? (
              "Tickets created"
            ) : (
              "Create Jira Tickets"
            )}
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {EPIC_GROUPS.map((epicGroup) => {
            const phasesInGroup = PHASES.filter((p) =>
              epicGroup.phases.includes(p.id)
            );
            return (
              <div key={epicGroup.id} className="flex flex-col gap-2">
                {/* Epic header */}
                <div
                  className="rounded-t-xl px-4 py-2 flex items-center justify-between"
                  style={{ background: epicGroup.color }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                    {epicGroup.label}
                  </span>
                </div>
                {/* Phase columns */}
                <div
                  className="rounded-b-xl rounded-tr-xl p-4 flex gap-4"
                  style={{ background: epicGroup.color + "80" }}
                >
                  {phasesInGroup.map((phase) => {
                    const phaseTasks = tasks.filter((t) => t.phase === phase.id);
                    return (
                      <PhaseColumn
                        key={phase.id}
                        phase={phase.id}
                        tasks={phaseTasks}
                        skippedIds={skippedIds}
                        optionalTaskIds={config.optionalTaskIds}
                        jiraUrls={jiraUrls}
                        onEdit={(task) =>
                          setEditing({
                            id: task.id,
                            title: task.title,
                            owner: task.owner,
                            phase: task.phase,
                            state: task.state,
                          })
                        }
                        onSkip={handleSkipToggle}
                        onSkipPhase={handleSkipPhase}
                        onAdd={(ph, st) => {
                          setAdding({ phase: ph, state: st });
                          setAddForm({ title: "", owner: "" });
                          setScratchOpen(false);
                        }}
                        onCreateTickets={phase.id === "measure" ? handleCreateTickets : undefined}
                        jiraStatus={phase.id === "measure" ? status : undefined}
                        jiraCreating={phase.id === "measure" ? creating : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team modal — shown when creating tickets without an initiative link */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Team required</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              No initiative link was provided. A new initiative will be created — enter the team it belongs to.
            </p>
            <input
              type="text"
              value={pendingTeamName}
              onChange={(e) => setPendingTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && pendingTeamName.trim() && handleTeamConfirm()}
              placeholder="e.g. Customer Identity"
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleTeamConfirm}
                disabled={!pendingTeamName.trim()}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Edit task</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Title</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Owner</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  value={editing.owner}
                  onChange={(e) => setEditing({ ...editing, owner: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {adding && (() => {
        const skippedInPhase = tasks.filter(
          (t) => t.phase === adding.phase && skippedIds.has(t.id)
        );
        return (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Add task</h3>
                <button onClick={() => setAdding(null)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {/* Create from scratch — always first, as a dropdown */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setScratchOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Create from scratch
                    <span className="text-gray-400 text-xs">{scratchOpen ? "▲" : "▼"}</span>
                  </button>
                  {scratchOpen && (
                    <div className="flex flex-col gap-3 px-3 pb-3 pt-1 border-t border-gray-100">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Title</label>
                        <input
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                          placeholder="Task title"
                          value={addForm.title}
                          onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Owner</label>
                        <input
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                          placeholder="e.g. Designer"
                          value={addForm.owner}
                          onChange={(e) => setAddForm({ ...addForm, owner: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Skipped tasks */}
                {skippedInPhase.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSkippedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(t.id);
                        return next;
                      });
                      setAdding(null);
                    }}
                    className="text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:border-gray-400 transition-all"
                  >
                    <p className="text-sm font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.owner}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setAdding(null)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSave}
                  disabled={!addForm.title.trim()}
                  className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
