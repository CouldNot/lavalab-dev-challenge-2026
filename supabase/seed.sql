insert into public.farms (id, name, timezone) values ('10000000-0000-0000-0000-000000000001', 'Bays Ranch', 'America/Los_Angeles');

insert into public.employees (id, farm_id, name, is_active) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Isaac Wang',true),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Maya Patel',true),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','Liam Johnson',true),
('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Sophia Lee',true),
('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','Ethan Kim',true),
('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','Olivia Martinez',true),
('20000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','Noah Brown',true),
('20000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','Emma Davis',true),
('20000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000001','James Wilson',true),
('20000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000001','Isabella Garcia',true),
('20000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001','Benjamin Moore',true),
('20000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000001','Ava Thompson',true);

insert into public.fields (id, farm_id, name, latitude, longitude)
select ('30000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
       '10000000-0000-0000-0000-000000000001', 'FIELD ' || chr(64+n),
       36.7378 + n * .004, -119.7871 + n * .004
from generate_series(1,11) n;

insert into public.activity_logs (id, farm_id, employee_id, field_id, activity_type, started_at, ended_at, transcript, summary, response_accuracy, review_status, ingested_at) values
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Spraying','2026-04-19 06:00:00-07','2026-04-19 10:40:00-07','Offline guided voice log created at 2026-04-08T22:01:01.711Z. Question (activity_type): What type of activity was this — spraying, fertilizing, planting, irrigating, harvesting, scouting, pruning, soil work, or equipment maintenance? Answer: I am leaving first, I am going to go home. Question (field_block): Where were you working (field, block, or area)? Answer: yes, in one part and then 130 and 200 yes, and 130 for uh 160 and no, this yes no, no, uhm no no I remember, uhm uhm uhm, no, I do not remember anything.','Offline guided voice log created at 2026-04-08T22:01:01.711Z. Spraying work was recorded for Field A.',90,'new',now()),
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','Harvesting','2026-04-20 07:30:00-07','2026-04-20 11:15:00-07','Guided voice log for Maya Patel.','Maya Patel completed harvesting work in Field B.',90,'reviewed',now()),
('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','Planting','2026-04-21 08:00:00-07','2026-04-21 12:00:00-07','Guided voice log for Liam Johnson.','Liam Johnson completed planting work in Field C.',90,'reviewed',now()),
('40000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000004','Irrigation','2026-04-22 06:30:00-07','2026-04-22 09:30:00-07','Guided voice log for Sophia Lee.','Sophia Lee completed irrigation work in Field D.',90,'reviewed',now()),
('40000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000005','Fertilizing','2026-04-23 05:45:00-07','2026-04-23 09:00:00-07','Guided voice log for Ethan Kim.','Ethan Kim completed fertilizing work in Field E.',90,'reviewed',now()),
('40000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000006','Weeding','2026-04-24 06:15:00-07','2026-04-24 10:00:00-07','Guided voice log for Olivia Martinez.','Olivia Martinez completed weeding work in Field F.',90,'reviewed',now() - interval '1 day'),
('40000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000007','Pruning','2026-04-25 07:00:00-07','2026-04-25 11:30:00-07','Guided voice log for Noah Brown.','Noah Brown completed pruning work in Field G.',90,'reviewed',now() - interval '1 day'),
('40000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000008','Monitoring','2026-04-26 08:15:00-07','2026-04-26 12:45:00-07','Guided voice log for Emma Davis.','Emma Davis completed monitoring work in Field H.',90,'reviewed',now() - interval '1 day'),
('40000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000009','Soil Testing','2026-04-27 06:00:00-07','2026-04-27 09:00:00-07','Guided voice log for James Wilson.','James Wilson completed soil testing in Field I.',90,'reviewed',now() - interval '1 day'),
('40000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000010','Seeding','2026-04-28 07:45:00-07','2026-04-28 11:00:00-07','Guided voice log for Isabella Garcia.','Isabella Garcia completed seeding work in Field J.',90,'reviewed',now() - interval '1 day'),
('40000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000011','30000000-0000-0000-0000-000000000011','Pest Control','2026-04-29 06:30:00-07','2026-04-29 10:30:00-07','Guided voice log for Benjamin Moore.','Benjamin Moore completed pest control work in Field K.',90,'reviewed',now() - interval '1 day');

insert into public.recordings (activity_log_id, duration_seconds, waveform_peaks)
select id, 48, '[7,11,7,7,11,7,14,7,35,81,35,7,9,7,11,7,44,11,18,7,11,7,16,7,11,7,35,7,11,7,11,7,25,11,9,7,11,7,11,7,25,7,63,7,11,7,11,7,51,11,25,7,11,7,25,7,12,7,26,7,11,7,11,7,35,11,14,7,11,7,9,7,12,7,49,7,11,7,11,7,44,11,18,7,11,7,40,7,11,7,21,7,11,7,11,7]'::jsonb
from public.activity_logs;

update public.activity_logs
set reviewed_at = ingested_at - interval '15 minutes',
    review_note = case when id = '40000000-0000-0000-0000-000000000002'::uuid then 'Verify the harvest count before payroll is finalized.' else null end
where review_status in ('reviewed', 'flagged');
