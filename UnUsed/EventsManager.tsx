import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Calendar,
  Trash2,
  Pencil,
  Clock,
  MapPin,
  Gavel,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type EventItem,
} from './eventsService';
import { getCases, type Case } from './casesService';
import { getLawyers, type Lawyer } from './lawyersService';
import {
  Modal,
  Field,
  inputClass,
  Button,
  Spinner,
  EmptyState,
  ErrorBanner,
  ConfirmDialog,
} from '../src/components/ui';
import { triggerRefresh } from '../src/utils/refreshUtils';

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
  Hearing: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Meeting: 'bg-amber-50 text-amber-700 ring-amber-200',
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // تحديث القضية في النموذج تلقائياً إذا تم اختيار قضية من الأعلى
  useEffect(() => {
    if (selectedCaseId) {
      setForm((prev) => ({ ...prev, case_id: String(selectedCaseId) }));
    }
  }, [selectedCaseId]);

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
    return cases.find((c) => Number(c.id) === Number(selectedCaseId))?.title ?? null;
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
    return allEvents.filter((e) => Number(e.case_id) === Number(selectedCaseId));
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
  const headerLabel = selectedCaseId ? `أحداث — ${caseTitle ?? 'قضية'}` : 'إدارة الأحداث والجلسات';
  const isFiltered = selectedCaseId !== undefined && selectedCaseId !== null;

  return (
    <div className="rounded-2xl border-2 border-emerald-300 bg-white p-6 shadow-sm space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 border-b border-emerald-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
            title={isCollapsed ? "توسيع القسم" : "طي القسم"}
          >
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              {headerLabel}
              {selectedCaseId && (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-normal">
                  (مفلترة للقضية المختارة)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              <span className="nums">{events.length}</span> حدث / جلسة مسجلة بالنظام
            </p>
          </div>
        </div>

        {!isCollapsed && (
          <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4" />
            إضافة حدث جديد
          </Button>
        )}
      </div>

      {!isCollapsed && (
        <div className="space-y-6 animate-fade-in">
          {error && <ErrorBanner message={error} />}

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="لا توجد أحداث"
              description={isFiltered ? 'لا توجد أحداث مرتبطة بهذه القضية المحددة.' : 'لم يتم تسجيل أي أحداث أو جلسات بعد.'}
              action={
                <Button variant="secondary" onClick={openCreate}>
                  إضافة حدث جديد
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-sm transition-all hover:border-emerald-400 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${EVENT_TYPE_STYLES[ev.event_type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[ev.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS[ev.status] ?? ev.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-navy-900 text-base mb-1 group-hover:text-emerald-700 transition-colors">
                      {ev.title}
                    </h3>

                    {ev.case_id && caseLookup[ev.case_id] && (
                      <p className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-1.5">
                        <Gavel className="h-3.5 w-3.5 text-amber-600" />
                        {caseLookup[ev.case_id]}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 border-t border-slate-200/60 pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="nums font-medium">{ev.event_date}</span>
                        {ev.event_time && (
                          <>
                            <span className="text-slate-300">|</span>
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="nums font-medium">{ev.event_time}</span>
                          </>
                        )}
                      </div>

                      {ev.location && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 mt-2">
                    <span className="text-[11px] text-slate-400">
                      {ev.lawyer_id ? lawyerLookup[ev.lawyer_id] : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(ev)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-600 transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmId(ev.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* نافذة إضافة / تعديل الحدث */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'تعديل الحدث / الجلسة' : 'إضافة حدث أو جلسة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}

          <Field label="القضية المرتبطة *" required>
            <select
              className={inputClass}
              value={form.case_id}
              onChange={(e) => setForm({ ...form, case_id: e.target.value })}
              required
            >
              <option value="">-- اختر القضية --</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} - {c.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="عنوان الحدث أو الجلسة *" required>
            <input
              type="text"
              className={inputClass}
              placeholder="مثال: جلسة المرافعة الرئيسية"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="نوع الحدث">
              <select
                className={inputClass}
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
              >
                <option value="Hearing">جلسة محكمة</option>
                <option value="Meeting">اجتماع مع موكل</option>
                <option value="Deadline">موعد نهائي / تسليم</option>
                <option value="Other">أخرى</option>
              </select>
            </Field>

            <Field label="حالة الحدث">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="تاريخ الحدث *" required>
              <input
                type="date"
                className={inputClass}
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
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

          <Field label="المكان / المحكمة">
            <input
              type="text"
              className={inputClass}
              placeholder="مثال: محكمة أسوان الابتدائية - الدائرة الأولى"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>

          <Field label="المحامي المسؤول">
            <select
              className={inputClass}
              value={form.lawyer_id}
              onChange={(e) => setForm({ ...form, lawyer_id: e.target.value })}
            >
              <option value="">-- اختر المحامي --</option>
              {lawyers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="ملاحظات تفصيلية">
            <textarea
              className={inputClass}
              rows={3}
              placeholder="أي تفاصيل أو طلبات خاصة بالحدث..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ الحدث'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* تأكيد الحذف */}
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف الحدث "${deleteTarget?.title ?? ''}"؟`}
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}