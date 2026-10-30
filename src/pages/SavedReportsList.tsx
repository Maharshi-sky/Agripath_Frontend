import { Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COUNTRIES } from '../data/countries';
import { useSavedReports } from '../state/savedReportsStore';

function flagFor(country: string): string {
  return COUNTRIES.find((c) => c.n === country)?.f ?? '';
}

export default function SavedReportsList() {
  const navigate = useNavigate();
  const { reports, removeReport } = useSavedReports();

  if (reports.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-14 py-16">
        <h1 className="mb-3 text-[2.25rem] font-bold leading-tight tracking-tight text-ink">Saved Reports</h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted">
          You haven't saved any reports yet. Finish an analysis and click "Save Report" on the last step to see it
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-14 py-10">
      <h1 className="mb-9 text-[2.25rem] font-bold leading-tight tracking-tight text-ink">Saved Reports</h1>

      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-cream text-left text-[11px] uppercase tracking-[0.08em] text-label">
              <th className="px-5 py-3 font-semibold">Technology</th>
              <th className="px-5 py-3 font-semibold">Markets</th>
              <th className="px-5 py-3 font-semibold">Saved</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3 font-medium text-ink">{r.tech.name || 'Untitled technology'}</td>
                <td className="px-5 py-3 text-muted">
                  {r.countries.length > 0
                    ? `${r.countries.map(flagFor).join(' ')} ${r.countries.join(', ')}`
                    : 'No markets selected'}
                </td>
                <td className="px-5 py-3 text-muted">{new Date(r.savedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/saved-reports/${r.id}`)}
                      aria-label={`View report for ${r.tech.name || 'this technology'}`}
                      className="rounded-full p-2 text-label transition hover:bg-brand-light hover:text-brand-dark"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeReport(r.id)}
                      aria-label={`Delete report for ${r.tech.name || 'this technology'}`}
                      className="rounded-full p-2 text-label transition hover:bg-[#fdf1ef] hover:text-[#c0392b]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
