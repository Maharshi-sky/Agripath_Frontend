// src/persona/business/components/BioInputsReportSection.tsx
import { useMemo } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

interface BioInputsReportSectionProps {
  matchData: any;
  country: string;
  onNavigateStep?: (step: number) => void;
}

export default function BioInputsReportSection({
  matchData,
  country,
  onNavigateStep,
}: BioInputsReportSectionProps) {
  const targetTech =
    matchData?.targetTech ||
    matchData?.activeProduct?.name ||
    matchData?.activeProduct?.technology ||
    '';

  const category = matchData?.activeProduct?.category || 'Biological Inputs';

  const normCountry = (country || '').trim().toLowerCase();
  const normTech = (targetTech || '').trim().toLowerCase();
  const normCat = (category || '').trim().toLowerCase();

  const normKey = `${normCountry}__${normTech}__${normCat}`;
  const sessionKey = `agri_bio_match_${normKey.replace(/[^a-z0-9]/g, '_')}`;

  // Read synchronized session cache written by BioInputsMatchEngineView
  const cachedEntry = useMemo(() => {
    try {
      const stored =
        sessionStorage.getItem(sessionKey) ||
        sessionStorage.getItem(`agri_bio_match_${normCountry}_${normTech}`) ||
        sessionStorage.getItem(`agri_bio_${normKey}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  }, [sessionKey, normKey, normCountry, normTech]);

  // Resolve current active zone
  const resolvedCurZone = useMemo(() => {
    if (cachedEntry?.data?.zones && Array.isArray(cachedEntry.data.zones) && cachedEntry.data.zones.length > 0) {
      const idx = typeof cachedEntry?.selectedZoneIdx === 'number' ? cachedEntry.selectedZoneIdx : 0;
      return cachedEntry.data.zones[idx] || cachedEntry.data.zones[0];
    }
    if (matchData?.selectedZoneData) {
      return matchData.selectedZoneData;
    }
    return null;
  }, [cachedEntry, matchData]);

  // Resolve active product from cached active zone or fallback to matchData
  const activeProduct = useMemo(() => {
    if (resolvedCurZone && cachedEntry?.data) {
      const pTable = resolvedCurZone.table || [];
      const bioGaps = pTable.map((row: any) => ({
        vector: row.parameter,
        productTarget: row.requirement,
        target: row.requirement,
        assessment: `${row.zoneValue} — ${row.compatibility}`,
        weight: `+${row.score} pts`,
      }));

      const ledger = pTable.map((row: any) => ({
        parameter: row.parameter,
        zone_val: row.zoneValue,
        effect: row.compatibility,
        mul: row.score >= 18 ? 'x1.00' : row.score >= 14 ? 'x0.95' : 'x0.85',
      }));

      const phScore = pTable.find((r: any) => r.parameter?.toLowerCase().includes('ph'))?.score;
      const phSuitability = phScore ? Math.round((phScore / 20) * 25) : 22;

      const moistScore = pTable.find((r: any) => r.parameter?.toLowerCase().includes('moisture') || r.parameter?.toLowerCase().includes('rain'))?.score;
      const microbialSurvival = moistScore ? Math.round((moistScore / 20) * 25) : 23;

      const carbonScore = pTable.find((r: any) => r.parameter?.toLowerCase().includes('carbon') || r.parameter?.toLowerCase().includes('texture') || r.parameter?.toLowerCase().includes('organic'))?.score;
      const carbonFit = carbonScore ? Math.round((carbonScore / 20) * 25) : 21;

      const stimulantResponse = Math.min(25, Math.round(Number(resolvedCurZone.score || 80) / 4));

      const fallbackProd = matchData?.activeProduct || {};

      return {
        ...fallbackProd,
        name: targetTech || fallbackProd.name,
        category: category || fallbackProd.category,
        score: resolvedCurZone.score || fallbackProd.score || 85,
        pillars: {
          phSuitability,
          microbialSurvival,
          carbonFit,
          stimulantResponse,
          diseasePressure: phSuitability,
          hostAlignment: microbialSurvival,
          chemicalFit: carbonFit,
          resistanceBarrier: stimulantResponse,
        },
        bio_gaps: bioGaps,
        ledger,
        verdict: resolvedCurZone.summary || fallbackProd.verdict || 'Formulation exhibits high microbial symbiosis with local soil environment.',
        description: fallbackProd.description || cachedEntry.data.product_meta?.key_benefits,
        featuresBenefits: fallbackProd.featuresBenefits || cachedEntry.data.product_meta?.key_benefits,
      };
    }

    return matchData?.activeProduct || null;
  }, [resolvedCurZone, cachedEntry, targetTech, category, matchData]);

  // Resolve zone environment parameters
  const zoneEnv = useMemo(() => {
    if (resolvedCurZone) {
      return {
        ph: resolvedCurZone.soil_ph || '6.2 - 7.5',
        cec: resolvedCurZone.soil_type || 'Sandy Loam',
        rain: resolvedCurZone.rainfall || '650 - 1100 mm',
        temp: '22°C - 34°C',
      };
    }
    return matchData?.zoneEnv || null;
  }, [resolvedCurZone, matchData]);

  const hasMatchData = !!activeProduct;

  return (
    <section className="bg-paper rounded-2xl border border-line p-6 shadow-2xs space-y-5 print:border-slate-300 print:shadow-none print:break-inside-avoid">
      <div className="flex items-center justify-between border-b border-line pb-3 print:border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center border border-emerald-200">
            02-03
          </span>
          <h2 className="text-lg font-bold text-ink print:text-base print:text-black">
            Biological Soil Compatibility & Microbial Colonization Fit
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
              <span className="font-bold text-slate-700">SOIL MICROBIAL HABITAT:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                pH Range: <b>{zoneEnv.ph || 'N/A'}</b>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Soil Moisture/Rain: <b>{zoneEnv.rain || 'N/A'}</b>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Soil Carbon/CEC: <b>{zoneEnv.cec || 'N/A'}</b>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Thermal Band: <b>{zoneEnv.temp || 'N/A'}</b>
              </span>
            </div>
          )}

          {/* 4 Agronomic Pillars */}
          {activeProduct.pillars && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4">
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Soil pH Buffer Fit</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.phSuitability ?? activeProduct.pillars.diseasePressure ?? '22'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Microbial Survival</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.microbialSurvival ?? activeProduct.pillars.hostAlignment ?? '23'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Carbon Availability</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.carbonFit ?? activeProduct.pillars.chemicalFit ?? '20'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Bio-Stimulant Response</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.stimulantResponse ?? activeProduct.pillars.resistanceBarrier ?? '21'}/25
                </span>
              </div>
            </div>
          )}

          {/* Bio Vector Alignment Table */}
          {activeProduct.bio_gaps && activeProduct.bio_gaps.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">
                Soil Microbiome Vector Alignment in {country}
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-line/60 rounded-xl overflow-hidden">
                  <thead className="bg-cream/40 font-mono text-muted uppercase border-b border-line/60">
                    <tr>
                      <th className="p-2.5">Evaluation Vector</th>
                      <th className="p-2.5">Biological Target</th>
                      <th className="p-2.5">Zone Soil Environment</th>
                      <th className="p-2.5 text-right">Score Fit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 font-sans">
                    {activeProduct.bio_gaps.map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold font-mono text-ink">{row.vector}</td>
                        <td className="p-2.5 text-slate-700">{row.productTarget || row.target}</td>
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
                Biological Activity Ledger
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-line/60 rounded-xl overflow-hidden">
                  <thead className="bg-cream/40 font-mono text-muted uppercase border-b border-line/60">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Zone Value</th>
                      <th className="p-2.5">Biological Effect</th>
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

          {/* Recommendation */}
          {activeProduct.verdict && (
            <div className="p-4 bg-[#103a29] text-[#9fe6c0] rounded-xl space-y-1.5 text-xs leading-relaxed print:bg-emerald-950 print:text-emerald-100">
              <div className="flex items-center gap-1.5 font-mono uppercase tracking-widest text-white text-[11px] font-bold">
                <Sparkles size={14} className="text-emerald-400" />
                Biological Inoculation Recommendation
              </div>
              <p className="text-emerald-100 font-sans">{activeProduct.verdict}</p>
            </div>
          )}

          {/* Technical Bio Dossier */}
          {(activeProduct.description || activeProduct.featuresBenefits || activeProduct.strains) && (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-5 space-y-4 print:border-slate-300 print:bg-slate-50 print:p-4">
              {activeProduct.description && (
                <div>
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">
                    Bio-Input Formulation Profile
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{activeProduct.description}</p>
                </div>
              )}

              {activeProduct.featuresBenefits && (
                <div className="border-t border-emerald-100/80 pt-3">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">
                    Beneficial Microorganisms & Mechanism
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans">
                    {activeProduct.featuresBenefits}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-emerald-100/80 pt-3">
                {activeProduct.strains && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Active Strains / Colony Count
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.strains}</p>
                  </div>
                )}
                {activeProduct.dosage && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Inoculation Dosage
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.dosage}</p>
                  </div>
                )}
                {activeProduct.application && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Method (Seed / Drip / Foliar)
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
          <div className="text-sm font-semibold text-slate-700">No Bio-Input Match Data Available</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Step 3 (Match Analysis) was not executed for this biological input.
          </p>
        </div>
      )}
    </section>
  );
}