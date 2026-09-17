import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { DashboardFilters } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Params> }) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) redirect("/login");
  } else {
    const store = await cookies();
    if (!store.has("toph-local-demo")) redirect("/login");
  }

  const raw = await searchParams;
  const filters: DashboardFilters = {
    q: one(raw.q), sort: one(raw.sort) as DashboardFilters["sort"],
    range: (one(raw.range) as DashboardFilters["range"]) ?? "month",
    field: one(raw.field), activity: one(raw.activity), log: one(raw.log),
  };
  const snapshot = await getDashboardSnapshot(filters);
  return <Dashboard snapshot={snapshot} />;
}
