import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Calendar,
  Trash2,
  Pencil,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
  Gavel,
} from 'lucide-react';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type EventItem,
} from '../Services/eventsService';
import { getCases, type Case } from '../Services/casesService';
import { getLawyers, type Lawyer } from '../Services/lawyersService';
import {
  Modal,
  Field,
  inputClass,
  Button,
  Spinner,
  EmptyState,
  ErrorBanner,
  Textarea,
  DateInput,
  ConfirmDialog,
} from './ui';
import { triggerRefresh } from '../utils/refreshUtils';

type Props = {
  selectedCaseId?: number | null;
};

type FormState = {
  case_id: string;
  lawyer_id: string;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  status: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  case_id: '',
  lawyer_id: '',
  title: '',
  event_date: '',
  event_time: '',
  location: '',
  event_type: 'Hearing',
  status: 'Scheduled',
  notes: '',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  Hearing: 'جلسة',
  Meeting: 'اجتماع',
  Deadline: 'موعد نهائي',
  Other: 'أخرى',
};

const EVENT_TYPE_STYLES: Record<string, string> = {
  Hearing: 'bg-navy-50 text-navy-700 ring-navy-200',
  Meeting: 'bg-gold-50 text-gold-700 ring-gold-200',
  Deadline: 'bg-red-50 text-red-700 ring-red-200',
  Other: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const STATUS_STYLES: Record<string, string> = {
  Scheduled: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Completed: 'bg-slate-100 text-slate-600 ring-slate-200',
  Cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  Scheduled: 'مجدول',
  Completed: 'مكتمل',
  Cancelled: 'ملغي',
};

export default function EventsManager({ selectedCaseId }: Props) {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [events, caseList, lawyerList] = await Promise.all([
        getEvents(),
        getCases(),
        getLawyers(),
      ]);
      setAllEvents(events);
      setCases(caseList);
      setLawyers(lawyerList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الأحداث');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const caseTitle = useMemo(() => {
    if (!selectedCaseId) return null;
    return cases.find((c) => c.id === selectedCaseId)?.title ?? null;
  }, [selectedCaseId, cases]);

  const caseLookup = useMemo(
    () => Object.fromEntries(cases.map((c) => [c.id, c.title])),
    [cases],
  );

  const lawyerLookup = useMemo(
    () => Object.fromEntries(lawyers.map((l) => [l.id, l.name])),
    [lawyers],
  );

  const events = useMemo(() => {
    if (!selectedCaseId) return allEvents;
    return allEvents.filter((e) => e.case_id === selectedCaseId);
  }, [allEvents, selectedCaseId]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      case_id: selectedCaseId ? String(selectedCaseId) : '',
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(e: EventItem) {
    setEditing(e);
    setForm({
      case_id: String(e.case_id),
      lawyer_id: e.lawyer_id ? String(e.lawyer_id) : '',
      title: e.title,
      event_date: e.event_date,
      event_time: e.event_time ?? '',
      location: e.location ?? '',
      event_type: e.event_type,
      status: e.status,
      notes: e.notes ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.case_id) {
      setFormError('يرجى اختيار قضية.');
      return;
    }
    if (!form.title.trim()) {
      setFormError('عنوان الحدث مطلوب.');
      return;
    }
    if (!form.event_date) {
      setFormError('تاريخ الحدث مطلوب.');
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      case_id: Number(form.case_id),
      lawyer_id: form.lawyer_id ? Number(form.lawyer_id) : null,
      title: form.title.trim(),
      event_date: form.event_date,
      event_time: form.event_time || null,
      location: form.location.trim() || null,
      event_type: form.event_type,
      status: form.status,
      notes: form.notes.trim() || null,
    };
    try {
      if (editing) {
        const updated = await updateEvent(editing.id, payload);
        setAllEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        const created = await createEvent(payload);
        setAllEvents((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      triggerRefresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'فشل حفظ الحدث');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteEvent(id);
      setAllEvents((prev) => prev.filter((e) => e.id !== id));
      triggerRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حذف الحدث');
    } finally {
      setConfirmId(null);
    }
  }

  const deleteTarget = allEvents.find((e) => e.id === confirmId) ?? null;
  const headerLabel = selectedCaseId ? `أحداث — ${caseTitle ?? 'قضية'}` : 'الأحداث';
  const isFiltered = selectedCaseId !== undefined && selectedCaseId !== null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-800">{headerLabel}</h2>
            <p className="text-xs text-slate-400">
              <span className="nums">{events.length}</span> حدث / جلسة
            </p>
          </div>
          {isFiltered && (
            <span className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700">
              <ArrowRight className="h-3 w-3" />
              مُصفى حسب القضية
            </span>
          )}
        </div>
        <Button
          onClick={openCreate}
          disabled={isFiltered && !selectedCaseId}
          className="sm:whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          إضافة حدث
        </Button>
      </div>

      {isFiltered && !selectedCaseId ? (
        <EmptyState
          message="اختر قضية من تبويب القضايا لعرض أحداثها."
          icon={<Calendar className="h-6 w-6" />}
        />
      ) : loading ? (
        <Spinner label="جارٍ تحميل الأحداث..." />
      ) : error ? (
        <div className="p-5">
          <ErrorBanner message={error} />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          message={
            isFiltered
              ? 'لا توجد أحداث لهذه القضية بعد. اضغط إضافة حدث لجدولة واحدة.'
              : 'لا توجد أحداث بعد. ابدأ بإضافة أول حدث.'
          }
          icon={<Calendar className="h-6 w-6" />}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50/40 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">العنوان</th>
                {!isFiltered && <th className="px-5 py-3 font-semibold">القضية</th>}
                <th className="px-5 py-3 font-semibold">المحامي</th>
                <th className="px-5 py-3 font-semibold">النوع</th>
                <th className="px-5 py-3 font-semibold">التاريخ</th>
                <th className="px-5 py-3 font-semibold">الوقت</th>
                <th className="px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3 text-left font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((e) => {
                const today = new Date().toISOString().slice(0, 10);
                const isPast = e.event_date < today;
                const isToday = e.event_date === today;
                return (
                  <tr key={e.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="font-semibold text-navy-800">{e.title}</span>
                      {e.location && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {e.location}
                        </span>
                      )}
                    </td>
                    {!isFiltered && (
                      <td className="px-5 py-3 text-slate-600">
                        {caseLookup[e.case_id] ?? '—'}
                      </td>
                    )}
                    <td className="px-5 py-3 text-slate-600">
                      {e.lawyer_id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Gavel className="h-3.5 w-3.5 text-slate-400" />
                          {lawyerLookup[e.lawyer_id] ?? '—'}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          EVENT_TYPE_STYLES[e.event_type] ?? EVENT_TYPE_STYLES.Other
                        }`}
                      >
                        {EVENT_TYPE_LABELS[e.event_type] ?? e.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <span className="nums">
                          {new Date(e.event_date + 'T00:00:00').toLocaleDateString('ar-EG')}
                        </span>
                        {isToday && (
                          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-200">
                            اليوم
                          </span>
                        )}
                        {isPast && e.status === 'Scheduled' && (
                          <AlertCircle className="h-3.5 w-3.5 text-slate-300" />
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {e.event_time ? (
                        <span className="inline-flex items-center gap-1.5 nums">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {e.event_time.slice(0, 5)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                          STATUS_STYLES[e.status] ?? STATUS_STYLES.Scheduled
                        }`}
                      >
                        {STATUS_LABELS[e.status] ?? e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(e)}
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                          aria-label={`تعديل ${e.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmId(e.id)}
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`حذف ${e.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'تعديل بيانات الحدث' : 'إضافة حدث جديد'}
        subtitle={editing ? editing.title : 'جدولة جلسة أو موعد قانوني جديد'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          <Field label="القضية *">
            <select
              className={inputClass}
              value={form.case_id}
              onChange={(e) => setForm({ ...form, case_id: e.target.value })}
              required
            >
              <option value="">اختر قضية...</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="عنوان الحدث *">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: جلسة محكمة — طلب رفض"
              required
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="المحامي المسؤول">
              <select
                className={inputClass}
                value={form.lawyer_id}
                onChange={(e) => setForm({ ...form, lawyer_id: e.target.value })}
              >
                <option value="">بدون تعيين...</option>
                {lawyers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="نوع الحدث">
              <select
                className={inputClass}
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
              >
                <option value="Hearing">جلسة</option>
                <option value="Meeting">اجتماع</option>
                <option value="Deadline">موعد نهائي</option>
                <option value="Other">أخرى</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="تاريخ الحدث *">
              <DateInput
                value={form.event_date}
                onChange={(v) => setForm({ ...form, event_date: v })}
                required
              />
            </Field>
            <Field label="وقت الحدث">
              <input
                type="time"
                className={inputClass}
                value={form.event_time}
                onChange={(e) => setForm({ ...form, event_time: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="الموقع">
              <input
                className={inputClass}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="مثال: المحكمة العليا، القاعة ٤ب"
              />
            </Field>
            <Field label="الحالة">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Scheduled">مجدول</option>
                <option value="Completed">مكتمل</option>
                <option value="Cancelled">ملغي</option>
              </select>
            </Field>
          </div>
          <Field label="ملاحظات">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="تفاصيل اختيارية عن الحدث..."
            />
          </Field>
          <div className="flex justify-start gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'جارٍ الحفظ...' : editing ? 'حفظ التعديلات' : 'حفظ الحدث'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="حذف الحدث"
        message={`هل تريد حذف الحدث «${deleteTarget?.title}» نهائياً؟`}
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
