import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { TechFormState } from './wizardStore';

export interface SavedReport {
  id: string;
  savedAt: string;
  techKey: string;
  techType: string;
  techCategory?: string;
  tech: TechFormState;
  countries: string[];
}

const STORAGE_KEY = 'agripath.savedReports';

function loadReports(): SavedReport[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface SavedReportsContextValue {
  reports: SavedReport[];
  saveReport: (input: {
    techKey: string;
    techType: string;
    techCategory?: string;
    tech: TechFormState;
    countries: string[];
  }) => string;
  removeReport: (id: string) => void;
}

const SavedReportsContext = createContext<SavedReportsContextValue | null>(null);

export function SavedReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<SavedReport[]>(loadReports);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const saveReport = useCallback<SavedReportsContextValue['saveReport']>((input) => {
    const report: SavedReport = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      ...input,
    };
    setReports((prev) => [report, ...prev]);
    return report.id;
  }, []);

  const removeReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <SavedReportsContext.Provider value={{ reports, saveReport, removeReport }}>
      {children}
    </SavedReportsContext.Provider>
  );
}

export function useSavedReports(): SavedReportsContextValue {
  const ctx = useContext(SavedReportsContext);
  if (!ctx) throw new Error('useSavedReports must be used within a SavedReportsProvider');
  return ctx;
}