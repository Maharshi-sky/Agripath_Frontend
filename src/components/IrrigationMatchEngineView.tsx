// src/components/IrrigationMatchEngineView.tsx
import { useEffect, useState } from 'react';
import { useWizard } from '../state/wizardStore';
import { agriApi } from '../services/agriApi';
import { Waves, CheckCircle2, CloudRain, SunMedium, Gauge, Info, ChevronRight, RotateCcw, Sprout, Sparkles } from 'lucide-react';

export default function IrrigationMatchEngineView({ data: propData }: { data?: any }) {
  const { state, setSelectedMatch } = useWizard();

  // Extract Country safely
  const rawCountry = state.countries?.[0];
  const selectedCountry =
    typeof rawCountry === 'object' && rawCountry !== null
      ? (rawCountry.name || rawCountry.label || rawCountry.country || 'Uganda')
      : (rawCountry || 'Uganda');

  // Extract Crop safely
  const currentTech = (state.tech || {}) as Record<string, any>;
  const targetCrop =
    currentTech.targetCrop ||
    currentTech.crop ||
    currentTech.varietyName ||
    currentTech.name ||
    'Commercial Crop';

  const [data, setData] = useState<any>(propData || null);
  const [loading, setLoading] = useState<boolean>(!propData);
  
  // Selected Zone State (null = overall Country view)
  const [selectedZone, setSelectedZone] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHydrologyMatch() {
      if (propData?.hydrology) {
        setData(propData);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await agriApi.getCountryIrrigationRecommendation({
          country: selectedCountry,
          crop: targetCrop,
          fieldAreaHa: 1.0,
        });

        if (isMounted && result?.success) {
          setData(result);
          setSelectedMatch(result);
        }
      } catch (err) {
        console.error('Irrigation match fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHydrologyMatch();
    return () => {
      isMounted = false;
    };
  }, [selectedCountry, targetCrop, propData, setSelectedMatch]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-12 text-center shadow-sm">
        <div className="inline-block animate-spin text-brand mb-4">
          <Waves className="h-8 w-8" />
        </div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
          Connecting to WaPOR Satellite Master Database...
        </div>
        <p className="text-xs text-muted mt-2">
          Resolving zonal hydrology, rainfall benchmarks, and calibrated {targetCrop} crop evapotranspiration (ETc) for {selectedCountry}...
        </p>
      </div>
    );
  }

  const countryHydrology = data?.hydrology;
  const countryRecommendation = data?.recommendation;
  const cropProfile = data?.cropWaterProfile;
  const zonesBreakdown = data?.zonesBreakdown || [];

  if (!countryHydrology || !countryRecommendation) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-8 text-center text-xs text-muted">
        No hydrological records returned for {selectedCountry}. Please verify zone_wapor_analytics dataset.
      </div>
    );
  }

  // ── DYNAMIC CONTEXT COMPUTATION (Country vs Selected Zone) ──
  const isZoneView = selectedZone !== null;

  const activeName = isZoneView ? selectedZone.zoneName : selectedCountry;
  const activeSubTitle = isZoneView ? `Zone Level • ${selectedCountry}` : `Country Level • ${selectedCountry}`;

  const activeDailyRain = isZoneView
    ? selectedZone.dailyRainfallMm
    : countryHydrology.overallDailyRainfallMm;

  const activeAnnualRain = isZoneView
    ? selectedZone.annualRainfallMm
    : countryHydrology.countryAvgAnnualRainfallMm;

  const activeAtmosphericEti = isZoneView
    ? (selectedZone.waporDailyEtiMm || countryHydrology.faoWaporEtiDailyMm)
    : countryHydrology.faoWaporEtiDailyMm;

  const cropKc = countryHydrology.cropKcFactor || cropProfile?.cropKc || 1.0;

  // Calibrated Crop ETc = ETI * Kc
  const activeCropEtc = isZoneView
    ? (selectedZone.cropEtcDailyMm ?? parseFloat((activeAtmosphericEti * cropKc).toFixed(2)))
    : (countryHydrology.cropEtcDailyMm || parseFloat((activeAtmosphericEti * cropKc).toFixed(2)));

  const activeDeficit = isZoneView
    ? (selectedZone.netDeficitDailyMm ?? Math.max(0, parseFloat((activeCropEtc - activeDailyRain).toFixed(2))))
    : countryHydrology.cropRequirementDailyMm;

  const activeVolumeLiters = isZoneView
    ? Math.round(activeDeficit * 10 * 1.0 * 1000)
    : countryHydrology.dailyVolumeLiters;

  const activeVolumeM3 = isZoneView
    ? parseFloat((activeDeficit * 10 * 1.0).toFixed(1))
    : countryHydrology.volumetricDemandM3Day;

  // Threshold rule: >= 3.5 -> Sprinkler, < 3.5 -> Drip
  const activeSystem = isZoneView
    ? (activeDeficit >= 3.5 ? 'Sprinkler Irrigation' : 'Drip Irrigation')
    : countryRecommendation.system;

  const activeEfficiency = activeSystem === 'Drip Irrigation' ? 92 : 82;
  const activeScore = activeSystem === 'Sprinkler Irrigation' ? 95 : 92;
  const waterSavingsText = activeSystem === 'Drip Irrigation' ? '~45% - 55%' : '~25% - 35%';

  const activeRationale = isZoneView
    ? [
        `Target Crop Demand (${targetCrop}): Crop ETc is calibrated to ${activeCropEtc} mm/day (Kc: ${cropKc}) against baseline rainfall of ${activeDailyRain} mm/day, leaving a net deficit of ${activeDeficit} mm/day.`,
        activeSystem === 'Sprinkler Irrigation'
          ? `Operational Threshold: Because the net deficit (${activeDeficit} mm/day) is ≥ 3.5 mm/day, Sprinkler Irrigation is deployed for rapid, high-volume overhead replenishment.`
          : `Operational Threshold: Because the net deficit (${activeDeficit} mm/day) is < 3.5 mm/day, Drip Irrigation provides targeted root-zone moisture delivery with minimal surface evaporation.`,
        `Water Preserved vs Flood: Operating ${activeSystem} saves ${waterSavingsText} water over open flood methods by directly controlling delivery rather than losing half to deep percolation and soil runoff.`
      ]
    : countryRecommendation.rationale;

  return (
    <div className="space-y-6">
      {/* ── 0. Field Hydrology & Deficit Baseline Cards ── */}
      <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3.5 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <Waves className="h-4 w-4 text-brand" />
            <span>Field Hydrology & Water Balance</span>
            {isZoneView && (
              <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono normal-case">
                Zone Active
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {isZoneView && (
              <button
                onClick={() => setSelectedZone(null)}
                className="flex items-center gap-1 text-[11px] font-mono text-muted hover:text-ink bg-cream/50 hover:bg-cream border border-line px-2.5 py-0.5 rounded-md transition-colors"
                title="Reset to Country Summary"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Show Overall Country</span>
              </button>
            )}

            {cropProfile && (
              <span className="text-[11px] font-mono text-ink bg-cream border border-line px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <Sprout className="h-3 w-3 text-emerald-600" />
                <span>{cropProfile.matchedCrop} Need: {cropProfile.avgSeasonalMm}mm (Kc: {cropProfile.cropKc})</span>
              </span>
            )}

            <span className="text-[11px] font-mono text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-md font-semibold">
              {activeName} • {targetCrop}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Rainfall Card */}
          <div className="rounded-xl border border-line/60 bg-cream/30 p-3.5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                {isZoneView ? 'Zone Daily Rainfall' : 'All Zones Rainfall'}
              </span>
              <CloudRain className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-bold text-ink">{activeDailyRain}</span>
              <span className="text-xs font-medium text-muted">mm/day</span>
            </div>
            <span className="text-[10px] text-muted block mt-1">
              {isZoneView 
                ? `Baseline Annual: ${activeAnnualRain} mm` 
                : `Annual avg: ${activeAnnualRain} mm (${countryHydrology.totalZonesCount} zones)`}
            </span>
          </div>

          {/* FAO WaPOR Crop ETc Card */}
          <div className="rounded-xl border border-line/60 bg-cream/30 p-3.5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                Crop ETc Demand
              </span>
              <SunMedium className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-bold text-ink">{activeCropEtc}</span>
              <span className="text-xs font-medium text-muted">mm/day</span>
            </div>
            <span className="text-[10px] text-muted block mt-1 truncate" title={`WaPOR Atmospheric ETI: ${activeAtmosphericEti} mm/d x Kc: ${cropKc}`}>
              WaPOR ({activeAtmosphericEti}) × Kc ({cropKc})
            </span>
          </div>

          {/* Net Deficit Card */}
          <div className="rounded-xl border border-brand/40 bg-brand/5 p-3.5">
            <div className="flex items-center justify-between text-brand">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                Crop Net Deficit
              </span>
              <Gauge className="h-4 w-4 text-brand" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-bold text-brand">{activeDeficit}</span>
              <span className="text-xs font-medium text-muted">mm/day</span>
            </div>
            <span className="text-[10px] text-muted block mt-1">
              ETc ({activeCropEtc}) - Rain ({activeDailyRain})
            </span>
          </div>

          {/* Daily Volumetric Sizing Card */}
          <div className="rounded-xl border border-line/60 bg-cream/30 p-3.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted block">
              Daily Volumetric (1 Ha)
            </span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-bold text-ink">
                {Number(activeVolumeLiters || 0).toLocaleString()}
              </span>
              <span className="text-xs font-medium text-muted">L/day</span>
            </div>
            <span className="text-[10px] text-muted block mt-1">
              {activeVolumeM3} m³/ha/day net requirement
            </span>
          </div>
        </div>
      </div>

      {/* ── 1. Recommended Irrigation System Card ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand" />
            Recommended Irrigation Method {isZoneView && `for ${activeName}`}
          </h3>
          <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-0.5 text-xs font-semibold text-brand">
            {isZoneView ? 'Zone-Specific Fit' : 'Hydrological Fit Match'}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-brand bg-paper shadow-sm">
          {/* Header Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream/30 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs font-mono font-bold text-brand">
                {activeSystem}
              </span>
              <span className="text-xs font-medium text-muted">
                Engineered for {targetCrop} in {activeName} ({activeSubTitle})
              </span>
            </div>

            <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-brand">
              {activeScore}% Match Score
            </span>
          </div>

          {/* Card Body */}
          <div className="p-5 space-y-4">
            <div>
              <h4 className="text-base font-bold text-ink">{activeSystem} Delivery Protocol</h4>
              <p className="mt-0.5 text-xs text-muted">
                Target Crop: <strong className="text-ink font-semibold">{targetCrop}</strong> • Design Field Area: <strong className="text-ink font-semibold">1.0 Hectare</strong>
              </p>
            </div>

            {/* AI Executive Summary Banner */}
            {countryRecommendation.agronomicSummary && !isZoneView && (
              <div className="rounded-xl border border-brand/20 bg-brand/5 p-3.5 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                <p className="text-xs text-ink/90 leading-relaxed">
                  <strong className="font-semibold text-brand font-mono uppercase text-[11px]">Agronomic Evaluation: </strong>
                  {countryRecommendation.agronomicSummary}
                </p>
              </div>
            )}

            {/* Engineering Rationale List */}
            <div className="rounded-xl border border-line/60 bg-cream/20 p-4 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-brand" /> System Evaluation & Hydrological Rationale
              </span>
              {activeRationale.map((point: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-ink/90">
                  <span className="text-brand font-bold mt-0.5">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Performance Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="rounded-lg bg-cream/40 p-2.5 border border-line/40">
                <span className="text-[10px] text-muted block uppercase tracking-wider font-mono">
                  Application Efficiency
                </span>
                <span className="font-bold text-brand text-sm mt-0.5 block">
                  {activeEfficiency}%
                </span>
              </div>

              <div className="rounded-lg bg-cream/40 p-2.5 border border-line/40">
                <span className="text-[10px] text-muted block uppercase tracking-wider font-mono">
                  Daily Water Balance
                </span>
                <span className="font-bold text-ink text-sm mt-0.5 block">
                  {activeDeficit} mm/d Deficit
                </span>
              </div>

              <div className="rounded-lg bg-cream/40 p-2.5 border border-line/40 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted block uppercase tracking-wider font-mono">
                  Approximate Water Preserved 
                </span>
                <span className="font-bold text-brand text-sm mt-0.5 block">
                  {waterSavingsText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Zone-wise Rainfall Breakdown Table (Interactive On-Click) ── */}
      {zonesBreakdown && zonesBreakdown.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper overflow-hidden shadow-sm">
          <div className="p-4 border-b border-line bg-cream/20 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                Regional WaPOR Satellite Hydrology Contribution Across Zones
              </span>
              <span className="text-[11px] text-muted mt-0.5 block">
                Click on any zone to inspect its calibrated {targetCrop} ETc demand and recommended system
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted bg-cream px-2 py-0.5 rounded border border-line">
              {zonesBreakdown.length} Zones Resolved
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream/40 border-b border-line text-[11px] text-muted uppercase font-mono">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Agroclimatic Zone</th>
                  <th className="py-2.5 px-4 font-semibold">Rainfall (mm/d)</th>
                  <th className="py-2.5 px-4 font-semibold">WaPOR ETI</th>
                  <th className="py-2.5 px-4 font-semibold">Crop ETc ({targetCrop})</th>
                  <th className="py-2.5 px-4 font-semibold">Net Deficit</th>
                  <th className="py-2.5 px-4 font-semibold">Recommended System</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {zonesBreakdown.map((z: any, idx: number) => {
                  const zAtmosphericEti = z.waporDailyEtiMm || countryHydrology.faoWaporEtiDailyMm;
                  const zCropEtc = z.cropEtcDailyMm ?? parseFloat((zAtmosphericEti * cropKc).toFixed(2));
                  const zDeficit = z.netDeficitDailyMm ?? Math.max(0, parseFloat((zCropEtc - z.dailyRainfallMm).toFixed(2)));

                  // Threshold rule: >= 3.5 -> Sprinkler, < 3.5 -> Drip
                  const systemTag =
                    zDeficit >= 3.5
                      ? 'Sprinkler Irrigation'
                      : 'Drip Irrigation';

                  const isSelected = selectedZone?.zoneName === z.zoneName;

                  return (
                    <tr
                      key={idx}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedZone(null);
                        } else {
                          setSelectedZone({
                            ...z,
                            waporDailyEtiMm: zAtmosphericEti,
                            cropEtcDailyMm: zCropEtc,
                            netDeficitDailyMm: zDeficit,
                            recommendedSystem: systemTag
                          });
                        }
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-brand/10 hover:bg-brand/15 font-medium'
                          : 'hover:bg-cream/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-ink flex items-center gap-2">
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse"></span>}
                        <span>{z.zoneName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted">{z.dailyRainfallMm} mm/d</td>
                      <td className="py-3 px-4 font-mono text-muted">{zAtmosphericEti} mm/d</td>
                      <td className="py-3 px-4 font-mono text-amber-700 font-medium">{zCropEtc} mm/d</td>
                      <td className="py-3 px-4 font-mono font-bold text-brand">{zDeficit} mm/d</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            systemTag === 'Sprinkler Irrigation'
                              ? 'bg-blue-100/90 text-blue-900 border border-blue-300'
                              : 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {systemTag}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-mono transition-colors ${
                            isSelected ? 'text-brand font-bold' : 'text-muted hover:text-ink'
                          }`}
                        >
                          {isSelected ? 'Active View' : 'Inspect'}
                          <ChevronRight className={`h-3 w-3 ${isSelected ? 'rotate-90 text-brand' : ''}`} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}