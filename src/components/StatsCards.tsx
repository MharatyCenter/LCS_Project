import { useEffect, useState } from 'react';
import { Users, Briefcase, CalendarDays, Gavel, TrendingUp } from 'lucide-react';
import { onRefresh } from '../utils/refreshUtils';
import * as clientsService from '../Services/clientsService';
import { getCases } from '../Services/casesService';
import { getEvents } from '../Services/eventsService';
import { getLawyers } from '../Services/lawyersService';

type Stat = {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string; // فئة CSS للأيقونة
  trendColor: string; // لون النص الثانوي
  bgColor: string; // لون خلفية البطاقة
  borderColor: string; // لون الحدود
  ringColor: string; // لون الحلقة حول الأيقونة
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

  // 💡 تم تحديث البيانات لتشمل كلاسات الألوان المبهرة
  const stats: Stat[] = [
    {
      label: 'إجمالي العملاء',
      value: counts.clients,
      icon: <Users className="h-6 w-6" />,
      iconClass: 'text-cyan-600',
      trendColor: 'text-cyan-900',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-100',
      ringColor: 'ring-cyan-100',
    },
    {
      label: 'القضايا النشطة',
      value: counts.openCases,
      icon: <Briefcase className="h-6 w-6" />,
      iconClass: 'text-amber-600',
      trendColor: 'text-amber-900',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      ringColor: 'ring-amber-100',
    },
    {
      label: 'أحداث اليوم',
      value: counts.eventsToday,
      icon: <CalendarDays className="h-6 w-6" />,
      iconClass: 'text-lime-600',
      trendColor: 'text-lime-900',
      bgColor: 'bg-lime-50',
      borderColor: 'border-lime-100',
      ringColor: 'ring-lime-100',
    },
    {
      label: 'المحامون النشطون',
      value: counts.lawyers,
      icon: <Gavel className="h-6 w-6" />,
      iconClass: 'text-purple-600',
      trendColor: 'text-purple-900',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      ringColor: 'ring-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          // 💡 دمج الألوان المبهرة في الخلفية والحدود
          className={`group relative overflow-hidden rounded-3xl border ${s.borderColor} ${s.bgColor} p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* لمسة بصرية خفيفة في الخلفية */}
          <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 ${s.iconClass.replace('text-','bg-')} pointer-events-none transition-transform group-hover:scale-125`} />

          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold ${s.trendColor} opacity-80`}>{s.label}</p>
              <p className={`mt-3 text-4xl font-extrabold tracking-tighter ${s.iconClass.replace('text-','text-')} nums`}>
                {loading ? <span className="opacity-50">—</span> : s.value}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`text-xs font-medium ${s.trendColor}`}>
                  {s.label === 'القضايا النشطة' ? `من ${counts.cases} قضية` : 
                   s.label === 'إجمالي العملاء' ? 'عميل مسجّل' : 
                   s.label === 'أحداث اليوم' ? 'جلسة / موعد' : 
                   'محامٍ في المكتب'}
                </span>
                <TrendingUp className={`h-3.5 w-3.5 ${s.iconClass} opacity-0 transition-opacity group-hover:opacity-100`} />
              </div>
            </div>
            
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-inner ring-4 ${s.ringColor} transition-transform duration-300 group-hover:scale-105`}>
              <div className={`${s.iconClass}`}>
                {s.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}