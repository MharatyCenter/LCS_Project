import { useEffect, useState } from 'react';
import { Menu, User, Bell, Building2 } from 'lucide-react';
import { NAV_ITEMS, type ViewKey } from './navConfig';

type Props = {
  current: ViewKey;
  onOpenMobile: () => void;
};

export default function Header({ current, onOpenMobile }: Props) {
  const activeItem = NAV_ITEMS.find((n) => n.key === current);
  
  // 💡 حالات ديناميكية لقراءة اسم المحامي واسم المكتب
  const [userName, setUserName] = useState('المحامي');
  const [officeName, setOfficeName] = useState('مدير النظام');

  useEffect(() => {
    // قراءة البيانات المخزنة عند تحميل الهيدر
    const storedLawyer = localStorage.getItem('lawyer_name');
    const storedOffice = localStorage.getItem('office_name');

    if (storedLawyer) setUserName(storedLawyer);
    if (storedOffice) setOfficeName(storedOffice);
  }, [current]); // إعادة التحديث للتأكد من مزامنة البيانات

  return (
    <header className="sticky top-0 z-20 border-b border-navy-100 bg-gradient-to-l from-white via-white to-navy-50/60 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-700 lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="leading-tight">
            <h1 className="text-base font-bold text-navy-800 sm:text-lg">
              {activeItem?.label ?? 'لوحة التحكم'}
            </h1>
            <p className="hidden text-xs text-navy-400 sm:block">
              {activeItem?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="relative rounded-xl p-2 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold-500 ring-2 ring-white" />
          </button>
          
          {/* عرض اسم المحامي واسم مكتبه بشكل ديناميكي */}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-navy-800">{userName}</p>
            <div className="flex items-center gap-1 justify-end text-xs text-navy-400">
              <span>{officeName}</span>
              <Building2 className="h-3 w-3 text-gold-500" />
            </div>
          </div>
          
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 ring-2 ring-gold-200/60 shadow-sm">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}