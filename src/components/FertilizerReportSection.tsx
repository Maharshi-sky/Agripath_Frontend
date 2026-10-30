// src/components/FertilizerReportSection.tsx
import { useMemo } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

interface FertilizerReportSectionProps {
  matchData: any;
  country: string;
  onNavigateStep?: (step: number) => void;
}

export default function FertilizerReportSection({
  matchData,
  country,
  onNavigateStep,
}: FertilizerReportSectionProps) {
  const targetTech =
    matchData?.targetTech ||
    matchData?.activeProduct?.nutrientType ||
    matchData?.activeProduct?.name ||
    '';

  const normKey = `${(country || '').trim()}__${(targetTech || '').trim()}`.toLowerCase();
  const sessionKey = `agri_fert_match_${normKey.replace(/\s+/g, '_')}`;

  // Read synchronized session cache written by FertilizerMatchEngineView
  const cachedEntry = useMemo(() => {
    try {
      const stored = sessionStorage.getItem(sessionKey) || sessionStorage.getItem(`agri_fert_${normKey}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  }, [sessionKey, normKey]);

  // Resolve current active zone
  const resolvedCurZone = useMemo(() => {
    if (cachedEntry?.zones && Array.isArray(cachedEntry.zones) && cachedEntry.zones.length > 0) {
      const key = cachedEntry.selectedZoneKey || cachedEntry.zones[0]?.k;
      return cachedEntry.zones.find((z: any) => z.k === key) || cachedEntry.zones[0];
    }
    return null;
  }, [cachedEntry]);

  // Resolve active product from cached ranked rows or fallback to matchData
  const activeProduct = useMemo(() => {
    if (resolvedCurZone && cachedEntry?.dbProducts && Array.isArray(cachedEntry.dbProducts) && cachedEntry.dbProducts.length > 0) {
      const currentRanked = cachedEntry.rankedResultsMap?.[resolvedCurZone.k] || [];
      const aiMap = new Map();
      currentRanked.forEach((r: any) => aiMap.set(r.id, r));

      const rows = cachedEntry.dbProducts.map((p: any, idx: number) => {
        const ai = aiMap.get(idx) || {};
        const nType = p['Nutrient_Type'] || p['Nutrient Type'] || targetTech || 'NA';
        const nName = p['Nutrient Names'] || p['Product Name'] || 'NA';
        const pName = p['Product Name'] || nName || 'NA';
        const company = p['Company Name'] || p['company_institution'] || 'NA';
        const form = p['Product Form'] || 'NA';

        const rawNutrients = [
          p['Nitrogen'] != null && Number(p['Nitrogen']) > 0 ? `N-${p['Nitrogen']}%` : null,
          p['Phosphorus'] != null && Number(p['Phosphorus']) > 0 ? `P-${p['Phosphorus']}%` : null,
          p['Pottassium'] != null && Number(p['Pottassium']) > 0 ? `K-${p['Pottassium']}%` : null,
          p['Sulphur'] != null && Number(p['Sulphur']) > 0 ? `S-${p['Sulphur']}%` : null,
          p['Calcium'] != null && Number(p['Calcium']) > 0 ? `Ca-${p['Calcium']}%` : null,
          p['Magnesium'] != null && Number(p['Magnesium']) > 0 ? `Mg-${p['Magnesium']}%` : null,
          p['Zinc'] != null && Number(p['Zinc']) > 0 ? `Zn-${p['Zinc']}%` : null,
          p['Boron'] != null && Number(p['Boron']) > 0 ? `B-${p['Boron']}%` : null,
          p['Iron'] != null && Number(p['Iron']) > 0 ? `Fe-${p['Iron']}%` : null,
        ].filter(Boolean);

        const nutrientsIncluded = rawNutrients.length > 0 ? rawNutrients.join(' | ') : (p['Nutrient Content'] || 'NA');

        return {
          id: idx,
          name: pName,
          nutrientType: nType,
          nutrientName: nName,
          productName: pName,
          company,
          manufacturingCompany: company,
          nutrientsIncluded,
          productForm: form,
          formula: nutrientsIncluded,
          npk: nutrientsIncluded,
          description: p['Description'] || p['technology_description'] || '',
          keyBenefits: p['Key Benefits'] || p['proven_yield_impact_data'] || '',
          featuresBenefits: p['Key Benefits'] || p['Features'] || '',
          applicationMethod: p['How to Use / Application Method'] || p['application_method'] || '',
          application: p['How to Use / Application Method'] || p['application_method'] || '',
          features: p['Features'] || '',
          recommendedCrops: p['Recommended Crops'] || p['target_crops_or_livestock'] || '',
          targetCrops: p['Recommended Crops'] || p['target_crops_or_livestock'] || '',
          recommendedDosage: p['Recommended Dosage'] || '',
          dosage: p['Recommended Dosage'] || '',
          packaging: form || 'Standard Packaging',
          score: ai.score ?? 'NA',
          need: ai.need ?? 'NA',
          eff: ai.eff ?? 'NA',
          feas: ai.feas ?? 'NA',
          resp: ai.resp ?? 'NA',
          pillars: {
            nutrientFit: ai.need ?? 20,
            cropFit: ai.eff ?? 20,
            soilBuffer: ai.feas ?? 20,
            yieldIndex: ai.resp ?? 20,
          },
          nutrient_gaps: ai.nutrient_gaps || [],
          ledger: ai.ledger || [],
          verdict: ai.verdict || '',
        };
      }).sort((a: any, b: any) => (Number(b.score) || 0) - (Number(a.score) || 0));

      const selIdx = typeof cachedEntry.selectedIdx === 'number' ? cachedEntry.selectedIdx : 0;
      return rows[selIdx] || rows[0];
    }

    return matchData?.activeProduct || null;
  }, [resolvedCurZone, cachedEntry, targetTech, matchData]);

  // Resolve zone environment parameters
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
            Target Agroclimatic Zone Compatibility & Soil Nutrient Gap Analysis
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
              <span className="font-bold text-slate-700">SOIL & ZONE METRICS:</span>
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
                <span className="text-[11px] font-mono text-muted block uppercase">Nutrient Gap</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.nutrientFit ?? activeProduct.pillars.diseasePressure ?? '20'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Crop Alignment</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.cropFit ?? activeProduct.pillars.hostAlignment ?? '20'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">pH Soil Buffer</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.soilBuffer ?? activeProduct.pillars.chemicalFit ?? '20'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Yield Potential</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.yieldIndex ?? activeProduct.pillars.resistanceBarrier ?? '20'}/25
                </span>
              </div>
            </div>
          )}

          {/* Nutrient Vector Alignment Table */}
          {activeProduct.nutrient_gaps && activeProduct.nutrient_gaps.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">
                Soil Nutrient Vector Alignment in {country}
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-line/60 rounded-xl overflow-hidden">
                  <thead className="bg-cream/40 font-mono text-muted uppercase border-b border-line/60">
                    <tr>
                      <th className="p-2.5">Evaluation Vector</th>
                      <th className="p-2.5">Formulation Supply</th>
                      <th className="p-2.5">Zone Deficiency / Status</th>
                      <th className="p-2.5 text-right">Score Fit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 font-sans">
                    {activeProduct.nutrient_gaps.map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold font-mono text-ink">{row.vector}</td>
                        <td className="p-2.5 text-slate-700">{row.productTarget || row.supply}</td>
                        <td className="p-2.5 text-slate-600">{row.assessment || row.status}</td>
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
                Fertilizer Response Parameter Ledger
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-line/60 rounded-xl overflow-hidden">
                  <thead className="bg-cream/40 font-mono text-muted uppercase border-b border-line/60">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Zone Value</th>
                      <th className="p-2.5">Soil Interaction & Agronomic Effect</th>
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
                Soil Nutrient Recommendation
              </div>
              <p className="text-emerald-100 font-sans">{activeProduct.verdict}</p>
            </div>
          )}

          {/* Fertilizer Technical Dossier */}
          {(activeProduct.description || activeProduct.featuresBenefits || activeProduct.npk) && (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-5 space-y-4 print:border-slate-300 print:bg-slate-50 print:p-4">
              {activeProduct.description && (
                <div>
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">
                    Fertilizer Specification & Profile
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{activeProduct.description}</p>
                </div>
              )}

              {activeProduct.featuresBenefits && (
                <div className="border-t border-emerald-100/80 pt-3">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">
                    Features & Agronomic Benefits
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans">
                    {activeProduct.featuresBenefits}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-emerald-100/80 pt-3">
                {(activeProduct.npk || activeProduct.grade) && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      NPK Grade / Formula
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.npk || activeProduct.grade}</p>
                  </div>
                )}
                {activeProduct.dosage && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Application Rate
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.dosage}</p>
                  </div>
                )}
                {activeProduct.application && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Application Method
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
          <div className="text-sm font-semibold text-slate-700">No Fertilizer Match Data Available</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Step 3 (Match Analysis) was not executed for this fertilizer input.
          </p>
        </div>
      )}
    </section>
  );
}