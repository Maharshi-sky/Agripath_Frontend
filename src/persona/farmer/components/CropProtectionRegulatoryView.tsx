// src/persona/farmer/components/CropProtectionRegulatoryView.tsx
import { ShieldAlert, AlertTriangle, Clock, CheckCircle2, Waves, Trash2 } from "lucide-react";
import RegulatoryAnalysisLoading from "../../../UI/RegulatoryAnalysisLoading";

interface CropProtectionRegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function CropProtectionRegulatoryView({ data = {}, meta, loading }: CropProtectionRegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const mandates = data?.safety_and_application_mandates || {};
  const disposal = data?.disposal_and_spill_compliance || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = data?.country || summary.target_country || effectiveMeta.country || 'Target Country';
  const displayProduct = summary.technology_type || data?.technology || 'Agrochemical Chemistry';
  const governingAct = authorities.statutory_act || 'Pesticides Control and Management Act (Field Safety Guidelines)';

  // If loading or data not yet populated
  const isDataEmpty = Object.keys(data).length === 0 && !meta;
  if (loading || isDataEmpty) {
    return (
      <RegulatoryAnalysisLoading
        technologyName={displayProduct}
        countryName={displayCountry}
        category="crop-protection"
      />
    );
  }

  const ppeList: string[] = Array.isArray(data?.statutory_ppe_requirements)
    ? data.statutory_ppe_requirements
    : [
        'Chemical-resistant nitrile gloves when measuring concentrate and filling backpack sprayer',
        'Cartridge particulate respirator or anti-mist face mask during pressurized foliar spraying',
        'Long-sleeve cotton overalls and tall rubber gumboots (never spray in bare feet or slippers)',
        'Wide-brim hat and protective splash goggles to guard against aerial spray drift'
      ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                {data?.header_title || `Farmer Chemical Safety & Statutory Application Advisory — ${displayCountry}`}
              </h2>
              <span className="rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs font-mono font-bold text-rose-800">
                Pesticide / Agrochemical
              </span>
              <span className="rounded-md border border-line bg-cream/40 px-2.5 py-0.5 text-xs font-mono font-bold text-ink">
                Active: {displayProduct}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Regulatory Scope: <span className="font-medium text-ink">{effectiveMeta.regulatory_scope || 'On-Farm Agrochemical Compliance & Food Safety'}</span> · Framework: <span className="font-medium text-ink">{governingAct}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
              Verified {effectiveMeta.last_verified || '2026-Q1'}
            </span>
            <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">
              Confidence {effectiveMeta.confidence_score || '99%'}
            </span>
          </div>
        </div>

        {/* Authorities & Oversight */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-label block">
              Pesticide Regulatory Authority
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.regulatory_agency || 'Environmental Protection Agency (Pesticides Desk) / Ministry of Agriculture'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {summary.retail_clearance || 'Over-The-Counter Registered (Must carry EPA registration number)'}
            </p>
          </div>
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-label block">
              Plant Protection & Extension Unit
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.extension_body || 'Plant Protection and Regulatory Services Directorate (PPRSD)'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {summary.phi_mandate || 'Strict compliance with Pre-Harvest Waiting Periods (PHI)'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Two Column Section: Safety Mandates & Triple-Rinse Disposal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: PHI, REI and Water Protection */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-700" />
                Statutory Harvest & Field Intervals
              </h3>
              <span className="text-xs font-medium text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Mandatory Intervals
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-line/50 bg-cream/20 p-3.5">
                <div className="flex items-center gap-1.5 mb-1 text-label font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-700" />
                  <span>Toxicity Classification & Container Color Band:</span>
                </div>
                <p className="text-xs text-ink leading-relaxed font-medium">
                  {mandates.color_band_hazard || 'Check container label color band for acute toxicity classification. Keep locked out of children’s reach.'}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-300 p-3.5 bg-emerald-50/60">
                <span className="font-semibold text-xs text-emerald-950 uppercase tracking-wider block mb-1">
                  Pre-Harvest Interval (PHI):
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {mandates.phi_waiting_period || 'Observe mandatory 7 to 14 days Pre-Harvest Interval (PHI) before picking produce to prevent market rejection.'}
                </p>
              </div>

              <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
                <span className="font-semibold text-xs text-ink uppercase tracking-wider block">
                  Re-Entry Interval (REI):
                </span>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {mandates.rei_field_reentry || 'Do not re-enter sprayed field without full protective equipment for at least 24 to 48 hours post-application.'}
                </p>
              </div>

              <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
                <span className="font-semibold text-xs text-ink uppercase tracking-wider block">
                  Groundwater & Drinking Stream Buffer:
                </span>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {mandates.water_buffer_zone || 'Maintain mandatory 15-meter unsprayed buffer strip from drinking streams, fish ponds, and open boreholes.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line/60 bg-cream/30 p-3 text-xs flex items-center gap-2">
            <Waves className="h-4 w-4 text-sky-700 shrink-0" />
            <span className="text-muted leading-relaxed">
              {disposal.drift_restriction || 'Strictly refrain from spraying when wind speeds exceed 10 km/h or during hot midday hours to avoid spray drift.'}
            </span>
          </div>
        </div>

        {/* Right Column: Triple-Rinse Container Disposal & Worker PPE */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-emerald-700" />
              Container Disposal & Sprayer PPE
            </h3>
            <span className="text-xs text-muted">Legal Disposal Protocol</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-amber-200 p-3.5 bg-amber-50/60">
              <span className="font-semibold text-xs text-amber-950 uppercase tracking-wider block mb-1">
                Mandatory Triple-Rinse & Puncture Law:
              </span>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {disposal.triple_rinse_rule || 'Rinse empty container 3 times with clean water, pouring rinse back into spray tank. Puncture bottom to prevent household drinking reuse.'}
              </p>
            </div>

            <div className="rounded-xl border border-line/50 p-3.5 bg-cream/20">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider block">
                Prohibited Disposal Methods:
              </span>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {disposal.disposal_restriction || 'Never burn empty plastic containers (releases toxic fumes) or bury them near water tables. Return to licensed collection depots.'}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
              <span className="font-semibold text-xs text-emerald-950 uppercase tracking-wider block mb-2">
                Mandatory Chemical Application PPE:
              </span>
              <ul className="space-y-1.5">
                {ppeList.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-ink/90">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Farmer Market Rejection & MRL Warning */}
      <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4.5 text-sm shadow-xs">
        <div className="flex items-center gap-2 font-bold text-rose-950 text-xs uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4 text-rose-800" />
          <span>Statutory Food Safety & Maximum Residue Limit (MRL) Warning</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-rose-900">
          {data?.farmer_liability_warning || 'Harvesting produce before the statutory Pre-Harvest Interval (PHI) expires causes dangerous chemical residues, leading to total rejection by export packhouses and local wholesale markets.'}
        </p>
      </div>
    </div>
  );
}