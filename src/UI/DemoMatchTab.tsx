import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';
import { agriApi } from '../services/agriApi';
import { useWizard } from '../state/wizardStore';
import { DEMO_MATCH_ZONES } from '../data/demoMatchReport';
import MatchAnalysisLoading from './MatchAnalysisLoading';

function getBadgeStyle(compat: string) {
  const upper = (compat || '').toUpperCase();

  if (
    upper.includes('CAUTION') || 
    upper.includes('RISK') || 
    upper.includes('STRESS') ||
    upper.includes('SUB-OPTIMAL') || 
    upper.includes('LOW RAIN') ||
    upper.includes('DEFICIT') ||
    upper.includes('VARIATION') ||
    upper.includes('EXCESS')
  ) {
    return 'bg-[#FEF3C7] text-[#92400E] border border-amber-300 font-medium';
  }

  if (upper.includes('OPTIMAL') || upper.includes('EXCELLENT')) {
    return 'bg-[#E4F5EA] text-[#196239] border border-emerald-300 font-medium';
  }

  return 'bg-gray-100 text-gray-700 border border-gray-200 font-medium';
}

export default function DemoMatchTab() {
  const { state } = useWizard();
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const targetCountry = state.countries?.[0] || 'Ethiopia';
  const targetCategory = state.tech?.type || 'Seeds & Varieties';
  const targetTech = state.tech?.varietyName || state.tech?.name || 'Selected Variety';
  const targetOriginRegion = state.tech?.originRegion || '';

  useEffect(() => {
    let isSubscribed = true;

    async function fetchLiveMatch() {
      setLoading(true);
      try {
        const res = await agriApi.getMatchScore({
          category: targetCategory,
          technology: targetTech,
          country: targetCountry,
          recommendedStates: targetOriginRegion,
        });
        if (isSubscribed && res?.success) {
          setLiveData(res);
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
  }, [targetCountry, targetCategory, targetTech, targetOriginRegion]);

  if (loading) {
    return (
      <MatchAnalysisLoading
        technologyName={targetTech}
        countryName={targetCountry}
        category="seeds"
      />
    );
  }

  const zonesToDisplay = liveData?.zones || DEMO_MATCH_ZONES;
  const overview = liveData?.executive_overview;

  const totalZones = zonesToDisplay.length;
  const averageScore =
    overview?.average_score ||
    `${Math.round(zonesToDisplay.reduce((acc: number, z: any) => acc + (z.score || 0), 0) / (totalZones || 1))}% avg`;
  const bestZoneName = overview?.best_zone || zonesToDisplay[0]?.name || 'N/A';

  return (
    <div className="space-y-6">
      {/* 1. TOP EXECUTIVE SUMMARY */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-ink">
              {targetCountry} — {totalZones} Zones Analysed
            </h2>
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
              {zonesToDisplay.map((zone: any) => (
                <tr key={zone.code} className="transition-colors hover:bg-cream/40">
                  <td className="truncate py-3.5 pr-4 text-md font-medium text-ink">
                    <span className="font-bold text-label">{zone.code}</span> {zone.name}
                  </td>
                  <td className="truncate py-3.5 px-3 text-md text-muted">
                    {zone.table?.find((r: any) => r.parameter.includes('Rainfall'))?.zoneValue || zone.rainfall || 'NA'}
                  </td>
                  <td className="truncate py-3.5 px-3 text-md text-muted">
                    {zone.table?.find((r: any) => r.parameter.includes('Soil pH'))?.zoneValue || zone.soil_ph || 'NA'}
                  </td>
                  <td className="truncate py-3.5 px-3 text-md text-muted">
                    {zone.table?.find((r: any) => r.parameter.includes('Soil Type'))?.zoneValue || zone.soil_type || 'NA'}
                  </td>
                  <td className="py-3.5 pl-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-line sm:block">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            zone.score >= 80 ? 'bg-emerald-600' : zone.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          )}
                          style={{ width: `${zone.score}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-md font-bold',
                          zone.score >= 80 ? 'text-emerald-700' : zone.score >= 60 ? 'text-amber-700' : 'text-rose-700'
                        )}
                      >
                        {zone.score}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. ZONE-WISE DETAILED CARDS */}
      <div className="flex flex-col gap-6">
        {zonesToDisplay.map((zone: any) => {
          const isHigh = zone.score >= 80;
          const isModerate = zone.score >= 60 && zone.score < 80;
          const statusBadgeText = isHigh ? 'Excellent' : isModerate ? 'Moderate Fit' : 'Caution Required';

          return (
            <div key={zone.code} className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-cream/30 px-6 py-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-md font-bold tracking-wider text-label">{zone.code} ·</span>
                  <span className="text-lg font-semibold text-ink">{zone.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-3.5 py-1 text-sm font-bold uppercase tracking-wider',
                      isHigh
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isModerate
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
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
                        {zone.table.map((row: any) => (
                          <tr key={row.parameter} className="hover:bg-cream/20">
                            <td className="px-4 py-2.5 text-md font-medium text-ink">{row.parameter}</td>
                            <td className="px-4 py-2.5 text-md text-ink">{row.zoneValue}</td>
                            <td className="px-4 py-2.5 text-md text-muted">{row.requirement}</td>
                            <td className="px-4 py-2.5">
                              <span
                                className={cn(
                                  'inline-block rounded-md px-2.5 py-1 text-sm whitespace-nowrap',
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

                {zone.callouts && zone.callouts.length > 0 && zone.callouts[0].text !== 'NA' && (
                  <div
                    className={cn(
                      'rounded-xl p-4 text-md border shadow-2xs',
                      zone.callouts[0].tone === 'opportunity'
                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                        : 'border-emerald-300 bg-amber-50/70 text-emerald-950'
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