import { useEffect, useState } from 'react';
import { CalendarDays, Calendar, Clock, MapPin, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { getEvents, type EventItem } from './eventsService';
import MonthlyCalendarModal from './MonthlyCalendarModal'; // استيراد الأجندة الشهرية

function getDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function TodayAndTomorrowEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // حالة فتح الأجندة
  const [isCollapsed, setIsCollapsed] = useState(false); // حالة طي أو توسيع القسم

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading events summary:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const todayStr = getDateStr(0);
  const tomorrowStr = getDateStr(1);

  const todayEvents = events.filter((e) => e.event_date === todayStr);
  const tomorrowEvents = events.filter((e) => e.event_date === tomorrowStr);

  const todayDateObj = new Date();
  const tomorrowDateObj = new Date();
  tomorrowDateObj.setDate(todayDateObj.getDate() + 1);

  const formattedToday = todayDateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const formattedTomorrow = tomorrowDateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-4">
      {/* شريط العنوان العلوي مع زر الطي ورابط الأجندة الشهرية */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title={isCollapsed ? "توسيع القسم" : "طي القسم"}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-gold-600" />
            <h3 className="text-base font-bold text-navy-900">جدول الأحداث والمواعيد</h3>
          </div>
        </div>

        {/* زر فتح الأجندة الشهرية */}
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 bg-white border border-slate-200 hover:bg-gold-50/60 hover:border-gold-300 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <span>الأجندة الشهرية</span>
          <ArrowLeft className="h-3.5 w-3.5 text-gold-600" />
        </button>
      </div>

      {/* محتوى القسم الذي يتم إخفاؤه أو إظهاره عند الطي */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          
          {/* نصف اليوم */}
          <div className="rounded-2xl border border-gold-200/60 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 p-5 shadow-card">
            <div className="flex items-center justify-between border-b border-gold-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 px-3 items-center justify-center rounded-xl bg-gold-500 text-navy-950 font-bold text-xs shadow-sm">
                  اليوم
                </span>
                <span className="text-xs font-bold text-navy-900">{formattedToday}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold-500/10 text-gold-700 border border-gold-500/20">
                {todayEvents.length} أحداث
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">جارٍ التحميل...</div>
            ) : todayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-600 mb-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-slate-600">لا توجد أحداث مجدولة لليوم.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pl-1">
                {todayEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-3.5 rounded-xl border border-gold-100/80 bg-white/80 hover:bg-white hover:shadow-sm transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-navy-900 leading-snug">{e.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex-shrink-0">
                        {e.status === 'Scheduled' ? 'مجدول' : e.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {e.event_time && (
                        <span className="flex items-center gap-1 nums font-medium text-gold-700 bg-gold-50 px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3" />
                          {e.event_time.slice(0, 5)}
                        </span>
                      )}
                      {e.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* نصف الغد */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/40 p-5 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 px-3 items-center justify-center rounded-xl bg-slate-800 text-white font-bold text-xs shadow-sm">
                  الغد
                </span>
                <span className="text-xs font-bold text-slate-700">{formattedTomorrow}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {tomorrowEvents.length} أحداث
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">جارٍ التحميل...</div>
            ) : tomorrowEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-slate-500">لا توجد أحداث مجدولة ليوم الغد.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pl-1">
                {tomorrowEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-white/80 hover:bg-white hover:shadow-sm transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-navy-900 leading-snug">{e.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex-shrink-0">
                        {e.status === 'Scheduled' ? 'مجدول' : e.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {e.event_time && (
                        <span className="flex items-center gap-1 nums font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3" />
                          {e.event_time.slice(0, 5)}
                        </span>
                      )}
                      {e.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* نافذة الأجندة الشهرية المنبثقة */}
      <MonthlyCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        events={events}
      />
    </div>
  );
}