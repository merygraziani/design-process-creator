import Link from "next/link";
import { ArrowRight, Layers, GitBranch, Ticket } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full mb-6">
          N26 Design Process
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Design Process Creator
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Answer 3 questions. Get a tailored process plan. Create Jira tickets
          in one click.
        </p>

        <Link
          href="/questionnaire"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Start <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[
          {
            icon: <Layers className="w-5 h-5" />,
            title: "3 States",
            desc: "Problem & Opportunity → Solution → Implementation",
          },
          {
            icon: <GitBranch className="w-5 h-5" />,
            title: "Tailored plan",
            desc: "Skip, parallel, or optional tasks based on your context",
          },
          {
            icon: <Ticket className="w-5 h-5" />,
            title: "Jira-ready",
            desc: "One click creates structured tickets in the UX board",
          },
        ].map((feat) => (
          <div
            key={feat.title}
            className="bg-gray-50 rounded-xl p-5 text-left"
          >
            <div className="text-gray-400 mb-3">{feat.icon}</div>
            <p className="font-semibold text-gray-900 text-sm mb-1">
              {feat.title}
            </p>
            <p className="text-xs text-gray-500">{feat.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
