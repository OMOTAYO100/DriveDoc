import React from "react";
import { CATEGORIES } from "../utils/categoryMapping";
import { CheckCircle2, Circle } from "lucide-react";

export default function CategorySelection({ progress, selected, onToggle, onSelectAll, onStart }) {
  const totalQuestions = Object.values(progress).reduce((acc, curr) => acc + curr.total, 0);
  const totalSelected = selected.length === CATEGORIES.length ? "All" : selected.length;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="bg-white sticky top-0 z-10 p-4 border-b border-gray-200 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <div>
                 <h2 className="text-xl font-bold text-gray-900">Practise Revision Questions</h2>
                 <p className="text-sm text-gray-500">Select categories to start practicing</p>
            </div>
            <button
            onClick={onStart}
            disabled={selected.length === 0}
            className={`px-6 py-2 rounded-full font-bold transition ${selected.length > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
            CONTINUE
            </button>
        </div>
        
        {/* Header Row */}
        <div className="flex items-center text-sm font-semibold text-gray-900 mt-4 px-2">
            <div className="flex-1">Category</div>
            <div className="w-24 text-center">Progress</div>
            <div className="w-16 text-right">Selected</div>
        </div>
      </div>

      <div className="space-y-4 px-2">
        {/* All Categories Toggle */}
        <div 
            onClick={onSelectAll}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
        >
             <div className="flex items-center space-x-4 flex-1">
                <div className="p-2 bg-gray-100 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">All categories</h3>
                    <div className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
                        <span>Total Questions: {totalQuestions}</span>
                    </div>
                </div>
             </div>
             <div className="text-green-600">
                {selected.length === CATEGORIES.length ? <CheckCircle2 className="w-6 h-6 fill-green-100" /> : <Circle className="w-6 h-6 text-gray-300" />}
             </div>
        </div>

        {CATEGORIES.map((cat) => {
          const stats = progress[cat.label] || { total: 0, answered: 0, correct: 0 };
          const percent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
          const isSelected = selected.includes(cat.label);
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              onClick={() => onToggle(cat.label)}
              className={`relative flex items-center justify-between p-4 bg-white rounded-xl border transition cursor-pointer ${isSelected ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 hover:border-gray-300'}`}
            >
              {/* Left: Icon & Title */}
              <div className="flex items-center space-x-4 flex-1">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center pr-4">
                        <h3 className="font-bold text-gray-900">{cat.label}</h3>
                        <span className="font-bold text-sm text-gray-900">{percent}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 mb-1">
                        <div 
                            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-between text-xs text-orange-500 font-medium">
                        <span>Answered: {stats.answered}</span>
                        <span className="text-green-600">Correct: {stats.correct}</span>
                        <span className="text-gray-500">Total: {stats.total}</span>
                    </div>
                </div>
              </div>

              {/* Right: Checkbox */}
              <div className="pl-4">
                {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-100" />
                ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-20">
         <button
            onClick={onStart}
            disabled={selected.length === 0}
            className={`w-full max-w-md py-3 rounded-full font-bold text-lg shadow-lg transition transform active:scale-95 ${selected.length > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
         >
            CONTINUE
         </button>
      </div>
    </div>
  );
}
