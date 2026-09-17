import type { ActivityLog } from "@/lib/types";

const transcript = `"Offline guided voice log created at 2026-04-08T22:01:01.711Z. Question (activity_type): What type of activity was this — spraying, fertilizing, planting, irrigating, harvesting, scouting, pruning, soil work, or equipment maintenance? Answer: I'm leaving first, I'm going to go home. Question (field_block): Where were you working (field, block, or area)? Answer: yes, in one part and then 130 and 200 yes, and 130 for uh 160 and no, this yes no, no, uhm no no I remember, uhm uhm uhm, no, I don't remember anything.`;

const waveform = [7,11,7,7,11,7,14,7,35,81,35,7,9,7,11,7,44,11,18,7,11,7,16,7,11,7,35,7,11,7,11,7,25,11,9,7,11,7,11,7,25,7,63,7,11,7,11,7,51,11,25,7,11,7,25,7,12,7,26,7,11,7,11,7,35,11,14,7,11,7,9,7,12,7,49,7,11,7,11,7,44,11,18,7,11,7,40,7,11,7,21,7,11,7,11,7];

const rows = [
  ["isaac-wang", "Isaac Wang", "Spraying", "2026-04-19T06:00:00-07:00", "2026-04-19T10:40:00-07:00", "FIELD A"],
  ["maya-patel", "Maya Patel", "Harvesting", "2026-04-20T07:30:00-07:00", "2026-04-20T11:15:00-07:00", "FIELD B"],
  ["liam-johnson", "Liam Johnson", "Planting", "2026-04-21T08:00:00-07:00", "2026-04-21T12:00:00-07:00", "FIELD C"],
  ["sophia-lee", "Sophia Lee", "Irrigation", "2026-04-22T06:30:00-07:00", "2026-04-22T09:30:00-07:00", "FIELD D"],
  ["ethan-kim", "Ethan Kim", "Fertilizing", "2026-04-23T05:45:00-07:00", "2026-04-23T09:00:00-07:00", "FIELD E"],
  ["olivia-martinez", "Olivia Martinez", "Weeding", "2026-04-24T06:15:00-07:00", "2026-04-24T10:00:00-07:00", "FIELD F"],
  ["noah-brown", "Noah Brown", "Pruning", "2026-04-25T07:00:00-07:00", "2026-04-25T11:30:00-07:00", "FIELD G"],
  ["emma-davis", "Emma Davis", "Monitoring", "2026-04-26T08:15:00-07:00", "2026-04-26T12:45:00-07:00", "FIELD H"],
  ["james-wilson", "James Wilson", "Soil Testing", "2026-04-27T06:00:00-07:00", "2026-04-27T09:00:00-07:00", "FIELD I"],
  ["isabella-garcia", "Isabella Garcia", "Seeding", "2026-04-28T07:45:00-07:00", "2026-04-28T11:00:00-07:00", "FIELD J"],
  ["benjamin-moore", "Benjamin Moore", "Pest Control", "2026-04-29T06:30:00-07:00", "2026-04-29T10:30:00-07:00", "FIELD K"],
] as const;

export const demoLogs: ActivityLog[] = rows.map((row, index) => ({
  id: row[0],
  employeeName: row[1],
  activityType: row[2],
  startedAt: row[3],
  endedAt: row[4],
  fieldName: row[5],
  transcript: index === 0 ? transcript : `Guided voice log for ${row[1]} recorded in ${row[5]}.`,
  summary: index === 0 ? transcript : `${row[1]} completed ${row[2].toLowerCase()} work in ${row[5]}.`,
  responseAccuracy: index === 0 ? 90 : 89 + (index % 3),
  audioUrl: "/api/demo-audio",
  waveform,
  latitude: 36.7378 + index * 0.004,
  longitude: -119.7871 + index * 0.004,
  tags: [],
}));
