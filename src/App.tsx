import React, { useState } from 'react';
import { LoginModal, PortalRole } from './components/LoginModal';
import { Dashboard } from './components/Dashboard';
import { ParentPortal } from './components/ParentPortal';
import { ArrowRight } from 'lucide-react';

type CurrentView = 'landing' | 'dashboard' | 'parent';

export default function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('landing');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [role, setRole] = useState<PortalRole>('student');

  const handleBackToLanding = () => setCurrentView('landing');

  if (currentView === 'dashboard') {
    return <Dashboard role={role === 'admin' ? 'admin' : 'student'} onBack={handleBackToLanding} />;
  }

  if (currentView === 'parent') {
    return <ParentPortal onBack={handleBackToLanding} />;
  }

  return (
    <div className="relative min-h-screen w-full bg-white text-black flex flex-col justify-between p-6 select-none">
      {/* Top Bar with Go to Dashboard button on top right */}
      <header className="w-full flex justify-end items-center">
        <button
          id="goto-dashboard-btn"
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200/80 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <span>Go to Dashboard</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Main Center content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center gap-6">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-black">
          ClassPulse
        </h1>

        <button
          id="check-attendance-button"
          onClick={() => setIsLoginOpen(true)}
          className="px-6 py-3 rounded-xl text-sm sm:text-base font-semibold bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          check your attendance
        </button>
      </main>

      {/* Empty footer space for balance */}
      <footer className="h-6" />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(_email, selectedRole) => {
          setRole(selectedRole);
          setIsLoginOpen(false);
          setCurrentView(selectedRole === 'parent' ? 'parent' : 'dashboard');
        }}
      />
    </div>
  );
}
