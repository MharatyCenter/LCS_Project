import { Scale, LogOut, X, Bell, User, Building2 } from 'lucide-react';
import { NAV_ITEMS, APP_NAME, APP_NAME_EN, type ViewKey } from './navConfig';

type Props = {
  current: ViewKey;
  onNavigate: (key: ViewKey) => void;
  onSignOut: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  userName: string;
  officeName: string;
};

export default function Sidebar({ 
  current, 
  onNavigate, 
  onSignOut, 
  mobileOpen, 
  onCloseMobile,
  userName,
  officeName
}: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm animate-fade-in lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-72 flex-col bg-navy-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-5 bg-navy-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-900/30">
              <Scale className="h-5.5 w-5.5 text-navy-950" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-extrabold tracking-tight text-white">{APP_NAME}</p>
              <p className="text-[11px] font-medium text-gold-400/80">{APP_NAME_EN}</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-navy-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
            القائمة الرئيسية
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-all ${
                  active
                    ? 'bg-gradient-to-r from-gold-500/20 to-white/10 text-white shadow-sm border-r-4 border-gold-500'
                    : 'text-navy-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                      : 'bg-white/5 text-navy-200 group-hover:bg-white/10 group-hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={`block text-xs ${active ? 'text-gold-300/80' : 'text-navy-400'}`}>
                    {item.description}
                  </span>
                </span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* User profile inside sidebar base or Sign out */}
        <div className="border-t border-white/10 p-4 bg-navy-900/30">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 font-bold shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-gold-400/80 truncate flex items-center gap-1">
                <span>{officeName}</span>
                <Building2 className="h-2.5 w-2.5" />
              </p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200 border border-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}