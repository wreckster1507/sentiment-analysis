"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text to clipboard");
    }
  };

  return (
    <button
      className={`
        group relative flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200
        ${copied 
          ? "border-green-200 bg-green-50 text-green-600" 
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
        }
      `}
      onClick={handleCopy}
    >
      {copied ? (
        <FiCheck className="h-4 w-4" />
      ) : (
        <FiCopy className="h-4 w-4" />
      )}
      
      {/* Tooltip */}
      <span className={`
        absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs 
        bg-slate-900 text-white rounded opacity-0 pointer-events-none transition-opacity
        group-hover:opacity-100
      `}>
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}

export default CopyButton;