export type Severity = 'P1' | 'P2' | 'Suggestion';

export interface Issue {
  id: string;
  severity: Severity;
  description: string;
}

export type CategoryStatus = 'issues' | 'no_issues' | 'not_reviewed';

export interface CategoryReview {
  id: string;
  name: string;
  status: CategoryStatus;
  issues: Issue[];
}

export interface QAReport {
  id: string;
  componentName: string;
  figmaUrl: string;
  liveUrl: string;
  date: string;
  summary: string;
  categories: {
    visual: CategoryReview;
    states: CategoryReview;
    responsive: CategoryReview;
    content: CategoryReview;
    accessibility: CategoryReview;
    composability: CategoryReview;
  };
}

export const CATEGORIES_LIST = [
  { id: 'visual', name: 'Visual verification', label: 'Visual Verification' },
  { id: 'states', name: 'States & variations', label: 'States & Variations' },
  { id: 'responsive', name: 'Responsive check', label: 'Responsive Check' },
  { id: 'content', name: 'Content resilience', label: 'Content Resilience' },
  { id: 'accessibility', name: 'Accessibility check', label: 'Accessibility Check' },
  { id: 'composability', name: 'Composability', label: 'Composability' }
] as const;
