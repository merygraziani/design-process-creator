import { State, Task, TASKS, ProcessConfig } from "./data";

export type Question = {
  id: string;
  text: string;
  options: { value: string; label: string; hint?: string }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "problem-clarity",
    text: "Is the problem space well understood?",
    options: [
      {
        value: "no",
        label: "No — we need to discover",
        hint: "We don't have a clear problem statement yet",
      },
      {
        value: "yes",
        label: "Yes — problem is clear",
        hint: "We know the problem, ready to ideate solutions",
      },
      {
        value: "decided",
        label: "Solution is already decided",
        hint: "Regulatory, tech-driven, or leadership directive",
      },
    ],
  },
  {
    id: "existing-research",
    text: "Do you have existing user research or data for this topic?",
    options: [
      {
        value: "yes",
        label: "Yes — research exists",
        hint: "We have studies, data, or previous insights we can use",
      },
      {
        value: "partial",
        label: "Partially",
        hint: "Some data exists but gaps remain",
      },
      {
        value: "no",
        label: "No — starting from scratch",
        hint: "No relevant research available",
      },
    ],
  },
  {
    id: "regulatory-driven",
    text: "Is this a regulatory or tech-driven initiative?",
    options: [
      {
        value: "yes",
        label: "Yes",
        hint: "Requirements are largely fixed by external constraints",
      },
      {
        value: "no",
        label: "No",
        hint: "We have full design freedom",
      },
    ],
  },
];

export type Answers = Record<string, string>;

export function buildProcessConfig(_answers: Answers = {}): ProcessConfig {
  const startingState: State = "problem-opportunity";

  const included = new Set<string>();
  const skipped = new Set<string>();
  const optional = new Set<string>();

  for (const task of TASKS) {
    if (task.optional) {
      optional.add(task.id);
    }
    included.add(task.id);
  }

  return { startingState, includedTaskIds: included, skippedTaskIds: skipped, optionalTaskIds: optional };
}

export function getIncludedTasks(config: ProcessConfig): Task[] {
  return TASKS.filter((t) => config.includedTaskIds.has(t.id));
}

export function getSkippedTasks(config: ProcessConfig): Task[] {
  return TASKS.filter((t) => config.skippedTaskIds.has(t.id));
}
