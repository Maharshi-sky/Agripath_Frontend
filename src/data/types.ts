export interface CountryOption {
  f: string;
  n: string;
  r: string;
}

export interface TechExample {
  type: string;
  name: string;
  company: string;
  origin: string;
  desc: string;
  crop: string;
  
  // Seeds & Varieties
  cropType?: string;
  seedType?: string;
  varietyType?: string;
  varietyName?: string;
  varietyCode?: string;
  releaseYear?: string;
  maturityRange?: string;
  expectedYield?: string;
  diseaseProtection?: string;
  originRegion?: string;
  varietyDesc?: string;

  // Fertilizers & Plant Nutrients
  fertilizerCategory?: string;
  fertilizerType?: string;
  npkGrade?: string;
  nutrientRatio?: string;
  secondaryNutrients?: string;
  microNutrients?: string;
  applicationMethod?: string;
  physicalForm?: string;

  // Crop Protection & Agrochem
  protectionCategory?: string;
  targetPest?: string;
  activeIngredient?: string;
  formulationType?: string;
  modeOfAction?: string;
  recommendedDosage?: string;
  productCategory?: string;
  originType?: string;
  manufacturingCompany?: string;
  brandProductName?: string;

  // Biological Inputs
  inputCategory?: string;
  keyBenefits?: string;

  // Machinery & Equipment
  machineryCategory?: string;
  productType?: string;
  equipmentName?: string;
  otherDetails?: string;

  // Common Fields
  yield: string;
  method: string;
  regstatus: string;
  approx_unit_price_inr: string;
  model: string;
  context: string;
}

export type TechExamples = Record<string, TechExample>;

export interface ZoneTechScores {
  seeds?: number;
  bio?: number;
  fertilizers?: number; // 👈 Separated
  protection?: number;  // 👈 Separated
  chemical?: number;    // Backward compatibility if needed
  irrigation?: number;
  equipment?: number;
  solar?: number;
  digital?: number;
  livestock?: number;
  aquaculture?: number;
  storage?: number;
  finance?: number;
  other?: number;
}

export interface AgroZone {
  id: string;
  name: string;
  fao: string;
  rain: string;
  temp: string;
  soil: string;
  elev: string;
  crops: string;
  water: string;
  techs: ZoneTechScores;
  notes: string;
}

export interface CountryZoneData {
  zones: AgroZone[];
  reg: Record<string, string>;
}

export type ZoneDb = Record<string, CountryZoneData>;

export interface RegPathwayEntry {
  agency?: string;
  steps?: string;
  timeline?: string;
  fees?: string;
  docs?: string;
  hs?: string;
  fasttrack?: string;
  avoid?: string;
  structure?: string;
}

export type RegFull = Record<string, Record<string, RegPathwayEntry>>;

export interface TechRegistryItem {
  key: string;
  cat: string;
  label: string;
}

export type TechType =
  | 'seeds'
  | 'bio'
  | 'fertilizers' // 👈 Separated
  | 'protection'  // 👈 Separated
  | 'chemical'
  | 'irrigation'
  | 'equipment'
  | 'solar'
  | 'digital'
  | 'livestock'
  | 'aquaculture'
  | 'storage'
  | 'finance'
  | 'other';