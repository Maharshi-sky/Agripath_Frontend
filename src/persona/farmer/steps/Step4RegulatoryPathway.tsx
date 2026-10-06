// src/persona/farmer/steps/Step4RegulatoryPathway.tsx
import { useEffect, useState, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../../state/wizardStore';
import { agriApi } from '../../../services/agriApi';
import SeedRegulatoryView from '../components/SeedRegulatoryView';
import BioRegulatoryView from '../components/BioRegulatoryView';
import FertilizerRegulatoryView from '../components/FertilizerRegulatoryView';
import MachineryRegulatoryView from '../components/MachineryRegulatoryView';
import CropProtectionRegulatoryView from '../components/CropProtectionRegulatoryView';
import StepLockedNotice from '../../../UI/StepLockedNotice';
import RegulatoryAnalysisLoading from '../../../UI/RegulatoryAnalysisLoading';
import type { RegCategory } from '../../../UI/RegulatoryAnalysisLoading';
import { STEPS } from '../../../state/steps';

export default function FarmerStep4RegulatoryPathway({ onToast }: { onToast?: (message: string) => void }) {
  const navigate = useNavigate();
  const { state, markRegDone, advanceFromStep } = useWizard();

  const ready = !!state.stepComplete[1] && !!state.stepComplete[2];
  const targetCountry = state.countries?.[0] || 'Kenya';
  const currentTech = (state.tech || {}) as Record<string, any>;
  const techCategory = state.techCategory || '';

  // Strict Category & Tech Extraction
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

  // 1. Farm Machinery
  const isMachinery =
    techCategory === 'equipment' ||
    techCategory === 'machinery' ||
    rawCat === 'equipment' ||
    rawCat === 'machinery' ||
    rawCat === 'farm-machinery' ||
    rawCat.includes('machin') ||
    rawCat.includes('equip') ||
    Boolean(currentTech.machineryCategory) ||
    Boolean(currentTech.equipmentName) ||
    Boolean(currentTech.productType);

  // 2. Biological Inputs
  const isBio =
    !isMachinery && (
      techCategory === 'bio' ||
      rawCat.includes('bio') ||
      Boolean(currentTech.inputCategory) ||
      Boolean(currentTech.brandProductName && rawCat.includes('stimulant'))
    );

  // 3. Crop Protection
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

  // 4. Fertilizers
  const isFertilizer =
    !isMachinery && !isBio && !isCropProtection && (
      techCategory === 'fertilizers' ||
      rawCat.includes('fert') ||
      rawCat.includes('nutrient') ||
      rawCat.includes('npk') ||
      Boolean(currentTech.fertilizerCategory) ||
      Boolean(currentTech.nutrientType)
    );

  let resolvedCategoryForApi = 'seeds';
  let targetTech = 'Standard Agricultural Input';
  let loadingCategory: RegCategory = 'general';

  if (isBio) {
    resolvedCategoryForApi = 'bio-inputs';
    targetTech = currentTech.brandProductName || currentTech.name || 'Microbial Inoculant / Biostimulant';
    loadingCategory = 'bio';
  } else if (isFertilizer) {
    resolvedCategoryForApi = 'fertilizers';
    targetTech = currentTech.name || currentTech.productName || currentTech.fertilizerCategory || 'Commercial Fertilizer Formulation';
    loadingCategory = 'fertilizer';
  } else if (isCropProtection) {
    resolvedCategoryForApi = 'crop-protection';
    targetTech = currentTech.name || currentTech.tradeName || currentTech.chemicalType || 'Formulated Crop Protection Active';
    loadingCategory = 'protection';
  } else if (isMachinery) {
    resolvedCategoryForApi = 'machinery';
    targetTech = currentTech.equipmentName || currentTech.name || currentTech.productType || 'Agricultural Machinery Equipment';
    loadingCategory = 'general';
  } else {
    resolvedCategoryForApi = 'seeds';
    targetTech = currentTech.varietyName || currentTech.name || 'Certified Seed Variety';
    loadingCategory = 'seeds';
  }

  // ── SYNCHRONIZED CACHE LAYER ──
  const sessionKey = `agri_farmer_reg_${(targetCountry || '').trim().toLowerCase()}__${(resolvedCategoryForApi || '').trim().toLowerCase()}`;

  const cachedFromSession = useMemo(() => {
    try {
      const s = sessionStorage.getItem(sessionKey);
      if (s) return JSON.parse(s);
    } catch {
      // ignore
    }
    return null;
  }, [sessionKey]);

  const cachedPathway: any = (state as any).selectedRegulatoryPathway;
  const isCacheValid = Boolean(
    (cachedPathway &&
      cachedPathway.country === targetCountry &&
      cachedPathway.technology === targetTech &&
      cachedPathway.category === resolvedCategoryForApi &&
      cachedPathway.payloadData) ||
    cachedFromSession
  );

  const [data, setData] = useState<any>(() => {
    if (cachedPathway?.payloadData) return cachedPathway.payloadData;
    if (cachedFromSession?.payloadData) return cachedFromSession.payloadData;
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => !isCacheValid);

  const lastFetchKeyRef = useRef<string>(
    isCacheValid ? `${targetCountry}__${targetTech}__${resolvedCategoryForApi}` : ''
  );

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }

    const currentKey = `${targetCountry}__${targetTech}__${resolvedCategoryForApi}`;

    if (isCacheValid && lastFetchKeyRef.current === currentKey) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    async function fetchPathway() {
      setLoading(true);
      try {
        const res = await agriApi.getRegulatoryPathway({
          category: resolvedCategoryForApi,
          technology: targetTech,
          country: targetCountry,
          subCategory: currentTech.machineryCategory || currentTech.fertilizerCategory || currentTech.chemicalType,
        });

        if (isSubscribed) {
          const payloadData = (res?.data && (res.data.authorities || res.data.summary || res.data.compliance_requirements))
            ? res.data
            : res;

          setData(payloadData);
          lastFetchKeyRef.current = currentKey;

          const toStore = {
            country: targetCountry,
            technology: targetTech,
            category: resolvedCategoryForApi,
            payloadData,
          };

          (state as any).selectedRegulatoryPathway = toStore;

          try {
            sessionStorage.setItem(sessionKey, JSON.stringify(toStore));
          } catch {
            // quota fallback
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          console.warn('Regulatory pathway live fetch fallback:', err);
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    fetchPathway();

    return () => {
      isSubscribed = false;
    };
  }, [resolvedCategoryForApi, targetTech, targetCountry, ready, isCacheValid, sessionKey, state, currentTech]);

  const handleBack = () => navigate(`/${STEPS[2].path}`);

  const handleContinue = () => {
    markRegDone();
    const result = advanceFromStep(4);
    if (!result.ok && result.error && onToast) {
      onToast(result.error);
      return;
    }
    navigate(`/${STEPS[4].path}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-14 py-10">
      {/* Farmer Centric Header */}
      <h1 className="mb-3 text-[2.25rem] font-bold leading-tight tracking-tight text-ink">
        Government Schemes, Subsidies & Approved Usage Guidelines
      </h1>
      <p className="mb-9 text-[15px] leading-relaxed text-muted">
        Review certified safety clearances, approved agricultural practices, and institutional subsidy eligibility for {targetCountry}.
      </p>

      {ready ? (
        loading ? (
          <RegulatoryAnalysisLoading
            technologyName={targetTech}
            countryName={targetCountry}
            category={loadingCategory}
          />
        ) : isMachinery ? (
          <MachineryRegulatoryView data={data} meta={data?.meta} loading={loading} />
        ) : isBio ? (
          <BioRegulatoryView data={data} meta={data?.meta} loading={loading} />
        ) : isCropProtection ? (
          <CropProtectionRegulatoryView data={data} meta={data?.meta} loading={loading} />
        ) : isFertilizer ? (
          <FertilizerRegulatoryView data={data} meta={data?.meta} loading={loading} />
        ) : (
          <SeedRegulatoryView data={data || {}} meta={data?.meta} loading={loading} />
        )
      ) : (
        <StepLockedNotice
          message="Complete Input Details and Target Country first — compliance guidelines and subsidy eligibility require your selected input."
          ctaLabel={!state.stepComplete[1] ? 'Go to Input Details' : 'Go to Target Region'}
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
          disabled={!ready || loading}
          className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-sm"
        >
          Continue to Farm Execution Plan
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}