import { ArrowLeft, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/cn';
import { COUNTRIES } from '../data/countries';
import { useSavedReports } from '../state/savedReportsStore';
import { useWizard } from '../state/wizardStore';

// Match Views
import MachineryMatchEngineView from '../components/MachineryMatchEngineView';
import CropProtectionMatchEngineView from '../components/CropProtectionMatchEngineView';
import FertilizerMatchEngineView from '../components/FertilizerMatchEngineView';
import BioInputsMatchEngineView from '../components/BioInputsMatchEngineView';
import DemoMatchTab from '../UI/DemoMatchTab';

// Regulatory Views
import MachineryRegulatoryView from '../components/MachineryRegulatoryView';
import CropProtectionRegulatoryView from '../components/CropProtectionRegulatoryView';
import FertilizerRegulatoryView from '../components/FertilizerRegulatoryView';
import BioRegulatoryView from '../components/BioRegulatoryView';
import SeedRegulatoryView from '../components/SeedRegulatoryView';

// GTM Views
import MachineryGtmView from '../components/MachineryGtmView';
import CropProtectionGtmView from '../components/CropProtectionGtmView';
import FertilizerGtmView from '../components/FertilizerGtmView';
import BioInputsGtmView from '../components/BioInputsGtmView';
import SeedGtmView from '../components/SeedGtmView';

function flagFor(country: string): string {
  return COUNTRIES.find((c) => c.n === country)?.f ?? '';
}

type Tab = 'match' | 'reg' | 'gtm';

const TABS: { id: Tab; label: string }[] = [
  { id: 'match', label: 'Agroclimatic Match' },
  { id: 'reg', label: 'Regulatory Pathway' },
  { id: 'gtm', label: '90-Day Plan' },
];

export default function SavedReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { reports, removeReport } = useSavedReports();
  const { loadSavedReport } = useWizard();
  const [tab, setTab] = useState<Tab>('match');

  const report = reports.find((r) => r.id === reportId);

  // Sync saved report state with wizard context when viewing report
  useEffect(() => {
    if (report && loadSavedReport) {
      loadSavedReport({
        tech: report.tech,
        techCategory: report.techCategory || report.techType || 'seeds',
        countries: report.countries,
      });
    }
  }, [report, loadSavedReport]);

  if (!report) {
    return (
      <div className="mx-auto max-w-[1400px] px-14 py-16">
        <p className="mb-4 text-sm text-muted">This report no longer exists.</p>
        <button
          type="button"
          onClick={() => navigate('/saved-reports')}
          className="flex items-center gap-2 text-sm font-medium text-ink hover:text-brand"
        >
          <ArrowLeft size={16} />
          Back to Saved Reports
        </button>
      </div>
    );
  }

  const primaryCountry = report.countries[0] ?? 'Target Country';
  const currentTech = (report.tech || {}) as Record<string, any>;
  const rawCat = String(
    report.techCategory ||
    currentTech.machineryCategory ||
    currentTech.protectionCategory ||
    currentTech.fertilizerCategory ||
    currentTech.chemicalType ||
    currentTech.inputCategory ||
    currentTech.productCategory ||
    currentTech.category ||
    currentTech.productType ||
    ''
  ).toLowerCase().trim();

  // Category Detection
  const isMachinery =
    rawCat.includes('machin') ||
    rawCat.includes('equip') ||
    Boolean(currentTech.machineryCategory) ||
    Boolean(currentTech.equipmentName) ||
    Boolean(currentTech.productType);

  const isBio =
    !isMachinery && (
      rawCat.includes('bio') ||
      Boolean(currentTech.inputCategory) ||
      Boolean(currentTech.brandProductName && rawCat.includes('stimulant'))
    );

  const isCropProtection =
    !isMachinery && !isBio && (
      rawCat.includes('protect') ||
      rawCat.includes('pest') ||
      rawCat.includes('fungic') ||
      rawCat.includes('insectic') ||
      rawCat.includes('herbic') ||
      rawCat.includes('agrochem') ||
      Boolean(currentTech.protectionCategory) ||
      Boolean(currentTech.chemicalType)
    );

  const isFertilizer =
    !isMachinery && !isBio && !isCropProtection && (
      rawCat.includes('fert') ||
      rawCat.includes('nutrient') ||
      Boolean(currentTech.fertilizerCategory) ||
      Boolean(currentTech.npkGrade)
    );

  const handleDelete = () => {
    removeReport(report.id);
    navigate('/saved-reports');
  };

  const techDisplayName =
    currentTech.brandProductName ||
    currentTech.varietyName ||
    currentTech.equipmentName ||
    currentTech.name ||
    'Agricultural Technology';

  return (
    <div className="mx-auto px-14 py-10">
      <div className="overflow-hidden rounded-2xl border border-line bg-paper">
        {/* Banner */}
        <div className="flex items-start justify-between gap-4 bg-[linear-gradient(180deg,#0B0F0B_0%,#0A4323_100%)] px-8 py-6">
          <div className="min-w-0">
            <h1 className="mb-1 text-2xl font-semibold leading-tight text-white">
              {techDisplayName}
            </h1>
            <p className="text-sm text-white/70">
              Saved {new Date(report.savedAt).toLocaleDateString()}. Full match, regulatory and go-to-market dossier.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/saved-reports')}
              className="flex items-center gap-2 rounded-sm border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ArrowLeft size={15} />
              Back to Saved Reports
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-sm bg-white px-4 py-2 text-sm font-semibold text-[#c0392b] transition hover:bg-white/90"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 divide-y divide-line border-b border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-8 py-5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">Technology</div>
            <p className="text-sm font-medium text-ink">{techDisplayName}</p>
          </div>
          <div className="px-8 py-5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">Country</div>
            <p className="text-sm font-medium text-ink">
              {primaryCountry ? `${flagFor(primaryCountry)} ${primaryCountry}` : 'No market selected'}
            </p>
          </div>
          <div className="px-8 py-5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-label">Status</div>
            <p className="text-sm font-semibold text-emerald-700">Ready for Commercialization</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-6 border-b border-line px-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'border-b-3 py-3 text-sm font-medium transition',
                tab === t.id
                  ? 'border-brand font-semibold text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-8 py-8">
          {tab === 'match' && (
            isMachinery ? (
              <MachineryMatchEngineView />
            ) : isBio ? (
              <BioInputsMatchEngineView />
            ) : isCropProtection ? (
              <CropProtectionMatchEngineView />
            ) : isFertilizer ? (
              <FertilizerMatchEngineView />
            ) : (
              <DemoMatchTab />
            )
          )}

          {tab === 'reg' && (
            isMachinery ? (
              <MachineryRegulatoryView />
            ) : isBio ? (
              <BioRegulatoryView data={{}} />
            ) : isCropProtection ? (
              <CropProtectionRegulatoryView />
            ) : isFertilizer ? (
              <FertilizerRegulatoryView />
            ) : (
              <SeedRegulatoryView data={{}} />
            )
          )}

          {tab === 'gtm' && (
            isMachinery ? (
              <MachineryGtmView />
            ) : isBio ? (
              <BioInputsGtmView />
            ) : isCropProtection ? (
              <CropProtectionGtmView />
            ) : isFertilizer ? (
              <FertilizerGtmView />
            ) : (
              <SeedGtmView />
            )
          )}
        </div>
      </div>
    </div>
  );
}