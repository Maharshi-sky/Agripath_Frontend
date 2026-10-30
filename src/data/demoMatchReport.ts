export interface ZoneCompareRow {
  parameter: string;
  zoneValue: string;
  requirement: string;
  compatibility: string;
  caution?: boolean;
}

export interface ZoneCard {
  code: string;
  name: string;
  districts: string;
  score: number;
  summary?: string;
  table?: ZoneCompareRow[];
  notes?: string[];
  callouts: { tone: 'opportunity' | 'caution'; label: string; text: string }[];
}

export const DEMO_MATCH_INTRO =
  'Ethiopia spans 6 agroclimatic zones from highland Nitisols at 2,800m to arid lowland Aridisols at 400m. The bimodal highland rainfall (Belg Feb–May + Meher Jun–Sep) creates two distinct foliar spray windows per year — ideal for Nano Urea. The main agroclimatic constraint is not soil or rainfall but the 6am–10am spray window in hot zones, before stomata close.';

export const DEMO_MATCH_ZONES: ZoneCard[] = [
  {
    code: 'ETH-1',
    name: 'Oromia & Amhara Highlands',
    districts: 'Jimma, Arsi, Gondar, Bahir Dar',
    score: 94,
    table: [
      {
        parameter: 'Rainfall',
        zoneValue: '900–1,400mm bimodal',
        requirement: 'Two spray windows / year',
        compatibility: 'Excellent',
      },
      {
        parameter: 'Soil (Nitisol)',
        zoneValue: 'pH 5.5–6.8, OM 2–4%',
        requirement: 'Foliar delivery — any soil',
        compatibility: 'Any soil works',
      },
      {
        parameter: 'Temperature',
        zoneValue: '12–28°C, 6–8 sun hrs',
        requirement: 'Spray 6–9am, stomata open',
        compatibility: 'Ideal window',
      },
      {
        parameter: 'Main crops',
        zoneValue: 'Wheat, Teff, Maize, Chickpea',
        requirement: 'All validated in ICAR trials',
        compatibility: 'Full crop fit',
      },
      {
        parameter: 'N-demand',
        zoneValue: 'Low–medium, 40–60 kg N/ha',
        requirement: 'Foliar supplement only',
        compatibility: 'Pair with basal DAP',
        caution: true,
      },
    ],
    notes: [
      'Apply at tillering (Day 25–30) and panicle initiation (Day 50–55). Never spray past 9am.',
      'Complement with 100kg/ha basal DAP — Nano Urea replaces urea topdress only, not phosphorus.',
      'Bundle with IFFCO Rhizobium TAL-620 (already DAIRE-cleared) for a complete nitrogen package.',
    ],
    callouts: [
      {
        tone: 'opportunity',
        label: 'Priority Districts',
        text: 'Jimma, Arsi Negele, Dodola, Asella, Bale Robe (Oromia); Debre Birhan, Bahir Dar, Gondar, Dessie (Amhara). These 10 districts alone cover 4.2M wheat farmers.',
      },
    ],
  },
  {
    code: 'ETH-3',
    name: 'Rift Valley Irrigated',
    districts: 'Ziway, Hawassa, Arba Minch',
    score: 88,
    summary:
      'Semi-arid lowland with lake and groundwater irrigation. Maize, vegetables and chickpea dominate. Irrigated vegetable production responds strongly — two applications per crop cycle. At 18–36°C, the spray window narrows to a strict 6–8am. Highest-value target: the Ziway/Batu vegetable belt feeding the Addis market.',
    callouts: [
      {
        tone: 'opportunity',
        label: 'Highest ROI Zone',
        text: 'Vegetable farmers already buy expensive bagged fertilizer. Nano Urea at roughly half the cost is an immediate, easy sell.',
      },
    ],
  },
  {
    code: 'ETH-2',
    name: 'Tigray & Afar',
    districts: 'Mekelle, Adwa, Adigrat',
    score: 72,
    summary:
      'Semi-arid, 400–700mm rainfall, shallow Cambisol soils, drought roughly one year in three. Nano Urea performs well in good rainfall years but gives little benefit to crops already under drought stress. Best deployed conditionally — only when October rainfall exceeds 150mm for the season.',
    callouts: [
      {
        tone: 'caution',
        label: 'Deploy With Caution',
        text: 'Prioritise ETH-1 and ETH-3 first — ETH-2 is a secondary market, not a launch market.',
      },
    ],
  },
];

export interface CompatibilitySummaryRow {
  zone: string;
  score: number;
  crops: string;
  sprayCycles: string;
  priority: string;
}

export const DEMO_MATCH_SUMMARY: CompatibilitySummaryRow[] = [
  { zone: 'ETH-1 Oromia & Amhara Highlands', score: 94, crops: 'Wheat, Teff, Chickpea, Maize', sprayCycles: '2–4', priority: 'Priority 1' },
  { zone: 'ETH-3 Rift Valley Irrigated', score: 88, crops: 'Vegetables, Maize, Chickpea', sprayCycles: '4–6', priority: 'Priority 2' },
  { zone: 'ETH-2 Tigray Highlands', score: 72, crops: 'Sorghum, Teff, Lentil', sprayCycles: '1–2, conditional', priority: 'Priority 3' },
  { zone: 'ETH-4 Somali/Afar Lowlands', score: 38, crops: 'Sorghum, Millet', sprayCycles: '0–1', priority: 'Not recommended' },
];

export const DEMO_MATCH_REQUIREMENTS: { tone: 'caution' | 'opportunity'; label: string; text: string }[] = [
  {
    tone: 'caution',
    label: 'MRA Registration',
    text: "IFFCO Nano Urea's Ethiopia MRA negotiation is ongoing (2025). Batch-by-batch DAIRE clearance is the current mode of entry, adding 3–4 weeks per shipment. File for full MRA immediately — it takes 8–14 months, but interim clearance still allows sales.",
  },
  {
    tone: 'opportunity',
    label: 'Organic Certification',
    text: 'IFOAM-compliant. Ethiopian organic premium crops (coffee, sesame, pulses) can gain organic certification once urea is eliminated — a 15–30% price uplift.',
  },
  {
    tone: 'opportunity',
    label: 'Bundling',
    text: "Bundle with IFFCO Rhizobium TAL-620 (already DAIRE-cleared) as a 'complete nitrogen package' — one field-agent visit, two placements.",
  },
];
