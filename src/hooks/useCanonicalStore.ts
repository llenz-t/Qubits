import { useState, useEffect } from 'react';
import { CanonicalStoreService } from '../data/canonicalStore';
import {
  CanonicalStudent,
  Role,
  AttendanceStatus,
  SupportCase,
  Appointment,
  CollegeNotice,
  PlatformNotification,
  AttendancePolicy,
} from '../types/canonical';

export function useCanonicalStore(role: Role = 'STUDENT', activeStudentId?: string) {
  const store = CanonicalStoreService.getInstance();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, [store]);

  const students = store.getStudents();
  const notices = store.getNotices();
  const notifications = store.getNotifications(role, activeStudentId);
  const policy = store.getPolicy();
  const currentStudent = activeStudentId
    ? store.getStudentById(activeStudentId) || students[0]
    : students[0];

  return {
    store,
    students,
    currentStudent,
    notices,
    notifications,
    policy,
    correctAttendance: (
      studentId: string,
      sessionId: string,
      newStatus: AttendanceStatus,
      reason: string,
      actorName?: string
    ) => store.correctAttendance(studentId, sessionId, newStatus, reason, actorName, role),
    addSupportCaseMessage: (
      caseId: string,
      messageText: string,
      senderName: string,
      isInternalStaffOnly = false
    ) => store.addSupportCaseMessage(caseId, messageText, senderName, role, isInternalStaffOnly),
    updateCaseStatus: (
      caseId: string,
      newStatus: SupportCase['status'],
      internalStaffNotes?: string
    ) => store.updateCaseStatus(caseId, newStatus, internalStaffNotes),
    createSupportCase: (
      studentId: string,
      category: SupportCase['category'],
      subject: string,
      description: string,
      priority?: SupportCase['priority'],
      relatedSessionId?: string
    ) => store.createSupportCase(studentId, category, subject, description, priority, relatedSessionId),
    scheduleAppointment: (
      studentId: string,
      appointmentType: Appointment['appointmentType'],
      date: string,
      timeSlot: string,
      staffMember: string,
      location: string,
      notes?: string
    ) => store.scheduleAppointment(studentId, appointmentType, date, timeSlot, staffMember, location, notes),
    createNotice: (
      title: string,
      category: CollegeNotice['category'],
      summary: string,
      content: string,
      targetAudience?: CollegeNotice['targetAudience'],
      priority?: CollegeNotice['priority']
    ) => store.createNotice(title, category, summary, content, targetAudience, priority),
    markNotificationAsRead: (id: string) => store.markNotificationAsRead(id),
    updatePolicy: (p: Partial<AttendancePolicy>) => store.updatePolicy(p),
    resetToDefaults: () => store.resetToDefaults(),
  };
}
