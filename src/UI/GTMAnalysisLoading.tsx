import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

export type GtmCategory = 'fertilizer' | 'protection' | 'seeds' | 'bio' | 'machinery' | 'general';

interface LoadingProps {
  technologyName?: string;
  countryName?: string;
  category?: GtmCategory;
}

// 1. Fertilizers & Plant Nutrients
const fertilizerSteps = [
  'Mapping regional fertilizer blending hubs & apex cooperative unions...',
  'Aligning bulk port logistics & dry-warehousing storage milestones...',
  'Evaluating soil-test farmer demonstration plot locations...',
  'Structuring agro-dealer commercial credit & consignment terms...',
  'Finalizing 90-Day Fertilizer Commercial Rollout Blueprint...'
];

// 2. Crop Protection & Agrochem
const cropProtectionSteps = [
  'Mapping high-pressure pest corridors & target cropping basins...',
  'Structuring dangerous goods warehousing & certified distributor network...',
  'Formulating spray service provider stewardship & PPE bootcamps...',
  'Connecting national food security & crop protection funding facilities...',
  'Finalizing 90-Day Agrochemical Market Execution Blueprint...'
];

// 3. Seeds & Varieties
const seedSteps = [
  'Mapping high-potential cereal & legume agro-ecological zones...',
  'Aligning pre-season seed multiplication & outgrower agreements...',
  'Structuring farmer field school demonstration & variety adoption pilots...',
  'Connecting AGRA / donor seed commercialization funding windows...',
  'Finalizing 90-Day Seed Variety Market Launch Blueprint...'
];

// 4. Biological Inputs & Bio-stimulants
const bioInputsSteps = [
  'Mapping progressive commercial growers & regenerative agriculture clusters...',
  'Establishing climate-controlled cold chain distribution routes...',
  'Structuring side-by-side fertilizer substitution demonstration trials...',
  'Connecting climate-smart agriculture & soil resilience grants...',
  'Finalizing 90-Day Biological Input Commercialization Blueprint...'
];

// 5. Farm Machinery & Equipment
const machinerySteps = [
  'Mapping high-acreage commercial farming hubs & river basin authorities...',
  'Establishing central PDI uncrating hub & spare parts inventory depot...',
  'Negotiating tractor asset-financing & custom hiring center (CHC) leases...',
  'Organizing certified technician & operator training bootcamps...',
  'Finalizing 90-Day Farm Machinery Commercialization Blueprint...'
];

const STEPS_MAP: Record<GtmCategory, string[]> = {
  fertilizer: fertilizerSteps,
  protection: cropProtectionSteps,
  seeds: seedSteps,
  bio: bioInputsSteps,
  machinery: machinerySteps,
  general: seedSteps
};

export default function GTMAnalysisLoading({
  technologyName = 'Technology',
  countryName = 'Target Market',
  category = 'general'
}: LoadingProps) {
  const processingSteps = STEPS_MAP[category] || STEPS_MAP.general;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    setCurrentStepIndex(0);
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < processingSteps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [category, processingSteps.length]);

  return (
    <div className="flex min-h-[460px] w-full flex-col items-center justify-center rounded-2xl border border-line bg-paper/60 p-8 shadow-sm backdrop-blur-sm">
      {/* Animated AI Radar / Orb Icon */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <div className="absolute h-full w-full animate-ping rounded-full bg-brand/10 duration-1000" />
        <div className="absolute h-16 w-16 animate-pulse rounded-full bg-brand/20" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-md">
          <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>

      {/* Main Heading */}
      <h3 className="text-lg font-semibold text-ink">
        Synthesizing 90-Day Commercialization Roadmap
      </h3>
      <p className="mt-1 text-sm text-muted">
        Generating market entry strategy for <span className="font-medium text-ink">{technologyName}</span> in{' '}
        <span className="font-medium text-ink">{countryName}</span>
      </p>

      {/* Rotating Status Step */}
      <div className="mt-6 flex items-center space-x-2 rounded-full border border-line bg-cream px-4 py-1.5 shadow-inner">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
        </span>
        <span className="text-xs font-medium text-ink transition-all duration-300">
          {processingSteps[currentStepIndex]}
        </span>
      </div>

      {/* Progress Bar Indicators */}
      <div className="mt-8 grid w-full max-w-xs grid-cols-5 gap-1.5">
        {processingSteps.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              idx <= currentStepIndex ? 'bg-brand' : 'bg-line'
            )}
          />
        ))}
      </div>
    </div>
  );
}