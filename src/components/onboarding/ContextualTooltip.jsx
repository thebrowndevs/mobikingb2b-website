import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

export default function ContextualTooltip({ content, title = "Why we need this?" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-primary transition-colors cursor-pointer border-0 bg-transparent p-0 flex items-center"
      >
        <HelpCircle size={15} />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-xl p-3.5 shadow-xl leading-relaxed select-none border border-slate-800">
          <div className="font-bold text-slate-200 mb-1">{title}</div>
          <div className="font-medium text-slate-400">{content}</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
