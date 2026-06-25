// Database types for the zocare schema.
//
// These are hand-written to match `supabase/schema.sql`. Keep them in sync when
// you change the schema. Once you install the Supabase CLI you can auto-generate
// this file instead:
//
//   supabase gen types typescript --project-id <your-project-ref> > lib/supabase/types.ts

export type Database = {
  public: {
    Tables: {
      doctors: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          specialization: string | null;
          registration_no: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          specialization?: string | null;
          registration_no?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["doctors"]["Insert"]>;
      };
      receptionists: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["receptionists"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
