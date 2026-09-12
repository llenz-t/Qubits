import React from 'react';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  FileText,
  Phone,
  ArrowRight,
  Lock,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Building2,
  UploadCloud,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { PortalPerspective } from '../perspectives/PerspectiveSwitcher';

interface WelcomeViewProps {
  onSelectPerspective: (perspective: 'student' | 'parent' | 'admin') => void;
  isParentAuthenticated: boolean;
  isAdminAuthenticated: boolean;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onSelectPerspective,
  isParentAuthenticated,
  isAdminAuthenticated,
}) => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Welcoming Hero matching user's sketch */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c3830] via-[#0f443a] to-[#07241f] text-white rounded-3xl p-8 sm:p-12 shadow-md border border-emerald-500/20">
        {/* Ambient background decoration */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-400/30">
              <Sparkles size={13} className="text-emerald-300" />
              <span>Islington College · London Met Academic System</span>
            </span>
            <span className="text-xs text-emerald-200/70">Autumn Term 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Welcome to the ClassPulse
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/90 font-medium leading-relaxed">
            As your roles please login in left sides portal with your information
          </p>

          <p className="text-xs sm:text-sm text-emerald-200/75 max-w-2xl leading-relaxed pt-1">
            Access your personalized portal below or use the left navigation bar to monitor attendance records, upload medical slips, connect with Student Services Desk (SSD), or manage institutional curricula.
          </p>
        </div>
      </div>

      {/* 3 Main Role Gateway Cards corresponding to the 3 Left Sidebar Portals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Select Your Campus Portal
            </h2>
            <p className="text-xs text-slate-500">
              Choose your profile type to access role-specific tools and views
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
            3 Portals Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Student Panel */}
          <div
            id="welcome-card-student"
            onClick={() => onSelectPerspective('student')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap size={28} />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Direct Student Access
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                  Student Panel
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enrolled Islington College & London Met Students
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Check real-time attendance against the London Met 80% rule, manage missed classes, and submit requests directly to campus advisors.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>London Met 80% Threshold & Exam Clearance</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <UploadCloud size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-900">Upload Application & Medical Slips</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Phone size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-900">Contact SSD & Book Appointments</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Calendar size={14} className="text-emerald-600 shrink-0" />
                  <span>Live Class Routine (.ics & Google Calendar)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-[#0c3830] group-hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>Open Student Panel</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Parent / Guardian Portal */}
          <div
            id="welcome-card-parent"
            onClick={() => onSelectPerspective('parent')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users size={28} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Lock size={10} />
                    <span>{isParentAuthenticated ? 'Authenticated' : 'College OTP'}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                  Parents Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Guardians & Family Members of Enrolled Students
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Clear, visual, zero-jargon representation of your ward's campus attendance, emergency buffer safety, and official notices.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <span className="text-base leading-none">🟢</span>
                  <span className="font-bold text-slate-900">Visual Traffic-Light Health Indicators</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Remaining Absence Buffer (Sessions before warning)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Sparkles size={14} className="text-emerald-600 shrink-0" />
                  <span>Triple AAA Scholarship Standing</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Phone size={14} className="text-emerald-600 shrink-0" />
                  <span>Enrolled Mobile & Islington SMS Gateway OTP</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 group-hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>{isParentAuthenticated ? 'View Parents Portal' : 'Login with Mobile OTP'}</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: SSD Admin Hub */}
          <div
            id="welcome-card-admin"
            onClick={() => onSelectPerspective('admin')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-slate-800 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                    <Lock size={10} />
                    <span>{isAdminAuthenticated ? 'Cleared' : 'Staff ID'}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-slate-800 transition-colors">
                  SSD Admin Hub
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Student Services Desk Officers & Academic Faculty
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Complete administration suite for attendance governance, waiver approvals, timetable changes, and student database management.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <FileText size={14} className="text-slate-700 shrink-0" />
                  <span className="font-bold text-slate-900">Verify Medical & Application Slips</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <UploadCloud size={14} className="text-slate-700 shrink-0" />
                  <span>Daily Attendance Upload & Roll Marking</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Building2 size={14} className="text-slate-700 shrink-0" />
                  <span>Curricula Editor & Timetable Schedules</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                  <span>Debarment Alerts & Guardian Dispatches</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-slate-800 group-hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>{isAdminAuthenticated ? 'Enter SSD Admin Hub' : 'Enter with Staff ID'}</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* College Information & Helpdesk Reference Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Islington College Student Services Desk (SSD)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Ground Floor, Kamalpokhari, Kathmandu · Operating Sun–Fri 08:00 AM – 05:00 PM
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-mono">
                <Phone size={12} className="text-emerald-600" />
                <span>+977-1-4412345 (Ext. 204)</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-emerald-600" />
                <span>Regulatory 80% London Met Threshold</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => onSelectPerspective('student')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all cursor-pointer"
          >
            <span>Browse as Student</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
