import { Plus, Loader2, CheckCircle } from "lucide-react";
import { Task, Phase, State, PHASES, ProcessConfig } from "@/lib/data";
import { TaskCard } from "./TaskCard";

type Props = {
  phase: Phase;
  tasks: Task[];
  config: ProcessConfig;
  jiraUrls?: Record<string, string>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAdd: (phase: Phase, state: State) => void;
  onCreateTickets?: () => void;
  jiraStatus?: "idle" | "success" | "error";
  jiraCreating?: boolean;
};

export function PhaseColumn({ phase, tasks, config, jiraUrls, onEdit, onDelete, onAdd, onCreateTickets, jiraStatus, jiraCreating }: Props) {
  const phaseInfo = PHASES.find((p) => p.id === phase);

  // Group parallel tasks together
  const rendered = new Set<string>();
  const groups: Task[][] = [];

  for (const task of tasks) {
    if (rendered.has(task.id)) continue;
    rendered.add(task.id);

    const parallelSiblings =
      task.parallelWith
        ?.map((pid) => tasks.find((t) => t.id === pid))
        .filter((t): t is Task => !!t && !rendered.has(t.id)) ?? [];

    for (const s of parallelSiblings) rendered.add(s.id);
    groups.push([task, ...parallelSiblings]);
  }

  return (
    <div className="flex flex-col gap-1 min-w-[220px] max-w-[260px]">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          {phaseInfo?.label}
        </span>
        {onCreateTickets && (
          <button
            onClick={onCreateTickets}
            disabled={jiraCreating || jiraStatus === "success"}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {jiraCreating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : jiraStatus === "success" ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : null}
            {jiraStatus === "success" ? "Created" : "Create Jira tickets"}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 pt-2">
        {groups.map((group, i) =>
          group.length > 1 ? (
            <div key={i} className="flex flex-col gap-2">
              {group.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  skipped={config.skippedTaskIds.has(task.id)}
                  optional={config.optionalTaskIds.has(task.id)}
                  jiraUrl={jiraUrls?.[task.id]}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task.id)}
                />
              ))}
            </div>
          ) : (
            <TaskCard
              key={group[0].id}
              task={group[0]}
              skipped={config.skippedTaskIds.has(group[0].id)}
              optional={config.optionalTaskIds.has(group[0].id)}
              jiraUrl={jiraUrls?.[group[0].id]}
              onEdit={() => onEdit(group[0])}
              onDelete={() => onDelete(group[0].id)}
            />
          )
        )}
        <button
          onClick={() => onAdd(phase, phaseInfo?.state ?? "problem-opportunity")}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors pt-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add task
        </button>
      </div>
    </div>
  );
}
