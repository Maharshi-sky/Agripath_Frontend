import { useLocation, useParams } from 'react-router-dom';
import { stepByPath } from '../state/steps';

export default function Topbar() {
  const { stepPath } = useParams();
  const { pathname } = useLocation();
  const step = stepByPath(stepPath);
  const label =
    step?.label ??
    (pathname.startsWith('/saved-reports') ? 'Saved Reports' : pathname === '/' ? 'Overview' : '');

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-line bg-paper px-10">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-label">{label}</span>
    </header>
  );
}
