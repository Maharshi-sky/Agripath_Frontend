import { useMemo } from 'react';
import { cn } from '../lib/cn';
import { COUNTRIES } from '../data/countries';
import { computeZoneMatches } from '../logic/zoneMatch';

function regionFor(country: string): string {
  return COUNTRIES.find((c) => c.n === country)?.r ?? '';
}

function priority(score: number): { label: string; className: string } {
  if (score >= 70) return { label: 'Tier 1', className: 'bg-brand-light text-brand-dark' };
  if (score >= 50) return { label: 'Tier 2', className: 'bg-line text-muted' };
  return { label: 'Watchlist', className: 'border border-line text-label' };
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand" style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold text-ink">{score}%</span>
    </div>
  );
}

export interface ZoneMatchContentProps {
  countries: string[];
  techType: string;
}

export default function ZoneMatchContent({ countries, techType }: ZoneMatchContentProps) {
  const matches = useMemo(() => computeZoneMatches(countries, techType), [countries, techType]);
  const withData = matches.filter((m) => m.hasData);

  const allZoneRows = useMemo(
    () =>
      withData
        .flatMap((m) => m.zones.map((z) => ({ country: m.country, ...z })))
        .sort((a, b) => b.score - a.score),
    [withData],
  );

  if (withData.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper px-6 py-10 text-center text-sm text-muted">
        No zone data is available yet for your selected markets.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        {withData.map((m) => {
          const bestZone = m.bestZone;
          if (!bestZone) return null;
          const best = m.zones.find((z) => z.zone.id === bestZone.id) ?? m.zones[0];
          return (
            <div key={m.country} className="rounded-xl border border-line bg-paper p-6">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-label">
                    {regionFor(m.country)} · {m.country}
                  </div>
                  <div className="text-lg font-bold text-ink">{best.zone.name}</div>
                </div>
                <ScoreBar score={best.score} />
              </div>
              <p className="mb-4 text-sm leading-relaxed text-muted">{best.zone.notes}</p>

              <div className="flex flex-col gap-3">
                <div className="border-l-4 border-brand bg-brand-light px-4 py-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink">
                    Agronomic Fit
                  </div>
                  <p className="text-sm text-ink">
                    Key crops: {best.zone.crops}. {best.zone.water}
                  </p>
                </div>
                {m.regSnapshot && (
                  <div className="border-l-4 border-[#c9922f] bg-[#fbf3e3] px-4 py-3">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink">
                      Regulatory Pathway
                    </div>
                    <p className="text-sm text-ink">{m.regSnapshot}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allZoneRows.length > 0 && (
        <div className="mt-10">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-label">
            Zone Compatibility Summary
          </div>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-cream text-left text-[11px] uppercase tracking-[0.08em] text-label">
                  <th className="px-5 py-3 font-semibold">Zone</th>
                  <th className="px-5 py-3 font-semibold">Match score</th>
                  <th className="px-5 py-3 font-semibold">Key crops</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {allZoneRows.map((row) => {
                  const p = priority(row.score);
                  return (
                    <tr key={row.zone.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 font-medium text-ink">{row.zone.name}</td>
                      <td className="px-5 py-3">
                        <ScoreBar score={row.score} />
                      </td>
                      <td className="px-5 py-3 text-muted">{row.zone.crops}</td>
                      <td className="px-5 py-3">
                        <span className={cn('rounded-sm px-3 py-1 text-[11px] font-semibold uppercase', p.className)}>
                          {p.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
