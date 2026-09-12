import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Calendar,
  Sparkles,
  Award,
  HeartHandshake,
  Clock,
  UserCheck,
  ChevronRight,
  Smile,
  Info,
  Send,
} from 'lucide-react';
import { CanonicalStudent } from '../../types/canonical';
import { calculateStudentAttendanceMetrics } from '../../utils/canonicalAttendanceEngine';
import { useCanonicalStore } from '../../hooks/useCanonicalStore';

interface ParentPerspectiveProps {
  student: CanonicalStudent;
  verifiedPhone?: string;
}

export const ParentPerspective: React.FC<ParentPerspectiveProps> = ({ student, verifiedPhone }) => {
  const { policy, notices, scheduleAppointment } = useCanonicalStore('PARENT', student.id);
  const metrics = calculateStudentAttendanceMetrics(student, policy);

  const [callbackRequested, setCallbackRequested] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [parentNote, setParentNote] = useState('');

  const isSafe = metrics.attendancePercentage >= 80;
  const isNearRisk = metrics.attendancePercentage >= 75 && metrics.attendancePercentage < 80;
  const isAaaCandidate = metrics.attendancePercentage >= 92;

  // Simple safe absence buffer calculation (number of sessions ward can miss without falling below 80%)
  const bufferSessionsLeft = metrics.remainingAbsenceBuffer;

  const handleRequestCall = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleAppointment(
      student.id,
      'Academic Advisory',
      new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      '10:30 AM - 11:00 AM',
      'Student Advisory Officer',
      'Phone Call / Islington Campus Room 102',
      parentNote || 'Parent requested quick attendance briefing'
    );
    setCallbackRequested(true);
    setTimeout(() => {
      setShowCallModal(false);
      setParentNote('');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Top Friendly Header for Parents */}
      <div className="bg-gradient-to-r from-[#0c3830] to-[#134e4a] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-emerald-400 flex items-center justify-center text-2xl font-black text-emerald-300 shadow-inner">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-400/30">
                Guardian Portal
              </span>
              {verifiedPhone && (
                <span className="text-[11px] font-mono text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                  <Phone size={10} className="text-emerald-300" />
                  <span>{verifiedPhone} · OTP Verified</span>
                </span>
              )}
              <span className="text-xs text-emerald-200/70">· Islington College</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {student.fullName}'s Progress
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5">
              {student.degreeName} ({student.year}) · Roll: <span className="font-mono">{student.rollNumber}</span>
            </p>
          </div>
        </div>

        {/* Quick Advisor Contact Button */}
        <button
          onClick={() => setShowCallModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer self-start md:self-auto"
        >
          <Phone size={16} />
          <span>Request Advisor Callback</span>
        </button>
      </div>

      {/* Primary Visual Traffic-Light Status Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
          isSafe
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : isNearRisk
            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
            : 'bg-rose-50/80 border-rose-200 text-rose-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm ${
                isSafe ? 'bg-emerald-500 text-white' : isNearRisk ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
              }`}
            >
              {isSafe ? '🟢' : isNearRisk ? '🟡' : '🔴'}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">Overall Standing</div>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                {isSafe
                  ? 'Excellent & Exam Cleared!'
                  : isNearRisk
                  ? 'Attendance Needs Care'
                  : 'Action Needed: Low Attendance'}
              </h2>
              <p className="text-xs sm:text-sm mt-1 leading-relaxed max-w-xl opacity-90">
                {isSafe
                  ? `${student.fullName} is attending classes diligently. All criteria for exam entry and semester progression are safely satisfied.`
                  : isNearRisk
                  ? `${student.fullName} should avoid further unnotified leaves this week to maintain safety above the college threshold.`
                  : `Please get in touch with our Student Advisory team to review missed sessions and verify medical slips.`}
              </p>
            </div>
          </div>

          {/* Simple Visual Exam Clearance Badge */}
          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-black/5 text-center min-w-[170px] shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exam Clearance</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <CheckCircle2 size={18} className={isSafe ? 'text-emerald-600' : 'text-amber-600'} />
              <span className="font-extrabold text-slate-900 text-base">
                {isSafe ? 'Eligible' : 'Under Review'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">No exam hold</span>
          </div>
        </div>
      </div>

      {/* 3 Simple Visual Cards for Non-Numeric Parents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Visual Card 1: Safe Emergency Buffer */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Buffer</span>
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{bufferSessionsLeft}</span>
            <span className="text-xs font-semibold text-slate-500">safe classes left</span>
          </div>

          {/* Friendly Battery Level Meter */}
          <div className="flex gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2.5 flex-1 rounded-full ${
                  level <= Math.min(5, Math.ceil(bufferSessionsLeft / 2))
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            {bufferSessionsLeft > 0
              ? `Your child can miss up to ${bufferSessionsLeft} classes in an emergency before reaching exam risk.`
              : 'Attendance buffer fully used. Every class now counts toward exam entry.'}
          </p>
        </div>

        {/* Visual Card 2: Triple AAA Scholarship Standing */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">College Scholarship</span>
            <Award size={20} className="text-amber-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {isAaaCandidate ? '⭐ Star Candidate' : 'On Track'}
            </span>
          </div>

          {/* Friendly Visual Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (metrics.attendancePercentage / 95) * 100)}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Islington awards 100% scholarships to students with stellar attendance and coursework.
          </p>
        </div>

        {/* Visual Card 3: Class Routine & Habits */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Routine</span>
            <Smile size={20} className="text-blue-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">Regular & Punctual</span>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/70">
            <UserCheck size={15} />
            <span className="font-semibold">RFID Biometric Verified</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Check-ins are recorded automatically at campus entrance and lab gates.
          </p>
        </div>

      </div>

      {/* Visual Weekly Habit Tracker (No Numbers) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">This Week's Attendance Check</h3>
            <p className="text-xs text-slate-500">Attendance status for each scheduled day this week.</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            All Required Classes Attended
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          {[
            { day: 'Mon', status: 'ATTENDED', label: 'Attended' },
            { day: 'Tue', status: 'ATTENDED', label: 'Attended' },
            { day: 'Wed', status: 'ATTENDED', label: 'Attended' },
            { day: 'Thu', status: 'HOLIDAY', label: 'College Off' },
            { day: 'Fri', status: 'ATTENDED', label: 'Attended' },
            { day: 'Sat', status: 'UPCOMING', label: 'Scheduled' },
          ].map((item) => (
            <div
              key={item.day}
              className={`p-3.5 rounded-2xl border text-center space-y-1.5 transition-all ${
                item.status === 'ATTENDED'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : item.status === 'HOLIDAY'
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-blue-50/50 border-blue-200 text-blue-900'
              }`}
            >
              <span className="font-mono text-xs font-bold text-slate-500 block uppercase">
                {item.day}
              </span>
              <div className="text-xl">
                {item.status === 'ATTENDED' ? '✅' : item.status === 'HOLIDAY' ? '🌴' : '⏳'}
              </div>
              <span className="text-[11px] font-bold block">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Subject Health Cards (No formulas) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Subjects & Course Modules</h3>
          <p className="text-xs text-slate-500">
            Current visual status for every module your child is taking this semester.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {student.modules.map((m) => {
            const isModuleSafe = m.lectureRate >= 80 && m.tutorialRate >= 80 && m.workshopRate >= 80;
            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isModuleSafe
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isModuleSafe ? '✓' : '!'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {m.code} · Module Leader: {m.moduleLeader}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isModuleSafe
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isModuleSafe ? 'Safe & Cleared' : 'Needs Regularity'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Parent Support & In-Person Appointment Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartHandshake className="text-[#0c3830]" size={20} />
                <h3 className="font-bold text-slate-900 text-base">Talk to Student Advisor</h3>
              </div>
              <button
                onClick={() => setShowCallModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {callbackRequested ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl text-emerald-900">
                <CheckCircle2 className="mx-auto text-emerald-600" size={36} />
                <h4 className="font-bold text-base">Request Received!</h4>
                <p className="text-xs text-emerald-700">
                  An advisor will call your registered phone number within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestCall} className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Our Student Services Officers are available to speak with parents regarding your
                  child's attendance, coursework support, or medical situations.
                </p>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    What would you like to discuss? (Optional)
                  </label>
                  <textarea
                    value={parentNote}
                    onChange={(e) => setParentNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. Inquire about upcoming exams or sickness leave..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-slate-500 font-semibold">Direct Campus Lines:</div>
                  <div className="font-bold text-slate-800">+977-1-4412345 / 4412346</div>
                  <div className="text-[11px] text-slate-400">Kamalpokhari, Kathmandu (Sun-Fri 7am-5pm)</div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCallModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#0c3830] hover:bg-[#0c3830]/90 text-white font-bold cursor-pointer shadow-xs"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
