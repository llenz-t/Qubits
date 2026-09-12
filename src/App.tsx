import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [activeStudentId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('attendease_logged_in_student_id') ||
        'student-user-ai25'
      );
    }
    return 'student-user-ai25';
  });

  return <Dashboard initialStudentId={activeStudentId} />;
}
