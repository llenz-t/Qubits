import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  Phone,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  UserCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  Send,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { CanonicalStudent } from '../../types/canonical';
import { DEMO_STAFF_ACCOUNTS, isValidStaffId } from '../../utils/staffAuth';

interface PortalSecurityAuthModalProps {
  isOpen: boolean;
  targetRole: 'parent' | 'admin';
  student: CanonicalStudent;
  onSuccess: (verifiedPhone?: string) => void;
  onClose: () => void;
}

export const PortalSecurityAuthModal: React.FC<PortalSecurityAuthModalProps> = ({
  isOpen,
  targetRole,
  student,
  onSuccess,
  onClose,
}) => {
  // Parent OTP Flow State
  const [parentStep, setParentStep] = useState<'phone' | 'otp'>('phone');
  const [parentPhone, setParentPhone] = useState<string>(student.guardianPhone || '+977-9801239876');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(180); // 3 minutes
  const [showSimulatedSms, setShowSimulatedSms] = useState<boolean>(false);
  const [isCopiedFromSms, setIsCopiedFromSms] = useState<boolean>(false);

  // Staff/Admin Flow State
  const [staffId, setStaffId] = useState('');

  // General State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for 6-digit OTP input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset states when opening modal or changing targetRole
  useEffect(() => {
    if (isOpen) {
      setParentStep('phone');
      setParentPhone(student.guardianPhone || '+977-9801239876');
      setGeneratedOtp('');
      setOtpDigits(['', '', '', '', '', '']);
      setShowSimulatedSms(false);
      setIsCopiedFromSms(false);
      setErrorMessage(null);
      setIsLoading(false);
      setStaffId('');
      setCountdownSeconds(180);
    }
  }, [isOpen, targetRole, student]);

  // Timer countdown for active OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (parentStep === 'otp' && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [parentStep, countdownSeconds]);

  if (!isOpen) return null;

  // Generate a cryptographically simulated 6-digit College System OTP
  const handleGenerateCollegeOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Validate phone number
    const cleanPhone = parentPhone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid personal phone number (at least 8 digits).');
      return;
    }

    setIsLoading(true);

    // Simulate College System SMS Gateway dispatch
    setTimeout(() => {
      // 6-digit random code
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setOtpDigits(['', '', '', '', '', '']);
      setParentStep('otp');
      setCountdownSeconds(180);
      setOtpSentTime(Date.now());
      setIsLoading(false);
      setShowSimulatedSms(true);
      setIsCopiedFromSms(false);

      // Focus first OTP input on transition
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }, 600);
  };

  // Handle single digit changes in OTP inputs
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '');

    // If user pasted a full code or multiple numbers
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pastedDigits.forEach((digit, idx) => {
        if (idx < 6) newDigits[idx] = digit;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-fill the generated OTP from simulated SMS
  const handleAutoFillOtp = () => {
    if (generatedOtp && generatedOtp.length === 6) {
      setOtpDigits(generatedOtp.split(''));
      setIsCopiedFromSms(true);
      setErrorMessage(null);
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code received on your phone.');
      return;
    }

    if (countdownSeconds <= 0) {
      setErrorMessage('The verification code has expired. Please request a new code from the College Gateway.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (enteredOtp !== generatedOtp) {
        setErrorMessage('Invalid verification code. Please check the SMS or click "Auto-Fill Code" to try again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccess(parentPhone);
    }, 450);
  };

  // Staff ID verification
  const handleAdminSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      if (!isValidStaffId(staffId)) {
        setErrorMessage('Staff ID not recognized. Use one of the demo Staff IDs below, or click one to sign in.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccess();
    }, 400);
  };

  // Format timer into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Top Header Ribbon */}
        <div
          className={`p-6 text-white ${
            targetRole === 'parent'
              ? 'bg-gradient-to-r from-[#0c3830] via-[#0f463c] to-[#14532d]'
              : 'bg-gradient-to-r from-[#0c3830] via-[#1e293b] to-[#0f172a]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                {targetRole === 'parent' ? <Smartphone size={20} /> : <Shield size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    {targetRole === 'parent' ? 'College System OTP Protocol' : 'Administrative Security Clearance'}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold tracking-tight mt-0.5">
                  {targetRole === 'parent' ? 'Parent & Guardian Portal' : 'SSD Administrator Hub'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-white/85 leading-relaxed">
            {targetRole === 'parent' ? (
              <>
                Connect via parent's personal mobile number for student{' '}
                <span className="font-bold text-white underline decoration-emerald-400 underline-offset-2">
                  {student.fullName}
                </span>{' '}
                ({student.rollNumber}). A secure one-time verification code is generated directly by the Islington College system.
              </>
            ) : (
              'Access to Student Services Desk (SSD) Admin Hub. Restricted to authorized faculty and administrative officers.'
            )}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-800 text-xs animate-in slide-in-from-top-1">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PARENT OTP VERIFICATION FLOW */}
          {targetRole === 'parent' && (
            <>
              {/* STEP 1: Phone Number Entry & Request OTP */}
              {parentStep === 'phone' && (
                <form onSubmit={handleGenerateCollegeOtp} className="space-y-4">
                  {/* Student Registry Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Enrolled Student:</span>
                      <span className="font-bold text-slate-900">{student.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Roll Number:</span>
                      <span className="font-mono font-bold text-slate-900">{student.rollNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-slate-200/80 pt-2">
                      <span className="text-slate-500 font-medium">Registered Guardian:</span>
                      <span className="font-semibold text-emerald-800">
                        {student.guardianName} ({student.guardianRelation})
                      </span>
                    </div>
                  </div>

                  {/* Personal Mobile Number Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="text-emerald-700" />
                        <span>Parent Personal Mobile Number</span>
                      </span>
                      <span className="text-[11px] font-normal text-slate-500">For SMS OTP Delivery</span>
                    </label>

                    <div className="relative">
                      <div className="absolute left-3.5 top-3 flex items-center gap-1.5 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2.5">
                        <span>🇳🇵 +977</span>
                      </div>
                      <input
                        type="tel"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="e.g. 9801239876"
                        autoFocus
                        className="w-full pl-24 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c3830]"
                      />
                    </div>
                  </div>

                  {/* Quick-fill Button for Registered Record */}
                  {student.guardianPhone && parentPhone !== student.guardianPhone && (
                    <button
                      type="button"
                      onClick={() => setParentPhone(student.guardianPhone)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Revert to official student record phone:</span>
                      <span className="font-mono underline">{student.guardianPhone}</span>
                    </button>
                  )}

                  {/* Informational Guidance */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                    <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">College System Generated Code</strong>
                      <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                        Clicking below sends an authorized request to Islington College's central verification system. An official 6-digit OTP will be generated for your phone.
                      </p>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0c3830] text-white text-xs font-extrabold hover:bg-[#0c3830]/90 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Generating OTP through College System...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Generate College System OTP</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter & Verify 6-Digit OTP */}
              {parentStep === 'otp' && (
                <div className="space-y-4">
                  {/* Simulated Real-Time College System SMS Dispatch Notification Toast */}
                  {showSimulatedSms && (
                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl border border-emerald-500/40 relative animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                            <MessageSquare size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-black uppercase text-emerald-400">
                                SMS: ISLINGTON-SSD
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
                            </div>
                            <div className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                              Your Islington College Parent Portal verification code is{' '}
                              <strong className="text-white text-sm font-mono tracking-wider bg-white/10 px-1.5 py-0.5 rounded border border-white/20">
                                {generatedOtp}
                              </strong>
                              . Valid for 3 minutes.
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowSimulatedSms(false)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Dispatched to {parentPhone}</span>
                        <button
                          type="button"
                          onClick={handleAutoFillOtp}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md transition-colors"
                        >
                          <Sparkles size={12} />
                          <span>{isCopiedFromSms ? 'Code Inserted ✓' : 'Auto-Fill Code'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verification Instructions & Number Badge */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Code dispatched to:</span>
                      <span className="text-xs font-bold font-mono text-slate-900">{parentPhone}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setParentStep('phone')}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft size={12} />
                      <span>Change Number</span>
                    </button>
                  </div>

                  {/* 6-Digit OTP Input Grid */}
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Enter 6-Digit Verification Code
                        </label>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 font-semibold">
                          <Clock size={12} className={countdownSeconds < 30 ? 'text-rose-500' : 'text-slate-400'} />
                          <span className={countdownSeconds < 30 ? 'text-rose-600 font-bold' : ''}>
                            {formatTime(countdownSeconds)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className={`w-full aspect-square text-center font-mono text-lg font-black rounded-xl border transition-all ${
                              digit
                                ? 'bg-emerald-50/40 border-emerald-500 text-emerald-950 shadow-xs'
                                : 'bg-slate-50 border-slate-300 text-slate-900'
                            } focus:bg-white focus:border-[#0c3830] focus:ring-2 focus:ring-[#0c3830]/20 focus:outline-none`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resend & 1-Click Fill Helpers */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleGenerateCollegeOtp()}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        <span>Resend OTP Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAutoFillOtp}
                        className="text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Sparkles size={13} className="text-emerald-600" />
                        <span>Auto-Fill Received Code ({generatedOtp})</span>
                      </button>
                    </div>

                    {/* Primary Verification Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0c3830] text-white text-xs font-extrabold hover:bg-[#0c3830]/90 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Verifying with College System...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          <span>Verify Code & Enter Parent Hub</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          {/* SSD ADMIN HUB AUTHENTICATION FLOW */}
          {targetRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Staff ID</label>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                    e.g. {DEMO_STAFF_ACCOUNTS[0].staffId}
                  </span>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Enter staff ID (e.g. ${DEMO_STAFF_ACCOUNTS[0].staffId})`}
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c3830]"
                  />
                </div>
              </div>

              {/* Quick Demo Staff Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_STAFF_ACCOUNTS.map((account) => {
                  const isSelected = staffId.trim().toUpperCase() === account.staffId;
                  return (
                    <button
                      key={account.staffId}
                      type="button"
                      onClick={() => setStaffId(account.staffId)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 text-slate-900 font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-emerald-800 font-bold">
                        {account.staffId}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        {account.name} · {account.role}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0c3830] text-white text-xs font-extrabold hover:bg-[#0c3830]/90 transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Staff ID...</span>
                  ) : (
                    <>
                      <span>Authenticate & Open Portal</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {/* Instant 1-Click Demo Shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    const demoAccount = DEMO_STAFF_ACCOUNTS[0];
                    setStaffId(demoAccount.staffId);
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      onSuccess();
                    }, 250);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Sparkles size={14} className="text-emerald-600" />
                  <span>1-Click Quick Demo Sign In (SSD Admin)</span>
                </button>
              </div>
            </form>
          )}

          {/* Cancel button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel and stay on Student Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
