// Keeps browser tests and design review deterministic without requiring networked credentials.
// This is server-only and should only be enabled for the intentionally cookie-backed demo mode.
export const isSupabaseConfigured = process.env.TOPH_FORCE_LOCAL_DEMO !== "true" && Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
