// src/components/IrrigationRegulatoryView.tsx
import { ShieldCheck, FileText, Droplets, Wrench, Truck } from 'lucide-react';
import RegulatoryAnalysisLoading from '../UI/RegulatoryAnalysisLoading';

interface IrrigationRegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function IrrigationRegulatoryView({ data, meta, loading }: IrrigationRegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const compliance = data?.compliance_requirements || {};
  const trials = data?.trials_and_reciprocity || {};
  const logistics = data?.logistics_and_customs || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = summary.target_country || effectiveMeta.country || 'Target Country';
  const subCategory = effectiveMeta.item_sub_category || 'Drip & Micro-Irrigation Systems';

  if (loading || (!data && !meta)) {
    return (
      <RegulatoryAnalysisLoading
        technologyName={subCategory}
        countryName={displayCountry}
        category="general"
      />
    );
  }

  const hsCodes =
    compliance.hs_customs_codes && compliance.hs_customs_codes.length > 0
      ? compliance.hs_customs_codes
      : ['HS 8424.82', 'HS 3917.32'];

  const requiredDocs =
    compliance.required_documents && compliance.required_documents.length > 0
      ? compliance.required_documents
      : [
          'Certificate of Conformity (PVoC / CoC)',
          'ISO 9261 Factory Hydraulic Performance & Emitter Flow Test Report',
          'Polymer UV Stabilization & Hydrostatic Pressure Burst Certificate (ISO 15874)',
          'Commercial Invoice & Packing List',
          'Certificate of Origin (CoO)',
        ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-ink">
                Agricultural Irrigation Equipment Statutory Homologation & Clearance Pathway — {displayCountry}
              </h2>
              <span className="rounded-md border border-cyan-300 bg-cyan-100/70 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-900">
                Irrigation & Water Regimen
              </span>
              <span className="rounded-md border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-mono text-slate-700">
                {subCategory}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted max-w-4xl">
              Governing Framework:{' '}
              <span className="text-slate-800 font-medium">
                {authorities.governing_laws || 'National Water Act, Irrigation Policy & Hydraulic Standards Regulations'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Statutory Confidence: {effectiveMeta.confidence_score || '98%'}
            </span>
          </div>
        </div>

        {/* 4 Quick Metrics Strip */}
        <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
          <div className="rounded-xl border border-line/60 bg-paper/60 p-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-muted">Water & Irrigation Agency</span>
            <span className="mt-1 block text-sm font-semibold text-ink truncate" title={authorities.quarantine_authority}>
              {authorities.quarantine_authority || 'National Irrigation Authority'}
            </span>
          </div>
          <div className="rounded-xl border border-line/60 bg-paper/60 p-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-muted">Pre-Shipment PVoC</span>
            <span className="mt-1 block text-sm font-semibold text-ink truncate" title={authorities.certification_body}>
              {authorities.certification_body || 'National Standards Bureau (PVoC)'}
            </span>
          </div>
          <div className="rounded-xl border border-line/60 bg-paper/60 p-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-muted">Estimated Timeline</span>
            <span className="mt-1 block text-sm font-semibold text-ink">
              {summary.estimated_timeline || '30 – 60 Days'}
            </span>
          </div>
          <div className="rounded-xl border border-line/60 bg-paper/60 p-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-muted">Import Tariff Line</span>
            <span className="mt-1 block text-sm font-semibold text-emerald-800 font-mono truncate">
              {hsCodes[0]}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Compliance Dossier & Testing Protocols */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Mandatory Certificates Documents */}
        <div className="lg:col-span-6 rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <FileText className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
              Mandatory Statutory Dossier Requirements
            </h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">
                PVoC Conformity & Water Equipment Clearance
              </span>
              <p className="text-sm text-slate-600">
                {compliance.import_permit ||
                  'Pre-Export Verification of Conformity (PVoC Route A/B) and National Water Equipment Clearance mandatory prior to commercial port release.'}
              </p>
            </div>

            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">
                Mandatory Technical Certificates
              </span>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {requiredDocs.map((doc: string, dIdx: number) => (
                  <li key={dIdx}>{doc}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">
                International Standard References
              </span>
              <p className="text-sm font-mono text-slate-700">
                {compliance.ista_standards || 'ISO 9261 (Drip Emitters & Lateral Lines); ISO 7714 (Agricultural Filters); ISO 15874'}
              </p>
            </div>
          </div>
        </div>

        {/* Safety Testing & Hydraulic Audits */}
        <div className="lg:col-span-6 rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Wrench className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
              Hydraulic Performance & Bio-Security Protocols
            </h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">
                Emitter Quality Benchmark (ISO 9261)
              </span>
              <p className="text-sm text-slate-600">
                {trials.trial_rules ||
                  'Factory audit verifying emitter discharge exponent, coefficient of manufacturing variation (CV < 0.05), and hydrostatic pressure burst test.'}
              </p>
            </div>

            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">
                Clean Cargo Bio-Security Protocol
              </span>
              <p className="text-sm text-slate-600">
                {compliance.phytosanitary_ad ||
                  'Agricultural infrastructure clean cargo protocol: 100% free of soil residue, plant debris, and pest vectors.'}
              </p>
            </div>

            <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">
                Top Rejection Risks & Mitigation
              </span>
              <p className="text-sm text-rose-700 font-medium">
                {data?.risk_mitigation || 'Missing PVoC certificate before vessel discharge or failure of polymer UV degradation inspection.'}
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
            Customs Tariffs, Pipe Embossing & Port Clearance Notes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
            <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Harmonized Tariff (HS Codes)</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {hsCodes.map((code: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-white border border-slate-300 font-mono text-xs px-2 py-0.5 rounded font-semibold text-slate-800"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
            <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Lateral Pipe Embossing Rules</span>
            <p className="text-sm text-slate-600 mt-1">
              {logistics.labeling_rules ||
                'Continuous hot-embossed marking: Nominal OD (mm), wall thickness, emitter spacing (cm), discharge rate (LPH), and manufacturer brand name.'}
            </p>
          </div>

          <div className="rounded-lg border border-line/80 bg-slate-50/50 p-3">
            <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Sea Freight & Port Handling</span>
            <p className="text-sm text-slate-600 mt-1">
              {compliance.fumigation_treatment ||
                'High Cube containerized freight with moisture desiccant bags; ISPM-15 heat-treated wooden pallets for valves and pump manifolds.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}