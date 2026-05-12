import { Plus, Loader2, CheckCircle } from "lucide-react";
import { Task, Phase, State, PHASES } from "@/lib/data";
import { TaskCard } from "./TaskCard";

type Props = {
  phase: Phase;
  tasks: Task[];
  skippedIds: Set<string>;
  optionalTaskIds: Set<string>;
  jiraUrls?: Record<string, string>;
  onEdit: (task: Task) => void;
  onSkip: (taskId: string) => void;
  onSkipPhase: (phase: Phase) => void;
  onAdd: (phase: Phase, state: State) => void;
  onCreateTickets?: () => void;
  jiraStatus?: "idle" | "success" | "error";
  jiraCreating?: boolean;
};

export function PhaseColumn({ phase, tasks, skippedIds, optionalTaskIds, jiraUrls, onEdit, onSkip, onSkipPhase, onAdd, onCreateTickets, jiraStatus, jiraCreating }: Props) {
  const phaseInfo = PHASES.find((p) => p.id === phase);
  const phaseAllSkipped = tasks.length > 0 && tasks.every((t) => skippedIds.has(t.id));

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
      </div>
      <div className="flex flex-col gap-2 pt-2">
        {groups.filter((g) => g.some((t) => !skippedIds.has(t.id))).map((group, i) =>
          group.length > 1 ? (
            <div key={i} className="flex flex-col gap-2">
              {group.filter((t) => !skippedIds.has(t.id)).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  skipped={false}
                  optional={optionalTaskIds.has(task.id)}
                  jiraUrl={jiraUrls?.[task.id]}
                  onEdit={() => onEdit(task)}
                  onSkip={() => onSkip(task.id)}
                />
              ))}
            </div>
          ) : (
            <TaskCard
              key={group[0].id}
              task={group[0]}
              skipped={false}
              optional={optionalTaskIds.has(group[0].id)}
              jiraUrl={jiraUrls?.[group[0].id]}
              onEdit={() => onEdit(group[0])}
              onSkip={() => onSkip(group[0].id)}
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
