import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import testData from "../testData.json";

const PASS_MARK = testData.meta.scoring.pass_mark_percent;

export default function ResultDisplay({ score, total, missed = [], onRestart, onExit }) {
  const [showReview, setShowReview] = useState(false);
  const percent = total ? (score / total) * 100 : 0;
  const passed = percent >= PASS_MARK;

  const label =
    testData.meta.scoring.result_labels.find(
      (l) => percent >= l.min_percent && percent <= l.max_percent
    )?.label || "Result";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
          {passed ? "Pass" : "Keep practising"}
        </p>
        <h2 className={`mb-2 text-3xl font-bold ${passed ? "text-green-700" : "text-gray-900"}`}>
          {label}
        </h2>
        <p className="mb-1 text-lg text-gray-700 tabular-nums">
          {score} out of {total} correct ({percent.toFixed(0)}%)
        </p>
        <p className="mb-6 text-sm text-gray-500">The pass mark is {PASS_MARK}%.</p>

        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              passed ? "bg-green-600" : "bg-amber-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onRestart}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 cursor-pointer"
          >
            Practise again
          </button>
          <button
            onClick={onExit}
            className="rounded-lg border border-gray-300 px-5 py-2 text-gray-800 transition hover:bg-gray-50 cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Reviewing what you got wrong is the part that actually teaches. */}
      {missed.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setShowReview(!showReview)}
            aria-expanded={showReview}
            className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50 cursor-pointer"
          >
            <span className="font-semibold text-gray-900">
              Review the {missed.length} you missed
            </span>
            {showReview ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showReview && (
            <ul className="divide-y divide-gray-200 border-t border-gray-200">
              {missed.map((q) => {
                const correct = q.options.find((o) => o.key === q.answer);
                const given = q.options.find((o) => o.key === q.givenAnswer);

                return (
                  <li key={q.id} className="px-6 py-5">
                    <p className="mb-3 font-medium text-gray-900">{q.text}</p>

                    <div className="space-y-1.5 text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold text-green-700">Correct:</span>{" "}
                        {q.answer}. {correct?.text}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-semibold text-red-600">You answered:</span>{" "}
                        {given ? `${given.key}. ${given.text}` : "ran out of time"}
                      </p>
                    </div>

                    {q.explanation && (
                      <p className="mt-3 rounded border-l-2 border-blue-200 bg-blue-50/60 py-2 pl-3 text-sm leading-relaxed text-gray-700">
                        {q.explanation}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
