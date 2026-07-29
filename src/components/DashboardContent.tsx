import React, { useState, useEffect } from 'react';
import { supabase } from '../Services/supabaseClient';
import {
  Users,
  Briefcase,
  Calendar,
  Shield,
  Plus,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Clock,
  Menu,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

export default function DashboardContent() {
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  const [clientTypes, setClientTypes] = useState<string[]>(['فردي', 'شركة', 'مؤسسة']);
  const [poaTypes, setPoaTypes] = useState<string[]>(['توكيل عام رسمي', 'توكيل خاص', 'توكيل قضايا']);
  const [sectors, setSectors] = useState<string[]>(['مدني', 'تجاري', 'إداري']);
  const [entities, setEntities] = useState<string[]>(['محكمة الابتدائية', 'محكمة الاستئناف', 'مجلس الدولة']);
  
  const [caseTypes, setCaseTypes] = useState<string[]>(['مدني مستعجل', 'تجاري', 'عمالي', 'إداري']);
  const [litigationDegrees, setLitigationDegrees] = useState<string[]>(['ابتدائي', 'استئناف', 'نقض']);
  const [opponentTypes, setOpponentTypes] = useState<string[]>(['مدعى عليه', 'متهم', 'مستأنف ضده']);
  
  const [eventTypes, setEventTypes] = useState<string[]>(['جلسة مرافعة', 'تقديم مستندات', 'النطق بالحكم']);
  const [eventStatuses, setEventStatuses] = useState<string[]>(['قيد الانتظار', 'تم الحجز للحكم', 'منتهي']);
  
  const [clientSearch, setClientSearch] = useState('');
  const [caseSearch, setCaseSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  
  const [selectedClientIdFilter, setSelectedClientIdFilter] = useState<number | null>(null);
  const [selectedCaseIdFilter, setSelectedCaseIdFilter] = useState<number | null>(null);
  
  const [showAllClientsOverride, setShowAllClientsOverride] = useState(false);
  const [showAllCasesOverride, setShowAllCasesOverride] = useState(false);
  const [showAllEventsOverride, setShowAllEventsOverride] = useState(false);
  
  // حالة التحكم في طي وتوسيع قسم العدادات والإحصائيات
  const [expandStats, setExpandStats] = useState(true);
  const [expandClients, setExpandClients] = useState(true);
  const [expandCases, setExpandCases] = useState(true);
  const [expandEvents, setExpandEvents] = useState(true);
  
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [editingCase, setEditingCase] = useState<any | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  
  const [showMonthlyAgendaModal, setShowMonthlyAgendaModal] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedEventDetails, setSelectedEventDetails] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userOfficeInfo = {
    officeName: "مكتب الأستاذ المحامي / عكاشة",
    subTitle: "النظام القانوني الموحد"
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const { data: clientsData } = await supabase.from('clients').select('*').order('client_name', { ascending: true });
      if (clientsData) setClients(clientsData);
      
      const { data: casesData } = await supabase.from('cases').select('*, clients(client_name)').order('case_number', { ascending: true });
      if (casesData) setCases(casesData);
      
      const { data: eventsData } = await supabase.from('events').select('*, cases(case_number, opponent_name, litigation_degree, client_id, clients(client_name))').order('event_date', { ascending: false });
      if (eventsData) setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDelete = async (table: string, id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) {
        fetchAllData();
      } else {
        alert('خطأ أثناء الحذف: ' + error.message);
      }
    }
  };

  const handleAddDynamicOption = (title: string, setter: React.Dispatch<React.SetStateAction<string[]>>, currentList: string[]) => {
    const newVal = prompt('أدخل البند الجديد لـ ' + title + ':');
    if (newVal && newVal.trim() !== '') {
      if (!currentList.includes(newVal.trim())) {
        setter([...currentList, newVal.trim()]);
      }
    }
  };

  const handleClientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientData = {
      client_name: formData.get('client_name'),
      contract_date: formData.get('contract_date') || null,
      power_of_attorney_type: formData.get('power_of_attorney_type'),
      power_of_attorney_number: formData.get('power_of_attorney_number'),
      client_type: formData.get('client_type'),
      phone: formData.get('phone'),
      sector: formData.get('sector'),
      entity: formData.get('entity'),
      notes: formData.get('notes'),
    };
    let error;
    if (editingClient) {
      const res = await supabase.from('clients').update(clientData).eq('id', editingClient.id);
      error = res.error;
    } else {
      const res = await supabase.from('clients').insert([clientData]);
      error = res.error;
    }
    if (!error) {
      setShowClientModal(false);
      setEditingClient(null);
      fetchAllData();
    } else {
      alert('خطأ أثناء حفظ الموكل: ' + error.message);
    }
  };

  const handleCaseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const caseData = {
      case_number: formData.get('case_number'),
      case_date: formData.get('case_date') || null,
      case_type: formData.get('case_type'),
      client_id: formData.get('client_id') ? Number(formData.get('client_id')) : null,
      opponent_name: formData.get('opponent_name'),
      opponent_type: formData.get('opponent_type'),
      litigation_degree: formData.get('litigation_degree'),
      notes: formData.get('notes'),
    };
    let error;
    if (editingCase) {
      const res = await supabase.from('cases').update(caseData).eq('id', editingCase.id);
      error = res.error;
    } else {
      const res = await supabase.from('cases').insert([caseData]);
      error = res.error;
    }
    if (!error) {
      setShowCaseModal(false);
      setEditingCase(null);
      fetchAllData();
    } else {
      alert('خطأ أثناء حفظ القضية: ' + error.message);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventData = {
      event_date: formData.get('event_date') || null,
      event_type: formData.get('event_type'),
      event_name: formData.get('event_name'),
      case_id: formData.get('case_id') ? Number(formData.get('case_id')) : null,
      event_status: formData.get('event_status'),
      notes: formData.get('notes'),
    };
    let error;
    if (editingEvent) {
      const res = await supabase.from('events').update(eventData).eq('id', editingEvent.id);
      error = res.error;
    } else {
      const res = await supabase.from('events').insert([eventData]);
      error = res.error;
    }
    if (!error) {
      setShowEventModal(false);
      setEditingEvent(null);
      fetchAllData();
    } else {
      alert('خطأ أثناء حفظ الحدث: ' + error.message);
    }
  };

  const filteredClients = clients.filter(c => c.client_name?.toLowerCase().includes(clientSearch.toLowerCase()));
  const displayedClients = showAllClientsOverride ? filteredClients : filteredClients.slice(0, 3);
  
  const filteredCases = cases.filter(cs => {
    const matchesSearch = cs.case_number?.toLowerCase().includes(caseSearch.toLowerCase()) || cs.opponent_name?.toLowerCase().includes(caseSearch.toLowerCase());
    const matchesClientFilter = (selectedClientIdFilter && !showAllCasesOverride) ? cs.client_id === selectedClientIdFilter : true;
    return matchesSearch && matchesClientFilter;
  });
  const displayedCases = showAllCasesOverride ? filteredCases : filteredCases.slice(0, 5);

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.event_name?.toLowerCase().includes(eventSearch.toLowerCase()) || ev.cases?.case_number?.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesCaseFilter = (selectedCaseIdFilter && !showAllEventsOverride) ? ev.case_id === selectedCaseIdFilter : true;
    return matchesSearch && matchesCaseFilter;
  });
  const displayedEvents = showAllEventsOverride ? filteredEvents : filteredEvents.slice(0, 10);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const todayEvents = events.filter(ev => ev.event_date === todayStr);
  const tomorrowEvents = events.filter(ev => ev.event_date === tomorrowStr);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({ day: null, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    calendarDays.push({ day: d, dateStr });
  }

  const selectedClientObj = clients.find(c => c.id === selectedClientIdFilter);
  const selectedCaseObj = cases.find(cs => cs.id === selectedCaseIdFilter);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      
      <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-blue-900/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-blue-900/60 hover:bg-blue-800 rounded-xl transition text-blue-200 border border-blue-700/50"
            title="القائمة الجانبية"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600/30 rounded-xl flex items-center justify-center text-blue-300 font-black shadow-inner border border-blue-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h2 className="font-bold text-white text-base tracking-wide">{userOfficeInfo.officeName}</h2>
              <p className="text-xs text-blue-300/80">{userOfficeInfo.subTitle}</p>
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={() => { 
              setSelectedClientIdFilter(null); 
              setSelectedCaseIdFilter(null); 
              setShowAllClientsOverride(false);
              setShowAllCasesOverride(false); 
              setShowAllEventsOverride(false); 
            }}
            className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-bold text-white transition border border-white/10 backdrop-blur-sm"
          >
            إلغاء الفلاتر النشطة
          </button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* قسم مؤشرات الإحصائيات الأساسية (العدادات) مع زر الطي والتوسيع وأحداث اليوم والغد */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3 border-blue-900/20">
            <div className="flex items-center gap-3">
              <button onClick={() => setExpandStats(!expandStats)} className="text-blue-900 hover:text-black">
                {expandStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <h3 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                لوحة العدادات والإحصائيات العامة
              </h3>
            </div>
          </div>

          {expandStats && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between border-r-4 border-r-blue-900">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">عدد الموكلين</p>
                    <h3 className="text-3xl font-black text-blue-950 mt-1">{clients.length}</h3>
                  </div>
                  <div className="p-3.5 bg-blue-50 text-blue-900 rounded-2xl shadow-sm"><Users className="w-6 h-6" /></div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between border-r-4 border-r-rose-800">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">عدد القضايا</p>
                    <h3 className="text-3xl font-black text-rose-950 mt-1">{cases.length}</h3>
                  </div>
                  <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl shadow-sm"><Briefcase className="w-6 h-6" /></div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between border-r-4 border-r-emerald-700">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">إجمالي الأحداث</p>
                    <h3 className="text-3xl font-black text-emerald-950 mt-1">{events.length}</h3>
                  </div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl shadow-sm"><Calendar className="w-6 h-6" /></div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between border-r-4 border-r-amber-600">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">أحداث اليوم</p>
                    <h3 className="text-3xl font-black text-amber-950 mt-1">{todayEvents.length}</h3>
                  </div>
                  <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl shadow-sm"><Clock className="w-6 h-6" /></div>
                </div>
              </div>

              {/* قسم تفاصيل أحداث اليوم والغد المدمجة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-xl">
                  <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700" /> جلسات وأحداث اليوم ({todayEvents.length})
                  </h4>
                  {todayEvents.length === 0 ? (
                    <p className="text-xs text-slate-500">لا توجد أحداث مسجلة لليوم.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {todayEvents.map((ev, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-amber-100 text-xs flex justify-between items-center">
                          <span className="font-bold text-amber-950">{ev.event_name}</span>
                          <span className="text-slate-500 text-[11px]">قضية: {ev.cases?.case_number || '-'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50/50 border border-blue-200/60 p-4 rounded-xl">
                  <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-700" /> جلسات وأحداث الغد ({tomorrowEvents.length})
                  </h4>
                  {tomorrowEvents.length === 0 ? (
                    <p className="text-xs text-slate-500">لا توجد أحداث مسجلة للغد.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {tomorrowEvents.map((ev, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-blue-100 text-xs flex justify-between items-center">
                          <span className="font-bold text-blue-950">{ev.event_name}</span>
                          <span className="text-slate-500 text-[11px]">قضية: {ev.cases?.case_number || '-'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-start">
          <button
            onClick={() => { setSelectedEventDetails(null); setShowMonthlyAgendaModal(true); }}
            className="bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white px-6 py-3.5 rounded-2xl shadow-md flex items-center gap-3 font-bold text-base transition border border-blue-800/60 group"
          >
            <div className="p-2 bg-white/10 rounded-xl group-hover:scale-110 transition">
              <CalendarDays className="w-5 h-5 text-amber-400" />
            </div>
            <span>عرض شبكة الأجندة الشهرية للجلسات والأحداث</span>
          </button>
        </div>

        {/* قسم الموكلين */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 border-blue-900/20 gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setExpandClients(!expandClients)} className="text-blue-900 hover:text-black">
                {expandClients ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <h3 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-900" /> إدارة الموكلين 
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-normal">
                  (عرض {displayedClients.length} من {filteredClients.length})
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={showAllClientsOverride}
                  onChange={(e) => setShowAllClientsOverride(e.target.checked)}
                  className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900"
                />
                <span>عرض كل الموكلين (تجاوز حد 3)</span>
              </label>
              <button onClick={() => { setEditingClient(null); setShowClientModal(true); }} className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-bold shadow-sm transition">
                <Plus className="w-4 h-4" /> إضافة موكل جديد
              </button>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
            <input
              type="text"
              placeholder="بحث شامل في الموكلين..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/50"
            />
          </div>
          {expandClients && (
            <div className="overflow-x-auto">
              <p className="text-xs text-blue-900 mb-2 font-bold">*(انقر على أي موكل لتصفية القضايا المرتبطة به أدناه)</p>
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-blue-950 text-white text-xs">
                    <th className="p-3 rounded-r-xl">اسم الموكل</th>
                    <th className="p-3">نوع الموكل</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">تاريخ التعاقد</th>
                    <th className="p-3 text-center rounded-l-xl">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {displayedClients.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-6 text-gray-400">لا توجد سجلات موكلين</td></tr>
                  ) : (
                    displayedClients.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedClientIdFilter(selectedClientIdFilter === c.id ? null : c.id)}
                        className={`cursor-pointer transition ${selectedClientIdFilter === c.id ? 'bg-blue-100 font-bold' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-3 text-blue-950 font-bold">{c.client_name} {selectedClientIdFilter === c.id && ' (✔ محدد)'}</td>
                        <td className="p-3">{c.client_type || '-'}</td>
                        <td className="p-3">{c.phone || '-'}</td>
                        <td className="p-3">{c.contract_date || '-'}</td>
                        <td className="p-3 flex justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingClient(c); setShowClientModal(true); }}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="تعديل الموكل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete('clients', c.id); }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف الموكل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* قسم القضايا */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 border-rose-900/20 gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setExpandCases(!expandCases)} className="text-rose-900 hover:text-black">
                {expandCases ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <h3 className="text-lg font-bold text-rose-950 flex items-center gap-2 flex-wrap">
                <Briefcase className="w-5 h-5 text-rose-800" /> إدارة القضايا
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-normal">
                  (عرض {displayedCases.length} من {filteredCases.length})
                </span>
                {selectedClientObj && (
                  <span className="text-xs text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold">
                    الموكل المحدد: {selectedClientObj.client_name}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={showAllCasesOverride}
                  onChange={(e) => setShowAllCasesOverride(e.target.checked)}
                  className="w-4 h-4 text-rose-800 rounded focus:ring-rose-800"
                />
                <span>عرض كل القضايا (تجاوز حد 5 وإلغاء فلتر الموكل)</span>
              </label>
              <button onClick={() => { setEditingCase(null); setShowCaseModal(true); }} className="bg-rose-800 hover:bg-rose-900 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-bold shadow-sm transition">
                <Plus className="w-4 h-4" /> إضافة قضية جديدة
              </button>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
            <input
              type="text"
              placeholder="بحث برقم القضية أو اسم الخصم..."
              value={caseSearch}
              onChange={(e) => setCaseSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-800 bg-slate-50/50"
            />
          </div>
          {expandCases && (
            <div className="overflow-x-auto">
              <p className="text-xs text-rose-900 mb-2 font-bold">*(انقر على أي قضية لتصفية الأحداث المرتبطة بها أدناه)</p>
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-rose-950 text-white text-xs">
                    <th className="p-3 rounded-r-xl">رقم القضية</th>
                    <th className="p-3">تاريخ القضية</th>
                    <th className="p-3">اسم الخصم</th>
                    <th className="p-3 text-center rounded-l-xl">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {displayedCases.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-6 text-gray-400">لا توجد قضايا مطابقة</td></tr>
                  ) : (
                    displayedCases.map((cs) => (
                      <tr
                        key={cs.id}
                        onClick={() => setSelectedCaseIdFilter(selectedCaseIdFilter === cs.id ? null : cs.id)}
                        className={`cursor-pointer transition ${selectedCaseIdFilter === cs.id ? 'bg-rose-100 font-bold' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-3 text-rose-950 font-bold">{cs.case_number} {selectedCaseIdFilter === cs.id && ' (✔ محدد)'}</td>
                        <td className="p-3">{cs.case_date || '-'}</td>
                        <td className="p-3 font-semibold text-slate-800">{cs.opponent_name || '-'}</td>
                        <td className="p-3 flex justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingCase(cs); setShowCaseModal(true); }}
                            className="p-1.5 text-rose-800 hover:bg-rose-50 rounded-lg transition"
                            title="تعديل القضية"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete('cases', cs.id); }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف القضية"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* قسم الأحداث */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 border-emerald-900/20 gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setExpandEvents(!expandEvents)} className="text-emerald-800 hover:text-black">
                {expandEvents ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2 flex-wrap">
                <Calendar className="w-5 h-5 text-emerald-700" /> إدارة الأحداث والجلسات
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-normal">
                  (عرض {displayedEvents.length} من {filteredEvents.length})
                </span>
                {selectedCaseObj && (
                  <span className="text-xs text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full font-bold">
                    القضية: {selectedCaseObj.case_number} (الخصم: {selectedCaseObj.opponent_name || '-'})
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={showAllEventsOverride}
                  onChange={(e) => setShowAllEventsOverride(e.target.checked)}
                  className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700"
                />
                <span>عرض كل الأحداث (تجاوز حد 10 وإلغاء فلتر القضية)</span>
              </label>
              <button onClick={() => { setEditingEvent(null); setShowEventModal(true); }} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-bold shadow-sm transition">
                <Plus className="w-4 h-4" /> إضافة حدث جديد
              </button>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
            <input
              type="text"
              placeholder="بحث باسم الحدث أو نوعه أو رقم القضية..."
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
          {expandEvents && (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-emerald-950 text-white text-xs">
                    <th className="p-3 rounded-r-xl">اسم الحدث</th>
                    <th className="p-3">تاريخ الحدث</th>
                    <th className="p-3">نوع الحدث</th>
                    <th className="p-3">القضية المرتبطة</th>
                    <th className="p-3 text-center rounded-l-xl">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {displayedEvents.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-6 text-gray-400">لا توجد أحداث مطابقة</td></tr>
                  ) : (
                    displayedEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-gray-900">{ev.event_name}</td>
                        <td className="p-3">{ev.event_date || '-'}</td>
                        <td className="p-3"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold">{ev.event_type}</span></td>
                        <td className="p-3">{ev.cases?.case_number || '-'}</td>
                        <td className="p-3 flex justify-center gap-2">
                          <button
                            onClick={() => { setEditingEvent(ev); setShowEventModal(true); }}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="تعديل الحدث"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete('events', ev.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف الحدث"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* نافذة الأجندة الشهرية */}
      {showMonthlyAgendaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl max-h-[95vh] overflow-y-auto border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-900 text-amber-400 rounded-2xl shadow-sm">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-950">الأجندة الشهرية للجلسات والأحداث</h3>
                    <p className="text-xs text-slate-500">انقر على أي حدث داخل التقويم لعرض تفاصيله الكاملة أسفل النافذة</p>
                  </div>
                </div>
                <button onClick={() => setShowMonthlyAgendaModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                <button
                  onClick={() => { setCurrentCalendarDate(new Date(year, month - 1, 1)); setSelectedEventDetails(null); }}
                  className="p-2 bg-white border border-slate-200 hover:bg-blue-900 hover:text-white rounded-xl transition flex items-center gap-1 font-bold text-sm"
                >
                  <ChevronRight className="w-4 h-4" /> الشهر السابق
                </button>
                <h4 className="text-lg font-black text-blue-950">
                  {monthNames[month]} {year}
                </h4>
                <button
                  onClick={() => { setCurrentCalendarDate(new Date(year, month + 1, 1)); setSelectedEventDetails(null); }}
                  className="p-2 bg-white border border-slate-200 hover:bg-blue-900 hover:text-white rounded-xl transition flex items-center gap-1 font-bold text-sm"
                >
                  الشهر القادم <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center font-bold text-xs text-blue-950 mb-2 bg-blue-50/50 py-2.5 rounded-xl">
                <div>الأحد</div>
                <div>الإثنين</div>
                <div>الثلاثاء</div>
                <div>الأربعاء</div>
                <div>الخميس</div>
                <div>الجمعة</div>
                <div>السبت</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((item, index) => {
                  const dayEvents = item.dateStr ? events.filter(ev => ev.event_date === item.dateStr) : [];
                  const isToday = item.dateStr === todayStr;
                  return (
                    <div
                      key={index}
                      className={`min-h-[110px] p-2 rounded-2xl border transition flex flex-col justify-between ${
                        !item.dateStr
                          ? 'bg-slate-50/30 border-transparent cursor-default'
                          : isToday
                          ? 'bg-amber-50/60 border-amber-400 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-black ${isToday ? 'bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                          {item.day}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayEvents.map((ev, i) => {
                          const isSelectedEv = selectedEventDetails?.id === ev.id;
                          return (
                            <div
                              key={i}
                              onClick={(e) => { e.stopPropagation(); setSelectedEventDetails(ev); }}
                              className={`text-[10px] px-2 py-1 rounded-md truncate font-bold cursor-pointer transition shadow-xs flex items-center justify-between ${
                                isSelectedEv
                                  ? 'bg-amber-500 text-white ring-2 ring-blue-950'
                                  : 'bg-blue-900 hover:bg-blue-800 text-white'
                              }`}
                              title="انقر لعرض تفاصيل الحدث"
                            >
                              <span>{ev.event_name}</span>
                              <Info className="w-3 h-3 ml-1 text-amber-300 inline" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedEventDetails ? (
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-2xl shadow-xl border border-blue-800/60 space-y-3">
                  <div className="flex justify-between items-center border-b border-blue-800/50 pb-3">
                    <h5 className="font-bold text-base text-amber-400 flex items-center gap-2">
                      <Info className="w-5 h-5" /> تفاصيل الحدث / الجلسة المختارة:
                    </h5>
                    <button
                      onClick={() => setSelectedEventDetails(null)}
                      className="text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl font-bold transition"
                    >
                      إخفاء التفاصيل
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">اسم الحدث:</span>
                      <strong className="text-white text-sm">{selectedEventDetails.event_name}</strong>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">نوع الحدث / الحالة:</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md font-bold">{selectedEventDetails.event_type}</span>
                      <span className="mr-2 px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md font-bold">{selectedEventDetails.event_status || 'قيد الانتظار'}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">تاريخ الجلسة:</span>
                      <strong className="text-amber-300 text-sm">{selectedEventDetails.event_date || '-'}</strong>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">رقم القضية المرتبطة:</span>
                      <strong className="text-rose-300 text-sm">{selectedEventDetails.cases?.case_number || 'غير مرتبطة'}</strong>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">اسم الخصم:</span>
                      <strong className="text-white text-sm">{selectedEventDetails.cases?.opponent_name || '-'}</strong>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">درجة التقاضي:</span>
                      <strong className="text-white text-sm">{selectedEventDetails.cases?.litigation_degree || '-'}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-bold">
                  💡 إرشاد: انقر على أي شريط أزرق لأي حدث داخل خلايا التقويم بالأعلى لتظهر تفاصيله الكاملة هنا فوراً.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-6 border-t mt-6">
              <button 
                type="button" 
                onClick={() => setShowMonthlyAgendaModal(false)} 
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold shadow transition"
              >
                إغلاق الأجندة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نوافذ الحوار الخاصة بالمتاجر والبيانات (الموكلين، القضايا، الأحداث) */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-blue-950">{editingClient ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}</h3>
              <button onClick={() => { setShowClientModal(false); setEditingClient(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleClientSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">اسم الموكل</label>
                  <input type="text" name="client_name" defaultValue={editingClient?.client_name || ''} required className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">رقم الهاتف</label>
                  <input type="text" name="phone" defaultValue={editingClient?.phone || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">نوع الموكل</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('نوع الموكل', setClientTypes, clientTypes)}
                      className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="client_type" defaultValue={editingClient?.client_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-blue-900">
                    <option value="">-- اختر نوع الموكل --</option>
                    {clientTypes.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">تاريخ التعاقد</label>
                  <input type="date" name="contract_date" defaultValue={editingClient?.contract_date || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">نوع التوكيل</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('نوع التوكيل', setPoaTypes, poaTypes)}
                      className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="power_of_attorney_type" defaultValue={editingClient?.power_of_attorney_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-blue-900">
                    <option value="">-- اختر نوع التوكيل --</option>
                    {poaTypes.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">رقم التوكيل</label>
                  <input type="text" name="power_of_attorney_number" defaultValue={editingClient?.power_of_attorney_number || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">القطاع</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('القطاع', setSectors, sectors)}
                      className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="sector" defaultValue={editingClient?.sector || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-blue-900">
                    <option value="">-- اختر القطاع --</option>
                    {sectors.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">الجهة</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('الجهة', setEntities, entities)}
                      className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="entity" defaultValue={editingClient?.entity || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-blue-900">
                    <option value="">-- اختر الجهة --</option>
                    {entities.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">ملاحظات</label>
                <textarea name="notes" defaultValue={editingClient?.notes || ''} rows={3} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => { setShowClientModal(false); setEditingClient(null); }} className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold shadow">{editingClient ? 'تحديث البيانات' : 'حفظ الموكل'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-rose-950">{editingCase ? 'تعديل بيانات القضية' : 'إضافة قضية جديدة'}</h3>
              <button onClick={() => { setShowCaseModal(false); setEditingCase(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCaseSubmit} className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-rose-900">الموكل (اختر من القائمة)</label>
                  <button
                    type="button"
                    onClick={() => { setEditingClient(null); setShowClientModal(true); }}
                    className="text-xs bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-rose-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة موكل جديد
                  </button>
                </div>
                <select name="client_id" defaultValue={editingCase?.client_id || ''} required className="w-full border rounded-xl p-2.5 outline-none bg-rose-50/50 focus:ring-2 focus:ring-rose-800">
                  <option value="">-- اختر الموكل التابع له القضية --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">رقم القضية</label>
                  <input type="text" name="case_number" defaultValue={editingCase?.case_number || ''} required className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-rose-800" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">تاريخ القضية</label>
                  <input type="date" name="case_date" defaultValue={editingCase?.case_date || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-rose-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">نوع القضية</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('نوع القضية', setCaseTypes, caseTypes)}
                      className="text-xs bg-rose-50 text-rose-900 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-rose-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="case_type" defaultValue={editingCase?.case_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-rose-800">
                    <option value="">-- اختر نوع القضية --</option>
                    {caseTypes.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">درجة التقاضي</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('درجة التقاضي', setLitigationDegrees, litigationDegrees)}
                      className="text-xs bg-rose-50 text-rose-900 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-rose-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="litigation_degree" defaultValue={editingCase?.litigation_degree || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-rose-800">
                    <option value="">-- اختر درجة التقاضي --</option>
                    {litigationDegrees.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">اسم الخصم</label>
                  <input type="text" name="opponent_name" defaultValue={editingCase?.opponent_name || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-rose-800" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">صفة الخصم</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('صفة الخصم', setOpponentTypes, opponentTypes)}
                      className="text-xs bg-rose-50 text-rose-900 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-rose-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="opponent_type" defaultValue={editingCase?.opponent_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-rose-800">
                    <option value="">-- اختر صفة الخصم --</option>
                    {opponentTypes.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">ملاحظات</label>
                <textarea name="notes" defaultValue={editingCase?.notes || ''} rows={3} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-rose-800"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => { setShowCaseModal(false); setEditingCase(null); }} className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-800 text-white rounded-xl font-bold shadow">{editingCase ? 'تحديث البيانات' : 'حفظ القضية'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-emerald-950">{editingEvent ? 'تعديل بيانات الحدث' : 'إضافة حدث أو جلسة جديدة'}</h3>
              <button onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleEventSubmit} className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-emerald-900">القضية المرتبطة (اختر القضية)</label>
                  <button
                    type="button"
                    onClick={() => { setEditingCase(null); setShowCaseModal(true); }}
                    className="text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة قضية جديدة
                  </button>
                </div>
                <select name="case_id" defaultValue={editingEvent?.case_id || ''} required className="w-full border rounded-xl p-2.5 outline-none bg-emerald-50/50 focus:ring-2 focus:ring-emerald-700">
                  <option value="">-- اختر القضية التابع لها الحدث --</option>
                  {cases.map(cs => <option key={cs.id} value={cs.id}>قضية رقم: {cs.case_number} (الخصم: {cs.opponent_name || '-'})^{' '}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">اسم الحدث / الجلسة</label>
                  <input type="text" name="event_name" defaultValue={editingEvent?.event_name || ''} required placeholder="مثال: جلسة مرافعة..." className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-700" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">تاريخ الحدث</label>
                  <input type="date" name="event_date" defaultValue={editingEvent?.event_date || ''} required className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold mb-1 text-slate-700">نوع الحدث</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('نوع الحدث', setEventTypes, eventTypes)}
                      className="text-xs bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="event_type" defaultValue={editingEvent?.event_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-emerald-700">
                    <option value="">-- اختر نوع الحدث --</option>
                    {eventTypes.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold mb-1 text-slate-700">حالة الحدث</label>
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption('حالة الحدث', setEventStatuses, eventStatuses)}
                      className="text-xs bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-200 transition"
                    >
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="event_status" defaultValue={editingEvent?.event_status || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-emerald-700">
                    <option value="">-- اختر حالة الحدث --</option>
                    {eventStatuses.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">ملاحظات</label>
                <textarea name="notes" defaultValue={editingEvent?.notes || ''} rows={3} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-700"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow">{editingEvent ? 'تحديث البيانات' : 'حفظ الحدث'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* القائمة الجانبية */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative w-80 bg-slate-950 text-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 border-l border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/30 rounded-xl flex items-center justify-center text-blue-400 font-black border border-blue-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{userOfficeInfo.officeName}</h3>
                    <p className="text-[10px] text-blue-400">لوحة التحكم القانونية</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => { setSidebarOpen(false); setEditingClient(null); setShowClientModal(true); }}
                  className="w-full text-right px-4 py-3 bg-blue-900/40 hover:bg-blue-900/70 text-blue-200 rounded-xl font-bold text-sm transition flex items-center gap-3 border border-blue-800/50"
                >
                  <Users className="w-4 h-4 text-blue-400" /> إضافة موكل جديد
                </button>
                <button
                  onClick={() => { setSidebarOpen(false); setEditingCase(null); setShowCaseModal(true); }}
                  className="w-full text-right px-4 py-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 rounded-xl font-bold text-sm transition flex items-center gap-3 border border-rose-900/50"
                >
                  <Briefcase className="w-4 h-4 text-rose-400" /> إضافة قضية جديدة
                </button>
                <button
                  onClick={() => { setSidebarOpen(false); setEditingEvent(null); setShowEventModal(true); }}
                  className="w-full text-right px-4 py-3 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 rounded-xl font-bold text-sm transition flex items-center gap-3 border border-emerald-900/50"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" /> إضافة حدث أو جلسة
                </button>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4 text-center">
              <p className="text-xs text-slate-500 font-semibold">{userOfficeInfo.subTitle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}