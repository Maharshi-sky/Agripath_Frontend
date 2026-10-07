// src/components/CropProtectionMatchEngineView.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { useWizard } from '../state/wizardStore';
import MatchAnalysisLoading from '../UI/MatchAnalysisLoading';
import { BASE_URL } from '../services/agriApi';

export default function CropProtectionMatchEngineView() {
  const { state, setSelectedMatch } = useWizard();

  const selectedCountry = useMemo(() => {
    return state.countries?.[0] || 'Kenya';
  }, [state.countries]);

  const selectedChemicalType = useMemo(() => {
    const tech = state.tech as any;
    return tech?.chemicalType || tech?.protectionCategory || tech?.name || 'Fungicides';
  }, [state.tech]);

  // Normalized session cache key for Crop Protection
  const normKey = `${(selectedCountry || '').trim()}__${(selectedChemicalType || '').trim()}`.toLowerCase();
  const sessionKey = `agri_protection_match_${normKey.replace(/\s+/g, '_')}`;

  const getCachedEntry = () => {
    try {
      const stored = sessionStorage.getItem(sessionKey) || sessionStorage.getItem(`agri_protect_${normKey}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  };

  const cachedEntry = getCachedEntry();
  const [zones, setZones] = useState<any[]>(() => cachedEntry?.zones || []);
  const [selectedZoneKey, setSelectedZoneKey] = useState<string>(() => cachedEntry?.selectedZoneKey || '');
  const [selectedIdx, setSelectedIdx] = useState<number>(() => cachedEntry?.selectedIdx ?? 0);
  const [loading, setLoading] = useState<boolean>(() => !cachedEntry?.zones || cachedEntry.zones.length === 0);
  const [aiSynthesizing, setAiSynthesizing] = useState<boolean>(false);

  const lastFetchRef = useRef<string>(cachedEntry?.zones?.length ? normKey : '');

  // 1. Initial Load: Instant Data for All Zones with Caching
  useEffect(() => {
    // Agar same country aur chemical type ke liye session cache me already data hai, API hit mat karo
    if (lastFetchRef.current === normKey && zones.length > 0) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    async function loadProtectionMatch() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/crop-protection/calculate-match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: selectedCountry,
            chemicalType: selectedChemicalType,
          }),
        });
        const json = await res.json();
        if (isSubscribed && json.success && Array.isArray(json.zones)) {
          setZones(json.zones);
          const firstKey = json.zones.length > 0 ? json.zones[0].k : '';
          setSelectedZoneKey(firstKey);
          setSelectedIdx(0);
          lastFetchRef.current = normKey;

          const toStore = {
            zones: json.zones,
            selectedZoneKey: firstKey,
            selectedIdx: 0,
          };
          try {
            sessionStorage.setItem(sessionKey, JSON.stringify(toStore));
            sessionStorage.setItem(`agri_protect_${normKey}`, JSON.stringify(toStore));
          } catch {
            // storage quota fallback
          }
        }
      } catch (err) {
        console.error('Failed to load crop protection match:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadProtectionMatch();

    return () => {
      isSubscribed = false;
    };
  }, [normKey, sessionKey, selectedCountry, selectedChemicalType, zones.length]);

  const curZone = zones.find((z) => z.k === selectedZoneKey) || zones[0];
  const productList = curZone?.products || [];
  const activeProduct = productList[selectedIdx] || productList[0];

  // Helper to persist user zone selection
  const handleZoneChange = (zoneKey: string) => {
    setSelectedZoneKey(zoneKey);
    setSelectedIdx(0);
    try {
      const current = getCachedEntry() || {};
      const updated = {
        ...current,
        zones: zones.length > 0 ? zones : current.zones,
        selectedZoneKey: zoneKey,
        selectedIdx: 0,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
      sessionStorage.setItem(`agri_protect_${normKey}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Helper to persist user product row selection
  const handleProductSelect = (idx: number) => {
    setSelectedIdx(idx);
    try {
      const current = getCachedEntry() || {};
      const updated = {
        ...current,
        zones: zones.length > 0 ? zones : current.zones,
        selectedZoneKey: selectedZoneKey || current.selectedZoneKey,
        selectedIdx: idx,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
      sessionStorage.setItem(`agri_protect_${normKey}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // 2. Real Data Sync to Global Wizard Store for Final Report
  useEffect(() => {
    if (activeProduct && curZone) {
      setSelectedMatch({
        category: 'protection',
        targetTech: selectedChemicalType,
        countryName: curZone.c,
        zoneName: `${curZone.c} — ${curZone.z}`,
        selectedZoneIndex: selectedIdx,
        selectedZoneKey: curZone.k,
        allZonesData: zones,
        zoneEnv: {
          ph: curZone.ph || 'N/A',
          cec: curZone.cec || 'N/A',
          rain: curZone.rain || 'N/A',
          temp: curZone.temp || 'N/A',
        },
        activeProduct,
        allProducts: productList,
      });
    }
  }, [selectedZoneKey, selectedIdx, activeProduct, curZone, productList, zones, selectedChemicalType, setSelectedMatch]);

  // 3. On-Demand Trigger: Active Zone ke Top Products ke liye Ollama AI Synthesis
  useEffect(() => {
    if (!curZone || !curZone.products || curZone.products.length === 0) return;

    const hasCustomVerdict =
      curZone.products[0]?.verdict &&
      !curZone.products[0]?.verdict.includes('checking pathogen escalation');
    if (hasCustomVerdict) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setAiSynthesizing(true);
      try {
        const topCandidates = curZone.products.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          ai: p.formula,
          pests: p.targetPest,
        }));

        const res = await fetch('http://localhost:5000/api/crop-protection/synthesize-zone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            country: curZone.c,
            zoneName: curZone.z,
            rainfall: curZone.rain,
            threats: curZone.threats || 'Endemic threats',
            topProducts: topCandidates,
          }),
        });

        const json = await res.json();
        if (json.success && Array.isArray(json.verdicts) && json.verdicts.length > 0) {
          const vMap = new Map();
          json.verdicts.forEach((v: any) => {
            if (v.id != null) vMap.set(v.id, v.verdict);
          });

          setZones((prevZones) => {
            const nextZones = prevZones.map((z) => {
              if (z.k !== curZone.k) return z;
              return {
                ...z,
                products: z.products.map((p: any) => {
                  if (vMap.has(p.id)) {
                    return { ...p, verdict: vMap.get(p.id) };
                  }
                  return p;
                }),
              };
            });

            // Persist synthesized verdicts into session cache
            try {
              const current = getCachedEntry() || {};
              const updated = {
                ...current,
                zones: nextZones,
                selectedZoneKey: curZone.k,
                selectedIdx,
              };
              sessionStorage.setItem(sessionKey, JSON.stringify(updated));
              sessionStorage.setItem(`agri_protect_${normKey}`, JSON.stringify(updated));
            } catch {
              // ignore
            }

            return nextZones;
          });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Ollama dynamic advisory skipped:', err);
        }
      } finally {
        setAiSynthesizing(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [curZone?.k, sessionKey, normKey, selectedIdx]);

  if (loading) {
    return (
      <MatchAnalysisLoading
        technologyName={selectedChemicalType}
        countryName={selectedCountry}
        category="protection"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Zone Selector ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-85">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <MapPin size={18} />
          </div>
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block">
              DESTINATION TARGET ZONE ({selectedCountry})
            </span>
            <select
              value={selectedZoneKey}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="text-md font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
            >
              {zones.map((z) => (
                <option key={z.k} value={z.k}>
                  {z.c} — {z.z}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Chemical Type Badge */}
        <span className="text-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full font-medium">
          Chemical Type: {selectedChemicalType}
        </span>
      </div>

      {/* ── Zone Environment Strip ── */}
      {curZone && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{curZone.c} — {curZone.z}</span>
              <span className="text-slate-500"></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>pH:</strong> {curZone.ph}</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>CEC:</strong> {curZone.cec}</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>Rain:</strong> {curZone.rain}</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>Temp:</strong> {curZone.temp}</span>
          </div>
        </div>
      )}

      {/* ── 2-Column Match Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-slate-700 uppercase">
            <span className="text-base font-bold">{selectedChemicalType}</span>
            <span className="text-slate-400 text-sm font-semibold">{productList.length} Ranked</span>
          </div>

          <div className="max-h-187.5 overflow-y-auto divide-y divide-slate-100">
            {productList.map((prod: any, idx: number) => {
              const active = selectedIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleProductSelect(idx)}
                  className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition border-l-4 ${
                    active ? 'bg-emerald-50/80 border-[#1e9d5b]' : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg font-mono font-bold text-sm flex items-center justify-center text-white ${
                        Number(prod.score) >= 80 ? 'bg-[#155a3d]' : 'bg-[#1e9d5b]'
                      }`}
                    >
                      {prod.score}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900">{prod.name}</div>
                      <div className="text-sm text-slate-500 truncate max-w-50">
                        {prod.formula}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {activeProduct ? (
            <>
              {/* Header: Name, Company, Formula, and Match Score */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-2xl font-bold text-slate-900">{activeProduct.name}</h3>
                    <span className="text-base font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {activeProduct.chemicalType}
                    </span>
                  </div>
                  <span className="text-base text-slate-500 block mt-1.5">
                    <strong>{activeProduct.company}</strong> · {activeProduct.formula}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-800">
                    {activeProduct.score}
                  </span>
                  <span className="text-sm block text-slate-400">MATCH SCORE</span>
                </div>
              </div>

              {/* 4 Agronomic Pillars */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-sm text-slate-400 block uppercase">Infection Pressure</span>
                  <span className="text-lg font-bold text-slate-800">
                    {activeProduct.pillars?.diseasePressure ?? 20}/25
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-sm text-slate-400 block uppercase">Host Alignment</span>
                  <span className="text-lg font-bold text-slate-800">
                    {activeProduct.pillars?.hostAlignment ?? 20}/25
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-sm text-slate-400 block uppercase">Chemical Fit</span>
                  <span className="text-lg font-bold text-slate-800">
                    {activeProduct.pillars?.chemicalFit ?? 20}/25
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-sm text-slate-400 block uppercase">Resistance Barrier</span>
                  <span className="text-lg font-bold text-slate-800">
                    {activeProduct.pillars?.resistanceBarrier ?? 20}/25
                  </span>
                </div>
              </div>

              {/* Comparison Table 1: Pathogen & Inoculum Alignment Matrix */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-md font-mono font-bold text-slate-700 tracking-wider uppercase">
                  <span>PATHOGEN & INOCULUM GAP · DOES THE ZONE FACE THESE THREATS?</span>
                  <span className="text-slate-500">PRESSURE {activeProduct.pillars?.diseasePressure ?? 20}/25</span>
                </div>
                <table className="w-full text-left text-md">
                  <thead>
                    <tr className="text-slate-400 font-mono text-md uppercase border-b border-slate-100">
                      <th className="py-2 font-semibold">EVALUATION VECTOR</th>
                      <th className="font-semibold">PRODUCT SPECTRUM</th>
                      <th className="font-semibold">ZONE ASSESSMENT</th>
                      <th className="text-right font-semibold">SCORE FIT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProduct.pathogen_gaps && activeProduct.pathogen_gaps.length > 0 ? (
                      activeProduct.pathogen_gaps.map((row: any, gIdx: number) => (
                        <tr key={gIdx} className="font-mono">
                          <td className="py-2.5 font-bold text-slate-900">{row.vector}</td>
                          <td className="text-slate-700">{row.productTarget}</td>
                          <td className="text-slate-600 font-sans text-md">{row.assessment}</td>
                          <td className="text-right font-bold text-emerald-800">{row.weight}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-3 text-slate-400 font-mono text-center">NA</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Comparison Table 2: Parameter Ledger Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-md font-mono font-bold text-slate-700 tracking-wider uppercase">
                  <span>PARAMETER LEDGER · EVERY RULE THAT MOVED THE SCORE</span>
                  <span className="text-slate-500">FIT {activeProduct.pillars?.chemicalFit ?? 20}/25</span>
                </div>
                <table className="w-full text-left text-md">
                  <thead>
                    <tr className="text-slate-400 font-mono text-md uppercase border-b border-slate-100">
                      <th className="py-2 font-semibold">PARAMETER</th>
                      <th className="font-semibold">ZONE VALUE</th>
                      <th className="font-semibold">EFFECT ON THIS PRODUCT</th>
                      <th className="text-right font-semibold">MULTIPLIER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProduct.ledger && activeProduct.ledger.length > 0 ? (
                      activeProduct.ledger.map((row: any, lIdx: number) => (
                        <tr key={lIdx}>
                          <td className="py-2.5 font-bold font-mono text-slate-900">{row.parameter}</td>
                          <td className="font-mono text-slate-700">{row.zone_val}</td>
                          <td className="text-slate-600 text-md">{row.effect}</td>
                          <td className="text-right font-mono font-bold text-emerald-800">{row.mul}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-3 text-slate-400 font-mono text-center">NA</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Recommendation Box */}
              {activeProduct.verdict && (
                <div className="bg-[#103a29] text-[#9fe6c0] p-4 rounded-xl space-y-1.5 text-md leading-relaxed">
                  <div className="flex items-center justify-between font-mono uppercase tracking-widest text-white text-md">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <b>RECOMMENDATION</b>
                    </div>
                    {aiSynthesizing && (
                      <span className="text-[11px] font-sans font-normal text-emerald-300 animate-pulse">
                        Refreshing Ollama Advisory...
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-100">
                    {activeProduct.verdict}
                  </p>
                </div>
              )}

              {/* Complete Technical Dossier */}
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-5 space-y-4">
                {activeProduct.description && (
                  <div>
                    <span className="font-bold text-slate-900 text-base uppercase tracking-wider block mb-1">
                      Description
                    </span>
                    <p className="text-base text-slate-600 leading-relaxed">
                      {activeProduct.description}
                    </p>
                  </div>
                )}

                <div className="border-t border-emerald-100/80 pt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 uppercase text-base">
                      Mode of Action & Mechanism
                    </span>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed font-sans">
                    {activeProduct.modeOfAction || 'Broad-spectrum contact/systemic mode of action.'}
                  </p>
                </div>

                {activeProduct.featuresBenefits && (
                  <div className="border-t border-emerald-100/80 pt-3">
                    <span className="font-bold text-slate-900 text-base uppercase tracking-wider block mb-1">
                      Features & Benefits
                    </span>
                    <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {activeProduct.featuresBenefits}
                    </p>
                  </div>
                )}

                {activeProduct.targetCrops && (
                  <div className="border-t border-emerald-100/80 pt-3">
                    <span className="font-bold text-slate-900 text-base uppercase tracking-wider block mb-1">
                      Target Crop
                    </span>
                    <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {activeProduct.targetCrops}
                    </p>
                  </div>
                )}

                {activeProduct.targetPest && (
                  <div className="border-t border-emerald-100/80 pt-3">
                    <span className="font-bold text-slate-900 text-base uppercase tracking-wider block mb-1">
                      Target Pest / Disease
                    </span>
                    <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {activeProduct.targetPest}
                    </p>
                  </div>
                )}

                {activeProduct.dosage && (
                  <div className="border-t border-emerald-100/80 pt-3">
                    <span className="font-bold text-slate-900 text-base uppercase tracking-wider block mb-1">
                      Recommended Dosage
                    </span>
                    <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {activeProduct.dosage}
                    </p>
                  </div>
                )}

                {activeProduct.packaging && (
                  <div className="border-t border-emerald-100/80 pt-3">
                    <span className="font-bold text-slate-900 text-base uppercase tracking-wider block mb-1">
                      Available Packaging
                    </span>
                    <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {activeProduct.packaging}
                    </p>
                  </div>
                )}

                {activeProduct.application && (
                  <div className="border-t border-emerald-100/80 pt-3">
                    <span className="font-bold text-slate-900 text-base uppercase tracking-wider block mb-1">
                      Application Timing
                    </span>
                    <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {activeProduct.application}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">No product formulation selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}