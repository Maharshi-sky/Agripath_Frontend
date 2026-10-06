// src/persona/farmer/components/CropProtectionGtmView.tsx
import { useEffect, useState, useRef } from 'react';
import { ExternalLink, FlaskConical, Users, Banknote, CheckCircle2 } from 'lucide-react';
import { useWizard } from "../../../state/wizardStore";
import GTMAnalysisLoading from "../../../UI/GTMAnalysisLoading";

export default function CropProtectionGtmView() {
  const { state } = useWizard();

  const country = state.countries?.[0] || 'Target Country';
  const tech = (state.tech || {}) as any;

  const productName = tech.name || tech.brandProductName || tech.tradeName || tech.chemicalType || 'Crop Protection Active';
  const subCategory = tech.chemicalType || tech.protectionCategory || 'Crop Protection & Agrochemical';
  const targetContext = tech.targetPest || tech.crop || 'Pest & Pathogen Control';
  const efficacySpec = tech.otherDetails || tech.keyBenefits || 'Targeted pest mortality with zero phytotoxicity';

  const dynamicHeaderTitle = `${productName} (${subCategory}) → ${country}`;

  // Deterministic Session Storage Cache Key for Farmer Persona
  const sessionKey = `agri_gtm_farmer_cropprotection_${country}_${productName}_${subCategory}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');

  // Initial State: Read directly from sessionStorage to stop loader flashing on re-visit
  const [planData, setPlanData] = useState<any>(() => {
    try {
      const cached = sessionStorage.getItem(sessionKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => !planData);
  const [hasError, setHasError] = useState<boolean>(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (planData) {
      setLoading(false);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchCropProtectionGtm() {
      setLoading(true);
      setHasError(false);

      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const payload = {
        country,
        crop: targetContext,
        technology: productName,
        variety: productName,
        category: 'Crop Protection',
        yieldImpact: efficacySpec,
        benefits: tech.keyBenefits || tech.desc || 'Targeted pest control with minimal beneficial insect toxicity',
        applicationMethod: tech.method || tech.applicationMethod || 'Foliar Spray & Soil Drenching',
        persona: 'farmer'
      };

      console.log('🛡️ [FARMER FRONTEND] Dispatching Crop Protection GTM request:', payload);

      try {
        // 1. Primary Farmer Persona GTM Endpoint
        let res = await fetch(`${BASE_URL}/farmer/gtm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // 2. Graceful Fallbacks
        if (!res.ok) {
          console.warn(`[GTM] /farmer/gtm returned ${res.status}. Falling back to /business/gtm...`);
          res = await fetch(`${BASE_URL}/business/gtm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        if (!res.ok) {
          res = await fetch(`${BASE_URL}/gtm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        if (res.ok) {
          const json = await res.json();
          const extracted = json.data && json.data.milestones ? json.data : (json.milestones ? json : json.data);

          if (extracted) {
            try {
              sessionStorage.setItem(sessionKey, JSON.stringify(extracted));
            } catch (storageErr) {
              console.warn('Failed to cache Farmer Crop Protection GTM plan:', storageErr);
            }
            setPlanData(extracted);
          } else {
            throw new Error('Invalid response structure received');
          }
        } else {
          throw new Error(`HTTP Error: ${res.status}`);
        }
      } catch (err: any) {
        console.error('Farmer Crop Protection GTM fetch error:', err);
        setHasError(true);
      } finally {
        setLoading(false);
        fetchedRef.current = false;
      }
    }

    fetchCropProtectionGtm();
  }, [country, productName, subCategory, efficacySpec, targetContext, sessionKey, planData]);

  // Loading Screen
  if (loading) {
    return (
      <GTMAnalysisLoading
        technologyName={`${productName} (${subCategory})`}
        countryName={country}
        category="protection"
      />
    );
  }

  // Error State Fallback View
  if (hasError && !planData) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
        <h3 className="text-base font-bold text-red-900">Failed to generate Spray & Application Plan</h3>
        <p className="mt-2 text-sm text-red-700">The Groq engine timed out or could not be reached.</p>
        <button
          onClick={() => {
            sessionStorage.removeItem(sessionKey);
            window.location.reload();
          }}
          className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Retry Plan Generation
        </button>
      </div>
    );
  }

  const milestones = planData?.milestones || [];
  const firstContacts = planData?.first_contacts || [];
  const fundingWindows = planData?.funding_windows || [];
  const successMetrics = planData?.success_metrics || [];

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner */}
      <div className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#071C10_0%,#0B4223_55%,#08311B_100%)] p-7 text-white shadow-md">
        <div className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-400">
          SEASONAL ON-FARM PEST MANAGEMENT · {country.toUpperCase()}
        </div>

        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          {dynamicHeaderTitle}
        </h2>

        <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-xs">
          <p className="text-sm leading-relaxed text-white/90">
            <span className="font-semibold text-emerald-400">Agronomic Spray Protocol:</span>{' '}
            {planData?.executive_brief}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/80">
            {planData?.production_hubs && (
              <span className="rounded-md bg-emerald-950/70 px-2.5 py-1 font-semibold text-emerald-300 border border-emerald-500/30">
                Pest Outbreak Zones: {planData.production_hubs}
              </span>
            )}
            {planData?.planting_window && (
              <span className="rounded-md bg-emerald-950/70 px-2.5 py-1 font-semibold text-amber-300 border border-amber-500/30">
                Optimal Spray Window: {planData.planting_window}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">ACTIVE CLASSIFICATION</span>
            <p className="mt-0.5 text-sm font-semibold text-white">{subCategory}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">TARGET PATHOGENS / PESTS</span>
            <p className="mt-0.5 text-sm font-semibold text-white">{targetContext}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">EXPECTED CONTROL</span>
            <p className="mt-0.5 text-sm font-semibold text-white line-clamp-1">{efficacySpec}</p>
          </div>
        </div>
      </div>

      {/* 2. Action Roadmap */}
      {milestones.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-emerald-700" />
              90-Day Seasonal Field Spraying & Scouting Calendar
            </h3>
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800">
              {milestones.length} milestones
            </span>
          </div>

          <div className="space-y-3.5">
            {milestones.map((m: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4 rounded-xl border border-line/50 bg-cream/20 p-4 transition hover:bg-cream/40">
                <span className="flex h-7 min-w-[72px] shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-100 px-2.5 text-xs font-bold text-amber-900">
                  {m.timing}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-ink">{m.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. First Contacts */}
      {firstContacts.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-700" />
            District Plant Protection & Agro-Dealer Contacts — Week 1
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {firstContacts.map((c: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-line/80 bg-slate-50/50 p-4">
                <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">{c.name}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Funding Windows */}
      {fundingWindows.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
            <Banknote className="h-4 w-4 text-emerald-700" />
            Farmer Crop Protection Subsidies & Input Finance
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {fundingWindows.map((f: any, idx: number) => (
              <div key={idx} className="flex flex-col justify-between rounded-xl border border-line/80 bg-slate-50/50 p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-ink">{f.name}</h4>
                    {f.display_url && (
                      <a
                        href={f.url?.startsWith('http') ? f.url : `https://${f.url || f.display_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                      >
                        <span>{f.display_url}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Success Metrics */}
      {successMetrics.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            Pest Suppression & Harvest Targets (90 Days)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {successMetrics.map((item: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-line/80 bg-slate-50/50 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{item.horizon}</span>
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-ink">{item.target}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}