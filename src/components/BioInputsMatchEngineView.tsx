// src/components/BioInputsMatchEngineView.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { useWizard } from '../state/wizardStore';
import { agriApi } from '../services/agriApi';
import MatchAnalysisLoading from '../UI/MatchAnalysisLoading';

interface ParameterRow {
  parameter: string;
  zoneValue: string;
  requirement: string;
  compatibility: string;
  statusType: 'optimal' | 'acidic' | 'alkaline' | 'deficit' | string;
  score: number;
  caution: boolean;
}

interface Callout {
  tone: 'opportunity' | 'caution';
  label: string;
  items: string[];
}

interface ZoneDetail {
  code: string;
  name: string;
  rainfall: string;
  soil_ph: string;
  soil_type: string;
  districts: string;
  score: number;
  status_label: string;
  summary: string;
  table: ParameterRow[];
  callouts: Callout[];
}

interface BioMatchData {
  success: boolean;
  country: string;
  technology: string;
  executive_overview: {
    total_zones_analysed: number;
    average_score: string;
    best_zone: string;
  };
  zones: ZoneDetail[];
  product_meta: {
    company: string;
    category: string;
    brand_name: string;
    key_benefits: string;
  };
}

export default function BioInputsMatchEngineView() {
  const { state, setSelectedMatch } = useWizard();

  const currentTech = useMemo(() => (state.tech || {}) as Record<string, any>, [state.tech]);
  const country = state.countries?.[0] || 'NA';
  const technology = currentTech.brandProductName || currentTech.name || 'NA';

  const selectedCropType = currentTech.cropType || 'Field & Horticultural Crops';
  const selectedBioCategory = currentTech.category || currentTech.inputCategory || 'Biological Inputs';
  const selectedCompany = currentTech.manufacturingCompany || currentTech.company || 'Verified Bio Provider';
  const selectedProduct = currentTech.brandProductName || currentTech.name || technology;

  // Normalized session cache key for Bio Inputs
  const normKey = `${(country || '').trim()}__${(technology || '').trim()}__${(selectedBioCategory || '').trim()}`.toLowerCase();
  const sessionKey = `agri_bio_match_${normKey.replace(/\s+/g, '_')}`;

  const getCachedEntry = () => {
    try {
      const stored = sessionStorage.getItem(sessionKey) || sessionStorage.getItem(`agri_bio_${normKey}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  };

  const cachedEntry = getCachedEntry();
  const [data, setData] = useState<BioMatchData | null>(() => cachedEntry?.data || null);
  const [loading, setLoading] = useState<boolean>(() => !cachedEntry?.data);
  const [error, setError] = useState<string | null>(null);
  const [selectedZoneIdx, setSelectedZoneIdx] = useState<number>(() => cachedEntry?.selectedZoneIdx ?? 0);

  const lastFetchRef = useRef<string>(cachedEntry?.data ? normKey : '');

  useEffect(() => {
    if (!country || country === 'NA' || !technology || technology === 'NA') {
      setError('Missing country or target biological input selection.');
      setLoading(false);
      return;
    }

    if (lastFetchRef.current === normKey && data) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    async function fetchBioMatch() {
      setLoading(true);
      setError(null);

      try {
        const res = await (agriApi as any).getBioMatchScore({
          country,
          technology,
          category: selectedBioCategory
        });

        if (isSubscribed) {
          if (res?.success) {
            setData(res);
            lastFetchRef.current = normKey;
            const toStore = {
              data: res,
              selectedZoneIdx: 0,
            };
            try {
              sessionStorage.setItem(sessionKey, JSON.stringify(toStore));
              sessionStorage.setItem(`agri_bio_${normKey}`, JSON.stringify(toStore));
            } catch {
              // storage quota fallback
            }
          } else {
            setError(res?.error || 'Failed to calculate biological match.');
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          setError(err.message || 'Error connecting to Bio Match engine.');
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    fetchBioMatch();
    return () => {
      isSubscribed = false;
    };
  }, [normKey, sessionKey, country, technology, selectedBioCategory, data]);

  const zones = data?.zones || [];
  const activeZone = zones[selectedZoneIdx] || zones[0] || null;

  // Persist Zone selection
  const handleZoneSelect = (idx: number) => {
    setSelectedZoneIdx(idx);
    try {
      const current = getCachedEntry() || {};
      const updated = {
        ...current,
        data: data || current.data,
        selectedZoneIdx: idx,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
      sessionStorage.setItem(`agri_bio_${normKey}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Real Data Sync to Global Wizard Store for Final Report
  useEffect(() => {
    if (activeZone && data) {
      const bioGaps = (activeZone.table || []).map((row) => ({
        vector: row.parameter,
        productTarget: row.requirement,
        target: row.requirement,
        assessment: `${row.zoneValue} — ${row.compatibility}`,
        weight: `+${row.score} pts`
      }));

      const ledger = (activeZone.table || []).map((row) => ({
        parameter: row.parameter,
        zone_val: row.zoneValue,
        effect: row.compatibility,
        mul: row.score >= 18 ? 'x1.00' : row.score >= 14 ? 'x0.95' : 'x0.85'
      }));

      const pTable = activeZone.table || [];
      const phSuitability = pTable.find(r => r.parameter.toLowerCase().includes('ph'))?.score 
        ? Math.round((pTable.find(r => r.parameter.toLowerCase().includes('ph'))!.score / 20) * 25) 
        : 22;
      const microbialSurvival = pTable.find(r => r.parameter.toLowerCase().includes('moisture') || r.parameter.toLowerCase().includes('rain'))?.score 
        ? Math.round((pTable.find(r => r.parameter.toLowerCase().includes('moisture') || r.parameter.toLowerCase().includes('rain'))!.score / 20) * 25) 
        : 23;
      const carbonFit = pTable.find(r => r.parameter.toLowerCase().includes('carbon') || r.parameter.toLowerCase().includes('texture') || r.parameter.toLowerCase().includes('organic'))?.score 
        ? Math.round((pTable.find(r => r.parameter.toLowerCase().includes('carbon') || r.parameter.toLowerCase().includes('texture') || r.parameter.toLowerCase().includes('organic'))!.score / 20) * 25) 
        : 21;
      const stimulantResponse = Math.min(25, Math.round(Number(activeZone.score) / 4));

      setSelectedMatch({
        category: 'bio',
        targetTech: selectedProduct,
        zoneName: `${country} — ${activeZone.name} (${activeZone.code})`,
        countryName: country,
        selectedZoneIndex: selectedZoneIdx,
        selectedZoneData: activeZone,
        allZonesData: zones,
        executiveOverview: data.executive_overview,
        zoneEnv: {
          ph: activeZone.soil_ph || 'N/A',
          cec: activeZone.soil_type || 'N/A',
          rain: activeZone.rainfall || 'N/A',
          temp: '22°C - 34°C',
        },
        activeProduct: {
          name: selectedProduct,
          company: selectedCompany,
          category: selectedBioCategory,
          score: activeZone.score,
          pillars: {
            phSuitability,
            microbialSurvival,
            carbonFit,
            stimulantResponse,
            diseasePressure: phSuitability,
            hostAlignment: microbialSurvival,
            chemicalFit: carbonFit,
            resistanceBarrier: stimulantResponse
          },
          bio_gaps: bioGaps,
          ledger,
          verdict: activeZone.summary || `Optimal biological colonisation potential identified in ${activeZone.name}. Formulation compatibility index confirmed at ${activeZone.score}%.`,
          description: currentTech.description || data.product_meta?.key_benefits || `${selectedProduct} bio-stimulant & microbial inoculant engineered for root colonization and stress mitigation.`,
          featuresBenefits: currentTech.featuresBenefits || data.product_meta?.key_benefits || 'Enhances indigenous mycorrhizal networks, solubilizes bound phosphorus, and buffers against drought stress.',
          strains: currentTech.strains || currentTech.microbialComposition || 'Bacillus amyloliquefaciens & Trichoderma spp. (Min 2x10^9 CFU/g)',
          dosage: currentTech.recommendedDosage || '500 ml/ha foliar / 1 kg/ha soil incorporation',
          application: currentTech.applicationMethod || 'Drip fertigation or early-morning foliar spray at vegetative flush',
          packaging: currentTech.packaging || '1L & 5L hermetically sealed containers'
        },
        allProducts: zones.map(z => ({
          name: `${selectedProduct} (${z.code})`,
          score: z.score,
          zone: z.name
        }))
      });
    }
  }, [activeZone, data, country, selectedProduct, selectedCompany, selectedBioCategory, currentTech, selectedZoneIdx, zones, setSelectedMatch]);

  const getScoreBadgeStyles = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (score >= 60) return 'bg-amber-100 text-amber-900 border-amber-300';
    return 'bg-rose-100 text-rose-900 border-rose-300';
  };

  const getScoreProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getCompatibilityBadgeClass = (row: ParameterRow) => {
    const comp = (row.compatibility || '').toUpperCase();
    if (row.statusType === 'acidic' || comp.includes('ACIDIC')) {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (row.statusType === 'alkaline' || comp.includes('ALKALINE')) {
      return 'bg-sky-100 text-sky-900 border-sky-300';
    }
    if (
      row.statusType === 'deficit' ||
      row.caution ||
      comp.includes('DEFICIT') ||
      comp.includes('DEFICIENT') ||
      comp.includes('POOR') ||
      comp.includes('HEAVY CLAY') ||
      comp.includes('COARSE SAND')
    ) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  };

  if (loading) {
    return (
      <MatchAnalysisLoading
        technologyName={technology || 'Biological Formulation'}
        countryName={country || 'Target Market'}
        category="bio"
      />
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center shadow-sm">
        <span className="text-3xl">⚠️</span>
        <h3 className="mt-2 text-base font-bold text-rose-800">Biological Match Engine Unavailable</h3>
        <p className="mt-1 text-sm text-rose-600">{error || 'Could not load data for this selection.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 0. Specification Banner */}
      <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line/60 bg-cream/30 p-3.5">
            <span className="text-sm font-bold uppercase tracking-wider text-muted block">Target Crop Category</span>
            <p className="mt-1 text-sm font-semibold text-ink truncate" title={selectedCropType}>{selectedCropType}</p>
          </div>

          <div className="rounded-xl border border-line/60 bg-cream/30 p-3.5">
            <span className="text-sm font-bold uppercase tracking-wider text-muted block">Biological Category</span>
            <p className="mt-1 text-sm font-semibold text-ink truncate" title={selectedBioCategory}>{selectedBioCategory}</p>
          </div>

          <div className="rounded-xl border border-line/60 bg-cream/30 p-3.5">
            <span className="text-sm font-bold uppercase tracking-wider text-muted block">Manufacturer / Provider</span>
            <p className="mt-1 text-sm font-semibold text-ink truncate" title={selectedCompany}>{selectedCompany}</p>
          </div>

          <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/50 p-3.5">
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-800 block">Selected Bio-Formulation</span>
            <p className="mt-1 text-sm font-bold text-emerald-950 truncate" title={selectedProduct}>{selectedProduct}</p>
          </div>
        </div>
      </div>

      {/* 1. Overview Table with Clickable Selection */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
          <span className="text-sm font-bold uppercase tracking-wider text-muted">AGROCLIMATIC ZONE EVALUATION OVERVIEW</span>
          <span className="text-xs text-muted font-medium">Click any row to sync destination zone</span>
        </div>

        <div className="grid grid-cols-12 gap-4 border-b border-line pb-2 mb-2 text-xs font-bold uppercase tracking-wider text-muted">
          <div className="col-span-4">AGROCLIMATIC ZONE</div>
          <div className="col-span-2">RAINFALL</div>
          <div className="col-span-2">SOIL PH</div>
          <div className="col-span-2">SOIL TEXTURE</div>
          <div className="col-span-2 text-right">SUITABILITY</div>
        </div>

        <div className="divide-y divide-line/40">
          {zones.map((zone, idx) => {
            const isSelected = selectedZoneIdx === idx;
            return (
              <div
                key={zone.code || idx}
                onClick={() => handleZoneSelect(idx)}
                className={`grid grid-cols-12 gap-4 py-3.5 text-sm items-center transition px-2 rounded-md cursor-pointer border-l-4 ${
                  isSelected ? 'bg-emerald-50/80 border-brand' : 'border-transparent hover:bg-cream/20'
                }`}
              >
                <div className="col-span-4 font-semibold text-ink truncate" title={`${zone.code}: ${zone.name}`}>
                  <span className="text-sm text-muted mr-1.5">{zone.code}</span> {zone.name}
                </div>
                <div className="col-span-2 text-muted truncate">{zone.rainfall}</div>
                <div className="col-span-2 text-muted">{zone.soil_ph}</div>
                <div className="col-span-2 text-muted truncate" title={zone.soil_type}>{zone.soil_type}</div>
                <div className="col-span-2 flex items-center justify-end gap-3">
                  <div className="w-20 bg-line/80 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div className={`h-2 rounded-full ${getScoreProgressBarColor(zone.score)}`} style={{ width: `${zone.score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-ink">{zone.score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Zone Detail Cards */}
      <div className="space-y-6">
        {zones.map((zone, idx) => {
          const isSelected = selectedZoneIdx === idx;
          return (
            <div
              key={zone.code || idx}
              onClick={() => handleZoneSelect(idx)}
              className={`rounded-2xl border bg-paper p-6 shadow-sm space-y-5 transition cursor-pointer ${
                isSelected ? 'border-brand ring-1 ring-brand/30' : 'border-line'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    <span className="text-muted mr-2">{zone.code}:</span>{zone.name}
                  </h3>
                  <p className="text-sm text-muted mt-0.5">Suitable Crops: {zone.districts}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="text-[11px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                      Active Selection
                    </span>
                  )}
                  <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-sm font-bold ${getScoreBadgeStyles(zone.score)}`}>
                    {zone.score}% Match — {zone.status_label}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-ink/80 bg-cream/20 p-3.5 rounded-xl border border-line/40">
                {zone.summary}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-sm uppercase tracking-wider text-muted">
                    <tr>
                      <th className="pb-3 w-[28%] font-semibold">PARAMETER</th>
                      <th className="pb-3 w-[26%] font-semibold">ZONE METRIC</th>
                      <th className="pb-3 w-[24%] font-semibold">REQUIREMENT</th>
                      <th className="pb-3 w-[22%] text-right font-semibold">COMPATIBILITY & POINTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40">
                    {zone.table?.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-cream/10">
                        <td className="py-3 font-medium text-ink">{row.parameter}</td>
                        <td className="py-3 text-muted text-sm">{row.zoneValue}</td>
                        <td className="py-3 text-muted text-sm">{row.requirement}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-sm font-semibold border ${getCompatibilityBadgeClass(row)}`}>
                              {row.compatibility}
                            </span>
                            <span className="inline-flex items-center rounded border border-line bg-cream/70 px-2 py-0.5 text-sm font-bold text-ink">
                              {row.score}<span className="text-muted font-normal">/20</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {zone.callouts?.map((callout, cIdx) => (
                <div key={cIdx} className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 space-y-2">
                  <span className="font-semibold text-ink text-sm block">{callout.label}</span>
                  <ul className="space-y-1.5 text-sm text-ink/85">
                    {callout.items?.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold leading-5">•</span>
                        <span className="leading-5">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}