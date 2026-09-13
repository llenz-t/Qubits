import { useState, useEffect } from 'react';
import { User, ChartPie, BookOpen, FileText, CalendarDots, SignOut, CheckCircle, XCircle, Clock } from '@phosphor-icons/react';
import { getStudentDashboard } from '../../lib/apiClient';
import type { StudentDashboard as DashboardData } from '../../types/canonical';
import DonutChart from '../shared/DonutChart';
import MetricCard from '../shared/MetricCard';
import ProgressBar from '../shared/ProgressBar';
import JustificationForm from './JustificationForm';
import InformationPage from '../shared/InformationPage';
import { weightedAttendancePercent } from '../../lib/constants';

/**
 * The student's main screen: profile card, important messages, the
 * attendance donut + metric cards + safety margin, a per-course list
 * that can be clicked to "drill down" (see focusedModuleId below), the
 * justification form, and upcoming events. All data comes from one call
 * to GET /api/students/:id/dashboard.
 */
interface StudentDashboardProps {
  studentId: string;
  onLogout: () => void;
}

// Islington's rule: you must attend >=80% of a course's classes. Given
// how many classes are already lost (raw absences, weighted late
// arrivals folded in via totalAbsent upstream), this returns how many
// more the student could lose before dropping under that 80% floor —
// i.e. the attendance safety margin, never negative.
function calculateAbsenceAllowance(totalClassesSemester: number, alreadyLost: number) {
  const minRequiredToAttend = Math.ceil(0.8 * totalClassesSemester);
  const maxAllowedAbsences = totalClassesSemester - minRequiredToAttend;
  return Math.max(0, maxAllowedAbsences - alreadyLost);
}

export default function StudentDashboard({ studentId, onLogout }: StudentDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Clicking a course card in "Your Courses" sets this, which makes the
  // donut/metrics/margin above re-render for just that course instead of
  // the overall term totals. Clicking the same course again clears it.
  const [focusedModuleId, setFocusedModuleId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [studentId]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const dashboard = await getStudentDashboard(studentId);
      setData(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  function handleCourseClick(moduleId: string) {
    setFocusedModuleId(prev => prev === moduleId ? null : moduleId);
  }

  if (loading) {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc'}}>
        <div style={{fontSize: '14px', color: '#64748b'}}>Loading dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px'}}>
        <div style={{maxWidth: '600px', margin: '0 auto', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px'}}>
          <p style={{color: '#991b1b', marginBottom: '16px'}}>{error || 'Failed to load dashboard'}</p>
          <button onClick={onLogout} style={{color: '#dc2626', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline', fontSize: '14px'}}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  let displayStats = {
    ...data.overall,
    attendancePercent: weightedAttendancePercent(data.overall.totalPresent, data.overall.totalLate, data.overall.totalHeld)
  };
  let totalSemesterClasses = data.courses.reduce((sum, c) => sum + (c.totalclassespersemester || 0), 0);
  let focusedCourseName = 'Overall';

  if (focusedModuleId) {
    const focusedCourse = data.courses.find(c => c.moduleid === focusedModuleId);
    if (focusedCourse) {
      displayStats = {
        totalHeld: focusedCourse.totalsessions,
        totalPresent: focusedCourse.present,
        totalLate: focusedCourse.late,
        totalAbsent: focusedCourse.totaleffectiveabsent,
        attendancePercent: weightedAttendancePercent(focusedCourse.present, focusedCourse.late, focusedCourse.totalsessions)
      };
      totalSemesterClasses = focusedCourse.totalclassespersemester || 0;
      focusedCourseName = focusedCourse.modulename || focusedCourse.moduleid;
    }
  }

  const attendanceMargin = calculateAbsenceAllowance(totalSemesterClasses, displayStats.totalAbsent);

  const donutData = [
    { name: 'Present', value: displayStats.totalPresent, color: '#10b981' },
    { name: 'Late', value: displayStats.totalLate, color: '#f59e0b' },
    { name: 'Absent', value: displayStats.totalAbsent, color: '#ef4444' }
  ];

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
      {/* Navigation */}
      <div style={{backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50}}>
        <div style={{maxWidth: '1400px', margin: '0 auto', padding: '16px 24px'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px'}}>
            {/* Centered Navigation */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flex: 1,
              justifyContent: 'center'
            }}>
              {[
                { href: '#overview', icon: ChartPie, label: 'Overview' },
                { href: '#courses', icon: BookOpen, label: 'Courses' },
                { href: '#justifications', icon: FileText, label: 'Justifications' },
                { href: '#events', icon: CalendarDots, label: 'Events' }
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    color: '#64748b',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.color = '#0f172a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }}
                >
                  <item.icon size={18} weight="regular" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                color: '#64748b',
                backgroundColor: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <SignOut size={18} weight="regular" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1400px', margin: '0 auto', padding: '32px 24px'}}>
        {/* Profile Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: '#3b82f615',
              borderRadius: '12px',
              flexShrink: 0
            }}>
              <User size={32} weight="duotone" color="#3b82f6" />
            </div>
            <div style={{flex: 1}}>
              <h1 style={{fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.02em'}}>
                {data.student.studentname}
              </h1>
              <div style={{display: 'grid', gap: '8px', fontSize: '14px', color: '#64748b'}}>
                <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                  <span><strong style={{color: '#475569'}}>ID:</strong> {data.student.studentid}</span>
                  <span><strong style={{color: '#475569'}}>Year:</strong> {data.student.year}</span>
                  <span><strong style={{color: '#475569'}}>Section:</strong> {data.student.sectioncode}</span>
                </div>
                <div><strong style={{color: '#475569'}}>Programme:</strong> {data.student.programmename}</div>
                <div><strong style={{color: '#475569'}}>Email:</strong> {data.student.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Messages */}
        <div style={{marginBottom: '32px'}}>
          <InformationPage studentId={studentId} apiBase={`/api/students/${studentId}`} showOnlyMessages />
        </div>

        {/* Overview Section */}
        <div id="overview" style={{scrollMarginTop: '80px', marginBottom: '48px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', letterSpacing: '-0.01em'}}>
            Attendance Overview
          </h2>

          {/* Viewing Filter */}
          {focusedModuleId && (
            <div style={{marginBottom: '24px'}}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#475569'
              }}>
                Viewing: <span style={{color: '#059669'}}>{focusedCourseName}</span>
                <button
                  onClick={() => setFocusedModuleId(null)}
                  style={{
                    marginLeft: '8px',
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  View Overall
                </button>
              </div>
            </div>
          )}

          {/* Donut Chart + Metrics */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <div style={{display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '48px', alignItems: 'center'}}>
              <DonutChart
                data={donutData}
                centerValue={`${displayStats.attendancePercent.toFixed(0)}%`}
                centerLabel="Attendance"
                size={220}
              />
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <MetricCard
                  label="Classes Held"
                  value={displayStats.totalHeld}
                  icon={<CalendarDots size={16} weight="fill" />}
                  color="#64748b"
                />
                <MetricCard
                  label="Present"
                  value={displayStats.totalPresent}
                  icon={<CheckCircle size={16} weight="fill" />}
                  color="#10b981"
                />
                <MetricCard
                  label="Late"
                  value={displayStats.totalLate}
                  icon={<Clock size={16} weight="fill" />}
                  color="#f59e0b"
                />
                <MetricCard
                  label="Absent"
                  value={displayStats.totalAbsent}
                  icon={<XCircle size={16} weight="fill" />}
                  color="#ef4444"
                />
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div style={{display: 'grid', gap: '16px'}}>
            <ProgressBar
              label="Attendance Safety Margin"
              value={attendanceMargin}
              max={Math.ceil(0.2 * totalSemesterClasses)}
              color={attendanceMargin > 0 ? '#10b981' : '#ef4444'}
              showPercentage={false}
            />
          </div>
        </div>

        {/* Courses Section */}
        <div id="courses" style={{scrollMarginTop: '80px', marginBottom: '48px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', letterSpacing: '-0.01em'}}>
            Your Courses
          </h2>
          <div style={{display: 'grid', gap: '16px'}}>
            {data.courses.map((course) => {
              const isFocused = focusedModuleId === course.moduleid;
              const attendancePercent = weightedAttendancePercent(course.present, course.late, course.totalsessions);

              return (
                <div
                  key={course.moduleid}
                  onClick={() => handleCourseClick(course.moduleid)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: isFocused ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isFocused) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFocused) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px', flexWrap: 'wrap'}}>
                    <div>
                      <h3 style={{fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px'}}>
                        {course.modulename}
                      </h3>
                      <div style={{fontSize: '13px', color: '#64748b'}}>
                        {course.moduleid} • Semester {course.semester} • {course.credits} credits
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      backgroundColor: attendancePercent >= 80 ? '#dcfce7' : attendancePercent >= 60 ? '#fed7aa' : '#fee2e2',
                      color: attendancePercent >= 80 ? '#166534' : attendancePercent >= 60 ? '#9a3412' : '#991b1b',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}>
                      {attendancePercent.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px'}}>
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600'}}>Held</div>
                      <div style={{fontSize: '24px', fontWeight: '700', color: '#0f172a'}}>{course.totalsessions}</div>
                    </div>
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600'}}>Present</div>
                      <div style={{fontSize: '24px', fontWeight: '700', color: '#10b981'}}>{course.present}</div>
                    </div>
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600'}}>Late</div>
                      <div style={{fontSize: '24px', fontWeight: '700', color: '#f59e0b'}}>{course.late}</div>
                    </div>
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600'}}>Absent</div>
                      <div style={{fontSize: '24px', fontWeight: '700', color: '#ef4444'}}>{course.totaleffectiveabsent}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Justifications Section */}
        <div id="justifications" style={{scrollMarginTop: '80px', marginBottom: '48px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', letterSpacing: '-0.01em'}}>
            Absence Justifications
          </h2>
          <JustificationForm studentId={studentId} />
        </div>

        {/* Events Section */}
        <div id="events" style={{scrollMarginTop: '80px'}}>
          <InformationPage studentId={studentId} apiBase={`/api/students/${studentId}`} showOnlyEvents />
        </div>
      </div>
    </div>
  );
}
