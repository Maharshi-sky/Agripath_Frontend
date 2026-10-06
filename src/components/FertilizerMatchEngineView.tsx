// src/components/FertilizerMatchEngineView.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, Sparkles, Package } from 'lucide-react';
import { useWizard } from '../state/wizardStore';
import { fetchDbZones, fetchDbProducts, calculateOllamaFertilizerMatch } from '../services/api';
import MatchAnalysisLoading from '../UI/MatchAnalysisLoading';

export default function FertilizerMatchEngineView() {
  const { state, setSelectedMatch } = useWizard();

  const selectedCountry = useMemo(() => {
    return state.countries?.[0] || 'Uganda';
  }, [state.countries]);

  const selectedCategory = useMemo(() => {
    return state.tech?.fertilizerCategory || state.tech?.name || 'Primary Nutrients';
  }, [state.tech]);

  // Normalized session cache keys
  const normKey = `${(selectedCountry || '').trim()}__${(selectedCategory || '').trim()}`.toLowerCase();
  const sessionKey = `agri_fert_match_${normKey.replace(/\s+/g, '_')}`;

  const getCachedEntry = () => {
    try {
      const stored = sessionStorage.getItem(sessionKey) || sessionStorage.getItem(`agri_fert_${normKey}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  };

  const cachedEntry = getCachedEntry();
  const [zones, setZones] = useState<any[]>(() => cachedEntry?.zones || []);
  const [dbProducts, setDbProducts] = useState<any[]>(() => cachedEntry?.dbProducts || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedEntry?.zones || cachedEntry.zones.length === 0);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedZoneKey, setSelectedZoneKey] = useState<string>(() => cachedEntry?.selectedZoneKey || '');
  const [selectedIdx, setSelectedIdx] = useState<number>(() => cachedEntry?.selectedIdx ?? 0);
  const [rankedResultsMap, setRankedResultsMap] = useState<Record<string, any[]>>(() => cachedEntry?.rankedResultsMap || {});
  const [aiSource, setAiSource] = useState<string>(() => cachedEntry?.aiSource || '');

  const lastFetchRef = useRef<string>(cachedEntry?.zones?.length ? normKey : '');

  // 1. Fetch Zones & Master Products with Session Caching
  useEffect(() => {
    if (!selectedCountry) {
      setLoading(false);
      return;
    }

    if (lastFetchRef.current === normKey && zones.length > 0 && dbProducts.length > 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [zData, pData] = await Promise.all([
          fetchDbZones(selectedCountry),
          fetchDbProducts(selectedCategory)
        ]);

        if (!isMounted) return;

        let mappedZones: any[] = [];
        if (zData && Array.isArray(zData) && zData.length > 0) {
          mappedZones = zData.map((z: any) => ({
            k: String(z.zone_id || z.id || z.zone_name || Math.random()),
            c: z.country || selectedCountry,
            z: z.zone_name || 'Agroclimatic Zone',
            crop: Array.isArray(z.main_crops) ? z.main_crops.join(' · ') : (z.main_crops || 'General crops'),
            ph: z.soil_ph ?? 'NA',
            cec: z.cec ?? 'NA',
            oc: z.organic_carbon_pct ?? 'NA',
            sand: z.sand_ratio ?? 'NA',
            silt: z.silt_ratio ?? 'NA',
            clay: z.clay_ratio ?? 'NA',
            bulk_density: z.bulk_density ?? 'NA',
            rain: z.rainfall_mm ?? 'NA',
            temp: z.temperature_c ?? 'NA',
            status_tags: z.status_tags || null
          }));
          setZones(mappedZones);
          setSelectedZoneKey(mappedZones[0]?.k || '');
        } else {
          setZones([]);
        }

        const resolvedProducts = (pData && Array.isArray(pData) && pData.length > 0) ? pData : [];
        setDbProducts(resolvedProducts);
        lastFetchRef.current = normKey;

        const toStore = {
          zones: mappedZones,
          dbProducts: resolvedProducts,
          selectedZoneKey: mappedZones[0]?.k || '',
          selectedIdx: 0,
          rankedResultsMap: {},
          aiSource: ''
        };
        try {
          sessionStorage.setItem(sessionKey, JSON.stringify(toStore));
          sessionStorage.setItem(`agri_fert_${normKey}`, JSON.stringify(toStore));
        } catch {
          // storage quota fallback
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to query database');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [selectedCountry, selectedCategory, normKey, sessionKey, zones.length, dbProducts.length]);

  const curZone = useMemo(() => {
    return zones.find(z => z.k === selectedZoneKey) || zones[0] || null;
  }, [zones, selectedZoneKey]);

  // 2. Dispatch Match Engine with Zone-wise Result Caching
  useEffect(() => {
    if (!curZone || dbProducts.length === 0) return;

    // Check if current zone already has ranked results in memory or session cache
    if (rankedResultsMap[curZone.k] && rankedResultsMap[curZone.k].length > 0) {
      return;
    }

    let isMounted = true;
    async function runEngine() {
      setAiLoading(true);
      try {
        const res = await calculateOllamaFertilizerMatch(
          {
            country: curZone.c,
            zone_name: curZone.z,
            soil_ph: curZone.ph,
            cec: curZone.cec,
            organic_carbon: curZone.oc,
            sand_ratio: curZone.sand,
            silt_ratio: curZone.silt,
            clay_ratio: curZone.clay,
            bulk_density: curZone.bulk_density,
            rainfall_mm: curZone.rain,
            temperature_c: curZone.temp,
            main_crops: curZone.crop,
            status_tags: curZone.status_tags
          },
          dbProducts
        );

        if (!isMounted) return;

        if (res && res.data) {
          setAiSource(res.source || '');
          setRankedResultsMap(prev => {
            const nextMap = { ...prev, [curZone.k]: res.data };
            try {
              const current = getCachedEntry() || {};
              const updated = {
                ...current,
                zones,
                dbProducts,
                selectedZoneKey: curZone.k,
                selectedIdx,
                rankedResultsMap: nextMap,
                aiSource: res.source || ''
              };
              sessionStorage.setItem(sessionKey, JSON.stringify(updated));
              sessionStorage.setItem(`agri_fert_${normKey}`, JSON.stringify(updated));
            } catch {
              // ignore
            }
            return nextMap;
          });
        }
      } catch (e) {
        console.warn('AI evaluation warning:', e);
      } finally {
        if (isMounted) setAiLoading(false);
      }
    }

    runEngine();
    return () => { isMounted = false; };
  }, [curZone?.k, dbProducts, zones, sessionKey, normKey, selectedIdx, rankedResultsMap]);

  // User zone selection helper
  const handleZoneChange = (zoneKey: string) => {
    setSelectedZoneKey(zoneKey);
    setSelectedIdx(0);
    try {
      const current = getCachedEntry() || {};
      const updated = {
        ...current,
        zones: zones.length > 0 ? zones : current.zones,
        dbProducts: dbProducts.length > 0 ? dbProducts : current.dbProducts,
        selectedZoneKey: zoneKey,
        selectedIdx: 0,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
      sessionStorage.setItem(`agri_fert_${normKey}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // User product row selection helper
  const handleProductSelect = (idx: number) => {
    setSelectedIdx(idx);
    try {
      const current = getCachedEntry() || {};
      const updated = {
        ...current,
        zones: zones.length > 0 ? zones : current.zones,
        dbProducts: dbProducts.length > 0 ? dbProducts : current.dbProducts,
        selectedZoneKey: selectedZoneKey || current.selectedZoneKey,
        selectedIdx: idx,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
      sessionStorage.setItem(`agri_fert_${normKey}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // 3. Merged Rows strictly from fertilizer_master (NA for missing fields)
  const rows = useMemo(() => {
    if (!dbProducts || dbProducts.length === 0) return [];

    const currentRanked = (curZone && rankedResultsMap[curZone.k]) ? rankedResultsMap[curZone.k] : [];
    const aiMap = new Map();
    currentRanked.forEach(r => aiMap.set(r.id, r));

    return dbProducts.map((p: any, idx: number) => {
      const ai = aiMap.get(idx) || {};
      
      const nType = p['Nutrient_Type'] || p['Nutrient Type'] || selectedCategory || 'NA';
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
        company: company,
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
        verdict: ai.verdict || ''
      };
    }).sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
  }, [dbProducts, curZone, rankedResultsMap, selectedCategory]);

  const activeMatch = rows[selectedIdx] || rows[0] || null;

  // 4. Live Data Sync to Wizard Store for Final Report
  useEffect(() => {
    if (activeMatch && curZone) {
      setSelectedMatch({
        category: 'fertilizers',
        targetTech: selectedCategory,
        zoneName: `${curZone.c} — ${curZone.z}`,
        countryName: curZone.c,
        selectedZoneIndex: selectedIdx,
        selectedZoneKey: curZone.k,
        allZonesData: zones,
        zoneEnv: {
          ph: curZone.ph || 'N/A',
          cec: curZone.cec || 'N/A',
          rain: curZone.rain || 'N/A',
          temp: curZone.temp || 'N/A',
        },
        activeProduct: activeMatch,
        allProducts: rows,
      });
    }
  }, [selectedZoneKey, selectedIdx, activeMatch, curZone, rows, zones, selectedCategory, setSelectedMatch]);

  if (loading || aiLoading) {
    return (
      <MatchAnalysisLoading
        technologyName={selectedCategory}
        countryName={selectedCountry}
        category="fertilizer"
      />
    );
  }

  if (error || zones.length === 0 || dbProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-10 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No Match Data Available (NA)</h3>
        <p className="text-md text-slate-500 max-w-md mx-auto">
          {error || `No agroclimatic zones or fertilizer products found for Country: "${selectedCountry}" and Category: "${selectedCategory}".`}
        </p>
      </div>
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
            <span className="text-md font-mono font-bold uppercase tracking-wider text-slate-400 block">
              DESTINATION TARGET ZONE ({selectedCountry})
            </span>
            <select
              value={selectedZoneKey}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="text-md font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
            >
              {zones.map(z => (
                <option key={z.k} value={z.k}>{z.c} — {z.z}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-medium">
          Category: {selectedCategory}
        </span>
      </div>

      {/* ── Soil Chemistry Strip ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-lg">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{curZone ? `${curZone.c} — ${curZone.z}:` : 'NA:'}</span>
            <span className="text-slate-500 font-mono">({curZone?.crop || 'NA'})</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>pH:</strong> {curZone?.ph}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>CEC:</strong> {curZone?.cec}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>OC:</strong> {curZone?.oc !== 'NA' ? `${curZone.oc}%` : 'NA'}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>Sand|Silt|Clay:</strong> {curZone?.sand}% | {curZone?.silt}% | {curZone?.clay}%</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>Bulk Density:</strong> {curZone?.bulk_density}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>Rain:</strong> {curZone?.rain}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded"><strong>Temp:</strong> {curZone?.temp}</span>

          {curZone?.status_tags && Object.entries(curZone.status_tags).map(([nutrient, rawStatus]: any) => {
            const statusStr = String(rawStatus || '').toLowerCase();
            const isDeficient = statusStr.includes('low') || statusStr.includes('defic');
            const isExcess = statusStr.includes('high') || statusStr.includes('excess');

            const badgeColor = isDeficient
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : isExcess
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200';

            const label = isDeficient ? 'low' : isExcess ? 'high' : 'opt';
            const rawText = `${nutrient} ${label}`.trim().toLowerCase();
            const sentenceCaseTag = rawText.charAt(0).toUpperCase() + rawText.slice(1);

            return (
              <span key={nutrient} className={`border px-2 py-0.5 rounded font-bold ${badgeColor}`}>
                {sentenceCaseTag}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── 2-Column Match Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-lg font-mono font-bold text-slate-700 uppercase">
            <span>{selectedCategory}</span>
            <span className="text-slate-400 font-normal">{rows.length} Ranked</span>
          </div>

          <div className="max-h-205 overflow-y-auto divide-y divide-slate-100">
            {rows.map((r, idx) => {
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
                    <div className={`w-8 h-8 rounded-lg font-mono font-bold text-md flex items-center justify-center text-white ${
                      Number(r.score) >= 80 ? 'bg-[#155a3d]' : Number(r.score) >= 70 ? 'bg-[#1e9d5b]' : 'bg-slate-500'
                    }`}>
                      {r.score}
                    </div>
                    <div>
                      <div className="text-md font-bold text-slate-900">{r.nutrientName}</div>
                      <div className="text-md font-mono text-slate-500">{r.productName} ({r.formula})</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {activeMatch && (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">{activeMatch.nutrientName}</h3>
                  {aiSource === 'ollama' && (
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      Ollama Precision Engine
                    </span>
                  )}
                </div>
                <p className="text-md font-mono text-slate-500 mt-1 uppercase tracking-wider">
                  {activeMatch.formula} · {activeMatch.productForm} ➔ {curZone ? `${curZone.c} · ${curZone.z}` : 'NA'}
                </p>
              </div>

              {/* 4 Agronomic Pillars + Score */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-stretch divide-x divide-slate-200">
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <span className="text-md font-mono uppercase text-slate-400 font-semibold block">NEED</span>
                  <span className="text-base font-mono font-bold text-slate-800 my-1">{activeMatch.need}</span>
                  <div className="h-1 w-full bg-emerald-600 rounded-full" />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <span className="text-md font-mono uppercase text-slate-400 font-semibold block">EFFICIENCY</span>
                  <span className="text-base font-mono font-bold text-slate-800 my-1">{activeMatch.eff}</span>
                  <div className="h-1 w-full bg-emerald-600 rounded-full" />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <span className="text-md font-mono uppercase text-slate-400 font-semibold block">FEASIBILITY</span>
                  <span className="text-base font-mono font-bold text-slate-800 my-1">{activeMatch.feas}</span>
                  <div className="h-1 w-full bg-emerald-600 rounded-full" />
                </div>
                
                <div className="w-24 bg-[#0d3422] text-white flex flex-col justify-center items-center p-3">
                  <span className="text-md font-mono uppercase text-emerald-400 font-semibold tracking-wider">SCORE</span>
                  <span className="text-2xl font-mono font-bold text-white mt-0.5">{activeMatch.score}</span>
                </div>
              </div>

              <p className="text-md text-slate-500 font-normal leading-relaxed -mt-2">
                Multiplied, not averaged — a severe gap on any biological factor directly penalizes the match.
              </p>

              {/* Nutrient Gap Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-md font-mono font-bold text-slate-700 tracking-wider uppercase">
                  <span>NUTRIENT GAP · DOES THE ZONE NEED WHAT THIS SUPPLIES?</span>
                  <span className="text-slate-500">NEED {activeMatch.need}</span>
                </div>
                <table className="w-full text-left text-md">
                  <thead>
                    <tr className="text-slate-400 font-mono text-md uppercase border-b border-slate-100">
                      <th className="py-2 font-semibold">NUTRIENT</th>
                      <th className="font-semibold">CONTENT</th>
                      <th className="font-semibold">ASSESSMENT</th>
                      <th className="text-right font-semibold">WEIGHT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeMatch.nutrient_gaps.length > 0 ? (
                      activeMatch.nutrient_gaps.map((row: any, gIdx: number) => (
                        <tr key={gIdx} className="font-mono">
                          <td className="py-2.5 font-bold text-slate-900">{row.nutrient}</td>
                          <td className="text-slate-700">{row.content}</td>
                          <td className="text-slate-600 font-sans text-md">{row.assessment}</td>
                          <td className="text-right font-bold text-emerald-800">{row.weight}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="py-3 text-slate-400 font-mono text-center">NA</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Parameter Ledger Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-md font-mono font-bold text-slate-700 tracking-wider uppercase">
                  <span>PARAMETER LEDGER · EVERY RULE THAT MOVED THE SCORE</span>
                  <span className="text-slate-500">EFF {activeMatch.eff} · FEAS {activeMatch.feas} </span>
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
                    {activeMatch.ledger && activeMatch.ledger.length > 0 ? (
                      activeMatch.ledger.map((row: any, lIdx: number) => (
                        <tr key={lIdx}>
                          <td className="py-2.5 font-bold font-mono text-slate-900">{row.parameter}</td>
                          <td className="font-mono text-slate-700">{row.zone_val}</td>
                          <td className="text-slate-600 text-md">{row.effect}</td>
                          <td className="text-right font-mono font-bold text-emerald-800">{row.mul}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="py-3 text-slate-400 font-mono text-center">NA</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Recommendation Box */}
              <div className="bg-[#103a29] text-[#9fe6c0] p-4 rounded-xl space-y-1.5 text-md leading-relaxed">
                <div className="flex items-center gap-1.5 font-mono uppercase tracking-widest text-white text-md">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <b>RECOMMENDATION</b>
                </div>
                <p className="text-emerald-100">
                  {activeMatch.verdict}
                </p>
              </div>

              {/* ── TOP DIVIDER LINE ── */}
              <hr className="border-t-2 border-slate-800 my-4" />

              {/* ── AUTO-POPULATED PRODUCT TECHNICAL DOSSIER ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-emerald-700" />
                    <span className="font-bold uppercase text-slate-800 text-md">
                      Product Technical Dossier & Specifications
                    </span>
                  </div>
                  <span className="text-md font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded font-bold">
                    {activeMatch.manufacturingCompany}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-md font-mono text-slate-400 uppercase block">Nutrient Type</span>
                    <span className="font-semibold text-slate-800 text-md">{activeMatch.nutrientType}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-md font-mono text-slate-400 uppercase block">Nutrient Name</span>
                    <span className="font-semibold text-slate-800 text-md">{activeMatch.nutrientName}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-md font-mono text-slate-400 uppercase block">Manufacturer</span>
                    <span className="font-semibold text-slate-800 text-md truncate block">{activeMatch.manufacturingCompany}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-md font-mono text-slate-400 uppercase block">Product Form</span>
                    <span className="font-semibold text-slate-800 text-md">{activeMatch.productForm}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-300">
                    <span className="text-md font-mono text-emerald-800 font-bold uppercase block">Product Name</span>
                    <span className="font-bold text-slate-900 text-md">{activeMatch.productName}</span>
                  </div>
                  <div className="md:col-span-8 bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-md font-mono text-emerald-400 font-bold uppercase block">Nutrients Included (Percentage Breakdown)</span>
                      <span className="font-mono font-bold text-white text-md tracking-wider">{activeMatch.nutrientsIncluded}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-md font-mono text-slate-400 uppercase font-bold block">Description</span>
                    <p className="text-slate-700 leading-relaxed text-md">{activeMatch.description}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-md font-mono text-slate-400 uppercase font-bold block">Key Benefits</span>
                    <p className="text-slate-700 leading-relaxed text-md">{activeMatch.keyBenefits}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-md font-mono text-slate-400 uppercase font-bold block">How to Use / Application Method</span>
                    <p className="text-slate-700 leading-relaxed text-md">{activeMatch.applicationMethod}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-md font-mono text-slate-400 uppercase font-bold block">Features & Specifications</span>
                    <p className="text-slate-700 leading-relaxed text-md">{activeMatch.features}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-md font-mono text-slate-400 uppercase block font-bold">Recommended Crops</span>
                    <span className="font-semibold text-slate-800 text-md">{activeMatch.recommendedCrops}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-md font-mono text-slate-400 uppercase block font-bold">Recommended Dosage</span>
                    <span className="font-semibold text-slate-800 text-md">{activeMatch.recommendedDosage}</span>
                  </div>
                </div>
              </div>

              {/* ── BOTTOM DIVIDER LINE ── */}
              <hr className="border-t-2 border-slate-800 my-4" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}