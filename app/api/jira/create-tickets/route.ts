import { NextResponse } from "next/server";
import type { Task, State } from "@/lib/data";

const CLOUD_ID = "88ee171b-941c-4f1e-a762-25e49b508245";
const PROJECT_KEY = "UX";
const BASE_URL = `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3`;

const STATE_LABELS: Record<State, string> = {
  "problem-opportunity": "Problem & Opportunity",
  "solution": "Solution",
  "implementation": "Implementation",
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
  epicLink?: string;
};

function buildAdfDescription(markdown: string): object {
  const lines = markdown.split("\n");
  const content: object[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: line.replace("## ", "") }],
      });
    } else if (line.startsWith("- ")) {
      content.push({
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: line.replace("- ", "") }],
              },
            ],
          },
        ],
      });
    } else if (line.trim()) {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: line }],
      });
    }
  }

  return { version: 1, type: "doc", content };
}

// Extract issue key from a Jira URL or return as-is if it already looks like a key (e.g. UX-123)
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

  const { tasks, projectInfo, epicLink } = body;
  const projectName = projectInfo?.projectName ?? "Design Project";

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json({ error: "No tasks provided" }, { status: 400 });
  }

  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");

  // Resolve epic numeric ID from the pasted link/key
  let epicId: string | null = null;
  if (epicLink) {
    const epicKey = parseIssueKey(epicLink);
    if (!epicKey) {
      return NextResponse.json(
        { error: "Could not parse an issue key from the epic link" },
        { status: 400 }
      );
    }
    epicId = await lookupIssueId(epicKey, auth);
    if (!epicId) {
      return NextResponse.json(
        { error: `Could not find epic ${epicKey} in Jira` },
        { status: 400 }
      );
    }
  }

  // Determine which states have included tasks, preserving order
  const stateOrder: State[] = ["problem-opportunity", "solution", "implementation"];
  const statesPresent = stateOrder.filter((s) => tasks.some((t) => t.state === s));

  // Create one Story per state, as a child of the epic
  const storyIdByState: Record<string, string> = {};
  const storyResults: { state: State; jiraKey: string; jiraUrl: string }[] = [];

  for (const state of statesPresent) {
    const summary = `[${projectName}] ${STATE_LABELS[state]}`;
    const storyDesc = [
      `## ${STATE_LABELS[state]}`,
      `Design process tasks for the ${STATE_LABELS[state]} phase of ${projectName}.`,
      projectInfo.problemStatement ? `\n## Problem Statement\n${projectInfo.problemStatement}` : "",
      projectInfo.markets?.length ? `\n## Market\n${projectInfo.markets.join(", ")}` : "",
      projectInfo.targetedUsers ? `\n## Targeted Users\n${projectInfo.targetedUsers}` : "",
      projectInfo.designers ? `\n## Designer(s)\n${projectInfo.designers}` : "",
      projectInfo.pm ? `\n## PM\n${projectInfo.pm}` : "",
    ].filter(Boolean).join("\n");

    const result = await createIssue(
      {
        fields: {
          project: { key: PROJECT_KEY },
          summary,
          description: buildAdfDescription(storyDesc),
          issuetype: { name: "Story" },
          labels: ["design-process", state],
          ...(epicId ? { parent: { id: epicId } } : {}),
        },
      },
      auth
    );

    if ("error" in result) {
      return NextResponse.json(
        { error: `Failed to create story for ${STATE_LABELS[state]}: ${result.error}` },
        { status: 500 }
      );
    }

    storyIdByState[state] = result.id;
    storyResults.push({
      state,
      jiraKey: result.key,
      jiraUrl: `https://number26-jira.atlassian.net/browse/${result.key}`,
    });
  }

  // Create each task as a child Task under its state's Story
  const results: { taskId: string; jiraKey: string; jiraUrl: string }[] = [];
  const errors: { taskId: string; error: string }[] = [];

  for (const task of tasks) {
    const storyId = storyIdByState[task.state];
    const result = await createIssue(
      {
        fields: {
          project: { key: PROJECT_KEY },
          summary: task.jiraTemplate.summary,
          description: buildAdfDescription(task.jiraTemplate.description),
          issuetype: { name: "Task" },
          labels: task.jiraTemplate.labels,
          ...(storyId ? { parent: { id: storyId } } : {}),
        },
      },
      auth
    );

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

  return NextResponse.json({ stories: storyResults, results, errors });
}
