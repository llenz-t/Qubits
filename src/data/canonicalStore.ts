/**
 * Canonical Data Store & State Management
 * 
 * Provides the single source of truth for the entire Islington College Student Services Platform.
 * Changes made in Admin (e.g. attendance correction, case status change, internal note)
 * instantly reflect in Student and Parent perspectives according to role permissions.
 */

import {
  CanonicalStudent,
  Role,
  AttendanceStatus,
  SupportCase,
  Appointment,
  CollegeNotice,
  PlatformNotification,
  AttendancePolicy,
  PlagiarismReport,
} from '../types/canonical';
import { DEFAULT_ISLINGTON_POLICY, calculateStudentAttendanceMetrics } from '../utils/canonicalAttendanceEngine';
import { bandFromMetrics, buildAttendanceBandAlerts } from '../utils/attendanceBands';

export const INITIAL_NOTICES: CollegeNotice[] = [
  {
    id: 'notice-1',
    title: 'Mandatory 80% Attendance Threshold for Autumn 2026 Exam Board Clearance',
    category: 'SSD Urgent Notice',
    summary: 'Students below 80% cumulative module attendance will be debarred from first-sit examination papers.',
    content: 'Pursuant to Islington College and London Metropolitan University academic regulations, all students must maintain at least 80.0% eligible attendance across Lectures, Tutorials, and Workshops to be eligible for end-of-semester examination clearance. Medical appeals must be submitted to the Student Services Department with valid hospital documentation within 5 working days of absence.',
    targetAudience: 'ALL',
    publishedAt: '2026-09-08T09:00:00Z',
    author: 'Student Services Department (SSD)',
    isPinned: true,
    priority: 'CRITICAL',
  },
  {
    id: 'notice-2',
    title: 'AAA Scholarship (Academics, Attitude, Attendance) Call for Applications',
    category: 'Academic Milestone',
    summary: 'Students holding >= 95% attendance with first-class grades are invited to submit scholarship dossiers.',
    content: 'The Annual Islington College AAA Scholarship recognizes exemplary performance across Academics, Professional Attitude, and Attendance. Qualifying students (>=95% attendance and no disciplinary or referral marks) may review their portal eligibility and submit academic statements before September 30, 2026.',
    targetAudience: 'STUDENTS',
    publishedAt: '2026-09-10T11:30:00Z',
    author: 'Academic Directorate & SSD',
    isPinned: true,
    priority: 'URGENT',
  },
  {
    id: 'notice-3',
    title: 'Parent-Teacher Academic Progress Review Meetings - Autumn Term',
    category: 'Exam Board',
    summary: 'Guardian consultations scheduled for September 24-26 at Kamal Pokhari Campus or via Microsoft Teams.',
    content: 'Parents and guardians are invited to book individual 15-minute consultations with module leaders and Student Services counselors to discuss attendance trends and coursework progressions. Appointments can be scheduled directly via the Parent Portal.',
    targetAudience: 'PARENTS',
    publishedAt: '2026-09-11T14:00:00Z',
    author: 'Academic Operations Office',
    isPinned: false,
    priority: 'NORMAL',
  },
];

export const INITIAL_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'ADMIN',
    type: 'ATTENDANCE_WARNING',
    title: 'Critical Attendance Alert: Rohan Maharjan (69.5%)',
    body: 'Student attendance is 10.5% below the mandatory 80% exam eligibility reference.',
    timestamp: '2026-09-12T08:30:00Z',
    isRead: false,
    linkAction: 'student-rohan',
  },
  {
    id: 'notif-2',
    targetRole: 'ADMIN',
    type: 'CASE_UPDATE',
    title: 'New Medical Absence Appeal: Priya Thapa',
    body: 'Medical waiver ticket #SSD-2026-089 submitted with hospital certificate.',
    timestamp: '2026-09-12T07:15:00Z',
    isRead: false,
    linkAction: 'case-ssd-089',
  },
  {
    id: 'notif-3',
    targetRole: 'STUDENT',
    studentId: 'student-2', // Priya
    type: 'ATTENDANCE_WARNING',
    title: 'Attendance Policy Warning: Module CS5002NI',
    body: 'Your Software Engineering attendance is 76.8% (below 80% threshold). Please attend next 4 sessions to recover.',
    timestamp: '2026-09-11T16:00:00Z',
    isRead: false,
  },
  {
    id: 'notif-4',
    targetRole: 'PARENT',
    studentId: 'student-2', // Priya's guardian
    type: 'ATTENDANCE_WARNING',
    title: 'Academic Notice: Attendance Below Required Threshold',
    body: 'Priya Thapa currently holds 76.8% attendance. SSD consultation available.',
    timestamp: '2026-09-11T16:05:00Z',
    isRead: false,
  },
];

export const INITIAL_STUDENTS: CanonicalStudent[] = [
  // 0. Islington Student (User Account: NP01AI4A250009)
  {
    id: 'student-user-ai25',
    rollNumber: 'NP01AI4A250009',
    fullName: 'Islington AI Scholar',
    email: 'np01ai4a250009@islingtoncollege.edu.np',
    phone: '+977-9841239876',
    degreeName: 'BSc (Hons) Computing with Artificial Intelligence',
    award: 'Awarded by London Metropolitan University',
    year: 'Year 2',
    academicPeriod: 'Autumn Term 2026',
    academicStanding: 'GOOD_STANDING',
    gpa: 3.91,
    guardianName: 'Guardian Sharma',
    guardianRelation: 'Parent',
    guardianPhone: '+977-9801122334',
    guardianEmail: 'guardian.ai25@gmail.com',
    modules: [
      {
        id: 'AI5001',
        code: 'AI5001',
        name: 'Object Oriented Programming & Design Patterns',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Er. Prashant Shrestha',
        totalConducted: 24,
        attendedSessions: 23,
        missedSessions: 1,
        lectureRate: 96,
        tutorialRate: 95,
        workshopRate: 96,
        currentMark: 88,
        currentGrade: 'First Class (Distinction)',
        assessments: [
          {
            id: 'ass-user-ai-1',
            moduleId: 'AI5001',
            title: 'Design Patterns Implementation & UML Portfolio',
            type: 'Coursework',
            weightPercentage: 50,
            dueDate: '2026-09-28',
            status: 'SUBMITTED',
            score: 92,
            maxScore: 100,
            grade: 'First Class',
            feedback: 'Exceptional application of Factory and Observer patterns in Java.',
          },
        ],
      },
      {
        id: 'AI5002',
        code: 'AI5002',
        name: 'Machine Learning Foundations & Neural Networks',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Dr. Bishnu Pandey',
        totalConducted: 24,
        attendedSessions: 23,
        missedSessions: 1,
        lectureRate: 95,
        tutorialRate: 96,
        workshopRate: 95,
        currentMark: 89,
        currentGrade: 'First Class (Distinction)',
        assessments: [],
      },
      {
        id: 'AI5003',
        code: 'AI5003',
        name: 'Data Structures and Algorithms in AI',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Er. Subash Pokharel',
        totalConducted: 24,
        attendedSessions: 23,
        missedSessions: 1,
        lectureRate: 95,
        tutorialRate: 96,
        workshopRate: 96,
        currentMark: 87,
        currentGrade: 'First Class (Distinction)',
        assessments: [],
      },
    ],
    scheduledSessions: [
      {
        id: 'sess-ai25-101',
        moduleId: 'AI5001',
        moduleCode: 'AI5001',
        moduleName: 'Object Oriented Programming',
        sessionType: 'Lecture',
        date: '2026-09-11',
        startTime: '08:00',
        endTime: '10:00',
        location: 'Block C - LT1',
        lecturer: 'Er. Prashant Shrestha',
      },
      {
        id: 'sess-ai25-102',
        moduleId: 'AI5001',
        moduleCode: 'AI5001',
        moduleName: 'Object Oriented Programming',
        sessionType: 'Workshop',
        date: '2026-09-11',
        startTime: '10:30',
        endTime: '12:30',
        location: 'Lab 402',
        lecturer: 'Er. Prashant Shrestha',
      },
      {
        id: 'sess-ai25-103',
        moduleId: 'AI5002',
        moduleCode: 'AI5002',
        moduleName: 'Machine Learning Foundations & Neural Networks',
        sessionType: 'Lecture',
        date: '2026-09-12',
        startTime: '09:00',
        endTime: '11:00',
        location: 'Block A - Room 204',
        lecturer: 'Dr. Bishnu Pandey',
      },
      {
        id: 'sess-ai25-104',
        moduleId: 'AI5002',
        moduleCode: 'AI5002',
        moduleName: 'Machine Learning Foundations & Neural Networks',
        sessionType: 'Tutorial',
        date: '2026-09-13',
        startTime: '13:00',
        endTime: '15:00',
        location: 'Block B - Room 301',
        lecturer: 'Dr. Bishnu Pandey',
      },
    ],
    attendanceRecords: {
      'sess-ai25-101': {
        id: 'att-ai25-101',
        studentId: 'student-user-ai25',
        sessionId: 'sess-ai25-101',
        status: 'PRESENT',
        markedAt: '2026-09-11T08:02:14Z',
        markedBy: 'Biometric RFID Scanner - C1',
        source: 'BIOMETRIC_SCANNER',
      },
      'sess-ai25-102': {
        id: 'att-ai25-102',
        studentId: 'student-user-ai25',
        sessionId: 'sess-ai25-102',
        status: 'PRESENT',
        markedAt: '2026-09-11T10:31:00Z',
        markedBy: 'Er. Prashant Shrestha',
        source: 'LECTURER_PORTAL',
      },
      'sess-ai25-103': {
        id: 'att-ai25-103',
        studentId: 'student-user-ai25',
        sessionId: 'sess-ai25-103',
        status: 'PRESENT',
        markedAt: '2026-09-12T09:05:00Z',
        markedBy: 'Biometric RFID Scanner - A2',
        source: 'BIOMETRIC_SCANNER',
      },
      'sess-ai25-104': {
        id: 'att-ai25-104',
        studentId: 'student-user-ai25',
        sessionId: 'sess-ai25-104',
        status: 'PENDING',
        markedAt: '',
        markedBy: '',
        source: 'LECTURER_PORTAL',
      },
    },
    supportCases: [],
    appointments: [],
  },
  // 1. Aarav Sharma - Exemplary, AAA Contender
  {
    id: 'student-1',
    rollNumber: 'NP03CS4S24014',
    fullName: 'Aarav Sharma',
    email: 'np03cs4s24014@islingtoncollege.edu.np',
    phone: '+977-9841234567',
    degreeName: 'BSc (Hons) Computing with Artificial Intelligence',
    award: 'Awarded by London Metropolitan University',
    year: 'Year 2',
    academicPeriod: 'Autumn Term 2026',
    academicStanding: 'GOOD_STANDING',
    gpa: 3.88,
    guardianName: 'Ramesh Sharma',
    guardianRelation: 'Father',
    guardianPhone: '+977-9801239876',
    guardianEmail: 'ramesh.sharma@gmail.com',
    modules: [
      {
        id: 'AI5001',
        code: 'AI5001',
        name: 'Object Oriented Programming & Design Patterns',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Er. Prashant Shrestha',
        totalConducted: 24,
        attendedSessions: 23,
        missedSessions: 1,
        lectureRate: 96,
        tutorialRate: 95,
        workshopRate: 96,
        currentMark: 84,
        currentGrade: 'First Class (Distinction)',
        assessments: [
          {
            id: 'ass-ai5001-1',
            moduleId: 'AI5001',
            title: 'Design Patterns Implementation & UML Portfolio',
            type: 'Coursework',
            weightPercentage: 50,
            dueDate: '2026-09-28',
            status: 'SUBMITTED',
            score: 86,
            maxScore: 100,
            grade: 'First Class',
            feedback: 'Exceptional application of Factory and Observer patterns in Java.',
          },
          {
            id: 'ass-ai5001-2',
            moduleId: 'AI5001',
            title: 'Final Software Architecture Examination',
            type: 'Examination',
            weightPercentage: 50,
            dueDate: '2026-11-15',
            status: 'UPCOMING',
            maxScore: 100,
          },
        ],
      },
      {
        id: 'AI5002',
        code: 'AI5002',
        name: 'Machine Learning Foundations & Neural Networks',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Dr. Bishnu Pandey',
        totalConducted: 24,
        attendedSessions: 23,
        missedSessions: 1,
        lectureRate: 95,
        tutorialRate: 96,
        workshopRate: 95,
        currentMark: 88,
        currentGrade: 'First Class (Distinction)',
        assessments: [
          {
            id: 'ass-ai5002-1',
            moduleId: 'AI5002',
            title: 'Supervised Learning Classification Pipeline in Python',
            type: 'Project',
            weightPercentage: 60,
            dueDate: '2026-10-10',
            status: 'UPCOMING',
            maxScore: 100,
          },
        ],
      },
      {
        id: 'AI5003',
        code: 'AI5003',
        name: 'Data Structures and Algorithms in AI',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Prof. Anil Maharjan',
        totalConducted: 24,
        attendedSessions: 22,
        missedSessions: 2,
        lectureRate: 92,
        tutorialRate: 91,
        workshopRate: 93,
        currentMark: 81,
        currentGrade: 'First Class',
        assessments: [
          {
            id: 'ass-ai5003-1',
            moduleId: 'AI5003',
            title: 'Graph Search & Heuristic Optimization Lab Test',
            type: 'In-Class Test',
            weightPercentage: 40,
            dueDate: '2026-09-18',
            status: 'UPCOMING',
            maxScore: 100,
          },
        ],
      },
    ],
    scheduledSessions: [
      {
        id: 'sess-101',
        moduleId: 'AI5001',
        moduleCode: 'AI5001',
        moduleName: 'Object Oriented Programming',
        sessionType: 'Lecture',
        date: '2026-09-11',
        startTime: '08:00',
        endTime: '10:00',
        location: 'Block C - LT1',
        lecturer: 'Er. Prashant Shrestha',
      },
      {
        id: 'sess-102',
        moduleId: 'AI5001',
        moduleCode: 'AI5001',
        moduleName: 'Object Oriented Programming',
        sessionType: 'Workshop',
        date: '2026-09-11',
        startTime: '10:30',
        endTime: '12:30',
        location: 'Lab 402',
        lecturer: 'Er. Prashant Shrestha',
      },
      {
        id: 'sess-103',
        moduleId: 'AI5002',
        moduleCode: 'AI5002',
        moduleName: 'Machine Learning Foundations',
        sessionType: 'Lecture',
        date: '2026-09-12',
        startTime: '09:00',
        endTime: '11:00',
        location: 'Block A - Room 204',
        lecturer: 'Dr. Bishnu Pandey',
      },
      {
        id: 'sess-104',
        moduleId: 'AI5002',
        moduleCode: 'AI5002',
        moduleName: 'Machine Learning Foundations',
        sessionType: 'Tutorial',
        date: '2026-09-13',
        startTime: '13:00',
        endTime: '15:00',
        location: 'Block B - Room 301',
        lecturer: 'Dr. Bishnu Pandey',
      },
      {
        id: 'sess-105',
        moduleId: 'AI5003',
        moduleCode: 'AI5003',
        moduleName: 'Data Structures and Algorithms',
        sessionType: 'Workshop',
        date: '2026-09-14',
        startTime: '08:00',
        endTime: '11:00',
        location: 'Lab 501',
        lecturer: 'Prof. Anil Maharjan',
      },
    ],
    attendanceRecords: {
      'sess-101': {
        id: 'att-101',
        studentId: 'student-1',
        sessionId: 'sess-101',
        status: 'PRESENT',
        markedAt: '2026-09-11T08:02:14Z',
        markedBy: 'Biometric RFID Scanner - C1',
        source: 'BIOMETRIC_SCANNER',
      },
      'sess-102': {
        id: 'att-102',
        studentId: 'student-1',
        sessionId: 'sess-102',
        status: 'PRESENT',
        markedAt: '2026-09-11T10:31:00Z',
        markedBy: 'Er. Prashant Shrestha',
        source: 'LECTURER_PORTAL',
      },
      'sess-103': {
        id: 'att-103',
        studentId: 'student-1',
        sessionId: 'sess-103',
        status: 'PRESENT',
        markedAt: '2026-09-12T09:05:00Z',
        markedBy: 'Biometric RFID Scanner - A2',
        source: 'BIOMETRIC_SCANNER',
      },
      'sess-104': {
        id: 'att-104',
        studentId: 'student-1',
        sessionId: 'sess-104',
        status: 'PENDING',
        markedAt: '',
        markedBy: '',
        source: 'LECTURER_PORTAL',
      },
      'sess-105': {
        id: 'att-105',
        studentId: 'student-1',
        sessionId: 'sess-105',
        status: 'PENDING',
        markedAt: '',
        markedBy: '',
        source: 'LECTURER_PORTAL',
      },
    },
    supportCases: [
      {
        id: 'case-1',
        ticketNumber: 'SSD-2026-042',
        studentId: 'student-1',
        studentName: 'Aarav Sharma',
        studentRoll: 'NP03CS4S24014',
        category: 'Academic Advisory & Extenuating Circumstances',
        subject: 'AAA Scholarship Preliminary Portfolio Submission',
        description: 'Submitting extracurricular AI project leadership records and attendance confirmation for AAA scholarship review.',
        status: 'RESOLVED',
        priority: 'NORMAL',
        assignedStaff: 'Kripa Sharma (Senior SSD Officer)',
        createdAt: '2026-09-02T10:00:00Z',
        updatedAt: '2026-09-04T15:30:00Z',
        internalStaffNotes: 'Candidate verified. Attendance is 93.3%, academic GPA is 3.88. Highly recommended for Academic Board shortlist.',
        messages: [
          {
            id: 'msg-1',
            senderId: 'student-1',
            senderName: 'Aarav Sharma',
            senderRole: 'STUDENT',
            message: 'Hello SSD Team, I have compiled my portfolio and attendance records for the AAA Scholarship.',
            timestamp: '2026-09-02T10:00:00Z',
          },
          {
            id: 'msg-2',
            senderId: 'staff-1',
            senderName: 'Kripa Sharma (SSD)',
            senderRole: 'ADMIN',
            message: 'Dear Aarav, your file has been reviewed and verified. You satisfy the >=95% requirement on individual core modules. Dossier forwarded.',
            timestamp: '2026-09-04T15:30:00Z',
          },
        ],
      },
    ],
    appointments: [
      {
        id: 'apt-1',
        studentId: 'student-1',
        studentName: 'Aarav Sharma',
        studentRoll: 'NP03CS4S24014',
        appointmentType: 'Academic Advisory',
        date: '2026-09-18',
        timeSlot: '11:00 AM - 11:30 AM',
        staffMember: 'Kripa Sharma',
        location: 'Student Services Dept - Office 104',
        status: 'CONFIRMED',
        notes: 'Final review of AAA scholarship portfolio.',
      },
    ],
    plagiarismReports: [
      {
        id: 'plag-ai5002-1',
        assessmentId: 'ass-ai5002-1',
        assessmentTitle: 'Supervised Learning Classification Pipeline in Python',
        moduleCode: 'AI5002',
        moduleName: 'Machine Learning Foundations & Neural Networks',
        submittedAt: '2026-09-07T18:45:00Z',
        turnitinSimilarityScore: 48,
        aiGeneratedScore: 35,
        allowedThreshold: 15,
        status: 'FAILED_PLAGIARISM',
        penaltyVerdict: 'Awarded 0% (Fail) - Referred to Academic Misconduct Board under London Met Regulation 16',
        investigationDate: '2026-09-10',
        panelChair: 'Dr. Bishnu Pandey (Chair, Academic Misconduct Panel)',
        digitalReceiptId: 'TURNITIN-LMU-2026-889142',
        appealDeadline: '2026-09-22',
        canAppeal: true,
        matchedSources: [
          {
            id: 'src-1',
            sourceTitle: 'github.com/scikit-learn-projects/fraud-classifier.py',
            sourceType: 'GitHub Repository',
            similarityPercentage: 28,
            urlOrCitation: 'https://github.com/scikit-learn-projects/fraud-classifier/blob/main/pipeline.py',
            matchedExcerptSnippet: 'def fit_evaluate_ensemble(X_train, y_train, X_test, y_test):\n    rf = RandomForestClassifier(n_estimators=200, max_depth=12, random_state=42)\n    rf.fit(X_train, y_train)\n    return precision_recall_fscore_support(y_test, rf.predict(X_test))',
            studentOriginalSnippet: 'def fit_evaluate_ensemble(X_train, y_train, X_test, y_test):\n    rf = RandomForestClassifier(n_estimators=200, max_depth=12, random_state=42)\n    rf.fit(X_train, y_train)\n    return precision_recall_fscore_support(y_test, rf.predict(X_test))',
          },
          {
            id: 'src-2',
            sourceTitle: 'Islington College Student Paper (Autumn 2025 Cohort #LM-7712)',
            sourceType: 'Student Paper',
            similarityPercentage: 12,
            urlOrCitation: 'London Met Student Repository - Submission #LM-7712-AI',
            matchedExcerptSnippet: 'The hyperparameter optimization grid search explores learning rates from 0.001 to 0.1 across 5-fold stratified cross validation.',
            studentOriginalSnippet: 'The hyperparameter optimization grid search explores learning rates from 0.001 to 0.1 across 5-fold stratified cross validation.',
          },
          {
            id: 'src-3',
            sourceTitle: 'Synthesized LLM Code Generation (Turnitin AI Writing Detector)',
            sourceType: 'AI / LLM Model',
            similarityPercentage: 8,
            urlOrCitation: 'Detected by Turnitin AI Writing Detector v2.4 (Confidence 98%)',
            matchedExcerptSnippet: '# Auto-generated boilerplate neural architecture with PyTorch Lightning\nclass DeepClassifier(pl.LightningModule): ...',
            studentOriginalSnippet: '# Custom neural network implementation\nclass DeepClassifier(pl.LightningModule): ...',
          },
        ],
        guardianNotifications: [
          {
            id: 'gn-sms-1',
            channel: 'SMS',
            recipient: '+977-9801239876 (Father - Ramesh Sharma)',
            dispatchedAt: '2026-09-08 10:14 AM NPT',
            deliveredAt: '2026-09-08 10:14:18 AM NPT',
            status: 'DELIVERED',
            subject: 'SSD Turnitin Alert',
            messagePreview: 'Islington College Alert: Coursework submission for Aarav Sharma (NP03CS4S24014) in AI5002 flagged high Turnitin similarity (48%). Investigation opened under London Met Reg 16. See Parent Portal.',
            carrierMessageId: 'NTC-SMS-980123-09081',
          },
          {
            id: 'gn-email-1',
            channel: 'EMAIL',
            recipient: 'ramesh.sharma@gmail.com',
            dispatchedAt: '2026-09-08 10:18 AM NPT',
            deliveredAt: '2026-09-08 10:18:04 AM NPT',
            status: 'READ',
            subject: 'Formal Notice: London Met Academic Integrity Review for Aarav Sharma (AI5002)',
            messagePreview: 'Dear Parent/Guardian, This is an official notice that your ward\'s coursework in Machine Learning Foundations (AI5002) has exceeded the 15% similarity limit. An Academic Misconduct Inquiry has been scheduled.',
            carrierMessageId: 'SENDGRID-MSG-LMU-2026-90412',
          },
          {
            id: 'gn-sms-2',
            channel: 'SMS',
            recipient: '+977-9801239876 (Father - Ramesh Sharma)',
            dispatchedAt: '2026-09-10 03:30 PM NPT',
            deliveredAt: '2026-09-10 03:30:22 PM NPT',
            status: 'DELIVERED',
            subject: 'Academic Board Decision',
            messagePreview: 'Islington College Decision: Academic Board concluded inquiry for AI5002. Submission awarded 0% (Plagiarism). Student eligible for capped reassessment. Formal appeal window is open until Sep 22, 2026.',
            carrierMessageId: 'NTC-SMS-980123-09104',
          },
        ],
      },
      {
        id: 'plag-ai5001-1',
        assessmentId: 'ass-ai5001-1',
        assessmentTitle: 'Design Patterns Implementation & UML Portfolio',
        moduleCode: 'AI5001',
        moduleName: 'Object Oriented Programming & Design Patterns',
        submittedAt: '2026-09-04T12:00:00Z',
        turnitinSimilarityScore: 6,
        aiGeneratedScore: 0,
        allowedThreshold: 15,
        status: 'CLEARED',
        digitalReceiptId: 'TURNITIN-LMU-2026-774019',
        canAppeal: false,
        matchedSources: [],
        guardianNotifications: [
          {
            id: 'gn-clear-1',
            channel: 'PORTAL_ALERT',
            recipient: 'ramesh.sharma@gmail.com',
            dispatchedAt: '2026-09-05 09:30 AM NPT',
            status: 'DELIVERED',
            subject: 'Assessment Clearance Notice',
            messagePreview: 'Turnitin similarity verified at 6% (Within normal academic citation thresholds). First Class mark awarded.',
            carrierMessageId: 'SYS-CLEAR-0905-01',
          },
        ],
      },
    ],
  },

  // 2. Priya Thapa - At Risk (76.8%), Urgent Medical Appeal
  {
    id: 'student-2',
    rollNumber: 'NP03CS4S24022',
    fullName: 'Priya Thapa',
    email: 'np03cs4s24022@islingtoncollege.edu.np',
    phone: '+977-9851098765',
    degreeName: 'BSc (Hons) Computing',
    award: 'Awarded by London Metropolitan University',
    year: 'Year 3',
    academicPeriod: 'Autumn Term 2026',
    academicStanding: 'ACADEMIC_WARNING',
    gpa: 2.92,
    guardianName: 'Sunita Thapa',
    guardianRelation: 'Mother',
    guardianPhone: '+977-9812345678',
    guardianEmail: 'sunita.thapa@outlook.com',
    modules: [
      {
        id: 'CS5002NI',
        code: 'CS5002NI',
        name: 'Advanced Web Engineering & REST APIs',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Er. Manish Joshi',
        totalConducted: 26,
        attendedSessions: 19,
        missedSessions: 7,
        lectureRate: 72,
        tutorialRate: 75,
        workshopRate: 73,
        currentMark: 58,
        currentGrade: 'Lower Second Class (2:2)',
        assessments: [
          {
            id: 'ass-cs5002-1',
            moduleId: 'CS5002NI',
            title: 'Microservices Architecture & CI/CD Pipeline',
            type: 'Coursework',
            weightPercentage: 50,
            dueDate: '2026-09-25',
            status: 'UPCOMING',
            maxScore: 100,
          },
        ],
      },
      {
        id: 'CS5003NI',
        code: 'CS5003NI',
        name: 'Database Architecture & Big Data Analytics',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Dr. Saroj Karki',
        totalConducted: 26,
        attendedSessions: 21,
        missedSessions: 5,
        lectureRate: 80,
        tutorialRate: 81,
        workshopRate: 80,
        currentMark: 64,
        currentGrade: 'Upper Second Class (2:1)',
        assessments: [
          {
            id: 'ass-cs5003-1',
            moduleId: 'CS5003NI',
            title: 'Distributed SQL & Query Optimization Practical',
            type: 'In-Class Test',
            weightPercentage: 40,
            dueDate: '2026-10-02',
            status: 'UPCOMING',
            maxScore: 100,
          },
        ],
      },
    ],
    scheduledSessions: [
      {
        id: 'sess-201',
        moduleId: 'CS5002NI',
        moduleCode: 'CS5002NI',
        moduleName: 'Advanced Web Engineering',
        sessionType: 'Lecture',
        date: '2026-09-08',
        startTime: '08:00',
        endTime: '10:00',
        location: 'Block C - LT2',
        lecturer: 'Er. Manish Joshi',
      },
      {
        id: 'sess-202',
        moduleId: 'CS5002NI',
        moduleCode: 'CS5002NI',
        moduleName: 'Advanced Web Engineering',
        sessionType: 'Workshop',
        date: '2026-09-09',
        startTime: '10:00',
        endTime: '13:00',
        location: 'Lab 305',
        lecturer: 'Er. Manish Joshi',
      },
      {
        id: 'sess-203',
        moduleId: 'CS5002NI',
        moduleCode: 'CS5002NI',
        moduleName: 'Advanced Web Engineering',
        sessionType: 'Tutorial',
        date: '2026-09-11',
        startTime: '14:00',
        endTime: '16:00',
        location: 'Block A - Room 102',
        lecturer: 'Er. Manish Joshi',
      },
    ],
    attendanceRecords: {
      'sess-201': {
        id: 'att-201',
        studentId: 'student-2',
        sessionId: 'sess-201',
        status: 'ABSENT',
        markedAt: '2026-09-08T08:15:00Z',
        markedBy: 'Er. Manish Joshi',
        source: 'LECTURER_PORTAL',
        reason: 'Unnotified Absence',
      },
      'sess-202': {
        id: 'att-202',
        studentId: 'student-2',
        sessionId: 'sess-202',
        status: 'ABSENT',
        markedAt: '2026-09-09T10:20:00Z',
        markedBy: 'Er. Manish Joshi',
        source: 'LECTURER_PORTAL',
        reason: 'Hospital visit - Medical Slip pending review',
      },
      'sess-203': {
        id: 'att-203',
        studentId: 'student-2',
        sessionId: 'sess-203',
        status: 'PRESENT',
        markedAt: '2026-09-11T14:01:00Z',
        markedBy: 'Biometric RFID Scanner - A1',
        source: 'BIOMETRIC_SCANNER',
      },
    },
    supportCases: [
      {
        id: 'case-2',
        ticketNumber: 'SSD-2026-089',
        studentId: 'student-2',
        studentName: 'Priya Thapa',
        studentRoll: 'NP03CS4S24022',
        category: 'Attendance Appeal & Medical Waiver',
        subject: 'Hospitalization Justification for Sept 8-9 Absences',
        description: 'I was admitted to Norvic Hospital for acute gastroenteritis. Attaching hospital discharge slip and doctor certificate. Requesting conversion of 2 missed sessions to Authorised Absence.',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        assignedStaff: 'Deepak Adhikari (SSD Lead)',
        createdAt: '2026-09-10T14:20:00Z',
        updatedAt: '2026-09-11T09:45:00Z',
        internalStaffNotes: 'Medical certificate verified from Norvic Hospital serial #NV-2026-891. If approved, attendance rate will recover from 76.8% to 80.8% and restore exam clearance.',
        relatedSessionId: 'sess-202',
        messages: [
          {
            id: 'msg-201',
            senderId: 'student-2',
            senderName: 'Priya Thapa',
            senderRole: 'STUDENT',
            message: 'Uploaded Norvic Hospital discharge summary. Please consider my appeal before the examination clearance list is finalized.',
            timestamp: '2026-09-10T14:20:00Z',
            attachmentName: 'Norvic_Discharge_Summary_Priya.pdf',
          },
          {
            id: 'msg-202',
            senderId: 'staff-2',
            senderName: 'Deepak Adhikari (SSD Lead)',
            senderRole: 'ADMIN',
            message: 'Hello Priya, your medical documents have been forwarded to the verification team. A decision will be posted shortly.',
            timestamp: '2026-09-11T09:45:00Z',
          },
        ],
      },
    ],
    appointments: [
      {
        id: 'apt-2',
        studentId: 'student-2',
        studentName: 'Priya Thapa',
        studentRoll: 'NP03CS4S24022',
        appointmentType: 'Attendance Hearing',
        date: '2026-09-15',
        timeSlot: '02:00 PM - 02:30 PM',
        staffMember: 'Deepak Adhikari',
        location: 'Student Services Dept - Room 102',
        status: 'CONFIRMED',
        notes: 'Attendance intervention and medical waiver verification.',
      },
    ],
  },

  // 3. Bibek Shrestha - Caution Zone (81.4%)
  {
    id: 'student-3',
    rollNumber: 'NP03CS4S24051',
    fullName: 'Bibek Shrestha',
    email: 'np03cs4s24051@islingtoncollege.edu.np',
    phone: '+977-9861234890',
    degreeName: 'BSc (Hons) Computer Networking & IT Security',
    award: 'Awarded by London Metropolitan University',
    year: 'Year 2',
    academicPeriod: 'Autumn Term 2026',
    academicStanding: 'GOOD_STANDING',
    gpa: 3.25,
    guardianName: 'Krishna Shrestha',
    guardianRelation: 'Father',
    guardianPhone: '+977-9849876543',
    guardianEmail: 'krishna.shrestha@gmail.com',
    modules: [
      {
        id: 'CN5001',
        code: 'CN5001',
        name: 'Enterprise Routing & Switching Infrastructure',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Er. Sujan Prajapati',
        totalConducted: 28,
        attendedSessions: 23,
        missedSessions: 5,
        lectureRate: 82,
        tutorialRate: 80,
        workshopRate: 82,
        currentMark: 71,
        currentGrade: 'Upper Second Class (2:1)',
        assessments: [
          {
            id: 'ass-cn5001-1',
            moduleId: 'CN5001',
            title: 'Cisco BGP & OSPF Simulation Topologies',
            type: 'Coursework',
            weightPercentage: 50,
            dueDate: '2026-10-05',
            status: 'UPCOMING',
            maxScore: 100,
          },
        ],
      },
      {
        id: 'CN5002',
        code: 'CN5002',
        name: 'Ethical Hacking & Network Defense',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Er. Roshan Dangol',
        totalConducted: 28,
        attendedSessions: 23,
        missedSessions: 5,
        lectureRate: 81,
        tutorialRate: 82,
        workshopRate: 81,
        currentMark: 68,
        currentGrade: 'Upper Second Class (2:1)',
        assessments: [
          {
            id: 'ass-cn5002-1',
            moduleId: 'CN5002',
            title: 'Vulnerability Assessment & Pen-Testing Report',
            type: 'Project',
            weightPercentage: 50,
            dueDate: '2026-10-18',
            status: 'UPCOMING',
            maxScore: 100,
          },
        ],
      },
    ],
    scheduledSessions: [
      {
        id: 'sess-301',
        moduleId: 'CN5001',
        moduleCode: 'CN5001',
        moduleName: 'Enterprise Routing & Switching',
        sessionType: 'Workshop',
        date: '2026-09-10',
        startTime: '11:00',
        endTime: '13:00',
        location: 'Cisco Networking Lab 2',
        lecturer: 'Er. Sujan Prajapati',
      },
      {
        id: 'sess-302',
        moduleId: 'CN5002',
        moduleCode: 'CN5002',
        moduleName: 'Ethical Hacking',
        sessionType: 'Lecture',
        date: '2026-09-11',
        startTime: '10:00',
        endTime: '12:00',
        location: 'Block C - LT1',
        lecturer: 'Er. Roshan Dangol',
      },
    ],
    attendanceRecords: {
      'sess-301': {
        id: 'att-301',
        studentId: 'student-3',
        sessionId: 'sess-301',
        status: 'PRESENT',
        markedAt: '2026-09-10T11:02:00Z',
        markedBy: 'Er. Sujan Prajapati',
        source: 'LECTURER_PORTAL',
      },
      'sess-302': {
        id: 'att-302',
        studentId: 'student-3',
        sessionId: 'sess-302',
        status: 'LATE',
        markedAt: '2026-09-11T10:18:00Z',
        markedBy: 'Biometric RFID Scanner - C1',
        source: 'BIOMETRIC_SCANNER',
        reason: 'Traffic congestion at Maitidevi',
      },
    },
    supportCases: [],
    appointments: [],
  },

  // 4. Rohan Maharjan - Debarred (<70%), Disciplinary & Attendance Hearing
  {
    id: 'student-4',
    rollNumber: 'NP03CS4S24110',
    fullName: 'Rohan Maharjan',
    email: 'np03cs4s24110@islingtoncollege.edu.np',
    phone: '+977-9841998877',
    degreeName: 'BSc (Hons) Multimedia Technologies',
    award: 'Awarded by London Metropolitan University',
    year: 'Year 2',
    academicPeriod: 'Autumn Term 2026',
    academicStanding: 'DEBARRED',
    gpa: 2.10,
    guardianName: 'Prem Maharjan',
    guardianRelation: 'Father',
    guardianPhone: '+977-9801122334',
    guardianEmail: 'prem.maharjan@yahoo.com',
    modules: [
      {
        id: 'MM5001',
        code: 'MM5001',
        name: '3D Computer Animation & Visual FX',
        credits: 30,
        term: 'Year-Long',
        moduleLeader: 'Er. Binod Bajracharya',
        totalConducted: 26,
        attendedSessions: 18,
        missedSessions: 8,
        lectureRate: 68,
        tutorialRate: 70,
        workshopRate: 70,
        currentMark: 48,
        currentGrade: 'Pass / Third Class',
        assessments: [
          {
            id: 'ass-mm5001-1',
            moduleId: 'MM5001',
            title: 'Maya Character Rigging & Lighting Showreel',
            type: 'Coursework',
            weightPercentage: 50,
            dueDate: '2026-09-30',
            status: 'UPCOMING',
            maxScore: 100,
          },
        ],
      },
    ],
    scheduledSessions: [
      {
        id: 'sess-401',
        moduleId: 'MM5001',
        moduleCode: 'MM5001',
        moduleName: '3D Computer Animation',
        sessionType: 'Workshop',
        date: '2026-09-09',
        startTime: '08:00',
        endTime: '11:00',
        location: 'Animation Studio 1',
        lecturer: 'Er. Binod Bajracharya',
      },
    ],
    attendanceRecords: {
      'sess-401': {
        id: 'att-401',
        studentId: 'student-4',
        sessionId: 'sess-401',
        status: 'ABSENT',
        markedAt: '2026-09-09T08:30:00Z',
        markedBy: 'Er. Binod Bajracharya',
        source: 'LECTURER_PORTAL',
        reason: 'Unexcused Absence',
      },
    },
    supportCases: [
      {
        id: 'case-4',
        ticketNumber: 'SSD-2026-102',
        studentId: 'student-4',
        studentName: 'Rohan Maharjan',
        studentRoll: 'NP03CS4S24110',
        category: 'Attendance Appeal & Medical Waiver',
        subject: 'Formal Debarment Notice & SSD Intervention Hearing',
        description: 'Notice issued by Student Services Department: Attendance at 69.5% fails the 80% London Met regulatory standard. Compulsory guardian attendance interview required.',
        status: 'AWAITING_STUDENT',
        priority: 'URGENT',
        assignedStaff: 'Kripa Sharma (SSD)',
        createdAt: '2026-09-11T11:00:00Z',
        updatedAt: '2026-09-12T08:00:00Z',
        internalStaffNotes: 'Parent contacted via phone on 2026-09-11. Guardian informed of 69.5% attendance and risk of academic year repeat.',
        messages: [
          {
            id: 'msg-401',
            senderId: 'staff-1',
            senderName: 'Kripa Sharma (SSD)',
            senderRole: 'ADMIN',
            message: 'Rohan, please be advised that your overall attendance is 69.5%. You are currently debarred from end-of-semester assessments unless an intervention agreement is signed with your guardian.',
            timestamp: '2026-09-11T11:00:00Z',
          },
        ],
      },
    ],
    appointments: [
      {
        id: 'apt-4',
        studentId: 'student-4',
        studentName: 'Rohan Maharjan',
        studentRoll: 'NP03CS4S24110',
        appointmentType: 'Disciplinary Review',
        date: '2026-09-14',
        timeSlot: '03:00 PM - 03:45 PM',
        staffMember: 'Kripa Sharma & Deepak Adhikari',
        location: 'SSD Boardroom - Block A',
        status: 'CONFIRMED',
        notes: 'Mandatory guardian attendance meeting regarding debarment status.',
      },
    ],
  },
];

const STORAGE_KEY_STUDENTS = 'islington_ssd_canonical_students_v1';
const STORAGE_KEY_NOTICES = 'islington_ssd_canonical_notices_v1';
const STORAGE_KEY_NOTIFS = 'islington_ssd_canonical_notifications_v1';
const STORAGE_KEY_POLICY = 'islington_ssd_canonical_policy_v1';

export class CanonicalStoreService {
  private static instance: CanonicalStoreService;
  private students: CanonicalStudent[];
  private notices: CollegeNotice[];
  private notifications: PlatformNotification[];
  private policy: AttendancePolicy;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.students = this.loadFromStorage(STORAGE_KEY_STUDENTS, INITIAL_STUDENTS);
    this.notices = this.loadFromStorage(STORAGE_KEY_NOTICES, INITIAL_NOTICES);
    this.notifications = this.loadFromStorage(STORAGE_KEY_NOTIFS, INITIAL_NOTIFICATIONS);
    this.policy = this.loadFromStorage(STORAGE_KEY_POLICY, DEFAULT_ISLINGTON_POLICY);
  }

  public static getInstance(): CanonicalStoreService {
    if (!CanonicalStoreService.instance) {
      CanonicalStoreService.instance = new CanonicalStoreService();
    }
    return CanonicalStoreService.instance;
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`[CanonicalStore] Failed to load key ${key}`, e);
    }
    return fallback;
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(this.students));
      localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(this.notices));
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEY_POLICY, JSON.stringify(this.policy));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[CanonicalStore] Save failed', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters
  public getStudents(): CanonicalStudent[] {
    return [...this.students];
  }

  public getStudentById(id: string): CanonicalStudent | undefined {
    return this.students.find((s) => s.id === id);
  }

  public getStudentByEmailOrRoll(email: string, rollNumber: string): CanonicalStudent | undefined {
    const cleanEmail = email.trim().toLowerCase();
    const cleanRoll = rollNumber.trim().toUpperCase();
    const emailPrefix = cleanEmail.includes('@') ? cleanEmail.split('@')[0].toUpperCase() : cleanEmail.toUpperCase();

    return this.students.find((s) => {
      const sEmail = s.email.toLowerCase();
      const sRoll = s.rollNumber.toUpperCase();
      const sPrefix = sEmail.includes('@') ? sEmail.split('@')[0].toUpperCase() : sEmail.toUpperCase();

      return (
        (cleanEmail && sEmail === cleanEmail) ||
        (cleanRoll && sRoll === cleanRoll) ||
        (cleanEmail && sRoll === emailPrefix) ||
        (cleanRoll && sPrefix === cleanRoll)
      );
    });
  }

  public authenticateOrRegisterStudent(email: string, rollNumber: string): CanonicalStudent {
    const existing = this.getStudentByEmailOrRoll(email, rollNumber);
    if (existing) {
      return existing;
    }

    const cleanRoll = rollNumber.trim().toUpperCase() || (email.split('@')[0] || 'NP01ST2026').toUpperCase();
    const cleanEmail = email.trim().toLowerCase() || `${cleanRoll.toLowerCase()}@islingtoncollege.edu.np`;
    const studentId = `student-${cleanRoll.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Deep clone template modules from existing student
    const templateStudent = this.students[0] || INITIAL_STUDENTS[0];
    const clonedModules = JSON.parse(JSON.stringify(templateStudent.modules));
    const clonedSessions = JSON.parse(JSON.stringify(templateStudent.scheduledSessions || []));
    const clonedRecords = JSON.parse(JSON.stringify(templateStudent.attendanceRecords || {}));

    const newStudent: CanonicalStudent = {
      id: studentId,
      rollNumber: cleanRoll,
      fullName: cleanRoll,
      email: cleanEmail,
      phone: '+977-9840001122',
      degreeName: 'BSc (Hons) Computing with Artificial Intelligence',
      award: 'Awarded by London Metropolitan University',
      year: 'Year 2',
      academicPeriod: 'Autumn Term 2026',
      academicStanding: 'GOOD_STANDING',
      gpa: 3.82,
      guardianName: 'Guardian',
      guardianRelation: 'Parent',
      guardianPhone: '+977-9801122334',
      guardianEmail: `guardian.${cleanRoll.toLowerCase()}@gmail.com`,
      modules: clonedModules,
      scheduledSessions: clonedSessions,
      attendanceRecords: clonedRecords,
      supportCases: [],
      appointments: [],
    };

    this.students.unshift(newStudent);
    this.saveToStorage();
    return newStudent;
  }

  public getNotices(): CollegeNotice[] {
    return [...this.notices];
  }

  public getNotifications(role: Role, studentId?: string): PlatformNotification[] {
    return this.notifications.filter((n) => {
      // Fixed: this used to also let ANY 'ADMIN'-targeted notification
      // through for every role, which leaked admin-only alerts (e.g. "Review
      // required" about a specific student) into that same student's own
      // notification bell. Each notification should only reach its own
      // targetRole.
      if (n.targetRole !== role) return false;
      if (role === 'STUDENT' && n.studentId && n.studentId !== studentId) return false;
      if (role === 'PARENT' && n.studentId && n.studentId !== studentId) return false;
      return true;
    });
  }

  public getPolicy(): AttendancePolicy {
    return { ...this.policy };
  }

  // Pure Mutations with Audit Trail
  public correctAttendance(
    studentId: string,
    sessionId: string,
    newStatus: AttendanceStatus,
    reason: string,
    actorName = 'SSD Administrator',
    actorRole: Role = 'ADMIN'
  ): { success: boolean; error?: string } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    // Snapshot the attendance band BEFORE applying the change, so we can
    // tell whether this correction made things worse (see attendanceBands.ts).
    const oldMetrics = calculateStudentAttendanceMetrics(student, this.policy);
    const oldBand = bandFromMetrics(oldMetrics);

    const currentRecord = student.attendanceRecords[sessionId];
    const previousStatus: AttendanceStatus = currentRecord ? currentRecord.status : 'PENDING';

    const auditEntry = {
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorName,
      actorRole,
      previousStatus,
      newStatus,
      justificationReason: reason,
    };

    const existingTrail = currentRecord?.auditTrail || [];

    student.attendanceRecords[sessionId] = {
      id: currentRecord?.id || 'att-' + Date.now(),
      studentId,
      sessionId,
      status: newStatus,
      markedAt: new Date().toISOString(),
      markedBy: actorName,
      source: 'SSD_ADMIN_OVERRIDE',
      reason,
      isCorrected: true,
      auditTrail: [auditEntry, ...existingTrail],
    };

    // Only alert when the attendance band actually got WORSE - never on
    // improvement, never twice for staying in the same band. This is the
    // fix for "low attendance identified too late": previously this fired
    // the same generic message on every correction, even good ones.
    const newMetrics = calculateStudentAttendanceMetrics(student, this.policy);
    const newBand = bandFromMetrics(newMetrics);
    const bandAlerts = buildAttendanceBandAlerts({
      studentName: student.fullName,
      rollNumber: student.rollNumber,
      oldBand,
      newBand,
      newPercentage: newMetrics.attendancePercentage,
    });

    for (const alert of bandAlerts) {
      this.notifications.unshift({
        id: 'notif-' + Date.now() + '-' + alert.targetRole,
        targetRole: alert.targetRole,
        studentId,
        type: 'ATTENDANCE_WARNING',
        title: alert.title,
        body: alert.body,
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    }

    this.saveToStorage();
    return { success: true };
  }

  public addSupportCaseMessage(
    caseId: string,
    messageText: string,
    senderName: string,
    senderRole: Role,
    isInternalStaffOnly = false
  ): { success: boolean; error?: string } {
    for (const student of this.students) {
      const c = student.supportCases.find((sc) => sc.id === caseId);
      if (c) {
        c.messages.push({
          id: 'msg-' + Date.now(),
          senderId: 'user-' + senderRole.toLowerCase(),
          senderName,
          senderRole,
          message: messageText,
          timestamp: new Date().toISOString(),
          isInternalStaffOnly,
        });
        c.updatedAt = new Date().toISOString();
        if (senderRole === 'ADMIN' && c.status === 'AWAITING_STAFF') {
          c.status = 'AWAITING_STUDENT';
        } else if (senderRole === 'STUDENT' && c.status === 'AWAITING_STUDENT') {
          c.status = 'IN_REVIEW';
        }
        this.saveToStorage();
        return { success: true };
      }
    }
    return { success: false, error: 'Case not found' };
  }

  public updateCaseStatus(
    caseId: string,
    newStatus: SupportCase['status'],
    internalStaffNotes?: string
  ): { success: boolean; error?: string } {
    for (const student of this.students) {
      const c = student.supportCases.find((sc) => sc.id === caseId);
      if (c) {
        c.status = newStatus;
        if (internalStaffNotes !== undefined) {
          c.internalStaffNotes = internalStaffNotes;
        }
        c.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return { success: true };
      }
    }
    return { success: false, error: 'Case not found' };
  }

  public createSupportCase(
    studentId: string,
    category: SupportCase['category'],
    subject: string,
    description: string,
    priority: SupportCase['priority'] = 'NORMAL',
    relatedSessionId?: string
  ): { success: boolean; ticketNumber?: string; error?: string } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    const ticketNumber = `SSD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newCase: SupportCase = {
      id: 'case-' + Date.now(),
      ticketNumber,
      studentId,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      category,
      subject,
      description,
      status: 'NEW',
      priority,
      assignedStaff: 'Unassigned (Triage Queue)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      internalStaffNotes: 'Ticket received via portal. Pending assignment by SSD Triage Officer.',
      relatedSessionId,
      messages: [
        {
          id: 'msg-' + Date.now(),
          senderId: student.id,
          senderName: student.fullName,
          senderRole: 'STUDENT',
          message: description,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    student.supportCases.unshift(newCase);

    // Notify Admin attention queue
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      targetRole: 'ADMIN',
      type: 'CASE_UPDATE',
      title: `New Support Request: ${ticketNumber}`,
      body: `${student.fullName} (${category}): ${subject}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    });

    this.saveToStorage();
    return { success: true, ticketNumber };
  }

  public scheduleAppointment(
    studentId: string,
    appointmentType: Appointment['appointmentType'],
    date: string,
    timeSlot: string,
    staffMember: string,
    location: string,
    notes?: string
  ): { success: boolean; error?: string } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    // Check for collision
    const existing = student.appointments.find(
      (a) => a.date === date && a.timeSlot === timeSlot && a.status !== 'CANCELLED'
    );
    if (existing) {
      return { success: false, error: 'This time slot is already booked. Please choose another time.' };
    }

    const newApt: Appointment = {
      id: 'apt-' + Date.now(),
      studentId,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      appointmentType,
      date,
      timeSlot,
      staffMember,
      location,
      status: 'CONFIRMED',
      notes,
    };

    student.appointments.push(newApt);

    // Notify student and parent
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      targetRole: 'STUDENT',
      studentId,
      type: 'CASE_UPDATE',
      title: 'Appointment Confirmed',
      body: `${appointmentType} scheduled on ${date} at ${timeSlot} with ${staffMember} (${location}).`,
      timestamp: new Date().toISOString(),
      isRead: false,
    });

    this.saveToStorage();
    return { success: true };
  }

  public createNotice(
    title: string,
    category: CollegeNotice['category'],
    summary: string,
    content: string,
    targetAudience: CollegeNotice['targetAudience'] = 'ALL',
    priority: CollegeNotice['priority'] = 'NORMAL'
  ): { success: boolean; notice: CollegeNotice } {
    const newNotice: CollegeNotice = {
      id: 'notice-' + Date.now(),
      title,
      category,
      summary,
      content,
      targetAudience,
      publishedAt: new Date().toISOString(),
      author: 'Student Services Department (SSD)',
      isPinned: false,
      priority,
    };
    this.notices.unshift(newNotice);
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      targetRole: targetAudience === 'STUDENTS' ? 'STUDENT' : targetAudience === 'PARENTS' ? 'PARENT' : 'ADMIN',
      type: 'COLLEGE_ANNOUNCEMENT',
      title: `Notice: ${title}`,
      body: summary,
      timestamp: new Date().toISOString(),
      isRead: false,
    });
    this.saveToStorage();
    return { success: true, notice: newNotice };
  }

  public submitPlagiarismAppeal(
    studentId: string,
    reportId: string,
    guardianReason: string,
    contactNumber: string
  ): { success: boolean; message: string } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return { success: false, message: 'Student not found' };

    const report = student.plagiarismReports?.find((r) => r.id === reportId);
    if (!report) return { success: false, message: 'Plagiarism report not found' };

    report.status = 'UNDER_APPEAL';
    report.guardianNotifications.push({
      id: `gn-appeal-${Date.now()}`,
      channel: 'PORTAL_ALERT',
      recipient: `${student.guardianName} (${contactNumber})`,
      dispatchedAt: new Date().toLocaleString(),
      status: 'DELIVERED',
      subject: 'Academic Misconduct Formal Appeal Registered',
      messagePreview: `Formal dispute logged by guardian. Reason: "${guardianReason.slice(0, 80)}...". Case referred to London Met Academic Misconduct Appeals Panel.`,
      carrierMessageId: `APP-REG-${Date.now().toString().slice(-6)}`,
    });

    // Also open a support case for SSD tracking
    const newCaseId = `case-${Date.now()}`;
    student.supportCases.unshift({
      id: newCaseId,
      ticketNumber: `SSD-PLAG-${Date.now().toString().slice(-4)}`,
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      category: 'Academic Advisory & Extenuating Circumstances',
      subject: `Guardian Appeal: ${report.moduleCode} Turnitin Plagiarism Finding`,
      description: `Guardian (${student.guardianName}) submitted formal review for coursework ${report.assessmentTitle}. Stated: ${guardianReason}`,
      status: 'NEW',
      priority: 'HIGH',
      assignedStaff: 'Dr. Bishnu Pandey (Academic Conduct Officer)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      internalStaffNotes: `Parent registered appeal via Guardian Academic Portal. Contact: ${contactNumber}. Verified carrier logs sent on ${report.investigationDate}.`,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: 'guardian',
          senderName: `${student.guardianName} (Parent)`,
          senderRole: 'PARENT',
          message: guardianReason,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    this.saveToStorage();
    return { success: true, message: 'Appeal successfully registered with London Met Academic Board' };
  }

  public scheduleAcademicMisconductHearing(
    studentId: string,
    preferredDate: string,
    preferredTime: string,
    notes: string
  ): { success: boolean; message: string } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return { success: false, message: 'Student not found' };

    const newAppointment: Appointment = {
      id: `apt-plag-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      appointmentType: 'Academic Advisory',
      date: preferredDate,
      timeSlot: preferredTime,
      staffMember: 'Dr. Bishnu Pandey & SSD Officer',
      location: 'Kamalpokhari Campus - Academic Integrity Hearing Room (Block A)',
      status: 'CONFIRMED',
      notes: `Guardian Consultation regarding Academic Integrity & Turnitin Report. Notes: ${notes}`,
    };

    student.appointments.push(newAppointment);

    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      targetRole: 'PARENT',
      studentId: student.id,
      type: 'CASE_UPDATE',
      title: 'Academic Integrity Hearing Confirmed',
      body: `Your hearing appointment with Dr. Bishnu Pandey has been scheduled for ${preferredDate} at ${preferredTime}.`,
      timestamp: new Date().toISOString(),
      isRead: false,
    });

    this.saveToStorage();
    return { success: true, message: 'Hearing appointment booked successfully' };
  }

  public updatePolicy(newPolicy: Partial<AttendancePolicy>) {
    this.policy = { ...this.policy, ...newPolicy };
    this.saveToStorage();
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveToStorage();
    }
  }

  public resetToDefaults() {
    this.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    this.notices = JSON.parse(JSON.stringify(INITIAL_NOTICES));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.policy = JSON.parse(JSON.stringify(DEFAULT_ISLINGTON_POLICY));
    this.saveToStorage();
  }
}
