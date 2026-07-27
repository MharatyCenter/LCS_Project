import { useState, useEffect } from 'react';
import { Eye, EyeOff, Menu, Bell, Scale, ShieldCheck, X } from 'lucide-react';
import StatsCards from './StatsCards';
import TodayAndTomorrowEvents from './TodayAndTomorrowEvents';
import ClientsManager from './ClientsManager';
import CasesManager from './CasesManager';
import EventsManager from './EventsManager';
import LawyersManager from './LawyersManager';
import { NAV_ITEMS, type ViewKey } from './navConfig';

export default function DashboardContent() {
  const [view, setView] = useState<ViewKey>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(true);

  const [userName, setUserName] = useState('عاطف موسى');
  const [officeName, setOfficeName] = useState('مكتب عاطف موسى للاستشارات القانونية');

  useEffect(() => {
    const storedLawyer = localStorage.getItem('lawyer_name');
    const storedOffice = localStorage.getItem('office_name');
    if (storedLawyer) setUserName(storedLawyer);
    if (storedOffice) setOfficeName(storedOffice);
  }, [view]);

  const activeItem = NAV_ITEMS.find((n) => n.key === view);

  function navigate(key: ViewKey) {
    setView(key);
    setMobileNavOpen(false);
  }

  function selectClient(id: number | null) {
    setSelectedClientId(id);
    setSelectedCaseId(null); // إعادة تعيين فلتر القضايا عند اختيار عميل جديد
  }

  const handleClearFilters = () => {
    setSelectedClientId(null);
    setSelectedCaseId(null);
  };

  return (
    <div dir="rtl" className="flex min-h-screen bg-slate-100 flex-col font-sans">
      
      {/* هيدر احترافي بتصميم فاخر */}
      <header className="sticky top-0 z-30 border-b border-gold-200/50 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 px-4 py-3.5 sm:px-8 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 shadow-lg text-navy-950 flex-shrink-0 ring-2 ring-gold-300/30">
              <Scale className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white sm:text-base tracking-wide">
                  {userName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  مدير النظام
                </span>
              </div>
              <p className="text-xs font-medium text-gold-300/90 mt-0.5">
                {officeName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-left pl-2 border-l border-slate-700/60">
              <p className="text-[11px] text-slate-400">القسم الحالي</p>
              <p className="text-xs font-semibold text-slate-200">{activeItem?.label ?? 'لوحة التحكم الرئيسية'}</p>
            </div>

            <button
              className="relative rounded-xl p-2.5 bg-slate-800/80 text-slate-300 hover:text-white transition-all hover:bg-slate-800 border border-slate-700/50 shadow-inner"
              aria-label="الإشعارات"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-500 ring-2 ring-navy-950 animate-pulse" />
            </button>

            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-xl p-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 shadow-md transition-all hover:brightness-110 font-bold"
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* شريط الفلتر النشط التفاعلي */}
        {(selectedClientId !== null || selectedCaseId !== null) && (
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-navy-900 to-navy-950 border border-gold-500/30 px-5 py-3.5 text-white shadow-lg animate-fade-in">
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <span className="flex h-7 px-2.5 items-center justify-center rounded-xl bg-gold-500 text-navy-950 font-bold text-xs">
                فلتر نشط
              </span>
              <div className="flex items-center gap-2 text-slate-200">
                {selectedClientId !== null && (
                  <span className="font-semibold text-gold-300">عرض قضايا العميل المختار</span>
                )}
                {selectedCaseId !== null && (
                  <>
                    {selectedClientId !== null && <span className="text-slate-500">/</span>}
                    <span className="font-semibold text-gold-300">عرض أحداث القضية رقم: {selectedCaseId}</span>
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-all border border-white/10"
              title="إلغاء التصفية وعرض كافة البيانات"
            >
              <X className="h-3.5 w-3.5 text-gold-400" />
              <span>إلغاء التصفية</span>
            </button>
          </div>
        )}

        {/* زر إخفاء/إظهار العدادات */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 to-transparent" />
          <button
            onClick={() => setStatsVisible((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white px-5 py-2 text-xs font-semibold text-navy-700 shadow-sm transition-all hover:border-gold-400 hover:bg-gold-50/60 hover:text-navy-900"
          >
            {statsVisible ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-navy-500" />
                إخفاء العدادات
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-navy-500" />
                إظهار العدادات
              </>
            )}
          </button>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </div>

        {view === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {statsVisible && <StatsCards />}
            
            {/* 1. قسم أحداث اليوم وغداً */}
            <TodayAndTomorrowEvents />
            
            {/* 2. الأقسام الثلاثة الرئيسية مرتبطة وتتفاعل مع النقرات */}
            <div className="space-y-6 pt-4 border-t border-slate-200">
              {/* قسم الموكلين - الضغط على اسم العميل يفلتر القضايا */}
              <ClientsManager onSelect={selectClient} selectedClientId={selectedClientId} />
              
              {/* قسم القضايا - الضغط على القضية يفلتر الأحداث */}
              <CasesManager
                selectedClientId={selectedClientId}
                onSelect={(caseId) => setSelectedCaseId(caseId)}
                selectedCaseId={selectedCaseId}
                onNavigate={navigate}
              />

              {/* قسم إدارة وإضافة وتعديل وحذف الأحداث - يتأثر بالقضية المختارة */}
              <EventsManager selectedCaseId={selectedCaseId} />
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
              onSelect={(caseId) => setSelectedCaseId(caseId)}
              selectedCaseId={selectedCaseId}
              onNavigate={navigate}
            />
          </div>
        )}

        {view === 'events' && (
          <div className="space-y-6 animate-fade-in">
            <CasesManager
              selectedClientId={null}
              onSelect={(caseId) => setSelectedCaseId(caseId)}
              selectedCaseId={selectedCaseId}
            />
            <EventsManager selectedCaseId={selectedCaseId} />
          </div>
        )}
      </main>
    </div>
  );
}