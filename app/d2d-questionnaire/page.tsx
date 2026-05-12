"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QUESTIONS, Answers, resolveD2DType } from "@/lib/questionnaire";
import { QuestionStep } from "@/components/QuestionStep";

export default function D2DQuestionnairePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const currentQuestion = QUESTIONS[currentStep];
  const selectedValue = answers[currentQuestion.id];
  const isLast = currentStep === QUESTIONS.length - 1;

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function handleNext() {
    if (!selectedValue) return;
    if (isLast) {
      const d2dType = resolveD2DType(answers);
      router.push(`/questionnaire?d2d=${d2dType}`);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep === 0) {
      router.push("/d2d-selector");
    } else {
      setCurrentStep((s) => s - 1);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl flex flex-col gap-8">
        <QuestionStep
          question={currentQuestion}
          stepNumber={currentStep + 1}
          totalSteps={QUESTIONS.length}
          selectedValue={selectedValue}
          onSelect={handleSelect}
        />

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedValue}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLast ? "See my process type" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
