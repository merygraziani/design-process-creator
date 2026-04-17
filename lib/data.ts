export type State = "problem-opportunity" | "solution" | "implementation";
export type Phase =
  | "discovery"
  | "ideation"
  | "validation"
  | "build"
  | "measure";

export type Task = {
  id: string;
  title: string;
  phase: Phase;
  state: State;
  what?: string;
  owner: string;
  outcome?: string;
  acceptanceCriteria?: string[];
  subTasks?: string[];
  optional: boolean;
  parallelWith?: string[];
  jiraTemplate: {
    summary: string;
    description: string;
    labels: string[];
  };
};

export type ProcessConfig = {
  startingState: State;
  includedTaskIds: Set<string>;
  skippedTaskIds: Set<string>;
  optionalTaskIds: Set<string>;
};

export const TASKS: Task[] = [
  // ─── Problem & Opportunity State → Discovery Phase ───────────────────────
  {
    id: "discovery",
    title: "Discovery",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Understand the problem space by gathering context, aligning with stakeholders, and identifying research needs.",
    owner: "Designer",
    outcome: "Shared understanding of the problem and a clear research plan.",
    acceptanceCriteria: [
      "Problem statement is documented and aligned with PM",
      "Research gaps are identified",
      "Discovery plan is shared with team",
    ],
    subTasks: [
      "Write problem statement",
      "Identify knowledge gaps",
      "Align with PM on scope",
    ],
    optional: false,
    jiraTemplate: {
      summary: "Discovery",
      description: `## What\nUnderstand the problem space by gathering context, aligning with stakeholders, and identifying research needs.\n\n## Owner\nDesigner\n\n## Outcome\nShared understanding of the problem and a clear research plan.\n\n## Acceptance Criteria\n- Problem statement is documented and aligned with PM\n- Research gaps are identified\n- Discovery plan is shared with team\n\n## Sub-tasks\n- Write problem statement\n- Identify knowledge gaps\n- Align with PM on scope`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "product-requirement-shareout",
    title: "Product Requirement Share-out",
    phase: "discovery",
    state: "problem-opportunity",
    what: "PM shares the product requirements and business context with the design team.",
    owner: "PM → Designer",
    outcome: "Designer has full context on requirements, constraints, and success metrics.",
    acceptanceCriteria: [
      "PRD or equivalent document reviewed",
      "Open questions captured and addressed",
      "Success metrics understood",
    ],
    optional: false,
    parallelWith: ["discovery"],
    jiraTemplate: {
      summary: "Product Requirement Share-out",
      description: `## What\nPM shares the product requirements and business context with the design team.\n\n## Owner\nPM → Designer\n\n## Outcome\nDesigner has full context on requirements, constraints, and success metrics.\n\n## Acceptance Criteria\n- PRD or equivalent document reviewed\n- Open questions captured and addressed\n- Success metrics understood`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "competitor-analysis",
    title: "Competitor Analysis",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Review how competitors and industry leaders solve the same or similar problems.",
    owner: "Designer",
    outcome: "Competitive landscape overview with key differentiators and inspiration.",
    acceptanceCriteria: [
      "Minimum 3 competitors reviewed",
      "UX patterns documented",
      "Findings shared with team",
    ],
    subTasks: [
      "Identify competitors",
      "Screenshot and annotate flows",
      "Synthesise findings into slides or doc",
    ],
    optional: false,
    parallelWith: ["desktop-research"],
    jiraTemplate: {
      summary: "Competitor Analysis",
      description: `## What\nReview how competitors and industry leaders solve the same or similar problems.\n\n## Owner\nDesigner\n\n## Outcome\nCompetitive landscape overview with key differentiators and inspiration.\n\n## Acceptance Criteria\n- Minimum 3 competitors reviewed\n- UX patterns documented\n- Findings shared with team\n\n## Sub-tasks\n- Identify competitors\n- Screenshot and annotate flows\n- Synthesise findings into slides or doc`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "desktop-research",
    title: "Desktop Research & Analysis",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Gather secondary research: academic papers, industry reports, heuristic evaluations.",
    owner: "Designer",
    outcome: "Evidence base to inform design decisions.",
    acceptanceCriteria: [
      "Key sources reviewed and cited",
      "Relevant insights extracted",
      "Research summary documented",
    ],
    optional: false,
    parallelWith: ["competitor-analysis"],
    jiraTemplate: {
      summary: "Desktop Research & Analysis",
      description: `## What\nGather secondary research: academic papers, industry reports, heuristic evaluations.\n\n## Owner\nDesigner\n\n## Outcome\nEvidence base to inform design decisions.\n\n## Acceptance Criteria\n- Key sources reviewed and cited\n- Relevant insights extracted\n- Research summary documented`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "users-jobs-definition",
    title: "Users & Jobs to Be Done Definition",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Define the target user segments and articulate their core jobs to be done (JTBD).",
    owner: "Designer + PM",
    outcome: "Documented user personas and JTBD statements.",
    acceptanceCriteria: [
      "User segments defined",
      "JTBD statements written",
      "Signed off by PM",
    ],
    optional: false,
    jiraTemplate: {
      summary: "Users & Jobs to Be Done Definition",
      description: `## What\nDefine the target user segments and articulate their core jobs to be done (JTBD).\n\n## Owner\nDesigner + PM\n\n## Outcome\nDocumented user personas and JTBD statements.\n\n## Acceptance Criteria\n- User segments defined\n- JTBD statements written\n- Signed off by PM`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "journey-mapping",
    title: "Journey Mapping",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Map the end-to-end user journey to surface pain points and opportunity areas.",
    owner: "Designer",
    outcome: "Journey map artefact with annotated pain points and opportunities.",
    acceptanceCriteria: [
      "Current state journey documented",
      "Pain points identified and prioritised",
      "Opportunities captured",
    ],
    subTasks: [
      "Gather touchpoint data",
      "Run journey mapping workshop",
      "Document and share map",
    ],
    optional: false,
    jiraTemplate: {
      summary: "Journey Mapping",
      description: `## What\nMap the end-to-end user journey to surface pain points and opportunity areas.\n\n## Owner\nDesigner\n\n## Outcome\nJourney map artefact with annotated pain points and opportunities.\n\n## Acceptance Criteria\n- Current state journey documented\n- Pain points identified and prioritised\n- Opportunities captured\n\n## Sub-tasks\n- Gather touchpoint data\n- Run journey mapping workshop\n- Document and share map`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "qualitative-data-analysis",
    title: "Qualitative Data Analysis",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Analyse existing qualitative data (interviews, feedback, support tickets) for themes.",
    owner: "Designer",
    outcome: "Thematic analysis with key insights documented.",
    acceptanceCriteria: [
      "Data sources identified and reviewed",
      "Themes and patterns extracted",
      "Insights mapped to JTBD",
    ],
    optional: false,
    parallelWith: ["quantitative-data-analysis"],
    jiraTemplate: {
      summary: "Qualitative Data Analysis",
      description: `## What\nAnalyse existing qualitative data (interviews, feedback, support tickets) for themes.\n\n## Owner\nDesigner\n\n## Outcome\nThematic analysis with key insights documented.\n\n## Acceptance Criteria\n- Data sources identified and reviewed\n- Themes and patterns extracted\n- Insights mapped to JTBD`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "quantitative-data-analysis",
    title: "Quantitative Data Analysis",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Analyse quantitative data (analytics, funnels, surveys) to identify scale and patterns.",
    owner: "Designer + Data Analyst",
    outcome: "Data-backed understanding of user behaviour and problem scale.",
    acceptanceCriteria: [
      "Relevant metrics identified",
      "Data reviewed with analyst",
      "Key findings documented",
    ],
    optional: false,
    parallelWith: ["qualitative-data-analysis"],
    jiraTemplate: {
      summary: "Quantitative Data Analysis",
      description: `## What\nAnalyse quantitative data (analytics, funnels, surveys) to identify scale and patterns.\n\n## Owner\nDesigner + Data Analyst\n\n## Outcome\nData-backed understanding of user behaviour and problem scale.\n\n## Acceptance Criteria\n- Relevant metrics identified\n- Data reviewed with analyst\n- Key findings documented`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "request-quantitative-data",
    title: "Request Quantitative Data",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Formally request data from analytics or BI team if not yet available.",
    owner: "Designer",
    outcome: "Data request submitted and acknowledged.",
    acceptanceCriteria: [
      "Request ticket created",
      "Data owner confirmed",
      "Expected delivery date agreed",
    ],
    optional: true,
    jiraTemplate: {
      summary: "Request Quantitative Data (if necessary)",
      description: `## What\nFormally request data from analytics or BI team if not yet available.\n\n## Owner\nDesigner\n\n## Outcome\nData request submitted and acknowledged.\n\n## Acceptance Criteria\n- Request ticket created\n- Data owner confirmed\n- Expected delivery date agreed`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "user-research",
    title: "User Research",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Conduct primary user research (interviews, contextual enquiry, diary studies) to gather direct user insights.",
    owner: "Designer + UX Researcher",
    outcome: "Research data ready for analysis.",
    acceptanceCriteria: [
      "Research plan approved",
      "Participants recruited",
      "Sessions conducted and recorded",
    ],
    subTasks: [
      "Write discussion guide",
      "Recruit participants",
      "Run sessions",
      "Transcribe / note-take",
    ],
    optional: true,
    jiraTemplate: {
      summary: "User Research (if necessary)",
      description: `## What\nConduct primary user research (interviews, contextual enquiry, diary studies) to gather direct user insights.\n\n## Owner\nDesigner + UX Researcher\n\n## Outcome\nResearch data ready for analysis.\n\n## Acceptance Criteria\n- Research plan approved\n- Participants recruited\n- Sessions conducted and recorded\n\n## Sub-tasks\n- Write discussion guide\n- Recruit participants\n- Run sessions\n- Transcribe / note-take`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "user-research-analysis",
    title: "User Research Analysis",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Synthesise user research data into actionable insights and How Might We statements.",
    owner: "Designer",
    outcome: "Research report with insights and HMW statements.",
    acceptanceCriteria: [
      "Affinity mapping completed",
      "Key insights documented",
      "HMW statements created",
      "Findings presented to team",
    ],
    subTasks: [
      "Run affinity mapping session",
      "Write insights",
      "Draft research report",
    ],
    optional: true,
    jiraTemplate: {
      summary: "User Research Analysis",
      description: `## What\nSynthesise user research data into actionable insights and How Might We statements.\n\n## Owner\nDesigner\n\n## Outcome\nResearch report with insights and HMW statements.\n\n## Acceptance Criteria\n- Affinity mapping completed\n- Key insights documented\n- HMW statements created\n- Findings presented to team\n\n## Sub-tasks\n- Run affinity mapping session\n- Write insights\n- Draft research report`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "kickoff-session",
    title: "Kick-off Session",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Align the full cross-functional team (PM, Engineering, Design, Data) on goals, timeline, and ways of working.",
    owner: "Designer + PM",
    outcome: "Shared understanding and alignment on project charter.",
    acceptanceCriteria: [
      "All stakeholders attended or informed",
      "Goals and success metrics documented",
      "Ways of working agreed",
      "Timeline shared",
    ],
    optional: false,
    jiraTemplate: {
      summary: "Kick-off Session",
      description: `## What\nAlign the full cross-functional team on goals, timeline, and ways of working.\n\n## Owner\nDesigner + PM\n\n## Outcome\nShared understanding and alignment on project charter.\n\n## Acceptance Criteria\n- All stakeholders attended or informed\n- Goals and success metrics documented\n- Ways of working agreed\n- Timeline shared`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },
  {
    id: "cs-quality-analysis",
    title: "Customer Support Quality Analysis",
    phase: "discovery",
    state: "problem-opportunity",
    what: "Review CS contacts, CSAT data, and recurring complaint themes related to the problem area.",
    owner: "Designer + CS",
    outcome: "CS insights integrated into discovery findings.",
    acceptanceCriteria: [
      "Top CS contact reasons identified",
      "CSAT scores reviewed",
      "Insights documented",
    ],
    optional: false,
    jiraTemplate: {
      summary: "Customer Support Quality Analysis",
      description: `## What\nReview CS contacts, CSAT data, and recurring complaint themes related to the problem area.\n\n## Owner\nDesigner + CS\n\n## Outcome\nCS insights integrated into discovery findings.\n\n## Acceptance Criteria\n- Top CS contact reasons identified\n- CSAT scores reviewed\n- Insights documented`,
      labels: ["design-process", "problem-opportunity", "discovery"],
    },
  },

  // ─── Solution State → Ideation Phase ─────────────────────────────────────
  {
    id: "solution-wireframes",
    title: "Solution Wireframes",
    phase: "ideation",
    state: "solution",
    what: "Generate and explore multiple solution concepts through low/mid-fidelity wireframes.",
    owner: "Designer",
    outcome: "Wireframe concepts ready for team review and validation.",
    acceptanceCriteria: [
      "Minimum 2 solution concepts explored",
      "Wireframes cover all key flows",
      "Design critique conducted",
      "Preferred direction selected",
    ],
    subTasks: [
      "Ideation workshop / sketching",
      "Create wireframes in Figma",
      "Internal design review",
      "Share with PM for direction sign-off",
    ],
    optional: false,
    parallelWith: ["translation-request"],
    jiraTemplate: {
      summary: "Solution Wireframes",
      description: `## What\nGenerate and explore multiple solution concepts through low/mid-fidelity wireframes.\n\n## Owner\nDesigner\n\n## Outcome\nWireframe concepts ready for team review and validation.\n\n## Acceptance Criteria\n- Minimum 2 solution concepts explored\n- Wireframes cover all key flows\n- Design critique conducted\n- Preferred direction selected\n\n## Sub-tasks\n- Ideation workshop / sketching\n- Create wireframes in Figma\n- Internal design review\n- Share with PM for direction sign-off`,
      labels: ["design-process", "solution", "ideation"],
    },
  },

  // ─── Solution State → Validation (Ideation side) ─────────────────────────
  {
    id: "translation-request",
    title: "Translation Request",
    phase: "validation",
    state: "solution",
    what: "Submit copy and UX writing for localisation/translation review early in the design process.",
    owner: "Designer + Content Designer",
    outcome: "Translation pipeline initiated before final designs.",
    acceptanceCriteria: [
      "All string keys identified",
      "Translation brief submitted",
      "Sign-off from content designer",
    ],
    optional: false,
    parallelWith: ["solution-wireframes"],
    jiraTemplate: {
      summary: "Translation Request",
      description: `## What\nSubmit copy and UX writing for localisation/translation review early in the design process.\n\n## Owner\nDesigner + Content Designer\n\n## Outcome\nTranslation pipeline initiated before final designs.\n\n## Acceptance Criteria\n- All string keys identified\n- Translation brief submitted\n- Sign-off from content designer`,
      labels: ["design-process", "solution", "validation"],
    },
  },

  // ─── Solution State → Validation (High-Fi side) ──────────────────────────
  {
    id: "high-fidelity-ui",
    title: "High-Fidelity UI",
    phase: "validation",
    state: "solution",
    what: "Create pixel-perfect, component-compliant high-fidelity designs ready for engineering.",
    owner: "Designer",
    outcome: "Dev-ready Figma file with all states, variants, and handoff annotations.",
    acceptanceCriteria: [
      "All user flows covered in high-fi",
      "Design system components used correctly",
      "Accessibility checked (contrast, touch targets)",
      "Engineering handoff complete",
    ],
    subTasks: [
      "Apply design system components",
      "Design all states (empty, error, loading, success)",
      "Accessibility review",
      "Figma handoff / Dev Mode annotations",
    ],
    optional: false,
    jiraTemplate: {
      summary: "High-Fidelity UI",
      description: `## What\nCreate pixel-perfect, component-compliant high-fidelity designs ready for engineering.\n\n## Owner\nDesigner\n\n## Outcome\nDev-ready Figma file with all states, variants, and handoff annotations.\n\n## Acceptance Criteria\n- All user flows covered in high-fi\n- Design system components used correctly\n- Accessibility checked (contrast, touch targets)\n- Engineering handoff complete\n\n## Sub-tasks\n- Apply design system components\n- Design all states (empty, error, loading, success)\n- Accessibility review\n- Figma handoff / Dev Mode annotations`,
      labels: ["design-process", "solution", "validation"],
    },
  },
  {
    id: "implementation-phases-scope",
    title: "Implementation Phases Scope-down",
    phase: "validation",
    state: "solution",
    what: "Break down the solution into phased implementation milestones (MVP, Phase 1, Phase 2…).",
    owner: "Designer + PM + Engineering",
    outcome: "Agreed phased rollout plan with scope per phase.",
    acceptanceCriteria: [
      "MVP scope defined and agreed",
      "Future phases documented",
      "Engineering complexity accounted for",
    ],
    optional: false,
    jiraTemplate: {
      summary: "Implementation Phases Scope-down",
      description: `## What\nBreak down the solution into phased implementation milestones (MVP, Phase 1, Phase 2…).\n\n## Owner\nDesigner + PM + Engineering\n\n## Outcome\nAgreed phased rollout plan with scope per phase.\n\n## Acceptance Criteria\n- MVP scope defined and agreed\n- Future phases documented\n- Engineering complexity accounted for`,
      labels: ["design-process", "solution", "validation"],
    },
  },

  // ─── Implementation State → Build Phase ───────────────────────────────────
  {
    id: "design-qa",
    title: "Design QA",
    phase: "build",
    state: "implementation",
    what: "Review the implemented feature against the designs to catch visual and interaction regressions before launch.",
    owner: "Designer",
    outcome: "QA sign-off with issues raised and resolved.",
    acceptanceCriteria: [
      "Design vs implementation comparison done",
      "All P0/P1 issues fixed before launch",
      "QA sign-off documented",
    ],
    subTasks: [
      "Review on multiple devices/screen sizes",
      "Log bugs in Jira",
      "Re-review after fixes",
      "Final sign-off",
    ],
    optional: false,
    jiraTemplate: {
      summary: "Design QA (before launch)",
      description: `## What\nReview the implemented feature against the designs to catch visual and interaction regressions before launch.\n\n## Owner\nDesigner\n\n## Outcome\nQA sign-off with issues raised and resolved.\n\n## Acceptance Criteria\n- Design vs implementation comparison done\n- All P0/P1 issues fixed before launch\n- QA sign-off documented\n\n## Sub-tasks\n- Review on multiple devices/screen sizes\n- Log bugs in Jira\n- Re-review after fixes\n- Final sign-off`,
      labels: ["design-process", "implementation", "build"],
    },
  },
  {
    id: "tracking-documentation",
    title: "Tracking Documentation",
    phase: "build",
    state: "implementation",
    what: "Document all analytics events and properties needed for measuring feature success.",
    owner: "Designer + PM + Data",
    outcome: "Tracking spec approved and implemented.",
    acceptanceCriteria: [
      "All events and properties listed",
      "Naming convention followed",
      "Approved by Data team",
      "Implemented and verified in dev",
    ],
    optional: false,
    parallelWith: ["design-qa"],
    jiraTemplate: {
      summary: "Tracking Documentation",
      description: `## What\nDocument all analytics events and properties needed for measuring feature success.\n\n## Owner\nDesigner + PM + Data\n\n## Outcome\nTracking spec approved and implemented.\n\n## Acceptance Criteria\n- All events and properties listed\n- Naming convention followed\n- Approved by Data team\n- Implemented and verified in dev`,
      labels: ["design-process", "implementation", "build"],
    },
  },

  // ─── Implementation State → Measure Phase ─────────────────────────────────
  {
    id: "data-tracking-monitoring",
    title: "Data Tracking / Monitoring",
    phase: "measure",
    state: "implementation",
    what: "Monitor post-launch analytics to verify feature performance against success metrics.",
    owner: "Designer + PM + Data",
    outcome: "Dashboard or report tracking feature KPIs over the first 4–8 weeks post-launch.",
    acceptanceCriteria: [
      "Monitoring dashboard set up",
      "Baseline metrics documented",
      "Weekly review cadence established",
    ],
    optional: false,
    jiraTemplate: {
      summary: "Data Tracking / Monitoring",
      description: `## What\nMonitor post-launch analytics to verify feature performance against success metrics.\n\n## Owner\nDesigner + PM + Data\n\n## Outcome\nDashboard or report tracking feature KPIs over the first 4–8 weeks post-launch.\n\n## Acceptance Criteria\n- Monitoring dashboard set up\n- Baseline metrics documented\n- Weekly review cadence established`,
      labels: ["design-process", "implementation", "measure"],
    },
  },
  {
    id: "monitor-app-reviews",
    title: "Monitor App Reviews / CS Contacts",
    phase: "measure",
    state: "implementation",
    what: "Track App Store reviews and CS contact topics related to the launched feature.",
    owner: "Designer + CS",
    outcome: "Qualitative signal on user sentiment post-launch.",
    acceptanceCriteria: [
      "App Store filter set up for feature-related reviews",
      "CS contact categories monitored",
      "Issues fed back into backlog",
    ],
    optional: false,
    parallelWith: ["data-tracking-monitoring", "user-shadowing"],
    jiraTemplate: {
      summary: "Monitor App Reviews / CS Contacts",
      description: `## What\nTrack App Store reviews and CS contact topics related to the launched feature.\n\n## Owner\nDesigner + CS\n\n## Outcome\nQualitative signal on user sentiment post-launch.\n\n## Acceptance Criteria\n- App Store filter set up for feature-related reviews\n- CS contact categories monitored\n- Issues fed back into backlog`,
      labels: ["design-process", "implementation", "measure"],
    },
  },
  {
    id: "user-shadowing",
    title: "User Shadowing",
    phase: "measure",
    state: "implementation",
    what: "Observe real users (F&F or external) using the launched feature in naturalistic settings.",
    owner: "Designer",
    outcome: "Observational insights to inform next iteration.",
    acceptanceCriteria: [
      "Minimum 3 shadowing sessions conducted",
      "Key observations documented",
      "Insights shared with team",
    ],
    optional: false,
    parallelWith: ["data-tracking-monitoring", "monitor-app-reviews"],
    jiraTemplate: {
      summary: "User Shadowing (F&F or external users)",
      description: `## What\nObserve real users using the launched feature in naturalistic settings.\n\n## Owner\nDesigner\n\n## Outcome\nObservational insights to inform next iteration.\n\n## Acceptance Criteria\n- Minimum 3 shadowing sessions conducted\n- Key observations documented\n- Insights shared with team`,
      labels: ["design-process", "implementation", "measure"],
    },
  },
];

export const PHASES: { id: Phase; label: string; state: State }[] = [
  { id: "discovery", label: "Discovery", state: "problem-opportunity" },
  { id: "ideation", label: "Ideation", state: "solution" },
  { id: "validation", label: "Validation", state: "solution" },
  { id: "build", label: "Build", state: "implementation" },
  { id: "measure", label: "Measure", state: "implementation" },
];

export const STATES: { id: State; label: string; color: string }[] = [
  {
    id: "problem-opportunity",
    label: "Problem & Opportunity",
    color: "#f2ece1",
  },
  { id: "solution", label: "Solution", color: "#e9eef2" },
  { id: "implementation", label: "Implementation", color: "#d8edeb" },
];

export function getTasksByPhase(phase: Phase): Task[] {
  return TASKS.filter((t) => t.phase === phase);
}

export function getTaskById(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}
