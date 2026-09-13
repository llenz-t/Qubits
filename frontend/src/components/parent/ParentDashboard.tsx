import { Users, ChartPie, BookOpen, CalendarDots, SignOut, CheckCircle, XCircle, Clock } from '@phosphor-icons/react';
import type { ParentDashboard as DashboardData } from '../../types/canonical';
import DonutChart from '../shared/DonutChart';
import MetricCard from '../shared/MetricCard';
import ProgressBar from '../shared/ProgressBar';
import InformationPage from '../shared/InformationPage';
import { weightedAttendancePercent } from '../../lib/constants';

/**
 * Read-only mirror of the student dashboard for a parent: same donut,
 * metrics, and per-course breakdown, but no justification form and no
 * course drill-down — parents get visibility, not the student's actions.
 */
interface ParentDashboardProps {
  data: DashboardData;
  onLogout: () => void;
}

export default function ParentDashboard({ data, onLogout }: ParentDashboardProps) {
  const overallAttendancePercent = weightedAttendancePercent(data.overall.totalPresent, data.overall.totalLate, data.overall.totalHeld);
  const donutData = [
    { name: 'Present', value: data.overall.totalPresent, color: '#10b981' },
    { name: 'Late', value: data.overall.totalLate, color: '#f59e0b' },
    { name: 'Absent', value: data.overall.totalAbsent, color: '#ef4444' }
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
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap'}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: '#8b5cf615',
              borderRadius: '12px',
              flexShrink: 0
            }}>
              <Users size={32} weight="duotone" color="#8b5cf6" />
            </div>
            <div style={{flex: 1}}>
              <h1 style={{fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em'}}>
                {data.parent.parentname}
              </h1>
              <p style={{fontSize: '15px', color: '#8b5cf6', fontWeight: '600', marginBottom: '12px'}}>
                {data.parent.relationtostudent} of {data.student.studentname}
              </p>
              <div style={{display: 'grid', gap: '8px', fontSize: '14px', color: '#64748b'}}>
                <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                  <span><strong style={{color: '#475569'}}>Student ID:</strong> {data.student.studentid}</span>
                  <span><strong style={{color: '#475569'}}>Year:</strong> {data.student.year}</span>
                  <span><strong style={{color: '#475569'}}>Section:</strong> {data.student.sectioncode}</span>
                </div>
                <div><strong style={{color: '#475569'}}>Programme:</strong> {data.student.programmename}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Messages */}
        <div style={{marginBottom: '32px'}}>
          <InformationPage studentId={data.student.studentid} apiBase={`/api/parents/${data.student.studentid}`} showOnlyMessages />
        </div>

        {/* Overview Section */}
        <div id="overview" style={{scrollMarginTop: '80px', marginBottom: '48px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', letterSpacing: '-0.01em'}}>
            Attendance Overview
          </h2>

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
                centerValue={`${overallAttendancePercent.toFixed(0)}%`}
                centerLabel="Attendance"
                size={220}
              />
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <MetricCard
                  label="Classes Held"
                  value={data.overall.totalHeld}
                  icon={<CalendarDots size={16} weight="fill" />}
                  color="#64748b"
                />
                <MetricCard
                  label="Present"
                  value={data.overall.totalPresent}
                  icon={<CheckCircle size={16} weight="fill" />}
                  color="#10b981"
                />
                <MetricCard
                  label="Late"
                  value={data.overall.totalLate}
                  icon={<Clock size={16} weight="fill" />}
                  color="#f59e0b"
                />
                <MetricCard
                  label="Absent"
                  value={data.overall.totalAbsent}
                  icon={<XCircle size={16} weight="fill" />}
                  color="#ef4444"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div id="courses" style={{scrollMarginTop: '80px', marginBottom: '48px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', letterSpacing: '-0.01em'}}>
            Course Performance
          </h2>
          <div style={{display: 'grid', gap: '16px'}}>
            {data.courses.map((course) => {
              const attendancePercent = weightedAttendancePercent(course.present, course.late, course.totalsessions);

              return (
                <div
                  key={course.moduleid}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px', flexWrap: 'wrap'}}>
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

                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px', marginBottom: '20px'}}>
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

                  {/* Individual Progress Bars for Each Course */}
                  <div style={{display: 'grid', gap: '12px'}}>
                    <ProgressBar
                      label="Present"
                      value={course.present}
                      max={course.totalsessions}
                      color="#10b981"
                      icon="present"
                    />
                    <ProgressBar
                      label="Late"
                      value={course.late}
                      max={course.totalsessions}
                      color="#f59e0b"
                      icon="late"
                    />
                    <ProgressBar
                      label="Absent"
                      value={course.totaleffectiveabsent}
                      max={course.totalsessions}
                      color="#ef4444"
                      icon="absent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Section */}
        <div id="events" style={{scrollMarginTop: '80px'}}>
          <InformationPage studentId={data.student.studentid} apiBase={`/api/parents/${data.student.studentid}`} showOnlyEvents />
        </div>
      </div>
    </div>
  );
}
