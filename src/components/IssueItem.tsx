import React, { useState } from 'react';
import { Issue, Severity } from '../types';
import { Sparkles, Trash2, Check, RefreshCw } from 'lucide-react';

interface IssueItemProps {
  key?: React.Key | string;
  issue: Issue;
  categoryName: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedDescription: string) => void;
  hasGemini: boolean;
}

export function IssueItem({ issue, categoryName, onDelete, onUpdate, hasGemini }: IssueItemProps) {
  const [isSharpening, setIsSharpening] = useState(false);
  const [justSharpened, setJustSharpened] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSeverityBadgeClass = (severity: Severity) => {
    switch (severity) {
      case 'P1':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'P2':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Suggestion':
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleSharpen = async () => {
    if (!issue.description.trim()) return;
    setIsSharpening(true);
    setError(null);

    try {
      const res = await fetch('/api/sharpen-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: issue.description,
          category: categoryName,
          severity: issue.severity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sharpen language');
      }

      if (data.sharpened) {
        onUpdate(issue.id, data.sharpened);
        setJustSharpened(true);
        setTimeout(() => setJustSharpened(false), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setIsSharpening(false);
    }
  };

  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-lg border border-gray-150 bg-white shadow-xs hover:shadow-sm hover:border-gray-250 transition-all duration-150">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${getSeverityBadgeClass(issue.severity)}`}>
            {issue.severity}
          </span>
          <span className="text-[10px] font-mono text-gray-400 select-none">
            ID: #{issue.id}
          </span>
        </div>
        <p className="text-sm font-sans text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
          {issue.description}
        </p>

        {error && (
          <p className="text-xs font-mono text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center sm:self-center gap-1 w-full sm:w-auto justify-end sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
        {hasGemini && (
          <button
            onClick={handleSharpen}
            disabled={isSharpening}
            type="button"
            className={`inline-flex items-center justify-center p-2 rounded-md border text-xs font-medium cursor-pointer transition-colors duration-150 ${
              justSharpened
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200'
            }`}
            title="Sharpen feedback description with Gemini AI"
          >
            {isSharpening ? (
              <RefreshCw className="size-4 animate-spin text-indigo-500" />
            ) : justSharpened ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Sparkles className="size-4" />
            )}
            <span className="sr-only">Sharpen with AI</span>
          </button>
        )}

        <button
          onClick={() => onDelete(issue.id)}
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md border border-gray-100 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors duration-150 cursor-pointer"
          title="Delete Issue"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete</span>
        </button>
      </div>
    </div>
  );
}
