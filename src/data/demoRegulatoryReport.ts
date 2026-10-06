export interface RegPhaseRow {
  phase: string;
  agency: string;
  timeline: string;
  fee: string;
  blocking: string;
}

export const DEMO_REG_TITLE = 'Regulatory overview: Nano Urea → Ethiopia';
export const DEMO_REG_TAG = 'Chemical Fertilizer · 4 Phases';

export const DEMO_REG_INTRO =
  'Nano Urea is classified as a liquid chemical fertilizer in Ethiopia. The pathway runs through four sequential stages: EPA product registration and DAIRE technical clearance in parallel, then an NBE FX permit, then ERCA customs. A first shipment takes 3–5 months end to end.';

export const DEMO_REG_PHASES: RegPhaseRow[] = [
  { phase: '1. Product Registration', agency: 'EPA Ethiopia', timeline: '4–8 weeks', fee: '$85–110', blocking: 'Yes — do first' },
  { phase: '2. Technical Clearance', agency: 'DAIRE / MoA', timeline: '3–6 weeks (parallel)', fee: '$32–150', blocking: 'Yes — per shipment' },
  { phase: '3. FX Payment Permit', agency: 'NBE', timeline: '2–4 weeks', fee: 'Bank fees only', blocking: 'Yes — per shipment' },
  { phase: '4. Customs Clearance', agency: 'ERCA', timeline: '3–7 days', fee: '0% duty + 15% VAT', blocking: 'Final step' },
];

export const DEMO_REG_TOTAL = { timeline: '3–5 months', fee: '~$300–450' };

export interface RegTimelineItem {
  when: string;
  what: string;
  how: string;
}

export const DEMO_REG_PHASE1_TIMELINE: RegTimelineItem[] = [
  {
    when: 'WK 1–2',
    what: 'File EPA-CHEM-01 Application',
    how: 'Agency: Ethiopian Environmental Protection Authority (epa.gov.et). Fee: ETB 4,800–6,000 ($85–110). Key document: a certified Amharic label translation — the #1 rejection cause. The active ingredient must read exactly "urea nano-particles," not "nano-nitrogen" or "nano-fertilizer."',
  },
  {
    when: 'WK 3–8',
    what: 'EPA Technical Review + Efficacy Data',
    how: 'Submit ICAR-IARI validation data (2021–2023) as international efficacy evidence. The fast-track fee (ETB 8,000) cuts this to 2–3 weeks.',
  },
];

export const DEMO_REG_PHASE1_CALLOUT_LABEL = 'Institutional Channel';
export const DEMO_REG_PHASE1_CALLOUT =
  'IFFCO-Coopex MOU (2021) provides a pre-existing institutional channel — DAIRE gives preferential review to MOU-covered products.';

export const DEMO_REG_AVOID: string[] = [
  "Do not describe Nano Urea as a 'biopesticide' or 'pesticide' — that routes to pesticide registration (12–18 months vs. 3–5 months for fertilizer).",
  'Do not ship before NBE FX approval — goods arriving at Djibouti without FX clearance can be held indefinitely. Build in a 6-week buffer.',
  "Do not use inconsistent terminology across documents — if the SDS says 'nano-urea' and the invoice says 'nano nitrogen,' ERCA will hold the shipment for re-inspection.",
];
