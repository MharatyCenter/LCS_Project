import { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { onRefresh } from '../utils/refreshUtils';
import { getEventsByDate, type EventItem } from '../Services/eventsService';
import { getCases } from '../Services/casesService';
import { Spinner, EmptyState } from './ui';
import type { ViewKey } from './navConfig';

type Props = {
  onNavigate: (key: ViewKey) => void;
};

function formatToday() {
  return new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DailyEvents({ onNavigate }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [caseTitles, setCaseTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [todayEvents, cases] = await Promise.all([
        getEventsByDate(today),
        getCases(),
      ]);
      setEvents(todayEvents);
      setCaseTitles(Object.fromEntries(cases.map((c) => [c.id, c.title])));
    } catch {
      /* keep empty */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => onRefresh(() => load()), []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 text-white shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-800">أحداث اليوم</h2>
            <p className="text-xs text-slate-400">{formatToday()}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('events')}
          className="group flex items-center gap-1 text-xs font-semibold text-navy-600 transition-colors hover:text-navy-800"
        >
          عرض الكل
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <EmptyState
          message="لا توجد أحداث أو جلسات مجدولة لليوم."
          icon={<CalendarDays className="h-6 w-6" />}
        />
      ) : (
        <ul className="space-y-2.5">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:border-gold-200 hover:bg-gold-50/30"
            >
              <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-navy-600 shadow-sm">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy-800">{e.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {caseTitles[e.case_id] ?? 'قضية غير محددة'}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  {e.event_time && <span className="nums">{e.event_time.slice(0, 5)}</span>}
                  {e.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {e.location}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
