// src/persona/farmer/components/SeedMatchEngineView.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { Sparkles, Info, AlertTriangle, Sprout, Crosshair } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { agriApi } from '../../../services/agriApi';
import { useWizard } from '../../../state/wizardStore';
import { DEMO_MATCH_ZONES } from '../../../data/demoMatchReport';
import MatchAnalysisLoading from '../../../UI/MatchAnalysisLoading';

function getBadgeStyle(compat: string) {
  const clean = (compat || '').trim();
  const upper = clean.toUpperCase();

  // 1. GREY / NA
  if (!clean || upper === 'NA' || upper === 'N/A') {
    return 'bg-gray-100 text-gray-700 border border-gray-200 font-medium';
  }

  // 2. RUBY / RED CONDITIONS
  if (
    upper === 'VERY LOW' ||
    upper === 'VERY HIGH' ||
    upper === 'EXTREME ACIDIC' ||
    upper === 'EXTREME ALKALINE' ||
    upper === 'POOR' ||
    upper.includes('VERY LOW') ||
    upper.includes('VERY HIGH') ||
    upper.includes('EXTREME ACIDIC') ||
    upper.includes('EXTREME ALKALINE')
  ) {
    return 'bg-rose-100 text-rose-800 border border-rose-300 font-medium';
  }

  // 3. AMBER / YELLOW CONDITIONS
  if (
    upper === 'LOW' ||
    upper === 'HIGH' ||
    upper === 'ACIDIC STRESS' ||
    upper === 'ALKALINE STRESS' ||
    upper === 'HEAT STRESS' ||
    upper === 'COLD STRESS' ||
    upper === 'SUB OPTIMAL' ||
    upper === 'SUBOPTIMAL' ||
    upper === 'SUB-OPTIMAL' ||
    upper === 'CLAY EXCESS' ||
    upper === 'CLAY DEFICIT' ||
    upper === 'HIGH SAND' ||
    upper === 'LOW SAND' ||
    upper === 'SLIT EXCESS' ||
    upper === 'SILT EXCESS' ||
    upper === 'SLIT DEFICIT' ||
    upper === 'SILT DEFICIT' ||
    upper === 'MODERATE' ||
    upper.includes('SUB OPTIMAL') ||
    upper.includes('SUBOPTIMAL') ||
    upper.includes('STRESS') ||
    upper.includes('EXCESS') ||
    upper.includes('DEFICIT') ||
    upper.includes('CAUTION') ||
    upper.includes('VARIATION')
  ) {
    return 'bg-[#FEF3C7] text-[#92400E] border border-amber-300 font-medium';
  }

  // 4. EMERALD / GREEN CONDITIONS
  if (upper.includes('OPTIMAL') || upper.includes('EXCELLENT')) {
    return 'bg-[#E4F5EA] text-[#196239] border border-emerald-300 font-medium';
  }

  return 'bg-gray-100 text-gray-700 border border-gray-200 font-medium';
}

function formatExactPh(val: any): string {
  if (val == null || val === '') return 'NA';
  if (typeof val === 'number') return val.toFixed(1);
  const s = String(val).trim();
  if (s.includes('–') || s.includes('-')) {
    const parts = s.split(/[–-]/).map((p) => parseFloat(p.trim())).filter((n) => !isNaN(n));
    if (parts.length === 2) {
      return ((parts[0] + parts[1]) / 2).toFixed(1);
    }
    if (parts.length === 1) return parts[0].toFixed(1);
  }
  const parsed = parseFloat(s);
  return !isNaN(parsed) ? parsed.toFixed(1) : s;
}

export default function SeedMatchEngineView() {
  const { state, setSelectedMatch } = useWizard();

  const currentTech = (state.tech || {}) as Record<string, any>;
  const targetCountry = state.countries?.[0] || 'NA';
  const targetCategory = currentTech.type || currentTech.category || 'Seeds & Varieties';
  const targetTech = currentTech.varietyName || currentTech.name || 'Selected Variety';
  const targetOriginRegion = currentTech.originRegion || '';
  const farmerCoords = state.farmerCoords || null;

  const cropGroup = (currentTech.cropGroup || currentTech.cropType || currentTech.group || currentTech.category || 'NA').trim();
  const cropName = (currentTech.cropName || currentTech.crop || currentTech.cropType || 'Target Crop').trim();
  const varietyName = (currentTech.varietyName || currentTech.name || targetTech).trim();

  const coordsTag = farmerCoords ? `_${farmerCoords.lat}_${farmerCoords.lon}` : '';
  const normKey = `${(targetCountry || '').trim()}__${(targetTech || '').trim()}${coordsTag}`.toLowerCase();
  const sessionKey = `agri_seed_match_${normKey.replace(/\s+/g, '_')}`;

  const getCachedEntry = () => {
    try {
      const stored = sessionStorage.getItem(sessionKey) || sessionStorage.getItem(`agri_seed_${normKey}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  };

  const cachedEntry = getCachedEntry();
  const [liveData, setLiveData] = useState<any>(() => cachedEntry?.liveData || cachedEntry?.res || null);
  const [loading, setLoading] = useState<boolean>(() => !(cachedEntry?.liveData || cachedEntry?.res));
  const [selectedZoneIdx, setSelectedZoneIdx] = useState<number>(() => {
    if (typeof cachedEntry?.selectedZoneIdx === 'number') return cachedEntry.selectedZoneIdx;
    if (typeof cachedEntry?.selectedIdx === 'number') return cachedEntry.selectedIdx;
    return 0;
  });

  const lastFetchRef = useRef<string>(cachedEntry ? normKey : '');

  useEffect(() => {
    if (lastFetchRef.current === normKey && liveData) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    async function fetchLiveMatch() {
      setLoading(true);
      try {
        const payload: any = {
          category: targetCategory,
          technology: targetTech,
          country: targetCountry,
          recommendedStates: targetOriginRegion,
        };

        if (farmerCoords) {
          payload.coordinates = farmerCoords;
        }

        const res = await agriApi.getMatchScore(payload);

        if (isSubscribed && res?.success) {
          setLiveData(res);
          lastFetchRef.current = normKey;
          const payloadToCache = {
            liveData: res,
            res,
            selectedZoneIdx: 0,
            selectedIdx: 0,
          };
          try {
            sessionStorage.setItem(sessionKey, JSON.stringify(payloadToCache));
            sessionStorage.setItem(`agri_seed_${normKey}`, JSON.stringify(payloadToCache));
          } catch {
            // storage quota fallback
          }
        }
      } catch (err) {
        console.warn('Backend offline, falling back to cached template data.', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    fetchLiveMatch();

    return () => {
      isSubscribed = false;
    };
  }, [normKey, sessionKey, targetCountry, targetCategory, targetTech, targetOriginRegion, farmerCoords, liveData]);

  const zonesToDisplay = useMemo(() => {
    if (liveData?.zones && Array.isArray(liveData.zones) && liveData.zones.length > 0) {
      return liveData.zones;
    }
    return DEMO_MATCH_ZONES;
  }, [liveData]);

  const activeZone = zonesToDisplay[selectedZoneIdx] || zonesToDisplay[0] || null;

  const handleSelectZone = (idx: number) => {
    setSelectedZoneIdx(idx);
    try {
      const current = getCachedEntry() || {};
      const updated = {
        ...current,
        liveData: liveData || current.liveData,
        res: liveData || current.res,
        selectedZoneIdx: idx,
        selectedIdx: idx,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
      sessionStorage.setItem(`agri_seed_${normKey}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (activeZone) {
      const rawTable: any[] = Array.isArray(activeZone.table) ? activeZone.table : [];

      const pTable = rawTable.map((row: any) => {
        const isPh = row.parameter?.toLowerCase().includes('ph');
        return {
          ...row,
          parameter: isPh ? 'Soil pH' : row.parameter,
          zoneValue: isPh ? formatExactPh(row.zoneValue) : row.zoneValue,
        };
      });

      const rainRow = pTable.find((r: any) => r.parameter?.toLowerCase().includes('rain'));
      const phRow = pTable.find((r: any) => r.parameter?.toLowerCase().includes('ph'));
      const tempRow = pTable.find((r: any) => r.parameter?.toLowerCase().includes('temp'));
      const soilRow = pTable.find((r: any) => r.parameter?.toLowerCase().includes('soil'));

      const phenologyGaps = pTable.map((row: any) => ({
        vector: row.parameter,
        productTarget: row.requirement || 'Optimal Threshold',
        attribute: row.requirement || 'Standard Phenology',
        assessment: `${row.zoneValue} — ${row.compatibility}`,
        reality: `${row.zoneValue} (${row.compatibility})`,
        weight: row.compatibility?.toUpperCase().includes('OPTIMAL') ? '+25 pts' : '+20 pts',
      }));

      const ledger = pTable.map((row: any) => ({
        parameter: row.parameter,
        zone_val: row.zoneValue,
        effect: row.compatibility,
        mul: row.compatibility?.toUpperCase().includes('OPTIMAL') ? 'x1.00' : 'x0.95',
      }));

      const thermalFit = tempRow?.compatibility?.toUpperCase().includes('OPTIMAL') ? 24 : 20;
      const rainfallFit = rainRow?.compatibility?.toUpperCase().includes('OPTIMAL') ? 24 : 20;
      const maturityFit = soilRow?.compatibility?.toUpperCase().includes('OPTIMAL') ? 23 : 21;
      const yieldPotential = Math.min(25, Math.round(Number(activeZone.score || 80) / 4));

      const exactPhClean = formatExactPh(phRow?.zoneValue || activeZone.soil_ph || '6.5');

      setSelectedMatch({
        category: 'seeds',
        targetTech,
        countryName: targetCountry,
        zoneName: `${activeZone.code} · ${activeZone.name}`,
        selectedZoneIndex: selectedZoneIdx,
        selectedZoneData: activeZone,
        allZonesData: zonesToDisplay,
        baselineSource: liveData?.db_meta?.matching_source || liveData?.baseline_source || 'Recommended States DB',
        executiveOverview: liveData?.executive_overview || null,
        zoneEnv: {
          ph: exactPhClean,
          cec: soilRow?.zoneValue || activeZone.soil_type || 'Loam / Vertisol',
          rain: rainRow?.zoneValue || activeZone.rainfall || '850 mm',
          temp: tempRow?.zoneValue || '18°C - 30°C',
        },
        activeProduct: {
          name: targetTech,
          company: currentTech.company || currentTech.institution || 'Breeding Institution',
          category: targetCategory,
          score: activeZone.score,
          summary: activeZone.summary,
          table: pTable,
          callouts: activeZone.callouts || [],
          pillars: {
            thermalFit,
            rainfallFit,
            maturityFit,
            yieldPotential,
            diseasePressure: thermalFit,
            hostAlignment: rainfallFit,
            chemicalFit: maturityFit,
            resistanceBarrier: yieldPotential,
          },
          phenology_gaps: phenologyGaps,
          ledger,
          verdict:
            activeZone.summary ||
            `Varietal phenological alignment confirmed at ${activeZone.score}% suitability in ${activeZone.name}. Maturity cycle synchronizes with destination precipitation window.`,
          description:
            currentTech.description ||
            `${targetTech} high-yield certified seed variety evaluated for agroclimatic adaptation in ${targetCountry}.`,
          featuresBenefits:
            currentTech.features ||
            currentTech.traits ||
            'Drought tolerance, resistance to endemic stem rust, excellent standability, and synchronized maturity.',
          maturityDays: currentTech.maturityDays || currentTech.daysToMaturity || '115-125',
          yieldPotential: currentTech.yieldPotential || '4.5 - 6.0 MT/ha',
          grainType: currentTech.grainType || currentTech.seedType || 'Certified Hybrid / Line Selection',
        },
        allProducts: zonesToDisplay.map((z: any) => ({
          name: `${targetTech} (${z.code})`,
          score: z.score,
          zone: z.name,
        })),
      });
    }
  }, [
    activeZone,
    selectedZoneIdx,
    targetCountry,
    targetTech,
    targetCategory,
    zonesToDisplay,
    liveData,
    currentTech,
    setSelectedMatch,
  ]);

  if (loading) {
    return (
      <MatchAnalysisLoading
        technologyName={targetTech}
        countryName={targetCountry}
        category="seeds"
      />
    );
  }

  const overview = liveData?.executive_overview;
  const totalZones = zonesToDisplay.length;
  const averageScore =
    overview?.average_score ||
    `${Math.round(zonesToDisplay.reduce((acc: number, z: any) => acc + (Number(z.score) || 0), 0) / (totalZones || 1))}% avg`;
  const bestZoneName = overview?.best_zone || zonesToDisplay[0]?.name || 'N/A';

  const isAiInferred = Boolean(
    liveData?.is_ai_inferred ||
    liveData?.notice_tag ||
    overview?.notice_tag ||
    liveData?.baseline_source?.includes('AI')
  );

  const noticeMessage =
    liveData?.notice_tag ||
    overview?.notice_tag ||
    'Unable to find recommended states, comparison made on AI generated parameters';

  return (
    <div className="space-y-6">
      {/* ── 0. SELECTED SEED VARIETY SPECIFICATION BANNER ── */}
      <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <Sprout className="h-4 w-4 text-emerald-700" />
            <span>Selected Seed Specification</span>
          </div>

          {farmerCoords && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
              <Crosshair size={13} className="text-emerald-700" />
              <span>Target Farm GPS: {farmerCoords.lat}°, {farmerCoords.lon}°</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line/60 bg-cream/30 p-3.5">
            <span className="text-sm font-bold uppercase tracking-wider text-muted block">
              Crop Group
            </span>
            <p className="mt-1 text-base font-bold text-ink truncate uppercase">
              {cropGroup}
            </p>
          </div>

          <div className="rounded-xl border border-line/60 bg-cream/30 p-3.5">
            <span className="text-sm font-bold uppercase tracking-wider text-muted block">
              Crop Name
            </span>
            <p className="mt-1 text-base font-bold text-ink truncate uppercase">
              {cropName}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/50 p-3.5">
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-800 block">
              Variety Name
            </span>
            <p className="mt-1 text-base font-bold text-emerald-950 truncate uppercase">
              {varietyName}
            </p>
          </div>
        </div>
      </div>

      {/* ⚠️ DYNAMIC AI INFERRED NOTICE BAR */}
      {isAiInferred && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 px-5 py-3.5 text-amber-950 shadow-xs backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/80 text-amber-800">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Agronomic Baseline Notice
              </div>
              <div className="text-sm font-semibold text-amber-900">{noticeMessage}</div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            AI Inferred Profile
          </span>
        </div>
      )}

      {/* 1. TOP EXECUTIVE SUMMARY */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-ink">
              {targetCountry} — {totalZones} Zones Analysed
            </h2>

            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold tracking-wide border',
                isAiInferred
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800'
              )}
            >
              {isAiInferred ? <Sparkles className="h-3 w-3" /> : <Info className="h-3 w-3" />}
              {isAiInferred
                ? 'AI Generated Baseline'
                : liveData?.db_meta?.matching_source || liveData?.baseline_source || 'Verified DB Baseline'}
            </span>
          </div>

          <div className="rounded-full border border-sky-500 bg-sky-100 px-3.5 py-1 text-md font-semibold tracking-wide text-sky-900">
            {averageScore} · Best: <span className="font-bold">{bestZoneName}</span>
          </div>
        </div>

        {/* Mini Comparison Summary Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-line text-md font-semibold uppercase tracking-wider text-ink">
                <th className="w-[28%] pb-3 pr-4">Zone</th>
                <th className="w-[22%] pb-3 px-3">Rainfall</th>
                <th className="w-[18%] pb-3 px-3">Soil / pH</th>
                <th className="w-[20%] pb-3 px-3">Soil Texture (WRB)</th>
                <th className="w-[12%] pb-3 pl-3 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {zonesToDisplay.map((zone: any, idx: number) => {
                const isSelected = selectedZoneIdx === idx;
                const zScore = Number(zone.score) || 60;
                const isHigh = zScore >= 80;
                const isMod = zScore >= 60 && zScore < 80;

                const rawPh = zone.table?.find((r: any) => r.parameter?.includes('Soil pH'))?.zoneValue || zone.soil_ph;
                const formattedPh = formatExactPh(rawPh);

                return (
                  <tr
                    key={zone.code || idx}
                    onClick={() => handleSelectZone(idx)}
                    className={cn(
                      'transition-colors cursor-pointer',
                      isSelected ? 'bg-emerald-50/80 font-bold' : 'hover:bg-cream/40'
                    )}
                  >
                    <td className="truncate py-3.5 pr-4 text-md font-medium text-ink">
                      <span className="font-bold text-label">{zone.code}</span> {zone.name}
                    </td>
                    <td className="truncate py-3.5 px-3 text-md text-muted">
                      {zone.table?.find((r: any) => r.parameter?.includes('Rainfall'))?.zoneValue ||
                        zone.rainfall ||
                        'NA'}
                    </td>
                    <td className="truncate py-3.5 px-3 text-md text-muted">
                      {formattedPh}
                    </td>
                    <td className="truncate py-3.5 px-3 text-md text-muted">
                      {zone.table?.find((r: any) => r.parameter?.includes('Soil Type'))?.zoneValue ||
                        zone.soil_type ||
                        'NA'}
                    </td>
                    <td className="py-3.5 pl-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-line sm:block">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isHigh ? 'bg-emerald-600' : isMod ? 'bg-amber-500' : 'bg-rose-500'
                            )}
                            style={{ width: `${zone.score}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-md font-bold',
                            isHigh ? 'text-emerald-700' : isMod ? 'text-amber-700' : 'text-rose-700'
                          )}
                        >
                          {zone.score}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. ZONE-WISE DETAILED CARDS */}
      <div className="flex flex-col gap-6">
        {zonesToDisplay.map((zone: any, idx: number) => {
          const isHigh = zone.score >= 80;
          const isModerate = zone.score >= 60 && zone.score < 80;
          const statusBadgeText = isHigh ? 'Optimal' : isModerate ? 'Moderate' : 'Poor';
          const isSelected = selectedZoneIdx === idx;

          return (
            <div
              key={zone.code || idx}
              onClick={() => handleSelectZone(idx)}
              className={cn(
                'overflow-hidden rounded-2xl border bg-paper shadow-sm transition cursor-pointer',
                isSelected ? 'border-brand ring-1 ring-brand/30' : 'border-line'
              )}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-cream/30 px-6 py-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-md font-bold tracking-wider text-label">{zone.code} ·</span>
                  <span className="text-lg font-semibold text-ink">{zone.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {isSelected && (
                    <span className="text-[11px] uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded font-bold">
                      Selected Zone
                    </span>
                  )}
                  <span
                    className={cn(
                      'rounded-full px-3.5 py-1 text-sm font-bold uppercase tracking-wider',
                      isHigh
                        ? 'bg-[#E4F5EA] text-[#196239] border border-emerald-300'
                        : isModerate
                        ? 'bg-[#FEF3C7] text-[#92400E] border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    )}
                  >
                    {zone.score}% — {statusBadgeText}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {zone.summary && zone.summary !== 'NA' && (
                  <p className="mb-4 text-md leading-relaxed text-ink/90">{zone.summary}</p>
                )}

                {zone.table && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-line">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-line bg-cream/50 text-left text-sm font-bold uppercase tracking-wider text-label">
                          <th className="w-[30%] px-4 py-2.5">PARAMETER</th>
                          <th className="w-[25%] px-4 py-2.5">ZONE VALUE</th>
                          <th className="w-[25%] px-4 py-2.5">REQUIREMENT</th>
                          <th className="w-[20%] px-4 py-2.5">COMPATIBILITY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {zone.table.map((row: any, rIdx: number) => {
                          const isPh = row.parameter?.toLowerCase().includes('ph');
                          const paramLabel = isPh ? 'Soil pH' : row.parameter;
                          const displayVal = isPh ? formatExactPh(row.zoneValue) : row.zoneValue;

                          return (
                            <tr key={row.parameter || rIdx} className="hover:bg-cream/20">
                              <td className="px-4 py-2.5 text-md font-medium text-ink">{paramLabel}</td>
                              <td className="px-4 py-2.5 text-md text-ink">{displayVal}</td>
                              <td className="px-4 py-2.5 text-md text-muted">{row.requirement}</td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={cn(
                                    'inline-block rounded-md px-2.5 py-1 uppercase text-sm whitespace-nowrap',
                                    getBadgeStyle(row.compatibility)
                                  )}
                                >
                                  {row.compatibility}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {zone.callouts && zone.callouts.length > 0 && zone.callouts[0].text !== 'NA' && (
                  <div
                    className={cn(
                      'rounded-xl p-4 text-md border shadow-2xs',
                      zone.callouts[0].tone === 'opportunity' || isHigh
                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                        : 'border-amber-300 bg-amber-50/70 text-amber-950'
                    )}
                  >
                    <div className="font-semibold text-md mb-1.5 flex items-center gap-2">
                      <span>{zone.callouts[0].label}</span>
                    </div>

                    {Array.isArray(zone.callouts[0].items) && zone.callouts[0].items.length > 1 ? (
                      <ul className="mt-2 space-y-1.5 pl-5 list-disc text-sm text-ink/90 leading-relaxed">
                        {zone.callouts[0].items.map((mitigationItem: string, mIdx: number) => (
                          <li key={mIdx} className="pl-1">
                            {mitigationItem}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-1 text-sm leading-relaxed text-ink/90">
                        {typeof zone.callouts[0].text === 'string'
                          ? zone.callouts[0].text
                          : zone.callouts[0].items?.[0] || 'Proceed with standard agronomic practices.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}