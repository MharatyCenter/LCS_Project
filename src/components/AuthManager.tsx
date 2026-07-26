import { useState, useEffect } from 'react';
import { Lock, Mail, User, Building2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { inputClass } from './ui';
import { supabase } from '../Services/supabaseClient';

type Props = {
  onAuthSuccess: () => void;
};

export default function AuthManager({ onAuthSuccess }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');
  const [form, setForm] = useState({ email: '', password: '', username: '', officeName: '' });

  // تحديد تحية زمنية ذكية حسب وقت الدخول
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('صباح الخير، أهلاً بك مجدداً');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('نهار سعيد، أهلاً بك مجدداً');
    } else {
      setGreeting('مساء الخير، أهلاً بك مجدداً');
    }

    const savedEmail = localStorage.getItem('saved_lawyer_email');
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  // حساب قوة كلمة المرور
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;

    if (score === 1) return { score: 33, text: 'ضعيفة', color: 'bg-red-500' };
    if (score === 2) return { score: 66, text: 'متوسطة', color: 'bg-amber-500' };
    if (score >= 3) return { score: 100, text: 'قوية وآمنة', color: 'bg-emerald-500' };
    return { score: 20, text: 'قصيرة جداً', color: 'bg-red-300' };
  };

  const pwdStrength = getPasswordStrength(form.password);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) throw error;

        localStorage.setItem('saved_lawyer_email', form.email);

        const { data: lawyerData } = await supabase
          .from('lawyers')
          .select('*')
          .eq('email', form.email)
          .single();

        localStorage.setItem('lawyer_id', data.user?.id || '');
        localStorage.setItem('lawyer_name', lawyerData?.name || form.email.split('@')[0]);
        localStorage.setItem('office_name', lawyerData?.specialization || 'المكتب القانوني');
        
        onAuthSuccess();
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('lawyers')
            .insert([
              {
                name: form.username,
                email: form.email,
                specialization: form.officeName,
                status: 'active'
              }
            ]);

          if (profileError) console.error("Profile insertion error:", profileError);
        }

        localStorage.setItem('saved_lawyer_email', form.email);
        localStorage.setItem('lawyer_id', authData.user?.id || '');
        localStorage.setItem('lawyer_name', form.username);
        localStorage.setItem('office_name', form.officeName || 'مكتب قانوني جديد');
        
        onAuthSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع، يرجى التحقق من البيانات والاتصال بالإنترنت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-8">
      {/* خلفية جمالية حية مع دوائر مضيئة متحركة */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/95 p-8 shadow-2xl backdrop-blur-xl transition-all sm:p-10">
        
        {/* رأس الشاشة: الشعار التفاعلي والعبارات */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="group relative mb-3 cursor-pointer">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur transition group-hover:opacity-70" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md border border-blue-100 p-2 transition-transform duration-300 group-hover:scale-105">
              <img src="/EasyUse.jpg" alt="EasyUse Logo" className="h-full w-full object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-1.5">
            EasyUse <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500 animate-bounce" />
          </h1>
          <p className="text-xs font-bold text-blue-600 mt-0.5 tracking-wide">السهل لإدارة المكتب القانوني</p>
        </div>

        {/* الترحيب وعنوان الشاشة */}
        <div className="text-right transition-all duration-300">
          <span className="inline-block text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-1 border border-blue-100">
            {greeting}
          </span>
          <h2 className="text-xl font-extrabold text-navy-900">
            {isLogin ? 'تسجيل الدخول الآمن' : 'إنشاء مكتب قانوني جديد'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {isLogin ? 'أدخل حسابك للوصول إلى بياناتك الخاصة بأمان تام' : 'ابدأ حماية وإدارة مكتبك وقضاياك بكفاءة عالية'}
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 text-right animate-shake">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="mt-6 space-y-4">
          {!isLogin && (
            <div className="space-y-4 animate-fadeIn">
              <div className="relative">
                <Building2 className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="اسم المكتب القانوني"
                  className={`${inputClass} pr-10 text-sm`}
                  value={form.officeName}
                  onChange={(e) => setForm({ ...form, officeName: e.target.value })}
                  required
                />
              </div>
              <div className="relative">
                <User className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="اسم المحامي الكامل"
                  className={`${inputClass} pr-10 text-sm`}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>
          )}
          
          <div className="relative">
            <Mail className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              className={`${inputClass} pr-10 text-sm`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="كلمة المرور"
                className={`${inputClass} pr-10 text-sm`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            
            {/* مؤشر قوة كلمة المرور (يظهر في حالة التسجيل الجديد) */}
            {!isLogin && form.password && (
              <div className="mt-1.5 px-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                  <span>قوة كلمة المرور:</span>
                  <span className="font-bold">{pwdStrength.text}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${pwdStrength.color}`} 
                    style={{ width: `${pwdStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-all hover:bg-navy-800 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                جاري التحقق والتشفير...
              </>
            ) : (
              <>
                {isLogin ? 'دخول آمن' : 'إنشاء وتفعيل الحساب'}
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(null);
            }}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline"
          >
            {isLogin ? 'ليس لديك حساب؟ سجّل مكتبك هنا' : 'لديك حساب بالفعل؟ سجّل دخولك'}
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>حماية كاملة وتشفير سحابي آمن لبيانات العملاء</span>
        </div>
      </div>
    </div>
  );
}