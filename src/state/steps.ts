// src/state/steps.ts

export interface StepMeta {
  n: number;
  label: string;
  path: string;
}

export const STEPS: StepMeta[] = [
  { n: 1, label: 'Technology Details', path: 'technology-details' },
  { n: 2, label: 'Target Markets', path: 'target-markets' },
  { n: 3, label: 'Match Analysis', path: 'match-analysis' },
  { n: 4, label: 'Regulatory Pathway', path: 'regulatory-pathway' },
  { n: 5, label: 'Go-to-Market Plan', path: 'go-to-market-plan' },
];

// 6th Step: Final Report Definition
export const FINAL_REPORT_STEP: StepMeta = {
  n: 6,
  label: 'Final Report',
  path: 'final-report',
};

// All steps combined (Workflow 1-5 + Final Report)
export const ALL_STEPS: StepMeta[] = [...STEPS, FINAL_REPORT_STEP];

export function stepLabel(step: number): string {
  return ALL_STEPS.find((s) => s.n === step)?.label ?? '';
}

export function stepByPath(path: string | undefined): StepMeta | undefined {
  return ALL_STEPS.find((s) => s.path === path);
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}