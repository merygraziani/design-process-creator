"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProcessConfig, State } from "@/lib/data";
import { StateBoard } from "@/components/StateBoard";
import type { ProjectInfo } from "@/app/questionnaire/page";

function ProcessContent() {
  const params = useSearchParams();
  const router = useRouter();

  const rawConfig = params.get("config");
  const rawProjectInfo = params.get("projectInfo");

  if (!rawConfig) {
    router.push("/questionnaire");
    return null;
  }

  let config: ProcessConfig;
  let projectInfo: ProjectInfo;

  try {
    const parsed = JSON.parse(rawConfig);
    config = {
      startingState: parsed.startingState as State,
      includedTaskIds: new Set<string>(parsed.includedTaskIds),
      skippedTaskIds: new Set<string>(parsed.skippedTaskIds),
      optionalTaskIds: new Set<string>(parsed.optionalTaskIds),
    };
  } catch {
    router.push("/questionnaire");
    return null;
  }

  try {
    projectInfo = rawProjectInfo ? JSON.parse(rawProjectInfo) : { projectName: "Design Project", problemStatement: "", markets: [], targetedUsers: "", designers: "", pm: "" };
  } catch {
    projectInfo = { projectName: "Design Project", problemStatement: "", markets: [], targetedUsers: "", designers: "", pm: "" };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link
          href="/questionnaire"
          className="text-gray-400 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-base font-semibold text-gray-900">
            {projectInfo.projectName}
          </h1>
          <p className="text-xs text-gray-500">
            Starting from:{" "}
            <span className="capitalize">
              {config.startingState.replace("-", " & ")}
            </span>
            {projectInfo.markets.length > 0 && (
              <> · {projectInfo.markets.join(", ")}</>
            )}
          </p>
        </div>
      </header>
      <div className="p-6">
        <StateBoard config={config} projectInfo={projectInfo} />
      </div>
    </div>
  );
}

export default function ProcessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading…
        </div>
      }
    >
      <ProcessContent />
    </Suspense>
  );
}
