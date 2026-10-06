import { X } from 'lucide-react';
import { useMemo } from 'react';
import { REG_FULL } from '../data/regFull';
import { pad2 } from '../state/steps';

function parseSteps(steps?: string): string[] {
  if (!steps) return [];
  return steps
    .split('→')
    .map((s) => s.trim().replace(/^\d+\)\s*/, ''))
    .filter(Boolean);
}

function parseAvoid(avoid?: string): string[] {
  if (!avoid) return [];
  return avoid
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface RegulatoryPathwayContentProps {
  country: string | null;
  techType: string;
}

export default function RegulatoryPathwayContent({ country, techType }: RegulatoryPathwayContentProps) {
  const entry = country ? REG_FULL[country]?.[techType] : undefined;
  const steps = useMemo(() => parseSteps(entry?.steps), [entry?.steps]);
  const avoidItems = useMemo(() => parseAvoid(entry?.avoid), [entry?.avoid]);

  if (!entry) {
    return (
      <div className="rounded-xl border border-line bg-paper px-6 py-10 text-center text-sm text-muted">
        {country
          ? `No detailed regulatory pathway data is available yet for ${country} (${techType}).`
          : 'No target market selected.'}
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-1 divide-y divide-line rounded-xl border border-line bg-paper sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-6">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">
            Lead Agencies
          </div>
          <p className="text-sm leading-relaxed text-ink">{entry.agency}</p>
        </div>
        <div className="p-6">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">
            Typical Timeline
          </div>
          <p className="text-sm leading-relaxed text-ink">{entry.timeline}</p>
        </div>
        <div className="p-6">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">
            Registration Fees
          </div>
          <p className="text-sm leading-relaxed text-ink">{entry.fees}</p>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-label">
            Registration Steps
          </div>
          <div className="flex flex-col">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-brand-light font-mono text-[11px] font-bold text-brand-dark">
                    {pad2(i + 1)}
                  </span>
                  {i < steps.length - 1 && <span className="my-1 w-px flex-1 bg-line" />}
                </div>
                <div className="mb-3 flex-1 rounded-xl border border-line bg-paper px-5 py-4">
                  <p className="text-sm leading-relaxed text-ink">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.fasttrack && (
        <div className="mb-6 rounded-lg border-l-4 border-brand bg-brand-light px-4 py-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-dark">
            Fast-Track Option
          </div>
          <p className="text-sm leading-relaxed text-ink">{entry.fasttrack}</p>
        </div>
      )}

      {avoidItems.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-label">
            What Not To Do
          </div>
          <div className="flex flex-col gap-2">
            {avoidItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-l-4 border-[#c0392b] bg-[#fdf1ef] px-4 py-3 text-sm text-ink"
              >
                <X size={14} strokeWidth={3} className="mt-0.5 shrink-0 text-[#c0392b]" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
