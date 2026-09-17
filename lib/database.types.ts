export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      farms: { Row: { id: string; name: string; timezone: string }; Insert: { id?: string; name: string; timezone?: string }; Update: Partial<{ name: string; timezone: string }>; Relationships: [] };
      profiles: { Row: { user_id: string; display_name: string; avatar_url: string | null }; Insert: { user_id: string; display_name: string; avatar_url?: string | null }; Update: Partial<{ display_name: string; avatar_url: string | null }>; Relationships: [] };
      farm_memberships: { Row: { farm_id: string; user_id: string; role: string }; Insert: { farm_id: string; user_id: string; role: string }; Update: Partial<{ role: string }>; Relationships: [] };
      employees: { Row: { id: string; farm_id: string; name: string; avatar_url: string | null; is_active: boolean }; Insert: { id?: string; farm_id: string; name: string; avatar_url?: string | null; is_active?: boolean }; Update: Partial<{ name: string; avatar_url: string | null; is_active: boolean }>; Relationships: [] };
      fields: { Row: { id: string; farm_id: string; name: string; latitude: number; longitude: number }; Insert: { id?: string; farm_id: string; name: string; latitude: number; longitude: number }; Update: Partial<{ name: string; latitude: number; longitude: number }>; Relationships: [] };
      activity_logs: { Row: { id: string; farm_id: string; employee_id: string; field_id: string; activity_type: string; started_at: string; ended_at: string; transcript: string; summary: string; response_accuracy: number; review_status: string; ingested_at: string }; Insert: Omit<Database["public"]["Tables"]["activity_logs"]["Row"], "id"> & { id?: string }; Update: Partial<Database["public"]["Tables"]["activity_logs"]["Row"]>; Relationships: [] };
      recordings: { Row: { id: string; activity_log_id: string; storage_path: string | null; duration_seconds: number; waveform_peaks: Json }; Insert: { id?: string; activity_log_id: string; storage_path?: string | null; duration_seconds: number; waveform_peaks: Json }; Update: Partial<{ storage_path: string | null; duration_seconds: number; waveform_peaks: Json }>; Relationships: [] };
      tags: { Row: { id: string; farm_id: string; name: string; color: string }; Insert: { id?: string; farm_id: string; name: string; color?: string }; Update: Partial<{ name: string; color: string }>; Relationships: [] };
      activity_log_tags: { Row: { activity_log_id: string; tag_id: string; created_by: string; created_at: string }; Insert: { activity_log_id: string; tag_id: string; created_by: string; created_at?: string }; Update: never; Relationships: [] };
    };
    Views: {
      dashboard_metrics: { Row: { farm_id: string; todays_recordings: number; new_recordings: number; active_workers: number; response_accuracy: number }; Relationships: [] };
      activity_log_details: { Row: { id: string; farm_id: string; employee_name: string; activity_type: string; started_at: string; ended_at: string; field_name: string; transcript: string; summary: string; response_accuracy: number; storage_path: string | null; waveform_peaks: Json; latitude: number; longitude: number; tags: Json }; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
