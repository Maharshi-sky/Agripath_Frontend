import { ArrowLeft, ArrowUpRight, Check, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';
import { FieldInput } from '../UI/FormControls';
import { STEPS } from '../state/steps';
import { useCountryFilter, REGIONS } from '../state/useCountryFilter';
import { MAX_COUNTRIES, useWizard } from '../state/wizardStore';

export default function Step2TargetMarkets({ onToast }: { onToast: (message: string) => void }) {
  const navigate = useNavigate();
  const { state, toggleCountry, nextFromStep2 } = useWizard();
  const { query, setQuery, region, setRegion, filtered } = useCountryFilter();

  const handleSelect = (country: string) => {
    const result = toggleCountry(country);
    if (!result.ok && result.error) onToast(result.error);
  };

  const handleBack = () => navigate(`/${STEPS[0].path}`);

  const handleContinue = () => {
    const result = nextFromStep2();
    if (!result.ok && result.error) {
      onToast(result.error);
      return;
    }
    navigate(`/${STEPS[2].path}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-14 py-10">
      <h1 className="mb-3 text-[2.25rem] font-semibold leading-tight tracking-tight text-ink">
        Where are you planning to deploy?
      </h1>
      <p className="mb-9 text-[15px] leading-relaxed text-muted">
        
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[280px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-label" />
          <FieldInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter countries"
            className="pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-[#EDF0EB] px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-label">
            {state.countries.length} {state.countries.length === 1 ? 'Market' : 'Markets'} Selected
          </span>
          {state.countries.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 rounded-sm bg-white px-3 py-1 text-xs font-medium text-ink"
            >
              {c}
              <button
                type="button"
                onClick={() => handleSelect(c)}
                className="text-label hover:text-ink"
                aria-label={`Remove ${c}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRegion('all')}
          className={cn(
            'rounded-lg border px-4 py-1.5 text-[13px] font-medium transition',
            region === 'all'
              ? 'border-ink bg-[#196239] text-white'
              : 'border-line bg-paper text-ink hover:border-brand hover:text-brand',
          )}
        >
          All Regions
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            className={cn(
              'rounded-lg border px-4 py-1.5 text-[13px] font-medium transition',
              region === r
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-paper text-ink hover:border-brand hover:text-brand',
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="max-h-[280px] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((c) => {
            const active = state.countries.includes(c.n);
            return (
              <button
                key={c.n}
                type="button"
                onClick={() => handleSelect(c.n)}
                className={cn(
                  'relative rounded-xl border px-4 py-3.5 text-left transition',
                  active ? 'border-brand bg-brand-light' : 'border-line bg-paper hover:border-brand/60',
                )}
              >
                {active && (
                  <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
                <div className="mb-1 text-lg leading-none">{c.f}</div>
                <div className="text-sm font-semibold text-ink">{c.n}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-ink hover:text-brand"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 rounded-sm bg-brand pl-6 pr-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Continue to Match Analysis
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
