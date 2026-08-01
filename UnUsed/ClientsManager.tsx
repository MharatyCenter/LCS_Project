import { useState, useEffect } from 'react';
import { supabase } from '../src/Services/supabaseClient';
import { Plus, Search, Edit2, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';

type CalendarEvent = {
  id: number;
  title: string;
  event_date: string;
  event_time?: string;
  client_name?: string;
};

type Client = {
  id: number;
  client_code?: number;
  client_name: string;
  contract_date?: string;
  power_of_attorney_type?: string;
  power_of_attorney_number?: string;
  power_of_attorney_date?: string;
  client_type?: string;
  phone?: string;
  sector?: string;
  entity?: string;
  notes?: string;
};

export default function DashboardContent() {
  const [stats, setStats] = useState({
    lawyersCount: 0,
    clientsCount: 0,
    casesCount: 0,
    eventsCount: 0,
    loading: true,
  });

  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [tomorrowEvents, setTomorrowEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // حالات إدارة الموكلين المدمجة بدقة
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    contract_date: '',
    power_of_attorney_type: 'توكيل عام',
    power_of_attorney_number: '',
    power_of_attorney_date: '',
    client_type: 'فردي',
    phone: '',
    sector: 'خاص',
    entity: '',
    notes: '',
  });

  // دالة جلب الموكلين وباقي الإحصائيات
  async function loadDashboardData() {
    try {
      setClientsLoading(true);

      // 1. جلب المحامين
      const { count: lawyersCnt } = await supabase
        .from('lawyers')
        .select('*', { count: 'exact', head: true });

      // 2. جلب الموكلين
      const { data: clientsData, count: clientsCnt, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact' });

      if (!clientsError && clientsData) {
        setClients(clientsData);
      }

      // 3. جلب القضايا
      const { count: casesCnt } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true });

      // 4. جلب الأحداث
      const { count: eventsCnt } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setStats({
        lawyersCount: lawyersCnt || 0,
        clientsCount: clientsCnt || clientsData?.length || 0,
        casesCount: casesCnt || 0,
        eventsCount: eventsCnt || 0,
        loading: false,
      });

      // جلب أحداث اليوم والغد
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('event_date', [todayStr, tomorrowStr]);

      if (!eventsError && eventsData) {
        setTodayEvents(eventsData.filter(ev => ev.event_date === todayStr));
        setTomorrowEvents(eventsData.filter(ev => ev.event_date === tomorrowStr));
      }
    } catch (err) {
      console.error('خطأ في جلب بيانات لوحة التحكم:', err);
    } finally {
      setClientsLoading(false);
      setEventsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // حفظ أو تعديل موكل
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const clientPayload = { 
        client_name: formData.client_name,
        contract_date: formData.contract_date || null,
        power_of_attorney_type: formData.power_of_attorney_type || null,
        power_of_attorney_number: formData.power_of_attorney_number || null,
        power_of_attorney_date: formData.power_of_attorney_date || null,
        client_type: formData.client_type || 'فردي',
        phone: formData.phone || null,
        sector: formData.sector || 'خاص',
        entity: formData.entity || null,
        notes: formData.notes || null
      };

      if (editingClient) {
        const targetId = editingClient.client_code || editingClient.id;
        const { error } = await supabase
          .from('clients')
          .update(clientPayload)
          .eq(editingClient.client_code ? 'client_code' : 'id', targetId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([clientPayload]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingClient(null);
      setFormData({
        client_name: '',
        contract_date: '',
        power_of_attorney_type: 'توكيل عام',
        power_of_attorney_number: '',
        power_of_attorney_date: '',
        client_type: 'فردي',
        phone: '',
        sector: 'خاص',
        entity: '',
        notes: '',
      });
      
      loadDashboardData();
    } catch (error: any) {
      console.error('خطأ في الحفظ:', error);
      alert(`فشل الحفظ بسبب خطأ من قاعدة البيانات:\n${error?.message || JSON.stringify(error)}`);
    }
  };

  const handleEditClient = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormData({
      client_name: client.client_name || '',
      contract_date: client.contract_date || '',
      power_of_attorney_type: client.power_of_attorney_type || 'توكيل عام',
      power_of_attorney_number: client.power_of_attorney_number || '',
      power_of_attorney_date: client.power_of_attorney_date || '',
      client_type: client.client_type || 'فردي',
      phone: client.phone || '',
      sector: client.sector || 'خاص',
      entity: client.entity || '',
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا الموكل نهائياً؟')) {
      try {
        const targetId = client.client_code || client.id;
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq(client.client_code ? 'client_code' : 'id', targetId);

        if (error) throw error;
        loadDashboardData();
      } catch (error) {
        console.error('فشل الحذف:', error);
      }
    }
  };

  // فلترة الموكلين مع حماية تامة ضد أي قيم فارغة (لضمان عدم ظهور خطأ toLowerCase)
  const filteredClients = clients.filter(client => {
    const nameMatch = client.client_name ? client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const phoneMatch = client.phone ? client.phone.includes(searchTerm) : false;
    const poaMatch = client.power_of_attorney_number ? client.power_of_attorney_number.includes(searchTerm) : false;
    return nameMatch || phoneMatch || poaMatch;
  });

  const lawyerName = localStorage.getItem('lawyer_name') || 'الأستاذ المحامي';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      fontFamily: 'Cairo, Tahoma, sans-serif',
      direction: 'rtl',
      padding: '24px'
    }}>
      {/* الهيدر */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: '20px 30px',
        borderRadius: '16px',
        border: '1px solid #334155',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '12px',
            backgroundColor: '#3b82f6',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '22px'
          }}>
            ⚖️
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>
              نظام إدارة المكتب القانوني
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              مرحباً بك، <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{lawyerName}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#334155',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 تحديث البيانات
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('lawyer_name');
              window.location.reload();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#7f1d1d',
              color: '#fca5a5',
              border: '1px solid #991b1b',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* العدادات الأربعة الرئيسية */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>👥 عدد الموكلين</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
            {stats.loading ? '...' : stats.clientsCount}
          </p>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>📂 عدد القضايا</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
            {stats.loading ? '...' : stats.casesCount}
          </p>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>📅 إجمالي الأحداث</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
            {stats.loading ? '...' : stats.eventsCount}
          </p>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>⭐ أحداث اليوم</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
            {eventsLoading ? '...' : todayEvents.length}
          </p>
        </div>
      </div>

      {/* قسم إدارة الموكلين المدمج (نفس تصميمك الأصلي بتوافق تام) */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        border: '1px solid #334155',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                background: '#334155',
                border: 'none',
                color: '#38bdf8',
                borderRadius: '8px',
                width: '35px',
                height: '35px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isCollapsed ? "توسيع القسم" : "طي القسم"}
            >
              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#38bdf8" /> إدارة الموكلين
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>اضغط على أي موكل لتحديد أو تصفية قضاياه.</p>
            </div>
          </div>

          {!isCollapsed && (
            <button
              onClick={() => {
                setEditingClient(null);
                setFormData({
                  client_name: '',
                  contract_date: '',
                  power_of_attorney_type: 'توكيل عام',
                  power_of_attorney_number: '',
                  power_of_attorney_date: '',
                  client_type: 'فردي',
                  phone: '',
                  sector: 'خاص',
                  entity: '',
                  notes: '',
                });
                setIsModalOpen(true);
              }}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> إضافة موكل جديد
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div>
            {/* شريط البحث */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0f172a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '20px' }}>
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="بحث باسم الموكل، رقم الهاتف، أو رقم التوكيل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', width: '100%', outline: 'none', fontSize: '14px' }}
              />
            </div>

            {/* جدول الموكلين */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px' }}>اسم الموكل</th>
                    <th style={{ padding: '12px' }}>الهاتف / التوكيل</th>
                    <th style={{ padding: '12px' }}>نوع الموكل</th>
                    <th style={{ padding: '12px' }}>القطاع والجهة</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsLoading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>جاري تحميل الموكلين...</td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>لا توجد موكلين مسجلين حالياً.</td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const clientIdKey = client.client_code || client.id;
                      const isSelected = selectedClientId === clientIdKey;
                      return (
                        <tr
                          key={clientIdKey}
                          onClick={() => setSelectedClientId(isSelected ? null : clientIdKey)}
                          style={{
                            background: isSelected ? '#334155' : 'transparent',
                            borderBottom: '1px solid #334155',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '12px', color: '#f8fafc', fontWeight: 'bold' }}>
                            {client.client_name}
                            {isSelected && <span style={{ fontSize: '10px', background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>معروض</span>}
                          </td>
                          <td style={{ padding: '12px', color: '#cbd5e1' }}>
                            <div>{client.phone || '—'}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{client.power_of_attorney_type}: {client.power_of_attorney_number || 'بدون'}</div>
                          </td>
                          <td style={{ padding: '12px', color: '#38bdf8' }}>{client.client_type}</td>
                          <td style={{ padding: '12px', color: '#cbd5e1' }}>
                            <div>{client.sector}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{client.entity || '—'}</div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={(e) => handleEditClient(client, e)} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer' }} title="تعديل">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={(e) => handleDeleteClient(client, e)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }} title="حذف">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* قسم تفاصيل أحداث اليوم والغد */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* أحداث اليوم */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            <h3 style={{ color: '#38bdf8', fontSize: '16px', margin: 0 }}>
              📅 تفاصيل أحداث اليوم
            </h3>
          </div>
          {eventsLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>جاري التحميل...</p>
          ) : todayEvents.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>لا توجد أحداث مجدولة اليوم.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {todayEvents.map(ev => (
                <li key={ev.id} style={{ padding: '10px 0', borderBottom: '1px solid #334155' }}>
                  <strong style={{ color: '#f8fafc' }}>{ev.title}</strong>
                  {ev.event_time && <span style={{ color: '#94a3b8', fontSize: '12px', marginRight: '10px' }}>({ev.event_time})</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* أحداث الغد مع رابط الأجندة الشهرية */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            <h3 style={{ color: '#38bdf8', fontSize: '16px', margin: 0 }}>
              📆 تفاصيل أحداث الغد
            </h3>
            <button
              onClick={() => alert('جاري تجهيز فتح الأجندة الشهرية...')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#38bdf8',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              📥 تحميل الأجندة الشهرية
            </button>
          </div>
          {eventsLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>جاري التحميل...</p>
          ) : tomorrowEvents.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>لا توجد أحداث مجدولة ليوم الغد.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tomorrowEvents.map(ev => (
                <li key={ev.id} style={{ padding: '10px 0', borderBottom: '1px solid #334155' }}>
                  <strong style={{ color: '#f8fafc' }}>{ev.title}</strong>
                  {ev.event_time && <span style={{ color: '#94a3b8', fontSize: '12px', marginRight: '10px' }}>({ev.event_time})</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* نافذة إضافة أو تعديل موكل (Modal) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.7)', padding: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', width: '100%', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#0f172a', padding: '16px 20px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '16px', margin: 0 }}>{editingClient ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}</h3>
            </div>
            <form onSubmit={handleClientSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>اسم الموكل *</label>
                  <input type="text" required value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>تاريخ التعاقد</label>
                  <input type="date" value={formData.contract_date} onChange={e => setFormData({ ...formData, contract_date: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>نوع التوكيل</label>
                  <select value={formData.power_of_attorney_type} onChange={e => setFormData({ ...formData, power_of_attorney_type: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }}>
                    <option value="توكيل عام">توكيل عام</option>
                    <option value="توكيل خاص">توكيل خاص</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>رقم التوكيل</label>
                  <input type="text" value={formData.power_of_attorney_number} onChange={e => setFormData({ ...formData, power_of_attorney_number: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>نوع الموكل</label>
                  <select value={formData.client_type} onChange={e => setFormData({ ...formData, client_type: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }}>
                    <option value="فردي">فردي</option>
                    <option value="شركة">شركة</option>
                    <option value="هيئة">هيئة</option>
                    <option value="جمعية اهلية">جمعية اهلية</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>رقم الهاتف</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#334155', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>إلغاء</button>
                <button type="submit" style={{ background: '#0284c7', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}