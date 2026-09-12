import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { CanonicalStudent, SupportCase } from '../../types/canonical';
import { useCanonicalStore } from '../../hooks/useCanonicalStore';

interface StudentServiceChatDrawerProps {
  student: CanonicalStudent;
  isOpen: boolean;
  onClose: () => void;
  initialSessionForExcuse?: {
    id: string;
    moduleCode: string;
    moduleName: string;
    date: string;
  } | null;
}

export const StudentServiceChatDrawer: React.FC<StudentServiceChatDrawerProps> = ({
  student,
  isOpen,
  onClose,
  initialSessionForExcuse,
}) => {
  const { createSupportCase, addSupportCaseMessage } = useCanonicalStore('STUDENT', student.id);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    student.supportCases[0]?.id || null
  );
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'new_ticket'>('chat');

  // Form state for new ticket / medical excuse
  const [category, setCategory] = useState<
    'Attendance Appeal & Medical Waiver' | 'Academic Advisory' | 'Timetable Clashes & Routine'
  >('Attendance Appeal & Medical Waiver');
  const [subject, setSubject] = useState(
    initialSessionForExcuse
      ? `Medical Waiver for ${initialSessionForExcuse.moduleCode} on ${initialSessionForExcuse.date}`
      : ''
  );
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const selectedCase = student.supportCases.find((c) => c.id === selectedCaseId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCaseId) return;

    addSupportCaseMessage(selectedCaseId, newMessage.trim(), student.fullName);
    setNewMessage('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    createSupportCase(
      student.id,
      category as any,
      subject.trim(),
      description.trim() + (attachmentName ? ` [Attached Medical Proof: ${attachmentName}]` : ''),
      'HIGH',
      initialSessionForExcuse?.id
    );

    setActiveTab('chat');
    setSubject('');
    setDescription('');
    setAttachmentName(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="bg-[#0c3830] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base">Student Services Desk (SSD)</h2>
              <p className="text-xs text-emerald-200/80">Direct Support & Medical Waiver Inquiries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'border-[#0c3830] text-[#0c3830]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Tickets & Chat ({student.supportCases.length})
          </button>
          <button
            onClick={() => setActiveTab('new_ticket')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'new_ticket'
                ? 'border-[#0c3830] text-[#0c3830]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            + New Appeal / Waiver
          </button>
        </div>

        {/* Tab 1: Live Chat & Thread Selection */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Thread selector */}
            {student.supportCases.length > 0 ? (
              <div className="p-3 bg-slate-50/70 border-b border-slate-200">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Select Ticket Conversation:
                </label>
                <select
                  value={selectedCaseId || ''}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {student.supportCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ticketNumber}: {c.subject} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No tickets opened yet. Click <strong>+ New Appeal / Waiver</strong> above to message SSD!
              </div>
            )}

            {/* Conversation Messages */}
            {selectedCase ? (
              <>
                <div className="p-3 bg-emerald-50 border-b border-emerald-100 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900">{selectedCase.ticketNumber}</span> ·{' '}
                    <span className="text-emerald-700">{selectedCase.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-white border border-emerald-200 text-emerald-800">
                    {selectedCase.status}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Initial description */}
                  <div className="p-3 bg-slate-100 rounded-2xl rounded-tl-xs text-xs text-slate-800 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User size={13} className="text-slate-500" />
                      <span>{selectedCase.studentName} (Original Request)</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{selectedCase.description}</p>
                    <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                      {new Date(selectedCase.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Thread messages */}
                  {selectedCase.messages.map((m) => {
                    const isMe = m.senderRole === 'STUDENT';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-[#0c3830] text-white rounded-tr-xs'
                              : 'bg-emerald-50 border border-emerald-200 text-slate-800 rounded-tl-xs'
                          }`}
                        >
                          <div className="font-bold text-[11px] flex items-center gap-1 opacity-90">
                            {isMe ? <User size={12} /> : <ShieldCheck size={12} className="text-emerald-700" />}
                            <span>{m.senderName}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                          {m.attachmentName && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] bg-black/10 px-2 py-1 rounded">
                              <Paperclip size={10} />
                              <span>{m.attachmentName}</span>
                            </div>
                          )}
                          <span
                            className={`text-[9px] block font-mono ${
                              isMe ? 'text-emerald-200/80 text-right' : 'text-slate-400'
                            }`}
                          >
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Reply Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message to Student Services..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0c3830] text-white rounded-xl text-xs font-bold hover:bg-[#0c3830]/90 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Send size={13} />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : null}
          </div>
        ) : (
          /* Tab 2: New Appeal / Ticket Form */
          <form onSubmit={handleCreateTicket} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
              >
                <option value="Attendance Appeal & Medical Waiver">
                  Attendance Appeal & Medical Slip Waiver
                </option>
                <option value="Academic Advisory">Academic Advisory & Mitigating Circumstances</option>
                <option value="Timetable Clashes & Routine">Timetable Clashes & Routine Query</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject / Summary</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Medical Certificate for Sept 8 Lab Absence"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description & Justification</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide details regarding your absence, medical diagnosis, or extenuating circumstance..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Upload Medical Certificate / Slip</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-emerald-600 transition-colors">
                <Paperclip className="mx-auto text-slate-400 mb-1" size={20} />
                <span className="text-xs text-slate-500 font-semibold block">
                  {attachmentName ? `Attached: ${attachmentName}` : 'Click to select Hospital/Clinic PDF or Image'}
                </span>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAttachmentName(file.name);
                  }}
                  className="hidden"
                  id="ssd-file-input"
                />
                <label
                  htmlFor="ssd-file-input"
                  className="mt-2 inline-block px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer"
                >
                  Browse Document
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#0c3830] text-white rounded-xl font-bold text-xs hover:bg-[#0c3830]/90 transition-all cursor-pointer shadow-xs"
              >
                Submit Appeal to Student Services
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
