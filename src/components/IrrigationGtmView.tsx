// src/components/IrrigationGtmView.tsx
import { useEffect, useState, useRef } from 'react';
import { ExternalLink, Droplets, Banknote, Users, CheckCircle2 } from 'lucide-react';
import { useWizard } from '../state/wizardStore';
import GTMAnalysisLoading from '../UI/GTMAnalysisLoading';
import { agriApi } from '../services/agriApi';

export default function IrrigationGtmView() {
  const { state } = useWizard();

  const country = state.countries?.[0] || 'Target Country';
  const tech = (state.tech || {}) as any;

  const systemName = tech.recommendedSystem || tech.name || 'Commercial Precision Irrigation System';
  const targetCrop = tech.targetCrop || tech.crop || 'Commercial Cash Crops & Water-Deficit Horticulture';
  const cropCategory = tech.cropCategory || 'High-Value Agronomy';
  const waterSavingMetric = tech.volumetricDemand ? `${tech.volumetricDemand} Preserved vs Surface Flood` : '45% - 55% Water Preserved vs Flood';

  const dynamicHeaderTitle = `${systemName} (${targetCrop}) → ${country}`;

  // Deterministic Session Storage Cache Key
  const sessionKey = `agri_gtm_irrigation_${country}_${systemName}_${targetCrop}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');

  // Read immediately from sessionStorage
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
    if (planData) {
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    async function fetchIrrigationGtm() {
      setLoading(true);
      try {
        const json = await agriApi.generateGtmPlan({
          country,
          crop: targetCrop,
          variety: systemName,
          category: 'Irrigation & Water Regimen',
          yieldImpact: waterSavingMetric,
          benefits: tech.agronomicNotes || tech.desc || 'Pressurized root-zone delivery with zero water runoff',
          applicationMethod: tech.recommendedSystem || 'Precision Drip & Micro-Emitter Network',
        });

        if (json?.data) {
          try {
            sessionStorage.setItem(sessionKey, JSON.stringify(json.data));
          } catch (storageErr) {
            console.warn('Failed to cache Irrigation GTM plan:', storageErr);
          }
          setPlanData(json.data);
        }
      } catch (err: any) {
        console.warn('Irrigation GTM fetch error:', err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }

    fetchIrrigationGtm();
  }, [country, systemName, targetCrop, waterSavingMetric, sessionKey, planData]);

  if (loading || !planData) {
    return (
      <GTMAnalysisLoading
        technologyName={`${systemName} (${targetCrop})`}
        countryName={country}
        category="general"
      />
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
          90-DAY COMMERCIALIZATION · {country.toUpperCase()}
        </div>

        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          {dynamicHeaderTitle}
        </h2>

        <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-xs">
          <p className="text-sm leading-relaxed text-white/90">
            <span className="font-semibold text-emerald-400">Executive Deployment Strategy:</span>{' '}
            {planData?.executive_brief || planData?.productSummary?.coreProposition || 'Establish turnkey hydraulic dealer distribution and smallholder microfinance packages across priority irrigation corridors.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/80">
            {planData?.production_hubs && (
              <span className="rounded-md bg-emerald-950/70 px-2.5 py-1 font-semibold text-emerald-300 border border-emerald-500/30">
                Irrigation Farming Clusters: {planData.production_hubs}
              </span>
            )}
            <span className="rounded-md bg-emerald-950/70 px-2.5 py-1 font-semibold text-amber-300 border border-amber-500/30">
              Water Efficiency: {waterSavingMetric}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">IRRIGATION ARCHITECTURE</span>
            <p className="mt-0.5 text-sm font-semibold text-white">{systemName}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">TARGET CROP CONTEXT</span>
            <p className="mt-0.5 text-sm font-semibold text-white">{targetCrop}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">AGRONOMIC CATEGORY</span>
            <p className="mt-0.5 text-sm font-semibold text-white line-clamp-1">{cropCategory}</p>
          </div>
        </div>
      </div>

      {/* 2. Action Roadmap */}
      {milestones.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <Droplets className="h-4 w-4 text-emerald-700" />
              90-Day Irrigation Commercialization Roadmap
            </h3>
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800">
              {milestones.length} milestones
            </span>
          </div>

          <div className="space-y-3.5">
            {milestones.map((m: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4 rounded-xl border border-line/50 bg-cream/20 p-4 transition hover:bg-cream/40">
                <span className="flex h-7 min-w-18 shrink-0 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 px-2.5 text-xs font-bold text-emerald-900">
                  {m.timing || m.timeframe || `Phase ${idx + 1}`}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-ink">{m.title || m.phase}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {Array.isArray(m.objectives) ? m.objectives.join(' · ') : m.desc}
                  </p>
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
            Water Authorities, EPC Partners & Master Distributors — Week 1
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {firstContacts.map((c: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-line/80 bg-slate-50/50 p-4">
                <span className="text-xs font-bold text-emerald-900 uppercase block mb-1">{c.name}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Funding & Climate Financing Windows */}
      {fundingWindows.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
            <Banknote className="h-4 w-4 text-emerald-700" />
            Climate Resilience Financing & Irrigation Subsidy Windows
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
            Hydraulic Deployment Target Milestones (90 Days)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {successMetrics.map((item: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-line/80 bg-slate-50/50 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">{item.horizon}</span>
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-ink">{item.target}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}