"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buildProcessConfig } from "@/lib/questionnaire";
import clsx from "clsx";

const MARKETS = ["ALL", "DEU", "FRA", "ES", "ITA", "ROE"];

export type ProjectInfo = {
  projectName: string;
  problemStatement: string;
  markets: string[];
  targetedUsers: string;
  designers: string;
  pm: string;
};

export default function QuestionnairePage() {
  const router = useRouter();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    projectName: "",
    problemStatement: "",
    markets: [],
    targetedUsers: "",
    designers: "",
    pm: "",
  });

  const canProceedFromInfo = projectInfo.projectName.trim().length > 0;

  function toggleMarket(market: string) {
    setProjectInfo((prev) => ({
      ...prev,
      markets: prev.markets.includes(market)
        ? prev.markets.filter((m) => m !== market)
        : [...prev.markets, market],
    }));
  }

  function handleGenerate() {
    if (!canProceedFromInfo) return;
    const config = buildProcessConfig({});
    const params = new URLSearchParams({
      config: JSON.stringify({
        startingState: config.startingState,
        includedTaskIds: [...config.includedTaskIds],
        skippedTaskIds: [...config.skippedTaskIds],
        optionalTaskIds: [...config.optionalTaskIds],
      }),
      projectInfo: JSON.stringify(projectInfo),
    });
    router.push(`/process?${params.toString()}`);
  }

  return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl flex flex-col gap-5">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
              Project info
            </p>
            <h2 className="text-2xl font-semibold text-gray-900">
              Tell us about the project
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={projectInfo.projectName}
                onChange={(e) =>
                  setProjectInfo((p) => ({ ...p, projectName: e.target.value }))
                }
                placeholder="e.g. Savings Redesign Q3"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Problem statement
              </label>
              <textarea
                value={projectInfo.problemStatement}
                onChange={(e) =>
                  setProjectInfo((p) => ({
                    ...p,
                    problemStatement: e.target.value,
                  }))
                }
                placeholder="What problem are we solving and why does it matter?"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Market
              </label>
              <div className="flex gap-2 flex-wrap">
                {MARKETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMarket(m)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all",
                      projectInfo.markets.includes(m)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Targeted users
              </label>
              <input
                type="text"
                value={projectInfo.targetedUsers}
                onChange={(e) =>
                  setProjectInfo((p) => ({
                    ...p,
                    targetedUsers: e.target.value,
                  }))
                }
                placeholder="e.g. New users on Premium plan"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Designer(s)
                </label>
                <input
                  type="text"
                  value={projectInfo.designers}
                  onChange={(e) =>
                    setProjectInfo((p) => ({
                      ...p,
                      designers: e.target.value,
                    }))
                  }
                  placeholder="e.g. Ana, Cha"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  PM
                </label>
                <input
                  type="text"
                  value={projectInfo.pm}
                  onChange={(e) =>
                    setProjectInfo((p) => ({ ...p, pm: e.target.value }))
                  }
                  placeholder="e.g. Jonas"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={handleGenerate}
              disabled={!canProceedFromInfo}
              className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate process
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    );
}
