import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import ResultDisplay from "./ResultDisplay";
import CategorySelection from "./CategorySelection";
import testData from "../testData.json";
import { getDisplayCategory, CATEGORIES } from "../utils/categoryMapping";

const PROGRESS_KEY = "theoryProgress.v2";
const QUESTIONS_PER_TEST = 50;

/**
 * The de-duplicated, category-mapped question bank. Built once at module load
 * (this module is behind a lazy import, so it isn't in the initial bundle)
 * rather than in a memo, so the first test can be set up during state
 * initialisation instead of in an effect.
 */
const QUESTIONS = (() => {
  const seenIds = new Set();
  const seenText = new Set();
  const unique = [];

  for (const q of testData.questions) {
    const cleanText = q.text.trim().toLowerCase();
    if (seenIds.has(q.id) || seenText.has(cleanText)) continue;
    seenIds.add(q.id);
    seenText.add(cleanText);
    unique.push({ ...q, displayCategory: getDisplayCategory(q.category) });
  }
  return unique;
})();

const TOTALS_BY_CATEGORY = CATEGORIES.reduce((totals, cat) => {
  totals[cat.label] = QUESTIONS.filter((q) => q.displayCategory === cat.label).length;
  return totals;
}, {});

const pickQuestions = (pool) => {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(QUESTIONS_PER_TEST, shuffled.length));
};

/**
 * Per-question results, keyed by question id:
 *   { [id]: { correct: boolean, category: string } }
 *
 * The previous shape kept running answered/correct counters per category which
 * only ever grew — a category could report "Answered: 180 / Total: 50". Keying
 * on the question means re-answering updates in place, so a count can never
 * exceed the number of questions that exist.
 */
const loadProgress = () => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to parse saved progress", e);
    return {};
  }
};

export default function TestContainer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // /practice?category=Road%20and%20traffic%20signs starts that category
  // directly; /practice alone opens the category picker.
  const initialCategory = searchParams.get("category");
  const onExit = () => navigate("/dashboard");

  // A category chosen on the dashboard starts its test immediately, decided
  // here rather than in an effect that would setState during the first render.
  const [activeQuestions, setActiveQuestions] = useState(() =>
    initialCategory ? pickQuestions(QUESTIONS.filter((q) => q.displayCategory === initialCategory)) : []
  );
  const [view, setView] = useState(() => (initialCategory && activeQuestionsExist(initialCategory) ? "test" : "selection"));
  const [selectedCategories, setSelectedCategories] = useState(() =>
    initialCategory && !activeQuestionsExist(initialCategory) ? [initialCategory] : []
  );

  const [results, setResults] = useState(loadProgress);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]);

  // Displayed progress is derived from the per-question results, so it's
  // always consistent with what has actually been answered.
  const progress = useMemo(() => {
    const out = {};
    for (const cat of CATEGORIES) {
      out[cat.label] = { total: TOTALS_BY_CATEGORY[cat.label] || 0, answered: 0, correct: 0 };
    }
    for (const { category, correct } of Object.values(results)) {
      const row = out[category];
      if (!row) continue;
      row.answered += 1;
      if (correct) row.correct += 1;
    }
    return out;
  }, [results]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(results));
  }, [results]);

  const startTest = (pool) => {
    if (!pool.length) return;
    setActiveQuestions(pickQuestions(pool));
    setCurrent(0);
    setScore(0);
    setMissed([]);
    setView("test");
  };

  const toggleCategory = (label) =>
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const toggleAll = () =>
    setSelectedCategories((prev) =>
      prev.length === CATEGORIES.length ? [] : CATEGORIES.map((c) => c.label)
    );

  const startManualTest = () =>
    startTest(QUESTIONS.filter((q) => selectedCategories.includes(q.displayCategory)));

  const handleAnswer = (key) => {
    const question = activeQuestions[current];
    const isCorrect = key !== null && key === question.answer;

    if (isCorrect) setScore((s) => s + 1);
    else setMissed((m) => [...m, { ...question, givenAnswer: key }]);

    setResults((prev) => ({
      ...prev,
      [question.id]: { correct: isCorrect, category: question.displayCategory },
    }));

    if (current >= activeQuestions.length - 1) setView("result");
    else setCurrent((c) => c + 1);
  };

  const resetProgress = () => {
    if (!window.confirm("Clear your practice history for every category?")) return;
    setResults({});
  };

  if (view === "selection") {
    return (
      <>
        <div className="mb-4">
          <button
            onClick={onExit}
            className="flex items-center font-medium text-gray-500 transition hover:text-gray-700 cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>
        <CategorySelection
          progress={progress}
          selected={selectedCategories}
          onToggle={toggleCategory}
          onSelectAll={toggleAll}
          onStart={startManualTest}
          onResetProgress={resetProgress}
        />
      </>
    );
  }

  if (view === "result") {
    return (
      <ResultDisplay
        score={score}
        total={activeQuestions.length}
        missed={missed}
        onRestart={() => setView("selection")}
        onExit={onExit}
      />
    );
  }

  if (!activeQuestions.length) {
    return <div className="py-12 text-center text-gray-500">Loading questions…</div>;
  }

  const question = activeQuestions[current];
  const pct = Math.round((current / activeQuestions.length) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0 text-sm text-gray-600">
          Question {current + 1} of {activeQuestions.length}
          <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
            {question.displayCategory}
          </span>
        </div>
        <button
          onClick={() => setView("selection")}
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-gray-800 transition hover:bg-gray-50 cursor-pointer"
        >
          Exit Test
        </button>
      </div>

      <div
        className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={activeQuestions.length}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Keying on the question id remounts the card, which resets its timer
          and selection without an effect that calls setState. */}
      <QuestionCard key={question.id} question={question} onAnswer={handleAnswer} />
    </div>
  );
}

function activeQuestionsExist(category) {
  return QUESTIONS.some((q) => q.displayCategory === category);
}
