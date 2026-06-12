import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import App from './App.jsx';

/**
 * Root router:
 *  / → LandingPage (always shown first)
 *  "Enter App" click → AuthPage (if not logged in) or App (if logged in)
 */
export function Root() {
  const { user, loading, signOut } = useAuth();
  const [showApp, setShowApp] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg,#4a1630,#7b2d4e)', color: '#fff', fontSize: '2.5rem',
      }}>
        🎤
      </div>
    );
  }

  if (showApp) {
    if (!user) return <AuthPage onAuthSuccess={() => {}} onBack={() => setShowApp(false)} />;
    return <App user={user} onSignOut={() => { signOut(); setShowApp(false); }} />;
  }

  return (
    <LandingPage onEnterApp={() => setShowApp(true)} />
  );
}
