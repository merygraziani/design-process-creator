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

export function buildProcessConfig(answers: Answers): ProcessConfig {
  const problemClarity = answers["problem-clarity"];
  const existingResearch = answers["existing-research"];
  const regulatoryDriven = answers["regulatory-driven"];

  let startingState: State;

  if (problemClarity === "no") {
    startingState = "problem-opportunity";
  } else if (problemClarity === "decided") {
    startingState = "implementation";
  } else {
    startingState = "solution";
  }

  const included = new Set<string>();
  const skipped = new Set<string>();
  const optional = new Set<string>();

  for (const task of TASKS) {
    const stateOrder: State[] = [
      "problem-opportunity",
      "solution",
      "implementation",
    ];
    const startIndex = stateOrder.indexOf(startingState);
    const taskIndex = stateOrder.indexOf(task.state);

    if (taskIndex < startIndex) {
      skipped.add(task.id);
      continue;
    }

    // Always exclude these two from the default plan
    if (task.id === "discovery" || task.id === "product-requirement-shareout") {
      skipped.add(task.id);
      continue;
    }

    // Research tasks: skip if existing research available
    const researchTaskIds = [
      "user-research",
      "user-research-analysis",
      "request-quantitative-data",
    ];
    if (
      researchTaskIds.includes(task.id) &&
      existingResearch === "yes"
    ) {
      skipped.add(task.id);
      continue;
    }

    if (
      researchTaskIds.includes(task.id) &&
      existingResearch === "partial"
    ) {
      optional.add(task.id);
      included.add(task.id);
      continue;
    }

    // Regulatory: skip some ideation tasks
    if (
      regulatoryDriven === "yes" &&
      (task.id === "competitor-analysis" || task.id === "journey-mapping")
    ) {
      optional.add(task.id);
    }

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
