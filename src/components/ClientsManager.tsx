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

  const [formData, setFormData] = useState<clientsService.ClientInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    national_id: '',
    address: '',
    client_type: 'Individual',
    status: 'Active',
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
      const clientData: clientsService.ClientInput = { 
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        national_id: formData.national_id || null,
        address: formData.address || null,
        client_type: formData.client_type || 'Individual',
        status: formData.status || 'Active',
        notes: formData.notes || null,
        company: formData.company || null
      };

      if (editingClient) {
        await clientsService.updateClient(editingClient.id, clientData);
      } else {
        await clientsService.createClient(clientData);
      }

      setIsModalOpen(false);
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        national_id: '',
        address: '',
        client_type: 'Individual',
        status: 'Active',
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

  const handleEdit = (client: clientsService.Client, e: React.MouseEvent) => {
    e.stopPropagation(); // منع انتقال الحدث لكي لا يتم اختيار العميل عند الضغط على زر التعديل
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      national_id: client.national_id || '',
      address: client.address || '',
      client_type: client.client_type || 'Individual',
      status: client.status || 'Active',
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: any, e: React.MouseEvent) => {
    e.stopPropagation(); // منع انتقال الحدث
    if (window.confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) {
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
    const nameMatch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const phoneMatch = client.phone?.includes(searchTerm) || false;
    const nationalIdMatch = client.national_id?.includes(searchTerm) || false;
    return nameMatch || phoneMatch || nationalIdMatch;
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
              إدارة العملاء
            </h2>
            <p className="mt-1 text-xs text-slate-500">اضغط على أي عميل لتصفية القضايا الخاصة به في الأسفل.</p>
          </div>
        </div>
        
        {!isCollapsed && (
          <button
            onClick={() => {
              setEditingClient(null);
              setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                national_id: '',
                address: '',
                client_type: 'Individual',
                status: 'Active',
                notes: '',
              });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة عميل جديد
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 shadow-inner border border-slate-200">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث باسم العميل، رقم الهاتف، أو الرقم القومي..."
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
                    <th className="px-6 py-4">الاسم</th>
                    <th className="px-6 py-4">الهاتف / البريد</th>
                    <th className="px-6 py-4">الرقم القومي / الشركة</th>
                    <th className="px-6 py-4">النوع</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400">جاري تحميل البيانات...</td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400">لا يوجد عملاء مسجلين حالياً.</td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const isSelected = selectedClientId === client.id;
                      return (
                        <tr 
                          key={client.id} 
                          onClick={() => onSelect && onSelect(isSelected ? null : client.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-cyan-50/80 border-r-4 border-cyan-600' : 'hover:bg-slate-50/70'
                          }`}
                          title="اضغط لتصفية القضايا الخاصة بهذا العميل"
                        >
                          <td className="px-6 py-4 font-medium text-navy-950 flex items-center gap-2">
                            {client.name}
                            {isSelected && (
                              <span className="text-[10px] bg-cyan-600 text-white px-2 py-0.5 rounded-full">معروض حالياً</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{client.phone || '—'}</div>
                            <div className="text-xs text-slate-400">{client.email || ''}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-800 font-medium">{client.national_id || '—'}</div>
                            <div className="text-xs text-slate-400">{client.company || ''}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${client.client_type === 'Company' ? 'bg-cyan-50 text-cyan-700' : 'bg-purple-50 text-purple-700'}`}>
                              {client.client_type === 'Company' ? 'شركة' : 'فرد'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {client.status === 'Active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex justify-end gap-2">
                              <button onClick={(e) => handleEdit(client, e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-600 transition-colors">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={(e) => handleDelete(client.id, e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors">
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
              <h3 className="text-lg font-bold text-navy-900">{editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input type="text" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرقم القومي / جواز السفر</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.national_id || ''} onChange={e => setFormData({ ...formData, national_id: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input type="email" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الشركة / الجهة</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العنوان</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف العميل</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.client_type} onChange={e => setFormData({ ...formData, client_type: e.target.value })}>
                    <option value="Individual">فرد</option>
                    <option value="Company">شركة / مؤسسة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الحساب</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">نشط</option>
                    <option value="Inactive">غير نشط</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <textarea rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
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