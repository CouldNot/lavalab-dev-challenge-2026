create extension if not exists pgcrypto;

create type public.farm_role as enum ('owner', 'manager', 'worker');
create type public.review_status as enum ('new', 'reviewed', 'flagged');

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text
);

create table public.farm_memberships (
  farm_id uuid not null references public.farms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.farm_role not null default 'worker',
  primary key (farm_id, user_id)
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  avatar_url text,
  is_active boolean not null default true,
  unique (farm_id, name)
);

create table public.fields (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  unique (farm_id, name)
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  field_id uuid not null references public.fields(id) on delete restrict,
  activity_type text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  transcript text not null default '',
  summary text not null default '',
  response_accuracy smallint not null check (response_accuracy between 0 and 100),
  review_status public.review_status not null default 'new',
  ingested_at timestamptz not null default now(),
  check (ended_at > started_at)
);

create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  activity_log_id uuid not null unique references public.activity_logs(id) on delete cascade,
  storage_path text,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  waveform_peaks jsonb not null default '[]'::jsonb,
  check (jsonb_typeof(waveform_peaks) = 'array')
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  color text not null default '#146C44',
  unique (farm_id, name)
);

create table public.activity_log_tags (
  activity_log_id uuid not null references public.activity_logs(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (activity_log_id, tag_id)
);

create index activity_logs_farm_started_idx on public.activity_logs (farm_id, started_at desc);
create index activity_logs_employee_idx on public.activity_logs (employee_id);
create index activity_logs_field_idx on public.activity_logs (field_id);
create index employees_farm_active_idx on public.employees (farm_id, is_active);
create index memberships_user_idx on public.farm_memberships (user_id, farm_id);

create schema if not exists private;
revoke all on schema private from public;

create function private.is_farm_member(target_farm_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.farm_memberships
    where farm_id = target_farm_id and user_id = (select auth.uid())
  );
$$;

create function private.can_manage_farm(target_farm_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.farm_memberships
    where farm_id = target_farm_id
      and user_id = (select auth.uid())
      and role in ('owner', 'manager')
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_farm_member(uuid), private.can_manage_farm(uuid) to authenticated;

alter table public.farms enable row level security;
alter table public.profiles enable row level security;
alter table public.farm_memberships enable row level security;
alter table public.employees enable row level security;
alter table public.fields enable row level security;
alter table public.activity_logs enable row level security;
alter table public.recordings enable row level security;
alter table public.tags enable row level security;
alter table public.activity_log_tags enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.farms, public.profiles, public.farm_memberships, public.employees, public.fields, public.activity_logs, public.recordings, public.tags, public.activity_log_tags to authenticated;
grant insert, update, delete on public.tags, public.activity_log_tags to authenticated;

create policy "members read farms" on public.farms for select to authenticated using (private.is_farm_member(id));
create policy "users read own profile" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "members read memberships" on public.farm_memberships for select to authenticated using (private.is_farm_member(farm_id));
create policy "members read employees" on public.employees for select to authenticated using (private.is_farm_member(farm_id));
create policy "members read fields" on public.fields for select to authenticated using (private.is_farm_member(farm_id));
create policy "members read logs" on public.activity_logs for select to authenticated using (private.is_farm_member(farm_id));
create policy "members read recordings" on public.recordings for select to authenticated using (exists (select 1 from public.activity_logs l where l.id = activity_log_id and private.is_farm_member(l.farm_id)));
create policy "members read tags" on public.tags for select to authenticated using (private.is_farm_member(farm_id));
create policy "managers create tags" on public.tags for insert to authenticated with check (private.can_manage_farm(farm_id));
create policy "managers update tags" on public.tags for update to authenticated using (private.can_manage_farm(farm_id)) with check (private.can_manage_farm(farm_id));
create policy "managers delete tags" on public.tags for delete to authenticated using (private.can_manage_farm(farm_id));
create policy "members read log tags" on public.activity_log_tags for select to authenticated using (exists (select 1 from public.activity_logs l where l.id = activity_log_id and private.is_farm_member(l.farm_id)));
create policy "managers attach log tags" on public.activity_log_tags for insert to authenticated with check (
  created_by = (select auth.uid()) and
  exists (select 1 from public.activity_logs l where l.id = activity_log_id and private.can_manage_farm(l.farm_id)) and
  exists (select 1 from public.tags t join public.activity_logs l on l.farm_id = t.farm_id where t.id = tag_id and l.id = activity_log_id)
);
create policy "managers remove log tags" on public.activity_log_tags for delete to authenticated using (exists (select 1 from public.activity_logs l where l.id = activity_log_id and private.can_manage_farm(l.farm_id)));

create view public.activity_log_details
with (security_invoker = true)
as
select l.id, l.farm_id, e.name as employee_name, l.activity_type, l.started_at, l.ended_at,
       f.name as field_name, l.transcript, l.summary, l.response_accuracy,
       r.storage_path, coalesce(r.waveform_peaks, '[]'::jsonb) as waveform_peaks,
       f.latitude, f.longitude,
       coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color) order by t.name)
                 from public.activity_log_tags alt join public.tags t on t.id = alt.tag_id
                 where alt.activity_log_id = l.id), '[]'::jsonb) as tags
from public.activity_logs l
join public.employees e on e.id = l.employee_id
join public.fields f on f.id = l.field_id
left join public.recordings r on r.activity_log_id = l.id;

create view public.dashboard_metrics
with (security_invoker = true)
as
select f.id as farm_id,
       (select count(*) from public.activity_logs l where l.farm_id = f.id and l.ingested_at >= date_trunc('day', now()))::integer as todays_recordings,
       (select count(*) from public.activity_logs l where l.farm_id = f.id and l.review_status = 'new' and l.ingested_at >= date_trunc('day', now()))::integer as new_recordings,
       (select count(*) from public.employees e where e.farm_id = f.id and e.is_active)::integer as active_workers,
       coalesce((select round(avg(l.response_accuracy))::integer from public.activity_logs l where l.farm_id = f.id), 0) as response_accuracy
from public.farms f;

grant select on public.activity_log_details, public.dashboard_metrics to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recordings', 'recordings', false, 20971520, array['audio/mpeg', 'audio/wav', 'audio/mp4'])
on conflict (id) do nothing;

create policy "farm members read recording objects" on storage.objects for select to authenticated using (
  bucket_id = 'recordings' and private.is_farm_member((storage.foldername(name))[1]::uuid)
);
create policy "farm managers upload recording objects" on storage.objects for insert to authenticated with check (
  bucket_id = 'recordings' and private.can_manage_farm((storage.foldername(name))[1]::uuid)
);
