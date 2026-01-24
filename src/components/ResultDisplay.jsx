import React from "react";
import testData from "../testData.json";

export default function ResultDisplay({ score, total, onRestart, onExit }) {
  const percent = total ? (score / total) * 100 : 0;
  const label =
    testData.meta.scoring.result_labels.find(
      (l) => percent >= l.min_percent && percent <= l.max_percent
    )?.label || "Result";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{label}</h2>
      <p className="text-gray-700 mb-6">
        Score: {score}/{total} ({percent.toFixed(1)}%)
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retake Test
        </button>
        <button
          onClick={onExit}
          className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
