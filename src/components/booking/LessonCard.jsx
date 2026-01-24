import React from "react";
import { Check } from "lucide-react";

export default function LessonCard({ type, description, duration, price, features, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${
        selected
          ? "border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500"
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
      }`}
    >
      {selected && (
        <div className="absolute top-4 right-4 text-blue-500">
          <Check className="w-6 h-6" />
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{type}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-3xl font-extrabold text-blue-600">${price}</span>
        <span className="text-gray-500">/ {duration}</span>
      </div>

      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-gray-600 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-400 mr-3 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
