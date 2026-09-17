"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const tagSchema = z.object({ logId: z.string().min(1).max(100), name: z.string().trim().min(1).max(24) });

export type TagActionState = { error?: string; success?: string };

export async function addTag(_state: TagActionState, formData: FormData): Promise<TagActionState> {
  const parsed = tagSchema.safeParse({ logId: formData.get("logId"), name: formData.get("name") });
  if (!parsed.success) return { error: "Use a tag name between 1 and 24 characters." };

  if (!isSupabaseConfigured) {
    const store = await cookies();
    const current = JSON.parse(store.get("toph-local-tags")?.value ?? "{}") as Record<string, string[]>;
    current[parsed.data.logId] = [...new Set([...(current[parsed.data.logId] ?? []), parsed.data.name])];
    store.set("toph-local-tags", JSON.stringify(current), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 604800 });
    revalidatePath("/dashboard");
    return { success: `Added “${parsed.data.name}”` };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Your session has expired." };
  const { data: log } = await supabase.from("activity_logs").select("farm_id").eq("id", parsed.data.logId).single();
  if (!log) return { error: "This activity log could not be found." };
  const { data: tag, error: tagError } = await supabase.from("tags").upsert({ farm_id: log.farm_id, name: parsed.data.name, color: "#146C44" }, { onConflict: "farm_id,name" }).select("id").single();
  if (tagError || !tag) return { error: "The tag could not be saved." };
  const { error } = await supabase.from("activity_log_tags").upsert(
    { activity_log_id: parsed.data.logId, tag_id: tag.id, created_by: userData.user.id },
    { onConflict: "activity_log_id,tag_id", ignoreDuplicates: true },
  );
  if (error) return { error: "The tag could not be attached." };
  revalidatePath("/dashboard");
  return { success: `Added “${parsed.data.name}”` };
}
