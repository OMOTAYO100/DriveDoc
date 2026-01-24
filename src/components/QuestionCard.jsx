import React from "react";

export default function QuestionCard({ question, onAnswer }) {
  const [timeLeft, setTimeLeft] = React.useState(45);

  React.useEffect(() => {
    setTimeLeft(45);
  }, [question]);

  React.useEffect(() => {
    if (timeLeft === 0) {
      onAnswer(null); // Auto-advance with no answer
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 mr-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {question.text}
            </h3>
            {question.imageUrl && (
                <div className="mb-4">
                    <img 
                        src={question.imageUrl} 
                        alt="Question Reference" 
                        className="max-h-64 rounded-lg border border-gray-200 object-contain"
                    />
                </div>
            )}
        </div>
        <div className={`text-lg font-bold shrink-0 ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
          {timeLeft}s
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onAnswer(opt.key)}
            className="text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <span className="font-semibold mr-2">{opt.key}.</span>
            <span>{opt.text}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Time remaining for this question
      </div>
    </div>
  );
}
