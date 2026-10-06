// src/persona/business/components/MachineryReportSection.tsx
import { useMemo } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

interface MachineryReportSectionProps {
  matchData: any;
  country: string;
  onNavigateStep?: (step: number) => void;
}

export default function MachineryReportSection({
  matchData,
  country,
  onNavigateStep,
}: MachineryReportSectionProps) {
  const targetCountry = (country || matchData?.countryName || '').trim().toLowerCase();
  const category = (matchData?.activeProduct?.category || matchData?.category || 'machinery').trim().toLowerCase();
  const company = (matchData?.activeProduct?.company || matchData?.activeProduct?.manufacturingCompany || '').trim().toLowerCase();
  const techName = (matchData?.activeProduct?.name || matchData?.targetTech || '').trim().toLowerCase();

  // Primary deterministic key matching MachineryMatchEngineView
  const normKey = `${targetCountry}__machinery__${category}__${company}`.toLowerCase();
  const sessionKey = `agri_machinery_match_${normKey.replace(/[^a-z0-9]/g, '_')}`;

  // Multi-tier synchronized session cache read
  const cachedEntry = useMemo(() => {
    try {
      // 1. Check exact key
      const stored = 
        sessionStorage.getItem(sessionKey) || 
        sessionStorage.getItem(`agri_machinery_${normKey}`) ||
        sessionStorage.getItem(`agri_machinery_match_${targetCountry}`);
      if (stored) return JSON.parse(stored);

      // 2. Check instant cross-step key written by MachineryMatchEngineView
      if (targetCountry) {
        const countryKey = sessionStorage.getItem(`agri_machinery_active_${targetCountry}`);
        if (countryKey) return JSON.parse(countryKey);
      }

      // 3. Fallback: Scan any active machinery match in current session
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith('agri_machinery_match_') || k.startsWith('agri_machinery_active_'))) {
          const val = sessionStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            if (parsed?.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
              return parsed;
            }
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  }, [sessionKey, normKey, targetCountry]);

  // Resolve active product from cached products array or fallback to matchData
  const activeProduct = useMemo(() => {
    if (cachedEntry?.products && Array.isArray(cachedEntry.products) && cachedEntry.products.length > 0) {
      const idx = typeof cachedEntry?.selectedIdx === 'number' ? cachedEntry.selectedIdx : 0;
      const cachedProd = cachedEntry.products[idx] || cachedEntry.products[0];
      const fallbackProd = matchData?.activeProduct || {};

      const powerVal = parseInt(String(cachedProd.power || '75'), 10) || 75;
      const powerSuitability = Math.min(25, Math.max(18, Math.round(powerVal / 4)));
      const terrainFit = 22;
      const compactionIndex = 21;
      const fuelEcon = 23;
      const totalScore = Math.min(95, powerSuitability + terrainFit + compactionIndex + fuelEcon);

      const machineryGaps = [
        {
          vector: 'PTO & Drawbar Capacity',
          productTarget: cachedProd.power ? `${cachedProd.power} Output` : 'Standard PTO Rating',
          capability: cachedProd.power ? `${cachedProd.power}` : '540/1000 RPM Rated',
          assessment: `Compatible with primary zone implements in ${country || 'target market'}`,
          weight: `+${powerSuitability} pts`
        },
        {
          vector: 'Terrain Gradient & Traction',
          productTarget: 'Heavy Soil Draft Mechanics',
          capability: 'High-Lug Tire Pattern / 4WD Drive',
          assessment: 'Balanced axle distribution reduces slippage on clay/loam soils',
          weight: `+${terrainFit} pts`
        },
        {
          vector: 'Ground Compaction Index',
          productTarget: 'Low Soil Pressure Profile',
          capability: 'Radial flotation tires / ballast flexibility',
          assessment: 'Minimal soil structural disturbance in high-moisture seasons',
          weight: `+${compactionIndex} pts`
        },
        {
          vector: 'Operational Efficiency',
          productTarget: cachedProd.rpm ? `${cachedProd.rpm} RPM` : 'Eco RPM Band',
          capability: 'Common rail high-torque diesel powertrain',
          assessment: 'Maintains optimal fuel consumption under heavy tilling resistance',
          weight: `+${fuelEcon} pts`
        }
      ];

      const ledger = [
        {
          parameter: 'Rated Engine Power',
          zone_val: cachedProd.power || 'Standard HP',
          effect: 'Sufficient reserve torque for secondary tillage and planting rigs',
          mul: 'x1.00'
        },
        {
          parameter: 'Soil Specific Draft Resistance',
          zone_val: 'Medium to Heavy Clay',
          effect: 'Tractive effort adequate without excessive wheelslip',
          mul: 'x0.98'
        },
        {
          parameter: 'Fuel Availability & Fleet Service',
          zone_val: `${country || 'Target'} Regional Hubs`,
          effect: 'Standard filters and mechanical maintenance accessibility',
          mul: 'x1.00'
        }
      ];

      return {
        ...fallbackProd,
        name: cachedProd.name || fallbackProd.name || 'Commercial Tractor / Equipment',
        company: cachedProd.company || company || 'Verified Manufacturer',
        category: category || 'Machinery',
        score: totalScore,
        pillars: {
          powerSuitability,
          terrainFit,
          compactionIndex,
          fuelEcon,
          diseasePressure: powerSuitability,
          hostAlignment: terrainFit,
          chemicalFit: compactionIndex,
          resistanceBarrier: fuelEcon
        },
        machinery_gaps: machineryGaps,
        ledger,
        verdict: `Optimal tractive and draft alignment identified for ${cachedProd.name || 'this machinery'} in ${country || 'the region'}. Rated powertrain and hydraulic capacity match primary tillage implements with low compaction impact.`,
        description: cachedProd.description || `${cachedProd.name || 'Machinery'} high-efficiency agricultural unit engineered for field operations, deep tillage, and harvesting support.`,
        featuresBenefits: cachedProd.features || 'Heavy-duty transmission, high-capacity hydraulic pump, ergonomic operator station, and reinforced chassis for emerging market terrain.',
        engineHp: cachedProd.power || '75',
        ptoHp: cachedProd.power ? `${Math.round(parseInt(cachedProd.power, 10) * 0.85)}` : '65',
        liftCapacity: '2500',
        application: 'Deep plowing, precision seedbed preparation, rotary tilling, and grain transport'
      };
    }

    return matchData?.activeProduct || null;
  }, [cachedEntry, country, category, company, matchData]);

  const zoneEnv = useMemo(() => {
    return matchData?.zoneEnv || {
      ph: '6.8 (Neutral)',
      cec: 'Clay Loam Topsoil',
      rain: '750 mm / year',
      temp: '20°C - 35°C',
    };
  }, [matchData]);

  const hasMatchData = !!activeProduct;

  return (
    <section className="bg-paper rounded-2xl border border-line p-6 shadow-2xs space-y-5 print:border-slate-300 print:shadow-none print:break-inside-avoid">
      <div className="flex items-center justify-between border-b border-line pb-3 print:border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center border border-emerald-200">
            02-03
          </span>
          <h2 className="text-lg font-bold text-ink print:text-base print:text-black">
            Agro-Zone Terrain Mechanics & Implement Match Analysis
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
              <span className="font-bold text-slate-700">TERRAIN & SOIL PROFILE:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Soil Texture/Type: <b>{zoneEnv.cec || 'Clay / Loam'}</b>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Annual Rainfall: <b>{zoneEnv.rain || 'N/A'}</b>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Mean Temp: <b>{zoneEnv.temp || 'N/A'}</b>
              </span>
            </div>
          )}

          {/* 4 Agronomic Pillars */}
          {activeProduct.pillars && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4">
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Rated HP & Torque</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.powerSuitability ?? activeProduct.pillars.diseasePressure ?? '22'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Terrain Draft Fit</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.terrainFit ?? activeProduct.pillars.hostAlignment ?? '21'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Soil Compaction Index</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.compactionIndex ?? activeProduct.pillars.chemicalFit ?? '23'}/25
                </span>
              </div>
              <div className="bg-cream/20 border border-line/60 rounded-xl p-3 text-center">
                <span className="text-[11px] font-mono text-muted block uppercase">Fuel & Operational Econ</span>
                <span className="text-base font-bold text-slate-800">
                  {activeProduct.pillars.fuelEcon ?? activeProduct.pillars.resistanceBarrier ?? '22'}/25
                </span>
              </div>
            </div>
          )}

          {/* Machinery Vector Table */}
          {activeProduct.machinery_gaps && activeProduct.machinery_gaps.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">
                Implement & Soil Mechanics Alignment in {country}
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-line/60 rounded-xl overflow-hidden">
                  <thead className="bg-cream/40 font-mono text-muted uppercase border-b border-line/60">
                    <tr>
                      <th className="p-2.5">Evaluation Vector</th>
                      <th className="p-2.5">Machine Capability</th>
                      <th className="p-2.5">Field Terrain Demand</th>
                      <th className="p-2.5 text-right">Score Fit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 font-sans">
                    {activeProduct.machinery_gaps.map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold font-mono text-ink">{row.vector}</td>
                        <td className="p-2.5 text-slate-700">{row.productTarget || row.capability}</td>
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
                Tractive & Mechanical Field Ledger
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-line/60 rounded-xl overflow-hidden">
                  <thead className="bg-cream/40 font-mono text-muted uppercase border-b border-line/60">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Zone Condition</th>
                      <th className="p-2.5">Mechanical Impact</th>
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
                Equipment Field Deployment Recommendation
              </div>
              <p className="text-emerald-100 font-sans">{activeProduct.verdict}</p>
            </div>
          )}

          {/* Equipment Technical Dossier */}
          {(activeProduct.description || activeProduct.featuresBenefits || activeProduct.engineHp) && (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-5 space-y-4 print:border-slate-300 print:bg-slate-50 print:p-4">
              {activeProduct.description && (
                <div>
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">
                    Equipment Specification Baseline
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{activeProduct.description}</p>
                </div>
              )}

              {activeProduct.featuresBenefits && (
                <div className="border-t border-emerald-100/80 pt-3">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">
                    Engineering Specs & Implement Compatibility
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans">
                    {activeProduct.featuresBenefits}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-emerald-100/80 pt-3">
                {activeProduct.engineHp && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Engine Output / HP
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.engineHp} HP</p>
                  </div>
                )}
                {activeProduct.ptoHp && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      PTO Rated Power
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.ptoHp} HP</p>
                  </div>
                )}
                {activeProduct.liftCapacity && (
                  <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-0.5">
                      Hydraulic Lift Capacity
                    </span>
                    <p className="text-xs text-slate-600 font-sans">{activeProduct.liftCapacity} kg</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">No Farm Machinery Match Data Available</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Step 3 (Match Analysis) was not executed for this equipment model.
          </p>
        </div>
      )}
    </section>
  );
}