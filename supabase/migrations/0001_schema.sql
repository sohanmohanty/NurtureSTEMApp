create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  role text not null default 'volunteer' check (role in ('admin', 'volunteer', 'advisor')),
  setup_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 80),
  level text not null check (level in ('Elementary', 'Middle School')),
  grade_num int check (grade_num between 1 and 8),
  subject_focus text not null check (subject_focus in ('Math', 'Science', 'Algebra', 'Geometry', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'General STEM')),
  status text not null default 'Waitlisted' check (status in ('Waitlisted', 'Matched', 'Active', 'Paused', 'Completed')),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.volunteers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 200),
  grade_level int check (grade_level between 9 and 12),
  subject_strengths text[] not null default '{}',
  max_capacity int not null default 3 check (max_capacity between 0 and 20),
  active_status boolean not null default true,
  training_status text not null default 'Not Started' check (training_status in ('Not Started', 'In Progress', 'Complete')),
  availability_note text check (char_length(availability_note) <= 200),
  admin_note text check (char_length(admin_note) <= 300),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  status text not null default 'Active' check (status in ('Active', 'Ended')),
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index assignments_active_unique
  on public.assignments (student_id, volunteer_id)
  where status = 'Active';

create table public.hour_logs (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  duration_minutes int not null check (duration_minutes between 5 and 480),
  subject_category text not null check (subject_category in ('Math', 'Science', 'Algebra', 'Geometry', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'General STEM')),
  short_summary text check (char_length(short_summary) <= 200),
  approval_status text not null default 'Pending' check (approval_status in ('Pending', 'Approved', 'Rejected')),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.training_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 150),
  description text check (char_length(description) <= 300),
  required boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.volunteer_training_progress (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  training_item_id uuid not null references public.training_items(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (volunteer_id, training_item_id)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 150),
  subject text not null check (subject in ('Math', 'Science', 'Algebra', 'Geometry', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'General STEM')),
  level text not null default 'All Levels' check (level in ('Elementary', 'Middle School', 'All Levels')),
  resource_type text not null check (resource_type in ('Worksheet', 'Slide Deck', 'Lesson Plan', 'Activity', 'External Link')),
  url text not null check (char_length(url) <= 500),
  description text check (char_length(description) <= 300),
  created_by uuid references public.profiles(id) on delete set null,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_contacts (
  student_id uuid primary key references public.students(id) on delete cascade,
  email text not null check (char_length(email) <= 200),
  created_at timestamptz not null default now()
);

create table public.app_settings (
  id int primary key default 1 check (id = 1),
  public_page_enabled boolean not null default true,
  mission_statement text not null default 'NurtureSTEM is a student-led STEM education initiative where high-school volunteers help elementary and middle-school students build confidence in math and science.',
  program_start_year int not null default 2024,
  announcement text check (char_length(announcement) <= 500),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (1);

create or replace function public.my_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.profiles where user_id = auth.uid();
$$;

create or replace function public.my_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where user_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.my_role() = 'admin', false);
$$;

create or replace function public.my_volunteer_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select v.id
  from public.volunteers v
  join public.profiles p on p.id = v.profile_id
  where p.user_id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger students_updated_at before update on public.students
  for each row execute function public.set_updated_at();
create trigger volunteers_updated_at before update on public.volunteers
  for each row execute function public.set_updated_at();
create trigger assignments_updated_at before update on public.assignments
  for each row execute function public.set_updated_at();
create trigger hour_logs_updated_at before update on public.hour_logs
  for each row execute function public.set_updated_at();
create trigger training_items_updated_at before update on public.training_items
  for each row execute function public.set_updated_at();
create trigger resources_updated_at before update on public.resources
  for each row execute function public.set_updated_at();

create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and auth.uid() is not null
    and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard before update on public.profiles
  for each row execute function public.prevent_role_self_change();

create or replace function public.protect_volunteer_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if coalesce(current_setting('app.bypass_volunteer_guard', true), 'off') = 'on' then
    return new;
  end if;
  if new.profile_id is distinct from old.profile_id
    or new.name is distinct from old.name
    or new.email is distinct from old.email
    or new.grade_level is distinct from old.grade_level
    or new.max_capacity is distinct from old.max_capacity
    or new.training_status is distinct from old.training_status
    or new.admin_note is distinct from old.admin_note
    or new.archived is distinct from old.archived then
    raise exception 'Only admins can change these volunteer fields';
  end if;
  return new;
end;
$$;

create trigger volunteers_column_guard before update on public.volunteers
  for each row execute function public.protect_volunteer_columns();

create or replace function public.claim_or_create_volunteer(
  p_name text,
  p_grade_level int,
  p_subjects text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller record;
  existing_id uuid;
begin
  select * into caller from public.profiles where user_id = auth.uid();
  if caller is null then
    raise exception 'Not authenticated';
  end if;
  if caller.role not in ('admin', 'volunteer') then
    return null;
  end if;
  perform set_config('app.bypass_volunteer_guard', 'on', true);
  select id into existing_id
    from public.volunteers where profile_id = caller.id;
  if existing_id is not null then
    return existing_id;
  end if;
  select id into existing_id
    from public.volunteers
    where profile_id is null and lower(email) = lower(caller.email)
    limit 1;
  if existing_id is not null then
    update public.volunteers
      set profile_id = caller.id,
          name = p_name,
          grade_level = p_grade_level,
          subject_strengths = p_subjects
      where id = existing_id;
    return existing_id;
  end if;
  insert into public.volunteers
    (profile_id, name, email, grade_level, subject_strengths)
  values
    (caller.id, p_name, caller.email, p_grade_level, p_subjects)
  returning id into existing_id;
  return existing_id;
end;
$$;

create or replace function public.recompute_training_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_volunteer uuid;
  required_total int;
  required_done int;
  any_done int;
  new_status text;
begin
  target_volunteer := coalesce(new.volunteer_id, old.volunteer_id);
  perform set_config('app.bypass_volunteer_guard', 'on', true);
  select count(*) into required_total
    from public.training_items where required = true;
  select count(*) into required_done
    from public.volunteer_training_progress vtp
    join public.training_items ti on ti.id = vtp.training_item_id
    where vtp.volunteer_id = target_volunteer
      and vtp.completed = true
      and ti.required = true;
  select count(*) into any_done
    from public.volunteer_training_progress
    where volunteer_id = target_volunteer and completed = true;
  if required_total > 0 and required_done >= required_total then
    new_status := 'Complete';
  elsif any_done > 0 then
    new_status := 'In Progress';
  else
    new_status := 'Not Started';
  end if;
  update public.volunteers
    set training_status = new_status
    where id = target_volunteer;
  return coalesce(new, old);
end;
$$;

create trigger training_progress_recompute
  after insert or update or delete on public.volunteer_training_progress
  for each row execute function public.recompute_training_status();

create or replace function public.get_program_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  caller_role text;
  result jsonb;
begin
  caller_role := public.my_role();
  if caller_role not in ('admin', 'advisor') then
    raise exception 'Not authorized';
  end if;
  select jsonb_build_object(
    'total_students', (select count(*) from students where archived = false),
    'active_students', (select count(*) from students where archived = false and status = 'Active'),
    'waitlisted_students', (select count(*) from students where archived = false and status = 'Waitlisted'),
    'total_volunteers', (select count(*) from volunteers where archived = false),
    'active_volunteers', (select count(*) from volunteers where archived = false and active_status = true),
    'approved_minutes', (select coalesce(sum(duration_minutes), 0) from hour_logs where approval_status = 'Approved'),
    'pending_logs', (select count(*) from hour_logs where approval_status = 'Pending'),
    'total_logs', (select count(*) from hour_logs),
    'active_assignments', (select count(*) from assignments where status = 'Active'),
    'resources_count', (select count(*) from resources where archived = false),
    'avg_approved_minutes_per_volunteer', (
      select coalesce(round(avg(total)), 0) from (
        select sum(duration_minutes) as total
        from hour_logs
        where approval_status = 'Approved'
        group by volunteer_id
      ) totals
    ),
    'students_by_subject', (
      select coalesce(jsonb_object_agg(subject_focus, cnt), '{}'::jsonb)
      from (select subject_focus, count(*) as cnt from students where archived = false group by subject_focus) s
    ),
    'students_by_status', (
      select coalesce(jsonb_object_agg(status, cnt), '{}'::jsonb)
      from (select status, count(*) as cnt from students where archived = false group by status) s
    ),
    'volunteers_by_subject', (
      select coalesce(jsonb_object_agg(subject, cnt), '{}'::jsonb)
      from (
        select unnest(subject_strengths) as subject, count(*) as cnt
        from volunteers
        where archived = false
        group by 1
      ) v
    )
  ) into result;
  return result;
end;
$$;

create or replace function public.get_public_impact_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  settings record;
begin
  select * into settings from app_settings where id = 1;
  if settings is null or settings.public_page_enabled = false then
    return jsonb_build_object('enabled', false);
  end if;
  return jsonb_build_object(
    'enabled', true,
    'students_reached', (select count(*) from students),
    'volunteer_tutors', (select count(*) from volunteers where archived = false),
    'approved_minutes', (select coalesce(sum(duration_minutes), 0) from hour_logs where approval_status = 'Approved'),
    'subjects_supported', (
      select coalesce(jsonb_agg(distinct subject_focus), '[]'::jsonb)
      from students
    ),
    'program_start_year', settings.program_start_year,
    'mission_statement', settings.mission_statement
  );
end;
$$;

revoke execute on function public.get_program_stats() from anon;
grant execute on function public.get_public_impact_stats() to anon;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.volunteers enable row level security;
alter table public.assignments enable row level security;
alter table public.hour_logs enable row level security;
alter table public.training_items enable row level security;
alter table public.volunteer_training_progress enable row level security;
alter table public.resources enable row level security;
alter table public.student_contacts enable row level security;
alter table public.app_settings enable row level security;

create policy profiles_select_own on public.profiles
  for select using (user_id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update using (user_id = auth.uid() or public.is_admin());

create policy students_admin_all on public.students
  for all using (public.is_admin()) with check (public.is_admin());
create policy students_volunteer_assigned on public.students
  for select using (
    exists (
      select 1 from public.assignments a
      where a.student_id = students.id
        and a.volunteer_id = public.my_volunteer_id()
    )
  );

create policy volunteers_admin_all on public.volunteers
  for all using (public.is_admin()) with check (public.is_admin());
create policy volunteers_select_own on public.volunteers
  for select using (profile_id = public.my_profile_id());
create policy volunteers_update_own on public.volunteers
  for update using (profile_id = public.my_profile_id())
  with check (profile_id = public.my_profile_id());

create policy assignments_admin_all on public.assignments
  for all using (public.is_admin()) with check (public.is_admin());
create policy assignments_select_own on public.assignments
  for select using (volunteer_id = public.my_volunteer_id());

create policy hour_logs_admin_all on public.hour_logs
  for all using (public.is_admin()) with check (public.is_admin());
create policy hour_logs_select_own on public.hour_logs
  for select using (volunteer_id = public.my_volunteer_id());
create policy hour_logs_insert_own on public.hour_logs
  for insert with check (
    volunteer_id = public.my_volunteer_id()
    and approval_status = 'Pending'
    and approved_by is null
  );

create policy training_items_read on public.training_items
  for select using (auth.uid() is not null);
create policy training_items_admin_write on public.training_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy training_progress_admin_all on public.volunteer_training_progress
  for all using (public.is_admin()) with check (public.is_admin());
create policy training_progress_select_own on public.volunteer_training_progress
  for select using (volunteer_id = public.my_volunteer_id());
create policy training_progress_insert_own on public.volunteer_training_progress
  for insert with check (volunteer_id = public.my_volunteer_id());
create policy training_progress_update_own on public.volunteer_training_progress
  for update using (volunteer_id = public.my_volunteer_id())
  with check (volunteer_id = public.my_volunteer_id());

create policy resources_read on public.resources
  for select using (auth.uid() is not null and (archived = false or public.is_admin()));
create policy resources_admin_write on public.resources
  for insert with check (public.is_admin());
create policy resources_admin_update on public.resources
  for update using (public.is_admin()) with check (public.is_admin());
create policy resources_admin_delete on public.resources
  for delete using (public.is_admin());

create policy student_contacts_admin_only on public.student_contacts
  for all using (public.is_admin()) with check (public.is_admin());

create policy settings_read on public.app_settings
  for select using (auth.uid() is not null);
create policy settings_admin_update on public.app_settings
  for update using (public.is_admin()) with check (public.is_admin());
