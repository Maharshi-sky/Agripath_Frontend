// src/persona/farmer/components/FertilizerRegulatoryView.tsx
import { ShieldCheck, AlertCircle, FileCheck, CheckCircle2 } from "lucide-react";
import RegulatoryAnalysisLoading from "../../../UI/RegulatoryAnalysisLoading";

interface FertilizerRegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function FertilizerRegulatoryView({ data, meta, loading }: FertilizerRegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const compliance = data?.compliance_requirements || {};
  const tests = data?.adulteration_and_quality_tests || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = data?.country || summary.target_country || effectiveMeta.country || 'Target Country';
  const displayProduct = summary.technology_type || data?.technology || 'Commercial Fertilizer Formulation';
  const governingLaws = authorities.governing_laws || 'National Fertilizer Application & Soil Protection Directive';

  if (loading || (!data && !meta)) {
    return (
      <RegulatoryAnalysisLoading
        technologyName={displayProduct}
        countryName={displayCountry}
        category="fertilizer"
      />
    );
  }

  const ppeList: string[] = Array.isArray(compliance.safe_handling_ppe)
    ? compliance.safe_handling_ppe
    : [
        'Waterproof chemical-resistant gloves during manual handling',
        'Dust/particle respirator mask when loading mechanical broadcasters',
        'Eye protection goggles during foliar spraying or localized banding'
      ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                {data?.header_title || `Government Schemes, Subsidies & Approved Usage Guidelines — ${displayCountry}`}
              </h2>
              <span className="rounded-md border border-emerald-300 bg-emerald-100/70 px-2 py-0.5 text-xs font-mono font-bold text-emerald-900">
                Farmer Advisory
              </span>
              <span className="rounded-md border border-line bg-cream/40 px-2.5 py-0.5 text-xs font-mono font-bold text-ink">
                Grade: {displayProduct}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Regulatory Scope: <span className="font-medium text-ink">{effectiveMeta.regulatory_scope || 'On-Farm Compliance & Soil Conservation'}</span> · Framework: <span className="font-medium text-ink">{governingLaws}</span>
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
              Agricultural Extension & Oversight
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.extension_authority || summary.oversight_body || 'District Agricultural Extension Directorate'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {summary.permit_status || 'Over-The-Counter Retail Sourcing (No Import License Required for Farmers)'}
            </p>
          </div>
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-label block">
              Standards & Anti-Counterfeit Board
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.standards_board || 'National Standards Bureau / Fertilizer Inspection Directorate'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {summary.application_compliance || 'Adherence to Maximum Recommended Dose Per Hectare'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Two Column Section: Authorized Sourcing & Approved Usage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Authorized Retail & Sourcing Checklist */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-700" />
                Authorized Sourcing & Bag Verification
              </h3>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                MoFA / Extension Approved
              </span>
            </div>

            <div className="mb-4 rounded-xl border border-line/50 bg-cream/20 p-3.5">
              <span className="text-xs font-bold text-label uppercase tracking-wider block">Retail Sourcing Verification:</span>
              <p className="mt-1 text-sm text-ink leading-relaxed">
                {compliance.sourcing_check || 'Purchase only from accredited agro-dealers; verify batch hologram, national subsidy seal, and printed expiry date.'}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-label uppercase tracking-wider block">Field Application & Environmental Safety:</span>
              
              <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
                <span className="font-semibold text-xs text-ink uppercase tracking-wider block">Max Dosage & Soil Limits:</span>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {compliance.field_dosage_limits || 'Max recommended nitrogen/elemental loading must not exceed regional agro-ecological zone caps to avoid soil acidification.'}
                </p>
              </div>

              <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
                <span className="font-semibold text-xs text-ink uppercase tracking-wider block">Waterways Buffer Zone:</span>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {compliance.environmental_buffer || 'Maintain minimum 15-meter buffer from open streams, borehole wells, and livestock water points during application.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line/60 bg-cream/30 p-3 text-xs">
            <span className="font-semibold text-ink block mb-0.5">Safe On-Farm Storage Protocol:</span>
            <p className="text-muted leading-relaxed">
              {compliance.storage_protocol || 'Store on raised wooden pallets in well-ventilated dry sheds away from domestic animals and food grain stores.'}
            </p>
          </div>
        </div>

        {/* Right: Anti-Counterfeit Tests & Worker PPE */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Quality Checks & On-Farm Safety
            </h3>
            <span className="text-xs text-muted">Field Inspection</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-line/50 p-3.5 bg-cream/20">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider block">Granule Visual Inspection:</span>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {tests.visual_inspection || 'Granules must be uniform, dry, free-flowing with zero sticky cakes or unnatural discolored lumps.'}
              </p>
            </div>

            <div className="rounded-xl border border-line/50 p-3.5 bg-cream/20">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider block">Quick Dissolution Test:</span>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {tests.quick_water_test || 'Quality fertilizer dissolves completely in water without heavy insoluble sand, dirt, or clay residues.'}
              </p>
            </div>

            <div className="rounded-xl border border-line/50 p-3.5 bg-cream/20">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider block">Reporting Suspicious / Counterfeit Stock:</span>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {tests.reporting_procedure || 'Report unsealed bags or suspected counterfeit batches immediately to the local Ward Extension Officer or District Directorate.'}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
              <span className="font-semibold text-xs text-emerald-950 uppercase tracking-wider block mb-2">Mandatory Field Application PPE:</span>
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

      {/* 3. Penalty & Agronomic Risk Advisory */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4.5 text-sm shadow-xs">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-xs uppercase tracking-wider">
          <AlertCircle className="h-4 w-4 text-amber-800" />
          <span>Statutory Soil Health Advisory & Penalty Notice</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-900">
          {data?.penalty_and_risk_advisory || 'Applying uncalibrated excess doses risks permanent soil acidification, root scorching, groundwater contamination, and forfeiture of eligibility for government subsidized input vouchers.'}
        </p>
      </div>
    </div>
  );
}