import { LayoutDashboard, Users, Briefcase, CalendarDays, Scale, Gavel } from 'lucide-react';

export type ViewKey = 'overview' | 'lawyers' | 'clients' | 'cases' | 'events';

export type NavItem = {
  key: ViewKey;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'overview',
    label: 'اللوحة الرئيسية',
    icon: LayoutDashboard,
    description: 'نظرة عامة وإحصائيات',
  },
  {
    key: 'lawyers',
    label: 'المحامون',
    icon: Gavel,
    description: 'إدارة بيانات المحامين',
  },
  {
    key: 'clients',
    label: 'العملاء',
    icon: Users,
    description: 'إدارة بيانات العملاء',
  },
  {
    key: 'cases',
    label: 'القضايا',
    icon: Briefcase,
    description: 'متابعة القضايا القانونية',
  },
  {
    key: 'events',
    label: 'الأحداث',
    icon: CalendarDays,
    description: 'الجلسات والمواعيد',
  },
];

export const APP_NAME = 'لكس سويت';
export const APP_NAME_EN = 'LCS Suite';
export const APP_TAGLINE = 'إدارة المكتب القانوني';

export const BRAND_ICON = Scale;
