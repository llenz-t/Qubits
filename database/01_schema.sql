-- =============================================================================
-- Islington College Daily Attendance & AAA Scholarship System
-- Database Script 1/2: Schema (Supabase / PostgreSQL)
--
-- Domain model matches the existing AttendEase prototype (src/data/attendanceData.ts,
-- src/data/routineData.ts):
--   - 4 degrees: ai, computing, networking, multimedia
--   - 3 years per degree (Year 1-3)
--   - 5 sections per degree+year
--   - Modules are either YEAR_LONG (30 credits) or SEMESTER (15 credits); 120 credits/year
--   - 3 classes/week per module: Lecture, Tutorial, Workshop
--   - All sections of the same degree+year share the same Lecture time (a shared session);
--     Tutorial and Workshop are section-specific. This is modelled below by making
--     course_sessions.section_id NULLABLE: NULL = shared across every section of that
--     module's year (used for Lecture rows), a specific section_id = section-only
--     (used for Tutorial/Workshop rows).
--
-- Run 02_functions.sql after this file.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type session_type_enum as enum ('LECTURE', 'TUTORIAL', 'WORKSHOP');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_status_enum as enum ('PRESENT', 'ABSENT', 'EXCUSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type proof_status_enum as enum ('PENDING', 'APPROVED', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type module_term_enum as enum ('SEMESTER_1', 'SEMESTER_2', 'YEAR_LONG');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- degrees: the 4 programmes Islington offers (matches IT_DEGREES in the app)
-- -----------------------------------------------------------------------------
create table if not exists degrees (
  id           text primary key,               -- 'ai' | 'computing' | 'networking' | 'multimedia'
  name         text not null,                   -- 'Bachelor in Artificial Intelligence'
  award        text not null,                   -- 'BSc (Hons) Computing with Artificial Intelligence'
  short_name   text not null,
  created_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- sections: 5 per degree+year (e.g. AI6..AI10 for ai/Year 2)
-- -----------------------------------------------------------------------------
create table if not exists sections (
  id           uuid primary key default gen_random_uuid(),
  degree_id    text not null references degrees(id) on delete cascade,
  year         smallint not null check (year in (1, 2, 3)),
  name         text not null,                   -- 'AI7'
  created_at   timestamptz not null default now(),
  unique (degree_id, year, name)
);

create index if not exists idx_sections_degree_year on sections (degree_id, year);

-- -----------------------------------------------------------------------------
-- modules: per degree+year. 15 credits => SEMESTER_1/SEMESTER_2, 30 credits => YEAR_LONG.
-- 120 credits per year across all modules of that degree+year.
-- -----------------------------------------------------------------------------
create table if not exists modules (
  id           uuid primary key default gen_random_uuid(),
  degree_id    text not null references degrees(id) on delete cascade,
  year         smallint not null check (year in (1, 2, 3)),
  code         text not null,                   -- 'CS5003NI'
  name         text not null,                   -- 'Data Structure and Specialist Programming'
  term         module_term_enum not null,
  credits      smallint not null check (credits in (15, 30)),
  created_at   timestamptz not null default now(),
  unique (degree_id, year, code),
  constraint modules_term_credits_match check (
    (term = 'YEAR_LONG' and credits = 30) or
    (term in ('SEMESTER_1', 'SEMESTER_2') and credits = 15)
  )
);

create index if not exists idx_modules_degree_year on modules (degree_id, year);

-- -----------------------------------------------------------------------------
-- students
-- -----------------------------------------------------------------------------
create table if not exists students (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null, -- linked once the student signs up
  roll_number    text not null unique,           -- 'NP03CS4S24001'
  full_name      text not null,
  email          text not null unique,
  degree_id      text not null references degrees(id) on delete restrict,
  year           smallint not null check (year in (1, 2, 3)),
  section_id     uuid not null references sections(id) on delete restrict,
  intake_batch   text not null,                  -- '2024-Spring'
  created_at     timestamptz not null default now()
);

create index if not exists idx_students_section on students (section_id);
create index if not exists idx_students_degree_year on students (degree_id, year);
create index if not exists idx_students_user on students (user_id);

-- -----------------------------------------------------------------------------
-- admins: staff who can review absence justifications / cancel sessions / upload attendance
-- -----------------------------------------------------------------------------
create table if not exists admins (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  created_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- course_sessions: one row per scheduled class occurrence.
-- section_id NULL  => shared Lecture for every section of that module's year.
-- section_id set   => Tutorial/Workshop for that specific section only.
-- -----------------------------------------------------------------------------
create table if not exists course_sessions (
  id                    uuid primary key default gen_random_uuid(),
  module_id             uuid not null references modules(id) on delete cascade,
  session_type          session_type_enum not null,
  section_id            uuid references sections(id) on delete cascade,
  scheduled_date        date not null,
  is_canceled           boolean not null default false,
  cancellation_reason   text,
  created_at            timestamptz not null default now(),
  constraint course_sessions_section_scope check (
    (session_type = 'LECTURE' and section_id is null) or
    (session_type in ('TUTORIAL', 'WORKSHOP') and section_id is not null)
  ),
  unique (module_id, session_type, section_id, scheduled_date)
);

create index if not exists idx_course_sessions_module on course_sessions (module_id);
create index if not exists idx_course_sessions_section on course_sessions (section_id);
create index if not exists idx_course_sessions_date on course_sessions (scheduled_date);
create index if not exists idx_course_sessions_canceled on course_sessions (module_id) where is_canceled = true;

-- -----------------------------------------------------------------------------
-- attendance_records
-- -----------------------------------------------------------------------------
create table if not exists attendance_records (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references students(id) on delete cascade,
  session_id     uuid not null references course_sessions(id) on delete cascade,
  status         attendance_status_enum not null default 'ABSENT',
  recorded_at    timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (student_id, session_id)
);

create index if not exists idx_attendance_records_student on attendance_records (student_id);
create index if not exists idx_attendance_records_session on attendance_records (session_id);

-- -----------------------------------------------------------------------------
-- absence_justifications
-- -----------------------------------------------------------------------------
create table if not exists absence_justifications (
  id                     uuid primary key default gen_random_uuid(),
  student_id             uuid not null references students(id) on delete cascade,
  session_id             uuid not null references course_sessions(id) on delete cascade,
  reason                 text not null,
  pdf_proof_url          text,
  proof_status           proof_status_enum not null default 'PENDING',
  admin_reviewer_notes   text,
  reviewed_by            uuid references auth.users(id) on delete set null,
  created_at             timestamptz not null default now(),
  reviewed_at            timestamptz,
  unique (student_id, session_id)
);

create index if not exists idx_absence_justifications_status on absence_justifications (proof_status);
create index if not exists idx_absence_justifications_student on absence_justifications (student_id);

-- -----------------------------------------------------------------------------
-- attendance_summary: cached per (student, module) rollup, refreshed by triggers
-- in 02_functions.sql whenever attendance_records or course_sessions.is_canceled change.
-- This is what the dashboard reads so it never has to re-aggregate on every page load.
-- -----------------------------------------------------------------------------
create table if not exists attendance_summary (
  student_id           uuid not null references students(id) on delete cascade,
  module_id            uuid not null references modules(id) on delete cascade,

  lecture_total        integer not null default 0,
  lecture_present      integer not null default 0,
  lecture_excused      integer not null default 0,

  tutorial_total       integer not null default 0,
  tutorial_present     integer not null default 0,
  tutorial_excused     integer not null default 0,

  workshop_total       integer not null default 0,
  workshop_present     integer not null default 0,
  workshop_excused     integer not null default 0,

  adjusted_total       integer not null default 0, -- sum of *_total above (canceled sessions never counted in *_total)
  attended_total       integer not null default 0, -- present + excused, summed
  attendance_rate      numeric(5, 2) not null default 0, -- 0-100, rounded to 2dp

  updated_at           timestamptz not null default now(),
  primary key (student_id, module_id)
);

create index if not exists idx_attendance_summary_student on attendance_summary (student_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table degrees enable row level security;
alter table sections enable row level security;
alter table modules enable row level security;
alter table students enable row level security;
alter table admins enable row level security;
alter table course_sessions enable row level security;
alter table attendance_records enable row level security;
alter table absence_justifications enable row level security;
alter table attendance_summary enable row level security;

-- Helper: is the current auth.uid() an admin?
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins a where a.user_id = auth.uid());
$$;

-- Helper: student row (if any) owned by the current auth.uid()
create or replace function current_student_id() returns uuid
language sql stable security definer set search_path = public as $$
  select s.id from students s where s.user_id = auth.uid();
$$;

-- Reference data (degrees/sections/modules/course_sessions): readable by any
-- signed-in user, writable only by admins.
create policy degrees_select_all on degrees for select using (true);
create policy degrees_admin_write on degrees for all using (is_admin()) with check (is_admin());

create policy sections_select_all on sections for select using (true);
create policy sections_admin_write on sections for all using (is_admin()) with check (is_admin());

create policy modules_select_all on modules for select using (true);
create policy modules_admin_write on modules for all using (is_admin()) with check (is_admin());

create policy course_sessions_select_all on course_sessions for select using (true);
create policy course_sessions_admin_write on course_sessions for all using (is_admin()) with check (is_admin());

-- students: a student can read/update their own row; admins can do everything.
create policy students_self_select on students for select
  using (user_id = auth.uid() or is_admin());
create policy students_admin_write on students for all
  using (is_admin()) with check (is_admin());

-- admins table: only admins can see who the admins are.
create policy admins_admin_select on admins for select using (is_admin());
create policy admins_admin_write on admins for all using (is_admin()) with check (is_admin());

-- attendance_records: a student sees only their own; admins see/manage everything.
create policy attendance_records_self_select on attendance_records for select
  using (student_id = current_student_id() or is_admin());
create policy attendance_records_admin_write on attendance_records for all
  using (is_admin()) with check (is_admin());

-- attendance_summary: same shape as attendance_records.
create policy attendance_summary_self_select on attendance_summary for select
  using (student_id = current_student_id() or is_admin());
create policy attendance_summary_admin_write on attendance_summary for all
  using (is_admin()) with check (is_admin());

-- absence_justifications: a student can read + create their own; only admins can
-- review (update proof_status / reviewer fields).
create policy absence_justifications_self_select on absence_justifications for select
  using (student_id = current_student_id() or is_admin());
create policy absence_justifications_self_insert on absence_justifications for insert
  with check (student_id = current_student_id());
create policy absence_justifications_admin_update on absence_justifications for update
  using (is_admin()) with check (is_admin());
create policy absence_justifications_admin_delete on absence_justifications for delete
  using (is_admin());

-- =============================================================================
-- Supabase Storage: absence-proofs bucket
-- Run once (idempotent). Keep the bucket PRIVATE — proofs are accessed through
-- signed URLs / the admin workbench, never a public URL.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('absence-proofs', 'absence-proofs', false)
on conflict (id) do nothing;

-- A student may upload only into their own folder: absence-proofs/<student_id>/...
create policy "absence_proofs_student_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'absence-proofs'
    and (storage.foldername(name))[1] = current_student_id()::text
  );

create policy "absence_proofs_student_read_own"
  on storage.objects for select
  using (
    bucket_id = 'absence-proofs'
    and (
      (storage.foldername(name))[1] = current_student_id()::text
      or is_admin()
    )
  );

-- =============================================================================
-- Seed: the 4 degrees (matches src/data/attendanceData.ts IT_DEGREES)
-- =============================================================================
insert into degrees (id, name, award, short_name) values
  ('ai', 'Bachelor in Artificial Intelligence', 'BSc (Hons) Computing with Artificial Intelligence', 'Artificial Intelligence'),
  ('computing', 'Bachelor in Computing', 'BSc (Hons) Computing', 'Computing'),
  ('networking', 'Bachelor in Computer Networking & IT Security', 'BSc (Hons) Computer Networking & IT Security', 'Networking & Security'),
  ('multimedia', 'Bachelor in Multimedia Technologies', 'BSc (Hons) Multimedia Technologies', 'Multimedia')
on conflict (id) do nothing;
