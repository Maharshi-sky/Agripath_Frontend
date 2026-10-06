import { useEffect, useState } from 'react';
import { agriApi } from '../services/agriApi';
import { useWizard } from '../state/wizardStore';

export default function DemoRegulatoryTab() {
  const { state } = useWizard();
  const [regulatoryData, setRegulatoryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const targetCountry = state.countries[0] || 'Ethiopia';
  const targetCategory = state.tech.type || 'Agrochemicals';
  const targetTech = state.tech.name || 'Bio-Pesticide';

  useEffect(() => {
    async function fetchPathway() {
      setLoading(true);
      try {
        const res = await agriApi.getRegulatoryPathway({
          category: targetCategory,
          technology: targetTech,
          country: targetCountry,
        });
        if (res.success) {
          setRegulatoryData(res);
        }
      } catch (err) {
        console.warn('Backend unavailable, showing fallback template.', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPathway();
  }, [targetCountry, targetCategory, targetTech]);

  return (
    <div>
      <div className="mb-8 rounded-xl border border-line bg-paper p-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
          <div className="text-lg font-bold text-ink">
            Official Regulatory Pathway — {targetCountry} ({targetCategory})
          </div>
          {regulatoryData?.meta && (
            <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase text-blue-800">
              Source: {regulatoryData.meta.source} | Confidence: {regulatoryData.meta.confidence_score}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted">
            ⚡ Running AI Regulatory Pathway Analysis for {targetCountry}...
          </div>
        ) : regulatoryData ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-lg border bg-cream">
                <span className="text-xs text-label uppercase font-semibold">Lead Agency</span>
                <p className="font-bold text-ink">{regulatoryData.summary.regulatory_authority}</p>
              </div>
              <div className="p-4 rounded-lg border bg-cream">
                <span className="text-xs text-label uppercase font-semibold">Estimated Timeline</span>
                <p className="font-bold text-ink">{regulatoryData.summary.estimated_timeline}</p>
              </div>
              <div className="p-4 rounded-lg border bg-cream">
                <span className="text-xs text-label uppercase font-semibold">Estimated Cost</span>
                <p className="font-bold text-brand">{regulatoryData.summary.estimated_cost}</p>
              </div>
            </div>

            <h4 className="font-semibold text-sm mb-3">Sequenced Step-by-Step Approval Process</h4>
            <div className="space-y-2">
              {regulatoryData.workflow?.approval_process?.map((step: any, idx: number) => (
                <div key={idx} className="p-3 border rounded-lg bg-white flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                    {step.step_number}
                  </span>
                  <span className="text-sm text-ink">{step.action}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}