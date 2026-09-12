-- =============================================================================
-- Islington College Daily Attendance & AAA Scholarship System
-- Database Script 2/2: RPC functions, triggers, dynamic recalculation
--
-- Run 01_schema.sql first.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- fn_scholarship_zone: classifies an attendance rate into the AAA scholarship
-- zone. Kept as its own function so the threshold logic lives in exactly one
-- place (dashboard RPC below, and anywhere else that needs it later).
--   >= 80.0        -> GREEN  (Eligible)
--   70.0 - 79.99   -> YELLOW (At-Risk)
--   < 70.0         -> RED    (Disqualified)
-- -----------------------------------------------------------------------------
create or replace function fn_scholarship_zone(p_rate numeric) returns text
language sql immutable as $$
  select case
    when p_rate >= 80 then 'GREEN'
    when p_rate >= 70 then 'YELLOW'
    else 'RED'
  end;
$$;

-- -----------------------------------------------------------------------------
-- fn_refresh_attendance_summary: recomputes the cached attendance_summary row
-- for one (student, module) pair from first principles:
--   Adjusted Total   = scheduled sessions for that student in that module MINUS canceled ones
--   Attendance Rate  = (PRESENT + EXCUSED) / Adjusted Total * 100
-- A session counts toward a student's total only if it is a shared LECTURE
-- (section_id is null) or belongs to that student's own section (TUTORIAL/WORKSHOP).
-- Called by the triggers below; also safe to call directly/manually.
-- -----------------------------------------------------------------------------
create or replace function fn_refresh_attendance_summary(p_student_id uuid, p_module_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_section_id uuid;
  v_lecture_total int; v_lecture_present int; v_lecture_excused int;
  v_tutorial_total int; v_tutorial_present int; v_tutorial_excused int;
  v_workshop_total int; v_workshop_present int; v_workshop_excused int;
  v_adjusted_total int;
  v_attended_total int;
  v_rate numeric(5,2);
begin
  select section_id into v_section_id from students where id = p_student_id;
  if v_section_id is null then
    return; -- unknown student, nothing to compute
  end if;

  select
    count(*) filter (where cs.session_type = 'LECTURE'),
    count(*) filter (where cs.session_type = 'LECTURE' and ar.status = 'PRESENT'),
    count(*) filter (where cs.session_type = 'LECTURE' and ar.status = 'EXCUSED'),
    count(*) filter (where cs.session_type = 'TUTORIAL'),
    count(*) filter (where cs.session_type = 'TUTORIAL' and ar.status = 'PRESENT'),
    count(*) filter (where cs.session_type = 'TUTORIAL' and ar.status = 'EXCUSED'),
    count(*) filter (where cs.session_type = 'WORKSHOP'),
    count(*) filter (where cs.session_type = 'WORKSHOP' and ar.status = 'PRESENT'),
    count(*) filter (where cs.session_type = 'WORKSHOP' and ar.status = 'EXCUSED')
  into
    v_lecture_total, v_lecture_present, v_lecture_excused,
    v_tutorial_total, v_tutorial_present, v_tutorial_excused,
    v_workshop_total, v_workshop_present, v_workshop_excused
  from course_sessions cs
  left join attendance_records ar
    on ar.session_id = cs.id and ar.student_id = p_student_id
  where cs.module_id = p_module_id
    and cs.is_canceled = false
    and (cs.section_id is null or cs.section_id = v_section_id);

  v_adjusted_total := v_lecture_total + v_tutorial_total + v_workshop_total;
  v_attended_total := (v_lecture_present + v_lecture_excused)
                     + (v_tutorial_present + v_tutorial_excused)
                     + (v_workshop_present + v_workshop_excused);
  v_rate := case when v_adjusted_total > 0
              then round((v_attended_total::numeric / v_adjusted_total) * 100, 2)
              else 0 end;

  insert into attendance_summary (
    student_id, module_id,
    lecture_total, lecture_present, lecture_excused,
    tutorial_total, tutorial_present, tutorial_excused,
    workshop_total, workshop_present, workshop_excused,
    adjusted_total, attended_total, attendance_rate, updated_at
  ) values (
    p_student_id, p_module_id,
    v_lecture_total, v_lecture_present, v_lecture_excused,
    v_tutorial_total, v_tutorial_present, v_tutorial_excused,
    v_workshop_total, v_workshop_present, v_workshop_excused,
    v_adjusted_total, v_attended_total, v_rate, now()
  )
  on conflict (student_id, module_id) do update set
    lecture_total = excluded.lecture_total,
    lecture_present = excluded.lecture_present,
    lecture_excused = excluded.lecture_excused,
    tutorial_total = excluded.tutorial_total,
    tutorial_present = excluded.tutorial_present,
    tutorial_excused = excluded.tutorial_excused,
    workshop_total = excluded.workshop_total,
    workshop_present = excluded.workshop_present,
    workshop_excused = excluded.workshop_excused,
    adjusted_total = excluded.adjusted_total,
    attended_total = excluded.attended_total,
    attendance_rate = excluded.attendance_rate,
    updated_at = now();
end;
$$;

-- -----------------------------------------------------------------------------
-- fn_refresh_module_summaries: recomputes every student affected by a given
-- module (optionally scoped to one section, for a Tutorial/Workshop cancellation).
-- Used after an admin cancels/uncancels a session, per the directive's
-- "dynamic recalculation across all associated student percentages" requirement.
-- -----------------------------------------------------------------------------
create or replace function fn_refresh_module_summaries(p_module_id uuid, p_section_id uuid default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_degree_id text;
  v_year smallint;
  r record;
begin
  select degree_id, year into v_degree_id, v_year from modules where id = p_module_id;
  if v_degree_id is null then
    return;
  end if;

  for r in
    select id from students
    where degree_id = v_degree_id
      and year = v_year
      and (p_section_id is null or section_id = p_section_id)
  loop
    perform fn_refresh_attendance_summary(r.id, p_module_id);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Trigger: after an attendance_records row is inserted/updated, refresh the
-- summary for that one (student, module).
-- -----------------------------------------------------------------------------
create or replace function trg_attendance_records_after_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_module_id uuid;
begin
  select module_id into v_module_id from course_sessions where id = new.session_id;
  if v_module_id is not null then
    perform fn_refresh_attendance_summary(new.student_id, v_module_id);
  end if;
  return new;
end;
$$;

drop trigger if exists attendance_records_after_change on attendance_records;
create trigger attendance_records_after_change
  after insert or update of status on attendance_records
  for each row execute function trg_attendance_records_after_change();

-- -----------------------------------------------------------------------------
-- Trigger: after a course_sessions row's is_canceled flag flips, recalculate
-- every student the session applies to (whole year group for a Lecture,
-- just the one section for a Tutorial/Workshop). This is the "System Logic"
-- requirement from Section 2.1 of the directive.
-- -----------------------------------------------------------------------------
create or replace function trg_course_sessions_after_cancel_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.is_canceled is distinct from old.is_canceled then
    perform fn_refresh_module_summaries(new.module_id, new.section_id);
  end if;
  return new;
end;
$$;

drop trigger if exists course_sessions_after_cancel_change on course_sessions;
create trigger course_sessions_after_cancel_change
  after update of is_canceled on course_sessions
  for each row execute function trg_course_sessions_after_cancel_change();

-- -----------------------------------------------------------------------------
-- fn_cancel_session: admin-facing RPC to cancel/uncancel a session with a reason
-- (e.g. a bandh or unplanned holiday). Recalculation happens automatically via
-- the trigger above.
-- -----------------------------------------------------------------------------
create or replace function fn_cancel_session(p_session_id uuid, p_reason text)
returns course_sessions
language plpgsql security definer set search_path = public as $$
declare
  v_row course_sessions;
begin
  if not is_admin() then
    raise exception 'Only admins can cancel sessions';
  end if;

  update course_sessions
  set is_canceled = true, cancellation_reason = p_reason
  where id = p_session_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Session % not found', p_session_id;
  end if;

  return v_row;
end;
$$;

create or replace function fn_uncancel_session(p_session_id uuid)
returns course_sessions
language plpgsql security definer set search_path = public as $$
declare
  v_row course_sessions;
begin
  if not is_admin() then
    raise exception 'Only admins can restore sessions';
  end if;

  update course_sessions
  set is_canceled = false, cancellation_reason = null
  where id = p_session_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Session % not found', p_session_id;
  end if;

  return v_row;
end;
$$;

-- -----------------------------------------------------------------------------
-- fn_import_attendance_row: the single-row "adapter seam" for ingesting one
-- normalized attendance record, regardless of where it came from (today: the
-- Excel upload pipeline in the backend; tomorrow: a poller hitting the
-- AttendEase API). Resolves student/module/section by natural keys, upserts
-- the course_session and the attendance_record, and returns a structured
-- result so the caller can build a granular per-row report.
--
-- p_session_type: 'LECTURE' | 'TUTORIAL' | 'WORKSHOP'
-- p_status:       'PRESENT' | 'ABSENT' | 'EXCUSED'
-- p_section_name: required for TUTORIAL/WORKSHOP, ignored (may be null) for LECTURE
-- -----------------------------------------------------------------------------
create or replace function fn_import_attendance_row(
  p_roll_number   text,
  p_module_code   text,
  p_session_type  session_type_enum,
  p_scheduled_date date,
  p_status        attendance_status_enum,
  p_section_name  text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_student students%rowtype;
  v_module modules%rowtype;
  v_section_id uuid;
  v_session_id uuid;
  v_existing_status attendance_status_enum;
  v_action text;
begin
  select * into v_student from students where upper(trim(roll_number)) = upper(trim(p_roll_number));
  if v_student.id is null then
    return jsonb_build_object('ok', false, 'error', format('Unknown roll number "%s"', p_roll_number));
  end if;

  select * into v_module
  from modules
  where upper(trim(code)) = upper(trim(p_module_code))
    and degree_id = v_student.degree_id
    and year = v_student.year;
  if v_module.id is null then
    return jsonb_build_object('ok', false, 'error', format('Unknown module code "%s" for this student''s degree/year', p_module_code));
  end if;

  if p_session_type = 'LECTURE' then
    v_section_id := null;
  else
    if p_section_name is null or trim(p_section_name) = '' then
      -- fall back to the student's own section when the sheet doesn't carry one
      v_section_id := v_student.section_id;
    else
      select id into v_section_id from sections
      where degree_id = v_student.degree_id and year = v_student.year
        and upper(trim(name)) = upper(trim(p_section_name));
      if v_section_id is null then
        return jsonb_build_object('ok', false, 'error', format('Unknown section "%s"', p_section_name));
      end if;
    end if;
  end if;

  insert into course_sessions (module_id, session_type, section_id, scheduled_date)
  values (v_module.id, p_session_type, v_section_id, p_scheduled_date)
  on conflict (module_id, session_type, section_id, scheduled_date) do update
    set module_id = excluded.module_id -- no-op update, just to return the existing row via RETURNING
  returning id into v_session_id;

  select status into v_existing_status
  from attendance_records
  where student_id = v_student.id and session_id = v_session_id;

  v_action := case when v_existing_status is null then 'inserted' else 'updated' end;

  insert into attendance_records (student_id, session_id, status, updated_at)
  values (v_student.id, v_session_id, p_status, now())
  on conflict (student_id, session_id) do update
    set status = excluded.status, updated_at = now();

  return jsonb_build_object('ok', true, 'action', v_action, 'session_id', v_session_id, 'student_id', v_student.id);
end;
$$;

-- -----------------------------------------------------------------------------
-- fn_import_attendance_batch: runs fn_import_attendance_row for every element
-- of a jsonb array in one round trip. Each element:
--   { "rollNumber": "...", "moduleCode": "...", "sessionType": "LECTURE",
--     "date": "2026-09-10", "status": "PRESENT", "section": "AI7", "row": 14 }
-- "row" is only carried through so the caller can map errors back to the
-- original spreadsheet row number; it is not used for anything else here.
-- -----------------------------------------------------------------------------
create or replace function fn_import_attendance_batch(p_rows jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_row jsonb;
  v_result jsonb;
  v_results jsonb := '[]'::jsonb;
  v_inserted int := 0;
  v_updated int := 0;
  v_errors jsonb := '[]'::jsonb;
begin
  if not is_admin() then
    raise exception 'Only admins can import attendance';
  end if;

  for v_row in select * from jsonb_array_elements(p_rows)
  loop
    begin
      v_result := fn_import_attendance_row(
        v_row->>'rollNumber',
        v_row->>'moduleCode',
        (v_row->>'sessionType')::session_type_enum,
        (v_row->>'date')::date,
        (v_row->>'status')::attendance_status_enum,
        v_row->>'section'
      );
    exception when others then
      v_result := jsonb_build_object('ok', false, 'error', SQLERRM);
    end;

    if (v_result->>'ok')::boolean then
      if v_result->>'action' = 'inserted' then
        v_inserted := v_inserted + 1;
      else
        v_updated := v_updated + 1;
      end if;
    else
      v_errors := v_errors || jsonb_build_object('row', v_row->'row', 'message', v_result->>'error');
    end if;
  end loop;

  return jsonb_build_object(
    'totalRows', jsonb_array_length(p_rows),
    'inserted', v_inserted,
    'updated', v_updated,
    'errors', v_errors
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- fn_approve_justification / fn_reject_justification
-- -----------------------------------------------------------------------------
create or replace function fn_approve_justification(p_justification_id uuid, p_notes text default null)
returns absence_justifications
language plpgsql security definer set search_path = public as $$
declare
  v_just absence_justifications%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can approve absence justifications';
  end if;

  update absence_justifications
  set proof_status = 'APPROVED',
      admin_reviewer_notes = p_notes,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_justification_id
  returning * into v_just;

  if v_just.id is null then
    raise exception 'Justification % not found', p_justification_id;
  end if;

  insert into attendance_records (student_id, session_id, status, updated_at)
  values (v_just.student_id, v_just.session_id, 'EXCUSED', now())
  on conflict (student_id, session_id) do update
    set status = 'EXCUSED', updated_at = now();

  return v_just;
end;
$$;

create or replace function fn_reject_justification(p_justification_id uuid, p_notes text default null)
returns absence_justifications
language plpgsql security definer set search_path = public as $$
declare
  v_just absence_justifications%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can reject absence justifications';
  end if;

  update absence_justifications
  set proof_status = 'REJECTED',
      admin_reviewer_notes = p_notes,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_justification_id
  returning * into v_just;

  if v_just.id is null then
    raise exception 'Justification % not found', p_justification_id;
  end if;

  -- Ensure a record exists and stays ABSENT (it may never have been marked at all).
  insert into attendance_records (student_id, session_id, status, updated_at)
  values (v_just.student_id, v_just.session_id, 'ABSENT', now())
  on conflict (student_id, session_id) do nothing;

  return v_just;
end;
$$;

-- -----------------------------------------------------------------------------
-- fn_get_student_dashboard: everything the frontend dashboard needs in one call.
-- -----------------------------------------------------------------------------
create or replace function fn_get_student_dashboard(p_student_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_student students%rowtype;
  v_totals record;
  v_overall_rate numeric(5,2);
  v_modules jsonb;
begin
  select * into v_student from students where id = p_student_id;
  if v_student.id is null then
    raise exception 'Student % not found', p_student_id;
  end if;

  select
    coalesce(sum(adjusted_total), 0) as adjusted_total,
    coalesce(sum(attended_total), 0) as attended_total,
    coalesce(sum(lecture_present + tutorial_present + workshop_present), 0) as present_total,
    coalesce(sum(lecture_excused + tutorial_excused + workshop_excused), 0) as excused_total,
    coalesce(sum(
      (lecture_total - lecture_present - lecture_excused) +
      (tutorial_total - tutorial_present - tutorial_excused) +
      (workshop_total - workshop_present - workshop_excused)
    ), 0) as absent_total,
    coalesce(sum(lecture_total + tutorial_total + workshop_total), 0) as scheduled_total,
    coalesce(sum(lecture_present), 0) as lecture_present,
    coalesce(sum(lecture_total), 0) as lecture_total,
    coalesce(sum(tutorial_present), 0) as tutorial_present,
    coalesce(sum(tutorial_total), 0) as tutorial_total,
    coalesce(sum(workshop_present), 0) as workshop_present,
    coalesce(sum(workshop_total), 0) as workshop_total
  into v_totals
  from attendance_summary
  where student_id = p_student_id;

  v_overall_rate := case when v_totals.adjusted_total > 0
    then round((v_totals.attended_total::numeric / v_totals.adjusted_total) * 100, 2)
    else 0 end;

  select coalesce(jsonb_agg(jsonb_build_object(
    'moduleId', m.id,
    'code', m.code,
    'name', m.name,
    'term', m.term,
    'credits', m.credits,
    'lectureRate', case when s.lecture_total > 0 then round((s.lecture_present + s.lecture_excused)::numeric / s.lecture_total * 100, 1) else null end,
    'tutorialRate', case when s.tutorial_total > 0 then round((s.tutorial_present + s.tutorial_excused)::numeric / s.tutorial_total * 100, 1) else null end,
    'workshopRate', case when s.workshop_total > 0 then round((s.workshop_present + s.workshop_excused)::numeric / s.workshop_total * 100, 1) else null end,
    'adjustedTotal', s.adjusted_total,
    'attendedTotal', s.attended_total,
    'attendanceRate', s.attendance_rate
  ) order by m.code), '[]'::jsonb)
  into v_modules
  from attendance_summary s
  join modules m on m.id = s.module_id
  where s.student_id = p_student_id;

  return jsonb_build_object(
    'student', jsonb_build_object(
      'id', v_student.id,
      'rollNumber', v_student.roll_number,
      'fullName', v_student.full_name,
      'degreeId', v_student.degree_id,
      'year', v_student.year,
      'intakeBatch', v_student.intake_batch
    ),
    'overall', jsonb_build_object(
      'attendanceRate', v_overall_rate,
      'scholarshipZone', fn_scholarship_zone(v_overall_rate),
      'adjustedTotal', v_totals.adjusted_total,
      'scheduledTotal', v_totals.scheduled_total,
      'attendedTotal', v_totals.attended_total,
      'presentCount', v_totals.present_total,
      'excusedCount', v_totals.excused_total,
      'absentCount', v_totals.absent_total,
      'canceledCount', v_totals.scheduled_total - v_totals.adjusted_total,
      'ltw', jsonb_build_object(
        'lectureRate', case when v_totals.lecture_total > 0 then round(v_totals.lecture_present::numeric / v_totals.lecture_total * 100, 1) else 0 end,
        'tutorialRate', case when v_totals.tutorial_total > 0 then round(v_totals.tutorial_present::numeric / v_totals.tutorial_total * 100, 1) else 0 end,
        'workshopRate', case when v_totals.workshop_total > 0 then round(v_totals.workshop_present::numeric / v_totals.workshop_total * 100, 1) else 0 end
      )
    ),
    'modules', v_modules
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- fn_get_weekly_trend: attendance rate per ISO week, for the momentum line
-- graph. Scoped to one module when p_module_id is given, otherwise across all
-- of the student's modules.
-- -----------------------------------------------------------------------------
create or replace function fn_get_weekly_trend(p_student_id uuid, p_module_id uuid default null)
returns table (week_start date, attendance_rate numeric)
language sql stable security definer set search_path = public as $$
  select
    date_trunc('week', cs.scheduled_date)::date as week_start,
    round(
      100.0 * count(*) filter (where ar.status in ('PRESENT', 'EXCUSED'))
      / nullif(count(*), 0),
      1
    ) as attendance_rate
  from course_sessions cs
  join students st on st.id = p_student_id
  left join attendance_records ar
    on ar.session_id = cs.id and ar.student_id = p_student_id
  where cs.is_canceled = false
    and (cs.section_id is null or cs.section_id = st.section_id)
    and cs.module_id in (
      select m.id from modules m
      where m.degree_id = st.degree_id and m.year = st.year
        and (p_module_id is null or m.id = p_module_id)
    )
  group by 1
  order by 1;
$$;
