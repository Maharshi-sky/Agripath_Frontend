// src/components/FertilizerRegulatoryView.tsx
import RegulatoryAnalysisLoading from '../../../UI/RegulatoryAnalysisLoading';

interface FertilizerRegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function FertilizerRegulatoryView({ data, meta, loading }: FertilizerRegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const compliance_requirements = data?.compliance_requirements || {};
  const trials_and_reciprocity = data?.trials_and_reciprocity || {};
  const logistics_and_customs = data?.logistics_and_customs || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = data?.country || summary.target_country || effectiveMeta.country || 'Target Country';
  const displayRegion = data?.regionBloc || effectiveMeta.region_bloc || 'Regional Fertilizer Trade Framework';

  // Safe Subcategory Resolution
  const matchedSubCategory = effectiveMeta.item_sub_category || data?.item_sub_category || 'NPK/Complex Chemical Fertilizers';
  // Selected Fertilizer Product / Formulation Name
  const displayProduct = summary.technology_type || data?.technology || 'Commercial Fertilizer Formulation';

  // Data fetching ya evaluation ke waqt naya Regulatory loader render karo
  if (loading || (!data && !meta)) {
    return (
      <RegulatoryAnalysisLoading
        technologyName={displayProduct}
        countryName={displayCountry}
        category="fertilizer"
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
                Fertilizer Statutory Import & Registration Pathway — {displayCountry}
              </h2>
              {/* Ollama Selected Sub-Category Badge */}
              <span className="rounded-md border border-emerald-300 bg-emerald-100/70 px-2 py-0.5 text-xs font-mono font-bold text-emerald-900">
                {matchedSubCategory}
              </span>
              {/* Selected Formulation / Product Badge */}
              <span className="rounded-md border border-line bg-cream/40 px-2.5 py-0.5 text-xs font-mono font-bold text-ink">
                Fertilizer Type -  {displayProduct}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Trade Bloc: <span className="font-medium text-ink">{displayRegion}</span> · Framework: <span className="font-medium text-ink">{authorities.governing_laws || 'National Fertilizers and Agrochemicals Control Act'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
              Confidence {effectiveMeta.confidence_score || '98%'} 
            </span>
            <span className="rounded-full border border-amber-200 bg-[#FEF9C3] px-3 py-1 text-sm font-semibold text-amber-900">
              Timeline: {summary.estimated_timeline || '45 - 90 Days'}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-md font-bold uppercase tracking-wider text-label">Fertilizer Regulatory Authority</span>
            <p className="mt-1 text-sm font-semibold text-ink">{authorities.quarantine_authority || 'Ministry of Agriculture / Fertilizer Control Directorate'}</p>
          </div>
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-md font-bold uppercase tracking-wider text-label">Chemical & Quality Standards Agency</span>
            <p className="mt-1 text-sm font-semibold text-ink">{authorities.certification_body || 'National Bureau of Standards & Agrochemical Inspection Directorate'}</p>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Documents & Testing Protocols */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-md font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                Mandatory Export Document Checklist
              </h3>
              <span className="text-sm text-muted">HS: {compliance_requirements.hs_customs_codes?.join(', ') || '3102.10, 3105.20'}</span>
            </div>

            <div className="mb-4 rounded-xl border border-line/50 bg-cream/20 p-3">
              <span className="text-sm font-semibold text-label">Import Permit Requirement:</span>
              <p className="mt-0.5 text-sm font-medium text-ink">{compliance_requirements.import_permit || 'Fertilizer Import Clearance Permit Mandatory'}</p>
            </div>

            <ul className="space-y-2">
              {(compliance_requirements.required_documents || [
                'Commercial Product Registration Certificate',
                'Certified Certificate of Analysis (Active Nutrient % Assay)',
                'Material Safety Data Sheet (16-Section GHS SDS)',
                'Non-Objection Certificate / PIC Declaration',
                'Certificate of Origin'
              ]).map((doc: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-ink/90">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">✓</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-line/60 bg-cream/30 p-3 text-sm">
            <span className="font-semibold text-ink">Heavy Metal & Chemical Safety Stance:</span>
            <p className="mt-0.5 text-muted">{compliance_requirements.phytosanitary_ad || 'Strict AOAC/ISO limits on toxic residues and heavy metals apply.'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
              Quality, Chemical & Testing Protocols
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Nutrient Assay & Quality Benchmark:</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.ista_standards || 'AOAC/ISO Certified Nutrient Grade & Formulation Analysis.'}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Pre-Shipment Inspection & Conformity (PVoC):</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.fumigation_treatment || 'Not Applicable for Inorganic / Standard Chemical Fertilizer (Dry Cargo Protocol).'}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Agronomic Efficacy & Field Trial Mandates:</span>
              <p className="mt-1 text-muted leading-relaxed">{trials_and_reciprocity.trial_rules || 'Multi-locational crop trial bio-assay required for new or customized formulations.'}</p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-ink">Radioactivity & Insoluble Matter Tolerance:</span>
              <p className="mt-1 text-muted leading-relaxed">{compliance_requirements.gmo_policy || 'Chemical & Mineral Formulation (Non-GMO Verification N/A)'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Logistics, Labeling & Port Inspection */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <span className="text-md font-bold uppercase tracking-wider text-label">Packaging, Tagging & Labeling</span>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{logistics_and_customs.labeling_rules || 'Bilingual labeling, guaranteed nutrient grade (NPK % w/w), net weight, and safety pictograms.'}</p>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <span className="text-md font-bold uppercase tracking-wider text-label">Port of Entry & Customs Clearance</span>
          <p className="mt-2 text-sm leading-relaxed text-ink">{logistics_and_customs.port_inspection || 'Designated dry bulk and container ports with accredited testing laboratories.'}</p>
        </div>
      </div>

      {/* 4. Strategic Exporter Risk Mitigation */}
      {data?.risk_mitigation && (
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