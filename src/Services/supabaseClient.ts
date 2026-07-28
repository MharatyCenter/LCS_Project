import * as Supabase from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// 💡 استخدام الاستدعاء المباشر من الحزمة الشاملة لحل خطأ "createClient is not defined"
export const supabase = Supabase.createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Lawyer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  bar_number: string | null;
  status: string;
};

// 🔍 دالة اختبار الاتصال الفعلي للتأكد من سلامة الربط بالـ public schema
export async function testDatabaseConnection(): Promise<boolean> {
  const { data, error } = await supabase
    .from('lawyers')
    .select('id')
    .limit(1);

  if (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error.message);
    return false;
  } else {
    console.log('✅ تم الاتصال بنجاح بقاعدة البيانات والبيانات العائدة:', data);
    return true;
  }
}