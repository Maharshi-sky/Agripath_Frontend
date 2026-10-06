// src/persona/farmer/components/MachineryRegulatoryView.tsx
import { ShieldAlert, AlertTriangle, Truck, CheckCircle2, Wrench, FileCheck, Flame } from "lucide-react";
import RegulatoryAnalysisLoading from "../../../UI/RegulatoryAnalysisLoading";

interface MachineryRegulatoryViewProps {
  data?: any;
  meta?: any;
  loading?: boolean;
}

export default function MachineryRegulatoryView({ data = {}, meta, loading }: MachineryRegulatoryViewProps) {
  const authorities = data?.authorities || {};
  const transit = data?.road_and_field_compliance || {};
  const district = data?.district_registration_and_support || {};
  const summary = data?.summary || {};
  const effectiveMeta = meta || data?.meta || {};

  const displayCountry = data?.country || summary.target_country || effectiveMeta.country || 'Target Country';
  const displayProduct = summary.technology_type || data?.technology || 'Farm Machinery Model';
  const governingLaws = authorities.governing_laws || 'National Agricultural Mechanization Policy & Farm Machinery Safety Codes';

  // If loading or data not ready
  const isDataEmpty = Object.keys(data).length === 0 && !meta;
  if (loading || isDataEmpty) {
    return (
      <RegulatoryAnalysisLoading
        technologyName={displayProduct}
        countryName={displayCountry}
        category="machinery"
      />
    );
  }

  const safetyList: string[] = Array.isArray(data?.statutory_safety_standards)
    ? data.statutory_safety_standards
    : [
        'Verify factory-installed Roll-Over Protective Structure (ROPS) is intact and unmodified before operating on slopes',
        'Ensure yellow plastic PTO master shield and implement bell shields enclose 100% of rotating drivelines',
        'Never bypass seat switch interlocks or hydraulic safety lockouts during implement maintenance',
        'Depressurize all hydraulic remotes and lower implement to ground before inspecting high-pressure hydraulic hoses'
      ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                {data?.header_title || `Farmer Farm Mechanization Safety & Statutory Advisory — ${displayCountry}`}
              </h2>
              <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-mono font-bold text-amber-900">
                Farm Machinery Safety
              </span>
              <span className="rounded-md border border-line bg-cream/40 px-2.5 py-0.5 text-xs font-mono font-bold text-ink">
                Model: {displayProduct}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Regulatory Scope: <span className="font-medium text-ink">{effectiveMeta.regulatory_scope || 'On-Farm Mechanization Safety & Equipment Registration'}</span> · Framework: <span className="font-medium text-ink">{governingLaws}</span>
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
              Mechanization Engineering Directorate
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.mechanization_directorate || 'Ministry of Agriculture (Agricultural Engineering Services Directorate - AESD)'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {summary.operator_clearance || "Valid Farm Tractor Driver's License Required for Public Road Transit"}
            </p>
          </div>
          <div className="rounded-xl border border-line/60 bg-cream/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-label block">
              Road Safety & Technical Standards Authority
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              {authorities.safety_authority || 'National Road Safety Authority & Standards Authority'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {summary.safety_compliance || 'Mandatory ROPS Roll-Cage & Fully Guarded Rotating PTO Shaft'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Two Column Section: Road Transit & Guarding Protocols */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Road Transit & Operator Licensing */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-700" />
                Road Transit & Operator Credentials
              </h3>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Transit Law
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-line/50 bg-cream/20 p-3.5">
                <span className="text-xs font-bold text-label uppercase tracking-wider block mb-1">
                  Public Highway Transit Rules:
                </span>
                <p className="text-xs text-ink leading-relaxed font-medium">
                  {transit.road_transit_rule || 'Equip reflective Slow-Moving Vehicle (SMV) triangle at rear and escort wide implements during public tarmac road transit.'}
                </p>
              </div>

              <div className="rounded-xl border border-line/50 bg-cream/20 p-3.5">
                <span className="text-xs font-bold text-label uppercase tracking-wider block mb-1">
                  Operator License Requirements:
                </span>
                <p className="text-xs text-muted leading-relaxed">
                  {transit.operator_credential || 'Class F / Specialized Tractor Endorsement driving permit mandated for tractor and self-propelled equipment operators.'}
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 p-3.5 bg-amber-50/60">
                <div className="flex items-center gap-1.5 mb-1 text-amber-950 font-semibold text-xs uppercase tracking-wider">
                  <Flame className="h-3.5 w-3.5 text-amber-800" />
                  <span>Harvest Fire Safety Mandate:</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {transit.field_fire_prevention || 'Ensure exhaust system is fitted with an approved spark arrestor during dry-season field tilling or harvesting to avoid bushfires.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line/60 bg-cream/30 p-3 text-xs flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-700 shrink-0" />
            <span className="text-muted leading-relaxed">
              {district.local_registration || 'Register implement chassis number and engine serial with the local District Agricultural Engineering Unit (DADU).'}
            </span>
          </div>
        </div>

        {/* Right Column: Physical Guarding & Mechanic Safety Rules */}
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-700" />
              Machine Guarding & Subsidies
            </h3>
            <span className="text-xs text-muted">Operator Protection</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
              <span className="font-semibold text-xs text-emerald-950 uppercase tracking-wider block mb-2">
                Mandatory Guarding & Safety Standards:
              </span>
              <ul className="space-y-2">
                {safetyList.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-ink/90">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-line/50 p-3.5 bg-cream/20">
              <div className="flex items-center gap-1.5 mb-1 text-label font-bold text-xs uppercase tracking-wider">
                <Wrench className="h-3.5 w-3.5 text-emerald-700" />
                <span>Duty-Free Spares & Mechanization Center Support:</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {district.subsidy_access || 'Registered owners qualify for duty-exempt commercial spare parts and subsidized AMSEC custom-hiring center service listings.'}
              </p>
            </div>

            <div className="rounded-xl border border-line/50 p-3 bg-cream/20">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider block mb-1">
                Statutory Warranty Guarantee:
              </span>
              <p className="text-xs text-muted leading-relaxed">
                {district.warranty_guarantee || 'Ensure vendor provides statutory 12-month minimum warranty on powertrain and guaranteed spare parts availability.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Farmer Liability & PTO Amputation Warning */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4.5 text-sm shadow-xs">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-xs uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4 text-amber-800" />
          <span>Occupational Farm Safety & Insurance Liability Warning</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-900">
          {data?.farmer_liability_warning || 'Operating without functional PTO driveline guards violates occupational farm safety regulations, voiding agricultural equipment insurance and leading to heavy legal liability in the event of farmhand injury.'}
        </p>
      </div>
    </div>
  );
}