// src/components/BioInputsGtmView.tsx
import { useEffect, useState, useRef } from 'react';
import { ExternalLink, Sprout, Users, Banknote, CheckCircle2 } from 'lucide-react';
import { useWizard } from '../state/wizardStore';
import GTMAnalysisLoading from '../UI/GTMAnalysisLoading';

export default function BioInputsGtmView() {
  const { state } = useWizard();

  const country = state.countries?.[0] || 'Target Country';
  const tech = (state.tech || {}) as any;

  const productName = tech.brandProductName || tech.name || tech.productName || 'Microbial Inoculant / Biostimulant';
  const subCategory = tech.inputCategory || tech.category || 'Biological Inputs & Inoculants';
  const targetCrops = tech.cropType || tech.crop || 'Target Crops & Soil Microbiome';
  const viabilitySpec = tech.otherDetails || tech.keyBenefits || 'High-potency CFU viability & phosphate/nitrogen solubilization';

  const dynamicHeaderTitle = `${productName} (${subCategory}) → ${country}`;

  // Deterministic Session Storage Cache Key
  const sessionKey = `agri_gtm_bio_${country}_${productName}_${subCategory}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');

  // Initial State: Read immediately from sessionStorage to prevent loader flicker
  const [planData, setPlanData] = useState<any>(() => {
    try {
      const cached = sessionStorage.getItem(sessionKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => !planData);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Agar session storage me already plan saved hai toh API hit nahi karenge
    if (planData) {
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    async function fetchBioInputsGtm() {
      setLoading(true);
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const res = await fetch(`${BASE_URL}/gtm/generate-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country,
            crop: targetCrops,
            variety: productName,
            category: 'Biological Inputs & Inoculants',
            yieldImpact: viabilitySpec,
            benefits: tech.keyBenefits || tech.desc || 'Microbial root enhancement and 20–30% synthetic chemical substitution',
            applicationMethod: tech.applicationMethod || 'Seed Inoculation, Soil Drenching & Foliar Spray',
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            // Plan generate hote hi sessionStorage me save
            try {
              sessionStorage.setItem(sessionKey, JSON.stringify(json.data));
            } catch (storageErr) {
              console.warn('Failed to cache GTM plan:', storageErr);
            }
            setPlanData(json.data);
          }
        }
      } catch (err: any) {
        console.warn('Bio-Inputs GTM fetch error:', err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }

    fetchBioInputsGtm();
  }, [country, productName, subCategory, viabilitySpec, targetCrops, sessionKey, planData]);

  // Loading Screen (sirf tab dikhega jab cache empty ho aur API fetch chal rahi ho)
  if (loading || !planData) {
    return (
      <GTMAnalysisLoading
        technologyName={`${productName} (${subCategory})`}
        countryName={country}
        category="bio"
      />
    );
  }

  // Live Data Extract
  const milestones = planData?.milestones || [];
  const firstContacts = planData?.first_contacts || [];
  const fundingWindows = planData?.funding_windows || [];
  const successMetrics = planData?.success_metrics || [];

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner */}
      <div className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#071C10_0%,#0B4223_55%,#08311B_100%)] p-7 text-white shadow-md">
        <div className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-400">
          90-DAY COMMERCIALIZATION · {country.toUpperCase()}
        </div>

        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          {dynamicHeaderTitle}
        </h2>

        <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-xs">
          <p className="text-sm leading-relaxed text-white/90">
            <span className="font-semibold text-emerald-400">Executive Deployment Strategy:</span>{' '}
            {planData?.executive_brief}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/80">
            {planData?.production_hubs && (
              <span className="rounded-md bg-emerald-950/70 px-2.5 py-1 font-semibold text-emerald-300 border border-emerald-500/30">
                High-Response Soil Clusters: {planData.production_hubs}
              </span>
            )}
            {planData?.planting_window && (
              <span className="rounded-md bg-emerald-950/70 px-2.5 py-1 font-semibold text-amber-300 border border-amber-500/30">
                Inoculation & Basal Window: {planData.planting_window}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">INPUT CLASSIFICATION</span>
            <p className="mt-0.5 text-sm font-semibold text-white">{subCategory}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">TARGET CROPS / SOIL</span>
            <p className="mt-0.5 text-sm font-semibold text-white">{targetCrops}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">VIABILITY & PERFORMANCE</span>
            <p className="mt-0.5 text-sm font-semibold text-white line-clamp-1">{viabilitySpec}</p>
          </div>
        </div>
      </div>

      {/* 2. Action Roadmap */}
      {milestones.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-700" />
              90-Day Biological Inputs Commercialization Roadmap
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
            Biological Regulatory & Distribution Contacts — Week 1
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
            Regenerative Agriculture & Bio-Input Finance Windows
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
            Bio-Input Commercialization Targets (90 Days)
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