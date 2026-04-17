import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Target, CheckSquare, ListTodo } from "lucide-react";
import { getTaskById, STATES } from "@/lib/data";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = getTaskById(taskId);

  if (!task) notFound();

  const stateInfo = STATES.find((s) => s.id === task.state);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link
          href="/process"
          className="text-gray-400 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {task.title}
            </h1>
            <p className="text-xs text-gray-500">
              {stateInfo?.label} · {task.phase.replace("-", " / ")}
            </p>
          </div>
          {task.optional && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Optional
            </span>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* What */}
        {task.what && (
          <section
            className="rounded-xl p-5"
            style={{ background: stateInfo?.color ?? "#f5f5f5" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              What
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">{task.what}</p>
          </section>
        )}

        {/* Owner */}
        <section className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Owner
            </p>
          </div>
          <p className="text-sm text-gray-900 font-medium">{task.owner}</p>
        </section>

        {/* Outcome */}
        {task.outcome && (
          <section className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Outcome
              </p>
            </div>
            <p className="text-sm text-gray-800">{task.outcome}</p>
          </section>
        )}

        {/* Acceptance Criteria */}
        {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
          <section className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Acceptance Criteria
              </p>
            </div>
            <ul className="flex flex-col gap-1.5">
              {task.acceptanceCriteria.map((ac, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className="text-gray-300 mt-0.5">✓</span>
                  {ac}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sub-tasks */}
        {task.subTasks && task.subTasks.length > 0 && (
          <section className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <ListTodo className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Sub-tasks
              </p>
            </div>
            <ul className="flex flex-col gap-1.5">
              {task.subTasks.map((st, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className="text-gray-300 mt-0.5">—</span>
                  {st}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Jira template preview */}
        <section className="bg-gray-900 rounded-xl p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Jira ticket preview
          </p>
          <p className="text-sm font-semibold mb-1">{task.jiraTemplate.summary}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.jiraTemplate.labels.map((label) => (
              <span
                key={label}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
            {task.jiraTemplate.description}
          </pre>
        </section>
      </div>
    </div>
  );
}
