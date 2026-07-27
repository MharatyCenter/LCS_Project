import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { onRefresh, triggerRefresh } from '../utils/refreshUtils';
import * as clientsService from '../Services/clientsService';

interface ClientsManagerProps {
  onSelect?: (id: number | null) => void;
  selectedClientId?: number | null;
}

export default function ClientsManager({ onSelect, selectedClientId }: ClientsManagerProps) {
  const [clients, setClients] = useState<clientsService.Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<clientsService.Client | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  async function loadClients() {
    try {
      setLoading(true);
      const data = await clientsService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
    return onRefresh(() => loadClients());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const clientData = { 
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
        await clientsService.updateClient(editingClient.id, clientData);
      } else {
        await clientsService.createClient(clientData);
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
      
      loadClients();
      triggerRefresh();
    } catch (error: any) {
      console.error('Detailed Save Error:', error);
      const errorMsg = error?.message || error?.details || JSON.stringify(error);
      alert(`فشل الحفظ بسبب خطأ من قاعدة البيانات:\n${errorMsg}`);
    }
  };

  const handleEdit = (client: any, e: React.MouseEvent) => {
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

  const handleDelete = async (id: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا الموكل نهائياً؟')) {
      try {
        await clientsService.deleteClient(id);
        loadClients();
        triggerRefresh();
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const filteredClients = clients.filter(client => {
    const nameMatch = client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const phoneMatch = client.phone?.includes(searchTerm) || false;
    const poaMatch = client.power_of_attorney_number?.includes(searchTerm) || false;
    return nameMatch || phoneMatch || poaMatch;
  });

  return (
    <div className="rounded-2xl border-2 border-cyan-300 bg-white p-6 shadow-sm space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-cyan-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors"
            title={isCollapsed ? "توسيع القسم" : "طي القسم"}
          >
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
          <div>
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-600" />
              إدارة الموكلين
            </h2>
            <p className="mt-1 text-xs text-slate-500">اضغط على أي موكل لتصفية القضايا الخاصة به في الأسفل.</p>
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
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة موكل جديد
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 shadow-inner border border-slate-200">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث باسم الموكل، رقم الهاتف، أو رقم التوكيل..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase">
                  <tr>
                    <th className="px-6 py-4">اسم الموكل</th>
                    <th className="px-6 py-4">الهاتف / التوكيل</th>
                    <th className="px-6 py-4">نوع الموكل</th>
                    <th className="px-6 py-4">القطاع والجهة</th>
                    <th className="px-6 py-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400">جاري تحميل البيانات...</td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400">لا يوجد موكلون مسجلون حالياً.</td>
                    </tr>
                  ) : (
                    filteredClients.map((client: any) => {
                      const isSelected = selectedClientId === client.client_code;
                      return (
                        <tr 
                          key={client.client_code} 
                          onClick={() => onSelect && onSelect(isSelected ? null : client.client_code)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-cyan-50/80 border-r-4 border-cyan-600' : 'hover:bg-slate-50/70'
                          }`}
                          title="اضغط لتصفية القضايا الخاصة بهذا الموكل"
                        >
                          <td className="px-6 py-4 font-medium text-navy-950 flex items-center gap-2">
                            {client.client_name}
                            {isSelected && (
                              <span className="text-[10px] bg-cyan-600 text-white px-2 py-0.5 rounded-full">معروض حالياً</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{client.phone || '—'}</div>
                            <div className="text-xs text-slate-400">{client.power_of_attorney_type}: {client.power_of_attorney_number || 'بدون رقم'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-cyan-50 text-cyan-700">
                              {client.client_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-800 font-medium">{client.sector}</div>
                            <div className="text-xs text-slate-400">{client.entity || '—'}</div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex justify-end gap-2">
                              <button onClick={(e) => handleEdit(client, e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-600 transition-colors">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={(e) => handleDelete(client.client_code, e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
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
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100 animate-scale-in">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-900">{editingClient ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموكل *</label>
                  <input type="text" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التعاقد</label>
                  <input type="date" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.contract_date} onChange={e => setFormData({ ...formData, contract_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع التوكيل</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.power_of_attorney_type} onChange={e => setFormData({ ...formData, power_of_attorney_type: e.target.value })}>
                    <option value="توكيل عام">توكيل عام</option>
                    <option value="توكيل خاص">توكيل خاص</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم التوكيل</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.power_of_attorney_number} onChange={e => setFormData({ ...formData, power_of_attorney_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التوكيل</label>
                  <input type="date" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.power_of_attorney_date} onChange={e => setFormData({ ...formData, power_of_attorney_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الموكل</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.client_type} onChange={e => setFormData({ ...formData, client_type: e.target.value })}>
                    <option value="فردي">فردي</option>
                    <option value="شركة">شركة</option>
                    <option value="هيئة">هيئة</option>
                    <option value="جمعية اهلية">جمعية اهلية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم التليفون</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القطاع</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })}>
                    <option value="اهلي">اهلي</option>
                    <option value="خاص">خاص</option>
                    <option value="حكومي">حكومي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجهة</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.entity} onChange={e => setFormData({ ...formData, entity: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
                <textarea rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">إلغاء</button>
                <button type="submit" className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 shadow-sm transition-colors">حفظ البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}