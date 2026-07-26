import { useEffect, useState } from 'react';
import { Users, Briefcase, CalendarDays, Gavel } from 'lucide-react';
import { onRefresh } from '../utils/refreshUtils';
import * as clientsService from '../Services/clientsService'; // 💡 استيراد آمن لتفادي خطأ الاسم النمطي
import { getCases } from '../Services/casesService';
import { getEvents } from '../Services/eventsService';
import { getLawyers } from '../Services/lawyersService';

type Stat = {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  iconColor: string;
  trend: string;
};

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function StatsCards() {
  const [counts, setCounts] = useState({ clients: 0, cases: 0, eventsToday: 0, openCases: 0, lawyers: 0 });
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const lawyerId = localStorage.getItem('lawyer_id') || '';

      // 💡 فحص ديناميكي لاسم الدالة المصدرة في ملف العملاء لتجنب انهيار التطبيق
      const fetchClientsFn = 
        (clientsService as any).getClients || 
        (clientsService as any).getClientsByLawyer || 
        (clientsService as any).default;

      const [cases, events, lawyers] = await Promise.all([
        getCases ? getCases() : Promise.resolve([]),
        getEvents ? getEvents() : Promise.resolve([]),
        getLawyers ? getLawyers() : Promise.resolve([]),
      ]);

      let clientsData = [];
      if (typeof fetchClientsFn === 'function') {
        clientsData = await fetchClientsFn(lawyerId);
      }

      const today = todayStr();
      setCounts({
        clients: Array.isArray(clientsData) ? clientsData.length : 0,
        cases: Array.isArray(cases) ? cases.length : 0,
        eventsToday: Array.isArray(events) ? events.filter((e: any) => e.event_date === today).length : 0,
        openCases: Array.isArray(cases) ? cases.filter((c: any) => c.status === 'Open').length : 0,
        lawyers: Array.isArray(lawyers) ? lawyers.filter((l: any) => l.status === 'Active').length : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    return onRefresh(() => load());
  }, []);

  const stats: Stat[] = [
    {
      label: 'إجمالي العملاء',
      value: counts.clients,
      icon: <Users className="h-5 w-5" />,
      gradient: 'from-navy-600 to-navy-800',
      iconColor: 'text-gold-300',
      trend: 'عميل مسجّل',
    },
    {
      label: 'القضايا النشطة',
      value: counts.openCases,
      icon: <Briefcase className="h-5 w-5" />,
      gradient: 'from-gold-500 to-gold-700',
      iconColor: 'text-white',
      trend: `من ${counts.cases} قضية`,
    },
    {
      label: 'أحداث اليوم',
      value: counts.eventsToday,
      icon: <CalendarDays className="h-5 w-5" />,
      gradient: 'from-emerald-500 to-emerald-700',
      iconColor: 'text-white',
      trend: 'جلسة / موعد',
    },
    {
      label: 'المحامون النشطون',
      value: counts.lawyers,
      icon: <Gavel className="h-5 w-5" />,
      gradient: 'from-slate-600 to-slate-800',
      iconColor: 'text-gold-300',
      trend: 'محامٍ في المكتب',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover animate-slide-up`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-opacity group-hover:opacity-100" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{s.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white nums">
                {loading ? <span className="text-white/50">—</span> : s.value}
              </p>
              <p className="mt-1 text-xs text-white/70">{s.trend}</p>
            </div>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ${s.iconColor} transition-transform group-hover:scale-110`}
            >
              {s.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}