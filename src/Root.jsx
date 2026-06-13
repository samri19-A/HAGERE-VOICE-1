import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LandingPage }    from './pages/LandingPage';
import { RoleSelector }   from './pages/RoleSelector';
import { AuthPage }       from './pages/AuthPage';
import { AdminLogin }     from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import App from './App.jsx';

/**
 * Views:
 *  'idle'   → LandingPage
 *  'select' → RoleSelector  ← ALWAYS shown when Login/Get Started clicked
 *  'app'    → AuthPage → App
 *  'admin'  → AdminLogin → AdminDashboard
 */
export function Root() {
  const { user, role, isAdmin, loading, signOut } = useAuth();
  const [view, setView] = useState('idle');

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg,#4a1630,#7b2d4e)',
        color: '#fff', fontSize: '2.5rem',
      }}>🎤</div>
    );
  }

  // ── Role selector — always show when user clicks Login/Get Started ─────────
  if (view === 'select') {
    return (
      <RoleSelector
        onSelectUser={() => setView('app')}
        onSelectAdmin={() => setView('admin')}
        onBack={() => setView('idle')}
      />
    );
  }

  // ── Admin flow ─────────────────────────────────────────────────────────────
  if (view === 'admin') {
    if (user && isAdmin) {
      return (
        <AdminDashboard
          user={user}
          onSignOut={async () => { await signOut(); setView('idle'); }}
        />
      );
    }
    return <AdminLogin onBack={() => setView('select')} />;
  }

  // ── User app flow ──────────────────────────────────────────────────────────
  if (view === 'app') {
    if (!user) {
      return (
        <AuthPage
          onAuthSuccess={() => setView('app')}
          onBack={() => setView('select')}
        />
      );
    }
    if (isAdmin) {
      return (
        <AdminDashboard
          user={user}
          onSignOut={async () => { await signOut(); setView('idle'); }}
        />
      );
    }
    return (
      <App
        user={user}
        onSignOut={async () => { await signOut(); setView('idle'); }}
      />
    );
  }

  // ── Landing (idle) — if already logged in, auto-enter correct area ─────────
  if (view === 'idle') {
    if (user && isAdmin)       return <AdminDashboard user={user} onSignOut={async () => { await signOut(); setView('idle'); }} />;
    if (user && role === 'user') return <App user={user} onSignOut={async () => { await signOut(); setView('idle'); }} />;
  }

  // ── Default: Landing page — ALL entry points go to selector ───────────────
  return (
    <LandingPage
      onEnterApp={() => setView('select')}
      onEnterAdmin={() => setView('select')}
    />
  );
}
