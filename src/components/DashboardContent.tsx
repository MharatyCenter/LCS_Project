import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Info,
  Printer,
  ImagePlus,
  Settings,
  MessageCircle,
  UserCog,
  Sparkles
} from 'lucide-react';

export default function DashboardContent() {
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  const defaultOptionLists: Record<string, string[]> = {
    client_type: ['فردي', 'شركة', 'مؤسسة'],
    poa_type: ['توكيل عام رسمي', 'توكيل خاص', 'توكيل قضايا'],
    sector: ['مدني', 'تجاري', 'إداري'],
    entity: ['محكمة الابتدائية', 'محكمة الاستئناف', 'مجلس الدولة'],
    case_type: ['مدني', 'مستعجل', 'تجاري', 'عمالي', 'إداري'],
    litigation_degree: ['ابتدائي', 'استئناف', 'نقض'],
    opponent_type: ['مدعى عليه', 'متهم', 'مستأنف ضده'],
    event_type: ['جلسة مرافعة', 'تقديم مستندات', 'النطق بالحكم'],
    event_status: ['قيد الانتظار', 'تم الحجز للحكم', 'منتهي'],
  };
  const [optionLists, setOptionLists] = useState<Record<string, string[]>>(defaultOptionLists);
  const [lawyersDirectory, setLawyersDirectory] = useState<any[]>([]);
  const [showLawyerModal, setShowLawyerModal] = useState(false);
  const TRIAL_LIMITS = { clients: 3, cases: 5, events: 10 };
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLawyersListModal, setShowLawyersListModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [editingLawyer, setEditingLawyer] = useState<any | null>(null);
  const [optionPrompt, setOptionPrompt] = useState<{ title: string; listType: string; editingRowId?: number } | null>(null);
  const [optionPromptValue, setOptionPromptValue] = useState('');

  const [clientSearch, setClientSearch] = useState('');
  const [caseSearch, setCaseSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  const [selectedClientIdFilter, setSelectedClientIdFilter] = useState<number | null>(null);
  const [selectedCaseIdFilter, setSelectedCaseIdFilter] = useState<number | null>(null);

  const [showAllClientsOverride, setShowAllClientsOverride] = useState(false);
  const [showAllCasesOverride, setShowAllCasesOverride] = useState(false);
  const [showAllEventsOverride, setShowAllEventsOverride] = useState(false);

  const [expandStats, setExpandStats] = useState(false);
  const [expandClients, setExpandClients] = useState(false);
  const [expandCases, setExpandCases] = useState(false);
  const [expandEvents, setExpandEvents] = useState(false);

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
  const [printPreview, setPrintPreview] = useState<{ title: string; html: string } | null>(null);
  const [userOfficeInfo, setUserOfficeInfo] = useState({
    officeName: localStorage.getItem('office_name') || 'المكتب القانوني',
    subTitle: 'النظام القانوني الموحد',
    logoUrl: null as string | null,
    officeAddress: '',
    officePhone: '',
    reportFooter: '',
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'office' | 'reports' | 'security' | 'lists' | 'display'>('office');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [settingsOfficeName, setSettingsOfficeName] = useState('');
  const [settingsOfficeAddress, setSettingsOfficeAddress] = useState('');
  const [settingsOfficePhone, setSettingsOfficePhone] = useState('');
  const [settingsReportFooter, setSettingsReportFooter] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  const listTypeLabels: Record<string, string> = {
    client_type: 'نوع الموكل',
    poa_type: 'نوع التوكيل',
    sector: 'القطاع',
    entity: 'الجهة',
    case_type: 'نوع القضية',
    litigation_degree: 'درجة التقاضي',
    opponent_type: 'صفة الخصم',
    event_type: 'نوع الحدث',
    event_status: 'حالة الحدث',
  };
  const [optionListRows, setOptionListRows] = useState<{ id: number; list_type: string; value: string }[]>([]);

  const DEFAULT_DISPLAY_LIMITS = { clients: 3, cases: 5, events: 10 };
  const [displayLimits, setDisplayLimits] = useState(() => {
    try {
      const saved = localStorage.getItem('display_limits');
      return saved ? JSON.parse(saved) : DEFAULT_DISPLAY_LIMITS;
    } catch {
      return DEFAULT_DISPLAY_LIMITS;
    }
  });
  const [displayLimitsDraft, setDisplayLimitsDraft] = useState(displayLimits);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css?family=Cairo:wght@400;600;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const printStyle = document.createElement('style');
    printStyle.id = 'app-print-style';
    printStyle.innerHTML = `
      @page {
        margin: 14mm 12mm;
      }
      @media print {
        #app-shell { display: none !important; }
        #print-portal { display: block !important; }
      }
    `;
    document.head.appendChild(printStyle);

    fetchAllData();
    fetchOfficeInfo();
    fetchOptionLists();
    fetchLawyersDirectory();
  }, []);

  const fetchOptionLists = async () => {
    const userId = localStorage.getItem('lawyer_id');
    if (!userId) return;
    const { data, error } = await supabase.from('option_lists').select('id, list_type, value').eq('user_id', userId);
    if (!error && data) {
      setOptionListRows(data);
      setOptionLists((prev) => {
        const merged: Record<string, string[]> = { ...prev };
        data.forEach((row: any) => {
          if (!merged[row.list_type]) merged[row.list_type] = [];
          if (!merged[row.list_type].includes(row.value)) {
            merged[row.list_type] = [...merged[row.list_type], row.value];
          }
        });
        return merged;
      });
    }
  };

  const handleDeleteOptionRow = async (row: { id: number; list_type: string; value: string }) => {
    if (!confirm(`هل تريد حذف "${row.value}" من قائمة ${listTypeLabels[row.list_type] || row.list_type}؟`)) return;
    const { error } = await supabase.from('option_lists').delete().eq('id', row.id);
    if (error) {
      alert('فشل الحذف: ' + error.message);
      return;
    }
    setOptionListRows((prev) => prev.filter((r) => r.id !== row.id));
    setOptionLists((prev) => ({
      ...prev,
      [row.list_type]: (prev[row.list_type] || []).filter((v) => v !== row.value),
    }));
  };

  const fetchOfficeInfo = async () => {
    const userId = localStorage.getItem('lawyer_id');
    if (!userId) return;
    const { data, error } = await supabase
      .from('lawyers')
      .select('office_name, logo_url, office_address, office_phone, report_footer')
      .eq('user_id', userId)
      .eq('is_owner', true)
      .maybeSingle();

    if (!error && data) {
      setUserOfficeInfo((prev) => ({
        ...prev,
        officeName: data.office_name || prev.officeName,
        logoUrl: data.logo_url || null,
        officeAddress: data.office_address || '',
        officePhone: data.office_phone || '',
        reportFooter: data.report_footer || '',
      }));
    }
  };

  const fetchLawyersDirectory = async () => {
    const userId = localStorage.getItem('lawyer_id');
    if (!userId) return;
    const { data, error } = await supabase
      .from('lawyers')
      .select('*')
      .eq('user_id', userId)
      .order('lawyer_name', { ascending: true });

    if (!error && data) setLawyersDirectory(data);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const userId = localStorage.getItem('lawyer_id');
    if (!userId) return;

    setLogoUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('lawyers')
        .update({ logo_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      setUserOfficeInfo((prev) => ({ ...prev, logoUrl: publicUrl }));
    } catch (err: any) {
      alert('فشل رفع اللوجو: ' + (err.message || 'خطأ غير متوقع'));
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleResetLogo = async () => {
    const userId = localStorage.getItem('lawyer_id');
    if (!userId) return;
    const { error } = await supabase.from('lawyers').update({ logo_url: null }).eq('user_id', userId);
    if (!error) setUserOfficeInfo((prev) => ({ ...prev, logoUrl: null }));
  };

  const handleSaveOfficeName = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('lawyer_id');
    if (!userId || !settingsOfficeName.trim()) return;

    setSettingsSaving(true);
    try {
      const { error } = await supabase
        .from('lawyers')
        .update({
          office_name: settingsOfficeName.trim(),
          office_address: settingsOfficeAddress.trim() || null,
          office_phone: settingsOfficePhone.trim() || null,
          report_footer: settingsReportFooter.trim() || null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      setUserOfficeInfo((prev) => ({
        ...prev,
        officeName: settingsOfficeName.trim(),
        officeAddress: settingsOfficeAddress.trim(),
        officePhone: settingsOfficePhone.trim(),
        reportFooter: settingsReportFooter.trim(),
      }));
      localStorage.setItem('office_name', settingsOfficeName.trim());
    } catch (err: any) {
      alert('فشل حفظ بيانات المكتب: ' + (err.message || 'خطأ غير متوقع'));
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg('❌ كلمة المرور لازم تكون 6 حروف على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('❌ كلمتا المرور غير متطابقتين.');
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMsg('✅ تم تغيير كلمة المرور بنجاح.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg('❌ فشل التغيير: ' + (err.message || 'خطأ غير متوقع'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      setEmailMsg('✅ تم إرسال رابط تأكيد للبريدين القديم والجديد، لازم تأكدهم الأول عشان يتفعل التغيير.');
      setNewEmail('');
    } catch (err: any) {
      setEmailMsg('❌ فشل التغيير: ' + (err.message || 'خطأ غير متوقع'));
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSaveDisplayLimits = () => {
    setDisplayLimits(displayLimitsDraft);
    localStorage.setItem('display_limits', JSON.stringify(displayLimitsDraft));
  };

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

  const handleLogout = async () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await supabase.auth.signOut();
      localStorage.removeItem('lawyer_id');
      localStorage.removeItem('lawyer_name');
      localStorage.removeItem('office_name');
      window.location.reload();
    }
  };

  const checkTrialLimitAndOpen = (type: 'clients' | 'cases' | 'events', openFn: () => void) => {
    const counts = { clients: clients.length, cases: cases.length, events: events.length };
    const labels = { clients: 'الموكلين', cases: 'القضايا', events: 'الأحداث' };
    if (counts[type] >= TRIAL_LIMITS[type]) {
      setUpgradeReason(labels[type]);
      setShowUpgradeModal(true);
      return;
    }
    openFn();
  };

  const handleDelete = async (table: string, id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) {
        fetchAllData();
      } else {
        alert('خطأ أثناء الحذف : ' + error.message);
      }
    }
  };

  const fieldLabels: Record<string, string> = {
    client_name: 'اسم الموكل',
    contract_date: 'تاريخ التعاقد',
    power_of_attorney_type: 'نوع التوكيل',
    power_of_attorney_number: 'رقم التوكيل',
    client_type: 'نوع الموكل',
    phone: 'رقم الهاتف',
    sector: 'القطاع',
    entity: 'الجهة',
    notes: 'ملاحظات',
    case_number: 'رقم القضية',
    case_date: 'تاريخ القضية',
    case_type: 'نوع القضية',
    opponent_name: 'اسم الخصم',
    opponent_type: 'صفة الخصم',
    litigation_degree: 'درجة التقاضي',
    event_name: 'اسم الحدث',
    event_date: 'تاريخ الحدث',
    event_type: 'نوع الحدث',
    event_status: 'حالة الحدث',
  };

  const buildInfoTable = (dataObj: any) => {
    const hiddenKeys = ['id', 'client_id', 'case_id', 'office_lawyer_id', 'opponent_lawyer_id'];
    let html = '<table style="width: 100%; border-collapse: collapse; margin-top: 8px;">';
    for (const [key, value] of Object.entries(dataObj)) {
      if (!hiddenKeys.includes(key) && typeof value !== 'object') {
        const label = fieldLabels[key] || key;
        html += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <th style="text-align: right; padding: 8px 10px; background: #f1f5f9; width: 32%; color: #0f172a; font-size: 13px;">${label}</th>
            <td style="text-align: right; padding: 8px 10px; color: #334155; font-size: 13px;">${value || '-'}</td>
          </tr>`;
      }
    }
    html += '</table>';
    return html;
  };

  const openPrintFrame = (title: string, bodyHtml: string) => {
    setPrintPreview({ title, html: bodyHtml });
  };

  const getLawyerName = (lawyerId: any) => {
    if (!lawyerId) return null;
    const lw = lawyersDirectory.find((l) => l.id === lawyerId);
    return lw ? lw.lawyer_name : null;
  };

  const getLawyerCaseInfo = (lawyerId: number) => {
    const officeCases = cases.filter((cs) => cs.office_lawyer_id === lawyerId).map((cs) => cs.case_number);
    const opponentCases = cases.filter((cs) => cs.opponent_lawyer_id === lawyerId).map((cs) => cs.case_number);
    return { officeCases, opponentCases };
  };

  const handlePrintLawyersList = () => {
    let contentHtml = '<div style="font-family: \'Cairo\', sans-serif; direction: rtl; padding: 20px; color: #111;">';
    contentHtml += `<h2 style="text-align: center; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">${userOfficeInfo.officeName}</h2>`;
    if (userOfficeInfo.officeAddress || userOfficeInfo.officePhone) {
      contentHtml += `<p style="text-align: center; color: #64748b; font-size: 11px; margin: -8px 0 8px;">${userOfficeInfo.officeAddress || ''}${userOfficeInfo.officeAddress && userOfficeInfo.officePhone ? ' — ' : ''}${userOfficeInfo.officePhone || ''}</p>`;
    }
    contentHtml += `<h3 style="text-align: center; color: #334155; margin-bottom: 20px;">دليل المحامين</h3>`;

    if (lawyersDirectory.length === 0) {
      contentHtml += '<p style="text-align: center; font-size: 13px; color: #64748b;">لا يوجد محامين مسجلين حالياً.</p>';
    } else {
      contentHtml += '<table style="width: 100%; border-collapse: collapse;">';
      contentHtml += `
        <tr style="background: #1e3a8a; color: #fff;">
          <th style="text-align: right; padding: 8px 10px; font-size: 12px;">اسم المحامي</th>
          <th style="text-align: right; padding: 8px 10px; font-size: 12px;">الهاتف</th>
          <th style="text-align: right; padding: 8px 10px; font-size: 12px;">التبعية</th>
          <th style="text-align: right; padding: 8px 10px; font-size: 12px;">أرقام القضايا</th>
        </tr>`;
      lawyersDirectory.forEach((lw) => {
        const { officeCases, opponentCases } = getLawyerCaseInfo(lw.id);
        const roleLines: string[] = [];
        if (officeCases.length > 0) roleLines.push(`محامي مكتب: ${officeCases.join('، ')}`);
        if (opponentCases.length > 0) roleLines.push(`محامي خصم: ${opponentCases.join('، ')}`);
        contentHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 10px; font-size: 12px;">${lw.lawyer_name}${lw.is_owner ? ' (صاحب الحساب)' : ''}</td>
            <td style="padding: 7px 10px; font-size: 12px;">${lw.phone || '-'}</td>
            <td style="padding: 7px 10px; font-size: 12px;">${roleLines.length > 0 ? roleLines.join('<br/>') : 'غير مرتبط بقضايا حالياً'}</td>
            <td style="padding: 7px 10px; font-size: 12px;">${[...officeCases, ...opponentCases].join('، ') || '-'}</td>
          </tr>`;
      });
      contentHtml += '</table>';
    }

    contentHtml += `<div style="margin-top: 30px; text-align: center; font-size: 12px; color: #64748b;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>`;
    if (userOfficeInfo.reportFooter) {
      contentHtml += `<div style="margin-top: 6px; text-align: center; font-size: 11px; color: #94a3b8;">${userOfficeInfo.reportFooter}</div>`;
    }
    contentHtml += '</div>';

    openPrintFrame('دليل المحامين', contentHtml);
  };

  const handlePrintClientReport = (client: any) => {
    const clientCases = cases.filter(cs => cs.client_id === client.id);

    let contentHtml = '<div style="font-family: \'Cairo\', sans-serif; direction: rtl; padding: 20px; color: #111;">';
    contentHtml += `<h2 style="text-align: center; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">${userOfficeInfo.officeName}</h2>`;
    if (userOfficeInfo.officeAddress || userOfficeInfo.officePhone) {
      contentHtml += `<p style="text-align: center; color: #64748b; font-size: 11px; margin: -8px 0 8px;">${userOfficeInfo.officeAddress || ''}${userOfficeInfo.officeAddress && userOfficeInfo.officePhone ? ' — ' : ''}${userOfficeInfo.officePhone || ''}</p>`;
    }
    contentHtml += `<h3 style="text-align: center; color: #334155; margin-bottom: 20px;">تقرير الموكل الشامل: ${client.client_name}</h3>`;

    contentHtml += '<h4 style="color: #1e3a8a; background: #eff6ff; padding: 8px 12px; border-radius: 6px; margin-bottom: 4px;">بيانات الموكل</h4>';
    contentHtml += buildInfoTable(client);

    contentHtml += '<h4 style="color: #1e3a8a; margin-top: 28px; margin-bottom: 10px;">القضايا والأحداث المرتبطة</h4>';

    if (clientCases.length === 0) {
      contentHtml += '<p style="font-size: 13px; color: #64748b;">لا توجد قضايا مسجلة لهذا الموكل.</p>';
    } else {
      clientCases.forEach((cs) => {
        contentHtml += '<div style="border: 1px solid #1e3a8a; border-radius: 8px; margin-bottom: 16px; overflow: hidden; page-break-inside: avoid;">';
        contentHtml += `<div style="background: #1e3a8a; color: #fff; font-weight: bold; padding: 8px 14px; font-size: 14px;">قضية رقم ${cs.case_number || '-'}</div>`;
        contentHtml += `<div style="padding: 6px 14px;">${buildInfoTable(cs)}</div>`;

        const officeLawyerName = getLawyerName(cs.office_lawyer_id);
        const opponentLawyerName = getLawyerName(cs.opponent_lawyer_id);
        if (officeLawyerName || opponentLawyerName) {
          contentHtml += '<div style="padding: 0 14px 6px; font-size: 12px; color: #334155;">';
          if (officeLawyerName) contentHtml += `<div><strong>محامي المكتب:</strong> ${officeLawyerName}</div>`;
          if (opponentLawyerName) contentHtml += `<div><strong>محامي الخصم:</strong> ${opponentLawyerName}</div>`;
          contentHtml += '</div>';
        }

        const caseEvents = events.filter(ev => ev.case_id === cs.id);
        contentHtml += '<div style="padding: 0 14px 12px;">';
        contentHtml += '<div style="font-size: 12px; color: #475569; font-weight: bold; margin: 8px 0 6px;">الأحداث المرتبطة بهذه القضية</div>';
        if (caseEvents.length === 0) {
          contentHtml += '<p style="font-size: 12px; color: #94a3b8; margin: 0;">لا توجد أحداث مسجلة لهذه القضية.</p>';
        } else {
          contentHtml += '<table style="width: 100%; border-collapse: collapse;">';
          contentHtml += `
            <tr style="background: #f1f5f9;">
              <th style="text-align: right; padding: 6px 10px; font-size: 12px; color: #0f172a;">اسم الحدث</th>
              <th style="text-align: right; padding: 6px 10px; font-size: 12px; color: #0f172a;">التاريخ</th>
              <th style="text-align: right; padding: 6px 10px; font-size: 12px; color: #0f172a;">النوع</th>
              <th style="text-align: right; padding: 6px 10px; font-size: 12px; color: #0f172a;">الحالة</th>
            </tr>`;
          caseEvents.forEach((ev) => {
            contentHtml += `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px 10px; font-size: 12px;">${ev.event_name || '-'}</td>
                <td style="padding: 6px 10px; font-size: 12px;">${ev.event_date || '-'}</td>
                <td style="padding: 6px 10px; font-size: 12px;">${ev.event_type || '-'}</td>
                <td style="padding: 6px 10px; font-size: 12px;">${ev.event_status || '-'}</td>
              </tr>`;
          });
          contentHtml += '</table>';
        }
        contentHtml += '</div></div>';
      });
    }

    contentHtml += `<div style="margin-top: 30px; text-align: center; font-size: 12px; color: #64748b;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>`;
    if (userOfficeInfo.reportFooter) {
      contentHtml += `<div style="margin-top: 6px; text-align: center; font-size: 11px; color: #94a3b8;">${userOfficeInfo.reportFooter}</div>`;
    }
    contentHtml += '</div>';

    openPrintFrame(`تقرير الموكل - ${client.client_name}`, contentHtml);
  };

  const handlePrintCaseReport = (caseObj: any) => {
    const relatedClient = clients.find(c => c.id === caseObj.client_id);
    const caseEvents = events.filter(ev => ev.case_id === caseObj.id);

    let contentHtml = '<div style="font-family: \'Cairo\', sans-serif; direction: rtl; padding: 20px; color: #111;">';
    contentHtml += `<h2 style="text-align: center; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">${userOfficeInfo.officeName}</h2>`;
    if (userOfficeInfo.officeAddress || userOfficeInfo.officePhone) {
      contentHtml += `<p style="text-align: center; color: #64748b; font-size: 11px; margin: -8px 0 8px;">${userOfficeInfo.officeAddress || ''}${userOfficeInfo.officeAddress && userOfficeInfo.officePhone ? ' — ' : ''}${userOfficeInfo.officePhone || ''}</p>`;
    }
    contentHtml += `<h3 style="text-align: center; color: #334155; margin-bottom: 20px;">تقرير القضية رقم: ${caseObj.case_number || '-'}</h3>`;

    if (relatedClient) {
      contentHtml += '<div style="background: #eff6ff; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px; color: #1e3a8a;">';
      contentHtml += `<strong>الموكل صاحب القضية:</strong> ${relatedClient.client_name} ${relatedClient.phone ? '— ' + relatedClient.phone : ''}`;
      contentHtml += '</div>';
    }

    contentHtml += '<h4 style="color: #1e3a8a; background: #eff6ff; padding: 8px 12px; border-radius: 6px; margin-bottom: 4px;">بيانات القضية</h4>';
    contentHtml += buildInfoTable(caseObj);

    const officeLawyerName = getLawyerName(caseObj.office_lawyer_id);
    const opponentLawyerName = getLawyerName(caseObj.opponent_lawyer_id);
    if (officeLawyerName || opponentLawyerName) {
      contentHtml += '<div style="margin-top: 8px; font-size: 13px; color: #334155;">';
      if (officeLawyerName) contentHtml += `<div><strong>محامي المكتب:</strong> ${officeLawyerName}</div>`;
      if (opponentLawyerName) contentHtml += `<div><strong>محامي الخصم:</strong> ${opponentLawyerName}</div>`;
      contentHtml += '</div>';
    }

    contentHtml += '<h4 style="color: #1e3a8a; margin-top: 24px; margin-bottom: 10px;">الأحداث والجلسات المرتبطة</h4>';

    if (caseEvents.length === 0) {
      contentHtml += '<p style="font-size: 13px; color: #64748b;">لا توجد أحداث مسجلة لهذه القضية.</p>';
    } else {
      contentHtml += '<table style="width: 100%; border-collapse: collapse;">';
      contentHtml += `
        <tr style="background: #1e3a8a; color: #fff;">
          <th style="text-align: right; padding: 8px 10px; font-size: 12px;">اسم الحدث</th>
          <th style="text-align: right; padding: 8px 10px; font-size: 12px;">التاريخ</th>
          <th style="text-align: right; padding: 8px 10px; font-size: 12px;">النوع</th>
          <th style="text-align: right; padding: 8px 10px; font-size: 12px;">الحالة</th>
        </tr>`;
      caseEvents.forEach((ev) => {
        contentHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 10px; font-size: 12px;">${ev.event_name || '-'}</td>
            <td style="padding: 7px 10px; font-size: 12px;">${ev.event_date || '-'}</td>
            <td style="padding: 7px 10px; font-size: 12px;">${ev.event_type || '-'}</td>
            <td style="padding: 7px 10px; font-size: 12px;">${ev.event_status || '-'}</td>
          </tr>`;
      });
      contentHtml += '</table>';
    }

    contentHtml += `<div style="margin-top: 30px; text-align: center; font-size: 12px; color: #64748b;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>`;
    if (userOfficeInfo.reportFooter) {
      contentHtml += `<div style="margin-top: 6px; text-align: center; font-size: 11px; color: #94a3b8;">${userOfficeInfo.reportFooter}</div>`;
    }
    contentHtml += '</div>';

    openPrintFrame(`تقرير القضية - ${caseObj.case_number}`, contentHtml);
  };

  const handlePrintEventReport = (eventObj: any) => {
    const relatedCase = eventObj.cases || cases.find(cs => cs.id === eventObj.case_id);
    const relatedClient = relatedCase ? clients.find(c => c.id === relatedCase.client_id) : null;

    let contentHtml = '<div style="font-family: \'Cairo\', sans-serif; direction: rtl; padding: 20px; color: #111;">';
    contentHtml += `<h2 style="text-align: center; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">${userOfficeInfo.officeName}</h2>`;
    if (userOfficeInfo.officeAddress || userOfficeInfo.officePhone) {
      contentHtml += `<p style="text-align: center; color: #64748b; font-size: 11px; margin: -8px 0 8px;">${userOfficeInfo.officeAddress || ''}${userOfficeInfo.officeAddress && userOfficeInfo.officePhone ? ' — ' : ''}${userOfficeInfo.officePhone || ''}</p>`;
    }
    contentHtml += `<h3 style="text-align: center; color: #334155; margin-bottom: 20px;">تقرير حدث / جلسة: ${eventObj.event_name || '-'}</h3>`;

    contentHtml += '<h4 style="color: #1e3a8a; background: #eff6ff; padding: 8px 12px; border-radius: 6px; margin-bottom: 4px;">بيانات الحدث</h4>';
    contentHtml += buildInfoTable(eventObj);

    if (relatedCase || relatedClient) {
      contentHtml += '<h4 style="color: #1e3a8a; margin-top: 24px; margin-bottom: 6px;">سياق القضية والموكل</h4>';
      contentHtml += '<div style="background: #eff6ff; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1e3a8a; line-height: 1.9;">';
      if (relatedCase) {
        contentHtml += `<div><strong>رقم القضية:</strong> ${relatedCase.case_number || '-'}</div>`;
        contentHtml += `<div><strong>الخصم:</strong> ${relatedCase.opponent_name || '-'}</div>`;
      }
      if (relatedClient) {
        contentHtml += `<div><strong>الموكل:</strong> ${relatedClient.client_name} ${relatedClient.phone ? '— ' + relatedClient.phone : ''}</div>`;
      }
      contentHtml += '</div>';
    }

    contentHtml += `<div style="margin-top: 30px; text-align: center; font-size: 12px; color: #64748b;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>`;
    if (userOfficeInfo.reportFooter) {
      contentHtml += `<div style="margin-top: 6px; text-align: center; font-size: 11px; color: #94a3b8;">${userOfficeInfo.reportFooter}</div>`;
    }
    contentHtml += '</div>';

    openPrintFrame(`تقرير حدث - ${eventObj.event_name}`, contentHtml);
  };

  const handlePrintMonthlyAgenda = () => {
    const monthEvents = events.filter(ev => {
      if (!ev.event_date) return false;
      const [evYear, evMonth] = ev.event_date.split('-').map(Number);
      return evYear === year && (evMonth - 1) === month;
    }).sort((a, b) => (a.event_date > b.event_date ? 1 : -1));

    let contentHtml = '<div style="font-family: \'Cairo\', sans-serif; direction: rtl; padding: 20px; color: #111;">';
    contentHtml += `<h2 style="text-align: center; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">${userOfficeInfo.officeName}</h2>`;
    if (userOfficeInfo.officeAddress || userOfficeInfo.officePhone) {
      contentHtml += `<p style="text-align: center; color: #64748b; font-size: 11px; margin: -8px 0 8px;">${userOfficeInfo.officeAddress || ''}${userOfficeInfo.officeAddress && userOfficeInfo.officePhone ? ' — ' : ''}${userOfficeInfo.officePhone || ''}</p>`;
    }
    contentHtml += `<h3 style="text-align: center; color: #334155; margin-bottom: 20px;">أجندة شهر ${monthNames[month]} ${year}</h3>`;

    if (monthEvents.length === 0) {
      contentHtml += '<p style="font-size: 13px; color: #64748b; text-align: center;">لا توجد أحداث مسجلة خلال هذا الشهر.</p>';
    } else {
      const groupedByDate: Record<string, any[]> = {};
      monthEvents.forEach(ev => {
        if (!groupedByDate[ev.event_date]) groupedByDate[ev.event_date] = [];
        groupedByDate[ev.event_date].push(ev);
      });

      Object.keys(groupedByDate).forEach(dateStr => {
        contentHtml += '<div style="margin-bottom: 18px; page-break-inside: avoid;">';
        contentHtml += `<div style="background: #1e3a8a; color: #fff; font-weight: bold; padding: 8px 14px; border-radius: 6px 6px 0 0; font-size: 13px;">${dateStr}</div>`;
        contentHtml += '<table style="width: 100%; border-collapse: collapse; border: 1px solid #1e3a8a; border-top: none;">';
        contentHtml += `
          <tr style="background: #f1f5f9;">
            <th style="text-align: right; padding: 7px 10px; font-size: 12px; color: #0f172a;">اسم الحدث</th>
            <th style="text-align: right; padding: 7px 10px; font-size: 12px; color: #0f172a;">النوع</th>
            <th style="text-align: right; padding: 7px 10px; font-size: 12px; color: #0f172a;">رقم القضية</th>
            <th style="text-align: right; padding: 7px 10px; font-size: 12px; color: #0f172a;">الموكل</th>
          </tr>`;
        groupedByDate[dateStr].forEach((ev) => {
          contentHtml += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px; font-size: 12px;">${ev.event_name || '-'}</td>
              <td style="padding: 6px 10px; font-size: 12px;">${ev.event_type || '-'}</td>
              <td style="padding: 6px 10px; font-size: 12px;">${ev.cases?.case_number || '-'}</td>
              <td style="padding: 6px 10px; font-size: 12px;">${ev.cases?.clients?.client_name || '-'}</td>
            </tr>`;
        });
        contentHtml += '</table></div>';
      });
    }

    contentHtml += `<div style="margin-top: 30px; text-align: center; font-size: 12px; color: #64748b;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>`;
    if (userOfficeInfo.reportFooter) {
      contentHtml += `<div style="margin-top: 6px; text-align: center; font-size: 11px; color: #94a3b8;">${userOfficeInfo.reportFooter}</div>`;
    }
    contentHtml += '</div>';

    openPrintFrame(`أجندة شهر ${monthNames[month]} ${year}`, contentHtml);
  };

  const handlePrintRecord = (title: string, dataObj: any) => {
    let contentHtml = '<div style="font-family: \'Cairo\', sans-serif; direction: rtl; padding: 20px; color: #111;">';
    contentHtml += `<h2 style="text-align: center; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">${userOfficeInfo.officeName}</h2>`;
    if (userOfficeInfo.officeAddress || userOfficeInfo.officePhone) {
      contentHtml += `<p style="text-align: center; color: #64748b; font-size: 11px; margin: -8px 0 8px;">${userOfficeInfo.officeAddress || ''}${userOfficeInfo.officeAddress && userOfficeInfo.officePhone ? ' — ' : ''}${userOfficeInfo.officePhone || ''}</p>`;
    }
    contentHtml += `<h3 style="text-align: center; color: #334155; margin-bottom: 20px;">تقرير تفصيلي: ${title}</h3>`;
    contentHtml += '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
    for (const [key, value] of Object.entries(dataObj)) {
      if (key !== 'id' && typeof value !== 'object') {
        contentHtml += `
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <th style="text-align: right; padding: 10px; background: #f1f5f9; width: 30%; color: #0f172a;">${key}</th>
            <td style="text-align: right; padding: 10px; color: #334155;">${value || '-'}</td>
          </tr>`;
      }
    }
    contentHtml += '</table>';
    contentHtml += `<div style="margin-top: 40px; text-align: center; font-size: 12px; color: #64748b;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>`;
    contentHtml += '</div>';

    openPrintFrame(`طباعة سجل - ${title}`, contentHtml);
  };

  const handleAddDynamicOption = async (listType: string, rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    const editingRowId = optionPrompt?.editingRowId;

    if (editingRowId) {
      const { error } = await supabase.from('option_lists').update({ value: trimmed }).eq('id', editingRowId);
      if (error) {
        alert('فشل تعديل القيمة: ' + error.message);
        return;
      }
      const oldRow = optionListRows.find((r) => r.id === editingRowId);
      const oldValue = oldRow?.value;
      setOptionListRows((prev) => prev.map((r) => (r.id === editingRowId ? { ...r, value: trimmed } : r)));
      setOptionLists((prev) => ({
        ...prev,
        [listType]: (prev[listType] || []).map((v) => (v === oldValue ? trimmed : v)),
      }));
      setOptionPrompt(null);
      return;
    }

    const currentList = optionLists[listType] || [];
    if (currentList.includes(trimmed)) {
      setOptionPrompt(null);
      return;
    }

    const userId = localStorage.getItem('lawyer_id');
    if (userId) {
      const { data, error } = await supabase.from('option_lists').insert([{ user_id: userId, list_type: listType, value: trimmed }]).select().single();
      if (error) {
        alert('فشل حفظ الخيار الجديد: ' + error.message);
        return;
      }
      if (data) setOptionListRows((prev) => [...prev, data]);
    }
    setOptionLists((prev) => ({ ...prev, [listType]: [...(prev[listType] || []), trimmed] }));
    setOptionPrompt(null);
  };

  const handleLawyerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lawyerData = {
      user_id: localStorage.getItem('lawyer_id'),
      lawyer_name: formData.get('lawyer_name'),
      phone: formData.get('phone'),
      syndicate_number: formData.get('syndicate_number'),
      degree: formData.get('degree'),
      address: formData.get('address'),
      email: formData.get('email'),
      notes: formData.get('notes'),
    };
    let error;
    if (editingLawyer) {
      const res = await supabase.from('lawyers').update(lawyerData).eq('id', editingLawyer.id);
      error = res.error;
    } else {
      const res = await supabase.from('lawyers').insert([{ ...lawyerData, is_owner: false }]);
      error = res.error;
    }
    if (!error) {
      setShowLawyerModal(false);
      setEditingLawyer(null);
      fetchLawyersDirectory();
    } else {
      alert('خطأ أثناء حفظ بيانات المحامي : ' + error.message);
    }
  };

  const handleDeleteLawyer = async (lawyer: any) => {
    if (lawyer.is_owner) {
      alert('لا يمكن حذف صف صاحب الحساب.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا المحامي من الدليل؟')) {
      const { error } = await supabase.from('lawyers').delete().eq('id', lawyer.id);
      if (!error) {
        fetchLawyersDirectory();
      } else {
        alert('خطأ أثناء الحذف : ' + error.message);
      }
    }
  };

  const handleClientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClient && clients.length >= TRIAL_LIMITS.clients) {
      setShowClientModal(false);
      setUpgradeReason('الموكلين');
      setShowUpgradeModal(true);
      return;
    }
    const formData = new FormData(e.currentTarget);
    const clientData = {
      user_id: localStorage.getItem('lawyer_id'),
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
      alert('خطأ أثناء حفظ الموكل : ' + error.message);
    }
  };

  const handleCaseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCase && cases.length >= TRIAL_LIMITS.cases) {
      setShowCaseModal(false);
      setUpgradeReason('القضايا');
      setShowUpgradeModal(true);
      return;
    }
    const formData = new FormData(e.currentTarget);
    const caseData = {
      user_id: localStorage.getItem('lawyer_id'),
      case_number: formData.get('case_number'),
      case_date: formData.get('case_date') || null,
      case_type: formData.get('case_type'),
      client_id: formData.get('client_id') ? Number(formData.get('client_id')) : null,
      opponent_name: formData.get('opponent_name'),
      opponent_type: formData.get('opponent_type'),
      litigation_degree: formData.get('litigation_degree'),
      office_lawyer_id: formData.get('office_lawyer_id') ? Number(formData.get('office_lawyer_id')) : null,
      opponent_lawyer_id: formData.get('opponent_lawyer_id') ? Number(formData.get('opponent_lawyer_id')) : null,
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
      alert('خطأ أثناء حفظ القضية : ' + error.message);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEvent && events.length >= TRIAL_LIMITS.events) {
      setShowEventModal(false);
      setUpgradeReason('الأحداث');
      setShowUpgradeModal(true);
      return;
    }
    const formData = new FormData(e.currentTarget);
    const eventData = {
      user_id: localStorage.getItem('lawyer_id'),
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
      alert('خطأ أثناء حفظ الحدث : ' + error.message);
    }
  };

  const filteredClients = clients.filter(c => c.client_name?.toLowerCase().includes(clientSearch.toLowerCase()));
  const displayedClients = showAllClientsOverride ? filteredClients : filteredClients.slice(0, displayLimits.clients);

  const filteredCases = cases.filter(cs => {
    const matchesSearch = cs.case_number?.toLowerCase().includes(caseSearch.toLowerCase()) || cs.opponent_name?.toLowerCase().includes(caseSearch.toLowerCase());
    const matchesClientFilter = (selectedClientIdFilter && !showAllCasesOverride) ? cs.client_id === selectedClientIdFilter : true;
    return matchesSearch && matchesClientFilter;
  });
  const displayedCases = showAllCasesOverride ? filteredCases : filteredCases.slice(0, displayLimits.cases);

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.event_name?.toLowerCase().includes(eventSearch.toLowerCase()) || ev.cases?.case_number?.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesCaseFilter = (selectedCaseIdFilter && !showAllEventsOverride) ? ev.case_id === selectedCaseIdFilter : true;
    return matchesSearch && matchesCaseFilter;
  });
  const displayedEvents = showAllEventsOverride ? filteredEvents : filteredEvents.slice(0, displayLimits.events);

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

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  const calendarDays: any[] = [];
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
    <div id="app-shell" className="min-h-screen bg-[#F8F9FA] text-gray-900" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-blue-900/50">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-blue-900/60 hover:bg-blue-800 rounded-xl transition text-blue-200 border border-blue-700/50">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative group/logo">
              <div className="w-11 h-11 bg-blue-600/30 rounded-xl flex items-center justify-center text-blue-300 font-black shadow-inner border border-blue-500/30 overflow-hidden">
                {userOfficeInfo.logoUrl ? (
                  <img src={userOfficeInfo.logoUrl} alt="لوجو المكتب" className="w-full h-full object-cover" />
                ) : (
                  <img src="/default-logo.svg" alt="لوجو افتراضي" className="w-full h-full object-cover" />
                )}
              </div>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                title="تغيير لوجو المكتب"
                className="absolute -bottom-1 -left-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900 opacity-0 group-hover/logo:opacity-100 transition"
              >
                {logoUploading ? (
                  <span className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <ImagePlus className="w-3 h-3 text-white" />
                )}
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
            <div className="text-right">
              <h2 className="font-bold text-white text-base tracking-wide">{userOfficeInfo.officeName}</h2>
              <p className="text-xs text-blue-300/80">{userOfficeInfo.subTitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="text-xs bg-rose-900/60 hover:bg-rose-800 px-4 py-2 rounded-xl font-bold text-white transition border border-rose-700/50">
            تسجيل الخروج
          </button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* قسم مؤشرات الإحصائيات الأساسية */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3 border-blue-900/20">
            <div className="flex items-center gap-3">
              <button onClick={() => setExpandStats(!expandStats)} className="text-blue-900 hover:text-black">
                {expandStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <h3 className="text-lg font-bold text-blue-950 flex items-center gap-2">لوحة العدادات والإحصائيات العامة</h3>
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
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">القضايا</p>
                    <h3 className="text-3xl font-black text-rose-950 mt-1">{cases.length}</h3>
                  </div>
                  <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl shadow-sm"><Briefcase className="w-6 h-6" /></div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between border-r-4 border-r-emerald-700">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">الأحداث</p>
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
                          <span className="text-slate-500 text-[11px]">قضية {ev.cases?.case_number || '-'}</span>
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
                          <span className="text-slate-500 text-[11px]">قضية {ev.cases?.case_number || '-'}</span>
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
          <button onClick={() => { setSelectedEventDetails(null); setShowMonthlyAgendaModal(true); }} className="bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white px-6 py-3.5 rounded-2xl shadow-md flex items-center gap-3 font-bold text-base transition border border-blue-800/60 group">
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
                  عرض {displayedClients.length} من {filteredClients.length}
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input type="checkbox" checked={showAllClientsOverride} onChange={(e) => setShowAllClientsOverride(e.target.checked)} className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900" />
                <span>عرض كل الموكلين (تجاوز حد {displayLimits.clients})</span>
              </label>
              <button onClick={() => checkTrialLimitAndOpen('clients', () => { setEditingClient(null); setShowClientModal(true); })} className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-bold shadow-sm transition">
                <Plus className="w-4 h-4" /> إضافة موكل جديد
              </button>
              <span className="text-[11px] text-slate-400 font-bold">{clients.length}/{TRIAL_LIMITS.clients}</span>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
            <input type="text" placeholder="بحث شامل في الموكلين..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} className="w-full border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/50" />
          </div>
          {expandClients && (
            <div className="overflow-x-auto">
              <p className="text-xs text-blue-900 mb-2 font-bold">(انقر على أي موكل لتصفية القضايا المرتبطة به أدناه)</p>
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-blue-950 text-white text-xs">
                    <th className="p-3 rounded-r-xl">اسم الموكل</th>
                    <th className="p-3">نوع الموكل</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">تاريخ التعاقد</th>
                    <th className="p-3 text-center rounded-l-xl">إجراءات طباعة / تعديل / حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {displayedClients.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-6 text-gray-400">لا توجد سجلات موكلين</td></tr>
                  ) : (
                    displayedClients.map((c) => (
                      <tr key={c.id} onClick={() => setSelectedClientIdFilter(selectedClientIdFilter === c.id ? null : c.id)} className={`cursor-pointer transition ${selectedClientIdFilter === c.id ? 'bg-blue-100 font-bold' : 'hover:bg-slate-50'}`}>
                        <td className="p-3 text-blue-950 font-bold">{c.client_name} {selectedClientIdFilter === c.id && '(الموكل المحدد)'}</td>
                        <td className="p-3">{c.client_type || '-'}</td>
                        <td className="p-3">{c.phone || '-'}</td>
                        <td className="p-3">{c.contract_date || '-'}</td>
                        <td className="p-3 flex justify-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handlePrintClientReport(c); }} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition" title="طباعة تقرير الموكل الشامل">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingClient(c); setShowClientModal(true); }} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition" title="تعديل الموكل">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete('clients', c.id); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="حذف الموكل">
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
                  عرض {displayedCases.length} من {filteredCases.length}
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
                <input type="checkbox" checked={showAllCasesOverride} onChange={(e) => setShowAllCasesOverride(e.target.checked)} className="w-4 h-4 text-rose-800 rounded focus:ring-rose-800" />
                <span>عرض كل القضايا (تجاوز حد {displayLimits.cases})</span>
              </label>
              <button onClick={() => checkTrialLimitAndOpen('cases', () => { setEditingCase(null); setShowCaseModal(true); })} className="bg-rose-800 hover:bg-rose-900 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-bold shadow-sm transition">
                <Plus className="w-4 h-4" /> إضافة قضية جديدة
              </button>
              <span className="text-[11px] text-slate-400 font-bold">{cases.length}/{TRIAL_LIMITS.cases}</span>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
            <input type="text" placeholder="بحث برقم القضية أو اسم الخصم..." value={caseSearch} onChange={(e) => setCaseSearch(e.target.value)} className="w-full border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-800 bg-slate-50/50" />
          </div>
          {expandCases && (
            <div className="overflow-x-auto">
              <p className="text-xs text-rose-900 mb-2 font-bold">(انقر على أي قضية لتصفية الأحداث المرتبطة بها أدناه)</p>
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-rose-950 text-white text-xs">
                    <th className="p-3 rounded-r-xl">رقم القضية</th>
                    <th className="p-3">تاريخ القضية</th>
                    <th className="p-3">اسم الخصم</th>
                    <th className="p-3 text-center rounded-l-xl">إجراءات طباعة / تعديل / حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {displayedCases.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-6 text-gray-400">لا توجد قضايا مطابقة</td></tr>
                  ) : (
                    displayedCases.map((cs) => (
                      <tr key={cs.id} onClick={() => setSelectedCaseIdFilter(selectedCaseIdFilter === cs.id ? null : cs.id)} className={`cursor-pointer transition ${selectedCaseIdFilter === cs.id ? 'bg-rose-100 font-bold' : 'hover:bg-slate-50'}`}>
                        <td className="p-3 text-rose-950 font-bold">{cs.case_number} {selectedCaseIdFilter === cs.id && '(القضية المحددة)'}</td>
                        <td className="p-3">{cs.case_date || '-'}</td>
                        <td className="p-3 font-semibold text-slate-800">{cs.opponent_name || '-'}</td>
                        <td className="p-3 flex justify-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handlePrintCaseReport(cs); }} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition" title="طباعة تقرير القضية">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingCase(cs); setShowCaseModal(true); }} className="p-1.5 text-rose-800 hover:bg-rose-50 rounded-lg transition" title="تعديل القضية">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete('cases', cs.id); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="حذف القضية">
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
                  عرض {displayedEvents.length} من {filteredEvents.length}
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
                <input type="checkbox" checked={showAllEventsOverride} onChange={(e) => setShowAllEventsOverride(e.target.checked)} className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700" />
                <span>عرض كل الأحداث (تجاوز حد {displayLimits.events})</span>
              </label>
              <button onClick={() => checkTrialLimitAndOpen('events', () => { setEditingEvent(null); setShowEventModal(true); })} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-bold shadow-sm transition">
                <Plus className="w-4 h-4" /> إضافة حدث جديد
              </button>
              <span className="text-[11px] text-slate-400 font-bold">{events.length}/{TRIAL_LIMITS.events}</span>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
            <input type="text" placeholder="بحث باسم الحدث أو نوعه أو رقم القضية..." value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} className="w-full border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50/50" />
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
                    <th className="p-3 text-center rounded-l-xl">إجراءات طباعة / تعديل / حذف</th>
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
                          <button onClick={() => handlePrintEventReport(ev)} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition" title="طباعة تقرير الحدث">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingEvent(ev); setShowEventModal(true); }} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition" title="تعديل الحدث">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete('events', ev.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="حذف الحدث">
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
                <button onClick={() => { setCurrentCalendarDate(new Date(year, month - 1, 1)); setSelectedEventDetails(null); }} className="p-2 bg-white border border-slate-200 hover:bg-blue-900 hover:text-white rounded-xl transition flex items-center gap-1 font-bold text-sm">
                  <ChevronRight className="w-4 h-4" /> الشهر السابق
                </button>
                <h4 className="text-lg font-black text-blue-950">{monthNames[month]} {year}</h4>
                <button onClick={() => { setCurrentCalendarDate(new Date(year, month + 1, 1)); setSelectedEventDetails(null); }} className="p-2 bg-white border border-slate-200 hover:bg-blue-900 hover:text-white rounded-xl transition flex items-center gap-1 font-bold text-sm">
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
                    <div key={index} className={`min-h-[110px] p-2 rounded-2xl border transition flex flex-col justify-between ${!item.dateStr ? 'bg-slate-50/30 border-transparent cursor-default' : isToday ? 'bg-amber-50/60 border-amber-400 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
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
                            <div key={i} onClick={(e) => { e.stopPropagation(); setSelectedEventDetails(ev); }} className={`text-[10px] px-2 py-1 rounded-md truncate font-bold cursor-pointer transition shadow-xs flex items-center justify-between ${isSelectedEv ? 'bg-amber-500 text-white ring-2 ring-blue-950' : 'bg-blue-900 hover:bg-blue-800 text-white'}`} title="انقر لعرض تفاصيل الحدث">
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
                      <Info className="w-5 h-5" /> تفاصيل الحدث / الجلسة المختارة
                    </h5>
                    <div className="flex gap-2">
                      <button onClick={() => handlePrintEventReport(selectedEventDetails)} className="text-xs text-emerald-300 hover:text-white bg-emerald-900/50 hover:bg-emerald-800 px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 border border-emerald-700">
                        <Printer className="w-3.5 h-3.5" /> طباعة هذا الحدث
                      </button>
                      <button onClick={() => setSelectedEventDetails(null)} className="text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl font-bold transition">
                        إخفاء
                      </button>
                    </div>
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
                  إرشاد: انقر على أي شريط أزرق لأي حدث داخل خلايا التقويم بالأعلى لتظهر تفاصيله الكاملة هنا فوراً مع خيار طباعته.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t mt-6">
              <button type="button" onClick={handlePrintMonthlyAgenda} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow transition flex items-center gap-2">
                <Printer className="w-4 h-4" /> طباعة أجندة الشهر
              </button>
              <button type="button" onClick={() => setShowMonthlyAgendaModal(false)} className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold shadow transition">
                إغلاق الأجندة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نوافذ الحوار (Modal) الموكلين */}
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
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'نوع الموكل', listType: 'client_type' }); setOptionPromptValue(''); }} className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="client_type" defaultValue={editingClient?.client_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-blue-900">
                    <option value="">-- اختر نوع الموكل --</option>
                    {(optionLists.client_type || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
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
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'نوع التوكيل', listType: 'poa_type' }); setOptionPromptValue(''); }} className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="power_of_attorney_type" defaultValue={editingClient?.power_of_attorney_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-blue-900">
                    <option value="">-- اختر نوع التوكيل --</option>
                    {(optionLists.poa_type || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
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
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'القطاع', listType: 'sector' }); setOptionPromptValue(''); }} className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="sector" defaultValue={editingClient?.sector || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-blue-900">
                    <option value="">-- اختر القطاع --</option>
                    {(optionLists.sector || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">الجهة</label>
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'الجهة', listType: 'entity' }); setOptionPromptValue(''); }} className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="entity" defaultValue={editingClient?.entity || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-blue-900">
                    <option value="">-- اختر الجهة --</option>
                    {(optionLists.entity || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
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

      {/* نافذة الحوار (Modal) القضايا */}
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
                  <label className="font-bold text-rose-900">الموكل التابع له القضية</label>
                  <button type="button" onClick={() => checkTrialLimitAndOpen('clients', () => { setEditingClient(null); setShowClientModal(true); })} className="text-xs bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-rose-200 transition">
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
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'نوع القضية', listType: 'case_type' }); setOptionPromptValue(''); }} className="text-xs bg-rose-50 text-rose-900 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-blue-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="case_type" defaultValue={editingCase?.case_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-rose-800">
                    <option value="">-- اختر نوع القضية --</option>
                    {(optionLists.case_type || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">درجة التقاضي</label>
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'درجة التقاضي', listType: 'litigation_degree' }); setOptionPromptValue(''); }} className="text-xs bg-rose-50 text-rose-900 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-rose-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="litigation_degree" defaultValue={editingCase?.litigation_degree || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-rose-800">
                    <option value="">-- اختر درجة التقاضي --</option>
                    {(optionLists.litigation_degree || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
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
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'صفة الخصم', listType: 'opponent_type' }); setOptionPromptValue(''); }} className="text-xs bg-rose-50 text-rose-900 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-rose-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="opponent_type" defaultValue={editingCase?.opponent_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-rose-800">
                    <option value="">-- اختر صفة الخصم --</option>
                    {(optionLists.opponent_type || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">محامي المكتب</label>
                    <button type="button" onClick={() => { setEditingLawyer(null); setShowLawyerModal(true); }} className="text-xs bg-rose-50 text-rose-900 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-rose-200 transition">
                      <Plus className="w-3 h-3" /> إضافة محامي
                    </button>
                  </div>
                  <select name="office_lawyer_id" defaultValue={editingCase?.office_lawyer_id || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-rose-800">
                    <option value="">-- اختر محامي المكتب --</option>
                    {lawyersDirectory.map((lw) => <option key={lw.id} value={lw.id}>{lw.lawyer_name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">محامي الخصم</label>
                    <button type="button" onClick={() => { setEditingLawyer(null); setShowLawyerModal(true); }} className="text-xs bg-rose-50 text-rose-900 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-rose-200 transition">
                      <Plus className="w-3 h-3" /> إضافة محامي
                    </button>
                  </div>
                  <select name="opponent_lawyer_id" defaultValue={editingCase?.opponent_lawyer_id || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-rose-800">
                    <option value="">-- اختر محامي الخصم --</option>
                    {lawyersDirectory.map((lw) => <option key={lw.id} value={lw.id}>{lw.lawyer_name}</option>)}
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

      {/* نافذة الحوار (Modal) الأحداث */}
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
                  <label className="font-bold text-emerald-900">القضية المرتبطة</label>
                  <button type="button" onClick={() => checkTrialLimitAndOpen('cases', () => { setEditingCase(null); setShowCaseModal(true); })} className="text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-200 transition">
                    <Plus className="w-3.5 h-3.5" /> إضافة قضية جديدة
                  </button>
                </div>
                <select name="case_id" defaultValue={editingEvent?.case_id || ''} required className="w-full border rounded-xl p-2.5 outline-none bg-emerald-50/50 focus:ring-2 focus:ring-emerald-700">
                  <option value="">-- اختر القضية التابع لها الحدث --</option>
                  {cases.map(cs => <option key={cs.id} value={cs.id}>قضية رقم {cs.case_number} (الخصم: {cs.opponent_name || '-'})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">اسم الحدث / الجلسة</label>
                  <input type="text" name="event_name" defaultValue={editingEvent?.event_name || ''} required placeholder="مثال: جلسة مرافعة ..." className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-700" />
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
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'نوع الحدث', listType: 'event_type' }); setOptionPromptValue(''); }} className="text-xs bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="event_type" defaultValue={editingEvent?.event_type || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-emerald-700">
                    <option value="">-- اختر نوع الحدث --</option>
                    {(optionLists.event_type || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold mb-1 text-slate-700">حالة الحدث</label>
                    <button type="button" onClick={() => { setOptionPrompt({ title: 'حالة الحدث', listType: 'event_status' }); setOptionPromptValue(''); }} className="text-xs bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-200 transition">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>
                  <select name="event_status" defaultValue={editingEvent?.event_status || ''} className="w-full border rounded-xl p-2.5 outline-none bg-slate-50/50 focus:ring-2 focus:ring-emerald-700">
                    <option value="">-- اختر حالة الحدث --</option>
                    {(optionLists.event_status || []).map((item, idx) => <option key={idx} value={item}>{item}</option>)}
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

      {/* نافذة معاينة الطباعة */}
      {printPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
              <h3 className="text-lg font-bold text-blue-950">معاينة الطباعة: {printPreview.title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm">
                  <Printer className="w-4 h-4" /> طباعة
                </button>
                <button onClick={() => setPrintPreview(null)} className="p-2 hover:bg-gray-200 rounded-full transition" title="إغلاق">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4 bg-slate-100">
              <div id="print-preview-onscreen" className="bg-white shadow-sm mx-auto" style={{ maxWidth: '210mm' }} dangerouslySetInnerHTML={{ __html: printPreview.html }} />
            </div>
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

              <div className="pt-2 space-y-2">
                <button onClick={() => { setSidebarOpen(false); setSettingsOfficeName(userOfficeInfo.officeName); setSettingsOfficeAddress(userOfficeInfo.officeAddress); setSettingsOfficePhone(userOfficeInfo.officePhone); setSettingsReportFooter(userOfficeInfo.reportFooter); setSettingsTab('office'); setShowSettingsModal(true); }} className="w-full text-right px-4 py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-sm transition flex items-center gap-3 border border-slate-700/50">
                  <Settings className="w-4 h-4 text-slate-400" /> الإعدادات
                </button>
                <button onClick={() => { setSidebarOpen(false); setShowContactModal(true); }} className="w-full text-right px-4 py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-sm transition flex items-center gap-3 border border-slate-700/50">
                  <MessageCircle className="w-4 h-4 text-slate-400" /> تواصل معنا
                </button>
                <button onClick={() => { setSidebarOpen(false); setShowLawyersListModal(true); }} className="w-full text-right px-4 py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-sm transition flex items-center gap-3 border border-slate-700/50">
                  <Users className="w-4 h-4 text-slate-400" /> المحامين
                </button>
                <button onClick={() => { setSidebarOpen(false); setShowAdminModal(true); }} className="w-full text-right px-4 py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-sm transition flex items-center gap-3 border border-slate-700/50">
                  <UserCog className="w-4 h-4 text-slate-400" /> إدارة المشرف
                </button>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4 text-center">
              <p className="text-xs text-slate-500 font-semibold">{userOfficeInfo.subTitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإعدادات */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[88vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-xl font-bold text-blue-950">الإعدادات</h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex gap-1 px-6 pt-3 border-b overflow-x-auto">
              {[
                { key: 'office', label: 'بيانات المكتب' },
                { key: 'reports', label: 'التقارير' },
                { key: 'security', label: 'الأمان' },
                { key: 'lists', label: 'القوائم' },
                { key: 'display', label: 'العرض' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key as any)}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg whitespace-nowrap transition ${settingsTab === tab.key ? 'bg-blue-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto text-sm">
              {/* تبويب بيانات المكتب */}
              {settingsTab === 'office' && (
                <form onSubmit={handleSaveOfficeName} className="space-y-4">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700">اسم المكتب</label>
                    <input type="text" value={settingsOfficeName} onChange={(e) => setSettingsOfficeName(e.target.value)} required className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700">عنوان المكتب</label>
                    <input type="text" value={settingsOfficeAddress} onChange={(e) => setSettingsOfficeAddress(e.target.value)} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700">هاتف المكتب</label>
                    <input type="text" value={settingsOfficePhone} onChange={(e) => setSettingsOfficePhone(e.target.value)} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" dir="ltr" />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-blue-600/30 flex items-center justify-center shrink-0">
                      <img src={userOfficeInfo.logoUrl || '/default-logo.svg'} alt="اللوجو" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-700 text-xs mb-1">لوجو المكتب</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => logoInputRef.current?.click()} className="text-xs bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition">تغيير</button>
                        {userOfficeInfo.logoUrl && (
                          <button type="button" onClick={handleResetLogo} className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold px-2.5 py-1 rounded-lg border border-rose-200 transition">استخدام الافتراضي</button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={settingsSaving} className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold shadow disabled:opacity-60">
                      {settingsSaving ? 'جاري الحفظ...' : 'حفظ بيانات المكتب'}
                    </button>
                  </div>
                </form>
              )}

              {/* تبويب التقارير */}
              {settingsTab === 'reports' && (
                <form onSubmit={handleSaveOfficeName} className="space-y-4">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700">نص تذييل مخصص للتقارير</label>
                    <textarea value={settingsReportFooter} onChange={(e) => setSettingsReportFooter(e.target.value)} rows={2} placeholder="مثال: هذا التقرير سري وصادر عن المكتب فقط" className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900"></textarea>
                    <p className="text-xs text-slate-500 mt-1">هيظهر تحت تاريخ الطباعة في كل التقارير (الموكل، القضية، الحدث، الأجندة، دليل المحامين).</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={settingsSaving} className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold shadow disabled:opacity-60">
                      {settingsSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                  </div>
                </form>
              )}

              {/* تبويب الأمان */}
              {settingsTab === 'security' && (
                <div className="space-y-6">
                  <form onSubmit={handleChangePassword} className="space-y-3 pb-4 border-b">
                    <h4 className="font-bold text-blue-950">تغيير كلمة المرور</h4>
                    <input type="password" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                    <input type="password" placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                    {passwordMsg && <p className="text-xs">{passwordMsg}</p>}
                    <div className="flex justify-end">
                      <button type="submit" disabled={passwordSaving} className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-xs shadow disabled:opacity-60">
                        {passwordSaving ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleChangeEmail} className="space-y-3">
                    <h4 className="font-bold text-blue-950">تغيير البريد الإلكتروني</h4>
                    <input type="email" placeholder="البريد الإلكتروني الجديد" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" dir="ltr" />
                    {emailMsg && <p className="text-xs">{emailMsg}</p>}
                    <div className="flex justify-end">
                      <button type="submit" disabled={emailSaving} className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-xs shadow disabled:opacity-60">
                        {emailSaving ? 'جاري الحفظ...' : 'تغيير البريد'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* تبويب القوائم */}
              {settingsTab === 'lists' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">القيم اللي أضفتها بنفسك في القوائم المنسدلة. احذف أي قيمة مش محتاجها.</p>
                  {Object.keys(listTypeLabels).map((listType) => {
                    const rows = optionListRows.filter((r) => r.list_type === listType);
                    if (rows.length === 0) return null;
                    return (
                      <div key={listType}>
                        <h5 className="font-bold text-slate-700 text-xs mb-1.5">{listTypeLabels[listType]}</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {rows.map((row) => (
                            <span key={row.id} className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">
                              {row.value}
                              <button onClick={() => { setOptionPrompt({ title: listTypeLabels[listType], listType, editingRowId: row.id }); setOptionPromptValue(row.value); }} className="text-blue-600 hover:text-blue-800">
                                <Edit className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDeleteOptionRow(row)} className="text-rose-500 hover:text-rose-700">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {optionListRows.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">لسه معملتش أي إضافات في القوائم المنسدلة.</p>
                  )}
                </div>
              )}

              {/* تبويب العرض */}
              {settingsTab === 'display' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">تحكم في عدد السجلات المعروضة افتراضياً في كل جدول قبل الضغط على "عرض الكل".</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold mb-1 text-slate-700 text-xs">الموكلين</label>
                      <input type="number" min={1} value={displayLimitsDraft.clients} onChange={(e) => setDisplayLimitsDraft((p: any) => ({ ...p, clients: Number(e.target.value) }))} className="w-full border rounded-xl p-2 outline-none focus:ring-2 focus:ring-blue-900" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-slate-700 text-xs">القضايا</label>
                      <input type="number" min={1} value={displayLimitsDraft.cases} onChange={(e) => setDisplayLimitsDraft((p: any) => ({ ...p, cases: Number(e.target.value) }))} className="w-full border rounded-xl p-2 outline-none focus:ring-2 focus:ring-blue-900" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-slate-700 text-xs">الأحداث</label>
                      <input type="number" min={1} value={displayLimitsDraft.events} onChange={(e) => setDisplayLimitsDraft((p: any) => ({ ...p, events: Number(e.target.value) }))} className="w-full border rounded-xl p-2 outline-none focus:ring-2 focus:ring-blue-900" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={handleSaveDisplayLimits} className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold shadow text-sm">حفظ إعدادات العرض</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة تواصل معنا */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-blue-950">تواصل معنا</h3>
              <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <p>لأي استفسار أو دعم فني بخصوص النظام، تقدر تتواصل معنا عبر:</p>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <strong className="block text-slate-900">البريد الإلكتروني:</strong>
                <span className="text-blue-700">support@example.com</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <strong className="block text-slate-900">الهاتف:</strong>
                <span className="text-blue-700" dir="ltr">01000000000</span>
              </div>
              <p className="text-xs text-slate-400">* عدّل البيانات دي في الكود بمعلومات التواصل الحقيقية بتاعتك.</p>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إدارة المشرف */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-blue-950">إدارة المشرف</h3>
              <button onClick={() => setShowAdminModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex justify-between">
                <span className="text-slate-500">اسم المشرف</span>
                <strong className="text-slate-900">{localStorage.getItem('lawyer_name') || '-'}</strong>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex justify-between">
                <span className="text-slate-500">اسم المكتب</span>
                <strong className="text-slate-900">{userOfficeInfo.officeName}</strong>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex justify-between">
                <span className="text-slate-500">حالة الحساب</span>
                <strong className="text-emerald-700">نشط</strong>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-blue-950">دليل المحامين</h4>
                  <button onClick={() => { setEditingLawyer(null); setShowLawyerModal(true); }} className="bg-blue-900 hover:bg-blue-950 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition">
                    <Plus className="w-3.5 h-3.5" /> إضافة محامي جديد
                  </button>
                </div>
                {lawyersDirectory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">لا يوجد محامين مسجلين في الدليل حالياً.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {lawyersDirectory.map((lw) => (
                      <div key={lw.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                        <div>
                          <div className="font-bold text-slate-900">
                            {lw.lawyer_name} {lw.is_owner && <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full mr-1">أنت (صاحب الحساب)</span>}
                          </div>
                          <div className="text-[11px] text-slate-500">{lw.phone || '-'} {lw.syndicate_number ? `— قيد رقم ${lw.syndicate_number}` : ''}</div>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setEditingLawyer(lw); setShowLawyerModal(true); }} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition" title="تعديل">
                            <Edit className="w-4 h-4" />
                          </button>
                          {!lw.is_owner && (
                            <button onClick={() => handleDeleteLawyer(lw)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="حذف">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة عرض دليل المحامين */}
      {showLawyersListModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-blue-950">المحامين</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintLawyersList} className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm">
                  <Printer className="w-4 h-4" /> طباعة
                </button>
                <button onClick={() => setShowLawyersListModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
            </div>

            {lawyersDirectory.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">لا يوجد محامين مسجلين في الدليل حالياً.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-sm">
                  <thead>
                    <tr className="bg-blue-950 text-white text-xs">
                      <th className="p-3 rounded-r-xl">اسم المحامي</th>
                      <th className="p-3">الهاتف</th>
                      <th className="p-3">التبعية والقضايا</th>
                      <th className="p-3 text-center rounded-l-xl">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lawyersDirectory.map((lw) => {
                      const { officeCases, opponentCases } = getLawyerCaseInfo(lw.id);
                      return (
                        <tr key={lw.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-bold text-slate-900">
                            {lw.lawyer_name}
                            {lw.is_owner && <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full mr-1">صاحب الحساب</span>}
                          </td>
                          <td className="p-3 text-slate-600">{lw.phone || '-'}</td>
                          <td className="p-3 text-xs">
                            {officeCases.length === 0 && opponentCases.length === 0 ? (
                              <span className="text-slate-400">غير مرتبط بقضايا حالياً</span>
                            ) : (
                              <div className="space-y-1">
                                {officeCases.length > 0 && (
                                  <div><span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full font-bold">محامي مكتب</span> — {officeCases.join('، ')}</div>
                                )}
                                {opponentCases.length > 0 && (
                                  <div><span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded-full font-bold">محامي خصم</span> — {opponentCases.join('، ')}</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button onClick={() => { setEditingLawyer(lw); setShowLawyerModal(true); }} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition" title="تعديل">
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-2 border-t">
              <button onClick={() => { setEditingLawyer(null); setShowLawyerModal(true); }} className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-bold shadow-sm transition">
                <Plus className="w-4 h-4" /> إضافة محامي جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تحفيزية عند الوصول لحد النسخة التجريبية */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-blue-950 mb-2">وصلت لحد النسخة التجريبية 🎉</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-1">
              ده معناه إنك بتستخدم النظام بجد! وصلت للحد الأقصى المسموح به من <strong>{upgradeReason}</strong> في النسخة التجريبية.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              اشترك دلوقتي عشان تفتح استخدام غير محدود لكل بيانات مكتبك، بس <strong className="text-emerald-700">150 جنيه شهرياً</strong> (تُدفع كل 6 شهور).
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setShowUpgradeModal(false); setShowContactModal(true); }} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-sm transition">
                تواصل معنا للاشتراك
              </button>
              <button onClick={() => setShowUpgradeModal(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition">
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة / تعديل محامي */}
      {showLawyerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[65] p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-blue-950">{editingLawyer ? 'تعديل بيانات المحامي' : 'إضافة محامي جديد'}</h3>
              <button onClick={() => { setShowLawyerModal(false); setEditingLawyer(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleLawyerSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold mb-1 text-slate-700">اسم المحامي</label>
                <input type="text" name="lawyer_name" defaultValue={editingLawyer?.lawyer_name || ''} required className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">رقم الهاتف</label>
                  <input type="text" name="phone" defaultValue={editingLawyer?.phone || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">رقم قيد النقابة</label>
                  <input type="text" name="syndicate_number" defaultValue={editingLawyer?.syndicate_number || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">الدرجة</label>
                  <input type="text" name="degree" defaultValue={editingLawyer?.degree || ''} placeholder="مثال: محامي أستئناف" className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">البريد الإلكتروني</label>
                  <input type="email" name="email" defaultValue={editingLawyer?.email || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">العنوان</label>
                <input type="text" name="address" defaultValue={editingLawyer?.address || ''} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">ملاحظات</label>
                <textarea name="notes" defaultValue={editingLawyer?.notes || ''} rows={2} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => { setShowLawyerModal(false); setEditingLawyer(null); }} className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold shadow">{editingLawyer ? 'تحديث البيانات' : 'حفظ المحامي'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة بند جديد للقوائم المنسدلة */}
      {optionPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-blue-950">{optionPrompt.editingRowId ? 'تعديل قيمة في' : 'إضافة بند جديد لـ'} {optionPrompt.title}</h3>
              <button onClick={() => setOptionPrompt(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); handleAddDynamicOption(optionPrompt.listType, optionPromptValue); }}
              className="space-y-4"
            >
              <input
                type="text"
                autoFocus
                value={optionPromptValue}
                onChange={(e) => setOptionPromptValue(e.target.value)}
                placeholder={`اكتب قيمة ${optionPrompt.title}...`}
                className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-900"
              />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setOptionPrompt(null)} className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-sm">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm shadow">{optionPrompt.editingRowId ? 'حفظ التعديل' : 'إضافة'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {printPreview && createPortal(
        <div id="print-portal" style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: printPreview.html }} />,
        document.body
      )}
    </div>
  );
}