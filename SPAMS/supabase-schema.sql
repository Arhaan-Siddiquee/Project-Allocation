-- ============================================================
-- ProjectHub — Complete Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. STUDENT PROFILES TABLE
create table if not exists student_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text,
  department text,
  roll_number text,
  bio text default '',
  github text default '',
  linkedin text default '',
  skills text[] default '{}',
  strongholds text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. FACULTY PROFILES TABLE
create table if not exists faculty_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text,
  department text,
  designation text,
  bio text default '',
  research_areas text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PROJECTS TABLE
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid references faculty_profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  detailed_description text default '',
  domain text not null,
  required_skills text[] default '{}',
  max_students integer default 1,
  status text default 'open' check (status in ('open', 'closed', 'completed')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. APPLICATIONS TABLE
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  faculty_id uuid references faculty_profiles(id) on delete cascade not null,
  cover_letter text default '',
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, project_id)
);

-- 5. MILESTONES TABLE
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text default '',
  due_date date,
  completed boolean default false,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table student_profiles enable row level security;
alter table faculty_profiles enable row level security;
alter table projects enable row level security;
alter table applications enable row level security;
alter table milestones enable row level security;

-- STUDENT PROFILES POLICIES
create policy "Students can view all student profiles"
  on student_profiles for select using (true);

create policy "Students can insert their own profile"
  on student_profiles for insert with check (auth.uid() = id);

create policy "Students can update their own profile"
  on student_profiles for update using (auth.uid() = id);

-- FACULTY PROFILES POLICIES
create policy "Anyone can view faculty profiles"
  on faculty_profiles for select using (true);

create policy "Faculty can insert their own profile"
  on faculty_profiles for insert with check (auth.uid() = id);

create policy "Faculty can update their own profile"
  on faculty_profiles for update using (auth.uid() = id);

-- PROJECTS POLICIES
create policy "Anyone can view open projects"
  on projects for select using (true);

create policy "Faculty can create projects"
  on projects for insert with check (
    auth.uid() = faculty_id
  );

create policy "Faculty can update their own projects"
  on projects for update using (auth.uid() = faculty_id);

create policy "Faculty can delete their own projects"
  on projects for delete using (auth.uid() = faculty_id);

-- APPLICATIONS POLICIES
create policy "Students can view their own applications"
  on applications for select using (
    auth.uid() = student_id or auth.uid() = faculty_id
  );

create policy "Students can create applications"
  on applications for insert with check (auth.uid() = student_id);

create policy "Faculty can update applications for their projects"
  on applications for update using (auth.uid() = faculty_id);

-- MILESTONES POLICIES
create policy "Anyone can view milestones"
  on milestones for select using (true);

create policy "Faculty can manage milestones for their projects"
  on milestones for insert with check (
    auth.uid() in (select faculty_id from projects where id = project_id)
  );

create policy "Faculty can update milestones"
  on milestones for update using (
    auth.uid() in (select faculty_id from projects where id = project_id)
  );

create policy "Faculty can delete milestones"
  on milestones for delete using (
    auth.uid() in (select faculty_id from projects where id = project_id)
  );

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger student_profiles_updated_at
  before update on student_profiles
  for each row execute function handle_updated_at();

create trigger faculty_profiles_updated_at
  before update on faculty_profiles
  for each row execute function handle_updated_at();

create trigger projects_updated_at
  before update on projects
  for each row execute function handle_updated_at();

create trigger applications_updated_at
  before update on applications
  for each row execute function handle_updated_at();

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
