import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { uploadAttendanceExcel } from '../../lib/apiClient';
import { AttendanceUploadReport } from '../../types/aaa';

const DEMO_REPORT: AttendanceUploadReport = {
  totalRows: 90,
  inserted: 84,
  updated: 4,
  errors: [
    "Row 14: Invalid Session Type 'Lab'",
    'Row 37: Unknown roll number "NP03CS4S24999"',
  ],
};

export const DailyAttendanceUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [report, setReport] = useState<AttendanceUploadReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStatus('uploading');
    setErrorMsg(null);
    setReport(null);

    try {
      if (isSupabaseConfigured) {
        const result = await uploadAttendanceExcel(file);
        setReport(result);
      } else {
        // Demo mode: no backend configured. Show a representative report so
        // the upload flow is visible without a live server.
        await new Promise((resolve) => setTimeout(resolve, 700));
        setReport(DEMO_REPORT);
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Daily Attendance Upload</h2>
        <span className="text-xs font-semibold text-neutral-400">
          Columns: RollNumber, ModuleCode, SessionType, Date, Status, Section (optional)
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging ? 'border-[#0c3830] bg-emerald-50/50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-xs">
            {status === 'uploading' ? <Loader2 size={22} className="animate-spin" /> : <UploadCloud size={24} />}
          </div>
          <div className="font-bold text-sm text-neutral-800">
            {fileName ? fileName : 'Drop today’s attendance sheet or click to browse'}
          </div>
        </div>
      </div>

      {status === 'error' && errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {report && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-center">
              <div className="text-2xl font-bold text-neutral-900">{report.totalRows}</div>
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Rows Parsed</div>
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-center">
              <div className="text-2xl font-bold text-emerald-700">{report.inserted + report.updated}</div>
              <div className="text-[11px] font-bold text-emerald-700/80 uppercase tracking-wider">Saved</div>
            </div>
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-center">
              <div className="text-2xl font-bold text-rose-700">{report.errors.length}</div>
              <div className="text-[11px] font-bold text-rose-700/80 uppercase tracking-wider">Errors</div>
            </div>
          </div>

          {report.errors.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 size={15} />
              <span>All rows imported cleanly.</span>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 max-h-48 overflow-y-auto">
              {report.errors.map((e, idx) => (
                <div key={idx} className="px-3 py-2 text-xs text-rose-700 bg-rose-50/40 font-medium">
                  {e}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
