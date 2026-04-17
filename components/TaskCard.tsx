"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ExternalLink, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Task } from "@/lib/data";

type Props = {
  task: Task;
  skipped?: boolean;
  optional?: boolean;
  jiraUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
};

const STATE_BG: Record<string, string> = {
  "problem-opportunity": "#f2ece1",
  solution: "#e9eef2",
  implementation: "#d8edeb",
};

const STATE_BORDER: Record<string, string> = {
  "problem-opportunity": "#e0d5c4",
  solution: "#d0dde6",
  implementation: "#b8dbd8",
};

export function TaskCard({ task, skipped, optional, jiraUrl, onEdit, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);
  const bg = STATE_BG[task.state];
  const border = STATE_BORDER[task.state];

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 flex flex-col gap-2 w-full transition-opacity relative group",
        skipped && "opacity-40"
      )}
      style={{ background: bg, borderColor: border }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Edit / Delete actions */}
      {hovered && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <p
        className={clsx(
          "text-sm font-semibold leading-snug pr-14",
          skipped ? "line-through text-gray-400" : "text-gray-900"
        )}
      >
        {task.title}
      </p>
      {task.owner && (
        <p className="text-xs text-gray-500">{task.owner}</p>
      )}

      {skipped && (
        <span className="self-start text-[10px] font-medium uppercase tracking-wide bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
          Skip
        </span>
      )}
      {optional && !skipped && (
        <span className="self-start text-[10px] font-medium uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
          Optional
        </span>
      )}

      <div className="flex items-center justify-between mt-1">
        <Link
          href={`/process/${task.id}`}
          className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
        >
          Details <ChevronRight className="w-3 h-3" />
        </Link>
        {jiraUrl && (
          <a
            href={jiraUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-0.5"
          >
            Jira <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
