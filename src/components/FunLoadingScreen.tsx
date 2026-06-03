import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Sparkles, CheckCircle2, ShieldCheck, Cpu, Code, HelpCircle } from 'lucide-react';

interface FunLoadingScreenProps {
  componentName: string;
  onFinished: () => void;
}

interface VerificationStep {
  id: number;
  label: string;
  subtext: string;
  minProgress: number;
  icon: React.ReactNode;
}

export function FunLoadingScreen({ componentName, onFinished }: FunLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: VerificationStep[] = [
    {
      id: 1,
      label: "Map Visual Viewport Grids",
      subtext: "Establishing baseline spatial layout and padding ratios...",
      minProgress: 0,
      icon: <Layers className="size-4 text-indigo-505" />
    },
    {
      id: 2,
      label: "Compare Figma Design Tokens",
      subtext: "Matching colors, typography weight, and shadow variables...",
      minProgress: 24,
      icon: <Sparkles className="size-4 text-amber-500" />
    },
    {
      id: 3,
      label: "Test Responsive Permutations",
      subtext: "Simulating mobile, tablet, and desktop viewport boundaries...",
      minProgress: 48,
      icon: <Cpu className="size-4 text-emerald-500" />
    },
    {
      id: 4,
      label: "Verify Interactive Click Targets",
      subtext: "Ensuring 44px boundaries on buttons and clickable states...",
      minProgress: 72,
      icon: <Code className="size-4 text-pink-500" />
    },
    {
      id: 5,
      label: "Assemble Verified Rubric Checklist",
      subtext: "Synthesizing custom 6-category high-fidelity QA boards...",
      minProgress: 90,
      icon: <ShieldCheck className="size-4 text-blue-500" />
    }
  ];

  useEffect(() => {
    // Fast but organic feeling progress simulation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random step progression
        const increment = Math.floor(Math.random() * 4) + 2; 
        const nextValue = Math.min(prev + increment, 100);
        return nextValue;
      });
    }, 70);

    return () => clearInterval(timer);
  }, []);

  // Update active step list based on progress
  useEffect(() => {
    const matchingStepIndex = steps.reduce((accIndex, step, index) => {
      if (progress >= step.minProgress) {
        return index;
      }
      return accIndex;
    }, 0);
    setActiveStepIndex(matchingStepIndex);

    if (progress === 100) {
      const waitTimer = setTimeout(() => {
        onFinished();
      }, 500); // Small, pleasant feedback delay at 100%
      return () => clearTimeout(waitTimer);
    }
  }, [progress, onFinished]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50/50">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-8 relative overflow-hidden select-none">
        
        {/* Dynamic backdrop laser grid scanning effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 z-0"></div>
        
        {/* Animated laser scan line */}
        <div className="absolute left-0 right-0 h-0.5 bg-indigo-500/20 top-0 shadow-lg shadow-indigo-500/50 animate-bounce pointer-events-none z-10" style={{ animationDuration: '4s' }}></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Animated Tech/Audit Avatar */}
          <div className="relative size-20 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-2xl bg-indigo-550/10 border-2 border-indigo-600/30 animate-pulse"></div>
            {/* Outer spinning dash layer */}
            <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="36"
                className="stroke-indigo-600 fill-none"
                strokeWidth="2.5"
                strokeDasharray="226"
                strokeDashoffset={226 - (226 * progress) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 100ms ease-out' }}
              />
            </svg>
            <div className="size-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 text-white font-mono text-sm font-bold">
              {progress}%
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5 mb-8">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono">
              Analyzing Design Integrity
            </span>
            <h2 className="text-xl font-extrabold text-slate-950 font-display tracking-tight truncate max-w-[340px]">
              {componentName || "Component Specs"}
            </h2>
          </div>

          {/* Main active status card with custom transitions */}
          <div className="w-full bg-slate-50 border border-slate-150/80 rounded-xl p-4.5 min-h-[96px] text-left mb-6 flex items-start gap-3.5 shadow-inner">
            <div className="p-2 rounded-lg bg-white border border-slate-200/90 shadow-sm shrink-0">
              {steps[activeStepIndex].icon}
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
              <div className="text-xs font-bold text-slate-800 tracking-tight flex items-center justify-between">
                <span>{steps[activeStepIndex].label}</span>
                <span className="text-[9px] font-mono text-indigo-500 bg-indigo-50/70 border border-indigo-100/40 px-1.5 py-0.5 rounded">
                  STAGE {activeStepIndex + 1}/5
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                {steps[activeStepIndex].subtext}
              </p>
            </div>
          </div>

          {/* Verification steps status list */}
          <div className="w-full space-y-2 mb-8 text-left border-t border-slate-100 pt-5">
            {steps.map((st, idx) => {
              const isChecked = progress > st.minProgress && idx < activeStepIndex;
              const isActive = idx === activeStepIndex;
              
              return (
                <div 
                  key={st.id} 
                  className={`flex items-center justify-between text-xs transition-colors duration-200 ${
                    isChecked ? 'text-emerald-650' : isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isChecked ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 animate-in zoom-in-75 duration-300" />
                    ) : (
                      <div className={`size-4 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${
                        isActive ? 'border-indigo-500 bg-indigo-50 text-indigo-600 animate-pulse font-bold' : 'border-slate-200 bg-slate-50'
                      }`}>
                        {st.id}
                      </div>
                    )}
                    <span className="truncate max-w-[280px]">{st.label}</span>
                  </span>
                  <span className="text-[10px] font-mono">
                    {isChecked ? (
                      <span className="font-bold text-emerald-600">Passed</span>
                    ) : isActive ? (
                      <span className="text-indigo-600 font-bold animate-pulse">Running...</span>
                    ) : (
                      <span className="text-slate-350">Pending</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Symmetrical footer detail to ensure extreme typographic craft */}
          <div className="w-full bg-slate-100/50 rounded-lg py-2 px-3 text-[10px] text-slate-400 font-medium flex items-center justify-center gap-2 font-mono">
            <span>Fidelity Verification Framework v2.4</span>
            <span className="text-slate-300">•</span>
            <span>Real-time Grid Analysis</span>
          </div>

        </div>
      </div>
    </div>
  );
}
