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
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
            Output Document
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('preview')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-150 ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Eye className="size-3.5 text-indigo-600" />
            Visual Preview
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-150 ${
              activeTab === 'markdown'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-950 border border-transparent'
            }`}
          >
            <Code className="size-3.5 text-indigo-500" />
            Markdown Code
          </button>
        </div>
      </div>

      {/* Main Preview Block */}
      <div className="flex-1 bg-slate-50/50 rounded-xl border border-slate-200 overflow-auto min-h-[350px] max-h-[550px] p-5 font-mono text-xs text-slate-800 leading-relaxed scrollbar shadow-inner">
        {activeTab === 'markdown' ? (
          <pre className="whitespace-pre-raw text-left select-all select-text font-mono text-xs text-gray-700 bg-gray-50">
            {markdownString}
          </pre>
        ) : (
          <div className="font-sans space-y-6 text-slate-800 text-sm">
            {/* Visual Header */}
            <div className="pb-4 border-b border-slate-200/85 space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-display">
                {report.componentName || 'Untitled Component'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-[11px] font-mono text-slate-500">
                <p>
                  <span className="font-bold select-none text-slate-400 font-sans uppercase tracking-wider text-[9px] mr-1">Figma:</span>
                  {report.figmaUrl ? (
                    <a href={report.figmaUrl} target="_blank" rel="noreferrer" className="text-indigo-650 hover:underline truncate inline-block max-w-[200px] align-bottom">
                      {report.figmaUrl}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
                <p>
                  <span className="font-bold select-none text-slate-400 font-sans uppercase tracking-wider text-[9px] mr-1">Live:</span>
                  {report.liveUrl ? (
                    <a href={report.liveUrl} target="_blank" rel="noreferrer" className="text-indigo-650 hover:underline truncate inline-block max-w-[200px] align-bottom">
                      {report.liveUrl}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-bold select-none text-slate-400 font-sans uppercase tracking-wider text-[9px] mr-1">Date audited:</span>
                  <span className="text-slate-700">{report.date}</span>
                </p>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              {CATEGORIES_LIST.map((meta, idx) => {
                const cat = report.categories[meta.id as keyof QAReport['categories']];
                let statusBadge = (
                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-550 px-2 py-0.5 rounded-full font-mono font-bold">
                    Not reviewed
                  </span>
                );

                if (cat.status === 'no_issues') {
                  statusBadge = (
                    <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      ✓ Clean
                    </span>
                  );
                } else if (cat.status === 'issues') {
                  statusBadge = (
                    <span className="text-[10px] bg-red-100 border border-red-200 text-red-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      ✗ {cat.issues.length} {cat.issues.length === 1 ? 'Issue' : 'Issues'}
                    </span>
                  );
                }

                return (
                  <div
                    key={meta.id}
                    className={`p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 transition-all ${
                      cat.status === 'not_reviewed' ? 'opacity-65 grayscale-2xs' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900 text-xs tracking-wider uppercase flex items-center font-display">
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
                      <p className="text-xs text-slate-400 italic">No verification logged.</p>
                    )}

                    {cat.status === 'no_issues' && (
                      <div className="py-2 border border-dashed border-slate-100 rounded-lg flex items-center justify-center bg-slate-50/50">
                        <span className="text-xs text-slate-400 font-medium">✓ Clean — No issues detected.</span>
                      </div>
                    )}

                    {cat.status === 'issues' && (
                      <div className="space-y-2">
                        {cat.issues.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No issues logged yet.</p>
                        ) : (
                          cat.issues.map((issue) => (
                            <div key={issue.id} className="flex gap-2 items-start text-xs leading-relaxed">
                              <span className={`inline-block font-mono text-[9px] px-1 py-0.2 font-bold rounded border shrink-0 mt-0.5 ${getSeverityColor(issue.severity)}`}>
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
