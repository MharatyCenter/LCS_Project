import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Gavel,
  Trash2,
  Pencil,
  Mail,
  Phone,
  BadgeCheck,
  Scale,
} from 'lucide-react';
import {
  getLawyers,
  createLawyer,
  updateLawyer,
  deleteLawyer,
  type Lawyer,
} from './lawyersService';
import {
  Modal,
  Field,
  inputClass,
  Button,
  Spinner,
  EmptyState,
  ErrorBanner,
  Textarea,
  ConfirmDialog,
} from '../src/components/ui';
import { triggerRefresh } from '../src/utils/refreshUtils';

type Props = {
  onSelect?: (id: number | null) => void;
  selectedLawyerId?: number | null;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  bar_number: string;
  status: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  bar_number: '',
  status: 'Active',
  notes: '',
};

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const STATUS_LABELS: Record<string, string> = {
  Active: 'نشط',
  Inactive: 'غير نشط',
};

export default function LawyersManager({ onSelect, selectedLawyerId }: Props) {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lawyer | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setLawyers(await getLawyers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل المحامين');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lawyers;
    return lawyers.filter((l) =>
      [l.name, l.email ?? '', l.phone ?? '', l.specialization ?? '', l.bar_number ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [lawyers, search]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(lawyer: Lawyer) {
    setEditing(lawyer);
    setForm({
      name: lawyer.name,
      email: lawyer.email ?? '',
      phone: lawyer.phone ?? '',
      specialization: lawyer.specialization ?? '',
      bar_number: lawyer.bar_number ?? '',
      status: lawyer.status,
      notes: lawyer.notes ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('الاسم مطلوب.');
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      specialization: form.specialization.trim() || null,
      bar_number: form.bar_number.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };
    try {
      if (editing) {
        const updated = await updateLawyer(editing.id, payload);
        setLawyers((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      } else {
        const created = await createLawyer(payload);
        setLawyers((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      triggerRefresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'فشل حفظ المحامي');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteLawyer(id);
      if (selectedLawyerId === id) onSelect?.(null);
      setLawyers((prev) => prev.filter((l) => l.id !== id));
      triggerRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حذف المحامي');
    } finally {
      setConfirmId(null);
    }
  }

  const deleteTarget = lawyers.find((l) => l.id === confirmId) ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 text-gold-300 shadow-sm">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-800">المحامون</h2>
            <p className="text-xs text-slate-400">
              <span className="nums">{filtered.length}</span> محامٍ
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن محامٍ..."
              className={`${inputClass} pr-9 sm:w-56`}
              aria-label="بحث عن محامين"
            />
          </div>
          <Button onClick={openCreate} className="sm:whitespace-nowrap">
            <Plus className="h-4 w-4" />
            إضافة محامٍ
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner label="جارٍ تحميل المحامين..." />
      ) : error ? (
        <div className="p-5">
          <ErrorBanner message={error} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={search ? 'لا يوجد محامون مطابقون للبحث.' : 'لا يوجد محامون بعد. ابدأ بإضافة أول محامٍ.'}
          icon={<Gavel className="h-6 w-6" />}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50/40 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">الاسم</th>
                <th className="px-5 py-3 font-semibold">التخصص</th>
                <th className="px-5 py-3 font-semibold">رقم القيد</th>
                <th className="px-5 py-3 font-semibold">التواصل</th>
                <th className="px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3 text-left font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <span className="font-semibold text-navy-800">{l.name}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {l.specialization ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-slate-400" />
                        {l.specialization}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600 nums">
                    {l.bar_number ? (
                      <span className="inline-flex items-center gap-1.5">
                        <BadgeCheck className="h-3.5 w-3.5 text-slate-400" />
                        {l.bar_number}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <div className="flex flex-col gap-0.5">
                      {l.email ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {l.email}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                      {l.phone && (
                        <span className="inline-flex items-center gap-1.5 nums text-slate-500">
                          <Phone className="h-3 w-3 text-slate-300" />
                          {l.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        STATUS_STYLES[l.status] ?? STATUS_STYLES.Active
                      }`}
                    >
                      {STATUS_LABELS[l.status] ?? l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(l)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                        aria-label={`تعديل ${l.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmId(l.id)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`حذف ${l.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'تعديل بيانات المحامي' : 'إضافة محامٍ جديد'}
        subtitle={editing ? editing.name : 'أدخل بيانات المحامي الجديد'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          <Field label="الاسم الكامل *">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: أ. خالد العتيبي"
              autoFocus
              required
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="البريد الإلكتروني">
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="lawyer@firm.com"
              />
            </Field>
            <Field label="الهاتف">
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="٠٥٥ ١٢٣ ٤٥٦٧"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="التخصص">
              <input
                className={inputClass}
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                placeholder="مثال: قانون مدني"
              />
            </Field>
            <Field label="رقم القيد في نقابة المحامين">
              <input
                className={inputClass}
                value={form.bar_number}
                onChange={(e) => setForm({ ...form, bar_number: e.target.value })}
                placeholder="مثال: ٤٢١٨"
              />
            </Field>
          </div>
          <Field label="الحالة">
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">نشط</option>
              <option value="Inactive">غير نشط</option>
            </select>
          </Field>
          <Field label="ملاحظات">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="تفاصيل اختيارية عن المحامي..."
            />
          </Field>
          <div className="flex justify-start gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'جارٍ الحفظ...' : editing ? 'حفظ التعديلات' : 'حفظ المحامي'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="حذف المحامي"
        message={`هل تريد حذف المحامي «${deleteTarget?.name}»؟ لن يتم حذف القضايا والأحداث المرتبطة، بل سيتم فك الارتباط بها.`}
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
