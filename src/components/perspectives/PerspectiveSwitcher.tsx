import React, { useState } from 'react';
import {
  User,
  Users,
  ShieldCheck,
  UserCheck,
  Bell,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { CanonicalStudent, Role } from '../../types/canonical';
import { calculateStudentAttendanceMetrics } from '../../utils/canonicalAttendanceEngine';
import { useCanonicalStore } from '../../hooks/useCanonicalStore';

export type PortalPerspective = 'welcome' | 'student' | 'parent' | 'admin';

interface PerspectiveSwitcherProps {
  currentPerspective: PortalPerspective;
  onPerspectiveChange: (p: PortalPerspective) => void;
  students: CanonicalStudent[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const PerspectiveSwitcher: React.FC<PerspectiveSwitcherProps> = ({
  currentPerspective,
  onPerspectiveChange,
  students,
  selectedStudentId,
  onSelectStudent,
  searchQuery = '',
  onSearchChange,
}) => {
  const currentRole: Role =
    currentPerspective === 'admin' ? 'ADMIN' : currentPerspective === 'parent' ? 'PARENT' : 'STUDENT';
  const { notifications, markNotificationAsRead, resetToDefaults } = useCanonicalStore(
    currentRole,
    selectedStudentId
  );

  const [showNotifModal, setShowNotifModal] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.isRead);

  return (
    <header className="bg-[#FAFAF8] border-b border-[#E4E7EC] px-4 sm:px-8 py-2.5 sticky top-0 z-30">
      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Islington College Brand & Perspective Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#123A63] text-white flex items-center justify-center font-bold text-xs tracking-tight border border-[#0B2947]">
              IC
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-xs font-bold text-[#0B2947] tracking-tight block">
                ISLINGTON COLLEGE
              </span>
              <span className="text-[10px] text-[#667085] font-medium block">
                Student Services Department
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-[#E4E7EC] hidden sm:block mx-1" />

          {/* Perspective Pills */}
          <div className="bg-[#F2F4F7] p-1 rounded-lg flex items-center gap-1 w-full sm:w-auto border border-[#E4E7EC]">
            <button
              id="perspective-student-btn"
              onClick={() => onPerspectiveChange('student')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                currentPerspective === 'student'
                  ? 'bg-white text-[#123A63] shadow-xs border border-[#E4E7EC]'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              <User size={13} className={currentPerspective === 'student' ? 'text-[#123A63]' : ''} />
              <span>Student</span>
            </button>

            <button
              id="perspective-parent-btn"
              onClick={() => onPerspectiveChange('parent')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                currentPerspective === 'parent'
                  ? 'bg-white text-[#123A63] shadow-xs border border-[#E4E7EC]'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              <Users size={13} className={currentPerspective === 'parent' ? 'text-[#123A63]' : ''} />
              <span>Parent / Guardian</span>
            </button>

            <button
              id="perspective-admin-btn"
              onClick={() => onPerspectiveChange('admin')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                currentPerspective === 'admin'
                  ? 'bg-[#123A63] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              <ShieldCheck size={13} />
              <span>SSD Admin</span>
            </button>
          </div>
        </div>

        {/* Right: Active Student Selector & Notifications */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          
          {/* Optional Global Search if handled */}
          {onSearchChange && (
            <div className="relative hidden xl:block w-44">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search students..."
                className="w-full bg-white border border-[#E4E7EC] rounded-md pl-7 pr-2.5 py-1 text-xs text-[#1F2933] focus:outline-none focus:border-[#123A63]"
              />
            </div>
          )}

          {/* Active Record Switcher */}
          <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] px-2.5 py-1 rounded-md text-xs">
            <UserCheck size={13} className="text-[#667085] shrink-0" />
            <span className="text-[#667085] font-medium hidden lg:inline">Active Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="bg-transparent font-medium text-[#1F2933] focus:outline-none cursor-pointer text-xs max-w-[210px] sm:max-w-none truncate"
            >
              {students.map((st) => {
                const metrics = calculateStudentAttendanceMetrics(st);
                const tag =
                  metrics.attendancePercentage < 80
                    ? '⚠️ <80%'
                    : metrics.attendancePercentage >= 95
                    ? '⭐ AAA'
                    : 'On Track';
                return (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({metrics.attendancePercentage}%) — {tag}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Notification Center Trigger */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifModal(!showNotifModal)}
              className="relative p-1.5 rounded-md bg-white border border-[#E4E7EC] hover:bg-[#F2F4F7] text-[#667085] transition-colors cursor-pointer"
              title="View Notifications"
            >
              <Bell size={14} />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C62828] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Drawer Dropdown */}
            {showNotifModal && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-[#E4E7EC] p-4 z-50">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E7EC]">
                  <div className="flex items-center gap-1.5">
                    <Bell size={14} className="text-[#123A63]" />
                    <span className="text-xs font-bold text-[#1F2933]">
                      Notifications ({currentRole})
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifModal(false)}
                    className="text-[#667085] hover:text-[#1F2933] p-1"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#667085]">
                      No notifications for this perspective
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded border text-xs cursor-pointer transition-all ${
                          n.isRead
                            ? 'bg-[#FAFAF8] border-[#E4E7EC] text-[#667085]'
                            : 'bg-white border-[#123A63]/30 text-[#1F2933] font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#123A63]">{n.title}</span>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#667085] mt-1">{n.body}</p>
                        <span className="text-[10px] text-[#98A2B3] mt-1 block font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Reset */}
          <button
            id="reset-canonical-demo-btn"
            onClick={() => {
              if (window.confirm('Reset demo attendance records, support cases, and notices to clean defaults?')) {
                resetToDefaults();
              }
            }}
            title="Reset demo data to initial defaults"
            className="p-1.5 rounded-md text-[#667085] hover:text-[#1F2933] hover:bg-[#F2F4F7] transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>

      </div>
    </header>
  );
};
