// my-app/src/components/BioRegulatoryView.tsx
import { FileText, FlaskConical, AlertTriangle, Truck, Tag } from 'lucide-react';
import RegulatoryAnalysisLoading from '../../../UI/RegulatoryAnalysisLoading';

interface BioRegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function BioRegulatoryView({ data = {}, meta, loading }: BioRegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const compliance_requirements = data?.compliance_requirements || {};
  const trials_and_reciprocity = data?.trials_and_reciprocity || {};
  const logistics_and_customs = data?.logistics_and_customs || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = data?.country || summary.target_country || effectiveMeta.country || 'Destination Market';
  const displayRegion = data?.regionBloc || effectiveMeta.region_bloc || 'Regional Trade Bloc';
  const displayProduct = summary.technology_type || data?.technology || 'Microbial Inoculant / Biostimulant';

  // Safe Bio-Input Sub-Category Resolution
  const matchedSubCategory = 
    effectiveMeta.item_sub_category || 
    data?.item_sub_category || 
    (data as any)?.sub_category || 
    summary.category || 
    'Biological Agricultural Input';

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

  // 1. Parsing Packaging & Labeling Requirements into distinct bullets
  const rawLabeling = logistics_and_customs.labeling_rules || '';
  const labelingList = rawLabeling
    ? rawLabeling
        .split(/[,;\n]+/)
        .map((item: string) => item.trim())
        .filter(Boolean)
    : [];

  // 2. Parsing Ports of Entry vs Customs Advisory Notes
  const rawPortData = logistics_and_customs.port_inspection || '';
  const portParts = rawPortData.split(' · Notes: ');
  const mainPort = logistics_and_customs.designated_ports || portParts[0] || 'Designated International Entry Cargo Terminals';
  const rawNotes = logistics_and_customs.customs_notes || portParts[1] || '';

  const notesList = rawNotes
    ? rawNotes
        .split(';')
        .map((note: string) => note.trim())
        .filter(Boolean)
    : [];

  // 3. Parsing Risk Mitigation Strategies into distinct bullets
  const rawRisks = data?.risk_mitigation || '';
  const riskList = rawRisks
    ? rawRisks
        .split(';')
        .map((risk: string) => risk.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Statutory Authorities */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                {data?.header_title || `Biological Agricultural Inputs & Inoculant Registration Pathway — ${displayCountry}`}
              </h2>
              {/* Bio Sub-Category Badge */}
              <span className="rounded-md border border-emerald-300 bg-emerald-100/70 px-2 py-0.5 text-xs font-mono font-bold text-emerald-900">
                {matchedSubCategory}
              </span>
              {/* Selected Bio-Input Product Badge */}
              <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-800">
                🧬 BioInput Type - {displayProduct}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Trade Bloc: <span className="font-medium text-ink">{displayRegion}</span> · Governing Framework: <span className="font-medium text-ink">{authorities.governing_laws || 'National Fertilizer & Microbial Control Act'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
              Confidence {effectiveMeta.confidence_score || '98%'} 
            </span>
            <span className="rounded-full border border-amber-200 bg-[#FEF9C3] px-3 py-1 text-sm font-semibold text-amber-900">
              Timeline: {summary.estimated_timeline || '60 – 120 Days'}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-label">National Bio-Inputs & Fertilizer Authority</span>
            <p className="mt-1 text-sm font-semibold text-ink">{authorities.quarantine_authority || 'National Pesticides and Fertilizer Regulatory Authority'}</p>
          </div>
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-label">Microbial Standards & Quality Directorate</span>
            <p className="mt-1 text-sm font-semibold text-ink">{authorities.certification_body || 'Directorate of Agrochemical & Inoculant Standards'}</p>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Documents & Testing Standards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Required Statutory Documents */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                <FileText size={16} className="text-brand" /> Mandatory Bio-Input Document Checklist
              </h3>
              <span className="text-xs text-muted">HS: {compliance_requirements.hs_customs_codes?.join(', ') || '3808.99, 3101.00'}</span>
            </div>

            <div className="mb-4 rounded-xl border border-line/50 bg-cream/20 p-3">
              <span className="text-xs font-semibold text-label">Pre-Import Approval Requirement:</span>
              <p className="mt-0.5 text-sm font-medium text-ink">{compliance_requirements.import_permit || 'Mandatory Bio-Inoculant Import Permit (BIP)'}</p>
            </div>

            <ul className="space-y-2">
              {(compliance_requirements.required_documents || []).map((doc: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-ink/90">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">✓</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-line/60 bg-cream/30 p-3 text-sm">
            <span className="font-semibold text-ink">GMO & Microbial Biosafety Stance:</span>
            <p className="mt-0.5 text-muted leading-relaxed">{compliance_requirements.gmo_policy || 'Non-GMO Microbial Authentication Certificate Mandatory'}</p>
          </div>
        </div>

        {/* Right Column: Testing & Quality Protocols */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <FlaskConical size={16} className="text-brand" /> Quality, Viability & Quarantine Protocols
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Microbial Viability & Colony Benchmark (CFU):</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.ista_standards}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Mandatory Phytosanitary Declarations (AD):</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.phytosanitary_ad}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Cargo Preservation & Non-Fumigation Protocol:</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.fumigation_treatment}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Bio-Efficacy Validation & Field Trials:</span>
              <p className="mt-1 text-muted leading-relaxed">{trials_and_reciprocity.trial_rules}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Logistics, Labeling & Port Inspection */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Packaging & Labeling Box */}
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-label flex items-center gap-1.5">
              <Tag size={14} /> Packaging, Tagging & Labeling
            </span>

            {labelingList.length > 0 ? (
              <div className="mt-3.5 rounded-xl border border-line/60 bg-cream/40 p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-label block mb-2">
                  Mandatory Labeling Declarations:
                </span>
                <ul className="space-y-1.5">
                  {labelingList.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-ink/90 leading-relaxed">
                      <span className="text-brand font-bold text-sm leading-none">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                Bilingual packaging and batch specification compliance required.
              </p>
            )}
          </div>
        </div>

        {/* Ports of Entry & Customs Advisory Box */}
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-label flex items-center gap-1.5">
              <Truck size={14} /> Designated Ports of Entry & Inspection
            </span>
            <p className="mt-2 text-sm font-semibold text-ink leading-relaxed">
              {mainPort}
            </p>
          </div>

          {notesList.length > 0 && (
            <div className="mt-3.5 rounded-xl border border-line/60 bg-cream/40 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-label block mb-2">
                Logistics & Customs Clearance Notes:
              </span>
              <ul className="space-y-1.5">
                {notesList.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-ink/90 leading-relaxed">
                    <span className="text-brand font-bold text-sm leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 4. Strategic Exporter Risk Mitigation */}
      {riskList.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-900 border-b border-amber-200/80 pb-2.5 mb-3">
            <AlertTriangle size={16} className="text-amber-800 shrink-0" />
            <span className="text-sm">Key Exporter Risk Mitigation Strategy</span>
          </div>
          <ul className="space-y-2">
            {riskList.map((risk: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs font-medium text-amber-900 leading-relaxed">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-[10px] font-bold text-amber-900">
                  !
                </span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}