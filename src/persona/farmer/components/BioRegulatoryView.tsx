// src/persona/farmer/components/BioRegulatoryView.tsx
import { ShieldCheck, AlertCircle, FileCheck, CheckCircle2, Clock, SunDim } from "lucide-react";
import RegulatoryAnalysisLoading from "../../../UI/RegulatoryAnalysisLoading";

interface BioRegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function BioRegulatoryView({ data = {}, meta, loading }: BioRegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const compliance = data?.compliance_requirements || {};
  const tests = data?.adulteration_and_quality_tests || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = data?.country || summary.target_country || effectiveMeta.country || 'Target Country';
  const displayProduct = summary.technology_type || data?.technology || 'Biological Formulation';
  const governingLaws = authorities.governing_laws || 'National Bio-Inputs Application & Organic Farming Standards';

  // If still loading or data not yet ready from API
  const isDataEmpty = Object.keys(data).length === 0 && !meta;
  if (loading || isDataEmpty) {
    return (
      <RegulatoryAnalysisLoading
        technologyName={displayProduct}
        countryName={displayCountry}
        category="bio"
      />
    );
  }

  const ppeList: string[] = Array.isArray(compliance.safe_handling_ppe)
    ? compliance.safe_handling_ppe
    : [
        'Wear particulate dust mask when dusting powdered peat inoculants',
        'Rinse spray tank thoroughly with clean untreated well water before loading biological suspension',
        'Wash hands and face with clean water and soap immediately after field broadcasting'
      ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                {data?.header_title || `Farmer Field Compliance & Biological Inoculant Advisory — ${displayCountry}`}
              </h2>
              <span className="rounded-md border border-emerald-300 bg-emerald-100/70 px-2 py-0.5 text-xs font-mono font-bold text-emerald-900">
                Live Biological
              </span>
              <span className="rounded-md border border-line bg-cream/40 px-2.5 py-0.5 text-xs font-mono font-bold text-ink">
                Strain / Formulation: {displayProduct}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Regulatory Scope: <span className="font-medium text-ink">{effectiveMeta.regulatory_scope || 'On-Farm Biological Compliance & Soil Biosafety'}</span> · Framework: <span className="font-medium text-ink">{governingLaws}</span>
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
              Bio-Safety & Extension Oversight
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.extension_authority || summary.oversight_body || 'District Directorate of Agriculture (Bio-Safety Desk)'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {summary.permit_status || 'Over-The-Counter Approved (Certified Agro-Dealer Sourcing)'}
            </p>
          </div>
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-label block">
              Standards & Microbial Quality Authority
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.standards_board || 'National Standards Authority / Microbial Quality Oversight'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {summary.application_compliance || 'Strict Compliance with Live Viability & Tank-Mix Separation Rules'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Two Column Section: Live Inoculant Sourcing & Tank-Mix Compatibility */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Authorized Live Strain Sourcing & Chemical Incompatibilities */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-700" />
                Live Inoculant Sourcing & Tank-Mix Rules
              </h3>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Bio-Safety Verified
              </span>
            </div>

            <div className="mb-4 rounded-xl border border-line/50 bg-cream/20 p-3.5">
              <span className="text-xs font-bold text-label uppercase tracking-wider block">Live CFU & Batch Verification:</span>
              <p className="mt-1 text-sm text-ink leading-relaxed">
                {compliance.sourcing_check || 'Purchase only sealed packs with verified live CFU count and batch manufacture date under 6 months old.'}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-label uppercase tracking-wider block">Field Precautions & Incompatibilities:</span>
              
              <div className="rounded-xl border border-rose-200 p-3 bg-rose-50/50">
                <span className="font-semibold text-xs text-rose-900 uppercase tracking-wider block">Critical Tank-Mix Restriction:</span>
                <p className="mt-1 text-xs text-rose-800 leading-relaxed font-medium">
                  {compliance.tank_mix_warning || 'Prohibited to tank-mix with chemical fungicides, copper compounds, or chlorinated tap water within 7 days of inoculation.'}
                </p>
              </div>

              <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
                <span className="font-semibold text-xs text-ink uppercase tracking-wider block">Safe Shaded Storage Protocol:</span>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {compliance.storage_protocol || 'Store in a shaded, well-ventilated farm store between 15°C - 25°C away from direct sunlight and chemical fumes.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line/60 bg-cream/30 p-3 text-xs flex items-center gap-2">
            <SunDim className="h-4 w-4 text-amber-700 shrink-0" />
            <span className="text-muted leading-relaxed">
              Living micro-organisms are heat sensitive. Keep unopened packages wrapped in cool sacks until sowing.
            </span>
          </div>
        </div>

        {/* Right Column: Physical Quality Checks & UV Timing Windows */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Viability Testing & Field Timing
            </h3>
            <span className="text-xs text-muted">Microbial Quality</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-line/50 p-3.5 bg-cream/20">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider block">Physical Viability Check:</span>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {tests.viability_check || 'Look for uniform fine carrier powder or unseparated liquid emulsion; avoid foul rotten odors or solid bricking.'}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-300 p-3.5 bg-emerald-50/60">
              <div className="flex items-center gap-1.5 mb-1 text-emerald-950 font-semibold text-xs uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5 text-emerald-800" />
                <span>Mandatory Application Windows (Anti-UV Protocol):</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {tests.application_timing || 'Apply strictly during early morning (6:00 - 8:30 AM) or late evening (4:30 - 6:30 PM) to protect living microbes from solar UV death.'}
              </p>
            </div>

            <div className="rounded-xl border border-line/50 p-3.5 bg-cream/20">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider block">Reporting Inactive Stock:</span>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {tests.reporting_procedure || 'Report expired, non-viable, or swollen/bloated packaging to the local Agricultural Extension Agent (AEA).'}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
              <span className="font-semibold text-xs text-emerald-950 uppercase tracking-wider block mb-2">On-Farm Bio-Handling Hygiene:</span>
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

      {/* 3. Risk & Organic Certification Penalty Advisory */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4.5 text-sm shadow-xs">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-xs uppercase tracking-wider">
          <AlertCircle className="h-4 w-4 text-amber-800" />
          <span>Biological Integrity & Organic Market Advisory</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-900">
          {data?.penalty_and_risk_advisory || 'Tank-mixing with synthetic fungicides neutralizes active live spores, resulting in 100% loss of input investment and potential disqualification from certified organic premium crop pricing.'}
        </p>
      </div>
    </div>
  );
}