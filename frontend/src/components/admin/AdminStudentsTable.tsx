/**
 * Admin's "Students Info" tab: a filterable, sortable roster of every
 * student with their overall attendance %. Programme/section filter
 * options are derived from the first unfiltered load, not hardcoded.
 */
import { useState, useEffect, type ChangeEvent } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { getAdminStudents } from '../../lib/apiClient';
import type { Student } from '../../types/canonical';
import { getAttendanceStatus } from '../../lib/constants';
import StatusBadge from '../shared/StatusBadge';

interface StudentWithAttendance extends Student {
  overall: {
    totalHeld: number;
    totalPresent: number;
    attendancePercent: number;
  };
}

export default function AdminStudentsTable() {
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    programmename: '',
    year: '',
    section: '',
    search: ''
  });
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  useEffect(() => {
    loadStudents();
  }, [filters]);

  async function loadStudents() {
    setLoading(true);
    try {
      const data = await getAdminStudents(filters);
      setStudents(data);
      // Only (re)build the filter dropdown options from a fully-unfiltered
      // load, so picking one filter doesn't shrink the others' choices.
      if (filters.search === '' && filters.programmename === '' && filters.year === '' && filters.section === '') {
        const progSet = new Set<string>();
        const secSet = new Set<string>();
        data.forEach(s => {
          if (s.programmename) progSet.add(s.programmename);
          if (s.sectioncode) secSet.add(s.sectioncode);
        });
        setProgrammes(Array.from(progSet).sort());
        setSections(Array.from(secSet).sort());
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div style={{backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'}}>
      {/* Filters Card */}
      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0'}}>
        <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem'}}>
          Filter Students
        </h3>
        <div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
          <div>
            <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem'}}>
              Programme
            </label>
            <select
              value={filters.programmename}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('programmename', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">All Programmes</option>
              {programmes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem'}}>
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('year', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem'}}>
              Section
            </label>
            <select
              value={filters.section}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('section', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem'}}>
              Search Name
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{padding: '3rem', textAlign: 'center', color: '#64748b'}}>Loading students...</div>
      ) : students.length === 0 ? (
        <div style={{padding: '3rem', textAlign: 'center'}}>
          <MagnifyingGlass size={40} weight="light" color="#cbd5e1" style={{marginBottom: '1rem'}} />
          <p style={{color: '#64748b', fontSize: '0.9375rem'}}>No students found with current filters</p>
        </div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  College ID
                </th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Student Name
                </th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Section
                </th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Year
                </th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Present / Held
                </th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Attendance
                </th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const status = getAttendanceStatus(student.overall.attendancePercent);
                return (
                  <tr
                    key={student.studentid}
                    style={{
                      borderBottom: index < students.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: '#0f172a', fontWeight: '600'}}>
                      {student.studentid}
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: '#0f172a', fontWeight: '500'}}>
                      {student.studentname}
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        borderRadius: '0.375rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af'
                      }}>
                        {student.sectioncode}
                      </span>
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: '500'}}>
                      Year {student.year}
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: '600'}}>
                      <span style={{color: '#059669'}}>{student.overall.totalPresent}</span>
                      {' / '}
                      <span style={{color: '#64748b'}}>{student.overall.totalHeld}</span>
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <span style={{fontWeight: '700', color: '#0f172a', minWidth: '3.5rem'}}>
                          {student.overall.attendancePercent.toFixed(1)}%
                        </span>
                        <div style={{
                          flex: 1,
                          maxWidth: '8rem',
                          height: '0.5rem',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '999px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: '100%',
                            transform: `scaleX(${Math.min(student.overall.attendancePercent, 100) / 100})`,
                            transformOrigin: 'left',
                            backgroundColor: status === 'Good' ? '#10b981' : '#f59e0b',
                            borderRadius: '999px',
                            transition: 'transform 0.3s ease'
                          }} />
                        </div>
                      </div>
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}