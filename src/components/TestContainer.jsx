import React, { useState, useEffect, useMemo } from "react";
import QuestionCard from "./QuestionCard";
import ResultDisplay from "./ResultDisplay";
import CategorySelection from "./CategorySelection";
import testData from "../testData.json";
import { getDisplayCategory, CATEGORIES } from "../utils/categoryMapping";

export default function TestContainer({ onExit }) {
  const [view, setView] = useState("selection"); // 'selection', 'test', 'result'
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Progress State: { "Category Name": { total: 0, answered: 0, correct: 0 } }
  const [progress, setProgress] = useState({});

  // Questions State
  const [mappedQuestions, setMappedQuestions] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  // Initialize Data
  useEffect(() => {
    // 1. Map all questions to new categories
    const allMapped = testData.questions.map(q => ({
      ...q,
      displayCategory: getDisplayCategory(q.category)
    }));
    setMappedQuestions(allMapped);

    // 2. Load progress from localStorage
    const savedProgress = localStorage.getItem("theoryProgress");
    let initialProgress = {};

    if (savedProgress) {
        initialProgress = JSON.parse(savedProgress);
    }

    // 3. Ensure all categories exist in progress and update totals
    const newProgress = { ...initialProgress };
    CATEGORIES.forEach(cat => {
        if (!newProgress[cat.label]) {
            newProgress[cat.label] = { total: 0, answered: 0, correct: 0 };
        }
        // Recalculate total based on current data (in case data changed)
        newProgress[cat.label].total = allMapped.filter(q => q.displayCategory === cat.label).length;
    });

    setProgress(newProgress);
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
        localStorage.setItem("theoryProgress", JSON.stringify(progress));
    }
  }, [progress]);

  const toggleCategory = (label) => {
    setSelectedCategories(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const toggleAll = () => {
    if (selectedCategories.length === CATEGORIES.length) {
        setSelectedCategories([]);
    } else {
        setSelectedCategories(CATEGORIES.map(c => c.label));
    }
  };

  const startTest = () => {
    const pool = mappedQuestions.filter(q => selectedCategories.includes(q.displayCategory));
    
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Limit to 50 or length
    const count = Math.min(50, pool.length);
    setActiveQuestions(pool.slice(0, count));
    setCurrent(0);
    setScore(0);
    setView("test");
  };

  const handleAnswer = (key) => {
    const question = activeQuestions[current];
    const isCorrect = key === question.answer;

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Update Progress
    if (key !== null) { // Only count if actually answered (not timed out maybe? or user skipped? logic depends. Assuming timed out counts as wrong answer but 'answered')
        // Ideally we track answered unique questions, but for now just simple counters
        // To avoid double counting re-takes in the same session, we'd need complex logic.
        // For this simple implementation, we just increment.
        setProgress(prev => {
            const cat = question.displayCategory;
            return {
                ...prev,
                [cat]: {
                    ...prev[cat],
                    answered: (prev[cat]?.answered || 0) + 1,
                    correct: (prev[cat]?.correct || 0) + (isCorrect ? 1 : 0)
                }
            };
        });
    }

    // Next
    if (current >= activeQuestions.length - 1) {
      setView("result");
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const restart = () => {
    setView("selection");
  };

  if (view === "selection") {
    return (
        <React.Fragment>
             <div className="mb-4">
                 <button onClick={onExit} className="text-gray-500 hover:text-gray-700 font-medium flex items-center">
                    &larr; Back to Dashboard
                 </button>
             </div>
             <CategorySelection 
                progress={progress}
                selected={selectedCategories}
                onToggle={toggleCategory}
                onSelectAll={toggleAll}
                onStart={startTest}
             />
        </React.Fragment>
    );
  }

  if (view === "result") {
      return (
        <ResultDisplay
          score={score}
          total={activeQuestions.length}
          onRestart={restart}
          onExit={onExit}
        />
      );
  }

  // Test View
  if (!activeQuestions.length) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Question {current + 1} of {activeQuestions.length}
          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-500">
            {activeQuestions[current].displayCategory}
          </span>
        </div>
        <button
          onClick={() => setView("selection")}
          className="px-3 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition"
        >
          Exit Test
        </button>
      </div>
      
      <QuestionCard 
        question={activeQuestions[current]} 
        onAnswer={handleAnswer} 
      />
    </div>
  );
}
