// src/steps/Step4RegulatoryPathway.tsx
import { useEffect, useState, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, ExternalLink, ShieldCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../state/wizardStore';
import { agriApi } from '../services/agriApi';
import SeedRegulatoryView from '../components/SeedRegulatoryView';
import BioRegulatoryView from '../components/BioRegulatoryView';
import FertilizerRegulatoryView from '../components/FertilizerRegulatoryView';
import MachineryRegulatoryView from '../components/MachineryRegulatoryView';
import CropProtectionRegulatoryView from '../components/CropProtectionRegulatoryView';
import IrrigationRegulatoryView from '../components/IrrigationRegulatoryView';
import SimilarRegulationsView from '../components/SimilarRegulationsView';
import StepLockedNotice from '../UI/StepLockedNotice';
import RegulatoryAnalysisLoading from '../UI/RegulatoryAnalysisLoading';
import type { RegCategory } from '../UI/RegulatoryAnalysisLoading';
import { STEPS } from '../state/steps';

// Country Name to ISO 2-letter Code Mapping for AgriPass
const COUNTRY_TO_CODE: Record<string, string> = {
  'kenya': 'KE',
  'tanzania': 'TZ',
  'uganda': 'UG',
  'rwanda': 'RW',
  'burundi': 'BI',
  'ethiopia': 'ET',
  'nigeria': 'NG',
  'ghana': 'GH',
  'senegal': 'SN',
  'south africa': 'ZA',
  'zambia': 'ZM',
  'zimbabwe': 'ZW',
  'egypt': 'EG',
  'bangladesh': 'BD',
  'vietnam': 'VN',
  'indonesia': 'ID',
  'india': 'IN',
  'brazil': 'BR'
};

// ── UNIVERSAL AGRIPASS URL RESOLVER (Localhost, Vercel & AWS Custom Domain) ──
function resolveAgriPassBaseUrl(): string {
  const isBrowser = typeof window !== 'undefined';
  const isLocalHost = isBrowser && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  if (isLocalHost) {
    return import.meta.env.VITE_AGRIPASS_URL || 'http://localhost:5173';
  }

  // Production (Vercel/AWS custom domain env variable ya live fallback)
  const envUrl = import.meta.env.VITE_AGRIPASS_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return 'https://agripass-two.vercel.app';
}

export default function Step4RegulatoryPathway({ onToast }: { onToast?: (message: string) => void }) {
  const navigate = useNavigate();
  const { state, markRegDone, advanceFromStep } = useWizard();

  const ready = !!state.stepComplete[1] && !!state.stepComplete[2];
  const targetCountry = state.countries?.[0] || 'NA';
  const currentTech = (state.tech || {}) as Record<string, any>;
  const techCategory = state.techCategory || '';

  // ── STEP 3 FERTILIZER SELECTION RESOLUTION ──
  const selectedMatch = (state as any).selectedMatchResult || (state as any).selectedMatch;

  const fertSessionProduct = useMemo(() => {
    try {
      const keys = Object.keys(sessionStorage).filter((k) => k.startsWith('agri_fert_match_'));
      for (const k of keys) {
        const item = JSON.parse(sessionStorage.getItem(k) || '{}');
        const rows = item.dbProducts || [];
        const idx = item.selectedIdx ?? 0;
        const row = rows[idx];
        const val = row?.['Nutrient Names'] || row?.nutrientName || row?.['Product Name'] || row?.productName;
        if (val) return String(val).trim();
      }
    } catch {
      // ignore
    }
    return '';
  }, []);

  const activeFertilizerProduct =
    selectedMatch?.activeProduct?.nutrientName ||
    selectedMatch?.activeProduct?.['Nutrient Names'] ||
    selectedMatch?.activeProduct?.productName ||
    selectedMatch?.activeProduct?.['Product Name'] ||
    fertSessionProduct ||
    '';

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

  // 1. Irrigation & Water Systems
  const isIrrigation =
    techCategory === 'irrigation' ||
    rawCat.includes('irrigat') ||
    rawCat.includes('drip') ||
    rawCat.includes('sprinkler') ||
    Boolean(currentTech.targetCrop && currentTech.recommendedSystem);

  // 2. Farm Machinery
  const isMachinery =
    !isIrrigation && (
      techCategory === 'equipment' ||
      techCategory === 'machinery' ||
      rawCat === 'equipment' ||
      rawCat === 'machinery' ||
      rawCat === 'farm-machinery' ||
      rawCat.includes('machin') ||
      rawCat.includes('equip') ||
      Boolean(currentTech.machineryCategory) ||
      Boolean(currentTech.equipmentName) ||
      Boolean(currentTech.productType)
    );

  // 3. Biological Inputs
  const isBio =
    !isIrrigation && !isMachinery && (
      techCategory === 'bio' ||
      rawCat.includes('bio') ||
      Boolean(currentTech.inputCategory) ||
      Boolean(currentTech.brandProductName && rawCat.includes('stimulant'))
    );

  // 4. Crop Protection
  const isCropProtection =
    !isIrrigation && !isMachinery && !isBio && (
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

  // 5. Fertilizers
  const isFertilizer =
    !isIrrigation && !isMachinery && !isBio && !isCropProtection && (
      techCategory === 'fertilizers' ||
      rawCat.includes('fert') ||
      rawCat.includes('nutrient') ||
      rawCat.includes('npk') ||
      Boolean(currentTech.fertilizerCategory) ||
      Boolean(currentTech.nutrientType)
    );

  let resolvedCategoryForApi = 'seeds';
  let agripassCategory = 'seeds';
  let targetTech = 'Standard Agricultural Input';
  let loadingCategory: RegCategory = 'general';

  if (isIrrigation) {
    resolvedCategoryForApi = 'irrigation';
    agripassCategory = 'irrigation';
    targetTech =
      currentTech.recommendedSystem ||
      (currentTech.targetCrop ? `Precision Irrigation (${currentTech.targetCrop})` : '') ||
      currentTech.name ||
      'Precision Irrigation Infrastructure Kit';
    loadingCategory = 'general';
  } else if (isBio) {
    resolvedCategoryForApi = 'bio-inputs';
    agripassCategory = 'biologicals';
    targetTech = currentTech.brandProductName || currentTech.name || 'Microbial Inoculant / Biostimulant';
    loadingCategory = 'bio';
  } else if (isFertilizer) {
    resolvedCategoryForApi = 'fertilizers';
    agripassCategory = 'fertilizers';
    targetTech = currentTech.name || currentTech.productName || currentTech.fertilizerCategory || 'Commercial Fertilizer Formulation';
    loadingCategory = 'fertilizer';
  } else if (isCropProtection) {
    resolvedCategoryForApi = 'crop-protection';
    agripassCategory = 'agrochem';
    targetTech = currentTech.name || currentTech.tradeName || currentTech.chemicalType || 'Formulated Crop Protection Active';
    loadingCategory = 'protection';
  } else if (isMachinery) {
    resolvedCategoryForApi = 'machinery';
    agripassCategory = 'machinery';
    targetTech = currentTech.equipmentName || currentTech.name || currentTech.productType || 'Agricultural Machinery Equipment';
    loadingCategory = 'general';
  } else {
    resolvedCategoryForApi = 'seeds';
    agripassCategory = 'seeds';
    targetTech = currentTech.varietyName || currentTech.name || 'Certified Seed Variety';
    loadingCategory = 'seeds';
  }

  // ── DYNAMIC AGRIPASS BASE URL & JUMP LINK ──
  const destCode = COUNTRY_TO_CODE[String(targetCountry).trim().toLowerCase()] || 'UG';
  const AGRIPASS_BASE_URL = resolveAgriPassBaseUrl();
  const agripassUrl = `${AGRIPASS_BASE_URL}/?dest=${destCode}&cat=${agripassCategory}&tech=${encodeURIComponent(targetTech)}&commodity=${encodeURIComponent(currentTech.targetCrop || currentTech.crop || '')}`;

  // ── SYNCHRONIZED CACHE LAYER ──
  const sessionKey = `agri_reg_${(targetCountry || '').trim().toLowerCase()}__${(resolvedCategoryForApi || '').trim().toLowerCase()}__${(targetTech || '').trim().toLowerCase().replace(/\s+/g, '_')}`;

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
    if (cachedPathway?.payloadData && cachedPathway.technology === targetTech) return cachedPathway.payloadData;
    if (cachedFromSession?.payloadData && cachedFromSession.technology === targetTech) return cachedFromSession.payloadData;
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
          subCategory: currentTech.recommendedSystem || currentTech.machineryCategory || currentTech.fertilizerCategory || currentTech.chemicalType,
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

  const similarRegData = data?.similarRegulations || data?.data?.similarRegulations;

  return (
    <div className="mx-auto max-w-350 px-14 py-10">
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[2.25rem] font-bold leading-tight tracking-tight text-ink">
            Regulatory Dossier & Statutory Clearance Pathway
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-muted">
            Statutory approvals, pre-shipment compliance certificates, local adaptation trials, and import clearances required in {targetCountry}.
          </p>
        </div>

        {/* ── AGRIPASS JUMP BUTTON (TOP RIGHT) ── */}
        {ready && (
          <a
            href={agripassUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md cursor-pointer shrink-0"
            title={`Open ${targetTech} in AgriPass for ${targetCountry}`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Open in AgriPass Dossier</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>
        )}
      </div>

      {/* ── AGRIPASS SYNC ACTION BANNER ── */}
      {ready && !loading && (
        <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  AgriPass Compliant Document Pipeline
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-900">
                  {agripassCategory.toUpperCase()} • {destCode}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Generate pre-filled import permits, phytosanitary declarations, and customs dossier templates for <strong>{targetTech}</strong> in <strong>{targetCountry}</strong>.
              </p>
            </div>
          </div>

          <a
            href={agripassUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-xs hover:bg-emerald-50 transition"
          >
            <span>Launch AgriPass Hub</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {ready ? (
        loading ? (
          <RegulatoryAnalysisLoading
            technologyName={targetTech}
            countryName={targetCountry}
            category={loadingCategory}
          />
        ) : (
          <>
            {isIrrigation ? (
              <IrrigationRegulatoryView
                data={data}
                meta={data?.meta}
                loading={loading}
              />
            ) : isMachinery ? (
              <MachineryRegulatoryView data={data} meta={data?.meta} loading={loading} />
            ) : isBio ? (
              <BioRegulatoryView data={data} meta={data?.meta} loading={loading} />
            ) : isCropProtection ? (
              <CropProtectionRegulatoryView data={data} meta={data?.meta} loading={loading} />
            ) : isFertilizer ? (
              <FertilizerRegulatoryView
                data={data}
                meta={data?.meta}
                loading={loading}
                selectedProduct={activeFertilizerProduct}
              />
            ) : (
              <SeedRegulatoryView
                data={data || {}}
                meta={data?.meta}
                loading={loading}
                selectedVariety={targetTech}
              />
            )}

            {/* ── SHARED REGULATORY BENCHMARK & CERTIFICATIONS ── */}
            <SimilarRegulationsView data={similarRegData} countryName={targetCountry} />
          </>
        )
      ) : (
        <StepLockedNotice
          message="Complete Technology Details and Target Markets first — regulatory pathways require technology categorization and target country."
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
          disabled={!ready || loading}
          className="flex items-center gap-2 rounded-sm bg-brand pl-6 pr-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          Continue to Go-to-Market Plan
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}