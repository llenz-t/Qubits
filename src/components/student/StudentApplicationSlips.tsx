import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck,
  Calendar,
  Building2,
  Download,
  AlertTriangle,
  Plus,
  Eye,
} from 'lucide-react';
import { CanonicalStudent } from '../../types/canonical';

interface ApplicationSlipRecord {
  id: string;
  type: 'Medical Leave' | 'College Representation' | 'Family Emergency' | 'Official Leave';
  module: string;
  dateRange: string;
  provider: string;
  slipNumber: string;
  reason: string;
  fileName: string;
  fileSize: string;
  submittedAt: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  creditedHours?: number;
  officerRemarks?: string;
}

const INITIAL_SLIPS: ApplicationSlipRecord[] = [
  {
    id: 'SLIP-2026-MED-012',
    type: 'Medical Leave',
    module: 'Object Oriented Programming & Design Patterns',
    dateRange: '2026-08-18 to 2026-08-20',
    provider: 'Norvic International Hospital, Thapathali',
    slipNumber: 'NOR-2026-8819',
    reason: 'Severe viral gastro-enteritis with high fever, recommended 3 days absolute bed rest.',
    fileName: 'Norvic_Discharge_Slip_Aarav.pdf',
    fileSize: '1.4 MB',
    submittedAt: '2026-08-21 10:15 AM',
    status: 'APPROVED',
    creditedHours: 6,
    officerRemarks: 'Medical prescription verified with Norvic Hospital. 6 missed hours credited as Authorized Absence.',
  },
  {
    id: 'SLIP-2026-HACK-004',
    type: 'College Representation',
    module: 'Machine Learning Foundations & Neural Networks',
    dateRange: '2026-08-28',
    provider: 'Islington AI Innovation Hub / LOCUS 2026',
    slipNumber: 'LOC-REP-902',
    reason: 'Official college representation in National Inter-College Machine Learning Hackathon finals.',
    fileName: 'LOCUS_Participation_Letter.pdf',
    fileSize: '890 KB',
    submittedAt: '2026-08-29 02:40 PM',
    status: 'APPROVED',
    creditedHours: 2,
    officerRemarks: 'Validated with Islington ECA Department. Attendance waived.',
  },
  {
    id: 'SLIP-2026-MED-029',
    type: 'Medical Leave',
    module: 'Cloud Architecture & Virtualisation Systems',
    dateRange: '2026-09-08',
    provider: 'Patan Hospital Orthopedic Wing',
    slipNumber: 'PAT-ORT-4491',
    reason: 'Knee ligament twist requiring MRI scan and physical therapy session.',
    fileName: 'Patan_Hospital_Prescription.pdf',
    fileSize: '2.1 MB',
    submittedAt: '2026-09-09 09:30 AM',
    status: 'PENDING',
    officerRemarks: 'Application received. Currently under medical registry validation by SSD Health Officer.',
  },
];

interface StudentApplicationSlipsProps {
  student: CanonicalStudent;
}

export const StudentApplicationSlips: React.FC<StudentApplicationSlipsProps> = ({ student }) => {
  const [slips, setSlips] = useState<ApplicationSlipRecord[]>(() => {
    const saved = localStorage.getItem(`attendease_slips_${student.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SLIPS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [slipType, setSlipType] = useState<ApplicationSlipRecord['type']>('Medical Leave');
  const [selectedModule, setSelectedModule] = useState(student.modules[0]?.title || 'All Enrolled Modules');
  const [startDate, setStartDate] = useState('2026-09-11');
  const [endDate, setEndDate] = useState('2026-09-12');
  const [provider, setProvider] = useState('');
  const [slipNumber, setSlipNumber] = useState('');
  const [reason, setReason] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPreviewSlip, setSelectedPreviewSlip] = useState<ApplicationSlipRecord | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !provider.trim()) {
      alert('Please fill out the provider name and the reason for absence.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newSlip: ApplicationSlipRecord = {
        id: `SLIP-2026-${Date.now().toString().slice(-4)}`,
        type: slipType,
        module: selectedModule,
        dateRange: startDate === endDate ? startDate : `${startDate} to ${endDate}`,
        provider: provider.trim(),
        slipNumber: slipNumber.trim() || `GEN-${Math.floor(1000 + Math.random() * 9000)}`,
        reason: reason.trim(),
        fileName: uploadedFile ? uploadedFile.name : `${slipType.replace(/\s+/g, '_')}_Document.pdf`,
        fileSize: uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
        submittedAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'PENDING',
        officerRemarks: 'Submitted successfully. Assigned to SSD Welfare Officer for verification.',
      };

      const updated = [newSlip, ...slips];
      setSlips(updated);
      localStorage.setItem(`attendease_slips_${student.id}`, JSON.stringify(updated));

      setIsSubmitting(false);
      setIsFormOpen(false);
      setSuccessMessage(`Application slip ${newSlip.id} submitted successfully to SSD!`);
      // Reset fields
      setProvider('');
      setSlipNumber('');
      setReason('');
      setUploadedFile(null);

      setTimeout(() => setSuccessMessage(null), 5000);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Callout */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <UploadCloud size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Official SSD Document Registry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Upload Application & Medical Slips
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
              Submit hospital discharge notes, registered doctor prescriptions, or official college event slips to convert missed sessions into Authorized Absences under London Met guidelines.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-[#0c3830] hover:bg-emerald-800 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Submit New Slip</span>
        </button>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Modal / Inline Submission Form */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-lg animate-in fade-in zoom-in-95 duration-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                New Application / Medical Waiver Slip
              </h3>
              <p className="text-xs text-slate-500">
                Applicant: {student.fullName} ({student.rollNumber}) · Islington College
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Slip Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Application Category</label>
                <select
                  value={slipType}
                  onChange={(e) => setSlipType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Medical Leave">Medical Leave (Hospital / Doctor Note)</option>
                  <option value="College Representation">College Representation (Hackathon / Sports / Seminar)</option>
                  <option value="Family Emergency">Family Emergency / Bereavement</option>
                  <option value="Official Leave">Official Extenuating Leave</option>
                </select>
              </div>

              {/* Module */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Affected Module / Routine</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="All Enrolled Modules (Full Day Leave)">All Enrolled Modules (Full Day Leave)</option>
                  {student.modules.map((m) => (
                    <option key={m.code} value={m.title}>
                      {m.code} - {m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Absence Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Absence End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Provider */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Medical Center / Organization / Doctor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Patan Hospital / Norvic Clinic / Dr. K. Sharma"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Slip / Registration Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Slip # / Prescription # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., MED-9812 / NMC Reg # 14820"
                  value={slipNumber}
                  onChange={(e) => setSlipNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Drag & Drop File Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Attach Medical Prescription / Official Slip (PDF, JPG, PNG)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : uploadedFile
                    ? 'border-emerald-400 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
                onClick={() => document.getElementById('slip-file-input')?.click()}
              >
                <input
                  id="slip-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileCheck size={28} className="text-emerald-600" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900">{uploadedFile.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                      <UploadCloud size={20} />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      Drag and drop your slip document here, or <span className="text-emerald-700 underline">browse files</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports PDF, PNG, or JPG scanned receipts (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Reason & Clinical / Circumstance Summary
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe the illness or reason for absence as stated in the slip..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#0c3830] hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting to SSD...</span>
                ) : (
                  <>
                    <UploadCloud size={14} />
                    <span>Submit Slip to SSD</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submitted Slips & History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Submitted Slips & Verification History
            </h3>
            <p className="text-xs text-slate-500">
              Track SSD officer reviews, medical validations, and attendance waiver credits
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {slips.length} Total Submissions
          </span>
        </div>

        {slips.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No application slips uploaded yet. Click "Submit New Slip" above.
          </div>
        ) : (
          <div className="space-y-3">
            {slips.map((slip) => {
              const isApproved = slip.status === 'APPROVED';
              const isPending = slip.status === 'PENDING';

              return (
                <div
                  key={slip.id}
                  className="rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-700'
                            : isPending
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {slip.id}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-bold text-slate-700">{slip.type}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {slip.module}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Approved ({slip.creditedHours || 2}h Credited)</span>
                          </>
                        ) : isPending ? (
                          <>
                            <Clock size={12} />
                            <span>Pending SSD Verification</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            <span>Waiver Declined</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Absence Period
                      </span>
                      <span className="font-semibold text-slate-800">{slip.dateRange}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Provider / Authority
                      </span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {slip.provider} ({slip.slipNumber})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Attachment
                      </span>
                      <span className="font-mono text-slate-700 flex items-center gap-1 text-[11px]">
                        <FileCheck size={12} className="text-emerald-600" />
                        <span className="truncate">{slip.fileName}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800">Student Reason: </span>
                    {slip.reason}
                  </div>

                  {slip.officerRemarks && (
                    <div className="text-xs text-emerald-900 bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl flex items-start gap-2">
                      <Building2 size={14} className="text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950">SSD Official Remarks: </span>
                        <span>{slip.officerRemarks}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
