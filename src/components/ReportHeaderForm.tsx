import React from 'react';
import { QAReport } from '../types';
import { Layers, Link2, Calendar, FilePlus, Save, Trash, Plus, Archive } from 'lucide-react';

interface ReportHeaderFormProps {
  report: QAReport;
  onUpdate: (updated: Partial<QAReport>) => void;
  savedReports: QAReport[];
  onLoadReport: (id: string) => void;
  onSaveReport: () => void;
  onNewReport: () => void;
  onDeleteReport: (id: string) => void;
}

export function ReportHeaderForm({
  report,
  onUpdate,
  savedReports,
  onLoadReport,
  onSaveReport,
  onNewReport,
  onDeleteReport,
}: ReportHeaderFormProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Saved Reports Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Archive className="size-5 text-indigo-600 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
            Review Board & Saved Reports
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewReport}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-colors duration-150 cursor-pointer shadow-2xs"
          >
            <FilePlus className="size-3.5" />
            New Report
          </button>
          <button
            onClick={onSaveReport}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-indigo-200 text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors duration-150 cursor-pointer"
          >
            <Save className="size-3.5" />
            Save State
          </button>
        </div>
      </div>

      {savedReports.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Select Active Report from Board
          </label>
          <div className="flex items-center gap-2">
            <select
              value={report.id}
              onChange={(e) => onLoadReport(e.target.value)}
              className="flex-1 text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors duration-150"
            >
              {savedReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.componentName || 'Untitled Component'} ({r.date})
                </option>
              ))}
            </select>
            {savedReports.length > 1 && (
              <button
                onClick={() => onDeleteReport(report.id)}
                type="button"
                className="p-2 rounded-lg border border-red-100 text-red-500 bg-red-50 hover:bg-red-105 hover:text-red-700 cursor-pointer transition-colors"
                title="Delete currently selected report from local storage"
              >
                <Trash className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Component Name */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Layers className="size-3.5 text-slate-400" />
            Component Name
          </label>
          <input
            type="text"
            required
            value={report.componentName}
            onChange={(e) => onUpdate({ componentName: e.target.value })}
            placeholder="e.g. Navigation Drawer, Checkout Button"
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 transition-colors"
          />
        </div>

        {/* Evaluation Date */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-400" />
            Evaluation Date
          </label>
          <input
            type="date"
            value={report.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-500 transition-colors"
          />
        </div>

        {/* Figma URL */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Link2 className="size-3.5 text-slate-400" />
            Figma Specification URL
          </label>
          <input
            type="url"
            value={report.figmaUrl}
            onChange={(e) => onUpdate({ figmaUrl: e.target.value })}
            placeholder="https://www.figma.com/file/..."
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 transition-colors"
          />
        </div>

        {/* Live Staging URL */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Link2 className="size-3.5 text-slate-400" />
            Live / Staging Component URL
          </label>
          <input
            type="url"
            value={report.liveUrl}
            onChange={(e) => onUpdate({ liveUrl: e.target.value })}
            placeholder="https://staging.app.io/component/..."
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
