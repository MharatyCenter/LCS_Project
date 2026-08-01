import { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Calendar as CalendarIcon, Clock, FileText, User } from 'lucide-react';
import { type EventItem } from './eventsService';

interface MonthlyCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
}

export default function MonthlyCalendarModal({ isOpen, onClose, events }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-7xl rounded-3xl bg-white shadow-2xl border border-gold-200/60 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* هيدر النافذة */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-navy-950 font-bold shadow-md">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">الأجندة الشهرية الشاملة</h3>
              <p className="text-xs text-gold-300">متابعة تفصيلية للأحداث، أرقام القضايا، وأسماء الموكلين خلال الشهر</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* أدوات التنقل بين الشهور */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-100">
          <button
            onClick={prevMonth}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy-900 hover:bg-gold-50 hover:border-gold-300 transition-all shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-gold-600" />
            <span>الشهر السابق</span>
          </button>

          <h2 className="text-base font-black text-navy-950 tracking-wide">
            {monthNames[month]} {year}
          </h2>

          <button
            onClick={nextMonth}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy-900 hover:bg-gold-50 hover:border-gold-300 transition-all shadow-sm"
          >
            <span>الشهر التالي</span>
            <ChevronLeft className="h-4 w-4 text-gold-600" />
          </button>
        </div>

        {/* شبكة أيام الأسبوع */}
        <div className="grid grid-cols-7 bg-navy-900 text-white text-center py-2.5 text-xs font-bold">
          <span>الأحد</span>
          <span>الإثنين</span>
          <span>الثلاثاء</span>
          <span>الأربعاء</span>
          <span>الخميس</span>
          <span>الجمعة</span>
          <span>السبت</span>
        </div>

        {/* شبكة أيام الشهر */}
        <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-slate-200 gap-px p-px overflow-y-auto">
          {daysArray.map((dayNum, index) => {
            if (dayNum === null) {
              return <div key={`empty-${index}`} className="bg-slate-50/40 min-h-[160px]" />;
            }

            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDayNum = String(dayNum).padStart(2, '0');
            const currentCellDateStr = `${year}-${formattedMonth}-${formattedDayNum}`;

            const dayEvents = events.filter((e) => e.event_date === currentCellDateStr);
            const isToday = currentCellDateStr === todayStr;

            return (
              <div
                key={`day-${dayNum}`}
                className={`bg-white p-2 min-h-[160px] flex flex-col justify-between transition-all hover:bg-gold-50/10 ${
                  isToday ? 'ring-2 ring-gold-500 z-10 bg-amber-50/20' : ''
                }`}
              >
                {/* رأس الخلية (رقم اليوم وعدد الأحداث) */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday ? 'bg-gold-500 text-navy-950 shadow-sm' : 'text-slate-700 bg-slate-100'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-900 text-gold-400">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* تفاصيل الأحداث داخل اليوم مصممة بوضوح تام */}
                <div className="space-y-1.5 overflow-y-auto max-h-[120px] pr-0.5">
                  {dayEvents.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded-xl bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border border-gold-200 text-navy-900 shadow-2xs space-y-1"
                    >
                      {/* نوع الحدث أو عنوانه مع الوقت */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-navy-950 truncate flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-gold-600 flex-shrink-0" />
                          {ev.title}
                        </span>
                        {ev.event_time && (
                          <span className="text-[10px] nums font-semibold text-gold-700 bg-gold-100/70 px-1.5 py-0.5 rounded flex items-center gap-0.5 flex-shrink-0">
                            <Clock className="h-2.5 w-2.5" />
                            {ev.event_time.slice(0, 5)}
                          </span>
                        )}
                      </div>

                      {/* رقم القضية واسم الموكل بوضوح */}
                      <div className="grid grid-cols-1 gap-0.5 pt-1 border-t border-gold-200/50 text-[11px]">
                        {ev.case_number && (
                          <div className="flex items-center gap-1 text-navy-800 font-semibold truncate">
                            <FileText className="h-3 w-3 text-gold-600 flex-shrink-0" />
                            <span className="truncate">قضية رقم: {ev.case_number}</span>
                          </div>
                        )}
                        {ev.client_name && (
                          <div className="flex items-center gap-1 text-slate-600 truncate">
                            <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">الموكل: {ev.client_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* تذليل النافذة */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-100">
          <p className="text-xs text-slate-500">تم تصميم البطاقات خصيصاً لإبراز نوع الحدث، رقم القضية، واسم الموكل فوراً.</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-all shadow-sm"
          >
            إغلاق الأجندة
          </button>
        </div>

      </div>
    </div>
  );
}