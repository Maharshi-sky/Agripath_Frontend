// my-app/src/UI/GtmPlanContent.tsx
import { useEffect, useState, useRef } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useWizard } from '../state/wizardStore';
import { COUNTRIES } from '../data/countries';

export interface GtmPlanContentProps {
  country?: string;
  techName?: string;
  techType?: string;
  techData?: any;
}

interface GtmAiResponse {
  executive_brief?: string;
  production_hubs?: string;
  planting_window?: string;
  milestones?: Array<{ timing: string; title: string; desc: string }>;
  first_contacts?: Array<{ name: string; desc: string }>;
  funding_windows?: Array<{ name: string; url: string; display_url: string; description: string }>;
  success_metrics?: Array<{ horizon: string; target: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  seeds: 'Seeds & Varieties',
  bio: 'Biological Inputs',
  chemical: 'Fertilizers & Crop Protection',
  irrigation: 'Irrigation & Water Management',
  equipment: 'Farm Machinery & Equipment',
  solar: 'Solar & Clean Energy',
  digital: 'Digital & Precision Agriculture',
  livestock: 'Livestock & Animal Health',
  aquaculture: 'Aquaculture & Fisheries',
  storage: 'Storage & Post-Harvest',
  finance: 'AgriFinance & InsurTech',
  other: 'Novel / Biotech',
};

const formatHref = (url: string): string => {
  if (!url) return '#';
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
};

export default function GtmPlanContent({
  country: propCountry,
  techType: propTechType,
  techData: propTechData,
}: GtmPlanContentProps) {
  const { state } = useWizard();
  const [aiDeepDiveOpen, setAiDeepDiveOpen] = useState(false);

  // 1. User Selections & Category Identification
  const country = propCountry || state.countries?.[0] || 'Target Country';
  const tech = propTechData || state.tech || {};

  const techRawCategory =
    propTechType ||
    tech.inputCategory ||
    tech.productCategory ||
    state.techCategory ||
    tech.type ||
    'seeds';

  const isBio =
    techRawCategory.toLowerCase().includes('bio') ||
    techRawCategory.toLowerCase().includes('fertilizer') ||
    Boolean(tech.inputCategory) ||
    Boolean(tech.brandProductName);

  const selectedCategoryDisplay = isBio
    ? 'Biological Inputs'
    : CATEGORY_LABELS[techRawCategory] || techRawCategory;

  const userCrop = tech.crop || tech.cropType || tech.seedType || (isBio ? 'Target Crops' : 'Target Crop');
  const userVariety =
    tech.brandProductName ||
    tech.varietyName ||
    tech.equipmentName ||
    tech.name ||
    (isBio ? 'Commercial Bio-Formulation' : 'Certified Variety');

  const dynamicHeaderTitle = `${userVariety} (${userCrop}) → ${country}`;
  const priceText = tech.price || tech.approxPrice || (isBio ? '₹350 – ₹1,200 / Unit' : 'Market Competitive Pricing');
  const yieldText =
    tech.expectedYield ||
    tech.yield ||
    tech.keyBenefits ||
    (isBio ? '20–30% Synthetic fertilizer replacement & soil microbiome restoration' : 'Standard certified commercial yield benchmarks');

  const regionName = COUNTRIES.find((c) => c.n === country)?.r || 'Global Market';

  // 2. Dynamic AI State
  const [planData, setPlanData] = useState<GtmAiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // In-flight guard against duplicate calls
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const controller = new AbortController();

    async function fetchAiGtmPlan() {
      setLoading(true);
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${BASE_URL}/gtm/generate-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            country,
            crop: userCrop,
            variety: userVariety,
            category: selectedCategoryDisplay,
            yieldImpact: yieldText,
            benefits: tech.keyBenefits || tech.desc || '',
            applicationMethod: tech.applicationMethod || tech.method || '',
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setPlanData(json.data);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('GTM AI call error:', err);
        }
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }

    fetchAiGtmPlan();

    return () => {
      controller.abort();
    };
  }, [country, userCrop, userVariety, selectedCategoryDisplay, yieldText]);

  // 3. Category-Aware Fallback Milestones
  const milestones = planData?.milestones || (isBio ? [
    {
      timing: 'Day 1',
      title: 'Appoint In-Country Bio-Regulatory Consultant',
      desc: `Initiate biological registration dossier and microbial strain authentication to ${country}'s agricultural input regulatory authority.`
    },
    {
      timing: 'Week 1',
      title: 'Formalize National Bio-Efficacy Trial Partner',
      desc: `Contract national agricultural research institute in ${country} to conduct 1-season microbial crop tolerance and field validation trials for ${userCrop}.`
    },
    {
      timing: 'Week 2–3',
      title: 'Establish Cold-Chain & Warehousing Protocols',
      desc: `Audit regional storage facilities (15–25°C / 2–8°C) to maintain live CFU viability of ${userVariety} throughout storage and transit.`
    },
    {
      timing: 'Week 4–6',
      title: 'Execute Bio-Input Agro-Dealer & Cooperative Agreements',
      desc: `Establish distribution agreements with leading agricultural cooperative unions and agrochemical input retail chains in ${country}.`
    },
    {
      timing: 'Week 7–9',
      title: 'Deploy Multi-Location Side-by-Side Farmer Demo Plots',
      desc: `Demonstrate root development, crop vigor, and 25–30% synthetic fertilizer cost reduction on farmer field school plots across ${country}.`
    },
    {
      timing: 'Week 10–12',
      title: 'Commercial Launch & Soil Health Program Integration',
      desc: `Initiate commercial sales campaign and register ${userVariety} with national regenerative agriculture and soil subsidy schemes in ${country}.`
    }
  ] : [
    { timing: 'Day 1', title: 'Appoint Statutory Regulatory Consultant', desc: `Initiate mandatory dossier preparation for ${userCrop} (${userVariety}) targeting ${country} national authorities.` },
    { timing: 'Week 1', title: 'Formalize Field-Validation & Trial Partner', desc: `Engage national agricultural research institutes in ${country} for required multi-location verification trials for ${userCrop}.` },
    { timing: 'Week 2–3', title: 'Submit Import Permits & Technical Clearances', desc: `File phytosanitary permits, ISTA Orange Certificate verification, and non-GMO declarations with ${country} plant health authorities.` },
    { timing: 'Week 4–6', title: 'Execute Commercial Distribution Agreements', desc: `Sign distribution contracts with established regional agro-dealers and cooperatives operating across primary agricultural belts in ${country}.` },
    { timing: 'Week 7–9', title: 'Deploy Multi-Zone Farmer Demonstration Pilots', desc: `Deploy on-farm demonstration pilots to establish verified local yield data on ${userCrop} against local benchmarks.` },
    { timing: 'Week 10–12', title: 'First Commercial Consignment & Development Grants', desc: `Convert demonstration harvest results into first commercial shipments and apply for regional development financing support.` },
  ]);

  // 4. First Contacts
  const firstContacts = planData?.first_contacts || [
    {
      name: isBio ? `National Bio-Inputs & Fertilizer Directorate (${country})` : `National Plant Protection & Seed Authority (${country})`,
      desc: isBio ? 'Statutory body for bio-inoculant registration and microbial strain safety clearance.' : 'Lead statutory checkpoint for variety registration and import permits.'
    },
    {
      name: `National Investment Promotion Agency (${country})`,
      desc: 'Handles commercial business licenses, import tariff duties, and local entity setup.'
    },
    {
      name: isBio ? 'Regional Soil Health & Inoculant Harmonization Network' : 'Regional Agricultural Harmonization Framework',
      desc: isBio ? 'Facilitates regional dossier reciprocity and biofertilizer quality testing standards.' : 'Harmonised inputs, variety catalogue reciprocity, and cross-border trade.'
    }
  ];

  // 5. Funding & Partnership Windows
  const fundingWindows = planData?.funding_windows || [
    {
      name: isBio ? 'AGRA Regenerative Agriculture & Soil Health Fund' : 'AGRA Inclusive Agricultural Transformation',
      url: 'https://agra.org',
      display_url: 'agra.org',
      description: isBio
        ? `Grant co-funding prioritizing sustainable soil health, microbial inoculants, and biofertilizer adoption in ${country}.`
        : `Matching grant funding for private input distribution, seed scaling, and dealer networks in ${country}.`
    },
    {
      name: 'AfDB — TAAT (Feed Africa)',
      url: 'https://www.afdb.org',
      display_url: 'afdb.org',
      description: `Multilateral scaling grant accelerating commercial market access for certified climate-smart technologies in ${country}.`
    },
    {
      name: 'USAID Feed the Future (Agriculture & Resilience)',
      url: 'https://www.usaid.gov/agriculture-and-food-security',
      display_url: 'usaid.gov',
      description: `Direct co-funding and commercialization assistance for sustainable inputs deployed across ${country}.`
    },
    {
      name: 'IFAD Rural Value-Chain Development Fund',
      url: 'https://www.ifad.org',
      display_url: 'ifad.org',
      description: `Concessional smallholder financing and working capital support for rural distribution networks in ${country}.`
    }
  ];

  // 6. Success Metrics
  const successMetrics = planData?.success_metrics || (isBio ? [
    { horizon: '30 days', target: `Bio-regulatory dossier submitted · ${userVariety} field trial MoU signed · Cold-chain storage audit completed` },
    { horizon: '60 days', target: `On-farm bio-demo plots established (50–200 clusters) · Distributor contracts signed · Import clearance secured` },
    { horizon: '90 days', target: `Commercial retail shipment cleared · Verified root vigor/soil assay added to dossier · Soil health grant application filed` }
  ] : [
    { horizon: '30 days', target: `Regulatory consultant appointed · ${userCrop} registration filed · Research validation MoU signed` },
    { horizon: '60 days', target: 'Farmer pilot plots planted (100–500 farmers) · Commercial distribution partner signed · Import permit approved' },
    { horizon: '90 days', target: 'First commercial consignment cleared · Verified yield data added to registration dossier · Development grant filed' }
  ]);

  // 7. Dynamic Category-Specific Statutory Documents
  const bioDocumentsList = [
    {
      name: 'Biofertilizer / Biostimulant Registration Dossier',
      url: 'https://agriwelfare.gov.in/',
      authority: 'Department of Agriculture & Farmers Welfare (DA&FW)',
    },
    {
      name: 'Certificate of Analysis (CFU & Viability Assay)',
      url: 'https://www.nbair.res.in/',
      authority: 'National Bureau of Agricultural Insect Resources (ICAR-NBAIR)',
    },
    {
      name: '16-Section GHS Safety Data Sheet (MSDS/SDS)',
      url: 'https://www.fao.org/pest-and-pesticide-management',
      authority: 'FAO Pesticide Management Guidelines',
    },
    {
      name: 'Phytosanitary Export Certificate (DPPQS)',
      url: 'https://ppqs.gov.in/',
      authority: 'DPPQS India Plant Quarantine Portal',
    },
    {
      name: 'Microbial Non-Pathogenicity & Biosafety Certification',
      url: 'https://geacindia.gov.in',
      authority: 'Genetic Engineering Appraisal Committee (GEAC)',
    },
    {
      name: 'Multi-Location Bio-Efficacy Field Trial Report',
      url: 'https://icar.org.in',
      authority: 'ICAR Agrochemical & Microbial Registry',
    },
    {
      name: 'Certificate of Origin (CoO - Non-Preferential)',
      url: 'https://www.trade.gov.in/pages/certificate-of-origin',
      authority: 'Directorate General of Foreign Trade (DGFT)',
    },
    {
      name: 'Bilingual Statutory Product Label Specimen',
      url: 'https://www.fao.org/faolex',
      authority: 'FAOLEX National Input Regulation Framework',
    },
  ];

  const seedDocumentsList = [
    {
      name: 'Breeder / Foundation Seed Certificate',
      url: 'https://seedtrace.gov.in/',
      authority: 'Seed Authentication, Traceability & Holistic Inventory (SATHI)',
    },
    {
      name: 'DUS + VCU Field Trial Protocol & Data',
      url: 'https://www.upov.int',
      authority: 'UPOV / CGIAR Framework',
    },
    {
      name: 'Technical Agronomic Description Dossier',
      url: 'https://icar.org.in',
      authority: 'ICAR Technical Registry',
    },
    {
      name: 'Phytosanitary Export Certificate (DPPQS)',
      url: 'https://ppqs.gov.in/',
      authority: 'DPPQS India Plant Quarantine Portal',
    },
    {
      name: 'ISTA Orange International Seed Lot Certificate',
      url: 'https://www.seedtest.org',
      authority: 'International Seed Testing Association (ISTA)',
    },
    {
      name: 'Non-GMO Declaration & Biosafety Affidavit',
      url: 'https://geacindia.gov.in',
      authority: 'Genetic Engineering Appraisal Committee (GEAC)',
    },
    {
      name: 'Certificate of Origin (CoO - Non-Preferential)',
      url: 'https://www.trade.gov.in/pages/certificate-of-origin',
      authority: 'Directorate General of Foreign Trade (DGFT)',
    },
    {
      name: 'Certified Local-Language Variety Label Specimen',
      url: 'https://www.fao.org/faolex',
      authority: 'FAOLEX National Regulation Guidelines',
    },
  ];

  const documentsList = isBio ? bioDocumentsList : seedDocumentsList;

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO BANNER CARD */}
      <div className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#071C10_0%,#0B4223_55%,#08311B_100%)] p-7 text-white shadow-md">
        <div className="mb-2 text-md font-bold uppercase tracking-[0.16em] text-emerald-400">
          90-DAY GO-TO-MARKET · {country.toUpperCase()}
        </div>

        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          {dynamicHeaderTitle}
        </h2>

        {/* Real Context Writeup */}
        <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-3.5 backdrop-blur-xs">
          <p className="text-sm leading-relaxed text-white/90">
            <span className="font-semibold text-emerald-400">Executive Deployment Brief:</span>{' '}
            {planData?.executive_brief ||
              (isBio
                ? `Commercialization roadmap designed for ${userVariety} targeting ${userCrop} production belts in ${country}. Focused on biological registration, cold-chain distribution, and demonstrative farmer adoption.`
                : `Market deployment roadmap structured for ${userVariety} (${userCrop}) in ${country}. Focused on accelerated statutory compliance, regional field-trials, and rapid agro-dealer distribution.`)}
          </p>

          {/* Production Belts & Sowing/Application Window Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5 text-xs text-white/80">
            <span className="rounded-md bg-emerald-950/70 px-2.5 py-1 font-semibold text-emerald-300 border border-emerald-500/30">
              {isBio ? 'Target Clusters:' : 'Production Hubs:'} {planData?.production_hubs || (isBio ? `Primary ${userCrop} Agricultural Belts` : 'Primary Irrigated Schemes & High-Yield Belts')}
            </span>
            <span className="rounded-md bg-emerald-950/70 px-2.5 py-1 font-semibold text-amber-300 border border-amber-500/30">
              {isBio ? 'Application Window:' : 'Sowing Window:'} {planData?.planting_window || (isBio ? 'Basal / Vegetative Growth & Sowing Seasons' : 'Seasonal Rainfall / Supplemental Irrigation Windows')}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-white/50">SELECTED CATEGORY</span>
            <p className="mt-0.5 text-md font-semibold text-white">{selectedCategoryDisplay}</p>
          </div>
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-white/50">ESTIMATED PRICE</span>
            <p className="mt-0.5 text-md font-semibold text-white">{priceText}</p>
          </div>
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-white/50">
              {isBio ? 'TARGETED IMPACT' : 'PROVEN IMPACT (YIELD)'}
            </span>
            <p className="mt-0.5 text-md font-semibold text-white line-clamp-1">{yieldText}</p>
          </div>
        </div>
      </div>

      {/* 2. 90-DAY ACTION ROADMAP */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
          <h3 className="text-md font-bold uppercase tracking-wider text-ink">
            90-Day Action Roadmap
          </h3>
          <div className="flex items-center gap-2">
            {loading && <RefreshCw size={14} className="animate-spin text-muted" />}
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-md font-semibold text-emerald-800">
              6 milestones
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {milestones.map((m, idx) => (
            <div key={idx} className="flex items-start gap-4 rounded-xl border border-line/50 bg-cream/20 p-4 transition hover:bg-cream/40">
              <span className="flex h-7 min-w-18 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-100 px-2.5 text-md font-bold text-amber-900">
                {m.timing}
              </span>
              <div>
                <h4 className="text-md font-bold text-ink">{m.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FIRST CONTACTS */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <h3 className="mb-4 text-md font-bold uppercase tracking-wider text-ink border-b border-line pb-3">
          First Contacts — Week 1
        </h3>
        <div className="space-y-3 text-sm leading-relaxed">
          {firstContacts.map((c, idx) => (
            <div key={idx}>
              <span className="font-bold text-ink">{c.name}</span>
              <span className="text-muted"> — {c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FUNDING & PARTNERSHIP WINDOWS */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
          <h3 className="text-md font-bold uppercase tracking-wider text-ink">
            Funding &amp; Partnership Windows
          </h3>
          <span className="rounded-full border border-amber-300 bg-[#FEF9C3] px-3 py-0.5 text-md font-semibold text-amber-900">
            {regionName}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fundingWindows.map((f, idx) => (
            <a
              key={idx}
              href={formatHref(f.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-line/60 bg-cream/20 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink transition-colors group-hover:text-brand">
                  {f.name}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-md font-medium text-muted group-hover:text-brand">
                  {f.display_url || 'visit'}
                  <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted leading-relaxed group-hover:text-ink/80">
                {f.description}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* 5. DOCUMENTS TO PREPARE NOW (DYNAMIC BIO VS SEEDS) */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <h3 className="text-md font-bold uppercase tracking-wider text-ink">
            Documents to Prepare Now
          </h3>
          <span className="text-xs text-muted">
            Click any document to visit official issuing authority portal
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {documentsList.map((doc, idx) => (
            <a
              key={idx}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Issuing Authority: ${doc.authority}`}
              className="group inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-cream/30 px-4 py-2 text-sm font-medium text-ink shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-white hover:text-brand hover:shadow-xs"
            >
              <span>{doc.name}</span>
              <ExternalLink size={13} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
            </a>
          ))}
        </div>
      </div>

      {/* 6. SUCCESS METRICS */}
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
        <div className="border-b border-line px-6 py-4">
          <h3 className="text-md font-bold uppercase tracking-wider text-ink">
            Success Metrics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-cream/50 text-md font-bold uppercase tracking-wider text-label">
                <th className="w-[20%] px-6 py-3">HORIZON</th>
                <th className="w-[80%] px-6 py-3">TARGET</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {successMetrics.map((item, idx) => (
                <tr key={idx} className="hover:bg-cream/20">
                  <td className="px-6 py-3.5 font-bold text-ink">{item.horizon}</td>
                  <td className="px-6 py-3.5 text-muted leading-relaxed">{item.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. AI DEEP DIVE */}
      <div className="rounded-2xl border border-line/80 bg-paper/60 p-4.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          <span className="font-semibold text-ink">Optional AI deep-dive.</span> Generate a customized product-specific commercial narrative for {userVariety} in {country}.
        </p>
        <button
          type="button"
          onClick={() => setAiDeepDiveOpen(!aiDeepDiveOpen)}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink shadow-2xs hover:bg-cream transition"
        >
          AI deep-dive
        </button>
      </div>
    </div>
  );
}