-- A review decision is an operational event, not just a UI preference. Keep the
-- current decision on the log and retain an immutable, tenant-scoped history.
alter table public.activity_logs
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references auth.users(id) on delete set null,
  add column review_note text check (char_length(review_note) <= 500);

create table public.activity_log_review_events (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  activity_log_id uuid not null references public.activity_logs(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete restrict,
  before_state jsonb not null check (jsonb_typeof(before_state) = 'object'),
  after_state jsonb not null check (jsonb_typeof(after_state) = 'object'),
  created_at timestamptz not null default now()
);

create index activity_log_review_events_log_created_idx
  on public.activity_log_review_events (activity_log_id, created_at desc);

alter table public.activity_log_review_events enable row level security;
revoke all on public.activity_log_review_events from anon, authenticated;
grant select on public.activity_log_review_events to authenticated;

create policy "members read review history" on public.activity_log_review_events
  for select to authenticated using (private.is_farm_member(farm_id));

create or replace function public.review_activity_log(
  p_log_id uuid,
  p_status public.review_status,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_log public.activity_logs%rowtype;
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_before jsonb;
  v_after jsonb;
begin
  select * into v_log
  from public.activity_logs
  where id = p_log_id
  for update;

  if not found then
    raise exception 'Activity log not found' using errcode = 'P0002';
  end if;

  if not private.can_manage_farm(v_log.farm_id) then
    raise exception 'You do not have permission to review this recording' using errcode = '42501';
  end if;

  if char_length(coalesce(v_note, '')) > 500 then
    raise exception 'Review note must be 500 characters or fewer' using errcode = '22001';
  end if;

  v_before := jsonb_build_object(
    'review_status', v_log.review_status,
    'reviewed_at', v_log.reviewed_at,
    'reviewed_by', v_log.reviewed_by,
    'review_note', v_log.review_note
  );

  update public.activity_logs
  set review_status = p_status,
      reviewed_at = case when p_status = 'new' then null else now() end,
      reviewed_by = case when p_status = 'new' then null else auth.uid() end,
      review_note = case when p_status = 'new' then null else v_note end
  where id = p_log_id
  returning jsonb_build_object(
    'review_status', review_status,
    'reviewed_at', reviewed_at,
    'reviewed_by', reviewed_by,
    'review_note', review_note
  ) into v_after;

  insert into public.activity_log_review_events (
    farm_id, activity_log_id, actor_id, before_state, after_state
  ) values (
    v_log.farm_id, p_log_id, auth.uid(), v_before, v_after
  );

  return v_after;
end;
$$;

revoke all on function public.review_activity_log(uuid, public.review_status, text) from public;
grant execute on function public.review_activity_log(uuid, public.review_status, text) to authenticated;

create or replace view public.activity_log_details
with (security_invoker = true)
as
select l.id, l.farm_id, e.name as employee_name, l.activity_type, l.started_at, l.ended_at,
       f.name as field_name, l.transcript, l.summary, l.response_accuracy,
       r.storage_path, coalesce(r.waveform_peaks, '[]'::jsonb) as waveform_peaks,
       f.latitude, f.longitude,
       coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color) order by t.name)
                 from public.activity_log_tags alt join public.tags t on t.id = alt.tag_id
                 where alt.activity_log_id = l.id), '[]'::jsonb) as tags,
       l.review_status, l.reviewed_at, l.review_note
from public.activity_logs l
join public.employees e on e.id = l.employee_id
join public.fields f on f.id = l.field_id
left join public.recordings r on r.activity_log_id = l.id;
