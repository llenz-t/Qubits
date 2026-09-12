import React, { useState } from 'react';
import { X, GraduationCap, Users, ShieldCheck } from 'lucide-react';

export type PortalRole = 'student' | 'parent' | 'admin';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (email: string, role: PortalRole) => void;
}

const ROLE_OPTIONS: { id: PortalRole; label: string; hint: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'student', label: 'Student', hint: 'Your own attendance & records', icon: GraduationCap },
  { id: 'parent', label: 'Parent', hint: "Read-only view of your child's report", icon: Users },
  { id: 'admin', label: 'Admin', hint: 'Manage courses, students & attendance', icon: ShieldCheck },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<PortalRole>('student');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLoginSuccess && email) {
      onLoginSuccess(email, role);
    }
    onClose();
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="login-modal-card"
        className="relative w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl border border-neutral-200 text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-login-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
              I am logging in as
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    id={`login-role-${opt.id}`}
                    onClick={() => setRole(opt.id)}
                    title={opt.hint}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0c3830] text-white border-[#0c3830]'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-black text-sm focus:outline-none focus:border-black transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider"
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs text-neutral-500 hover:text-black transition-colors"
              >
                Forgot?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-black text-sm focus:outline-none focus:border-black transition-all"
            />
          </div>

          <button
            id="submit-login-button"
            type="submit"
            className="w-full py-2.5 px-5 rounded-lg font-semibold text-sm bg-black text-white hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer mt-2"
          >
            Login as {ROLE_OPTIONS.find((o) => o.id === role)?.label}
          </button>
        </form>
      </div>
    </div>
  );
};
