// src/persona/business/steps/Step3MatchAnalysis.tsx
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StepLockedNotice from '../../../UI/StepLockedNotice';
import FertilizerMatchEngineView from '../components/FertilizerMatchEngineView';
import BioInputsMatchEngineView from '../components/BioInputsMatchEngineView';
import MachineryMatchEngineView from '../components/MachineryMatchEngineView';
import CropProtectionMatchEngineView from '../components/CropProtectionMatchEngineView';
import SeedMatchEngineView from '../components/SeedMatchEngineView';
import { STEPS } from '../../../state/steps';
import { useWizard } from '../../../state/wizardStore';

export default function Step3MatchAnalysis({ onToast }: { onToast: (message: string) => void }) {
  const navigate = useNavigate();
  const { state, markMatchDone, advanceFromStep } = useWizard();

  const currentTech = (state.tech || {}) as Record<string, any>;
  const techCategory = state.techCategory || '';

  // Strict Category & Tech Extraction (Original Business Logic)
  const rawCat = String(
    techCategory ||
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

  const rawTech = String(
    currentTech.name ||
    currentTech.productName ||
    currentTech.brandProductName ||
    currentTech.varietyName ||
    currentTech.equipmentName ||
    ''
  ).toLowerCase().trim();

  // 1. Farm Machinery & Equipment (Check FIRST)
  const isMachinery =
    techCategory === 'equipment' ||
    rawCat === 'equipment' ||
    rawCat === 'farm-machinery' ||
    rawCat.includes('machin') ||
    rawCat.includes('equip') ||
    Boolean(currentTech.machineryCategory) ||
    Boolean(currentTech.equipmentName) ||
    Boolean(currentTech.productType);

  // 2. Biological Inputs (Check BEFORE Fertilizer to avoid "biofertilizer" getting hijacked)
  const isBio =
    !isMachinery && (
      techCategory === 'bio' ||
      rawCat.includes('bio') ||
      rawTech.includes('bio') ||
      Boolean(currentTech.inputCategory) ||
      Boolean(currentTech.brandProductName && rawCat.includes('stimulant'))
    );

  // 3. Crop Protection & Agrochem
  const isCropProtection =
    !isMachinery && !isBio && (
      techCategory === 'protection' ||
      rawCat.includes('protect') ||
      rawCat.includes('fungic') ||
      rawCat.includes('insectic') ||
      rawCat.includes('herbic') ||
      rawCat.includes('pestic') ||
      rawCat.includes('bacteric') ||
      rawCat.includes('agrochem') ||
      Boolean(currentTech.protectionCategory) ||
      Boolean(currentTech.chemicalType)
    );

  // 4. Fertilizers & Nutrients
  const isFertilizer =
    !isMachinery && !isBio && !isCropProtection && (
      techCategory === 'fertilizers' ||
      rawCat.includes('fert') ||
      rawCat.includes('nutrient') ||
      rawCat.includes('npk') ||
      Boolean(currentTech.fertilizerCategory) ||
      Boolean(currentTech.nutrientType) ||
      Boolean(currentTech.npkGrade)
    );

  const ready = !!state.stepComplete[1] && !!state.stepComplete[2];

  const handleBack = () => navigate(`/${STEPS[1].path}`);

  const handleContinue = () => {
    markMatchDone(state.selectedMatchResult);
    const result = advanceFromStep(3);
    if (!result.ok && result.error) {
      onToast(result.error);
      return;
    }
    navigate(`/${STEPS[3].path}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-14 py-10">
      {/* Dynamic Header based on Category */}
      <h1 className="mb-3 text-[2.25rem] font-bold leading-tight tracking-tight text-ink">
        {isMachinery
          ? 'Farm Machinery & Equipment Model Match Engine'
          : isCropProtection
          ? 'Crop Protection Inoculum & Pathogen Match Engine'
          : isFertilizer
          ? 'Fertilizer Zone-to-Product Match Engine'
          : isBio
          ? 'Biological Soil & Inoculant Compatibility Engine'
          : 'Seed Variety Agroclimatic Zone Match Analysis'}
      </h1>

      <p className="mb-9 text-[15px] leading-relaxed text-muted">
        {isMachinery
          ? 'Evaluating rated power, PTO torque, terrain soil mechanics, and implement compatibility across target agro-zones.'
          : isCropProtection
          ? 'Evaluating regional fungal/bacterial disease pressure, crop host alignment, chemical persistence, and resistance barriers across target agro-zones.'
          : isFertilizer
          ? 'Evaluating predicted agronomic response, soil nutrient gaps, and chemical feasibility across target agro-zones.'
          : isBio
          ? 'Evaluating SoilGrids microbial viability, soil carbon availability, and mineral solubilization efficiency across zones.'
          : 'Scores combine varietal agroclimatic fit, maturity cycle length, and regional rainfall suitability.'}
      </p>

      {/* Dynamic Dedicated Match View Routing */}
      {ready ? (
        isMachinery ? (
          <MachineryMatchEngineView />
        ) : isBio ? (
          <BioInputsMatchEngineView />
        ) : isCropProtection ? (
          <CropProtectionMatchEngineView />
        ) : isFertilizer ? (
          <FertilizerMatchEngineView />
        ) : (
          <SeedMatchEngineView />
        )
      ) : (
        <StepLockedNotice
          message="Complete Technology Details and Target Markets first — match analysis needs your technology and selected countries to run."
          ctaLabel={!state.stepComplete[1] ? 'Go to Technology Details' : 'Go to Target Markets'}
          onCta={() => navigate(`/${!state.stepComplete[1] ? STEPS[0].path : STEPS[1].path}`)}
        />
      )}

      {/* Navigation Footer */}
      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-ink hover:text-brand cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!ready}
          className="flex items-center gap-2 rounded-sm bg-brand pl-6 pr-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          Continue to Regulatory Pathway
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}