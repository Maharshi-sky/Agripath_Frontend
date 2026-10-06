// src/components/SeedRecommendations.tsx
import { useState, useEffect } from 'react';
import { Globe2, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { agriApi } from '../services/agriApi';

interface ZoneItem {
  zoneName: string;
  rainfall: string;
  soilPh: string | number;
  soilTexture: string;
  score: number;
}

interface CountryRecommendation {
  country: string;
  zones: ZoneItem[];
}

interface SeedRecommendationsProps {
  currentCountry: string;
  bestCurrentMatchScore: number;
  techData: any;
}

export default function SeedRecommendations({
  currentCountry,
  bestCurrentMatchScore,
  techData,
}: SeedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<CountryRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [loadTimeMs, setLoadTimeMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBelowThreshold = bestCurrentMatchScore < 70;

  useEffect(() => {
    if (isBelowThreshold) {
      setIsExpanded(true);
    }
  }, [bestCurrentMatchScore, isBelowThreshold]);

  const fetchRecommendations = async () => {
    if (recommendations.length > 0 || loading) return;
    setLoading(true);
    setErrorMsg(null);
    const startClient = performance.now();
    console.log('[SeedRecommendations] Fetching recommendation analysis for country:', currentCountry);

    try {
      const res = await agriApi.getSeedRecommendations({
        tech: techData,
        currentCountry,
      });

      const endClient = Math.round(performance.now() - startClient);
      setLoadTimeMs(res?.executionTimeMs || endClient);

      if (res?.success) {
        console.log(`[SeedRecommendations] Loaded in ${endClient}ms. Results:`, res.recommendations);
        setRecommendations(res.recommendations || []);
      } else {
        console.warn('[SeedRecommendations] API returned unsuccess:', res);
        setErrorMsg('Failed to fetch recommendations from server.');
      }
    } catch (err: any) {
      console.error('[SeedRecommendations] API Call Error:', err);
      setErrorMsg(err.message || 'API request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isBelowThreshold) {
      fetchRecommendations();
    }
  }, [currentCountry, techData, isBelowThreshold]);

  const handleToggle = () => {
    if (!isExpanded && recommendations.length === 0) {
      fetchRecommendations();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-8 rounded-2xl border border-line bg-paper p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-ink">
              Recommendations
            </h3>
            <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-sm font-bold text-emerald-800">
              80%+ High Suitability
            </span>
            {loadTimeMs !== null && !loading && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-sm text-slate-600 border border-slate-200">
                <Clock className="h-3 w-3 text-slate-500" />
                {loadTimeMs}ms
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Alternative global markets where agroclimatic conditions exceed an 80% match for this seed variety.
          </p>
        </div>

        {!isBelowThreshold && (
          <button
            type="button"
            onClick={handleToggle}
            className="flex items-center gap-2 rounded-xl border border-line bg-cream/60 px-4 py-2 text-base font-semibold text-ink transition hover:bg-cream active:scale-95"
          >
            <Globe2 className="h-4 w-4 text-emerald-600" />
            <span>
              {isExpanded
                ? 'Hide Recommendations'
                : 'View Alternative High-Match Markets (80%+)'}
            </span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="rounded-xl border border-dashed border-emerald-300/80 bg-emerald-50/40 p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-medium text-base">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>Running recommendation analysis across global agroclimatic zones...</span>
              </div>
              <div className="mt-4 space-y-2 max-w-md mx-auto animate-pulse">
                <div className="h-3 bg-emerald-200/60 rounded-full w-3/4 mx-auto"></div>
                <div className="h-2.5 bg-emerald-200/40 rounded-full w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-center text-base text-rose-700">
              {errorMsg}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-xl border border-line/60 bg-cream/20 p-4 text-center text-base text-muted">
              No alternative countries found with matching score exceeding 80% for this variety.
            </div>
          ) : (
            recommendations.map((rec, cIdx) => (
              <div
                key={cIdx}
                className="overflow-hidden rounded-xl border border-line/80 bg-cream/10"
              >
                <div className="flex items-center justify-between bg-cream/40 px-4 py-3 border-b border-line/60">
                  <div className="flex items-center gap-2 font-semibold text-base text-ink">
                    <Globe2 className="h-4 w-4 text-emerald-700" />
                    <span>Country {cIdx + 1}: {rec.country}</span>
                  </div>
                  <span className="text-base text-muted">
                    {rec.zones.length} {rec.zones.length === 1 ? 'Zone' : 'Zones'} matched (80%+)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-left text-sm">
                    <thead className="border-b border-line/60 bg-cream/20 text-muted uppercase tracking-wider text-sm">
                      <tr>
                        <th className="w-[28%] px-4 py-2.5 font-bold">Zone</th>
                        <th className="w-[22%] px-4 py-2.5 font-bold">Rainfall</th>
                        <th className="w-[16%] px-4 py-2.5 font-bold">Soil pH</th>
                        <th className="w-[22%] px-4 py-2.5 font-bold">Soil Texture (WRB)</th>
                        <th className="w-[12%] px-4 py-2.5 font-bold text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/40">
                      {rec.zones.map((zone, zIdx) => (
                        <tr key={zIdx} className="hover:bg-paper/40 transition">
                          <td className="w-[28%] px-4 py-3 font-medium text-ink">
                            <div className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{zone.zoneName}</span>
                            </div>
                          </td>
                          <td className="w-[22%] px-4 py-3 text-slate-700 truncate">
                            {zone.rainfall}
                          </td>
                          <td className="w-[16%] px-4 py-3 text-slate-700 truncate">
                            {zone.soilPh}
                          </td>
                          <td className="w-[22%] px-4 py-3 text-slate-700 truncate">
                            {zone.soilTexture}
                          </td>
                          <td className="w-[12%] px-4 py-3 text-right">
                            <span className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-900">
                              {zone.score}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}