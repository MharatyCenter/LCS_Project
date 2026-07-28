import { useState, useEffect } from 'react';
import AuthManager from './components/AuthManager';
import DashboardContent from './components/DashboardContent';
import { testDatabaseConnection } from './Services/supabaseClient';

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'failed'>('testing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 1. الخطوة الأولى: فحص الاتصال بقاعدة البيانات عند فتح التطبيق مباشرة
  useEffect(() => {
    async function runConnectionCheck() {
      try {
        const isConnected = await testDatabaseConnection();
        if (isConnected) {
          setConnectionStatus('success');
        } else {
          setConnectionStatus('failed');
          setErrorMessage('فشل الاتصال بقاعدة البيانات. يجدر التحقق من إعدادات الاتصال.');
        }
      } catch (err: any) {
        setConnectionStatus('failed');
        setErrorMessage(err?.message || 'حدث خطأ غير متوقع أثناء الفحص.');
      }
    }

    runConnectionCheck();
  }, []);

  // إذا كان الفحص جاريًا
  if (connectionStatus === 'testing') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ color: '#38bdf8', marginBottom: '15px' }}>جاري فحص الاتصال بقاعدة البيانات... 🔄</h2>
          <p style={styles.text}>يرجى الانتظار لحين التحقق من استجابة النظام.</p>
        </div>
      </div>
    );
  }

  // إذا فشل الاتصال بقاعدة البيانات (نمنع الدخول تماماً لحين الإصلاح)
  if (connectionStatus === 'failed') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ color: '#f87171', marginBottom: '15px' }}>❌ خطل في الاتصال</h2>
          <p style={{ ...styles.text, background: '#7f1d1d', padding: '12px', borderRadius: '8px' }}>
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  // 2. الخطوة الثانية: إذا نجح الاتصال، نتحقق مما إذا كان المستخدم قد سجّل دخوله أم لا
  if (isLoggedIn) {
    return <DashboardContent />;
  }

  // 3. عرض شاشة تسجيل الدخول كخطوة افتراضية بعد نجاح الاتصال
  return (
    <AuthManager 
      onAuthSuccess={() => {
        if (localStorage.getItem('lawyer_name')) {
          setIsLoggedIn(true);
        }
      }} 
    />
  );
}

const styles = {
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    height: '100vh',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontFamily: 'Cairo, Tahoma, sans-serif',
    direction: 'rtl' as const,
    padding: '20px',
    textAlign: 'center' as const,
  },
  card: {
    background: '#1e293b',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    width: '100%',
    border: '1px solid #334155',
  },
  text: {
    color: '#cbd5e1',
    fontSize: '15px',
  }
};