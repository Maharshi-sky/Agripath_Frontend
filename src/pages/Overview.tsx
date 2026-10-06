import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DemoMatchTab from '../UI/DemoMatchTab';
import DemoRegulatoryTab from '../UI/DemoRegulatoryTab';
import GtmPlanContent from '../UI/GtmPlanContent';
import { cn } from '../lib/cn';
import { STEPS } from '../state/steps';
import { useWizard } from '../state/wizardStore';

type Tab = 'match' | 'reg' | 'gtm';

const TABS: { id: Tab; label: string }[] = [
  { id: 'match', label: 'Agroclimatic Match' },
  { id: 'reg', label: 'Regulatory Pathway' },
  { id: 'gtm', label: '90-Day Plan' },
];

export default function Overview() {
  const navigate = useNavigate();
  const { loadExample, startOver } = useWizard();
  const [tab, setTab] = useState<Tab>('match');

  const handleCustomise = () => {
    loadExample('nano_urea');
    navigate(`/${STEPS[0].path}`);
  };

  const handleStartOver = () => {
    startOver();
    navigate(`/${STEPS[0].path}`);
  };

  return (
    <div className="mx-auto px-14 py-10">
      <div className="overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="flex items-start justify-between gap-4 bg-[linear-gradient(180deg,#0B0F0B_0%,#0A4323_100%)] px-8 py-6">
          <div className="min-w-0">
            <h1 className="mb-1 text-2xl font-semibold leading-tight text-white">
              Sample Match Report Zone Data + Regulatory Pathway
            </h1>
            <p className="text-sm text-white/70">
              Real output across all 5 workflow steps. Browse the tabs below, then run your own analysis.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleCustomise}
              className="flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Customise
              <ArrowUpRight size={15} />
            </button>
            <button
              type="button"
              onClick={handleStartOver}
              className="flex items-center gap-2 rounded-sm bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-white/90"
            >
              Generate New Report
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-line border-b border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-8 py-5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">Technology</div>
            <p className="text-sm font-medium text-ink">IFFCO Nano Urea Liquid Foliar</p>
          </div>
          <div className="px-8 py-5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">Country</div>
            <p className="text-sm font-medium text-ink">🇪🇹 Ethiopia</p>
          </div>
          <div className="px-8 py-5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">
              Zones Analysed
            </div>
            <p className="text-sm font-medium text-ink">5 zones</p>
          </div>
        </div>

        <div className="flex gap-6 border-b border-line px-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'border-b-3 py-3 text-sm transition',
                tab === t.id
                  ? 'border-brand font-semibold text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-8 py-8">
          {tab === 'match' && <DemoMatchTab />}
          {tab === 'reg' && <DemoRegulatoryTab />}
          {tab === 'gtm' && <GtmPlanContent />}
        </div>
      </div>

      <div className="mt-8 flex justify-start">
        <button
          type="button"
          onClick={handleStartOver}
          className="flex items-center gap-2 rounded-lg bg-brand pl-6 pr-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Start your own analysis
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
