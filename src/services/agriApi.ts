// src/services/agriApi.ts

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

const BASE_URL = isLocal
  ? 'http://localhost:5001/api'
  : 'https://agripath-backend.onrender.com/api';

// ==============================================================================
// 1. TYPES & INTERFACES
// ==============================================================================
export interface SeedQuery {
  crop?: string;
  state?: string;
  variety?: string;
}

export interface CropVarietyRecord {
  id?: number;
  'Crop Group': string;
  'Crop Name (English)': string;
  'Crop Name (Hindi)'?: string;
  'Crop Code'?: string;
  'Botanical / Scientific Name'?: string;
  'Variety Name': string;
  'Variety Code'?: string;
  'Variety / Hybrid Type'?: string;
  'Developed By'?: string;
  'Released By'?: string;
  'State of Release'?: string;
  'Year of Release'?: string;
  'Year of Introduction'?: string;
  'Season'?: string;
  'Is Notified'?: string;
  'Notification Date'?: string;
  'Notification Number'?: string;
  'Meeting Number'?: string;
  'Category / Traits'?: string;
  'Recommended States'?: string;
  'Agro-Ecological Regions'?: string;
  'Yield Range (Qt/Ha)'?: string;
  'Climate Resilience'?: string;
  'Disease Resistance'?: string;
  'Insect/Pest Tolerance'?: string;
  'Maturity Type'?: string;
  'Maturity Duration (Days)'?: string;
  'Maturity Days (From)'?: string;
  'Maturity Days (To)'?: string;
  'GI Tagged'?: string;
  'IP Protected'?: string;
  'Country of Origin'?: string;
  'Description'?: string;
}

export interface MatchScorePayload {
  category: string;
  technology: string;
  country: string;
  recommendedStates?: string;
  originRegion?: string;
}

export interface BioMatchPayload {
  country: string;
  technology: string;
  category?: string;
}

export interface MachineryMatchPayload {
  country: string;
  technology?: string;
  productType?: string;
  machineryCategory?: string;
  company?: string;
  power?: string | number;
}

export interface RegulatoryPathwayPayload {
  category?: string;
  selectedCategory?: string;
  technology?: string;
  techType?: string;
  country: string;
  subCategory?: string;
  nutrientType?: string;
}

// ==============================================================================
// 2. AGRI API SERVICE METHODS
// ==============================================================================
export const agriApi = {
  // 1. Health Check
  checkHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      console.error('Health check failed:', err);
      return { status: 'offline' };
    }
  },

  // 2. Fetch Seeds / Certified Seeds
  getSeeds: async (query: SeedQuery = {}) => {
    try {
      const params = new URLSearchParams();
      if (query.crop) params.append('crop', query.crop);
      if (query.state) params.append('state', query.state);
      if (query.variety) params.append('variety', query.variety);

      const res = await fetch(`${BASE_URL}/seeds?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch seeds');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // 3. Unique Crop Groups
  getCropGroups: async (): Promise<string[]> => {
    try {
      const res = await fetch(`${BASE_URL}/crops/groups`);
      if (!res.ok) throw new Error('Failed to fetch crop groups');
      return await res.json();
    } catch (err) {
      console.error('Error fetching crop groups:', err);
      return [];
    }
  },

  // 4. Crop Names by Group
  getCropsByGroup: async (cropGroup: string): Promise<string[]> => {
    try {
      const res = await fetch(`${BASE_URL}/crops/names?group=${encodeURIComponent(cropGroup)}`);
      if (!res.ok) throw new Error('Failed to fetch crops');
      return await res.json();
    } catch (err) {
      console.error('Error fetching crops by group:', err);
      return [];
    }
  },

  // 5. Variety Names by Crop
  getVarietiesByCrop: async (cropName: string): Promise<string[]> => {
    try {
      const res = await fetch(`${BASE_URL}/crops/varieties?crop=${encodeURIComponent(cropName)}`);
      if (!res.ok) throw new Error('Failed to fetch varieties');
      return await res.json();
    } catch (err) {
      console.error('Error fetching varieties by crop:', err);
      return [];
    }
  },

  // 6. Selected Variety Full Details
  getVarietyDetails: async (varietyName: string, cropName?: string): Promise<CropVarietyRecord | null> => {
    try {
      const params = new URLSearchParams({ variety: varietyName });
      if (cropName) params.append('crop', cropName);
      const res = await fetch(`${BASE_URL}/crops/details?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch variety details');
      return await res.json();
    } catch (err) {
      console.error('Error fetching variety details:', err);
      return null;
    }
  },

  // 7. Seed & Generic Agro-climatic Match Score
  getMatchScore: async (payload: MatchScorePayload) => {
    try {
      let res = await fetch(`${BASE_URL}/match-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch(`${BASE_URL}/match/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Error fetching seed match score:', err);
      return null;
    }
  },

  // 8. Biological Input Match Engine
  getBioMatchScore: async (payload: BioMatchPayload) => {
    try {
      let res = await fetch(`${BASE_URL}/bio-inputs/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch(`${BASE_URL}/bio-match-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP Error ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.error('Error fetching biological match score:', err);
      throw err;
    }
  },

  // 9. Fertilizer Helpers & Match Engine
  getFertilizerCategories: async () => {
    try {
      const res = await fetch(`${BASE_URL}/fertilizer/categories`);
      if (!res.ok) throw new Error('Failed to fetch fertilizer categories');
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.error('Error fetching fertilizer categories:', err);
      return [];
    }
  },

  getFertilizerProducts: async (category: string) => {
    try {
      const res = await fetch(`${BASE_URL}/fertilizer/products?category=${encodeURIComponent(category)}`);
      if (!res.ok) throw new Error('Failed to fetch fertilizer products');
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.error('Error fetching fertilizer products:', err);
      return [];
    }
  },

  getFertilizerMatch: async (payload: { country: string; category?: string; productName?: string }) => {
    try {
      const res = await fetch(`${BASE_URL}/fertilizer/calculate-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to calculate fertilizer match');
      return await res.json();
    } catch (err) {
      console.error('Error in fertilizer match calculation:', err);
      return null;
    }
  },

  // 10. Machinery Match Engine (Calculates AI implement draft & zone fit)
  getMachineryMatch: async (payload: MachineryMatchPayload) => {
    try {
      let res = await fetch(`${BASE_URL}/machinery/calculate-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch(`${BASE_URL}/match/machinery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend machinery match calculation fallback to spec heuristics:', err);
      return null;
    }
  },

  // 11. Regulatory Pathway (Live Master DB / AI)
  getRegulatoryPathway: async (payload: RegulatoryPathwayPayload) => {
    try {
      let res = await fetch(`${BASE_URL}/regulatory/pathway`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch(`${BASE_URL}/regulatory-pathway`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      // Safe fallback for machinery direct controller route
      if (res.status === 404 && payload.category === 'machinery') {
        res = await fetch(`${BASE_URL}/machinery/regulatory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP Error ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.error('Error fetching regulatory pathway:', err);
      throw err;
    }
  },

  // 12. Monitored Government Portals
  getRegulatorySources: async (priority: string = '') => {
    try {
      const url = priority
        ? `${BASE_URL}/regulatory/sources?priority=${priority}`
        : `${BASE_URL}/regulatory/sources`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error('Error fetching regulatory sources:', err);
      return [];
    }
  },

  // 13. Live Policy Records
  getRegulatoryUpdates: async (reviewNeeded: boolean = false) => {
    try {
      const url = reviewNeeded
        ? `${BASE_URL}/regulatory/updates?review_needed=true`
        : `${BASE_URL}/regulatory/updates`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error('Error fetching regulatory updates:', err);
      return [];
    }
  },

  // 14. Vendor Recommendations
  getVendorRecommendations: async (latitude: number, longitude: number, crop: string) => {
    try {
      const res = await fetch(`${BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, crop }),
      });
      return await res.json();
    } catch (err) {
      console.error('Error fetching vendor recommendations:', err);
      return null;
    }
  },

  // 15. Seed Country Recommendations (80%+ Alternative Markets)
getSeedRecommendations: async (payload: { tech: any; currentCountry: string }) => {
    try {
      const res = await fetch(`${BASE_URL}/recommendations/seed-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Error fetching seed recommendations:', err);
      return { success: false, recommendations: [] };
    }
  },
};


// ==============================================================================
// 3. AUXILIARY STANDALONE EXPORTS
// ==============================================================================

// Crop Protection Dropdown Fetchers
export const fetchCropProtectionChemicalTypes = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${BASE_URL}/crop-protection/chemical-types`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.success ? json.data : json.data || [];
  } catch (err) {
    console.error('Error fetching chemical types:', err);
    return [];
  }
};

export const getCropProtectionChemicalTypes = fetchCropProtectionChemicalTypes;

// Bio Inputs Step 1 Dropdowns
export const getBioCropTypes = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${BASE_URL}/bio-inputs/crops`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching bio crop types:', err);
    return [];
  }
};

export const getBioCategories = async (cropType?: string): Promise<string[]> => {
  try {
    const url = cropType 
      ? `${BASE_URL}/bio-inputs/categories?crop_type=${encodeURIComponent(cropType)}` 
      : `${BASE_URL}/bio-inputs/categories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching bio categories:', err);
    return [];
  }
};

export const getBioCompanies = async (cropType?: string, category?: string): Promise<string[]> => {
  try {
    const params = new URLSearchParams();
    if (cropType) params.append('crop_type', cropType);
    if (category) params.append('category', category);
    const res = await fetch(`${BASE_URL}/bio-inputs/companies?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching bio companies:', err);
    return [];
  }
};

export const getBioProducts = async (cropType?: string, category?: string, company?: string): Promise<any[]> => {
  try {
    const params = new URLSearchParams();
    if (cropType) params.append('crop_type', cropType);
    if (category) params.append('category', category);
    if (company) params.append('company', company);
    const res = await fetch(`${BASE_URL}/bio-inputs/products?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching bio products:', err);
    return [];
  }
};

// Farm Machinery Endpoints
export const getMachineryCategories = async (type: string): Promise<string[]> => {
  try {
    const res = await fetch(`${BASE_URL}/machinery/categories?type=${encodeURIComponent(type || 'Machinery')}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching machinery categories:', err);
    return [];
  }
};

export const getMachineryProducts = async (type: string, category?: string, company?: string) => {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    if (company) params.append('company', company);

    const res = await fetch(`${BASE_URL}/machinery/products?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json || [];
  } catch (err) {
    console.error('Error fetching machinery products:', err);
    return [];
  }
};

export const getMachineryCompanies = async (type: string, category: string): Promise<string[]> => {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);

    const res = await fetch(`${BASE_URL}/machinery/companies?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching machinery companies:', err);
    return [];
  }
};

