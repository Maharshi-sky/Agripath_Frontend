// src/state/wizardStore.tsx
import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { TechExample } from '../data/types';
import { TECH_EXAMPLES } from '../data/techExamples';
import { TECH_REGISTRY } from '../data/techRegistry';

export interface TechFormState extends TechExample {
  [x: string]: any;
  // Fertilizer & Nutrients
  fertilizerCategory?: string;
  fertilizerType?: string;
  npkGrade?: string;
  nutrientRatio?: string;
  secondaryNutrients?: string;
  microNutrients?: string;
  applicationMethod?: string;
  physicalForm?: string;
  price?: string;

  // Crop Protection & Agrochem
  protectionCategory?: string;
  chemicalType?: string;
  targetPest?: string;
  activeIngredient?: string;
  formulationType?: string;
  modeOfAction?: string;
  recommendedDosage?: string;
  productCategory?: string;
  originType?: string;
  manufacturingCompany?: string;
  brandProductName?: string;

  // Bio-Inputs
  inputCategory?: string;
  keyBenefits?: string;

  // Machinery
  machineryCategory?: string;
  productType?: string;
  equipmentName?: string;
  otherDetails?: string;

  // Irrigation & Water Regimen (Added for dynamic 60-crops auto-fill)
  targetCrop?: string;
  cropCategory?: string;
  minWaterMmDay?: number | string;
  maxWaterMmDay?: number | string;
  avgWaterMmDay?: number | string;
  volumetricDemand?: string;
  criticalStage?: string;
  recommendedSystem?: string;
  agronomicNotes?: string;
  waterRequirementDetails?: string;
}

export const EMPTY_TECH: TechFormState = {
  type: 'seeds',
  name: '',
  company: '',
  origin: 'India',
  desc: '',
  price: '',
  crop: '',

  // Seeds & Varieties
  cropType: '',
  seedType: '',
  varietyType: '',
  varietyName: '',
  varietyCode: '',
  releaseYear: '',
  maturityRange: '',
  expectedYield: '',
  diseaseProtection: '',
  originRegion: '',
  varietyDesc: '',

  // Fertilizers & Nutrients
  fertilizerCategory: '',
  fertilizerType: '',
  npkGrade: '',
  nutrientRatio: '',
  secondaryNutrients: '',
  microNutrients: '',
  applicationMethod: '',
  physicalForm: '',

  // Crop Protection & Agrochem
  protectionCategory: '',
  chemicalType: '',
  targetPest: '',
  activeIngredient: '',
  formulationType: '',
  modeOfAction: '',
  recommendedDosage: '',
  productCategory: '',
  originType: '',
  manufacturingCompany: '',
  brandProductName: '',

  // Bio-Inputs
  inputCategory: '',
  keyBenefits: '',

  // Machinery
  machineryCategory: '',
  productType: '',
  equipmentName: '',
  otherDetails: '',

  // Irrigation & Water Regimen
  targetCrop: '',
  cropCategory: '',
  minWaterMmDay: '',
  maxWaterMmDay: '',
  avgWaterMmDay: '',
  volumetricDemand: '',
  criticalStage: '',
  recommendedSystem: '',
  agronomicNotes: '',
  waterRequirementDetails: '',

  // Common
  yield: '',
  method: '',
  regstatus: 'fully registered and commercialised',
  approx_unit_price_inr: '',
  model: 'Distribution rights',
  context: '',
};

export const MAX_COUNTRIES = 5;
export const TOTAL_STEPS = 5;

export interface WizardState {
  techCategory: string;
  techKey: string;
  tech: TechFormState;
  countries: string[];
  stepComplete: Record<number, boolean>;
  matchDone: boolean;
  regDone: boolean;
  gtmDone: boolean;
  // Selected Live Detailed Data
  selectedMatchResult: any | null;
  selectedRegulatoryPathway: any | null;
}

const defaultInitialState: WizardState = {
  techCategory: 'all',
  techKey: '',
  tech: EMPTY_TECH,
  countries: [],
  stepComplete: {},
  matchDone: false,
  regDone: false,
  gtmDone: false,
  selectedMatchResult: null,
  selectedRegulatoryPathway: null,
};

const CATEGORY_NAME_FIELD: Partial<Record<string, keyof TechFormState>> = {
  seeds: 'varietyName',
  fertilizers: 'name',
  protection: 'name',
  chemical: 'name',
  bio: 'brandProductName',
  equipment: 'equipmentName',
  machinery: 'equipmentName',
  irrigation: 'targetCrop',
  water: 'targetCrop'
};

const CATEGORY_NAME_ERROR: Partial<Record<string, string>> = {
  seeds: 'Please enter a variety name.',
  fertilizers: 'Please enter a fertilizer product brand name.',
  protection: 'Please enter a product / brand name.',
  chemical: 'Please select a brand / product name.',
  bio: 'Please select a product name.',
  equipment: 'Please enter an equipment name.',
  machinery: 'Please enter an equipment name.',
  irrigation: 'Please select a target crop for irrigation calculation.',
  water: 'Please select a target crop for water requirement.'
};

function effectiveTechName(tech: TechFormState, category: string): string {
  const cat = (category || '').toLowerCase();
  const field = CATEGORY_NAME_FIELD[cat];
  const val = field ? (tech[field] as string) : tech.name;
  return (
    val ||
    tech.targetCrop ||
    tech.name ||
    tech.chemicalType ||
    tech.protectionCategory ||
    tech.varietyName ||
    tech.brandProductName ||
    tech.equipmentName
  )?.trim() ?? '';
}

type Action =
  | { type: 'SET_TECH'; tech: Partial<TechFormState> }
  | { type: 'SET_TECH_FIELD'; field: keyof TechFormState; value: any }
  | { type: 'SET_TECH_CATEGORY'; category: string }
  | { type: 'LOAD_EXAMPLE'; key: string }
  | { type: 'COMPLETE_STEP_1'; name: string }
  | { type: 'COMPLETE_STEP'; step: number }
  | { type: 'TOGGLE_COUNTRY'; country: string }
  | { type: 'MARK_MATCH_DONE'; result?: any }
  | { type: 'SET_SELECTED_MATCH'; result: any }
  | { type: 'MARK_REG_DONE'; result?: any }
  | { type: 'SET_SELECTED_REG'; result: any }
  | { type: 'MARK_GTM_DONE' }
  | { type: 'RESET_RESULTS' }
  | { type: 'START_OVER' }
  | {
      type: 'LOAD_SAVED_REPORT';
      payload: { 
        tech: TechFormState; 
        techCategory?: string; 
        countries: string[];
        matchResult?: any;
        regulatoryPathway?: any;
      };
    };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'SET_TECH': {
      const updatedTech = { ...state.tech, ...action.tech };
      return {
        ...state,
        tech: updatedTech,
        stepComplete: { ...state.stepComplete, 1: true },
      };
    }

    case 'SET_TECH_FIELD': {
      const updatedTech = { ...state.tech, [action.field]: action.value };
      return {
        ...state,
        tech: updatedTech,
        stepComplete: { ...state.stepComplete, 1: true },
      };
    }

    case 'SET_TECH_CATEGORY':
      return {
        ...state,
        techCategory: action.category,
        techKey: '',
        tech: {
          ...EMPTY_TECH,
          type: action.category,
        },
        stepComplete: { ...state.stepComplete, 1: false },
        selectedMatchResult: null,
        selectedRegulatoryPathway: null,
      };

    case 'LOAD_EXAMPLE': {
      const example = TECH_EXAMPLES[action.key];
      if (!example) return state;
      return {
        ...state,
        techKey: action.key,
        techCategory: example.type,
        tech: { ...EMPTY_TECH, ...example },
        stepComplete: { ...state.stepComplete, 1: true },
        matchDone: false,
        regDone: false,
        gtmDone: false,
        selectedMatchResult: null,
        selectedRegulatoryPathway: null,
      };
    }

    case 'COMPLETE_STEP_1':
      return {
        ...state,
        tech: { ...state.tech, name: action.name },
        stepComplete: { ...state.stepComplete, 1: true },
        matchDone: false,
        regDone: false,
        gtmDone: false,
      };

    case 'COMPLETE_STEP':
      return { ...state, stepComplete: { ...state.stepComplete, [action.step]: true } };

    case 'TOGGLE_COUNTRY': {
      const has = state.countries.includes(action.country);
      const updatedCountries = has
        ? state.countries.filter((c) => c !== action.country)
        : state.countries.length >= MAX_COUNTRIES
        ? state.countries
        : [...state.countries, action.country];

      return {
        ...state,
        countries: updatedCountries,
        stepComplete: { ...state.stepComplete, 2: updatedCountries.length > 0 },
      };
    }

    case 'MARK_MATCH_DONE':
      return { 
        ...state, 
        matchDone: true, 
        stepComplete: { ...state.stepComplete, 3: true },
        ...(action.result ? { selectedMatchResult: action.result } : {})
      };

    case 'SET_SELECTED_MATCH':
      return {
        ...state,
        selectedMatchResult: action.result,
        matchDone: true,
        stepComplete: { ...state.stepComplete, 3: true },
      };

    case 'MARK_REG_DONE':
      return { 
        ...state, 
        regDone: true, 
        stepComplete: { ...state.stepComplete, 4: true },
        ...(action.result ? { selectedRegulatoryPathway: action.result } : {})
      };

    case 'SET_SELECTED_REG':
      return {
        ...state,
        selectedRegulatoryPathway: action.result,
        regDone: true,
        stepComplete: { ...state.stepComplete, 4: true },
      };

    case 'MARK_GTM_DONE':
      return { ...state, gtmDone: true, stepComplete: { ...state.stepComplete, 5: true } };

    case 'RESET_RESULTS':
      return { 
        ...state, 
        matchDone: false, 
        regDone: false, 
        gtmDone: false, 
        selectedMatchResult: null, 
        selectedRegulatoryPathway: null 
      };

    case 'START_OVER':
      return defaultInitialState;

    case 'LOAD_SAVED_REPORT':
      return {
        ...state,
        tech: action.payload.tech,
        techCategory: action.payload.techCategory || action.payload.tech.type || 'seeds',
        countries: action.payload.countries,
        stepComplete: { 1: true, 2: true, 3: true, 4: true, 5: true },
        matchDone: true,
        regDone: true,
        gtmDone: true,
        selectedMatchResult: action.payload.matchResult || null,
        selectedRegulatoryPathway: action.payload.regulatoryPathway || null,
      };

    default:
      return state;
  }
}

export interface NextStepResult {
  ok: boolean;
  error?: string;
}

interface WizardContextValue {
  state: WizardState;
  setTech: (tech: Partial<TechFormState>) => void;
  updateTech: (tech: Partial<TechFormState>) => void; // Alias for seamless compatibility
  setTechField: (field: keyof TechFormState, value: any) => void;
  setTechCategory: (category: string) => void;
  loadExample: (key: string) => void;
  toggleCountry: (country: string) => NextStepResult;
  nextFromStep1: () => NextStepResult;
  nextFromStep2: () => NextStepResult;
  advanceFromStep: (step: number) => NextStepResult;
  markMatchDone: (result?: any) => void;
  setSelectedMatch: (result: any) => void;
  markRegDone: (result?: any) => void;
  setSelectedReg: (result: any) => void;
  markGtmDone: () => void;
  startOver: () => void;
  loadSavedReport: (payload: { 
    tech: TechFormState; 
    techCategory?: string; 
    countries: string[];
    matchResult?: any;
    regulatoryPathway?: any;
  }) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultInitialState);

  const setTech = useCallback(
    (tech: Partial<TechFormState>) => dispatch({ type: 'SET_TECH', tech }),
    [],
  );

  const updateTech = setTech; // Alias for seamless component calls

  const setTechField = useCallback(
    (field: keyof TechFormState, value: any) => dispatch({ type: 'SET_TECH_FIELD', field, value }),
    [],
  );

  const setTechCategory = useCallback(
    (category: string) => dispatch({ type: 'SET_TECH_CATEGORY', category }),
    [],
  );

  const loadExample = useCallback((key: string) => dispatch({ type: 'LOAD_EXAMPLE', key }), []);

  const toggleCountry = useCallback(
    (country: string): NextStepResult => {
      if (!state.countries.includes(country) && state.countries.length >= MAX_COUNTRIES) {
        return { ok: false, error: `Max ${MAX_COUNTRIES} countries per analysis.` };
      }
      dispatch({ type: 'TOGGLE_COUNTRY', country });
      return { ok: true };
    },
    [state.countries],
  );

  const nextFromStep1 = useCallback((): NextStepResult => {
    const name = effectiveTechName(state.tech, state.techCategory);
    if (!name) {
      return { ok: false, error: CATEGORY_NAME_ERROR[state.techCategory] ?? 'Please complete technology details.' };
    }
    dispatch({ type: 'COMPLETE_STEP_1', name });
    return { ok: true };
  }, [state.tech, state.techCategory]);

  const nextFromStep2 = useCallback((): NextStepResult => {
    if (!state.countries.length) {
      return { ok: false, error: 'Select at least one country.' };
    }
    dispatch({ type: 'COMPLETE_STEP', step: 2 });
    return { ok: true };
  }, [state.countries.length]);

  const advanceFromStep = useCallback((step: number): NextStepResult => {
    dispatch({ type: 'COMPLETE_STEP', step });
    return { ok: true };
  }, []);

  const markMatchDone = useCallback((result?: any) => dispatch({ type: 'MARK_MATCH_DONE', result }), []);
  const setSelectedMatch = useCallback((result: any) => dispatch({ type: 'SET_SELECTED_MATCH', result }), []);
  const markRegDone = useCallback((result?: any) => dispatch({ type: 'MARK_REG_DONE', result }), []);
  const setSelectedReg = useCallback((result: any) => dispatch({ type: 'SET_SELECTED_REG', result }), []);
  const markGtmDone = useCallback(() => dispatch({ type: 'MARK_GTM_DONE' }), []);
  const startOver = useCallback(() => dispatch({ type: 'START_OVER' }), []);

  const loadSavedReport = useCallback(
    (payload: { 
      tech: TechFormState; 
      techCategory?: string; 
      countries: string[];
      matchResult?: any;
      regulatoryPathway?: any;
    }) => dispatch({ type: 'LOAD_SAVED_REPORT', payload }),
    [],
  );

  const value = useMemo<WizardContextValue>(
    () => ({
      state,
      setTech,
      updateTech,
      setTechField,
      setTechCategory,
      loadExample,
      toggleCountry,
      nextFromStep1,
      nextFromStep2,
      advanceFromStep,
      markMatchDone,
      setSelectedMatch,
      markRegDone,
      setSelectedReg,
      markGtmDone,
      startOver,
      loadSavedReport,
    }),
    [
      state,
      setTech,
      updateTech,
      setTechField,
      setTechCategory,
      loadExample,
      toggleCountry,
      nextFromStep1,
      nextFromStep2,
      advanceFromStep,
      markMatchDone,
      setSelectedMatch,
      markRegDone,
      setSelectedReg,
      markGtmDone,
      startOver,
      loadSavedReport,
    ],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within a WizardProvider');
  return ctx;
}

export function techRegistryForCategory(category: string) {
  return category === 'all'
    ? TECH_REGISTRY
    : TECH_REGISTRY.filter((t) => t.cat === category || (category === 'protection' && t.cat === 'chemical'));
}