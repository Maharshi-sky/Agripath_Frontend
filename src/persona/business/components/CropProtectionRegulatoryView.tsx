// src/components/CropProtectionRegulatoryView.tsx
import { ShieldCheck, FileText, FlaskConical, Truck } from 'lucide-react';
import RegulatoryAnalysisLoading from '../../../UI/RegulatoryAnalysisLoading';

interface RegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function CropProtectionRegulatoryView({ data, meta, loading }: RegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const compliance = data?.compliance_requirements || {};
  const trials = data?.trials_and_reciprocity || {};
  const logistics = data?.logistics_and_customs || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = summary.target_country || effectiveMeta.country || 'Target Country';
  const displayTech = summary.technology_type || 'Crop Protection Active / Formulation';

  // Jab data fetch ho raha ho ya available na ho, visually aligned loader dikhao
  if (loading || (!data && !meta)) {
    return (
      <RegulatoryAnalysisLoading
        technologyName={displayTech}
        countryName={displayCountry}
        category="protection"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                Pesticide & Crop Protection Statutory Pathway — {displayCountry}
              </h2>
              <span className="rounded-md border border-emerald-300 bg-emerald-100/70 px-2 py-0.5 text-xs font-mono font-bold text-emerald-900">
                Pesticide & Agrochem Regulatory
              </span>
              <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700">
                {displayTech}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Statutory oversight governed by {authorities.quarantine_authority || `${displayCountry} Agrochemicals Board`} · {authorities.governing_laws || 'Pest Control Products Act'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Statutory Confidence: {effectiveMeta.confidence_score || '98%'}
            </span>
          </div>
        </div>

        {/* 4-Column Quick Metrics Strip */}
        <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
          <div className="rounded-xl border border-line/60 bg-paper/60 p-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Competent Authority</span>
            <span className="mt-1 block text-sm font-semibold text-ink truncate">
              {authorities.quarantine_authority || 'PCPB / National Board'}
            </span>
          </div>
          <div className="rounded-xl border border-line/60 bg-paper/60 p-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Registration Timeline</span>
            <span className="mt-1 block text-sm font-semibold text-ink">
              {summary.estimated_timeline || '90 – 180 Days'}
            </span>
          </div>
          <div className="rounded-xl border border-line/60 bg-paper/60 p-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Statutory Fees</span>
            <span className="mt-1 block text-sm font-semibold text-ink">
              {summary.estimated_cost || '$2,500 – $5,000 USD'}
            </span>
          </div>
          <div className="rounded-xl border border-line/60 bg-paper/60 p-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Field Bio-Efficacy</span>
            <span className="mt-1 block text-sm font-semibold text-emerald-800">
              {trials.trial_rules ? '2-Season Mandatory' : 'Efficacy Trials Req.'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Compliance Dossier & Testing Protocols */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Required Mandatory Documents */}
        <div className="lg:col-span-6 rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <FileText className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
              Mandatory Statutory Dossier Requirements
            </h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Pre-Import Clearance</span>
              <p className="text-sm text-slate-600">
                {compliance.import_permit || 'Commercial Agrochemical Import Permit issued by statutory registrar.'}
              </p>
            </div>

            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Technical Dossier Components</span>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {(compliance.required_documents || [
                  'Full Chemical Characterization & 5-Batch A.I. Assay',
                  'Toxicology & Ecotoxicology Evaluation Report',
                  'Local Bio-Efficacy Multi-Location Trial Dossier',
                  'GHS Classification & Safety Data Sheet (SDS)'
                ]).map((doc: string, dIdx: number) => (
                  <li key={dIdx}>{doc}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">International Standard References</span>
              <p className="text-sm font-mono text-slate-700">
                {compliance.ista_standards || 'FAO/WHO Pesticide Specifications & CIPAC Analytical Methods'}
              </p>
            </div>
          </div>
        </div>

        {/* Quarantine, Residue & Field Trials */}
        <div className="lg:col-span-6 rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <FlaskConical className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
              Field Bio-Efficacy & Ecotoxicology Protocols
            </h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Multi-Season Efficacy Mandate</span>
              <p className="text-sm text-slate-600">
                {trials.trial_rules || 'Minimum 2 distinct growing seasons across authorized national agro-ecological trial sites under accredited agronomist supervision.'}
              </p>
            </div>

            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Residue Limits (MRLs) & Environmental Safety</span>
              <p className="text-sm text-slate-600">
                {compliance.phytosanitary_ad || 'Standard Codex Alimentarius / National MRL compliance. Leaching and non-target pollinator toxicity clearance required.'}
              </p>
            </div>

            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Regional Data Reciprocity</span>
              <p className="text-sm text-slate-600">
                {trials.reciprocity || 'Harmonized regional trial data (e.g. EAC / ECOWAS agrochem guidelines) recognized subject to local verification.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Logistics, Labeling & Customs Tariffs */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <Truck className="h-4 w-4 text-emerald-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
            Customs Tariffs, Labeling & Dangerous Goods Logistics
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
            <span className="text-xs font-bold text-slate-800 uppercase block mb-1">HS Customs Codes</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {(compliance.hs_customs_codes || ['3808.91', '3808.92', '3808.93']).map((code: string, idx: number) => (
                <span key={idx} className="bg-white border border-slate-300 font-mono text-xs px-2 py-0.5 rounded font-semibold text-slate-800">
                  {code}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
            <span className="text-xs font-bold text-slate-800 uppercase block mb-1">GHS Packaging & Labeling</span>
            <p className="text-sm text-slate-600 mt-1">
              {logistics.labeling_rules || 'Bilingual label (English + National language), GHS pictograms, active % declaration, and national registration number printed.'}
            </p>
          </div>

          <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
            <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Port Hazardous Handling</span>
            <p className="text-sm text-slate-600 mt-1">
              {compliance.fumigation_treatment || 'UN-certified packaging for hazardous chemical cargo; designated spill containment verification upon customs release.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}