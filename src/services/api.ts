const API_BASE_URL = 'http://localhost:5001/api';

export interface RecommendationPayload {
  latitude: number;
  longitude: number;
  crop: string;
}

export const getAgroRecommendations = async (payload: RecommendationPayload) => {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  return await response.json();
};

export const getMatchScore = async (category: string, technology: string, country: string) => {
  const response = await fetch(`${API_BASE_URL}/match-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, technology, country }),
  });

  return await response.json();
};

export const getRegulatoryPathway = async (category: string, technology: string, country: string) => {
  const response = await fetch(`${API_BASE_URL}/regulatory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, technology, country }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch regulatory pathway');
  }

  return await response.json();
};


export async function getFertilizerCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/fertilizers/categories`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('API error, using defaults:', err);
    return ['Primary Nutrients', 'Micronutrients', 'Water Soluble Fertilisers', 'Nano Fertilisers'];
  }
}

export async function fetchDbZones(country?: string) {
  try {
    const url = country 
      ? `${API_BASE_URL}/fertilizers/zones?country=${encodeURIComponent(country)}`
      : `${API_BASE_URL}/fertilizers/zones`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Zone fetch error:', err);
    return [];
  }
}

export async function fetchDbProducts(category?: string) {
  try {
    const url = category 
      ? `${API_BASE_URL}/fertilizers/products?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/fertilizers/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Product fetch error:', err);
    return [];
  }
}

export async function fetchAiFertilizerVerdict(payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/fertilizers/ai-verdict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI verdict fetch failed');
    const json = await res.json();
    return json;
  } catch (err) {
    return null;
  }
}

export async function calculateOllamaFertilizerMatch(zone: any, products: any[]) {
  try {
    const res = await fetch(`${API_BASE_URL}/fertilizers/calculate-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zone, products })
    });
    if (!res.ok) throw new Error('AI Match calculation failed');
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('Ollama API error:', err);
    return null;
  }
}

