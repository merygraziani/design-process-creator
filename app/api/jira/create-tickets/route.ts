import { NextResponse } from "next/server";
import type { Task, State } from "@/lib/data";

const CLOUD_ID = "88ee171b-941c-4f1e-a762-25e49b508245";
const PROJECT_KEY = "UX";
const BASE_URL = `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3`;

// New hierarchy:
// Initiative (optional, user-provided) → Epic (Discovery / Delivery / Post Launch)
//   → Story (Problem & Opportunity, Solution, Build, Measure, Iterations)
//     → Sub-task (individual design tasks)

type EpicGroup = "discovery" | "delivery" | "post-launch";

const EPIC_LABELS: Record<EpicGroup, string> = {
  "discovery": "Discovery",
  "delivery": "Delivery",
  "post-launch": "Post Launch",
};

const EPIC_ISSUE_TYPE: Record<EpicGroup, string> = {
  "discovery": "Discovery",
  "delivery": "Epic",
  "post-launch": "Epic",
};

// Map each state to the Epic it belongs to
const STATE_TO_EPIC: Record<State, EpicGroup> = {
  "problem-opportunity": "discovery",
  "solution": "discovery",
  "implementation": "delivery",
};

// Stories within each state
const STATE_STORY_LABEL: Record<State, string> = {
  "problem-opportunity": "Problem & Opportunity",
  "solution": "Solution",
  "implementation": "Build",
};

// Additional stories not mapped 1:1 to a state (created if tasks exist in implementation)
// Measure and Iterations are sub-phases of implementation — handled via phase
const PHASE_STORY_LABEL: Record<string, string> = {
  "build": "Build",
  "measure": "Measure",
  "iterations": "Iterations",
};

type ProjectInfo = {
  projectName: string;
  problemStatement: string;
  markets: string[];
  targetedUsers: string;
  designers: string;
  pm: string;
};

type CreateTicketsBody = {
  tasks: Task[];
  projectInfo: ProjectInfo;
  initiativeLink?: string;
  teamName?: string;
};

function parseIssueKey(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Z]+-\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/\/([A-Z]+-\d+)(?:[/?#]|$)/);
  return match ? match[1] : null;
}

async function lookupIssueId(key: string, auth: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/issue/${key}?fields=id`, {
    headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id ?? null;
}

async function lookupAccountId(email: string, auth: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/user/search?query=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const exact = data.find((u: { emailAddress?: string }) => u.emailAddress === email);
  return (exact ?? data[0]).accountId ?? null;
}

async function lookupTeamId(teamName: string, auth: string): Promise<string | null> {
  const res = await fetch(
    `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/teams/1.0/teams/find?query=${encodeURIComponent(teamName)}`,
    { headers: { Authorization: `Basic ${auth}`, Accept: "application/json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const teams: { id: string; displayName: string }[] = data?.teams ?? data?.results ?? [];
  if (teams.length === 0) return null;
  const exact = teams.find((t) => t.displayName?.toLowerCase() === teamName.toLowerCase());
  return (exact ?? teams[0]).id ?? null;
}

async function linkIssues(inwardId: string, outwardId: string, auth: string): Promise<void> {
  await fetch(`${BASE_URL}/issueLink`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      type: { name: "Relates" },
      inwardIssue: { id: inwardId },
      outwardIssue: { id: outwardId },
    }),
  });
}

async function createIssue(
  payload: object,
  auth: string
): Promise<{ key: string; id: string } | { error: string }> {
  const res = await fetch(`${BASE_URL}/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: err.errorMessages?.[0] ?? `HTTP ${res.status}` };
  }

  const data = await res.json();
  return { key: data.key, id: data.id };
}

function makeId() {
  return Math.random().toString(36).substring(2, 18);
}

function buildEpicAdfDescription(): object {
  return { version: 1, type: "doc", content: [] };
}

// Rich "What we do" content per story type, based on the N26 process framework image
const STORY_WHAT_WE_DO: Record<string, string[]> = {
  "Problem & Opportunity": [
    "Kick start: We create the team, its rules & rituals (if applicable). We understand the project brief and challenges. We get to know our stakeholders and their concern. We define OKRs and Objectives. We define the type of the project (simple, complex, complicated) to understand where we need to start the process.",
    "Understand: We define clear research goals that can be achieved within our timelines. We review past research findings (if applicable). We review CS data (if applicable). We review data analytics (if applicable). We decide which method we will use for research depending on the necessity of the problem/opportunity. We plan, coordinate and conduct the study(s). We look at both qualitative and quantitative data to make the unknown known.",
    "Define: We synthesise information into research findings that enable decisions. We prepare the research reports and share them with our stakeholders. We define the problem based on the research output. We create our HMW statements. We investigate the problem to conclude if it is Viable (Business Needs), Desirable (User Needs), Feasible (Tech Ability), and Compliant (Legal Needs).",
  ],
  "Solution": [
    "Ideate: We reframe the challenge by revisiting the problem. We brainstorm a range of creative ideas that address the problem that we defined. We diverge solutions without judging the ideas. We mix and remix the ideas.",
    "Validate: We iteratively converge the alternative solutions. We evaluate the alternatives against parameters, matrices, etc. We identify the main validation points. Prototype, test and analyse. We refine the solution to ensure that it is: Viable (Business Needs), Desirable (User Needs), Feasible (Tech Ability), Compliant (Legal Needs).",
    "Refine: We align with stakeholders and have technical solution discovery. We decompose the solutions into epics, stories and tasks (each epic or story can have its own small process). We map out use cases and validations. We consider NXD compliance and localisation.",
  ],
  "Build": [
    "We build the solution in sprints.",
    "We have QA tests (development and design).",
    "We build test automation.",
    "We have usability research in the company and with friends and family.",
    "We define tracking.",
    "We have A/B testing plans.",
    "We have a release plan.",
  ],
  "Measure": [
    "We track the data to see how the solution performs.",
    "We analyse the A/B test results.",
  ],
  "Iterations": [
    "We have usability researches & journey mapping to understand users' pain and gain points.",
    "We overview CS data report understanding users' pain points in the field.",
  ],
};

function adfBulletList(items: string[]): object {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [{ type: "text", text: item }] }],
    })),
  };
}

function buildStoryAdfDescription(storyLabel: string, _projectInfo: ProjectInfo, _tasks: Task[]): object {
  const whatWeDo = STORY_WHAT_WE_DO[storyLabel] ?? [];

  return {
    version: 1,
    type: "doc",
    content: [
      ...(whatWeDo.length > 0 ? [{
        type: "panel",
        attrs: { panelType: "note" },
        content: [
          { type: "paragraph", content: [{ type: "text", text: "What we do", marks: [{ type: "strong" }] }] },
          adfBulletList(whatWeDo),
        ],
      }] : []),
    ],
  };
}

function buildSubTaskAdfDescription(task: Task): object {
  const infoContent: object[] = [
    ...(task.what ? [{
      type: "paragraph",
      content: [{ type: "text", text: "What: ", marks: [{ type: "strong" }] }, { type: "text", text: task.what }],
    }] : []),
    {
      type: "paragraph",
      content: [{ type: "text", text: "Owner: ", marks: [{ type: "strong" }] }, { type: "text", text: task.owner }],
    },
    ...(task.outcome ? [{
      type: "paragraph",
      content: [{ type: "text", text: "Outcome: ", marks: [{ type: "strong" }] }, { type: "text", text: task.outcome }],
    }] : []),
  ];

  const successContent: object[] = [
    { type: "paragraph", content: [{ type: "text", text: "Acceptance Criteria", marks: [{ type: "strong" }] }] },
  ];
  if (task.acceptanceCriteria?.length) {
    successContent.push({
      type: "taskList",
      attrs: { localId: makeId() },
      content: task.acceptanceCriteria.map((c) => ({
        type: "taskItem",
        attrs: { localId: makeId(), state: "TODO" },
        content: [{ type: "text", text: c }],
      })),
    });
  }
  if (task.subTasks?.length) {
    successContent.push(
      { type: "paragraph", content: [{ type: "text", text: "Sub-tasks", marks: [{ type: "strong" }] }] },
      {
        type: "taskList",
        attrs: { localId: makeId() },
        content: task.subTasks.map((st) => ({
          type: "taskItem",
          attrs: { localId: makeId(), state: "TODO" },
          content: [{ type: "text", text: st }],
        })),
      }
    );
  }

  return {
    version: 1,
    type: "doc",
    content: [
      { type: "panel", attrs: { panelType: "info" }, content: infoContent },
      { type: "panel", attrs: { panelType: "success" }, content: successContent },
      { type: "panel", attrs: { panelType: "note" }, content: [
        { type: "paragraph", content: [{ type: "text", text: "Designs", marks: [{ type: "strong" }] }] },
        { type: "paragraph", content: [{ type: "text", text: "Add Figma link" }] },
      ]},
      { type: "panel", attrs: { panelType: "warning" }, content: [
        { type: "paragraph", content: [{ type: "text", text: "Tools", marks: [{ type: "strong" }] }] },
        { type: "paragraph", content: [{ type: "text", text: "There are no designated skills or tools for this task. If you have one, please contact " }, { type: "text", text: "maria.graziani@n26.com", marks: [{ type: "link", attrs: { href: "mailto:maria.graziani@n26.com" } }] }] },
      ]},
    ],
  };
}

export async function POST(request: Request) {
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;

  if (!email || !apiToken) {
    return NextResponse.json(
      { error: "JIRA_EMAIL and JIRA_API_TOKEN env vars are required" },
      { status: 500 }
    );
  }

  let body: CreateTicketsBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { tasks, projectInfo, initiativeLink, teamName } = body;
  const projectName = projectInfo?.projectName ?? "Design Project";

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json({ error: "No tasks provided" }, { status: 400 });
  }

  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");

  // Resolve initiative ID — use existing if link provided, otherwise create one
  let initiativeId: string | null = null;
  let teamId: string | null = null;
  if (initiativeLink?.trim()) {
    const initiativeKey = parseIssueKey(initiativeLink.trim());
    if (!initiativeKey) {
      return NextResponse.json({ error: "Could not parse an issue key from the initiative link" }, { status: 400 });
    }
    initiativeId = await lookupIssueId(initiativeKey, auth);
    if (!initiativeId) {
      return NextResponse.json({ error: `Could not find initiative ${initiativeKey} in Jira` }, { status: 400 });
    }
  } else {
    // No initiative link — create one. Team is required.
    if (!teamName?.trim()) {
      return NextResponse.json({ error: "Team is required when no initiative link is provided" }, { status: 400 });
    }
    teamId = await lookupTeamId(teamName.trim(), auth);
    if (!teamId) {
      return NextResponse.json({ error: `Could not find a team matching "${teamName}"` }, { status: 400 });
    }
    const initiative = await createIssue({
      fields: {
        project: { key: PROJECT_KEY },
        summary: projectName,
        issuetype: { name: "Initiative" },
        customfield_11900: { id: teamId },
      },
    }, auth);
    if ("error" in initiative) {
      return NextResponse.json({ error: `Failed to create initiative: ${initiative.error}` }, { status: 500 });
    }
    initiativeId = initiative.id;
  }

  // Always create a separate Post Launch initiative
  const postLaunchInitiative = await createIssue({
    fields: {
      project: { key: PROJECT_KEY },
      summary: `${projectName} Post Launch`,
      issuetype: { name: "Initiative" },
      ...(teamId ? { customfield_11900: { id: teamId } } : {}),
    },
  }, auth);
  if ("error" in postLaunchInitiative) {
    return NextResponse.json({ error: `Failed to create Post Launch initiative: ${postLaunchInitiative.error}` }, { status: 500 });
  }
  const postLaunchInitiativeId = postLaunchInitiative.id;

  // Link the two initiatives so they're easy to navigate between
  if (initiativeId) {
    await linkIssues(initiativeId, postLaunchInitiativeId, auth);
  }

  // Resolve people
  let assigneeAccountId: string | null = null;
  const designerEmail = projectInfo.designers?.split(",")[0]?.trim();
  if (designerEmail) {
    assigneeAccountId = await lookupAccountId(designerEmail, auth);
    if (!assigneeAccountId) {
      return NextResponse.json({ error: `Could not find a Jira user matching designer "${designerEmail}"` }, { status: 400 });
    }
  }

  let reporterAccountId: string | null = null;
  const pmEmail = projectInfo.pm?.trim();
  if (pmEmail) {
    reporterAccountId = await lookupAccountId(pmEmail, auth);
    if (!reporterAccountId) {
      return NextResponse.json({ error: `Could not find a Jira user matching PM "${pmEmail}"` }, { status: 400 });
    }
  }

  const peopleFields = {
    ...(assigneeAccountId ? { assignee: { accountId: assigneeAccountId } } : {}),
    ...(reporterAccountId ? { reporter: { accountId: reporterAccountId } } : {}),
  };

  // Determine which epics are needed based on tasks present
  const epicGroupsNeeded = Array.from(
    new Set(tasks.map((t) => STATE_TO_EPIC[t.state]))
  ) as EpicGroup[];

  // Create Epics (children of Initiative if provided)
  const epicIdByGroup: Record<string, string> = {};

  for (const epicGroup of epicGroupsNeeded) {
    const epicLabel = EPIC_LABELS[epicGroup];
    const parentInitiativeId = epicGroup === "post-launch" ? postLaunchInitiativeId : initiativeId;
    const result = await createIssue({
      fields: {
        project: { key: PROJECT_KEY },
        summary: `[${projectName}] ${epicLabel}`,
        description: buildEpicAdfDescription(),
        issuetype: { name: EPIC_ISSUE_TYPE[epicGroup] },
        labels: [],
        ...(parentInitiativeId ? { parent: { id: parentInitiativeId } } : {}),
        ...peopleFields,
      },
    }, auth);

    if ("error" in result) {
      return NextResponse.json({ error: `Failed to create epic "${epicLabel}": ${result.error}` }, { status: 500 });
    }
    epicIdByGroup[epicGroup] = result.id;
  }

  // Create Stories — one per phase group within each epic
  // Implementation state splits into Build + Measure stories by phase
  // problem-opportunity and solution each get their own story
  // Story key:
  // - problem-opportunity and solution → one story per state (all phases merged)
  // - implementation → one story per phase (build vs measure)
  const storyKey = (state: State, phase: string) =>
    state === "implementation" ? `${state}::${phase}` : state;

  const storyIdByKey: Record<string, string> = {};

  // Collect unique story slots
  const storySlots: { state: State; phase: string; label: string; epicGroup: EpicGroup }[] = [];
  const seen = new Set<string>();

  for (const task of tasks) {
    let label: string;
    let epicGroup: EpicGroup;
    let slotPhase: string;

    if (task.state === "implementation") {
      label = PHASE_STORY_LABEL[task.phase] ?? "Build";
      epicGroup = (task.phase === "measure" || task.phase === "iterations") ? "post-launch" : "delivery";
      slotPhase = task.phase;
    } else {
      label = STATE_STORY_LABEL[task.state];
      epicGroup = STATE_TO_EPIC[task.state];
      slotPhase = "all";
    }

    const key = storyKey(task.state, task.phase);
    if (!seen.has(key)) {
      seen.add(key);
      storySlots.push({ state: task.state, phase: slotPhase, label, epicGroup });
    }
  }

  // Ensure Delivery and Post Launch epics are created if needed
  for (const slot of storySlots) {
    if (!epicIdByGroup[slot.epicGroup]) {
      const epicLabel = EPIC_LABELS[slot.epicGroup];
      const parentInitiativeId = slot.epicGroup === "post-launch" ? postLaunchInitiativeId : initiativeId;
      const result = await createIssue({
        fields: {
          project: { key: PROJECT_KEY },
          summary: `[${projectName}] ${epicLabel}`,
          description: buildEpicAdfDescription(),
          issuetype: { name: EPIC_ISSUE_TYPE[slot.epicGroup] },
          labels: [],
          ...(parentInitiativeId ? { parent: { id: parentInitiativeId } } : {}),
          ...peopleFields,
        },
      }, auth);

      if ("error" in result) {
        return NextResponse.json({ error: `Failed to create epic "${epicLabel}": ${result.error}` }, { status: 500 });
      }
      epicIdByGroup[slot.epicGroup] = result.id;
    }
  }

  for (const slot of storySlots) {
    const tasksInSlot = tasks.filter((t) =>
      slot.state === "implementation"
        ? t.state === slot.state && t.phase === slot.phase
        : t.state === slot.state
    );

    const epicId = epicIdByGroup[slot.epicGroup];
    const result = await createIssue({
      fields: {
        project: { key: PROJECT_KEY },
        summary: `[${projectName}] ${slot.label}`,
        description: buildStoryAdfDescription(slot.label, projectInfo, tasksInSlot),
        issuetype: { name: "Story" },
        labels: [],
        ...(epicId ? { parent: { id: epicId } } : {}),
        ...peopleFields,
      },
    }, auth);

    if ("error" in result) {
      return NextResponse.json({ error: `Failed to create story "${slot.label}": ${result.error}` }, { status: 500 });
    }
    storyIdByKey[storyKey(slot.state, slot.phase)] = result.id;
  }

  // Always create the Post Launch epic if it wasn't already created by a measure task
  if (!epicIdByGroup["post-launch"]) {
    const epicLabel = EPIC_LABELS["post-launch"];
    const result = await createIssue({
      fields: {
        project: { key: PROJECT_KEY },
        summary: `[${projectName}] ${epicLabel}`,
        description: buildEpicAdfDescription(),
        issuetype: { name: EPIC_ISSUE_TYPE["post-launch"] },
        labels: [],
        parent: { id: postLaunchInitiativeId },
        ...peopleFields,
      },
    }, auth);

    if ("error" in result) {
      return NextResponse.json({ error: `Failed to create epic "${epicLabel}": ${result.error}` }, { status: 500 });
    }
    epicIdByGroup["post-launch"] = result.id;
  }

  // Always create an empty Iterations story under Post Launch epic
  const postLaunchEpicId = epicIdByGroup["post-launch"];
  if (postLaunchEpicId) {
    await createIssue({
      fields: {
        project: { key: PROJECT_KEY },
        summary: `[${projectName}] Iterations`,
        description: buildStoryAdfDescription("Iterations", projectInfo, []),
        issuetype: { name: "Story" },
        labels: [],
        parent: { id: postLaunchEpicId },
        ...peopleFields,
      },
    }, auth);
  }

  // Create Sub-tasks under their Story
  const results: { taskId: string; jiraKey: string; jiraUrl: string }[] = [];
  const errors: { taskId: string; error: string }[] = [];

  for (const task of tasks) {
    const key = storyKey(task.state, task.phase);
    const storyId = storyIdByKey[key];

    const result = await createIssue({
      fields: {
        project: { key: PROJECT_KEY },
        summary: `[UX] ${task.jiraTemplate.summary}`,
        description: buildSubTaskAdfDescription(task),
        issuetype: { name: "Sub-task" },
        labels: ["CI_UX"],
        components: [{ name: "design" }],
        ...(storyId ? { parent: { id: storyId } } : {}),
        ...peopleFields,
      },
    }, auth);

    if ("error" in result) {
      errors.push({ taskId: task.id, error: result.error });
    } else {
      results.push({
        taskId: task.id,
        jiraKey: result.key,
        jiraUrl: `https://number26-jira.atlassian.net/browse/${result.key}`,
      });
    }
  }

  return NextResponse.json({ results, errors });
}
