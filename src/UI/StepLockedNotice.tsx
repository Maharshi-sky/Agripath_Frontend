import { Lock } from 'lucide-react';

export default function StepLockedNotice({
  message,
  ctaLabel,
  onCta,
}: {
  message: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-paper px-6 py-14 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-label">
        <Lock size={18} />
      </span>
      <p className="max-w-md text-sm leading-relaxed text-muted">{message}</p>
      <button
        type="button"
        onClick={onCta}
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
