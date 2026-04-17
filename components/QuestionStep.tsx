"use client";

import clsx from "clsx";
import { Question } from "@/lib/questionnaire";

type Props = {
  question: Question;
  stepNumber: number;
  totalSteps: number;
  selectedValue?: string;
  onSelect: (value: string) => void;
};

export function QuestionStep({
  question,
  stepNumber,
  totalSteps,
  selectedValue,
  onSelect,
}: Props) {
  return (
    <div className="w-full max-w-xl">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
        Step {stepNumber} of {totalSteps}
      </p>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {question.text}
      </h2>
      <div className="flex flex-col gap-3">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={clsx(
              "text-left px-5 py-4 rounded-xl border-2 transition-all",
              selectedValue === opt.value
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-400"
            )}
          >
            <p className="font-medium text-gray-900">{opt.label}</p>
            {opt.hint && (
              <p className="text-sm text-gray-500 mt-0.5">{opt.hint}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
