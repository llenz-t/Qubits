import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Building2,
  Clock,
  MessageSquare,
  Calendar,
  Send,
  CheckCircle2,
  AlertTriangle,
  User,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { CanonicalStudent } from '../../types/canonical';

interface SSDTicket {
  id: string;
  category: string;
  subject: string;
  module: string;
  date: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'NORMAL' | 'URGENT';
  response?: string;
}

interface SSDAppointment {
  id: string;
  counselor: string;
  role: string;
  date: string;
  time: string;
  agenda: string;
  location: string;
}

const INITIAL_TICKETS: SSDTicket[] = [
  {
    id: 'TKT-2026-081',
    category: 'Biometric Attendance Discrepancy',
    subject: 'Marked absent in Lecture hall 402 despite swiping RFID card',
    module: 'Object Oriented Programming & Design Patterns',
    date: '2026-09-08',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    response: 'SSD Officer reviewed the CCTV & manual lecturer attendance sheet. Verification is underway.',
  },
  {
    id: 'TKT-2026-064',
    category: 'Debarment Risk Consultation',
    subject: 'Urgent consultation on recovering from 60% overall attendance',
    module: 'All Autumn Term Modules',
    date: '2026-08-30',
    status: 'RESOLVED',
    priority: 'URGENT',
    response: 'In-person meeting completed with Er. Prashant Shrestha. Remedial 6-session recovery plan generated.',
  },
];

const INITIAL_APPOINTMENTS: SSDAppointment[] = [
  {
    id: 'APT-2026-019',
    counselor: 'Er. Prashant Shrestha',
    role: 'SSD Attendance Regulatory Officer',
    date: 'Monday, 14 Sept 2026',
    time: '11:00 AM – 11:30 AM',
    agenda: 'Mid-term Attendance Review & Examination Eligibility Roadmap',
    location: 'SSD Counseling Room 2, Block A Ground Floor',
  },
];

interface StudentContactSSDProps {
  student: CanonicalStudent;
  onOpenAiChat?: () => void;
}

export const StudentContactSSD: React.FC<StudentContactSSDProps> = ({
  student,
  onOpenAiChat,
}) => {
  const [activeTab, setActiveTab] = useState<'ticket' | 'appointment'>('ticket');
  const [tickets, setTickets] = useState<SSDTicket[]>(() => {
    const saved = localStorage.getItem(`attendease_tickets_${student.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TICKETS;
  });

  const [appointments, setAppointments] = useState<SSDAppointment[]>(() => {
    const saved = localStorage.getItem(`attendease_apts_${student.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_APPOINTMENTS;
  });

  // Ticket form state
  const [category, setCategory] = useState('Attendance Discrepancy');
  const [selectedModule, setSelectedModule] = useState(student.modules[0]?.title || 'All Modules');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [ticketNotice, setTicketNotice] = useState<string | null>(null);

  // Appointment form state
  const [counselor, setCounselor] = useState('Er. Prashant Shrestha');
  const [aptDate, setAptDate] = useState('2026-09-16');
  const [aptSlot, setAptSlot] = useState('11:30 AM – 12:00 PM');
  const [agenda, setAgenda] = useState('Debarment Recovery & Medical Slip Review');
  const [aptNotice, setAptNotice] = useState<string | null>(null);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please provide a subject and brief description.');
      return;
    }

    const newTicket: SSDTicket = {
      id: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      category,
      subject: subject.trim(),
      module: selectedModule,
      date: new Date().toISOString().split('T')[0],
      status: 'OPEN',
      priority,
      response: 'Ticket logged with SSD. Response typically provided within 24 business hours.',
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem(`attendease_tickets_${student.id}`, JSON.stringify(updated));

    setSubject('');
    setDescription('');
    setTicketNotice(`Support Ticket ${newTicket.id} has been submitted to the Student Services Desk.`);
    setTimeout(() => setTicketNotice(null), 5000);
  };

  const handleAptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roleMap: Record<string, string> = {
      'Er. Prashant Shrestha': 'SSD Attendance Regulatory Officer',
      'Dr. Angela Adhikari': 'Academic Welfare & Counseling Advisor',
      'Ms. Pooja Tamang': 'Examination Clearance Coordinator',
    };

    const newApt: SSDAppointment = {
      id: `APT-2026-${Math.floor(100 + Math.random() * 900)}`,
      counselor,
      role: roleMap[counselor] || 'SSD Advisor',
      date: aptDate,
      time: aptSlot,
      agenda: agenda.trim(),
      location: 'SSD Counseling Room 2, Block A Ground Floor',
    };

    const updated = [newApt, ...appointments];
    setAppointments(updated);
    localStorage.setItem(`attendease_apts_${student.id}`, JSON.stringify(updated));

    setAptNotice(`Appointment ${newApt.id} scheduled with ${counselor} for ${aptDate} at ${aptSlot}!`);
    setTimeout(() => setAptNotice(null), 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Physical Location & Contact Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <Building2 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Islington Student Services
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-500">Desk Open Now</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Contact Student Services Desk (SSD)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ground Floor, Block A, Kamalpokhari, Kathmandu · Operating Sun–Fri 08:00 AM – 05:00 PM
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-700">
              <span className="flex items-center gap-1.5 font-mono font-semibold">
                <Phone size={13} className="text-emerald-700" />
                <span>+977-1-4412345 (Ext. 204)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Mail size={13} className="text-emerald-700" />
                <span>ssd@islingtoncollege.edu.np</span>
              </span>
            </div>
          </div>
        </div>

        {onOpenAiChat && (
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <MessageSquare size={16} />
            <span>Launch Live SSD Chat</span>
          </button>
        )}
      </div>

      {/* Action Tabs: Raise Ticket vs Book In-Person Counseling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-md">
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ticket'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raise SSD Attendance Ticket
            </button>
            <button
              onClick={() => setActiveTab('appointment')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'appointment'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Book 1-on-1 Appointment
            </button>
          </div>

          {/* Form 1: Raise Support Ticket */}
          {activeTab === 'ticket' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Submit Formal Attendance / Academic Discrepancy Inquiry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your ticket will be routed immediately to the Islington SSD attendance registry team
                </p>
              </div>

              {ticketNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{ticketNotice}</span>
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Inquiry Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Attendance Discrepancy">Biometric / Manual Attendance Discrepancy</option>
                      <option value="Debarment Appeal">Debarment (&lt;80%) Appeal Consultation</option>
                      <option value="Medical Slip Follow-up">Medical Waiver Status Follow-up</option>
                      <option value="Timetable Clash">Scheduled Class Clashes</option>
                      <option value="General Welfare">Student Welfare & Special Accommodations</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Concerned Module</label>
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="All Autumn Term Modules">All Autumn Term Modules</option>
                      {student.modules.map((m) => (
                        <option key={m.code} value={m.title}>
                          {m.code} - {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject / Brief Summary</label>
                  <input
                    type="text"
                    placeholder="e.g., Attendance marked absent in Wednesday AI5001 Workshop"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Detailed Explanation</label>
                  <textarea
                    rows={4}
                    placeholder="Provide dates, session room numbers, tutor names, or specific details regarding the discrepancy..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="urgent-check"
                      checked={priority === 'URGENT'}
                      onChange={(e) => setPriority(e.target.checked ? 'URGENT' : 'NORMAL')}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="urgent-check" className="text-xs font-semibold text-slate-700">
                      Mark as High Priority (Impending Exam Debarment Deadline)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-[#0c3830] hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Submit SSD Ticket</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form 2: Book In-Person Appointment */}
          {activeTab === 'appointment' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Book In-Person Counseling at SSD Desk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Meet privately with Islington College Student Services Officers in Block A Room 2
                </p>
              </div>

              {aptNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{aptNotice}</span>
                </div>
              )}

              <form onSubmit={handleAptSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Select Officer / Counselor</label>
                    <select
                      value={counselor}
                      onChange={(e) => setCounselor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Er. Prashant Shrestha">Er. Prashant Shrestha (Attendance Regulatory Officer)</option>
                      <option value="Dr. Angela Adhikari">Dr. Angela Adhikari (Welfare & Pastoral Advisor)</option>
                      <option value="Ms. Pooja Tamang">Ms. Pooja Tamang (Examination Clearance Coordinator)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Preferred Date</label>
                    <input
                      type="date"
                      value={aptDate}
                      onChange={(e) => setAptDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Time Slot (30 Mins)</label>
                    <select
                      value={aptSlot}
                      onChange={(e) => setAptSlot(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="10:00 AM – 10:30 AM">10:00 AM – 10:30 AM</option>
                      <option value="11:30 AM – 12:00 PM">11:30 AM – 12:00 PM</option>
                      <option value="02:00 PM – 02:30 PM">02:00 PM – 02:30 PM</option>
                      <option value="03:30 PM – 04:00 PM">03:30 PM – 04:00 PM</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Primary Agenda</label>
                    <input
                      type="text"
                      placeholder="e.g., Medical Slip Approval & Debarment Clearance"
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#0c3830] hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <Calendar size={14} />
                    <span>Confirm In-Person Appointment</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right 1 Column: Active Cases & Appointments */}
        <div className="space-y-6">
          {/* Scheduled Appointments Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Calendar size={15} className="text-emerald-700" />
                <span>Confirmed SSD Appointments</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {appointments.length}
              </span>
            </div>

            {appointments.length === 0 ? (
              <p className="text-xs text-slate-500">No appointments scheduled.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950">{apt.counselor}</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {apt.time}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">{apt.role}</div>
                    <div className="text-xs text-slate-800 font-semibold">{apt.agenda}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                      <Building2 size={11} className="text-slate-400" />
                      <span>{apt.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Support Tickets */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <MessageSquare size={15} className="text-emerald-700" />
                <span>Your SSD Tickets</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {tickets.length}
              </span>
            </div>

            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500">No active tickets.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="border border-slate-200 rounded-2xl p-3.5 space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-800">{t.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{t.subject}</div>
                    <div className="text-[11px] text-slate-500">{t.module}</div>
                    {t.response && (
                      <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded-lg leading-relaxed">
                        <span className="font-bold">SSD Response: </span>
                        {t.response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
