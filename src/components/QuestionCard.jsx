import { useState, useEffect, useMemo, useRef } from "react";
import { CheckCircle2, XCircle, ImageOff } from "lucide-react";

const QUESTION_SECONDS = 45;

export default function QuestionCard({ question, onAnswer }) {
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [selected, setSelected] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);
  // Guards against answering twice — by clicking as the timer hits zero, or
  // from React's double-invoked effects in StrictMode.
  const answeredRef = useRef(false);

  // De-duplicate option text, but never drop the correct answer: if the
  // correct key would be filtered out, keep that copy and drop the other.
  const options = useMemo(() => {
    const seen = new Map();
    for (const opt of question.options) {
      const key = opt.text.trim().toLowerCase();
      const existing = seen.get(key);
      if (!existing || opt.key === question.answer) seen.set(key, opt);
    }
    return [...seen.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [question]);

  useEffect(() => {
    // Freeze the clock once answered, while the explanation is on screen.
    if (selected !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!answeredRef.current) {
            answeredRef.current = true;
            setSelected("timeout");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selected]);

  const choose = (key) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setSelected(key);
  };

  const timedOut = selected === "timeout";
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && !timedOut && selected === question.answer;
  const correctText = options.find((o) => o.key === question.answer)?.text;

  const optionClass = (key) => {
    const base =
      "text-left px-4 py-3 border rounded-lg transition flex items-start gap-2 w-full";
    if (!isAnswered) {
      return `${base} border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer`;
    }
    if (key === question.answer) return `${base} border-green-500 bg-green-50 text-green-900`;
    if (key === selected) return `${base} border-red-500 bg-red-50 text-red-900`;
    return `${base} border-gray-200 text-gray-400`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="mb-3 text-xl font-semibold text-gray-900">{question.text}</h3>

          {question.imageUrl && !imageFailed && (
            <div className="mb-4">
              <img
                src={question.imageUrl}
                alt="Road sign or situation referenced by this question"
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="max-h-64 rounded-lg border border-gray-200 object-contain"
              />
            </div>
          )}

          {question.imageUrl && imageFailed && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
              <ImageOff className="h-4 w-4 shrink-0" aria-hidden="true" />
              The image for this question couldn't be loaded.
            </div>
          )}
        </div>

        <div
          className={`shrink-0 text-lg font-bold tabular-nums ${
            isAnswered ? "text-gray-300" : timeLeft <= 10 ? "text-red-600" : "text-blue-600"
          }`}
          aria-label={`${timeLeft} seconds remaining`}
        >
          {timeLeft}s
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => choose(opt.key)}
            disabled={isAnswered}
            className={optionClass(opt.key)}
          >
            <span className="font-semibold">{opt.key}.</span>
            <span className="flex-1">{opt.text}</span>
            {isAnswered && opt.key === question.answer && (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
            )}
            {isAnswered && opt.key === selected && opt.key !== question.answer && (
              <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {/* The explanation was already in the data for all 1,090 questions and
          had never been shown. Without it a wrong answer teaches nothing. */}
      {isAnswered && (
        <div
          className={`mt-5 rounded-lg border p-4 ${
            isCorrect ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className={`mb-1 font-semibold ${isCorrect ? "text-green-900" : "text-amber-900"}`}>
            {isCorrect ? "Correct" : timedOut ? "Time's up" : "Not quite"}
          </p>
          {!isCorrect && (
            <p className="mb-2 text-sm text-gray-700">
              The answer is <span className="font-semibold">{question.answer}</span>
              {correctText ? ` — ${correctText}` : ""}.
            </p>
          )}
          {question.explanation && (
            <p className="text-sm leading-relaxed text-gray-700">{question.explanation}</p>
          )}

          <button
            onClick={() => onAnswer(timedOut ? null : selected)}
            autoFocus
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 cursor-pointer"
          >
            Next question
          </button>
        </div>
      )}
    </div>
  );
}
