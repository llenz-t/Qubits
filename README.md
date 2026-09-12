# AttendEase - Daily Attendance & AAA Scholarship System

A full-stack attendance automation and analytics platform for Islington College, built on top of the existing AttendEase React prototype. It adds:

- A real Supabase (PostgreSQL) schema modelling Islington's actual structure: 4 degrees, 3 years, 5 sections per degree/year, Lecture/Tutorial/Workshop tracking, and 15/30-credit modules.
- The **AAA Scholarship** calculation (Green &ge;80%, Yellow 70-79.9%, Red &lt;70%), with canceled sessions never counting against a student.
- A daily attendance Excel/CSV upload pipeline (Node/Express + SheetJS) with row-level validation and an audit report.
- A medical/absence justification workflow with PDF proof upload (Supabase Storage) and an admin verification workbench.
- Recharts-based visual analytics on the student dashboard (aggregate donut, L-T-W bar chart, weekly momentum line).

The original prototype (mock curriculum data, localStorage, the Courses/Students/Excel admin views) is untouched and still works standalone - everything above is additive and runs in a safe **demo mode** with representative mock data whenever Supabase/the backend aren't configured yet, so `npm run dev` keeps working out of the box.

## Project layout

```
.
├── database/              PostgreSQL DDL + RPC functions for Supabase
│   ├── 01_schema.sql
│   └── 02_functions.sql
├── backend/                Node/Express API (daily upload, cancellations, dashboard, justifications)
│   └── src/
├── src/                    The existing Vite + React 19 frontend, extended with:
│   ├── lib/                supabaseClient.ts, apiClient.ts
│   ├── hooks/               useStudentDashboard.ts
│   ├── types/aaa.ts         AAA/dashboard types shared across new components
│   └── components/attendance/
│       ├── AAAScholarshipBadge.tsx
│       ├── AttendanceCharts.tsx        (donut / L-T-W bar / weekly line, Recharts)
│       ├── AbsenceJustificationForm.tsx
│       ├── AdminVerificationWorkbench.tsx
│       └── DailyAttendanceUpload.tsx
```

## Running it

### 1. Frontend only (demo mode, no setup required)

```bash
npm install
npm run dev
```

Open the app, click "check your attendance" then "Go to Dashboard". The AAA Scholarship section, charts, absence justification form, and the two new Admin tabs (Attendance / Verify Absences) all work against mock data with no further setup.

### 2. Wiring up the real backend

1. **Create a Supabase project**, then run the two SQL files against it (SQL Editor, in order):
   - `database/01_schema.sql`
   - `database/02_functions.sql`

   This creates the enums/tables/RLS policies, seeds the 4 degrees, and creates the private `absence-proofs` storage bucket.

2. **Seed sections, modules and students** for the degree/year/section you want to demo (the schema only seeds the 4 degrees - sections, modules, students and course_sessions are institution data that belongs in your own import, not hardcoded here). At minimum, insert a few rows into `sections`, `modules` and `students` so the daily upload has something to resolve against.

3. **Backend**:
   ```bash
   cd backend
   cp .env.example .env   # fill in SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
   npm install
   npm run dev
   ```

4. **Frontend**:
   ```bash
   cp .env.example .env   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_API_BASE_URL
   npm run dev
   ```

5. **Make yourself an admin** so you can use the upload/verification screens: insert your Supabase Auth user's `id` into the `admins` table. A signed-in user with no `admins` row and no `students` row can still use the app in read-only/demo terms; a `students` row linked via `user_id` is what makes the dashboard show that student's real data.

### Daily attendance upload format

`POST /api/attendance/upload` (multipart, field `file`) accepts `.xlsx`, `.xls` or `.csv` with these columns:

| RollNumber | ModuleCode | SessionType | Date | Status | Section (optional) |
|---|---|---|---|---|---|
| NP03CS4S24001 | CC5051NI | LECTURE | 2026-09-10 | PRESENT | |
| NP03CS4S24002 | CC5051NI | WORKSHOP | 2026-09-10 | ABSENT | AI7 |

`SessionType` must be `LECTURE`, `TUTORIAL` or `WORKSHOP`; `Status` must be `PRESENT`, `ABSENT` or `EXCUSED`. `Section` is only needed for Tutorial/Workshop rows and only if it differs from the student's own enrolled section. The response reports `{ totalRows, inserted, updated, errors: string[] }` with 1-indexed, spreadsheet-relative row numbers in every error.

### The AttendEase-API migration seam

Islington already runs AttendEase (by ING Tech) for the actual attendance marking. This system is deliberately built as **the layer above it**, not a replacement:

- All of the daily-upload-specific code (file parsing, header validation, date/status normalization) lives in `backend/src/services/attendanceImportService.js`, in `parseWorkbook()` / `validateAndNormalizeRows()`.
- Everything downstream of that - `importNormalizedRows()` and the `fn_import_attendance_batch` / `fn_import_attendance_row` RPCs in `database/02_functions.sql` - only cares about a normalized `{ rollNumber, moduleCode, sessionType, date, status, section }` shape.

When AttendEase exposes an API, a poller only needs to map its response into that same shape and call `importNormalizedRows()` (or `fn_import_attendance_batch` directly) - the Excel upload UI, the validation rules, and everything else described above keep working unchanged, and can be turned off once the API integration is trusted.

## Notes on scope

- **Authentication**: the schema and backend assume Supabase Auth (`auth.users`, RLS via `auth.uid()`), but the existing `LoginModal.tsx` is still a UI stub. Wiring real sign-in is the natural next step once you're testing against a live Supabase project.
- **AAA zone vs. the existing "Good/Warning/Critical" status**: `StudentsManager.tsx` already had its own 85%/75% health indicator for the admin roster view. The new AAA Scholarship badge uses the directive's official 80%/70% thresholds and is kept as its own clearly-labelled section rather than overwriting that existing indicator.
