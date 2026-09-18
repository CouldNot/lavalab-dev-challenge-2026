begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

select has_table('public', 'farms', 'farms table exists');
select has_table('public', 'activity_logs', 'activity logs table exists');
select has_table('public', 'recordings', 'recordings table exists');
select has_table('public', 'tags', 'tags table exists');
select has_table('public', 'activity_log_review_events', 'review audit table exists');
select col_is_pk('public', 'farms', 'id', 'farms use a stable uuid primary key');
select col_is_fk('public', 'activity_logs', 'farm_id', 'activity logs belong to farms');
select col_is_fk('public', 'recordings', 'activity_log_id', 'recordings belong to logs');
select ok((select relrowsecurity from pg_class where oid = 'public.activity_logs'::regclass), 'RLS is enabled on activity logs');
select ok((select relrowsecurity from pg_class where oid = 'public.tags'::regclass), 'RLS is enabled on tags');
select ok((select relrowsecurity from pg_class where oid = 'public.activity_log_review_events'::regclass), 'RLS is enabled on review audit events');
select ok(exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'activity_logs' and policyname = 'members read logs'), 'member read policy exists');
select ok(exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'tags' and policyname = 'managers create tags'), 'manager insert policy exists');
select ok(exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'activity_log_review_events' and policyname = 'members read review history'), 'review history is farm-scoped');
select has_function('public', 'review_activity_log', array['uuid', 'review_status', 'text'], 'review transition function exists');
select is((select proacl is not null from pg_proc where oid = 'public.review_activity_log(uuid, public.review_status, text)'::regprocedure), true, 'review function has explicit access controls');
select is((select count(*)::integer from public.employees where farm_id = '10000000-0000-0000-0000-000000000001'), 12, 'seed contains twelve active workers');

select * from finish();
rollback;
