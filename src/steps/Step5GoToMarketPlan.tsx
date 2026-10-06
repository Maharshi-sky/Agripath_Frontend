// src/steps/Step5GoToMarketPlan.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MachineryGtmView from '../components/MachineryGtmView';
import CropProtectionGtmView from '../components/CropProtectionGtmView';
import FertilizerGtmView from '../components/FertilizerGtmView';
import BioInputsGtmView from '../components/BioInputsGtmView';
import SeedGtmView from '../components/SeedGtmView';
import StepLockedNotice from '../UI/StepLockedNotice';
import { useSavedReports } from '../state/savedReportsStore';
import { STEPS } from '../state/steps';
import { useWizard } from '../state/wizardStore';

// Match Views for Print
import MachineryMatchEngineView from '../components/MachineryMatchEngineView';
import CropProtectionMatchEngineView from '../components/CropProtectionMatchEngineView';
import FertilizerMatchEngineView from '../components/FertilizerMatchEngineView';
import BioInputsMatchEngineView from '../components/BioInputsMatchEngineView';
import SeedMatchEngineView from '../components/SeedMatchEngineView';

// Regulatory Views for Print
import MachineryRegulatoryView from '../components/MachineryRegulatoryView';
import CropProtectionRegulatoryView from '../components/CropProtectionRegulatoryView';
import FertilizerRegulatoryView from '../components/FertilizerRegulatoryView';
import BioRegulatoryView from '../components/BioRegulatoryView';
import SeedRegulatoryView from '../components/SeedRegulatoryView';

export default function Step5GoToMarketPlan() {
  const navigate = useNavigate();
  const { state, markGtmDone, advanceFromStep } = useWizard();
  const { saveReport } = useSavedReports();
  const [isPrinting, setIsPrinting] = useState(false);

  const ready =
    !!state.stepComplete[1] && !!state.stepComplete[2] && !!state.stepComplete[3] && !!state.stepComplete[4];
  const firstMissingStep = !state.stepComplete[1]
    ? STEPS[0]
    : !state.stepComplete[2]
      ? STEPS[1]
      : !state.stepComplete[3]
        ? STEPS[2]
        : STEPS[3];

  const handleBack = () => navigate(`/${STEPS[3].path}`);

  // Listen for browser print events so background engines don't trigger during regular screen browsing
  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleExportPdf = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Strict Category Resolution
  const currentTech = (state.tech || {}) as Record<string, any>;
  const rawCategory = String(
    state.techCategory ||
    currentTech.machineryCategory ||
    currentTech.protectionCategory ||
    currentTech.fertilizerCategory ||
    currentTech.chemicalType ||
    currentTech.inputCategory ||
    currentTech.category ||
    currentTech.productType ||
    ''
  ).toLowerCase().trim();

  // 1. Farm Machinery
  const isMachinery =
    rawCategory.includes('machin') ||
    rawCategory.includes('equip') ||
    rawCategory === 'equipment' ||
    Boolean(currentTech.productType) ||
    Boolean(currentTech.equipmentName) ||
    Boolean(currentTech.machineryCategory);

  // 2. Biological Inputs
  const isBio =
    !isMachinery && (
      rawCategory.includes('bio') ||
      Boolean(currentTech.inputCategory) ||
      Boolean(currentTech.brandProductName && rawCategory.includes('stimulant'))
    );

  // 3. Crop Protection
  const isCropProtection =
    !isMachinery && !isBio && (
      rawCategory.includes('protect') ||
      rawCategory.includes('pest') ||
      rawCategory.includes('fungic') ||
      rawCategory.includes('insectic') ||
      rawCategory.includes('herbic') ||
      rawCategory.includes('agrochem') ||
      Boolean(currentTech.protectionCategory) ||
      Boolean(currentTech.chemicalType)
    );

  // 4. Fertilizers
  const isFertilizer =
    !isMachinery && !isBio && !isCropProtection && (
      rawCategory.includes('fert') ||
      rawCategory.includes('nutrient') ||
      Boolean(currentTech.fertilizerCategory) ||
      Boolean(currentTech.npkGrade)
    );

  const handleGenerateFullReport = () => {
    const effectiveCategory = isMachinery
      ? 'equipment'
      : isBio
      ? 'bio'
      : isCropProtection
      ? 'protection'
      : isFertilizer
      ? 'fertilizers'
      : 'seeds';

    // 1. Mark step 5 complete in wizard store (sets stepComplete[5] = true & gtmDone = true)
    markGtmDone();
    advanceFromStep(5);

    // 2. Save snapshot to reports store
    saveReport({
      techKey: state.techKey,
      techType: state.tech?.type || effectiveCategory,
      techCategory: state.techCategory || effectiveCategory,
      tech: state.tech,
      countries: state.countries,
    });

    // 3. Navigate directly to dedicated Final Report page
    navigate('/final-report');
  };

  const techDisplayName =
    currentTech.brandProductName ||
    currentTech.varietyName ||
    currentTech.equipmentName ||
    currentTech.name ||
    'Agricultural Technology';

  const targetCountry = state.countries?.[0] || 'Target Market';

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. SCREEN VIEW (Visible normally on screen, hidden during Print)          */}
      {/* ========================================================================= */}
      <div className="mx-auto max-w-350 px-14 py-10 print:hidden">
        <h1 className="mb-3 text-[2.25rem] font-bold leading-tight tracking-tight text-ink">
          Your first 90 days in market
        </h1>
        <p className="mb-9 max-w-3xl text-[15px] leading-relaxed text-muted">
          This is the final deliverable of the run. Export it as a full comprehensive dossier, or generate the saved report.
        </p>

        {ready ? (
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
        ) : (
          <StepLockedNotice
            message="Complete the earlier steps first — the go-to-market plan is built from your technology, markets, match analysis and regulatory pathway."
            ctaLabel={`Go to ${firstMissingStep.label}`}
            onCta={() => navigate(`/${firstMissingStep.path}`)}
          />
        )}

        <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-ink hover:text-brand"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={!ready}
              className="flex items-center gap-2 rounded-lg bg-ink pl-6 pr-3 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export as PDF
              <ArrowUpRight size={16} />
            </button>
            <button
              type="button"
              onClick={handleGenerateFullReport}
              disabled={!ready}
              className="flex items-center gap-2 rounded-lg bg-brand pl-6 pr-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Generate Full Report
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL COMPREHENSIVE DOSSIER PRINT VIEW (Only mounted during actual print)*/}
      {/* ========================================================================= */}
      {isPrinting && (
        <div className="p-8 bg-white text-slate-900 space-y-10">
          {/* Cover Header */}
          <div className="border-b-2 border-emerald-800 pb-6 flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                AgriPath AI · Comprehensive Expansion Dossier
              </div>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
                {techDisplayName}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Target Market: <strong className="text-slate-900">{targetCountry}</strong> · Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 uppercase">
                Full Strategy Report
              </span>
            </div>
          </div>

          {/* Section 1: Technology & Target Market Executive Summary */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-emerald-900 border-b pb-1 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              1. Technology Specifications & Target Market Overview
            </h2>
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="block font-bold text-slate-500 uppercase">Technology / Variety</span>
                <span className="font-semibold text-slate-800">{techDisplayName}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-500 uppercase">Domain / Category</span>
                <span className="font-semibold text-slate-800">{state.techCategory || currentTech.cropType || 'Agricultural Technology'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-500 uppercase">Country Route</span>
                <span className="font-semibold text-slate-800">{targetCountry}</span>
              </div>
              <div className="col-span-3 mt-2 pt-2 border-t border-slate-200">
                <span className="block font-bold text-slate-500 uppercase">Technology Attributes</span>
                <p className="mt-1 text-slate-700 leading-relaxed">
                  {currentTech.desc || currentTech.varietyDesc || currentTech.otherDetails || 'Standard agronomic formulation designed for high-efficiency commercial deployment.'}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Agroclimatic / Fleet Match Analysis */}
          <section className="space-y-4 break-before-page">
            <h2 className="text-lg font-bold uppercase tracking-wider text-emerald-900 border-b pb-1 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-700" />
              2. Match Analysis & Agroclimatic Zone Compatibility
            </h2>
            <div>
              {isMachinery ? (
                <MachineryMatchEngineView />
              ) : isBio ? (
                <BioInputsMatchEngineView />
              ) : isCropProtection ? (
                <CropProtectionMatchEngineView />
              ) : isFertilizer ? (
                <FertilizerMatchEngineView />
              ) : (
                <SeedMatchEngineView />
              )}
            </div>
          </section>

          {/* Section 3: Regulatory Dossier & Statutory Pathway */}
          <section className="space-y-4 break-before-page">
            <h2 className="text-lg font-bold uppercase tracking-wider text-emerald-900 border-b pb-1 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              3. Statutory Dossier & Regulatory Clearance Pathway
            </h2>
            <div>
              {isMachinery ? (
                <MachineryRegulatoryView />
              ) : isBio ? (
                <BioRegulatoryView data={{}} />
              ) : isCropProtection ? (
                <CropProtectionRegulatoryView />
              ) : isFertilizer ? (
                <FertilizerRegulatoryView />
              ) : (
                <SeedRegulatoryView data={{}} />
              )}
            </div>
          </section>

          {/* Section 4: 90-Day Go-to-Market Plan */}
          <section className="space-y-4 break-before-page">
            <h2 className="text-lg font-bold uppercase tracking-wider text-emerald-900 border-b pb-1 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              4. 90-Day Go-to-Market Implementation Plan
            </h2>
            <div>
              {isMachinery ? (
                <MachineryGtmView />
              ) : isBio ? (
                <BioInputsGtmView />
              ) : isCropProtection ? (
                <CropProtectionGtmView />
              ) : isFertilizer ? (
                <FertilizerGtmView />
              ) : (
                <SeedGtmView />
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}