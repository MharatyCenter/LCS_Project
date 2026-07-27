import { useState } from 'react';
import AuthManager from './components/AuthManager';
import DashboardContent from './components/DashboardContent';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <DashboardContent />;
  }

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