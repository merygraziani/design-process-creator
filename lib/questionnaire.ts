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

export type D2DType = "simple" | "complicated" | "complex";

/**
 * Resolves the D2D project type from the 3-question answers.
 * simple      → solution already decided
 * complicated → problem known, solution unknown
 * complex     → problem unknown, solution unknown
 */
export function resolveD2DType(answers: Answers): D2DType {
  const problemClarity = answers["problem-clarity"];
  if (problemClarity === "decided") return "simple";
  if (problemClarity === "yes") return "complicated";
  return "complex";
}

// Tasks always included for Complicated even though they're in Problem & Opportunity
const COMPLICATED_DISCOVERY_INCLUSIONS = new Set([
  "product-requirement-shareout",
  "kickoff-session",
]);

export function buildProcessConfig(
  _answers: Answers = {},
  d2dType: D2DType = "complex"
): ProcessConfig {
  let startingState: State;
  if (d2dType === "simple") startingState = "implementation";
  else if (d2dType === "complicated") startingState = "solution";
  else startingState = "problem-opportunity";

  const included = new Set<string>();
  const skipped = new Set<string>();
  const optional = new Set<string>();

  const STATE_ORDER: State[] = [
    "problem-opportunity",
    "solution",
    "implementation",
  ];
  const startIndex = STATE_ORDER.indexOf(startingState);

  for (const task of TASKS) {
    const taskStateIndex = STATE_ORDER.indexOf(task.state);
    included.add(task.id);

    if (taskStateIndex < startIndex) {
      // For Complicated: keep a subset of discovery tasks active
      if (
        d2dType === "complicated" &&
        COMPLICATED_DISCOVERY_INCLUSIONS.has(task.id)
      ) {
        // not skipped — leave as active
      } else {
        skipped.add(task.id);
      }
    } else if (task.optional) {
      optional.add(task.id);
    }
  }

  return {
    startingState,
    includedTaskIds: included,
    skippedTaskIds: skipped,
    optionalTaskIds: optional,
  };
}

export function getIncludedTasks(config: ProcessConfig): Task[] {
  return TASKS.filter((t) => config.includedTaskIds.has(t.id));
}

export function getSkippedTasks(config: ProcessConfig): Task[] {
  return TASKS.filter((t) => config.skippedTaskIds.has(t.id));
}
