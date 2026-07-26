import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsCards from './StatsCards';
import DailyEvents from './DailyEvents';
import LawyersManager from './LawyersManager';
import ClientsManager from './ClientsManager';
import CasesManager from './CasesManager';
import EventsManager from './EventsManager';
import type { ViewKey } from './navConfig';

export default function DashboardContent() {
  const [view, setView] = useState<ViewKey>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(true);

  function navigate(key: ViewKey) {
    setView(key);
    setMobileNavOpen(false);
  }

  function selectClient(id: number | null) {
    setSelectedClientId(id);
    setSelectedCaseId(null);
  }

  return (
    <div dir="rtl" className="flex min-h-screen bg-slate-50">
      <Sidebar
        current={view}
        onNavigate={navigate}
        onSignOut={() => window.location.reload()}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header current={view} onOpenMobile={() => setMobileNavOpen(true)} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Toggle stats visibility */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 to-transparent" />
            <button
              onClick={() => setStatsVisible((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-navy-600 shadow-sm transition-all hover:border-gold-300 hover:bg-gold-50/40 hover:text-navy-800 hover:shadow-card"
            >
              {statsVisible ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  إخفاء العدادات
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  إظهار العدادات
                </>
              )}
            </button>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>

          {view === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {statsVisible && <StatsCards />}
              <DailyEvents onNavigate={navigate} />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ClientsManager onSelect={selectClient} selectedClientId={selectedClientId} />
                <CasesManager
                  selectedClientId={selectedClientId}
                  onSelect={setSelectedCaseId}
                  selectedCaseId={selectedCaseId}
                  onNavigate={navigate}
                />
              </div>
            </div>
          )}

          {view === 'lawyers' && (
            <div className="animate-fade-in">
              <LawyersManager />
            </div>
          )}

          {view === 'clients' && (
            <div className="animate-fade-in">
              <ClientsManager onSelect={selectClient} selectedClientId={selectedClientId} />
            </div>
          )}

          {view === 'cases' && (
            <div className="space-y-6 animate-fade-in">
              <ClientsManager onSelect={selectClient} selectedClientId={selectedClientId} />
              <CasesManager
                selectedClientId={selectedClientId}
                onSelect={setSelectedCaseId}
                selectedCaseId={selectedCaseId}
                onNavigate={navigate}
              />
            </div>
          )}

          {view === 'events' && (
            <div className="space-y-6 animate-fade-in">
              <CasesManager
                selectedClientId={null}
                onSelect={setSelectedCaseId}
                selectedCaseId={selectedCaseId}
              />
              <EventsManager selectedCaseId={selectedCaseId} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
