import type { TechRegistryItem } from './types';

export const TECH_REGISTRY: TechRegistryItem[] = [
  // Seeds & Varieties
  {key:'nano_urea',       cat:'chemical',    label:'IFFCO Nano Urea Liquid Foliar (500ml)'},
  {key:'nano_dap',        cat:'chemical',    label:'IFFCO Nano DAP Liquid Foliar (500ml)'},
  {key:'pusa_wheat',      cat:'seeds',       label:'ICAR-IARI Pusa HD Wheat Variety'},
  {key:'icrisat_sorghum', cat:'seeds',       label:'ICRISAT CSV-20 Drought-Tolerant Sorghum'},
  {key:'icrisat_pearl_millet',cat:'seeds',   label:'ICRISAT ICMH-356 Pearl Millet Hybrid'},
  {key:'embrapa_soy',     cat:'seeds',       label:'EMBRAPA BR-16 Tropical Soybean Package'},
  {key:'sri',             cat:'seeds',       label:'SRI Rice Intensification Protocol + AWD'},
  // Biological
  {key:'rhizobium',       cat:'bio',         label:'IFFCO Rhizobium TAL-620 Biofertilizer'},
  {key:'mycorrhiza',      cat:'bio',         label:'VAM Mycorrhiza (Glomus intraradices)'},
  {key:'fusicont',        cat:'bio',         label:'FUSICONT Biofungicide (Trichoderma)'},
  {key:'pusa_decomposer', cat:'bio',         label:'ICAR Pusa Decomposer Capsules'},
  // Fertilizers
  // Irrigation
  {key:'drip',            cat:'irrigation',  label:'Jain Drip Micro-Irrigation (0.1–5ha)'},
  {key:'awd_kit',         cat:'irrigation',  label:'AWD Alternate Wetting & Drying Kit'},
  // Solar & Equipment
  {key:'solar',           cat:'solar',       label:'Shakti Solar Pump 1HP DC Submersible'},
  {key:'solar_dryer',     cat:'solar',       label:'ICAR-CIPHET Solar Tunnel Dryer'},
  {key:'happy_seeder',    cat:'equipment',   label:'ICAR-CIAE Turbo Happy Seeder (Zero-till)'},
  // Storage
  {key:'hermetic',        cat:'storage',     label:'GrainPro PICS Hermetic Bags (100kg)'},
  {key:'cold_chain',      cat:'storage',     label:'EcoZen Chill Biomass Cold Storage'},
  // Livestock & Animal Health
  {key:'fmd',             cat:'livestock',   label:'FMD Trivalent Vaccine (O, A, Asia-1)'},
  {key:'preg_d',          cat:'livestock',   label:'Preg-D Pregnancy Diagnosis Kit (Cattle)'},
  {key:'wssv_kit',        cat:'livestock',   label:'ICAR-CIBA WSSV Rapid Detection Kit (Shrimp)'},
  // Digital
  {key:'digital',         cat:'digital',     label:'CropIn SmartFarm AI Advisory Platform'},
  {key:'farmonaut',       cat:'digital',     label:'Farmonaut Satellite Farm Monitoring'},
  {key:'hello_tractor',   cat:'digital',     label:'Hello Tractor Machinery Booking Platform'},
];
