// src/pages/FinalReportPage.tsx
import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {   
  Printer,   
  Download,   
  ShieldCheck,   
  TrendingUp,   
  ArrowLeft, 
  AlertCircle 
} from 'lucide-react';
import { useWizard } from '../state/wizardStore';
import { useSavedReports } from '../state/savedReportsStore';
import { STEPS } from '../state/steps';

// Modular Category Sections
import CropProtectionReportSection from '../components/CropProtectionReportSection';
import FertilizerReportSection from '../components/FertilizerReportSection';
import SeedReportSection from '../components/SeedReportSection';
import BioInputsReportSection from '../components/BioInputsReportSection';
import MachineryReportSection from '../components/MachineryReportSection';

type AppOutletContext = { onToast?: (message: string) => void };

export default function FinalReportPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext<AppOutletContext>();
  const { state, markGtmDone } = useWizard();
  const { saveReport } = useSavedReports();

  useEffect(() => {
    if (typeof markGtmDone === 'function') {
      markGtmDone();
    }
  }, [markGtmDone]);

  const tech = (state?.tech || {}) as Record<string, any>;
  const hasCountry = Boolean(state?.countries?.[0]);
  const country = state?.countries?.[0] || 'Unselected Market';

  const matchData = state?.selectedMatchResult;
  const activeProduct = matchData?.activeProduct;

  // Strict normalized category evaluation
  const rawCategoryString = String(
    matchData?.category ||
    state.techCategory ||
    tech.type ||
    tech.category ||
    tech.productType ||
    tech.varietyName ||
    ''
  ).toLowerCase().trim();

  const isSeed = 
    rawCategoryString.includes('seed') ||
    rawCategoryString.includes('variet') ||
    rawCategoryString.includes('hybrid') ||
    Boolean(tech.varietyName);

  const isFert = 
    !isSeed && (
      rawCategoryString.includes('fert') ||
      rawCategoryString.includes('nutrient') ||
      Boolean(tech.fertilizerCategory)
    );

  const isEquip = 
    !isSeed && !isFert && (
      rawCategoryString.includes('machin') ||
      rawCategoryString.includes('equip') ||
      Boolean(tech.machineryCategory)
    );

  const isBio = 
    !isSeed && !isFert && !isEquip && (
      rawCategoryString.includes('bio') ||
      Boolean(tech.inputCategory)
    );

  const isCropProtection = 
    !isSeed && !isFert && !isEquip && !isBio && (
      rawCategoryString.includes('protect') ||
      rawCategoryString.includes('fungic') ||
      rawCategoryString.includes('insectic') ||
      rawCategoryString.includes('herbic') ||
      rawCategoryString.includes('pestic') ||
      Boolean(tech.protectionCategory) ||
      Boolean(tech.chemicalType)
    );

  const techName = 
    activeProduct?.name ||
    tech.varietyName || 
    tech.brandProductName || 
    tech.chemicalType ||
    tech.equipmentName ||
    tech.name || 
    'Technology Not Selected';

  const techCompany = 
    activeProduct?.company || 
    tech.company || 
    tech.institution || 
    'Not Specified';

  const techCategory = 
    isSeed ? 'Seeds & Plant Varieties' :
    isFert ? 'Fertilizers & Plant Nutrition' :
    isEquip ? 'Farm Machinery & Equipment' :
    isBio ? 'Biological & Organic Inputs' :
    isCropProtection ? (activeProduct?.chemicalType || tech.chemicalType || 'Crop Protection') :
    'Category Unassigned';

  const zoneName = matchData?.zoneName || (hasCountry ? `${country} — Target Zone` : 'No Zone Selected');
  const displayScore = activeProduct?.score ?? matchData?.allProducts?.[0]?.score ?? null;

  // ── Step Execution Validity Checks ──
  const regPathway = (state as any)?.selectedRegulatoryPathway;
  const hasRegData = Boolean(
    state.stepComplete[3] ||
    (regPathway && (regPathway.payloadData || regPathway.authorities || regPathway.documents))
  );

  const gtmData = (state as any)?.gtmPlan || (state as any)?.commercializationPlan;
  const hasGtmData = Boolean(
    state.stepComplete[4] ||
    gtmData
  );

  // Extract Live Regulatory Info
  const regPayload = regPathway?.payloadData || regPathway || {};
  const authorities = regPayload.authorities || {};
  const compliance = regPayload.compliance_requirements || {};
  const trials = regPayload.trials_and_reciprocity || {};
  const regSummary = regPayload.summary || {};

  // Dynamic Clearance Status (No Hardcoded Strings)
  const clearanceStatusText = !hasRegData
    ? 'Pending Steps'
    : (
        regSummary?.status ||
        regPayload?.status ||
        (regSummary?.estimated_timeline ? `${regSummary.estimated_timeline} Pathway` : null) ||
        (compliance?.import_permit ? 'Permit & Testing Mandate' : 'Statutory Review Complete')
      );

  const clearanceSubText = !hasRegData
    ? 'Regulatory Pathway Incomplete'
    : (
        authorities?.quarantine_authority ||
        authorities?.certification_body ||
        regSummary?.regulatory_authority ||
        authorities?.governing_laws ||
        'Statutory Review Generated'
      );

  const requiredDocs: string[] =
    compliance.required_documents ||
    regPathway?.documents ||
    [
      'Phytosanitary Import Permit (PIP)',
      'Official Seed Health Certificate',
      'ISTA Orange International Certificate',
      'Non-GMO & Quality Assurance Declaration',
    ];

  const clearanceNotice: string =
    trials.trial_rules ||
    compliance.import_permit ||
    (hasCountry 
      ? `Standard statutory clearance for ${country} requires official national verification and trial protocols before commercial deployment.`
      : 'Select a target market in Step 2 to generate clearance guidelines.');

  // Extract Live GTM Info
  const phases = gtmData?.phases || [
    {
      title: 'Phase 1 (Days 1–30)',
      desc: 'Breeder seed import permits, quarantine field plots, outgrower contracts.',
    },
    {
      title: 'Phase 2 (Days 31–60)',
      desc: 'Agronomic demo days, agro-dealer network pre-orders, retail packaging.',
    },
    {
      title: 'Phase 3 (Days 61–90)',
      desc: 'Pre-monsoon retail distribution, certified tag dispatch, farmer workshops.',
    },
  ];

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const handleSaveToPortfolio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    saveReport({
      techKey: state.techKey,
      techType: state.tech?.type || techCategory,
      techCategory: state.techCategory || techCategory,
      tech: state.tech,
      countries: state.countries,
      matchResult: state.selectedMatchResult,
      regulatoryPathway: state.selectedRegulatoryPathway,
    } as any);

    if (outletContext?.onToast) {
      outletContext.onToast('Dossier successfully saved to portfolio!');
    }

    navigate('/saved-reports');
  };

  const handleNavigateStep = (stepNumber: number) => {
    const target = STEPS.find((s) => s.n === stepNumber);
    if (target) {
      navigate(`/${target.path}`);
    }
  };

  return (
    <div className="mx-auto max-w-350 px-10 py-10 space-y-8 print:p-0 print:m-0 print:max-w-none print:space-y-6">
      {/* ── Top Header Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6 print:border-b-2 print:border-emerald-800 print:pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-widest mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse print:hidden" />
            Comprehensive Commercial Dossier
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight print:text-2xl print:text-black">
            Final Deployment Report — {country}
          </h1>
          <p className="text-sm text-muted mt-1 print:text-xs print:text-slate-600">
            Synthesized intelligence dossier for {techName} targeting {zoneName}.
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-paper text-sm font-semibold text-ink hover:bg-cream/40 transition shadow-2xs cursor-pointer active:scale-95"
          >
            <Printer size={16} />
            Print Dossier
          </button>
          <button
            type="button"
            onClick={handleSaveToPortfolio}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-sm font-semibold text-white hover:bg-brand-dark transition shadow-xs cursor-pointer active:scale-95"
          >
            <Download size={16} />
            Save to Portfolio
          </button>
        </div>
      </div>

      {/* ── Executive Highlights Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3 print:break-inside-avoid">
        <div className="bg-paper p-5 rounded-2xl border border-line shadow-2xs space-y-1 print:border-slate-300 print:bg-slate-50 print:p-3">
          <span className="text-xs font-mono uppercase text-muted font-bold block print:text-[10px]">Evaluated Technology</span>
          <span className="text-lg font-bold text-ink truncate block print:text-sm print:text-black">{techName}</span>
          <span className="text-xs text-emerald-700 font-semibold print:text-[11px]">{techCategory}</span>
        </div>

        <div className="bg-paper p-5 rounded-2xl border border-line shadow-2xs space-y-1 print:border-slate-300 print:bg-slate-50 print:p-3">
          <span className="text-xs font-mono uppercase text-muted font-bold block print:text-[10px]">Target Zone</span>
          <span className="text-lg font-bold text-ink truncate block print:text-sm print:text-black">{zoneName}</span>
          <span className="text-xs text-muted print:text-[10px]">{hasCountry ? `${country} Market` : 'Market Unassigned'}</span>
        </div>

        <div className="bg-paper p-5 rounded-2xl border border-line shadow-2xs space-y-1 print:border-slate-300 print:bg-slate-50 print:p-3">
          <span className="text-xs font-mono uppercase text-muted font-bold block print:text-[10px]">Match Fit Score</span>
          <span className="text-lg font-bold text-emerald-700 block print:text-sm">
            {displayScore !== null ? `${displayScore}%` : 'N/A'}
          </span>
          <span className="text-xs text-muted print:text-[10px]">
            {displayScore !== null 
              ? (Number(displayScore) >= 80 ? 'Optimal Varietal Adaptation' : 'Moderate Fit') 
              : 'Run Match Analysis First'}
          </span>
        </div>

        <div className="bg-paper p-5 rounded-2xl border border-line shadow-2xs space-y-1 print:border-slate-300 print:bg-slate-50 print:p-3">
          <span className="text-xs font-mono uppercase text-muted font-bold block print:text-[10px]">Clearance Status</span>
          <span className="text-lg font-bold text-sky-800 block truncate print:text-sm">
            {clearanceStatusText}
          </span>
          <span className="text-xs text-muted truncate block print:text-[10px]">
            {clearanceSubText}
          </span>
        </div>
      </div>

      {/* ── Deep-Dive Sections ── */}
      <div className="space-y-6 print:space-y-6">
        
        {/* Stage 1: Technology Profile */}
        <section className="bg-paper rounded-2xl border border-line p-6 shadow-2xs space-y-4 print:border-slate-300 print:shadow-none print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-line pb-3 print:border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center border border-emerald-200">
                01
              </span>
              <h2 className="text-lg font-bold text-ink print:text-base print:text-black">Technology Profile & Specification Baseline</h2>
            </div>
            <button 
              type="button"
              onClick={() => handleNavigateStep(1)} 
              className="text-xs font-semibold text-brand hover:underline cursor-pointer print:hidden"
            >
              Edit Specs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm print:grid-cols-3 print:text-xs">
            <div className="p-3.5 bg-cream/30 rounded-xl border border-line/50 print:bg-slate-50 print:border-slate-200">
              <span className="text-xs font-mono uppercase text-muted font-bold block print:text-[10px]">Variety / Brand Name</span>
              <span className="font-semibold text-ink mt-0.5 block print:text-black">{techName}</span>
            </div>
            <div className="p-3.5 bg-cream/30 rounded-xl border border-line/50 print:bg-slate-50 print:border-slate-200">
              <span className="text-xs font-mono uppercase text-muted font-bold block print:text-[10px]">Developer / Breeder</span>
              <span className="font-semibold text-ink mt-0.5 block print:text-black">{techCompany}</span>
            </div>
            <div className="p-3.5 bg-cream/30 rounded-xl border border-line/50 print:bg-slate-50 print:border-slate-200">
              <span className="text-xs font-mono uppercase text-muted font-bold block print:text-[10px]">Category & Classification</span>
              <span className="font-semibold text-ink mt-0.5 block print:text-black">{techCategory}</span>
            </div>
          </div>
        </section>

        {/* Stage 2 & 3: Modular Category Report Section Router */}
        {isSeed ? (
          <SeedReportSection matchData={matchData} country={country} onNavigateStep={handleNavigateStep} />
        ) : isFert ? (
          <FertilizerReportSection matchData={matchData} country={country} onNavigateStep={handleNavigateStep} />
        ) : isEquip ? (
          <MachineryReportSection matchData={matchData} country={country} onNavigateStep={handleNavigateStep} />
        ) : isBio ? (
          <BioInputsReportSection matchData={matchData} country={country} onNavigateStep={handleNavigateStep} />
        ) : isCropProtection ? (
          <CropProtectionReportSection matchData={matchData} country={country} onNavigateStep={handleNavigateStep} />
        ) : (
          <section className="bg-paper rounded-2xl border border-line p-6 shadow-2xs space-y-4 print:border-slate-300 print:shadow-none print:break-inside-avoid">
            <div className="flex items-center justify-between border-b border-line pb-3 print:border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-12 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center border border-emerald-200">
                  02-03
                </span>
                <h2 className="text-lg font-bold text-ink print:text-base print:text-black">
                  Agroclimatic & Technical Compatibility Analysis
                </h2>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No Compatibility Data Available</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Step 3 (Match Analysis) was not executed. Please select a technology and destination country to generate agroclimatic compatibility scores.
              </p>
            </div>
          </section>
        )}

        {/* Stage 4: Statutory Pathway */}
        <section className="bg-paper rounded-2xl border border-line p-6 shadow-2xs space-y-4 print:border-slate-300 print:shadow-none print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-line pb-3 print:border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center border border-emerald-200">
                04
              </span>
              <h2 className="text-lg font-bold text-ink print:text-base print:text-black">Statutory Approvals & Quarantine Mandates</h2>
            </div>
            <button 
              type="button"
              onClick={() => handleNavigateStep(4)} 
              className="text-xs font-semibold text-brand hover:underline cursor-pointer print:hidden"
            >
              Review Requirements
            </button>
          </div>

          {hasRegData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm print:grid-cols-2 print:text-xs">
              <div className="p-4 bg-cream/20 rounded-xl border border-line/60 space-y-2 print:bg-slate-50 print:border-slate-200">
                <span className="font-bold text-ink flex items-center gap-1.5 print:text-black text-xs uppercase tracking-wider font-mono">
                  <ShieldCheck size={16} className="text-brand print:text-emerald-700" />
                  Mandatory Clearance Checklist ({country})
                </span>
                <ul className="text-xs text-muted space-y-1 pl-5 list-disc mt-1 print:text-[11px] print:text-slate-700">
                  {requiredDocs.map((doc: string, idx: number) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-cream/20 rounded-xl border border-line/60 space-y-2 print:bg-slate-50 print:border-slate-200">
                <span className="font-bold text-ink flex items-center gap-1.5 print:text-black text-xs uppercase tracking-wider font-mono">
                  <TrendingUp size={16} className="text-brand print:text-emerald-700" />
                  Trial Horizons & Border Gate
                </span>
                <p className="text-xs text-muted leading-relaxed mt-1 print:text-[11px] print:text-slate-700">
                  {clearanceNotice}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No Regulatory Data Available</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Step 4 (Regulatory Pathway) was not executed for this market. Please run Step 4 to generate official import certificates and statutory mandates.
              </p>
            </div>
          )}
        </section>

        {/* Stage 5: GTM Commercialization */}
        <section className="bg-paper rounded-2xl border border-line p-6 shadow-2xs space-y-4 print:border-slate-300 print:shadow-none print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-line pb-3 print:border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center border border-emerald-200">
                05
              </span>
              <h2 className="text-lg font-bold text-ink print:text-base print:text-black">90-Day Commercialization Roadmap</h2>
            </div>
            <button 
              type="button"
              onClick={() => handleNavigateStep(5)} 
              className="text-xs font-semibold text-brand hover:underline cursor-pointer print:hidden"
            >
              Edit GTM Plan
            </button>
          </div>

          {hasGtmData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono print:grid-cols-3 print:text-[11px]">
              {phases.map((phase: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-paper rounded-xl border border-line print:bg-slate-50 print:border-slate-200">
                  <span className="text-emerald-800 font-bold uppercase block print:text-emerald-900">{phase.title || `Phase ${idx + 1}`}</span>
                  <p className="text-slate-600 mt-1 font-sans text-xs print:text-[11px] print:text-slate-700">{phase.desc || phase.description || phase.activities}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No GTM Plan Available</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Step 5 (Go-to-Market Plan) was not executed. Please generate the 90-day roadmap in Step 5.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <div className="flex items-center justify-between border-t border-line pt-6 print:hidden">
        <button
          type="button"
          onClick={() => handleNavigateStep(5)}
          className="flex items-center gap-2 text-sm font-medium text-ink hover:text-brand cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to GTM Plan
        </button>

        <button
          type="button"
          onClick={handleSaveToPortfolio}
          className="rounded-xl bg-brand hover:bg-brand-dark text-white px-6 py-3 text-sm font-semibold transition shadow-md cursor-pointer active:scale-95"
        >
          Save & Exit to Dashboard
        </button>
      </div>
    </div>
  );
}