import React, { useState } from 'react';
import { Layers, Link2, Sparkles, ArrowRight, History, FilePlus, ChevronRight } from 'lucide-react';
import { QAReport } from '../types';

interface OnboardingScreenProps {
  savedReports: QAReport[];
  onStartNewReport: (name: string, figmaUrl: string, liveUrl: string) => void;
  onResumeReport: (id: string) => void;
  hasGemini: boolean;
}

export function OnboardingScreen({
  savedReports,
  onStartNewReport,
  onResumeReport,
  hasGemini
}: OnboardingScreenProps) {
  const [name, setName] = useState('');
  const [figma, setFigma] = useState('');
  const [staging, setStaging] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a component name to begin.');
      return;
    }
    setError('');
    onStartNewReport(name.trim(), figma.trim(), staging.trim());
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Brand visual column */}
        <div className="md:w-5/12 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 to-slate-900 z-0"></div>
          
          {/* Ambient light streak */}
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-indigo-500/10 rounded-full blur-3xl transform rotate-12 pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-650/40">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-extrabold tracking-tight font-display text-white">
                Fidelity QA
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans font-medium">
                Verify and log discrepancies between Figma specs and live staging implementations.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                Verification Engine
              </div>
              <p className="text-[11px] text-slate-350 leading-relaxed font-medium">
                Evaluate against high-standards visual alignment, state changes, and content stress-tests.
              </p>
            </div>

            {hasGemini && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-bold text-indigo-300 font-mono">
                <Sparkles className="size-3 text-indigo-400 animate-pulse" />
                Gemini Copilot Live
              </div>
            )}
          </div>
        </div>

        {/* Input form column */}
        <div className="md:w-7/12 p-8 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-2">
                <FilePlus className="size-5 text-indigo-600" />
                Start Component Audit
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter target specifications to generate a tailored validation checklist.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Component Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Layers className="size-3.5 text-slate-400" />
                  Component Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Navigation Drawer, Checkout Button"
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Figma Link */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Link2 className="size-3.5 text-slate-400" />
                  Figma Specification Link
                </label>
                <input
                  type="url"
                  value={figma}
                  onChange={(e) => setFigma(e.target.value)}
                  placeholder="https://www.figma.com/file/..."
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Staging URL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Link2 className="size-3.5 text-slate-400" />
                  Staging / Live Component URL
                </label>
                <input
                  type="url"
                  value={staging}
                  onChange={(e) => setStaging(e.target.value)}
                  placeholder="https://staging.app.io/component/..."
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all duration-150 cursor-pointer"
              >
                Generate Report
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          {/* Saved Reports option */}
          {savedReports.length > 0 && (
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <History className="size-3.5 text-slate-400" />
                Or resume recent audit board
              </label>
              
              <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 scrollbar select-none">
                {savedReports.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onResumeReport(r.id)}
                    type="button"
                    className="w-full flex items-center justify-between text-left p-2.5 rounded-lg border border-slate-150 bg-slate-50/50 hover:bg-slate-50 text-slate-700 hover:text-indigo-650 transition-all text-xs font-semibold cursor-pointer group"
                  >
                    <span className="truncate max-w-[170px]">
                      {r.componentName || 'Untitled Component'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal font-mono flex items-center gap-1">
                      {r.date}
                      <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5 text-slate-350" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
