import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  UserCheck,
} from 'lucide-react';
import { CanonicalStoreService } from '../../data/canonicalStore';
import { CanonicalStudent } from '../../types/canonical';

interface StudentLoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLoginSuccess: (student: CanonicalStudent) => void;
  isStandalone?: boolean;
}

const DEMO_PASSWORD = 'Demo@1234';

const PRESET_STUDENTS = [
  {
    label: 'My Student Account',
    roll: 'NP01AI4A250009',
    email: 'np01ai4a250009@islingtoncollege.edu.np',
    desc: 'BSc (Hons) AI · User ID',
    highlight: true,
  },
  {
    label: 'Aarav Sharma',
    roll: 'NP03CS4S24014',
    email: 'np03cs4s24014@islingtoncollege.edu.np',
    desc: 'Year 2 AI · 93.3% Attendance',
  },
  {
    label: 'Priya Thapa',
    roll: 'NP03CS4S24022',
    email: 'np03cs4s24022@islingtoncollege.edu.np',
    desc: 'Year 2 AI · 97.2% Exemplary',
  },
  {
    label: 'Rohan Maharjan',
    roll: 'NP03CS4S24051',
    email: 'np03cs4s24051@islingtoncollege.edu.np',
    desc: 'Year 2 AI · 69.5% Debarment Warning',
  },
];

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen = true,
  onClose,
  onLoginSuccess,
  isStandalone = false,
}) => {
  const [email, setEmail] = useState('np01ai4a250009@islingtoncollege.edu.np');
  const [rollNumber, setRollNumber] = useState('NP01AI4A250009');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen && !isStandalone) return null;

  const handleApplyPreset = (presetEmail: string, presetRoll: string) => {
    setEmail(presetEmail);
    setRollNumber(presetRoll);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanEmail = email.trim();
    let cleanRoll = rollNumber.trim().toUpperCase();

    if (!cleanEmail && !cleanRoll) {
      setError('Please enter your Islington College email or student roll ID.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    // If user provided roll number but forgot full email domain
    if (cleanEmail && !cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail.toLowerCase()}@islingtoncollege.edu.np`;
    }

    // If user provided email but left roll empty, derive roll from email prefix
    if (!cleanRoll && cleanEmail) {
      cleanRoll = cleanEmail.split('@')[0].toUpperCase();
    }

    // If user provided roll but left email empty, derive email
    if (!cleanEmail && cleanRoll) {
      cleanEmail = `${cleanRoll.toLowerCase()}@islingtoncollege.edu.np`;
    }

    setIsSubmitting(true);

    try {
      const store = CanonicalStoreService.getInstance();
      const student = store.authenticateOrRegisterStudent(cleanEmail, cleanRoll);

      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('attendease_logged_in_student_id', student.id);
        localStorage.setItem('attendease_logged_in_email', student.email);
        localStorage.setItem('attendease_logged_in_roll', student.rollNumber);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(student);
        if (onClose) onClose();
      }, 300);
    } catch (err) {
      setIsSubmitting(false);
      setError('Unable to authenticate. Please verify your credentials and try again.');
    }
  };

  const content = (
    <div
      id="student-login-card"
      className={`w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden ${
        isStandalone ? 'my-auto' : ''
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Institutional Header Banner */}
      <div className="bg-[#0c3830] text-white p-6 sm:p-7 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-emerald-500/10 pointer-events-none blur-xl" />
        <div className="absolute left-1/2 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-emerald-300 text-lg shadow-inner">
              IC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  ISLINGTON COLLEGE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Portal Gateway
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                Student Services & Attendance Management System
              </p>
            </div>
          </div>

          {onClose && !isStandalone && (
            <button
              id="close-login-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-full text-emerald-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/90 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            London Metropolitan University Partner
          </span>
          <span className="text-[11px] text-emerald-300/80">
            Kamal Pokhari, Kathmandu
          </span>
        </div>
      </div>

      {/* Main Login Form Body */}
      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Student Portal Sign In</span>
            <Sparkles size={16} className="text-emerald-600" />
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Enter your official Islington College email or Student Roll ID, plus your password, to access your dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. College Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="student-college-email"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              College Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="student-college-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. np01ai4a250009@islingtoncollege.edu.np"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            {!email.includes('@') && email.length > 3 && (
              <button
                type="button"
                onClick={() => setEmail(`${email.toLowerCase()}@islingtoncollege.edu.np`)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer mt-1"
              >
                <span>Append @islingtoncollege.edu.np</span>
              </button>
            )}
          </div>

          {/* 2. Student Roll Number / ID */}
          <div className="space-y-1.5">
            <label
              htmlFor="student-roll-number"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Student Roll ID / University Number
            </label>
            <div className="relative">
              <GraduationCap
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="student-roll-number"
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                placeholder="e.g. NP01AI4A250009"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all uppercase"
              />
            </div>
          </div>

          {/* 3. Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="student-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
              <span className="text-[10px] text-slate-400 font-medium normal-case">
                Demo mode — any password works
              </span>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="student-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your portal password"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Keep me signed in on this device</span>
            </label>
            <span className="text-slate-400 flex items-center gap-1">
              <Lock size={11} />
              SSD SSL Secured
            </span>
          </div>

          {/* Submit Button */}
          <button
            id="student-portal-signin-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#0c3830] hover:bg-[#114b41] active:scale-[0.99] text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 mt-3"
          >
            {isSubmitting ? (
              <span>Authenticating with SSD...</span>
            ) : (
              <>
                <UserCheck size={16} />
                <span>Enter Islington Student Portal</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Student Picker */}
        <div className="pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Or Instant Sign In as Registered Student:
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              One-Click Login
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_STUDENTS.map((preset) => {
              const isSelected =
                rollNumber === preset.roll || email.toLowerCase() === preset.email.toLowerCase();

              return (
                <button
                  key={preset.roll}
                  type="button"
                  onClick={() => handleApplyPreset(preset.email, preset.roll)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 text-slate-900 font-bold'
                      : preset.highlight
                      ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/70 text-slate-800'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-emerald-800 mt-0.5">
                    {preset.roll}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {preset.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Helper Footnote */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Need assistance with your college credentials or biometric registration?{' '}
            <span className="text-emerald-700 font-bold">Contact Student Services Desk (SSD)</span>{' '}
            at Block A or email <span className="font-mono text-slate-700">ssd@islingtoncollege.edu.np</span>
          </p>
        </div>
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0c3830] text-emerald-300 flex items-center justify-center font-black text-xs">
              IC
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900 tracking-tight block leading-tight">
                ClassPulse · Islington College
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Student Attendance & Regulatory Compliance Portal
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center w-full my-4">
          {content}
        </main>

        <footer className="w-full max-w-5xl mx-auto text-center py-2 text-xs text-slate-400">
          © 2026 Islington College. Validated for London Metropolitan University Academic Boards.
        </footer>
      </div>
    );
  }

  return (
    <div
      id="student-login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      {content}
    </div>
  );
};
