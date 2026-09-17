import { demoLogs } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActivityLog, DashboardFilters, DashboardSnapshot, Tag } from "@/lib/types";
import { cookies } from "next/headers";

export function applyFilters(logs: ActivityLog[], filters: DashboardFilters) {
  const query = filters.q?.trim().toLowerCase();
  let result = logs.filter((log) => {
    if (query && !`${log.employeeName} ${log.activityType} ${log.fieldName}`.toLowerCase().includes(query)) return false;
    if (filters.field && log.fieldName !== filters.field) return false;
    if (filters.activity && log.activityType !== filters.activity) return false;
    return true;
  });

  const sort = filters.sort ?? "date-asc";
  result = [...result].sort((a, b) => {
    if (sort === "employee") return a.employeeName.localeCompare(b.employeeName);
    if (sort === "activity") return a.activityType.localeCompare(b.activityType);
    const delta = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
    return sort === "date-asc" ? delta : -delta;
  });
  return filters.range === "all" ? result : result.slice(0, 4);
}

function parseTags(value: unknown): Tag[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return typeof row.id === "string" && typeof row.name === "string"
      ? [{ id: row.id, name: row.name, color: typeof row.color === "string" ? row.color : "#146C44" }]
      : [];
  });
}

export async function getDashboardSnapshot(filters: DashboardFilters): Promise<DashboardSnapshot> {
  if (!isSupabaseConfigured) {
    const store = await cookies();
    const localTags = JSON.parse(store.get("toph-local-tags")?.value ?? "{}") as Record<string, string[]>;
    const localLogs = demoLogs.map((log) => ({
      ...log,
      tags: (localTags[log.id] ?? []).map((name) => ({ id: name.toLowerCase().replaceAll(" ", "-"), name, color: "#146C44" })),
    }));
    const logs = applyFilters(localLogs, filters);
    return {
      farmName: "Bays Ranch",
      role: "Admin",
      metrics: { todaysRecordings: 5, newRecordings: 1, activeWorkers: 12, responseAccuracy: 90 },
      logs,
      fields: [...new Set(localLogs.map((log) => log.fieldName))],
      activities: [...new Set(localLogs.map((log) => log.activityType))],
      filters,
      isPersistent: false,
    };
  }

  const supabase = await createClient();
  const { data: membership, error: membershipError } = await supabase
    .from("farm_memberships")
    .select("farm_id, role")
    .limit(1)
    .single();
  if (membershipError || !membership) throw new Error("No farm membership found for this account.");

  const [{ data: rows, error: rowsError }, { data: metric, error: metricError }, { data: farm }] = await Promise.all([
    supabase.from("activity_log_details").select("*").eq("farm_id", membership.farm_id),
    supabase.from("dashboard_metrics").select("*").eq("farm_id", membership.farm_id).single(),
    supabase.from("farms").select("name").eq("id", membership.farm_id).single(),
  ]);
  if (rowsError) throw rowsError;
  if (metricError) throw metricError;

  const logs: ActivityLog[] = await Promise.all((rows ?? []).map(async (row) => {
    let audioUrl: string | null = null;
    if (row.storage_path) {
      const { data } = await supabase.storage.from("recordings").createSignedUrl(row.storage_path, 900);
      audioUrl = data?.signedUrl ?? null;
    }
    return {
      id: row.id!, employeeName: row.employee_name!, activityType: row.activity_type!,
      startedAt: row.started_at!, endedAt: row.ended_at!, fieldName: row.field_name!,
      transcript: row.transcript!, summary: row.summary!, responseAccuracy: row.response_accuracy!,
      audioUrl: audioUrl ?? "/api/demo-audio", waveform: Array.isArray(row.waveform_peaks) ? row.waveform_peaks.map(Number) : [],
      latitude: row.latitude!, longitude: row.longitude!, tags: parseTags(row.tags),
    };
  }));

  return {
    farmName: farm?.name ?? "Bays Ranch",
    role: membership.role,
    metrics: {
      todaysRecordings: Number(metric?.todays_recordings ?? 0),
      newRecordings: Number(metric?.new_recordings ?? 0),
      activeWorkers: Number(metric?.active_workers ?? 0),
      responseAccuracy: Number(metric?.response_accuracy ?? 0),
    },
    logs: applyFilters(logs, filters),
    fields: [...new Set(logs.map((log) => log.fieldName))],
    activities: [...new Set(logs.map((log) => log.activityType))],
    filters,
    isPersistent: true,
  };
}
