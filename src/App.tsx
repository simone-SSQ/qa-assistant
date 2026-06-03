import React, { useState, useEffect } from 'react';
import { QAReport, Issue, Severity, CATEGORIES_LIST, CategoryStatus, CategoryReview } from './types';
import { CATEGORY_PRESETS, PresetIssue } from './constants/presets';
import { ReportHeaderForm } from './components/ReportHeaderForm';
import { IssueItem } from './components/IssueItem';
import { ReportOutputView } from './components/ReportOutputView';
import { OnboardingScreen } from './components/OnboardingScreen';
import { FunLoadingScreen } from './components/FunLoadingScreen';
import {
  Layers,
  FileCheck,
  Plus,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Wand2,
  BookmarkCheck,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'component-qa-reports-v1';

function createNewReportInstance(): QAReport {
  return {
    id: `report_${Date.now()}`,
    componentName: '',
    figmaUrl: '',
    liveUrl: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    categories: {
      visual: { id: 'visual', name: 'Visual verification', status: 'not_reviewed', issues: [] },
      states: { id: 'states', name: 'States & variations', status: 'not_reviewed', issues: [] },
      responsive: { id: 'responsive', name: 'Responsive check', status: 'not_reviewed', issues: [] },
      content: { id: 'content', name: 'Content resilience', status: 'not_reviewed', issues: [] },
      accessibility: { id: 'accessibility', name: 'Accessibility check', status: 'not_reviewed', issues: [] },
      composability: { id: 'composability', name: 'Composability', status: 'not_reviewed', issues: [] }
    }
  };
}

export default function App() {
  const [report, setReport] = useState<QAReport>(createNewReportInstance());
  const [savedReports, setSavedReports] = useState<QAReport[]>([]);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingReportData, setPendingReportData] = useState<{ id?: string; name: string; figmaUrl: string; liveUrl: string } | null>(null);
  const [automatedReportResult, setAutomatedReportResult] = useState<any | null>(null);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);
  const [hasGemini, setHasGemini] = useState(false);
  const [checkingGemini, setCheckingGemini] = useState(true);

  // Accordion state for categories input tracking
  const [expandedCategory, setExpandedCategory] = useState<string>('visual');

  // Input states per category
  const [draftInputs, setDraftInputs] = useState<Record<string, { severity: Severity; description: string }>>({
    visual: { severity: 'P2', description: '' },
    states: { severity: 'P2', description: '' },
    responsive: { severity: 'P2', description: '' },
    content: { severity: 'P2', description: '' },
    accessibility: { severity: 'P2', description: '' },
    composability: { severity: 'P2', description: '' }
  });

  // AI loading indicators
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Success notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Seed initial values on first boot if no reports exist
  useEffect(() => {
    // Check `/api/health` to confirm Gemini capabilities
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasGemini(!!data.hasGeminiKey);
      })
      .catch(() => {
        setHasGemini(false);
      })
      .finally(() => {
        setCheckingGemini(false);
      });

    // Load from local storage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as QAReport[];
        if (parsed.length > 0) {
          setSavedReports(parsed);
          setReport(parsed[0]);
        } else {
          seedInitialReport();
        }
      } catch (e) {
        seedInitialReport();
      }
    } else {
      seedInitialReport();
    }
  }, []);

  const seedInitialReport = () => {
    const defaultR = createNewReportInstance();
    defaultR.componentName = 'Primary Button';
    defaultR.figmaUrl = 'https://www.figma.com/design/sample-figma-file';
    defaultR.liveUrl = 'https://ais-dev-preview.run.app';
    defaultR.summary = 'The button matches general alignment specs but fails basic accessiblity contrast and focus-ring states.';

    // Seed visual issue
    defaultR.categories.visual.status = 'issues';
    defaultR.categories.visual.issues = [
      { id: '1', severity: 'P2', description: 'Corner radius does not match specifications (appears to be 4px, should be 8px).' },
    ];

    // Seed states issue
    defaultR.categories.states.status = 'issues';
    defaultR.categories.states.issues = [
      { id: '2', severity: 'P2', description: 'Interactive active press state is missing scale feedback.' },
      { id: '3', severity: 'P1', description: 'Disabled state remains elements focusable and submits forms on press.' }
    ];

    // Seed accessibility check
    defaultR.categories.accessibility.status = 'issues';
    defaultR.categories.accessibility.issues = [
      { id: '4', severity: 'P1', description: 'Active hover focus-ring is invisible against dark slate grids (ratio 1.2:1).' }
    ];

    const seededList = [defaultR];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seededList));
    setSavedReports(seededList);
    setReport(defaultR);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateReportMeta = (updated: Partial<QAReport>) => {
    const updatedReport = { ...report, ...updated };
    setReport(updatedReport);
    updateSavedReportsInMemory(updatedReport);
  };

  const updateSavedReportsInMemory = (current: QAReport) => {
    const currentList = [...savedReports];
    const index = currentList.findIndex((r) => r.id === current.id);
    if (index >= 0) {
      currentList[index] = current;
    } else {
      currentList.push(current);
    }
    setSavedReports(currentList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentList));
  };

  // Actions for Category reviews
  const handleCategoryStatusChange = (catId: keyof QAReport['categories'], status: CategoryStatus) => {
    const updated = { ...report };
    updated.categories[catId].status = status;

    // Reset issues if not reviewed or cleared
    if (status !== 'issues') {
      updated.categories[catId].issues = [];
    }

    setReport(updated);
    updateSavedReportsInMemory(updated);
  };

  const handleAddIssue = (catId: keyof QAReport['categories']) => {
    const draft = draftInputs[catId];
    if (!draft.description.trim()) return;

    const newIssue: Issue = {
      id: Math.random().toString(36).substr(2, 6),
      severity: draft.severity,
      description: draft.description.trim(),
    };

    const updated = { ...report };
    updated.categories[catId].issues.push(newIssue);
    updated.categories[catId].status = 'issues';

    setReport(updated);
    updateSavedReportsInMemory(updated);

    // Reset input description
    setDraftInputs({
      ...draftInputs,
      [catId]: { ...draft, description: '' },
    });
  };

  const handleUpdateIssue = (catId: keyof QAReport['categories'], issueId: string, text: string) => {
    const updated = { ...report };
    const issueIndex = updated.categories[catId].issues.findIndex((i) => i.id === issueId);
    if (issueIndex >= 0) {
      updated.categories[catId].issues[issueIndex].description = text;
      setReport(updated);
      updateSavedReportsInMemory(updated);
    }
  };

  const handleDeleteIssue = (catId: keyof QAReport['categories'], issueId: string) => {
    const updated = { ...report };
    updated.categories[catId].issues = updated.categories[catId].issues.filter((i) => i.id !== issueId);

    // If zero issues left, revert status back or keep as issues
    if (updated.categories[catId].issues.length === 0) {
      updated.categories[catId].status = 'no_issues';
    }

    setReport(updated);
    updateSavedReportsInMemory(updated);
  };

  const handleInjectPreset = (catId: string, preset: PresetIssue) => {
    setDraftInputs({
      ...draftInputs,
      [catId]: { severity: preset.severity, description: preset.description }
    });
  };

  // Switch Reports
  const handleLoadReport = (id: string) => {
    const selected = savedReports.find((r) => r.id === id);
    if (selected) {
      setReport(selected);
    }
  };

  const handleNewReport = () => {
    setIsOnboarding(true);
  };

  const handleOnboardingNewReport = (name: string, figmaUrl: string, liveUrl: string) => {
    setPendingReportData({ name, figmaUrl, liveUrl });
    setAutomatedReportResult(null);
    setIsAnimationFinished(false);
    setIsGenerating(true);

    fetch('/api/generate-automated-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentName: name, figmaUrl, liveUrl })
    })
      .then((res) => res.json())
      .then((data) => {
        setAutomatedReportResult(data);
      })
      .catch((err) => {
        console.error('Error in automatic report pre-fetch:', err);
      });
  };

  const handleFinishedLoading = () => {
    setIsAnimationFinished(true);
  };

  // Synchronize loading animation + Gemini audit generation results
  useEffect(() => {
    if (isGenerating && isAnimationFinished) {
      if (pendingReportData?.id) {
        // Resuming an existing stored board
        const selected = savedReports.find((r) => r.id === pendingReportData.id);
        if (selected) {
          setReport(selected);
          setIsGenerating(false);
          setIsOnboarding(false);
          setPendingReportData(null);
          setIsAnimationFinished(false);
          setAutomatedReportResult(null);
          showNotification(`Resumed board: ${selected.componentName}`);
        }
      } else if (automatedReportResult) {
        // Build a brand-new high fidelity automated audit board
        const next = createNewReportInstance();
        next.componentName = pendingReportData?.name || '';
        next.figmaUrl = pendingReportData?.figmaUrl || '';
        next.liveUrl = pendingReportData?.liveUrl || '';
        next.summary = automatedReportResult.summary || `The custom design component "${next.componentName}" displays robust functional qualities with few opportunities for styling alignment enhancements.`;

        const apiCats = automatedReportResult.categories || {};
        
        Object.keys(next.categories).forEach((catKey) => {
          const apiCat = apiCats[catKey];
          if (apiCat) {
            const destCat = next.categories[catKey as keyof QAReport['categories']];
            destCat.status = apiCat.status || 'no_issues';
            
            // Map the issues and provide uniquely stable client keys
            const issuesArray = apiCat.issues || [];
            destCat.issues = issuesArray.map((issue: any, index: number) => ({
              id: `auto_${catKey}_${index}_${Math.random().toString(36).substr(2, 4)}`,
              severity: issue.severity || 'P2',
              description: issue.description || 'Discrepancy identified.'
            }));
          }
        });

        setReport(next);

        let updatedList = [...savedReports];
        updatedList = [next, ...updatedList];
        setSavedReports(updatedList);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

        setIsGenerating(false);
        setIsOnboarding(false);
        setPendingReportData(null);
        setAutomatedReportResult(null);
        setIsAnimationFinished(false);
        showNotification(`Automated audit complete: ${next.componentName}`);
      }
    }
  }, [isGenerating, isAnimationFinished, automatedReportResult, pendingReportData, savedReports]);

  const handleOnboardingResumeReport = (id: string) => {
    const selected = savedReports.find((r) => r.id === id);
    if (selected) {
      setPendingReportData({
        id: selected.id,
        name: selected.componentName,
        figmaUrl: selected.figmaUrl || '',
        liveUrl: selected.liveUrl || ''
      });
      setIsAnimationFinished(false);
      setAutomatedReportResult(null);
      setIsGenerating(true);
    }
  };

  const handleDeleteReport = (id: string) => {
    const remaining = savedReports.filter((r) => r.id !== id);
    setSavedReports(remaining);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining));

    if (remaining.length > 0) {
      setReport(remaining[0]);
    } else {
      seedInitialReport();
    }
    showNotification('Deleted report');
  };

  const handleSaveState = () => {
    updateSavedReportsInMemory(report);
    showNotification('All local report states saved successfully');
  };

  // Generate overall summary via AI
  const handleAISummarize = async () => {
    setIsSummarizing(true);
    setSummaryError(null);

    // Package review statuses
    const issuesData = (Object.values(report.categories) as any[]).map((cat) => ({
      name: cat.name,
      status: cat.status,
      issues: cat.issues.map((i: any) => `(${i.severity}) ${i.description}`)
    }));

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentName: report.componentName || 'Component Design System',
          categoriesList: issuesData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize summary.');
      }

      if (data.summary) {
        handleUpdateReportMeta({ summary: data.summary });
        showNotification('Summary generated by Gemini AI');
      }
    } catch (err: any) {
      setSummaryError(err.message || 'Error communicating with AI service');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Dynamic statistics
  const countP1 = (Object.values(report.categories) as CategoryReview[]).reduce(
    (acc: number, cat) => acc + (cat.issues || []).filter((i) => i.severity === 'P1').length,
    0
  );
  const countP2 = (Object.values(report.categories) as CategoryReview[]).reduce(
    (acc: number, cat) => acc + (cat.issues || []).filter((i) => i.severity === 'P2').length,
    0
  );
  const countSug = (Object.values(report.categories) as CategoryReview[]).reduce(
    (acc: number, cat) => acc + (cat.issues || []).filter((i) => i.severity === 'Suggestion').length,
    0
  );
  const totalIssues = countP1 + countP2 + countSug;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans text-sm flex flex-col selection:bg-indigo-150 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Absolute floating safe-alerts */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-medium text-xs rounded-lg px-4 py-2.5 shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <BookmarkCheck className="size-4 text-indigo-400 shrink-0" />
          {notification}
        </div>
      )}

      {/* Head navigation banner */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-650 rounded-xl flex items-center justify-center text-white shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-slate-900 font-display leading-tight flex items-center gap-1.5">
              Component QA Assistant
            </h1>
            <p className="text-[10px] md:text-[11px] font-sans font-semibold text-slate-500 leading-none mt-0.5">
              Design-to-Dev Fidelity Verification System
            </p>
          </div>
        </div>

        {/* Gemini status Indicator badge */}
        <div className="flex items-center gap-2">
          {checkingGemini ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold font-mono text-slate-400 border border-slate-200">
              <RefreshCw className="size-3 animate-spin text-slate-400" />
              Checking Engine
            </span>
          ) : hasGemini ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-[10px] font-extrabold font-mono text-indigo-700 border border-indigo-100 animate-pulse">
              <Sparkles className="size-3 text-indigo-500" />
              Gemini AI: Enabled
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-[10px] font-bold font-mono text-amber-750 border border-amber-100 cursor-help shadow-2xs"
              title="Add process.env.GEMINI_API_KEY inside of standard Secrets configuration to empower review sharpening."
            >
              <Info className="size-3 text-amber-500" />
              Gemini Offline (Local Mode)
            </span>
          )}
        </div>
      </nav>

      {isGenerating ? (
        <FunLoadingScreen
          componentName={pendingReportData?.name || ''}
          onFinished={handleFinishedLoading}
        />
      ) : isOnboarding ? (
        <OnboardingScreen
          savedReports={savedReports}
          onStartNewReport={handleOnboardingNewReport}
          onResumeReport={handleOnboardingResumeReport}
          hasGemini={hasGemini}
        />
      ) : (
        <>
          {/* Primary Workspace container */}
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left COLUMN: Sidebar overview data (3-cols) */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 flex flex-col space-y-6 shadow-sm">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 block font-mono">
              Active Component
            </label>
            <div className="p-3.5 bg-slate-50 border border-indigo-50 rounded-xl shadow-2xs transition-all">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight font-display">
                {report.componentName || 'Untitled Component'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {totalIssues > 0 ? `✗ ${totalIssues} issues logged` : '✓ Ready for dev'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block font-mono">
                Reference Links
              </label>
              <div className="space-y-2">
                {report.figmaUrl ? (
                  <a
                    href={report.figmaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs text-indigo-650 bg-indigo-50/30 hover:bg-indigo-50 border border-indigo-100/80 p-2.5 rounded-lg transition-all truncate font-semibold shadow-3xs"
                  >
                    <span className="truncate">Figma Specification ↗</span>
                  </a>
                ) : (
                  <div className="text-[10px] text-slate-400 bg-slate-50/50 p-2.5 rounded-lg border border-dashed border-slate-200 select-none italic font-mono flex items-center justify-center">
                    No Figma spec linked
                  </div>
                )}

                {report.liveUrl ? (
                  <a
                    href={report.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs text-indigo-650 bg-indigo-50/30 hover:bg-indigo-50 border border-indigo-100/80 p-2.5 rounded-lg transition-all truncate font-semibold shadow-3xs"
                  >
                    <span className="truncate">Staging Environment ↗</span>
                  </a>
                ) : (
                  <div className="text-[10px] text-slate-400 bg-slate-50/50 p-2.5 rounded-lg border border-dashed border-slate-200 select-none italic font-mono flex items-center justify-center">
                    No staging URL linked
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 block font-mono">
                Issue Tally Dashboard
              </label>
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-xs font-medium text-slate-550">P1 Critical</span>
                <span className={`text-xs font-bold font-mono ${countP1 > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {countP1.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-xs font-medium text-slate-550">P2 Standard</span>
                <span className={`text-xs font-bold font-mono ${countP2 > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {countP2.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-medium text-slate-550">Suggestions</span>
                <span className={`text-xs font-bold font-mono ${countSug > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {countSug.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-4 bg-slate-900 rounded-xl space-y-3 shadow-md border border-slate-800">
              <p className="text-[11px] text-slate-300 italic leading-relaxed whitespace-pre-wrap">
                "{report.summary || 'Summary description is empty or draft pending overall synthesis.'}"
              </p>
              <div className="pt-2.5 border-t border-slate-800 flex items-center">
                <div className="w-5 h-5 rounded-full bg-indigo-500 mr-2 flex items-center justify-center text-[9px] font-display font-bold text-white uppercase select-none">
                  {report.componentName ? report.componentName[0] : 'S'}
                </div>
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">
                  Simone C. • Lead QA
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* MIDDLE COLUMN: Input configurations & Category Checkers (5-cols) */}
        <section className="lg:col-span-5 space-y-5">
          {/* Header specification links & info */}
          <ReportHeaderForm
            report={report}
            onUpdate={handleUpdateReportMeta}
            savedReports={savedReports}
            onLoadReport={handleLoadReport}
            onSaveReport={handleSaveState}
            onNewReport={handleNewReport}
            onDeleteReport={handleDeleteReport}
          />

          {/* Categories Grid Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/75 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold font-display tracking-wider text-slate-500 uppercase">
                Six-Category Verification Matrix
              </h3>
              <span className="text-[9px] font-bold font-mono px-2 py-0.5 roundedbg-slate-150 text-slate-500">
                Figma Checklists
              </span>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {CATEGORIES_LIST.map((desc, idx) => {
                const catKey = desc.id as keyof QAReport['categories'];
                const category = report.categories[catKey];
                const isExpanded = expandedCategory === desc.id;

                // Status Indicator Styles
                const getStatusStyle = (status: CategoryStatus) => {
                  switch (status) {
                    case 'issues':
                      return 'bg-red-50 text-red-700 border-red-200 font-bold';
                    case 'no_issues':
                      return 'bg-emerald-50 text-emerald-800 border-emerald-250 font-bold';
                    default:
                      return 'bg-slate-50 text-slate-600 border-slate-200';
                  }
                };

                return (
                  <div key={desc.id} className="transition-all duration-150">
                    {/* Header trigger bar */}
                    <div
                      onClick={() => setExpandedCategory(isExpanded ? '' : desc.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                          0{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors font-display text-xs tracking-tight">
                            {desc.label}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            Status: {category.status === 'issues' ? `${category.issues.length} issues logged` : category.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border font-mono font-bold ${getStatusStyle(category.status)}`}>
                          {category.status === 'issues'
                            ? `✗ ${category.issues.length} issues`
                            : category.status === 'no_issues'
                            ? '✓ Clean'
                            : '— Unreviewed'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="size-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Panel container */}
                    {isExpanded && (
                      <div className="px-4 pb-5 pt-1 border-t border-slate-100 bg-slate-50/30 space-y-4">
                        
                        {/* Status switcher radio toggles */}
                        <div className="space-y-1.5 mt-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            Category Evaluation Status
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => handleCategoryStatusChange(catKey, 'not_reviewed')}
                              type="button"
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border text-center ${
                                category.status === 'not_reviewed'
                                  ? 'bg-slate-150 text-slate-800 border-slate-350 shadow-2xs'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50/50'
                              }`}
                            >
                              — Unreviewed
                            </button>
                            <button
                              onClick={() => handleCategoryStatusChange(catKey, 'no_issues')}
                              type="button"
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border text-center ${
                                category.status === 'no_issues'
                                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-300 shadow-2xs'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50/50'
                              }`}
                            >
                              ✓ No issues
                            </button>
                            <button
                              onClick={() => handleCategoryStatusChange(catKey, 'issues')}
                              type="button"
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border text-center ${
                                category.status === 'issues'
                                  ? 'bg-red-50 text-red-800 border-red-350 shadow-2xs'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50/50'
                              }`}
                            >
                              ✗ Issues
                            </button>
                          </div>
                        </div>

                        {/* Rendering Issues Log list if detected */}
                        {category.status === 'issues' && (
                          <div className="space-y-4">
                            {/* Visual List */}
                            {category.issues.length > 0 ? (
                              <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                                  Current Issue Log
                                </label>
                                <div className="space-y-1.5">
                                  {category.issues.map((issue) => (
                                    <IssueItem
                                      key={issue.id}
                                      issue={issue}
                                      categoryName={category.name}
                                      onDelete={(id) => handleDeleteIssue(catKey, id)}
                                      onUpdate={(id, text) => handleUpdateIssue(catKey, id, text)}
                                      hasGemini={hasGemini}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-4 rounded-lg border border-dashed border-slate-200 bg-white shadow-3xs">
                                <p className="text-xs text-slate-400">
                                  No issues added yet. Use presets below or type a description to start.
                                </p>
                              </div>
                            )}

                            {/* Presets Quick Injection container */}
                            {CATEGORY_PRESETS[desc.id] && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                                    Spec Standard Presets
                                  </label>
                                  <span className="text-[10px] text-slate-400 font-sans italic">
                                    Click preset below to fill draft
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {CATEGORY_PRESETS[desc.id].map((preset, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleInjectPreset(desc.id, preset)}
                                      type="button"
                                      className="inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-indigo-650 hover:border-indigo-300 transition-all cursor-pointer shadow-3xs hover:shadow-2xs"
                                    >
                                      <span className={`text-[8px] font-bold px-1 rounded-xs font-mono shrink-0 ${
                                        preset.severity === 'P1'
                                          ? 'bg-red-100 text-red-700'
                                          : preset.severity === 'P2'
                                          ? 'bg-amber-105 text-amber-800'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}>
                                        {preset.severity}
                                      </span>
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quick Add Issue form block */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                                Add Custom Issue Note
                              </span>

                              {/* Form row 1: Severity selection */}
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-semibold text-slate-650">Severity:</span>
                                <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-lg shadow-3xs">
                                  {(['P1', 'P2', 'Suggestion'] as Severity[]).map((sev) => (
                                    <button
                                      key={sev}
                                      onClick={() =>
                                        setDraftInputs({
                                          ...draftInputs,
                                          [desc.id]: { ...draftInputs[desc.id], severity: sev }
                                        })
                                      }
                                      type="button"
                                      className={`px-2.5 py-0.5 text-[10.5px] rounded-md cursor-pointer font-mono font-bold transition-all ${
                                        draftInputs[desc.id].severity === sev
                                          ? sev === 'P1'
                                            ? 'bg-red-50 text-red-800 border border-red-200 font-bold'
                                            : sev === 'P2'
                                            ? 'bg-amber-50 text-amber-805 border border-amber-200 font-bold'
                                            : 'bg-slate-150 text-slate-800 border border-slate-250 font-bold'
                                          : 'text-slate-400 hover:text-slate-700'
                                      }`}
                                    >
                                      {sev}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Tex area */}
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  value={draftInputs[desc.id].description}
                                  onChange={(e) =>
                                    setDraftInputs({
                                      ...draftInputs,
                                      [desc.id]: { ...draftInputs[desc.id], description: e.target.value }
                                    })
                                  }
                                  placeholder="Input description of design bug (e.g., margins should be 16px)..."
                                  className="w-full text-xs rounded-lg border border-slate-250 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white placeholder:text-slate-400 focus:border-indigo-500 transition-colors"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleAddIssue(desc.id)}
                                    type="button"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white bg-slate-900 hover:bg-black transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!draftInputs[desc.id].description.trim()}
                                  >
                                    <Plus className="size-3.5" />
                                    Insert Issue
                                  </button>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}

                        {category.status !== 'issues' && (
                          <div className="p-4 bg-white/75 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 font-medium">
                            No issues tracked context for {desc.label}. Status set to <b>{category.status.replace('_', ' ')}</b>.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


        </section>

        {/* Right COLUMN: Format & Markdown output block (4-cols) */}
        <section className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <ReportOutputView report={report} />
        </section>

      </main>

      {/* Dynamic Theme-Aligned Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${totalIssues > 0 ? 'bg-red-505 animate-pulse' : 'bg-emerald-500'}`} style={{ backgroundColor: totalIssues > 0 ? '#ef4444' : '#10b981' }}></div>
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest font-mono">
              {totalIssues > 0 ? `${totalIssues} Priority Tasks Pending` : 'All Categories Restored'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 tabular-nums font-mono">
            Audit Date: {report.date}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">
          Component Audit Report v1.0.5 • Local Persistent Logs Enabled
        </div>
      </footer>
    </>
  )}
</div>
  );
}
