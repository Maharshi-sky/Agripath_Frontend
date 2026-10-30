// src/App.tsx
import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useOutletContext, useParams } from 'react-router-dom';
import Sidebar from './UI/Sidebar';
import Topbar from './UI/topbar';
import Toast from './UI/Toast';
import { STEPS, stepByPath } from './state/steps';
import { WizardProvider } from './state/wizardStore';
import { SavedReportsProvider } from './state/savedReportsStore';
import { useToast } from './state/useToast';

const Step1TechnologyDetails = lazy(() => import('./steps/Step1TechnologyDetails'));
const Step2TargetMarkets = lazy(() => import('./steps/Step2TargetMarkets'));
const Step3MatchAnalysis = lazy(() => import('./steps/Step3MatchAnalysis'));
const Step4RegulatoryPathway = lazy(() => import('./steps/Step4RegulatoryPathway'));
const Step5GoToMarketPlan = lazy(() => import('./steps/Step5GoToMarketPlan'));
const FinalReportPage = lazy(() => import('./pages/FinalReportPage'));
const SavedReportsList = lazy(() => import('./pages/SavedReportsList'));
const SavedReportDetail = lazy(() => import('./pages/SavedReportDetail'));

function PageFallback() {
  return <div className="h-1 w-full animate-pulse bg-brand-light" />;
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="mx-auto flex max-w-350 flex-col items-start px-14 py-16">
      <h1 className="mb-2 text-3xl font-bold text-ink">{label}</h1>
      <p className="text-muted">This step's design hasn't been supplied yet — sharing it next unlocks the build.</p>
    </div>
  );
}

type AppOutletContext = { onToast: (message: string) => void };

function StepRouter() {
  const { onToast } = useOutletContext<AppOutletContext>();
  const { stepPath } = useParams();
  const step = stepByPath(stepPath);

  if (!step) return <Navigate to={STEPS[0].path} replace />;
  if (step.n === 1) return <Step1TechnologyDetails onToast={onToast} />;
  if (step.n === 2) return <Step2TargetMarkets onToast={onToast} />;
  if (step.n === 3) return <Step3MatchAnalysis onToast={onToast} />;
  if (step.n === 4) return <Step4RegulatoryPathway onToast={onToast} />;
  if (step.n === 5) return <Step5GoToMarketPlan />;
  if (step.n === 6) return <FinalReportPage />;
  return <ComingSoon label={step.label} />;
}

function AppShell() {
  const { message, showToast } = useToast();

  return (
    <div className="flex h-screen overflow-hidden bg-cream print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Sidebar print ke time hide rahega */}
      <div className="print:hidden shrink-0">
        <Sidebar />
      </div>

      {/* Main scrollable body print ke time auto-height aur visible banega taaki multiple pages print ho sakein */}
      <div className="flex h-screen flex-1 flex-col overflow-y-auto print:h-auto print:overflow-visible print:block">
        <div className="print:hidden">
          <Topbar />
        </div>
        <main className="flex-1 print:h-auto print:overflow-visible print:block">
          <Suspense fallback={<PageFallback />}>
            <Outlet context={{ onToast: showToast } satisfies AppOutletContext} />
          </Suspense>
        </main>
      </div>
      <div className="print:hidden">
        <Toast message={message} />
      </div>
    </div>
  );
}

function App() {
  return (
    <WizardProvider>
      <SavedReportsProvider>
        <Routes>
          <Route element={<AppShell />}>
            {/* Root '/' aur '/overview' dono direct pehle step par redirect honge */}
            <Route path="/" element={<Navigate to={STEPS[0].path} replace />} />
            <Route path="overview" element={<Navigate to={STEPS[0].path} replace />} />
            <Route path="saved-reports" element={<SavedReportsList />} />
            <Route path="saved-reports/:reportId" element={<SavedReportDetail />} />
            <Route path="final-report" element={<FinalReportPage />} />
            <Route path=":stepPath" element={<StepRouter />} />
            <Route path="*" element={<Navigate to={STEPS[0].path} replace />} />
          </Route>
        </Routes>
      </SavedReportsProvider>
    </WizardProvider>
  );
}

export default App;