import { useEffect, useState } from 'react';
import { Plus, Search, Briefcase, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { onRefresh, triggerRefresh } from '../utils/refreshUtils';
import * as clientsService from '../Services/clientsService';
import * as casesService from '../Services/casesService';

type Case = {
  id: string;
  case_number: string;
  title: string;
  client_id: string;
  court?: string;
  status: 'Open' | 'Closed' | 'Pending';
  created_at?: string;
};

export default function CasesManager() {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<clientsService.Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // حالة النموذج لإضافة قضية جديدة
  const [formData, setFormData] = useState({
    case_number: '',
    title: '',
    client_id: '',
    court: '',
    status: 'Open' as 'Open' | 'Closed' | 'Pending',
  });

  async function loadData() {
    try {
      setLoading(true);
      // استدعاء الدالة بدون تمرير lawyerId لتتوافق مع الخدمة المحدثة
      const [clientsData, casesData] = await Promise.all([
        clientsService.getClients(),
        casesService.getCases()
      ]);
      
      setClients(clientsData);
      setCases(casesData as Case[]);
    } catch (error) {
      console.error('Failed to load data in CasesManager:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    return onRefresh(() => loadData());
  }, []);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => String(c.id) === String(clientId));
    return client ? client.name : 'عميل غير معروف';
  };

  const filteredCases = cases.filter(c => {
    const clientName = getClientName(c.client_id).toLowerCase();
    return (
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"><Clock className="h-3 w-3"/> نشطة</span>;
      case 'Closed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><CheckCircle2 className="h-3 w-3"/> منتهية</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/10"><AlertCircle className="h-3 w-3"/> معلقة</span>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      alert('رجاءً اختر العميل أولاً');
      return;
    }
    try {
      await casesService.createCase({
        case_number: formData.case_number,
        title: formData.title,
        client_id: formData.client_id,
        court: formData.court || null,
        status: formData.status,
      } as any);

      setIsModalOpen(false);
      setFormData({ case_number: '', title: '', client_id: '', court: '', status: 'Open' });
      loadData();
      triggerRefresh();
    } catch (error: any) {
      console.error('Error creating case:', error);
      alert(`فشل إضافة القضية: ${error?.message || JSON.stringify(error)}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in mt-8">
      {/* رأس القسم وأزرار التحكم */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-6">
        <div>
          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gold-600" />
            إدارة القضايا الحالية
          </h2>
          <p className="text-xs text-slate-500 mt-1">عرض وتتبع ملفات القضايا المسجلة بالنظام.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم القضية، العنوان أو العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-4 text-sm text-slate-900 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة قضية جديدة
          </button>
        </div>
      </div>

      {/* جدول عرض البيانات */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gold-500 border-t-transparent mb-2"></div>
            <p className="text-sm">جاري تحميل القضايا...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">لا توجد قضايا مطابقة للبحث حالياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">رقم القضية</th>
                  <th className="px-6 py-4">عنوان القضية</th>
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">المحكمة</th>
                  <th className="px-6 py-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-navy-950">{c.case_number}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{c.title}</td>
                    <td className="px-6 py-4">{getClientName(c.client_id)}</td>
                    <td className="px-6 py-4 text-slate-500">{c.court || '—'}</td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة إضافة قضية جديدة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-900">إضافة قضية جديدة</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر العميل *</label>
                <select
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                  value={formData.client_id}
                  onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                >
                  <option value="">-- اختر من قائمة عملائك --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم القضية *</label>
                <input type="text" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" value={formData.case_number} onChange={e => setFormData({ ...formData, case_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان القضية *</label>
                <input type="text" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المحكمة</label>
                <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" value={formData.court} onChange={e => setFormData({ ...formData, court: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">حالة القضية</label>
                <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="Open">نشطة</option>
                  <option value="Pending">معلقة</option>
                  <option value="Closed">منتهية</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">إلغاء</button>
                <button type="submit" className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 shadow-sm">حفظ القضية</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}