-- NurtureSTEM Ops — offline backup export
--
-- HOW TO USE (Supabase Dashboard -> SQL Editor):
--   1. Paste ONE query at a time (the editor only shows results for the
--      last statement, so running the whole file at once won't work).
--   2. Set the row-limit dropdown (next to Run) to "No limit" — the
--      default of 100 rows would silently truncate the CSV.
--      Then click Run and use "Export" / "Download CSV" on the results.
--   3. Save each file with the suggested name into a private folder
--      (e.g. a "NurtureSTEM Backup <date>" folder in your Google Drive).
--
-- The CSVs contain real student and volunteer names/emails.
-- Keep them OUT of the git repo and any public location.

-- ============================================================
-- 1. students.csv
-- (Note: the student_contacts table from the schema file was never
--  created in the live database, so there are no contact emails to export.)
-- ============================================================
select
  s.id,
  s.display_name,
  s.level,
  s.grade_num,
  s.subject_focus,
  s.status,
  s.archived,
  s.created_at
from public.students s
order by s.display_name;

-- ============================================================
-- 2. volunteers.csv
-- ============================================================
select
  v.id,
  v.name,
  v.email,
  v.grade_level,
  array_to_string(v.subject_strengths, '; ') as subject_strengths,
  v.max_capacity,
  v.active_status,
  v.training_status,
  v.availability_note,
  v.admin_note,
  v.archived,
  v.created_at
from public.volunteers v
order by v.name;

-- ============================================================
-- 3. assignments.csv  (student/volunteer names instead of ids)
-- ============================================================
select
  a.id,
  s.display_name as student,
  v.name as volunteer,
  a.status,
  a.start_date,
  a.end_date
from public.assignments a
join public.students s on s.id = a.student_id
join public.volunteers v on v.id = a.volunteer_id
order by v.name, s.display_name;

-- ============================================================
-- 4. hour_logs.csv
-- ============================================================
select
  h.id,
  v.name as volunteer,
  s.display_name as student,
  h.duration_minutes,
  round(h.duration_minutes / 60.0, 2) as hours,
  h.subject_category,
  h.short_summary,
  h.approval_status,
  p.name as approved_by,
  h.created_at
from public.hour_logs h
join public.volunteers v on v.id = h.volunteer_id
left join public.students s on s.id = h.student_id
left join public.profiles p on p.id = h.approved_by
order by v.name, h.created_at;

-- ============================================================
-- 5. training_progress.csv
-- ============================================================
select
  v.name as volunteer,
  ti.title as training_item,
  ti.required,
  vtp.completed,
  vtp.completed_at
from public.volunteer_training_progress vtp
join public.volunteers v on v.id = vtp.volunteer_id
join public.training_items ti on ti.id = vtp.training_item_id
order by v.name, ti.sort_order;

-- ============================================================
-- 6. resources.csv
-- ============================================================
select
  r.title,
  r.subject,
  r.level,
  r.resource_type,
  r.url,
  r.description,
  r.archived,
  r.created_at
from public.resources r
order by r.subject, r.title;

-- ============================================================
-- 7. profiles.csv  (app accounts and roles)
-- ============================================================
select
  p.name,
  p.email,
  p.role,
  p.created_at
from public.profiles p
order by p.role, p.name;

-- ============================================================
-- 8. sanity check — expected: 109 students, 17 tutors, 659.0 approved hours
-- ============================================================
select
  (select count(*) from public.students) as students,
  (select count(*) from public.volunteers where archived = false) as volunteers,
  (select round(coalesce(sum(duration_minutes), 0) / 60.0, 1)
     from public.hour_logs where approval_status = 'Approved') as approved_hours;
