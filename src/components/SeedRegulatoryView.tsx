// src/components/SeedRegulatoryView.tsx
import RegulatoryAnalysisLoading from '../UI/RegulatoryAnalysisLoading';

interface SeedRegulatoryViewProps {
  data?: {
    country?: string;
    regionBloc?: string;
    technology?: string;
    crop?: string;
    authorities?: {
      quarantine_authority?: string;
      certification_body?: string;
      governing_laws?: string;
    };
    summary?: {
      target_country?: string;
      category?: string;
      technology_type?: string;
      regulatory_authority?: string;
      estimated_timeline?: string;
      estimated_cost?: string;
    };
    compliance_requirements?: {
      import_permit?: string;
      required_documents?: string[];
      phytosanitary_ad?: string;
      fumigation_treatment?: string;
      ista_standards?: string;
      gmo_policy?: string;
      hs_customs_codes?: string[];
    };
    trials_and_reciprocity?: {
      trial_rules?: string;
      reciprocity?: string;
    };
    logistics_and_customs?: {
      labeling_rules?: string;
      port_inspection?: string;
    };
    risk_mitigation?: string;
    meta?: {
      source?: string;
      confidence_score?: string;
      country?: string;
      region_bloc?: string;
      crop_type?: string;
      item_sub_category?: string;
    };
  };
  meta?: {
    source?: string;
    confidence_score?: string;
    country?: string;
    region_bloc?: string;
    crop_type?: string;
    item_sub_category?: string;
  };
  loading?: boolean;
}

export default function SeedRegulatoryView({ data = {}, meta, loading }: SeedRegulatoryViewProps) {
  const authorities = data.authorities || {};
  const compliance_requirements = data.compliance_requirements || {};
  const trials_and_reciprocity = data.trials_and_reciprocity || {};
  const logistics_and_customs = data.logistics_and_customs || {};
  const summary = data.summary || {};
  const effectiveMeta = meta || data.meta || {};

  const displayCountry = data.country || summary.target_country || effectiveMeta.country || 'Target Country';
  const displayRegion = data.regionBloc || effectiveMeta.region_bloc || 'Regional Harmonization Framework';
  const displayProduct = summary.technology_type || data.technology || 'Certified Seed Variety';

  const matchedSubCategory = 
    effectiveMeta.item_sub_category || 
    effectiveMeta.crop_type || 
    data.crop || 
    summary.category || 
    'Commercial Hybrid / Seed Variety';

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

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Statutory Authorities */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                Seed Import & Quarantine Pathway — {displayCountry}
              </h2>
              <span className="rounded-md border border-emerald-300 bg-emerald-100/70 px-2 py-0.5 text-sm font-mono font-bold text-emerald-900">
                {matchedSubCategory}
              </span>
              <span className="rounded-md border border-sky-300 bg-sky-100/70 px-2.5 py-0.5 text-sm font-mono font-bold text-sky-900">
                Seed Type - {displayProduct}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Trade Bloc: <span className="font-medium text-ink">{displayRegion}</span> · Framework: <span className="font-medium text-ink">{authorities.governing_laws || 'National Seed & Plant Protection Act'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
              Confidence {effectiveMeta.confidence_score || '98%'} 
            </span>
            <span className="rounded-full border border-amber-200 bg-[#FEF9C3] px-3 py-1 text-sm font-semibold text-amber-900">
              Timeline: {summary.estimated_timeline || '30 - 45 Days'}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-md font-bold uppercase tracking-wider text-label">National Plant Quarantine Authority (NPPO)</span>
            <p className="mt-1 text-sm font-semibold text-ink">{authorities.quarantine_authority || 'Ministry of Agriculture / NPPO'}</p>
          </div>
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-md font-bold uppercase tracking-wider text-label">National Seed Certification Body</span>
            <p className="mt-1 text-sm font-semibold text-ink">{authorities.certification_body || 'National Seed Authority'}</p>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Documents & Seed Quality Standards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-md font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                Mandatory Export Document Checklist
              </h3>
              <span className="text-sm text-muted">HS: {compliance_requirements.hs_customs_codes?.join(', ') || '1209.91, 1209.99'}</span>
            </div>

            <div className="mb-4 rounded-xl border border-line/50 bg-cream/20 p-3">
              <span className="text-sm font-semibold text-label">Import Permit Requirement:</span>
              <p className="mt-0.5 text-sm font-medium text-ink">{compliance_requirements.import_permit || 'Plant Import Permit (PIP) Mandatory'}</p>
            </div>

            <ul className="space-y-2">
              {(compliance_requirements.required_documents || [
                'Phytosanitary Certificate (DPPQS India)',
                'ISTA Orange International Seed Lot Certificate',
                'Certificate of Origin (CoO)',
                'Non-GMO Declaration'
              ]).map((doc: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-ink/90">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">✓</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-line/60 bg-cream/30 p-3 text-sm">
            <span className="font-semibold text-ink">GMO & Biosafety Stance:</span>
            <p className="mt-0.5 text-muted">{compliance_requirements.gmo_policy || 'Non-GMO Certification Required'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
              Quality, Quarantine & Testing Protocols
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">ISTA & Seed Quality Benchmark:</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.ista_standards || 'ISTA Orange Lot Certificate required.'}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Mandatory Phytosanitary Declarations (AD):</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.phytosanitary_ad || 'Standard pest freedom declaration required.'}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Pre-Shipment Fumigation & Seed Treatment:</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.fumigation_treatment || 'Methyl Bromide / Seed Dressing as per NPPO specs.'}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Variety Registration & Trials (DUS/VCU):</span>
              <p className="mt-1 text-muted leading-relaxed">{trials_and_reciprocity.trial_rules || 'National Catalogue Registration required.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Logistics, Labeling & Port Inspection */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <span className="text-md font-bold uppercase tracking-wider text-label">Packaging, Tagging & Labeling</span>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{logistics_and_customs.labeling_rules || 'Bilingual labeling and batch details mandatory.'}</p>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <span className="text-md font-bold uppercase tracking-wider text-label">Port of Entry & PEQ Sampling</span>
          <p className="mt-2 text-sm leading-relaxed text-ink">{logistics_and_customs.port_inspection || 'Port inspection & quarantine sampling at arrival.'}</p>
        </div>
      </div>

      {/* 4. Strategic Exporter Risk Mitigation Callout */}
      {data.risk_mitigation && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <span>Key Exporter Risk Mitigation Strategy</span>
          </div>
          <p className="mt-1.5 leading-relaxed text-amber-800">
            {data.risk_mitigation}
          </p>
        </div>
      )}
    </div>
  );
}