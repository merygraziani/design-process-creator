"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";

const D2D_OPTIONS = [
  {
    id: "simple",
    label: "Simple",
    subtitle: "Problem Known + Solution Known",
    description:
      "Regulatory or tech-driven projects where both the problem and solution are fixed.",
    example: "e.g. GDPR compliance, adding required fields",
    color: "bg-[#d8edeb]",
    borderColor: "border-[#a8d5d0]",
    hoverBorder: "hover:border-[#6bb8b0]",
  },
  {
    id: "complicated",
    label: "Complicated",
    subtitle: "Problem Known + Solution Unknown",
    description:
      "The problem is well understood from previous research or a clear business need, but you need to design the solution.",
    example: "e.g. Improving an existing flow with known pain points",
    color: "bg-[#e9eef2]",
    borderColor: "border-[#c0cdd8]",
    hoverBorder: "hover:border-[#8aaac0]",
  },
  {
    id: "complex",
    label: "Complex",
    subtitle: "Problem Unknown + Solution Unknown",
    description:
      "Unfamiliar context like new markets, new user segments, or chronic failures with unknown causes.",
    example: "e.g. Entering a new market, investigating churn root cause",
    color: "bg-[#f2ece1]",
    borderColor: "border-[#ddd0b8]",
    hoverBorder: "hover:border-[#c0a878]",
  },
];

export default function D2DSelectorPage() {
  const router = useRouter();

  function handleSelect(d2dType: string) {
    router.push(`/questionnaire?d2d=${d2dType}`);
  }

  function handleNotSure() {
    router.push("/d2d-questionnaire");
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
            Step 1 of 2
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            What type of project is this?
          </h2>
          <p className="text-sm text-gray-500">
            This determines which design process stages to include.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {D2D_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`text-left px-5 py-5 rounded-xl border-2 transition-all ${opt.color} ${opt.borderColor} ${opt.hoverBorder}`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-base">
                  {opt.label}
                </p>
                <p className="text-sm text-gray-600">{opt.subtitle}</p>
              </div>
              <p className="text-sm text-gray-700 mb-1">{opt.description}</p>
              <p className="text-xs text-gray-500">{opt.example}</p>
            </button>
          ))}

          <button
            onClick={handleNotSure}
            className="text-left px-5 py-5 rounded-xl border-2 border-dashed border-gray-300 bg-white hover:border-gray-500 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <p className="font-semibold text-gray-900 text-base">
                I&apos;m not sure
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Answer 3 quick questions and we&apos;ll figure it out together.
            </p>
          </button>
        </div>

        <div className="flex justify-start">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>
    </main>
  );
}
