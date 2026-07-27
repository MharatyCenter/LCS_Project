import React, { useState } from 'react';
import { createClient } from '../services/clientsService';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddClientFormProps {
  onSuccess?: () => void;
}

export default function AddClientForm({ onSuccess }: AddClientFormProps) {
  const [formData, setFormData] = useState({
    client_name: '',
    contract_date: new Date().toISOString().split('T')[0],
    power_of_attorney_type: 'توكيل عام' as const,
    power_of_attorney_number: '',
    power_of_attorney_date: '',
    client_type: 'فردي' as const,
    phone: '',
    sector: 'خاص' as const,
    entity: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // استدعاء دالة الخدمة المنظمة مباشرة
      await createClient({
        client_name: formData.client_name,
        contract_date: formData.contract_date || null,
        power_of_attorney_type: formData.power_of_attorney_type,
        power_of_attorney_number: formData.power_of_attorney_number || null,
        power_of_attorney_date: formData.power_of_attorney_date || null,
        client_type: formData.client_type,
        phone: formData.phone || null,
        sector: formData.sector,
        entity: formData.entity || null,
        notes: formData.notes || null,
      });

      setSuccessMsg('تم إضافة الموكل بنجاح إلى قاعدة البيانات!');
      setFormData({
        client_name: '',
        contract_date: new Date().toISOString().split('T')[0],
        power_of_attorney_type: 'توكيل عام',
        power_of_attorney_number: '',
        power_of_attorney_date: '',
        client_type: 'فردي',
        phone: '',
        sector: 'خاص',
        entity: '',
        notes: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('خطأ في إضافة الموكل:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ بيانات الموكل.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-navy-950">إضافة موكل جديد</h3>
          <p className="text-xs text-slate-500 mt-0.5">قم بإدخال بيانات الموكل بدقة لتسجيله في النظام</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-200 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 text-sm rounded-xl border border-red-200 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">اسم الموكل <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="client_name"
              required
              value={formData.client_name}
              onChange={handleChange}
              placeholder="الاسم الكامل أو اسم الشركة"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">رقم الهاتف</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010xxxxxxxx"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50 text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">نوع الموكل</label>
            <select
              name="client_type"
              value={formData.client_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50"
            >
              <option value="فردي">فردي</option>
              <option value="شركة">شركة</option>
              <option value="هيئة">هيئة</option>
              <option value="جمعية اهلية">جمعية اهلية</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">القطاع</label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50"
            >
              <option value="خاص">خاص</option>
              <option value="اهلي">اهلي</option>
              <option value="حكومي">حكومي</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">نوع التوكيل</label>
            <select
              name="power_of_attorney_type"
              value={formData.power_of_attorney_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50"
            >
              <option value="توكيل عام">توكيل عام</option>
              <option value="توكيل خاص">توكيل خاص</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">رقم التوكيل</label>
            <input
              type="text"
              name="power_of_attorney_number"
              value={formData.power_of_attorney_number}
              onChange={handleChange}
              placeholder="رقم التوكيل الرسمي"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">تاريخ التوكيل</label>
            <input
              type="date"
              name="power_of_attorney_date"
              value={formData.power_of_attorney_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50 text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">تاريخ التعاقد</label>
            <input
              type="date"
              name="contract_date"
              value={formData.contract_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50 text-right"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">الجهة التابع لها</label>
          <input
            type="text"
            name="entity"
            value={formData.entity}
            onChange={handleChange}
            placeholder="مثال: الشهر العقاري، جهة العمل..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">ملاحظات</label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="أي تفاصيل أو ملاحظات إضافية حول الموكل..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50 resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold text-sm shadow-md transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الموكل'}
          </button>
        </div>
      </form>
    </div>
  );
}