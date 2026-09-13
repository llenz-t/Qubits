/**
 * Admin console shell: a single-page tab switcher (no routing) between
 * the five admin tools. The info card above the tab content re-labels
 * itself per active tab via TAB_HEADER instead of a generic page title.
 */
import { useState } from 'react';
import { UsersFour, BookOpen, FileText, Fire, Info, ShieldCheck } from '@phosphor-icons/react';
import AdminStudentsTable from '../components/admin/AdminStudentsTable';
import AdminCoursesManager from '../components/admin/AdminCoursesManager';
import AdminJustificationReview from '../components/admin/AdminJustificationReview';
import AdminAbsencePool from '../components/admin/AdminAbsencePool';
import InformationPage from '../components/shared/InformationPage';

type Tab = 'students' | 'courses' | 'justifications' | 'absence-pool' | 'information';

// Per-tab copy for the header card — keeps the title/subtitle honest
// about which tool is currently showing instead of one static label.
const TAB_HEADER: Record<Tab, { title: string; subtitle: string }> = {
  students: {
    title: 'Students Info',
    subtitle: 'Roster, attendance, and academic standing across all sections'
  },
  courses: {
    title: 'Courses',
    subtitle: 'Manage module schedules, credits, and semester class counts'
  },
  justifications: {
    title: 'Justifications',
    subtitle: 'Review and approve absence justification submissions'
  },
  'absence-pool': {
    title: 'Just Absent Students',
    subtitle: 'Students flagged by the automation engine — review and notify in one pass'
  },
  information: {
    title: 'Information',
    subtitle: 'Publish events and important messages to students and parents'
  }
};

export default function AdminPerspective() {
  const [activeTab, setActiveTab] = useState<Tab>('students');

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
      {/* Top Navigation */}
      <div style={{backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10}}>
        <div style={{maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.25rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap'}}>
            <div style={{display: 'flex', gap: '1.5rem'}}>
              <button
                onClick={() => setActiveTab('students')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: activeTab === 'students' ? '#059669' : '#64748b',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'students') e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'students') e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <UsersFour size={18} weight="regular" />
                <span>Students</span>
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: activeTab === 'courses' ? '#059669' : '#64748b',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'courses') e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'courses') e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <BookOpen size={18} weight="regular" />
                <span>Courses</span>
              </button>
              <button
                onClick={() => setActiveTab('justifications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: activeTab === 'justifications' ? '#059669' : '#64748b',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'justifications') e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'justifications') e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FileText size={18} weight="regular" />
                <span>Justifications</span>
              </button>
              <button
                onClick={() => setActiveTab('absence-pool')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: activeTab === 'absence-pool' ? '#059669' : '#64748b',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'absence-pool') e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'absence-pool') e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Fire size={18} weight="regular" />
                <span>Absence Pool</span>
              </button>
              <button
                onClick={() => setActiveTab('information')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: activeTab === 'information' ? '#059669' : '#64748b',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'information') e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'information') e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Info size={18} weight="regular" />
                <span>Information</span>
              </button>
            </div>
            <a
              href="/"
              style={{
                padding: '0.5rem 1rem',
                color: '#64748b',
                backgroundColor: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
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
              Switch Portal
            </a>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.25rem'}}>
        {/* Admin Info Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap'}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              backgroundColor: '#05966915',
              borderRadius: '1rem',
              fontSize: '2rem',
              flexShrink: 0
            }}>
              <ShieldCheck size={32} weight="duotone" color="#059669" />
            </div>
            <div style={{flex: 1}}>
              <p style={{fontSize: '0.875rem', color: '#64748b', fontWeight: '500', marginBottom: '0.5rem'}}>
                Admin portal
              </p>
              <h1 style={{fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem'}}>
                {TAB_HEADER[activeTab].title}
              </h1>
              <p style={{fontSize: '0.9375rem', color: '#64748b'}}>
                {TAB_HEADER[activeTab].subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'students' && <AdminStudentsTable />}
        {activeTab === 'courses' && <AdminCoursesManager />}
        {activeTab === 'justifications' && <AdminJustificationReview />}
        {activeTab === 'absence-pool' && <AdminAbsencePool />}
        {activeTab === 'information' && <InformationPage isAdmin apiBase="/api/admin" />}
      </div>
    </div>
  );
}