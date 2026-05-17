create extension if not exists "pgcrypto";

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null,
  employee_name text not null,
  work_date date not null,
  shift_name text not null default 'Ca hành chính',
  scheduled_start time not null default '08:00',
  scheduled_end time not null default '17:30',
  check_in_at timestamptz,
  check_out_at timestamptz,
  check_in_lat numeric(10, 7),
  check_in_lng numeric(10, 7),
  check_out_lat numeric(10, 7),
  check_out_lng numeric(10, 7),
  last_lat numeric(10, 7),
  last_lng numeric(10, 7),
  location_accuracy_m numeric(10, 2),
  location_captured_at timestamptz,
  status text not null default 'not_checked_in'
    check (status in ('not_checked_in', 'working', 'checked_out')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_records_employee_day_key unique (employee_id, work_date)
);

create index if not exists attendance_records_work_date_idx
  on public.attendance_records (work_date desc);

create index if not exists attendance_records_employee_date_idx
  on public.attendance_records (employee_id, work_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_attendance_records_updated_at on public.attendance_records;

create trigger set_attendance_records_updated_at
before update on public.attendance_records
for each row
execute function public.set_updated_at();

alter table public.attendance_records enable row level security;

drop policy if exists "demo attendance read" on public.attendance_records;
create policy "demo attendance read"
on public.attendance_records
for select
to anon, authenticated
using (true);

drop policy if exists "demo attendance insert" on public.attendance_records;
create policy "demo attendance insert"
on public.attendance_records
for insert
to anon, authenticated
with check (true);

drop policy if exists "demo attendance update" on public.attendance_records;
create policy "demo attendance update"
on public.attendance_records
for update
to anon, authenticated
using (true)
with check (true);

-- Courses table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text not null,
  level text not null check (level in ('Cơ bản', 'Trung cấp', 'Nâng cao')),
  description text,
  assigned_roles text[] default '{}',
  assigned_users text[] default '{}',
  kpi_lead_eligible boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_department_idx on public.courses (department);

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

alter table public.courses enable row level security;

drop policy if exists "courses read" on public.courses;
create policy "courses read"
on public.courses for select
to anon, authenticated
using (true);

drop policy if exists "courses write" on public.courses;
create policy "courses write"
on public.courses for all
to anon, authenticated
using (true)
with check (true);

-- Lessons table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  type text not null check (type in ('video', 'document')),
  content_url text,
  video_url text,
  duration integer not null default 0,
  document_pages integer,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lessons_course_id_idx on public.lessons (course_id, order_index);

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
before update on public.lessons
for each row
execute function public.set_updated_at();

alter table public.lessons enable row level security;

drop policy if exists "lessons read" on public.lessons;
create policy "lessons read"
on public.lessons for select
to anon, authenticated
using (true);

drop policy if exists "lessons write" on public.lessons;
create policy "lessons write"
on public.lessons for all
to anon, authenticated
using (true)
with check (true);

-- Progress table
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  percent integer not null default 0 check (percent >= 0 and percent <= 100),
  seconds_watched integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_progress_user_lesson_key unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_id_idx on public.lesson_progress (user_id);
create index if not exists lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row
execute function public.set_updated_at();

alter table public.lesson_progress enable row level security;

drop policy if exists "lesson_progress read" on public.lesson_progress;
create policy "lesson_progress read"
on public.lesson_progress for select
to anon, authenticated
using (true);

drop policy if exists "lesson_progress write" on public.lesson_progress;
create policy "lesson_progress write"
on public.lesson_progress for all
to anon, authenticated
using (true)
with check (true);

-- Enrollments table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'chưa học' check (status in ('chưa học', 'đang học', 'hoàn thành')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_user_course_key unique (user_id, course_id)
);

create index if not exists enrollments_user_id_idx on public.enrollments (user_id);
create index if not exists enrollments_course_id_idx on public.enrollments (course_id);

drop trigger if exists set_enrollments_updated_at on public.enrollments;
create trigger set_enrollments_updated_at
before update on public.enrollments
for each row
execute function public.set_updated_at();

alter table public.enrollments enable row level security;

drop policy if exists "enrollments read" on public.enrollments;
create policy "enrollments read"
on public.enrollments for select
to anon, authenticated
using (true);

drop policy if exists "enrollments write" on public.enrollments;
create policy "enrollments write"
on public.enrollments for all
to anon, authenticated
using (true)
with check (true);

-- Quizzes table
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quizzes_course_id_idx on public.quizzes (course_id);

drop trigger if exists set_quizzes_updated_at on public.quizzes;
create trigger set_quizzes_updated_at
before update on public.quizzes
for each row
execute function public.set_updated_at();

alter table public.quizzes enable row level security;

drop policy if exists "quizzes read" on public.quizzes;
create policy "quizzes read"
on public.quizzes for select
to anon, authenticated
using (true);

drop policy if exists "quizzes write" on public.quizzes;
create policy "quizzes write"
on public.quizzes for all
to anon, authenticated
using (true)
with check (true);

-- Questions table
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]',
  correct_answer integer not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists questions_quiz_id_idx on public.questions (quiz_id, order_index);

drop trigger if exists set_questions_updated_at on public.questions;
create trigger set_questions_updated_at
before update on public.questions
for each row
execute function public.set_updated_at();

alter table public.questions enable row level security;

drop policy if exists "questions read" on public.questions;
create policy "questions read"
on public.questions for select
to anon, authenticated
using (true);

drop policy if exists "questions write" on public.questions;
create policy "questions write"
on public.questions for all
to anon, authenticated
using (true)
with check (true);

-- Results table
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null default 0,
  passed boolean not null default false,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists results_user_id_idx on public.results (user_id);
create index if not exists results_quiz_id_idx on public.results (quiz_id);

alter table public.results enable row level security;

drop policy if exists "results read" on public.results;
create policy "results read"
on public.results for select
to anon, authenticated
using (true);

drop policy if exists "results write" on public.results;
create policy "results write"
on public.results for all
to anon, authenticated
using (true)
with check (true);

-- Employees table (for user management)
create table if not exists public.employees (
  id text primary key,
  name text not null,
  role text not null,
  department text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_employees_updated_at on public.employees;
create trigger set_employees_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

alter table public.employees enable row level security;

drop policy if exists "employees read" on public.employees;
create policy "employees read"
on public.employees for select
to anon, authenticated
using (true);

drop policy if exists "employees write" on public.employees;
create policy "employees write"
on public.employees for all
to anon, authenticated
using (true)
with check (true);

-- Recruitment jobs table
create table if not exists public.recruitment_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  quantity_needed integer not null default 1,
  quantity_hired integer not null default 0,
  status text not null default 'Đang mở' check (status in ('Đang mở', 'Tạm dừng', 'Đã đóng')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_recruitment_jobs_updated_at on public.recruitment_jobs;
create trigger set_recruitment_jobs_updated_at
before update on public.recruitment_jobs
for each row
execute function public.set_updated_at();

alter table public.recruitment_jobs enable row level security;

drop policy if exists "recruitment_jobs read" on public.recruitment_jobs;
create policy "recruitment_jobs read"
on public.recruitment_jobs for select
to anon, authenticated
using (true);

drop policy if exists "recruitment_jobs write" on public.recruitment_jobs;
create policy "recruitment_jobs write"
on public.recruitment_jobs for all
to anon, authenticated
using (true)
with check (true);

-- Candidates table
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  job_id uuid references public.recruitment_jobs(id) on delete set null,
  source text,
  stage text not null default 'new',
  notes text,
  cv_file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidates_job_id_idx on public.candidates (job_id);
create index if not exists candidates_stage_idx on public.candidates (stage);

drop trigger if exists set_candidates_updated_at on public.candidates;
create trigger set_candidates_updated_at
before update on public.candidates
for each row
execute function public.set_updated_at();

alter table public.candidates enable row level security;

drop policy if exists "candidates read" on public.candidates;
create policy "candidates read"
on public.candidates for select
to anon, authenticated
using (true);

drop policy if exists "candidates write" on public.candidates;
create policy "candidates write"
on public.candidates for all
to anon, authenticated
using (true)
with check (true);

-- App state snapshot for CRM screens that use local ids and nested UI state.
-- This keeps add/edit/interview data durable after refresh and across devices.
create table if not exists public.crm_app_state (
  id text primary key,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_crm_app_state_updated_at on public.crm_app_state;
create trigger set_crm_app_state_updated_at
before update on public.crm_app_state
for each row
execute function public.set_updated_at();

alter table public.crm_app_state enable row level security;

drop policy if exists "crm_app_state read" on public.crm_app_state;
create policy "crm_app_state read"
on public.crm_app_state for select
to anon, authenticated
using (true);

drop policy if exists "crm_app_state write" on public.crm_app_state;
create policy "crm_app_state write"
on public.crm_app_state for all
to anon, authenticated
using (true)
with check (true);
