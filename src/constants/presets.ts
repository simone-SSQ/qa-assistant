import { Severity } from '../types';

export interface PresetIssue {
  severity: Severity;
  label: string;
  description: string;
}

export const CATEGORY_PRESETS: Record<string, PresetIssue[]> = {
  visual: [
    {
      severity: 'P2',
      label: 'Incorrect Padding',
      description: 'Padding should be 16px, currently appears to be 12px or asymmetric.'
    },
    {
      severity: 'P1',
      label: 'Off-spec Font Family',
      description: 'Display headings should be using Space Grotesk, currently rendered in system Arial.'
    },
    {
      severity: 'P2',
      label: 'Wrong Color Value',
      description: 'Card border brand accent is #2563EB, but Figma specification specifies #1D4ED8.'
    },
    {
      severity: 'Suggestion',
      label: 'Subtle Gap Misalignment',
      description: 'The horizontal gap between the icon and text should be 8px, currently rendered as 12px.'
    }
  ],
  states: [
    {
      severity: 'P1',
      label: 'Disabled Clickable',
      description: 'Primary button continues to trigger form submission when set to disabled.'
    },
    {
      severity: 'P2',
      label: 'Missing Focus Ring',
      description: 'No keyboard focus ring is displayed when navigating to the input field using Tab.'
    },
    {
      severity: 'P2',
      label: 'Stark Hover Shift',
      description: 'Hover state has a sudden color jump; implement transition: all 0.2s ease-in-out.'
    },
    {
      severity: 'Suggestion',
      label: 'No Press Feedback',
      description: 'Card component does not provide a visual scale or depress feedback upon click/touch.'
    }
  ],
  responsive: [
    {
      severity: 'P1',
      label: 'Container Clipping',
      description: 'Grid layout fails to wrap below 375px wide, causing structural truncation of content.'
    },
    {
      severity: 'P2',
      label: 'Sizing Too Compact',
      description: 'Form elements become excessively small (< 32px high) on mobile viewports under 480px.'
    },
    {
      severity: 'P2',
      label: 'Dense Desktop Margins',
      description: 'Padding on 1440px+ layouts remains too tight; adjust max-w-7xl and auto margins.'
    }
  ],
  content: [
    {
      severity: 'P1',
      label: 'Text Truncation Leak',
      description: 'Very long text runs outside of the card boundaries; enforce text-overflow: ellipsis and overflow-hidden.'
    },
    {
      severity: 'P2',
      label: 'Layout Empty Collapse',
      description: 'Container structurally collapses when no list content is present instead of holding min-height or placeholder.'
    },
    {
      severity: 'P2',
      label: 'Broken Image Ratio',
      description: 'Using long vertical images stretches the container layout; enforce object-cover and aspect-ratio.'
    }
  ],
  accessibility: [
    {
      severity: 'P1',
      label: 'Contrast Violates AA',
      description: 'Background and text color contrast fails WCAG 2.1 AA requirement of 4.5:1 (current ratio: 2.1:1).'
    },
    {
      severity: 'P2',
      label: 'Missing ARIA Labels',
      description: 'Icon-only action buttons do not represent meaningful state via aria-label attributes.'
    },
    {
      severity: 'P2',
      label: 'Invisible Focus Ring',
      description: 'Focus states have poor color contrast against background elements, making outline invisible.'
    }
  ],
  composability: [
    {
      severity: 'P2',
      label: 'Margin Margin Collapse',
      description: 'Component relies on negative margins that override parent stacking layout flow.'
    },
    {
      severity: 'P2',
      label: 'Broken Layer Indexing',
      description: 'Dropdown menu layers below sticky page headers; adjust relative overflow / z-index hierarchies.'
    },
    {
      severity: 'Suggestion',
      label: 'Implicit Outer Padding',
      description: 'Component carries excessive external margin, making inline placement with other grid components uneven.'
    }
  ]
};
