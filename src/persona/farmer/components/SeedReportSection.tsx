// src/persona/farmer/components/SeedReportSection.tsx
import { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../../lib/cn';

function getBadgeStyle(compat: string) {
  const clean = (compat || '').trim();
  const upper = clean.toUpperCase();

  if (!clean || upper === 'NA' || upper === 'N/A') {
    return 'bg-gray-100 text-gray-700 border border-gray-200 font-medium';
  }

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

interface SeedReportSectionProps {
  matchData: any;
  country: string;
  onNavigateStep?: (step: number) => void;
}

export default function SeedReportSection({
  matchData,
  country,
}: SeedReportSectionProps) {
  const targetCountry = (country || matchData?.countryName || '').trim().toLowerCase();
  const techName = (matchData?.activeProduct?.name || matchData?.targetTech || matchData?.activeProduct?.varietyName || 'Selected Variety').trim().toLowerCase();

  const normKey = `${targetCountry}__${techName}`;
  const sessionKey = `agri_seed_match_${normKey.replace(/[^a-z0-9]/g, '_')}`;

  const sessionCached = useMemo(() => {
    try {
      const stored = 
        sessionStorage.getItem(sessionKey) || 
        sessionStorage.getItem(`agri_seed_farmer_match_${targetCountry}`) || 
        sessionStorage.getItem(`agri_seed_${normKey}`) || 
        sessionStorage.getItem(`agri_seed_match_${targetCountry}`);
      if (stored) return JSON.parse(stored);

      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith('agri_seed_match_') || k.startsWith('agri_seed_active_') || k.startsWith('agri_seed_farmer_'))) {
          const val = sessionStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            if (parsed?.liveData?.zones || parsed?.res?.zones || parsed?.zones) {
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

  const rawZones: any[] = useMemo(() => {
    if (sessionCached?.liveData?.zones && Array.isArray(sessionCached.liveData.zones)) {
      return sessionCached.liveData.zones;
    }
    if (sessionCached?.res?.zones && Array.isArray(sessionCached.res.zones)) {
      return sessionCached.res.zones;
    }
    if (sessionCached?.zones && Array.isArray(sessionCached.zones)) {
      return sessionCached.zones;
    }
    if (Array.isArray(matchData?.allZonesData) && matchData.allZonesData.length > 0) {
      return matchData.allZonesData;
    }
    if (Array.isArray(matchData?.allProducts) && matchData.allProducts.length > 0) {
      return matchData.allProducts;
    }
    return [];
  }, [sessionCached, matchData]);

  const resolvedInitialIndex = useMemo(() => {
    if (typeof sessionCached?.selectedZoneIdx === 'number') return sessionCached.selectedZoneIdx;
    if (typeof sessionCached?.selectedIdx === 'number') return sessionCached.selectedIdx;
    if (typeof matchData?.selectedZoneIndex === 'number') return matchData.selectedZoneIndex;
    return 0;
  }, [sessionCached, matchData]);

  const [activeIdx, setActiveIdx] = useState<number>(resolvedInitialIndex);

  const currentZone = rawZones[activeIdx] || matchData?.selectedZoneData || rawZones[0];

  const totalZones = rawZones.length;
  const overview =
    sessionCached?.liveData?.executive_overview ||
    sessionCached?.res?.executive_overview ||
    matchData?.executiveOverview;

  const avgScore =
    overview?.average_score ||
    `${Math.round(rawZones.reduce((acc, z) => acc + (Number(z.score) || 0), 0) / (totalZones || 1))}% avg`;

  const bestZoneName = overview?.best_zone || rawZones[0]?.name || 'Target Agricultural Zone';

  const zoneScore = Number(currentZone?.score || 75);
  const isHigh = zoneScore >= 80;
  const isMod = zoneScore >= 60 && zoneScore < 80;
  const statusLabel = isHigh ? 'OPTIMAL' : isMod ? 'MODERATE' : 'POOR';

  const paramRows: any[] = useMemo(() => {
    if (Array.isArray(currentZone?.table) && currentZone.table.length > 0) {
      return currentZone.table.map((row: any) => {
        const isPh = row.parameter?.toLowerCase().includes('ph');
        return {
          ...row,
          parameter: isPh ? 'Soil pH' : row.parameter,
          zoneValue: isPh ? formatExactPh(row.zoneValue) : row.zoneValue,
        };
      });
    }
    return [];
  }, [currentZone]);

  const callouts = currentZone?.callouts || [];

  const handleRowClick = (idx: number) => {
    setActiveIdx(idx);
    try {
      if (sessionCached) {
        const updated = { ...sessionCached, selectedZoneIdx: idx, selectedIdx: idx };
        sessionStorage.setItem(sessionKey, JSON.stringify(updated));
        sessionStorage.setItem(`agri_seed_${normKey}`, JSON.stringify(updated));
      }
    } catch {
      // ignore storage error
    }
  };

  return (
    <section className="space-y-6 print:break-inside-avoid">
      {/* ── 1. Top Multi-Zone Summary Table ── */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-bold text-ink">
              {country} — {totalZones} Agricultural Belts Analysed
            </h2>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800">
              <Info className="h-3 w-3" />
              {sessionCached?.liveData?.db_meta?.matching_source ||
                sessionCached?.res?.db_meta?.matching_source ||
                matchData?.baselineSource ||
                'Certified Varietal Trial Data'}
            </span>
          </div>

          <div className="rounded-full border border-sky-500 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-900">
            {avgScore} · Best Sowing Belt: <span className="font-extrabold">{bestZoneName}</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed text-left text-xs">
            <thead>
              <tr className="border-b border-line text-xs font-bold uppercase tracking-wider text-muted">
                <th className="w-[30%] pb-3 pr-4">FARM BELT</th>
                <th className="w-[20%] pb-3 px-3">SEASONAL RAIN</th>
                <th className="w-[15%] pb-3 px-3">SOIL PH</th>
                <th className="w-[23%] pb-3 px-3">SOIL TEXTURE</th>
                <th className="w-[12%] pb-3 pl-3 text-right">SUITABILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {rawZones.map((zone: any, idx: number) => {
                const isSelected = activeIdx === idx;
                const zScore = Number(zone.score) || 60;
                const isZHigh = zScore >= 80;
                const isZMod = zScore >= 60 && zScore < 80;

                const scoreColor = isZHigh ? 'text-emerald-700' : isZMod ? 'text-amber-700' : 'text-rose-700';
                const barColor = isZHigh ? 'bg-emerald-600' : isZMod ? 'bg-amber-500' : 'bg-rose-500';

                const rawPh = zone.table?.find((r: any) => r.parameter?.includes('Soil pH'))?.zoneValue || zone.soil_ph;
                const formattedPh = formatExactPh(rawPh);

                return (
                  <tr
                    key={zone.code || idx}
                    onClick={() => handleRowClick(idx)}
                    className={cn(
                      'transition-colors cursor-pointer',
                      isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-cream/40'
                    )}
                  >
                    <td className="truncate py-3.5 pr-4 text-xs font-medium text-ink">
                      <span className="font-bold text-label mr-1.5">{zone.code || `ZONE-${idx + 1}`}</span> {zone.name}
                    </td>
                    <td className="truncate py-3.5 px-3 text-xs text-muted">
                      {zone.table?.find((r: any) => r.parameter?.includes('Rainfall'))?.zoneValue || zone.rainfall || 'NA'}
                    </td>
                    <td className="truncate py-3.5 px-3 text-xs text-muted">
                      {formattedPh}
                    </td>
                    <td className="truncate py-3.5 px-3 text-xs text-muted">
                      {zone.table?.find((r: any) => r.parameter?.includes('Soil Type'))?.zoneValue || zone.soil_type || 'NA'}
                    </td>
                    <td className="py-3.5 pl-3 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-line sm:block">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', barColor)}
                            style={{ width: `${zScore}%` }}
                          />
                        </div>
                        <span className={cn('text-xs font-bold min-w-8 text-right', scoreColor)}>
                          {zScore}%
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

      {/* ── 2. Farmer Selected Zone Detailed Card ── */}
      <div className="overflow-hidden rounded-2xl border-2 border-emerald-600/70 bg-paper shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-cream/30 px-6 py-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-bold tracking-wider text-label">{currentZone?.code || 'ZONE-1'} ·</span>
            <span className="text-base font-bold text-ink">{currentZone?.name || 'Selected Agroclimatic Belt'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-md border border-emerald-400 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              EVALUATED BELT
            </span>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
                isHigh
                  ? 'bg-[#E4F5EA] text-[#196239] border border-emerald-300'
                  : isMod
                  ? 'bg-[#FEF3C7] text-[#92400E] border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              )}
            >
              {zoneScore}% — {statusLabel}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {currentZone?.summary && (
            <p className="text-xs leading-relaxed text-ink/90">{currentZone.summary}</p>
          )}

          {paramRows.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-cream/50 text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="w-[30%] px-4 py-3">AGRONOMIC PARAMETER</th>
                    <th className="w-[25%] px-4 py-3">FIELD VALUE</th>
                    <th className="w-[25%] px-4 py-3">VARIETY REQUIREMENT</th>
                    <th className="w-[20%] px-4 py-3 text-right">COMPATIBILITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {paramRows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-cream/20">
                      <td className="px-4 py-3 font-semibold text-ink">{row.parameter}</td>
                      <td className="px-4 py-3 text-ink">{row.zoneValue}</td>
                      <td className="px-4 py-3 text-muted">{row.requirement}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            'inline-block rounded-md px-2.5 py-0.5 uppercase text-[11px] font-bold tracking-wider whitespace-nowrap',
                            getBadgeStyle(row.compatibility)
                          )}
                        >
                          {row.compatibility}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {callouts.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-4 space-y-2">
              <span className="font-bold text-amber-950 text-xs block">
                {callouts[0].label || 'On-Farm Sowing & Agronomic Mitigation'}
              </span>
              {Array.isArray(callouts[0].items) && callouts[0].items.length > 0 ? (
                <ul className="space-y-1.5 pl-5 list-disc text-xs text-amber-950/90 leading-relaxed">
                  {callouts[0].items.map((item: string, mIdx: number) => (
                    <li key={mIdx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-950">
                  {typeof callouts[0].text === 'string'
                    ? callouts[0].text
                    : 'Follow standard seed drill spacing and certified nursery/field preparation protocols.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}