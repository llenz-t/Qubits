# ClassPulse - Daily Attendance & AAA Scholarship System

A full-stack attendance automation and analytics platform for Islington College, built on top of the existing AttendEase React prototype (the underlying prototype is internally still called AttendEase in a few file/localStorage names - the product itself is branded **ClassPulse**). It adds:

- A real Supabase (PostgreSQL) schema modelling Islington's actual structure: 4 degrees, 3 years, 5 sections per degree/year, Lecture/Tutorial/Workshop tracking, and 15/30-credit modules.
- The **AAA Scholarship** calculation (Green &ge;80%, Yellow 70-79.9%, Red &lt;70%) driving the underlying attendance-rate math, with canceled sessions never counting against a student. The scholarship zone still colors the charts, but the dashboard no longer surfaces "AAA Scholarship Status" as its own labelled/badged section - see **Portal structure** below.
- A daily attendance Excel/CSV upload pipeline (Node/Express + SheetJS) with row-level validation and an audit report.
- A medical/absence justification workflow with PDF proof upload (Supabase Storage) and an admin verification workbench.
- Recharts-based visual analytics (aggregate donut, L-T-W bar chart, weekly momentum line) shown on both the Student Panel and the Parent Portal.
- **Role-based login** (Student / Parent / Admin) with a strictly read-only Parent Portal.

The original prototype (mock curriculum data, localStorage, the Courses/Students/Excel admin views) is untouched and still works standalone - everything above is additive and runs in a safe **demo mode** with representative mock data whenever Supabase/the backend aren't configured yet, so `npm run dev` keeps working out of the box.

## Portal structure

Logging in (`check your attendance` on the landing page) now asks which role you're signing in as:

- **Student** -> the existing Dashboard, with its sidebar now grouped into a **Student Panel** section (Dashboard, Missed) and, only for admins, a separate **Admin** section (Courses, Students, Excel, Attendance, Verify Absences). A Year 1 / Year 2 / Year 3 selector sits at the top of the dashboard. The attendance-rate chart section is now titled plainly **"Attendance Overview"** - it shows the year's attendance aggregate (donut), the weekly momentum line, and the Lecture/Tutorial/Workshop bar chart, with no "AAA Scholarship" badge or label. The "Request Excused Absence" flow is unchanged.
- **Parent** -> a brand new, strictly **read-only** `ParentPortal`: it shows the student's info, a Year 1/2/3 selector, the same three charts under "Attendance Overview", overall present/missed/excused/canceled counts, and a per-module report table. There is no course/roster editing and no absence-justification form here - parents can only view results and reports.
- **Admin** -> the existing Admin nav (Courses / Students / Excel / Attendance upload / Verify Absences), unchanged, but now only reachable by the Admin role - the Admin nav item is hidden entirely for students and parents.

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
│   ├── components/
│   │   ├── LoginModal.tsx              Student/Parent/Admin role picker + login
│   │   ├── Dashboard.tsx               Student Panel + Admin (role-gated)
│   │   └── ParentPortal.tsx            Read-only parent view
│   └── components/attendance/
│       ├── AAAScholarshipBadge.tsx     (kept for reference; no longer used in the simplified overview)
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

Open the app, click "check your attendance", pick a role (Student / Parent / Admin), then log in with any email/password (auth isn't wired up yet - see Notes on scope). Every role's charts, the daily upload, and absence justification/verification screens all work against mock data with no further setup.

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

Islington already runs AttendEase (by ING Tech) for the actual attendance marking. ClassPulse is deliberately built as **the layer above it**, not a replacement:

- All of the daily-upload-specific code (file parsing, header validation, date/status normalization) lives in `backend/src/services/attendanceImportService.js`, in `parseWorkbook()` / `validateAndNormalizeRows()`.
- Everything downstream of that - `importNormalizedRows()` and the `fn_import_attendance_batch` / `fn_import_attendance_row` RPCs in `database/02_functions.sql` - only cares about a normalized `{ rollNumber, moduleCode, sessionType, date, status, section }` shape.

When AttendEase exposes an API, a poller only needs to map its response into that same shape and call `importNormalizedRows()` (or `fn_import_attendance_batch` directly) - the Excel upload UI, the validation rules, and everything else described above keep working unchanged, and can be turned off once the API integration is trusted.

## Notes on scope

- **Authentication**: the schema and backend assume Supabase Auth (`auth.users`, RLS via `auth.uid()`), but `LoginModal.tsx` is still a UI stub - it collects a role, email and password and routes you into that role's view, without a real sign-in check yet. Wiring real sign-in (and confirming the logged-in parent is actually linked to the right student) is the natural next step once you're testing against a live Supabase project.
- **AAA zone vs. the existing "Good/Warning/Critical" status**: `StudentsManager.tsx` already had its own 85%/75% health indicator for the admin roster view. The AAA 80%/70% thresholds still drive the color of the attendance charts everywhere, but per the current design the "AAA Scholarship" wording/badge itself is intentionally not shown on the Student Panel or Parent Portal - only the plain attendance numbers and charts are.
