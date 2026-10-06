// src/persona/farmer/components/SeedRegulatoryView.tsx
import { ShieldAlert, AlertTriangle, CheckCircle2, QrCode, Tag, Scale, FileText } from "lucide-react";
import RegulatoryAnalysisLoading from "../../../UI/RegulatoryAnalysisLoading";

interface SeedRegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function SeedRegulatoryView({ data = {}, meta, loading }: SeedRegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const verification = data?.seed_tag_and_authenticity_verification || {};
  const compensation = data?.farmer_rights_and_failure_compensation || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = data?.country || summary.target_country || effectiveMeta.country || 'Target Country';
  const displayProduct = summary.technology_type || data?.technology || 'Certified Seed Variety';
  const governingLaws = authorities.governing_laws || 'National Seed Act & Plant Variety Protection (PVP) Guidelines';

  // If loading or data not ready
  const isDataEmpty = Object.keys(data).length === 0 && !meta;
  if (loading || isDataEmpty) {
    return (
      <RegulatoryAnalysisLoading
        technologyName={displayProduct}
        countryName={displayCountry}
        category="seeds"
      />
    );
  }

  const warningsList: string[] = Array.isArray(data?.safe_handling_and_treatment_warnings)
    ? data.safe_handling_and_treatment_warnings
    : [
        'Chemically treated seeds (dyed pink, purple, or green) are lethal if consumed by humans or livestock',
        'Never wash treated seeds to feed domestic poultry or brew alcohol (chemical penetrates seed coat)',
        'Wear rubber gloves when handling seed drills or manual dibbling to prevent dermal fungicide absorption',
        'Burn empty seed packaging or bury it away from water sources; never reuse seed bags for food storage'
      ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                {data?.header_title || `Farmer Certified Seed Quality & Statutory Rights Advisory — ${displayCountry}`}
              </h2>
              <span className="rounded-md border border-emerald-300 bg-emerald-100/70 px-2 py-0.5 text-xs font-mono font-bold text-emerald-900">
                Certified Seed
              </span>
              <span className="rounded-md border border-line bg-cream/40 px-2.5 py-0.5 text-xs font-mono font-bold text-ink">
                Variety: {displayProduct}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Regulatory Scope: <span className="font-medium text-ink">{effectiveMeta.regulatory_scope || 'On-Farm Certified Seed Compliance & Consumer Protection'}</span> · Framework: <span className="font-medium text-ink">{governingLaws}</span>
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
              National Seed Certification Authority
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.seed_certification_body || 'National Seed Inspection & Certification Agency / Ministry of Agriculture'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Tag: {summary.tag_status || 'Official Certified Seed Tag (Class 1 / Certified Blue Label)'}
            </p>
          </div>
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-label block">
              Consumer Redressal & Germination Standards
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.consumer_protection || 'Seed Trade Association & Plant Genetic Resources Directorate'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Standard: {summary.statutory_germination_standard || 'Min 85% Germination & 98% Physical Purity'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Two Column Section: Tag Verification & Failure Compensation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Tamper-Evident Verification */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-700" />
                Anti-Counterfeit Tag Verification
              </h3>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Official Certification
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-line/50 bg-cream/20 p-3.5">
                <div className="flex items-center gap-1.5 mb-1 text-label font-bold text-xs uppercase tracking-wider">
                  <Tag className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Stitched Certification Tag Rule:</span>
                </div>
                <p className="text-xs text-ink leading-relaxed font-medium">
                  {verification.official_color_tag || 'Verify genuine stitched Blue Tag for Certified 1st Generation seed; look for official national seed agency seal.'}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-300 p-3.5 bg-emerald-50/60">
                <div className="flex items-center gap-1.5 mb-1 text-emerald-950 font-semibold text-xs uppercase tracking-wider">
                  <QrCode className="h-3.5 w-3.5 text-emerald-800" />
                  <span>Scratch-Off SMS Batch Verification:</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {verification.sms_verification_code || 'Scratch silver panel on packet and send free SMS code to the national seed verification portal to confirm genuine batch before opening.'}
                </p>
              </div>

              <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
                <div className="flex items-center gap-1.5 mb-1 text-label font-bold text-xs uppercase tracking-wider">
                  <FileText className="h-3.5 w-3.5 text-slate-700" />
                  <span>Proof of Purchase Retention:</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {verification.invoice_retention_rule || 'Retain official stamped cash receipt and keep 1 unopened 100g sample packet with lot number intact for legal evidence in case of crop failure.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line/60 bg-cream/30 p-3 text-xs flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-700 shrink-0" />
            <span className="text-muted leading-relaxed">
              Never buy seed from opened or torn bags. Re-bagged seed carries zero statutory legal protection.
            </span>
          </div>
        </div>

        {/* Right Column: Chemical Seed Treatment & Legal Redressal */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-700" />
              Treatment Safety & Failure Claims
            </h3>
            <span className="text-xs text-muted">Legal Rights</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
              <span className="font-semibold text-xs text-rose-950 uppercase tracking-wider block mb-2">
                Mandatory Chemical Seed-Dressing Warnings:
              </span>
              <ul className="space-y-1.5">
                {warningsList.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-line/50 p-3.5 bg-cream/20">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider block mb-1">
                Germination Complaint Window:
              </span>
              <p className="text-xs text-muted leading-relaxed">
                {compensation.germination_complaint_window || 'Report emergence failure to the District Agricultural Office (DAO) within 14 days of sowing date.'}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 p-3.5 bg-amber-50/60">
              <span className="font-semibold text-xs text-amber-950 uppercase tracking-wider block mb-1">
                Statutory Compensation Rights:
              </span>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {compensation.statutory_redressal || 'Verified sub-standard seed entitles the farmer to 100% seed cost refund and replacement seed under the National Consumer Rights & Seed Act.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Biosecurity Warning */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4.5 text-sm shadow-xs">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-xs uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4 text-amber-800" />
          <span>Biosecurity Warning: Risk of Uncertified Sowing Grain</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-900">
          {data?.farmer_liability_warning || 'Sowing uncertified grain sold as seed risks introducing catastrophic seed-borne viral and bacterial wilt pathogens into your soil, which can remain dormant and contaminate your farm for decades.'}
        </p>
      </div>
    </div>
  );
}