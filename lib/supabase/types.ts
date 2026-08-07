// Database types for the zocare schema.
//
// Hand-written to match `supabase/schema.sql`. Keep in sync when you change
// the schema. Auto-generate instead with:
//   supabase gen types typescript --project-id <your-project-ref> > lib/supabase/types.ts

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          role: "doctor" | "receptionist" | "patient" | "admin";
          specialization: string | null;
          registration_no: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          role: "doctor" | "receptionist" | "patient" | "admin";
          specialization?: string | null;
          registration_no?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      doctors: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          specialization: string | null;
          registration_no: string | null;
          avatar_url: string | null;
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
          avatar_url?: string | null;
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
          avatar_url: string | null;
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
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["receptionists"]["Insert"]>;
      };
      patients: {
        Row: {
          id: string;
          patient_id: string;
          full_name: string;
          date_of_birth: string | null;
          gender: "male" | "female" | "other" | null;
          blood_group: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          allergies: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id?: string;
          full_name: string;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | null;
          blood_group?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          allergies?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          receptionist_id: string | null;
          appointment_date: string;
          appointment_time: string;
          type: "consultation" | "follow_up" | "emergency" | "procedure";
          status: "scheduled" | "confirmed" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show";
          chief_complaint: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          receptionist_id?: string | null;
          appointment_date: string;
          appointment_time: string;
          type?: "consultation" | "follow_up" | "emergency" | "procedure";
          status?: "scheduled" | "confirmed" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show";
          chief_complaint?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
      };
      queue_entries: {
        Row: {
          id: string;
          appointment_id: string | null;
          patient_id: string;
          doctor_id: string;
          queue_date: string;
          token_number: number;
          status: "waiting" | "called" | "in_progress" | "completed" | "skipped";
          checked_in_at: string | null;
          called_at: string | null;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          appointment_id?: string | null;
          patient_id: string;
          doctor_id: string;
          queue_date?: string;
          token_number: number;
          status?: "waiting" | "called" | "in_progress" | "completed" | "skipped";
          checked_in_at?: string | null;
          called_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["queue_entries"]["Insert"]>;
      };
      prescriptions: {
        Row: {
          id: string;
          prescription_no: string;
          patient_id: string;
          doctor_id: string;
          appointment_id: string | null;
          diagnosis: string | null;
          chief_complaint: string | null;
          notes: string | null;
          follow_up_date: string | null;
          status: "active" | "completed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prescription_no?: string;
          patient_id: string;
          doctor_id: string;
          appointment_id?: string | null;
          diagnosis?: string | null;
          chief_complaint?: string | null;
          notes?: string | null;
          follow_up_date?: string | null;
          status?: "active" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["prescriptions"]["Insert"]>;
      };
      prescription_items: {
        Row: {
          id: string;
          prescription_id: string;
          medicine_name: string;
          dosage: string;
          frequency: string;
          duration: string;
          route: "oral" | "topical" | "injection" | "inhaled" | "sublingual" | "other";
          instructions: string | null;
          quantity: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          prescription_id: string;
          medicine_name: string;
          dosage: string;
          frequency: string;
          duration: string;
          route?: "oral" | "topical" | "injection" | "inhaled" | "sublingual" | "other";
          instructions?: string | null;
          quantity?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["prescription_items"]["Insert"]>;
      };
      billing_invoices: {
        Row: {
          id: string;
          invoice_no: string;
          patient_id: string;
          doctor_id: string | null;
          appointment_id: string | null;
          subtotal: number;
          discount: number;
          tax: number;
          total: number;
          paid_amount: number;
          payment_method: "cash" | "card" | "upi" | "insurance" | "other" | null;
          status: "draft" | "issued" | "paid" | "partial" | "cancelled" | "refunded";
          notes: string | null;
          issued_at: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_no?: string;
          patient_id: string;
          doctor_id?: string | null;
          appointment_id?: string | null;
          subtotal?: number;
          discount?: number;
          tax?: number;
          total?: number;
          paid_amount?: number;
          payment_method?: "cash" | "card" | "upi" | "insurance" | "other" | null;
          status?: "draft" | "issued" | "paid" | "partial" | "cancelled" | "refunded";
          notes?: string | null;
          issued_at?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["billing_invoices"]["Insert"]>;
      };
      billing_invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          category: "consultation" | "procedure" | "medicine" | "lab" | "service" | "other";
          quantity: number;
          unit_price: number;
          total_price: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          category?: "consultation" | "procedure" | "medicine" | "lab" | "service" | "other";
          quantity?: number;
          unit_price: number;
          total_price: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["billing_invoice_items"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
