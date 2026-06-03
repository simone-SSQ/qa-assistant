import React, { useState } from 'react';
import { QAReport, CATEGORIES_LIST } from '../types';
import { formatReportToMarkdown } from '../utils/reportFormatter';
import { Clipboard, Check, Eye, Code, Download, FileJson, AlertCircle } from 'lucide-react';

interface ReportOutputViewProps {
  report: QAReport;
}

export function ReportOutputView({ report }: ReportOutputViewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown'>('preview');
  const [copied, setCopied] = useState(false);

  const markdownString = formatReportToMarkdown(report);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownString], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QA_Report_${report.componentName.replace(/\s+/g, '_') || 'Component'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QA_Report_${report.componentName.replace(/\s+/g, '_') || 'Component'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'P1':
        return 'text-red-700 bg-red-100 border-red-350';
      case 'P2':
        return 'text-amber-700 bg-amber-100 border-amber-300';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-350';
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-250/90 p-6 shadow-md flex flex-col h-full space-y-4 relative overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-indigo-600 rounded-full"></span>
          <h2 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-widest">
            Fidelity QA Manifest
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/90 self-start sm:self-auto shadow-3xs">
          <button
            onClick={() => setActiveTab('preview')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold cursor-pointer transition-all duration-150 ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Eye className="size-3 text-indigo-650" />
            Visual Preview
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold cursor-pointer transition-all duration-150 ${
              activeTab === 'markdown'
                ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-950 border border-transparent'
            }`}
          >
            <Code className="size-3 text-indigo-500" />
            Markdown Code
          </button>
        </div>
      </div>

      {/* Main Preview Block */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200/80 overflow-auto min-h-[350px] max-h-[550px] p-5 text-xs text-slate-850 leading-relaxed scrollbar shadow-inner hover:border-slate-300 transition-colors">
        {activeTab === 'markdown' ? (
          <pre className="whitespace-pre-wrap text-left select-text font-mono text-[11px] text-slate-700 bg-slate-50/50 p-4 rounded-lg border border-slate-150 outline-none">
            {markdownString}
          </pre>
        ) : (
          <div className="font-sans space-y-5 text-slate-850 text-xs">
            {/* Visual Header */}
            <div className="pb-4 border-b border-slate-150/90 space-y-2">
              <span className="inline-flex items-center text-[9px] uppercase font-bold tracking-wider font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Verified Spec Draft
              </span>
              <h3 className="text-base font-extrabold text-slate-950 tracking-tight font-display">
                {report.componentName || 'Untitled Component'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-[10.5px] font-mono text-slate-500">
                <p>
                  <span className="font-bold select-none text-slate-400 font-sans uppercase tracking-wider text-[8.5px] mr-1">Figma:</span>
                  {report.figmaUrl ? (
                    <a href={report.figmaUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate inline-block max-w-[180px] align-bottom">
                      {report.figmaUrl}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
                <p>
                  <span className="font-bold select-none text-slate-400 font-sans uppercase tracking-wider text-[8.5px] mr-1">Live:</span>
                  {report.liveUrl ? (
                    <a href={report.liveUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate inline-block max-w-[180px] align-bottom">
                      {report.liveUrl}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-bold select-none text-slate-400 font-sans uppercase tracking-wider text-[8.5px] mr-1">Date audited:</span>
                  <span className="text-slate-700">{report.date}</span>
                </p>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3.5">
              {CATEGORIES_LIST.map((meta, idx) => {
                const cat = report.categories[meta.id as keyof QAReport['categories']];
                let statusBadge = (
                  <span className="text-[9.5px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                    Not reviewed
                  </span>
                );

                if (cat.status === 'no_issues') {
                  statusBadge = (
                    <span className="text-[9.5px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                      ✓ Clean
                    </span>
                  );
                } else if (cat.status === 'issues') {
                  statusBadge = (
                    <span className="text-[9.5px] bg-red-50 border border-red-200/80 text-red-700 px-2 py-0.5 rounded font-mono font-bold">
                      ✗ {cat.issues.length} {cat.issues.length === 1 ? 'Issue' : 'Issues'}
                    </span>
                  );
                }

                return (
                  <div
                    key={meta.id}
                    className={`p-3 bg-slate-50/50 rounded-xl border border-slate-200/70 space-y-2.5 transition-all ${
                      cat.status === 'not_reviewed' ? 'opacity-60' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <h4 className="font-bold text-slate-900 text-xs tracking-tight flex items-center font-display">
                        <span className={`w-1 h-3.5 mr-2 rounded-full inline-block ${
                          cat.status === 'issues'
                            ? 'bg-red-500'
                            : cat.status === 'no_issues'
                            ? 'bg-indigo-600'
                            : 'bg-slate-300'
                        }`}></span>
                        {idx + 1}. {meta.label}
                      </h4>
                      {statusBadge}
                    </div>

                    {cat.status === 'not_reviewed' && (
                      <p className="text-[11px] text-slate-400 italic">No verification logged.</p>
                    )}

                    {cat.status === 'no_issues' && (
                      <div className="py-1.5 border border-dashed border-slate-200/60 rounded-lg flex items-center justify-center bg-white">
                        <span className="text-[11px] text-emerald-650 font-semibold flex items-center gap-1.5">
                          ✓ All Figma guidelines matched
                        </span>
                      </div>
                    )}

                    {cat.status === 'issues' && (
                      <div className="space-y-1.5 bg-white p-2 border border-slate-100 rounded-lg">
                        {cat.issues.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No issues logged yet.</p>
                        ) : (
                          cat.issues.map((issue) => (
                            <div key={issue.id} className="flex gap-2 items-start text-[11.5px] leading-relaxed">
                              <span className={`inline-block font-mono text-[8px] px-1 font-extrabold rounded border shrink-0 mt-0.5 ${getSeverityColor(issue.severity)}`}>
                                {issue.severity}
                              </span>
                              <span className="text-slate-700 font-sans">{issue.description}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary block */}
            <div className="mt-6 p-4 bg-slate-900 rounded-xl space-y-2 shadow-md">
              <h4 className="text-[9px] uppercase font-bold font-mono tracking-widest text-slate-400">
                Evaluation Executive Summary
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium italic">
                "{report.summary || 'Summary description is empty or draft pending overall synthesis.'}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Copy & Utility Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={handleCopy}
          type="button"
          className={`col-span-1 sm:col-span-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors border shadow-xs ${
            copied
              ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
          }`}
        >
          {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
          {copied ? 'Copied' : 'Copy Report'}
        </button>

        <button
          onClick={handleDownload}
          type="button"
          title="Download Markdown Document"
          className="inline-flex items-center justify-center gap-1 text-xs font-medium px-3 py-2.5 rounded-lg border border-gray-250 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer transition-colors shadow-xs"
        >
          <Download className="size-4 text-gray-500" />
          MD File
        </button>

        <button
          onClick={handleExportJson}
          type="button"
          title="Export Report Data as JSON"
          className="inline-flex items-center justify-center gap-1 text-xs font-medium px-3 py-2.5 rounded-lg border border-gray-250 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer transition-colors shadow-xs"
        >
          <FileJson className="size-4 text-gray-500" />
          JSON Data
        </button>
      </div>

      <div className="flex gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-800 leading-relaxed">
        <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold font-sans">Verification workflow:</span> Copy this report, and paste it into AI Studio. If your prompt specifies a change task, the model will parse this checklist to restructure and repair the component.
        </div>
      </div>
    </div>
  );
}
