/**
 * Student portal's tiny two-step flow: search-and-pick a name (there is
 * no password — this is a hackathon demo), then show that student's
 * dashboard. `studentId` being set is what "logged in" means here.
 */
import { useState } from 'react';
import StudentNameSearch from '../components/student/StudentNameSearch';
import StudentDashboard from '../components/student/StudentDashboard';

export default function StudentPerspective() {
  const [studentId, setStudentId] = useState<string | null>(null);

  if (studentId) {
    return <StudentDashboard studentId={studentId} onLogout={() => setStudentId(null)} />;
  }

  return <StudentNameSearch onSelect={setStudentId} />;
}