export interface GtmTimelineItem {
  when: string;
  what: string;
  how: string;
}

export const DEMO_GTM_TIMELINE: GtmTimelineItem[] = [
  {
    when: 'D1',
    what: 'Stand up the market entry cell',
    how: 'Two named owners: regulatory lead and commercial lead. Weekly 30-minute cadence, single shared tracker.',
  },
  {
    when: 'D14',
    what: 'Sign two non-exclusive agro-dealer LOIs',
    how: 'Non-exclusive protects pricing while giving credible volume signals to the registration authority.',
  },
  {
    when: 'W6',
    what: 'Run 12 demonstration plots across three agro-ecological zones',
    how: 'Local trial data is the single strongest accelerant for both registration and dealer confidence.',
  },
  {
    when: 'W9',
    what: 'Launch first commercial consignment',
    how: 'Target the short-rains planting window; anything later slips a full season.',
  },
  {
    when: 'W12',
    what: 'Submit subsidy programme inclusion application',
    how: 'Requires 90 days of verified in-country sales records plus demonstration plot results.',
  },
];

export type GtmFinanceIcon = 'landmark' | 'banknote' | 'handshake';

export interface GtmFinanceItem {
  icon: GtmFinanceIcon;
  name: string;
  amount: string;
  detail: string;
}

export const DEMO_GTM_FINANCE: GtmFinanceItem[] = [
  {
    icon: 'landmark',
    name: 'AGRA Market Access Facility',
    amount: 'USD 250K–1.2M',
    detail: 'Matching grant for input distribution scale-up across East African smallholder networks.',
  },
  {
    icon: 'banknote',
    name: 'IFC Agri Ventures',
    amount: 'USD 2M–8M',
    detail: 'Growth equity and working capital for post-registration commercial expansion.',
  },
  {
    icon: 'handshake',
    name: 'AgriFI Challenge Fund',
    amount: 'EUR 500K–2M',
    detail: 'Blended finance for climate-adaptive input technologies with verified field trial data.',
  },
];
