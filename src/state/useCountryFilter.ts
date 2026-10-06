import { useMemo, useState } from 'react';
import { COUNTRIES } from '../data/countries';
import type { CountryOption } from '../data/types';

export const REGIONS = [
  'East Africa',
  'West Africa',
  'Southern Africa',
  'Central Africa',
  'North Africa',
  'Island States',
  'South Asia',
  'Southeast Asia',
  'Central Asia',
] as const;

export function useCountryFilter() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string>('all');

  const filtered = useMemo<CountryOption[]>(() => {
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter((c) => {
      const matchesRegion = region === 'all' || c.r === region;
      const matchesQuery = !q || c.n.toLowerCase().includes(q) || c.r.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [query, region]);

  return { query, setQuery, region, setRegion, filtered };
}
