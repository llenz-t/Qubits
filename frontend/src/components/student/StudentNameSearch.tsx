/**
 * Student "login": a debounced name search (no password) that lists
 * matching students and hands the chosen studentid up to
 * StudentPerspective. Stands in for real auth in this demo.
 */
import { useState, useEffect } from 'react';
import { GraduationCap } from '@phosphor-icons/react';
import { searchStudents } from '../../lib/apiClient';
import type { Student } from '../../types/canonical';

interface StudentNameSearchProps {
  onSelect: (studentId: string) => void;
}

export default function StudentNameSearch({ onSelect }: StudentNameSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    // 300ms debounce so we don't fire a request per keystroke; the
    // cleanup below cancels the pending search if the user keeps typing.
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchStudents(query);
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '42rem',
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '3rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{marginBottom: '2rem'}}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              backgroundColor: '#3b82f615',
              borderRadius: '0.75rem',
              fontSize: '1.5rem'
            }}>
              <GraduationCap size={24} weight="duotone" color="#3b82f6" />
            </div>
            <h2 style={{fontSize: '1.875rem', fontWeight: '700', color: '#0f172a'}}>
              Student Portal
            </h2>
          </div>
          <p style={{fontSize: '1rem', color: '#64748b', lineHeight: '1.6'}}>
            Search for your name to access your attendance records and submit justifications.
          </p>
        </div>

        <div style={{marginBottom: '1.5rem'}}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '0.5rem'
          }}>
            Student Name
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing your name..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
            autoFocus
          />
        </div>

        {loading && (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.9375rem'
          }}>
            Searching...
          </div>
        )}

        {results.length > 0 && (
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}>
            {results.map((student, index) => (
              <button
                key={student.studentid}
                onClick={() => onSelect(student.studentid)}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  textAlign: 'left',
                  backgroundColor: 'white',
                  border: 'none',
                  borderTop: index > 0 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  display: 'block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{
                  fontWeight: '600',
                  fontSize: '1rem',
                  color: '#0f172a',
                  marginBottom: '0.25rem'
                }}>
                  {student.studentname}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}>
                  {student.sectioncode} • {student.programmename} • Year {student.year}
                </div>
              </button>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.9375rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem'
          }}>
            No students found. Try a different name.
          </div>
        )}
      </div>
    </div>
  );
}