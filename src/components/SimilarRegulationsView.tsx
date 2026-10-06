// src/components/SimilarRegulationsView.tsx
import { Globe2, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

interface FairsReport {
  reportType: string;
  year: string;
  link: string | null;
}

interface SimilarRegulationsData {
  selectedCountry: string;
  isHub: boolean;
  governingCountry: string;
  reports: FairsReport[];
  similarCountries: string[];
  description: string;
}

interface SimilarRegulationsViewProps {
  data: SimilarRegulationsData | null | undefined;
  countryName: string;
}

export default function SimilarRegulationsView({ data, countryName }: SimilarRegulationsViewProps) {
  if (!data || !data.similarCountries || data.similarCountries.length === 0) {
    return null;
  }

  const reports = Array.isArray(data.reports) ? data.reports : [];

  return (
    <div className="mt-10 rounded-2xl border border-line bg-paper p-6 shadow-xs">
      {/* Header */}
      <div className="border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-ink">
            Similar Regulations and Certifications
          </h3>
          <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-sm font-bold text-emerald-800">
            Harmonized Regional Network
          </span>
        </div>
        <p className="mt-1 text-base text-muted">
          {data.description || `Similar regulations and export certifications governing ${countryName} apply across these regional partner markets.`}
        </p>
      </div>

      {/* Official FAIRS Regulatory Reports */}
      {reports.length > 0 && (
        <div className="mt-5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-900 mb-2">
            <FileText className="h-4 w-4 text-emerald-700" />
            <span>Official FAIRS Regulatory Documentation ({data.governingCountry})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reports.map((rep, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-line/60 bg-paper px-3.5 py-2.5 shadow-2xs"
              >
                <div className="truncate pr-2">
                  <span className="block text-sm font-semibold text-ink truncate">
                    {rep.reportType}
                  </span>
                  <span className="text-sm font-mono text-muted">Edition: {rep.year}</span>
                </div>
                {rep.link ? (
                  <a
                    href={rep.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 shrink-0 rounded-md bg-emerald-600 px-2.5 py-1 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <span>View PDF</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-sm text-muted font-mono">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Countries Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <div className="flex items-center justify-between bg-cream/30 px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Globe2 className="h-4 w-4 text-emerald-700" />
            <span>Similar Regulations and Certifications are needed for {data.similarCountries.length} Countries</span>
          </div>
          <span className="text-sm font-mono text-muted">
            Governing Authority: {data.governingCountry}
          </span>
        </div>

        <table className="w-full table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-line/60 bg-cream/20 text-muted uppercase tracking-wider text-sm font-bold">
              <th className="w-[10%] px-4 py-3 text-center">#</th>
              <th className="w-[35%] px-4 py-3">COUNTRY</th>
              <th className="w-[30%] px-4 py-3">REGULATORY REGIME</th>
              <th className="w-[25%] px-4 py-3 text-right">CERTIFICATION REF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40">
            {data.similarCountries.map((cName, idx) => (
              <tr key={idx} className="hover:bg-paper/40 transition">
                <td className="w-[10%] px-4 py-3 text-center font-mono text-sm text-muted">
                  {idx + 1}
                </td>
                <td className="w-[35%] px-4 py-3 font-semibold text-ink truncate">
                  {cName}
                </td>
                <td className="w-[30%] px-4 py-3 text-slate-700 truncate">
                  <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-sm text-slate-700 font-medium truncate">
                    Managed via {data.governingCountry}
                  </span>
                </td>
                <td className="w-[25%] px-4 py-3 text-right truncate">
                  {reports[0]?.link ? (
                    <a
                      href={reports[0].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline"
                    >
                      <span className="truncate">FAIRS Certificate</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted">Standard</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}