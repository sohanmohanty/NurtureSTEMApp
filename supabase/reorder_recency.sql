-- One-time: give existing rows a random baseline order under the new
-- recency sorting.
--
-- The admin Students / Assignments / Hour Logs pages now sort by
-- updated_at (newest first). The legacy import wrote rows volunteer-by-
-- volunteer, so raw timestamps would show volunteer-clustered blocks.
-- This script rewrites updated_at on existing rows in RANDOM order, so
-- the lists look shuffled — while anything added or changed from now on
-- jumps to the top.
--
-- Safe to run once in the Supabase SQL Editor (run the whole file at
-- once). It only touches updated_at; created_at and all real data are
-- untouched. The set_updated_at triggers are disabled during the
-- rewrite because they would otherwise overwrite the values with now().

begin;

alter table public.students disable trigger students_updated_at;
with ranked as (
  select id, row_number() over (order by random()) as rn
  from public.students
)
update public.students s
set updated_at = now() - interval '30 days' + make_interval(secs => r.rn)
from ranked r
where r.id = s.id;
alter table public.students enable trigger students_updated_at;

alter table public.assignments disable trigger assignments_updated_at;
with ranked as (
  select id, row_number() over (order by random()) as rn
  from public.assignments
)
update public.assignments a
set updated_at = now() - interval '30 days' + make_interval(secs => r.rn)
from ranked r
where r.id = a.id;
alter table public.assignments enable trigger assignments_updated_at;

alter table public.hour_logs disable trigger hour_logs_updated_at;
with ranked as (
  select id, row_number() over (order by random()) as rn
  from public.hour_logs
)
update public.hour_logs h
set updated_at = now() - interval '30 days' + make_interval(secs => r.rn)
from ranked r
where r.id = h.id;
alter table public.hour_logs enable trigger hour_logs_updated_at;

commit;

-- Sanity check: should come back in a shuffled (non-clustered) order.
select display_name, updated_at
from public.students
order by updated_at desc
limit 10;
