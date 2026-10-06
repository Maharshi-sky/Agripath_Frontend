// src/UI/Sidebar.tsx

import { Check, Save, FileText } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import { cn } from '../lib/cn';
import { STEPS, pad2, FINAL_REPORT_STEP } from '../state/steps';
import { useWizard } from '../state/wizardStore';

export default function Sidebar() {
  const navigate = useNavigate();
  const { stepPath } = useParams();
  const { pathname } = useLocation();
  const { state } = useWizard();

  

  const savedReportsActive = pathname.startsWith('/saved-reports');
  const finalReportActive = pathname.includes('final-report') || stepPath === 'final-report';

  return (
    <aside className="flex h-screen w-55 shrink-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#0B0F0B_0%,#0A4323_100%)] text-sidebar-text">
      {/* Brand Header — direct Step 1 link */}
      <div 
        onClick={() => navigate(`/${STEPS[0].path}`)} 
        className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-line px-6 cursor-pointer transition hover:opacity-90"
      >
        <span className="flex h-8 w-8 items-center">
          <img src={Logo} alt="Logo" className="h-8 w-8" />
        </span>
        <span className="text-lg font-bold text-white">AgriPath AI</span>
      </div>

 
      {/* WORK FLOW Label (Tab Switcher ke neeche aur steps ke upar) */}
      <div className="px-6 pb-2 pt-12 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-text-dim">
        Work Flow
      </div>

      {/* Workflow Navigation */}
      <nav className="flex flex-col gap-2 px-3">
        {STEPS.map((s) => {
          const active = !finalReportActive && stepPath === s.path;
          
          const earlierStepsDone =
            !!state.stepComplete[1] &&
            !!state.stepComplete[2] &&
            !!state.stepComplete[3] &&
            !!state.stepComplete[4];

          const completed =
            s.n === 5
              ? earlierStepsDone && (!!state.stepComplete[5] || (finalReportActive && !!state.gtmDone))
              : !!state.stepComplete[s.n];

          return (
            <button
              key={s.n}
              type="button"
              onClick={() => navigate(`/${s.path}`)}
              className={cn(
                'flex items-center gap-3 rounded-full pl-1 py-1 text-left text-sm text-sidebar-text transition cursor-pointer',
                active ? 'bg-brand' : 'hover:bg-white/5',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold',
                  completed
                    ? 'bg-brand text-white'
                    : active
                      ? 'bg-[#0B0F0B] text-white'
                      : 'bg-[#0B0F0B] text-sidebar-text',
                )}
              >
                {completed ? <Check size={16} strokeWidth={3} /> : pad2(s.n)}
              </span>
              <span className={cn((active || completed) && 'font-semibold text-white')}>{s.label}</span>
            </button>
          );
        })}

        {/* ── Horizontal Margin Divider ── */}
        <div className="my-1.5 px-3">
          <hr className="border-t border-sidebar-line/40 opacity-70" />
        </div>

        {/* ── Final Report Navigation Tab ── */}
        <button
          type="button"
          onClick={() => navigate(`/${FINAL_REPORT_STEP.path}`)}
          className={cn(
            'flex items-center gap-3 rounded-full pl-1 py-1 text-left text-sm text-sidebar-text transition cursor-pointer',
            finalReportActive ? 'bg-brand text-white' : 'hover:bg-white/5',
          )}
        >
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold',
              finalReportActive ? 'bg-[#0B0F0B] text-white' : 'bg-[#0B0F0B] text-sidebar-text',
            )}
          >
            <FileText size={16} />
          </span>
          <span className={cn(finalReportActive && 'font-semibold text-white')}>
            {FINAL_REPORT_STEP.label}
          </span>
        </button>
      </nav>

      {/* Saved Reports Footer */}
      <div className="mt-auto pb-4 px-4 ">
        <button
          type="button"
          onClick={() => navigate('/saved-reports')}
          className={cn(
            'mb-4 flex w-full items-center gap-2.5 rounded-full px-4 py-2.5 text-left text-base font-normal text-white transition cursor-pointer',
            savedReportsActive ? 'bg-brand' : 'hover:bg-white/8',
          )}
        >
          <Save size={18} />
          Saved Reports
        </button>
      </div>
    </aside>
  );
}