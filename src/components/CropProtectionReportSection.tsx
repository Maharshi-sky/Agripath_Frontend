// src/components/CropProtectionReportSection.tsx
import { useMemo } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

interface CropProtectionReportSectionProps {
  matchData: any;
  country: string;
  onNavigateStep?: (step: number) => void;
}

export default function CropProtectionReportSection({
  matchData,
  country,
  onNavigateStep,
}: CropProtectionReportSectionProps) {
  const targetTech = 
    matchData?.targetTech || 
    matchData?.activeProduct?.chemicalType || 
    matchData?.activeProduct?.name || 
    '';

  const normKey = `${(country || '').trim()}__${(targetTech || '').trim()}`.toLowerCase();
  const sessionKey = `agri_protection_match_${normKey.replace(/\s+/g, '_')}`;

  // Read synchronized session cache written by CropProtectionMatchEngineView
  const cachedEntry = useMemo(() => {
    try {
      const stored = sessionStorage.getItem(sessionKey) || sessionStorage.getItem(`agri_protect_${normKey}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  }, [sessionKey, normKey]);

  // Resolve current active zone from cache or store
  const resolvedCurZone = useMemo(() => {
    if (cachedEntry?.zones && Array.isArray(cachedEntry.zones) && cachedEntry.zones.length > 0) {
      const key = cachedEntry.selectedZoneKey || cachedEntry.zones[0]?.k;
      return cachedEntry.zones.find((z: any) => z.k === key) || cachedEntry.zones[0];
    }
    return null;
  }, [cachedEntry]);

  // Resolve active product from cached zone or fallback to matchData
  const activeProduct = useMemo(() => {
    if (resolvedCurZone?.products && Array.isArray(resolvedCurZone.products) && resolvedCurZone.products.length > 0) {
      const idx = typeof cachedEntry?.selectedIdx === 'number' ? cachedEntry.selectedIdx : 0;
      return resolvedCurZone.products[idx] || resolvedCurZone.products[0];
    }
    return matchData?.activeProduct || null;
  }, [resolvedCurZone, cachedEntry, matchData]);

  // Resolve zone microclimate environment
  const zoneEnv = useMemo(() => {
    if (resolvedCurZone) {
      return {
        ph: resolvedCurZone.ph || 'N/A',
        cec: resolvedCurZone.cec || 'N/A',
        rain: resolvedCurZone.rain || 'N/A',
        temp: resolvedCurZone.temp || 'N/A',
      };
    }
    return matchData?.zoneEnv || null;
  }, [resolvedCurZone, matchData]);

  const hasMatchData = !!activeProduct;

  return (
    <section className="bg-paper rounded-2xl border border-line p-6 shadow-2xs space-y-5 print:border-slate-300 print:shadow-none print:break-inside-avoid">
      <div className="flex items-center justify-between border-b border-line pb-3 print:border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="w-12 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center border border-emerald-200">
            02-03
          </span>
          <h2 className="text-lg font-bold text-ink print:text-base print:text-black">
            Target Agroclimatic Zone Compatibility & Pathogen Fit
          </h2>
        </div>
        {onNavigateStep && (
          <button
            type="button"
            onClick={() => onNavigateStep(3)}
            className="text-xs font-semibold text-brand hover:underline cursor-pointer print:hidden"
          >
            View Match Breakdown
          </button>
        )}
      </div>

      {hasMatchData ? (
        <>
          {/* Zone Microclimate Environment Metrics */}
          {zoneEnv && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-cream/30 p-3 rounded-xl border border-line/60">
              <span className="font-bold text-slate-700">ZONE METRICS:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                pH: <b>{zoneEnv.ph || 'N/A'}</b>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                CEC: <b>{zoneEnv.cec || 'N/A'}</b>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Rainfall: <b>{zoneEnv.rain || 'N/A'}</b>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Temp: <b>{zoneEnv.temp || 'N/A'}</b>
              </span>
            </div>
          )}

          {/* 4 Agronomic Pillars */}
          {activeProduct.pillars && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4">
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Infection Pressure</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.diseasePressure ?? 'N/A'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Host Alignment</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.hostAlignment ?? 'N/A'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Chemical Fit</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.chemicalFit ?? 'N/A'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Resistance Barrier</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.resistanceBarrier ?? 'N/A'}/25
                </span>
              </div>
            </div>
          )}

          {/* Pathogen Vector Alignment Table */}
          {activeProduct.pathogen_gaps && activeProduct.pathogen_gaps.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">
                Pathogen Vector Alignment in {country}
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-line/60 rounded-xl overflow-hidden">
                  <thead className="bg-cream/40 font-mono text-muted uppercase border-b border-line/60">
                    <tr>
                      <th className="p-2.5">Evaluation Vector</th>
                      <th className="p-2.5">Product Spectrum</th>
                      <th className="p-2.5">Zone Assessment</th>
                      <th className="p-2.5 text-right">Score Fit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 font-sans">
                    {activeProduct.pathogen_gaps.map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold font-mono text-ink">{row.vector}</td>
                        <td className="p-2.5 text-slate-700">{row.productTarget}</td>
                        <td className="p-2.5 text-slate-600">{row.assessment}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-800 font-mono">{row.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Parameter Ledger */}
          {activeProduct.ledger && activeProduct.ledger.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">
                Score Movement Parameter Ledger
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-line/60 rounded-xl overflow-hidden">
                  <thead className="bg-cream/40 font-mono text-muted uppercase border-b border-line/60">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Zone Recorded Value</th>
                      <th className="p-2.5">Observed Agronomic Effect</th>
                      <th className="p-2.5 text-right">Multiplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 font-sans">
                    {activeProduct.ledger.map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold font-mono text-ink">{row.parameter}</td>
                        <td className="p-2.5 font-mono text-slate-700">{row.zone_val}</td>
                        <td className="p-2.5 text-slate-600">{row.effect}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-800 font-mono">{row.mul}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendation Box */}
          {activeProduct.verdict && (
            <div className="p-4 bg-[#103a29] text-[#9fe6c0] rounded-xl space-y-1.5 text-xs leading-relaxed print:bg-emerald-950 print:text-emerald-100">
              <div className="flex items-center gap-1.5 font-mono uppercase tracking-widest text-white text-[11px] font-bold">
                <Sparkles size={14} className="text-emerald-400" />
                Agronomic Match Recommendation
              </div>
              <p className="text-emerald-100 font-sans">{activeProduct.verdict}</p>
            </div>
          )}

          {/* Complete Technical Specification Dossier */}
          {(activeProduct.description || activeProduct.featuresBenefits || activeProduct.targetCrops) && (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-5 space-y-4 print:border-slate-300 print:bg-slate-50 print:p-4">
              {activeProduct.description && (
                <div>
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">
                    Product Technical Description
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{activeProduct.description}</p>
                </div>
              )}

              {activeProduct.modeOfAction && (
                <div className="border-t border-emerald-100/80 pt-3">
                  <span className="font-bold text-slate-900 uppercase text-xs block mb-1">
                    Mode of Action & Biological Mechanism
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{activeProduct.modeOfAction}</p>
                </div>
              )}

              {activeProduct.featuresBenefits && (
                <div className="border-t border-emerald-100/80 pt-3">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">
                    Features & Benefits
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans">
                    {activeProduct.featuresBenefits}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-emerald-100/80 pt-3">
                {activeProduct.targetCrops && (
                  <div>
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-0.5">
                      Target Host Crops
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.targetCrops}</p>
                  </div>
                )}
                {activeProduct.targetPest && (
                  <div>
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-0.5">
                      Target Pest / Pathogen
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.targetPest}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-emerald-100/80 pt-3">
                {activeProduct.dosage && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Recommended Dosage
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.dosage}</p>
                  </div>
                )}
                {activeProduct.packaging && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Available Packaging
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.packaging}</p>
                  </div>
                )}
                {activeProduct.application && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Application Timing
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.application}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">No Crop Protection Match Data Available</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Step 3 (Match Analysis) was not executed for this crop protection product.
          </p>
        </div>
      )}
    </section>
  );
}