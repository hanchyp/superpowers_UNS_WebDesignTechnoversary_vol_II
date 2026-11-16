// Dibuat dari skema Supabase project "wana" (generate_typescript_types). Perbarui setelah migrasi baru.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      incidents: {
        Row: {
          created_at: string;
          first_seen_at: string;
          id: string;
          indication: Database["public"]["Enums"]["report_indication"];
          is_demo: boolean;
          lat: number;
          lon: number;
          place: string;
          precision: string;
          radius_km: number;
          region: string;
          region_short: string;
          review: Database["public"]["Enums"]["incident_review"];
          source_report_id: string | null;
          summary: string;
          support_count: number;
          condition: Database["public"]["Enums"]["incident_condition"];
          title: string;
          updated_at: string;
        };
        Insert: { [_ in never]: never };
        Update: { [_ in never]: never };
        Relationships: [];
      };
      incident_events: {
        Row: {
          at: string;
          id: string;
          incident_id: string;
          kind: string;
          note: string;
          report_id: string | null;
          title: string;
        };
        Insert: { [_ in never]: never };
        Update: { [_ in never]: never };
        Relationships: [
          {
            foreignKeyName: "incident_events_incident_id_fkey";
            columns: ["incident_id"];
            isOneToOne: false;
            referencedRelation: "incidents";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: { created_at: string; full_name: string | null; id: string };
        Insert: { created_at?: string; full_name?: string | null; id: string };
        Update: { created_at?: string; full_name?: string | null; id?: string };
        Relationships: [];
      };
      report_media: {
        Row: {
          created_at: string;
          id: string;
          kind: string;
          mime: string;
          path: string;
          position: number;
          report_id: string;
          size_bytes: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind: string;
          mime: string;
          path: string;
          position: number;
          report_id: string;
          size_bytes: number;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: string;
          mime?: string;
          path?: string;
          position?: number;
          report_id?: string;
          size_bytes?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_media_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          checks_done: number;
          code: string;
          consent_at: string;
          created_at: string;
          direction: string | null;
          id: string;
          incident_id: string | null;
          indication: Database["public"]["Enums"]["report_indication"];
          lat: number | null;
          location_mode: string;
          lon: number | null;
          note: string | null;
          observed_at: string;
          status: Database["public"]["Enums"]["report_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          checks_done?: number;
          code?: string;
          consent_at: string;
          created_at?: string;
          direction?: string | null;
          id?: string;
          incident_id?: string | null;
          indication: Database["public"]["Enums"]["report_indication"];
          lat?: number | null;
          location_mode: string;
          lon?: number | null;
          note?: string | null;
          observed_at: string;
          status?: Database["public"]["Enums"]["report_status"];
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          checks_done?: number;
          code?: string;
          consent_at?: string;
          created_at?: string;
          direction?: string | null;
          id?: string;
          incident_id?: string | null;
          indication?: Database["public"]["Enums"]["report_indication"];
          lat?: number | null;
          location_mode?: string;
          lon?: number | null;
          note?: string | null;
          observed_at?: string;
          status?: Database["public"]["Enums"]["report_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      advance_report_review: {
        Args: { p_code: string };
        Returns: {
          current_checks: number;
          current_incident: string | null;
          current_status: Database["public"]["Enums"]["report_status"];
        }[];
      };
      incident_photos: {
        Args: { p_incident_id: string };
        Returns: { path: string; created_at: string }[];
      };
    };
    Enums: {
      incident_condition: "belum-diketahui" | "berlangsung" | "mereda" | "selesai";
      incident_review: "lolos-ai" | "didukung" | "terverifikasi";
      report_indication: "asap" | "api" | "keduanya";
      report_status: "diperiksa" | "terbit" | "perlu-dilengkapi" | "ditolak";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ReportStatus = Database["public"]["Enums"]["report_status"];
export type ReportIndication = Database["public"]["Enums"]["report_indication"];
