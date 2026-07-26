import { useState } from 'react';
import AuthManager from './components/AuthManager';
import DashboardContent from './components/DashboardContent';

export default function App() {
  // 💡 جعلنا الحالة الافتراضية false دائماً عند فتح الموقع لأول مرة لمنع الدخول التلقائي القديم
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <DashboardContent />;
  }

  return (
    <AuthManager 
      onAuthSuccess={() => {
        // لا يسمح بالانتقال إلا إذا نجح الربط الحقيقي مع Supabase وتم تخزين الاسم
        if (localStorage.getItem('lawyer_name')) {
          setIsLoggedIn(true);
        }
      }} 
    />
  );
}