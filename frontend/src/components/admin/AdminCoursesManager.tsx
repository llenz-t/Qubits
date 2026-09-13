/**
 * Admin's "Courses" tab: an editable table of course offerings (credits,
 * semester, total classes/semester) plus a bulk-deduct modal for
 * knocking a fixed number of classes off many offerings at once
 * (e.g. after a college-wide holiday), optionally filtered by
 * programme/year.
 */
import { useState, useEffect, type ChangeEvent } from 'react';
import { getAdminCourses, updateCourse, bulkDeductClasses } from '../../lib/apiClient';
import type { Course } from '../../types/canonical';

interface AdminCoursesManagerProps {}

interface CourseWithMeta extends Course {
  offeringid: string;
  programmename: string;
  modulename: string;
}

export default function AdminCoursesManager() {
  const [courses, setCourses] = useState<CourseWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { credits: number; semester: string; totalclassespersemester: number }>>({});
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkDeduct, setBulkDeduct] = useState({ deductAmount: 1, programmename: '', year: '' });
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    console.log('showBulkModal changed:', showBulkModal);
  }, [showBulkModal]);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      const data = await getAdminCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  }

  // Seeds the row's draft edit from its current saved values so the
  // inline <select>/<input> controls have something to bind to.
  function handleEditStart(course: CourseWithMeta) {
    setEditingId(course.offeringid);
    setEdits(prev => ({
      ...prev,
      [course.offeringid]: {
        credits: course.credits,
        semester: course.semester,
        totalclassespersemester: course.totalclassespersemester
      }
    }));
  }

  async function handleSave(course: CourseWithMeta) {
    const edit = edits[course.offeringid];
    if (!edit) return;

    try {
      await updateCourse(course.offeringid, edit);
      setCourses(prev => prev.map(c =>
        c.offeringid === course.offeringid
          ? { ...c, credits: edit.credits, semester: edit.semester, totalclassespersemester: edit.totalclassespersemester }
          : c
      ));
      setEditingId(null);
      delete edits[course.offeringid];
    } catch (error) {
      alert('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  function handleCancel(course: CourseWithMeta) {
    setEditingId(null);
    delete edits[course.offeringid];
  }

  function handleChange(courseId: string, field: string, value: string | number) {
    setEdits(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], [field]: value }
    }));
  }

  // Sends the deduction to the backend, then mirrors the same filter
  // logic locally so the table reflects the change immediately instead
  // of waiting on a full reload.
  async function handleBulkDeduct() {
    if (bulkDeduct.deductAmount < 1) return;

    setBulkProcessing(true);
    try {
      console.log('Sending bulk deduct request:', bulkDeduct);
      const result = await bulkDeductClasses(bulkDeduct);
      console.log('Bulk deduct result:', result);

      // Update local state immediately
      setCourses(prev => prev.map(c => {
        const matches =
          (!bulkDeduct.programmename || c.programmename === bulkDeduct.programmename) &&
          (!bulkDeduct.year || String(c.year) === String(bulkDeduct.year));

        if (matches) {
          return {
            ...c,
            totalclassespersemester: Math.max(0, c.totalclassespersemester - bulkDeduct.deductAmount)
          };
        }
        return c;
      }));

      setShowBulkModal(false);
      setToastMessage(`Updated ${result.updated} modules`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setBulkDeduct({ deductAmount: 1, programmename: '', year: '' });
    } catch (error) {
      console.error('Bulk deduct error:', error);
      alert('Failed to bulk deduct: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setBulkProcessing(false);
    }
  }

  const uniqueProgrammes = Array.from(new Set(courses.map(c => c.programmename))).sort();

  return (
    <div style={{backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'}}>
      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'}}>
          <div>
            <h2 style={{fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem'}}>Course Management</h2>
            <p style={{fontSize: '0.875rem', color: '#64748b'}}>Edit credits, semester, or total classes per semester</p>
          </div>
          <button
            onClick={() => {
              console.log('Bulk Deduct button clicked!');
              setShowBulkModal(true);
            }}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          >
            Bulk Deduct Classes
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{padding: '3rem', textAlign: 'center', color: '#64748b'}}>Loading courses...</div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Programme</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Module</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Credits</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Semester</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Total Classes/Sem</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => {
                const isEditing = editingId === course.offeringid;
                const edit = edits[course.offeringid] || {
                  credits: course.credits,
                  semester: course.semester,
                  totalclassespersemester: course.totalclassespersemester
                };
                return (
                  <tr
                    key={course.offeringid}
                    style={{
                      borderBottom: index < courses.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: '#0f172a'}}>{course.programmename}</td>
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: '#0f172a', fontWeight: '500'}}>{course.modulename}</td>
                    <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                      {isEditing ? (
                        <select
                          value={edit.credits}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(course.offeringid, 'credits', Number(e.target.value))}
                          style={{
                            padding: '0.375rem 0.5rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        >
                          <option value={15}>15</option>
                          <option value={30}>30</option>
                        </select>
                      ) : (
                        <span style={{color: '#64748b', fontWeight: '600'}}>{course.credits}</span>
                      )}
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                      {isEditing ? (
                        <select
                          value={edit.semester}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(course.offeringid, 'semester', e.target.value)}
                          style={{
                            padding: '0.375rem 0.5rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                      ) : (
                        <span style={{color: '#64748b', fontWeight: '600'}}>{course.semester}</span>
                      )}
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={edit.totalclassespersemester}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(course.offeringid, 'totalclassespersemester', Number(e.target.value))}
                          min="1"
                          style={{
                            width: '5rem',
                            padding: '0.375rem 0.5rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <span style={{color: '#64748b', fontWeight: '600'}}>{course.totalclassespersemester}</span>
                      )}
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                      {isEditing ? (
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button
                            onClick={() => handleSave(course)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#059669',
                              color: 'white',
                              fontSize: '0.875rem',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleCancel(course)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#e5e7eb',
                              color: '#374151',
                              fontSize: '0.875rem',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditStart(course)}
                          style={{
                            color: '#059669',
                            fontSize: '0.875rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Deduct Modal */}
      {showBulkModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}>
          <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>Bulk Deduct Classes</h3>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem'}}>
                Number of Days/Classes to Deduct
              </label>
              <input
                type="number"
                min="1"
                value={bulkDeduct.deductAmount}
                onChange={(e) => setBulkDeduct(prev => ({ ...prev, deductAmount: Number(e.target.value) }))}
                style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem'}}
              />
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem'}}>
                Filter by Programme (optional)
              </label>
              <select
                value={bulkDeduct.programmename}
                onChange={(e) => setBulkDeduct(prev => ({ ...prev, programmename: e.target.value }))}
                style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem'}}
              >
                <option value="">All Programmes</option>
                {uniqueProgrammes.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem'}}>
                Filter by Year (optional)
              </label>
              <select
                value={bulkDeduct.year}
                onChange={(e) => setBulkDeduct(prev => ({ ...prev, year: e.target.value }))}
                style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem'}}
              >
                <option value="">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
              <button
                onClick={handleBulkDeduct}
                disabled={bulkProcessing || bulkDeduct.deductAmount < 1}
                style={{flex: 1, padding: '0.5rem 1rem', backgroundColor: bulkProcessing ? '#9ca3af' : '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: bulkProcessing ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500'}}
              >
                {bulkProcessing ? 'Processing...' : 'Apply Deduction'}
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkDeduct({ deductAmount: 1, programmename: '', semester: '' });
                }}
                disabled={bulkProcessing}
                style={{flex: 1, padding: '0.5rem 1rem', backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '8px', border: 'none', cursor: bulkProcessing ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}