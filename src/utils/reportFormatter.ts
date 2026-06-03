import { QAReport } from '../types';

export function formatReportToMarkdown(report: QAReport): string {
  const parts: string[] = [];

  parts.push(`Component QA Report — ${report.componentName || '[Component name]'}`);
  parts.push(`Figma: ${report.figmaUrl || '—'}`);
  parts.push(`Live: ${report.liveUrl || '—'}`);
  parts.push(`Date: ${report.date || new Date().toISOString().split('T')[0]}`);
  parts.push('\n---\n');

  // Category formatting mapping
  const categoryKeys: (keyof QAReport['categories'])[] = [
    'visual',
    'states',
    'responsive',
    'content',
    'accessibility',
    'composability',
  ];

  categoryKeys.forEach((key, index) => {
    const cat = report.categories[key];
    parts.push(`## ${index + 1}. ${cat.name}`);

    if (cat.status === 'not_reviewed') {
      parts.push('— Not reviewed.');
    } else if (cat.status === 'no_issues') {
      parts.push('✓ No issues found.');
    } else {
      if (cat.issues.length === 0) {
        parts.push('✓ No issues found.');
      } else {
        const issuesText = cat.issues
          .map((issue) => `[${issue.severity}] ${issue.description}`)
          .join('\n');
        parts.push(issuesText);
      }
    }
    parts.push(''); // spacing between categories
  });

  parts.push('---');
  parts.push(`Summary: ${report.summary || '[1–2 sentence overview of overall implementation quality and priority focus for the engineer]'}`);

  return parts.join('\n');
}
