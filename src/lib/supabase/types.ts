/**
 * Supabase database types for HealthTrack MCH.
 * After connecting your project run:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
 * to regenerate this file from your actual schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          role: 'admin' | 'supervisor' | 'health_worker' | 'data_clerk' | 'viewer'
          region: string
          woreda: string
          kebele: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string
          role?: 'admin' | 'supervisor' | 'health_worker' | 'data_clerk' | 'viewer'
          region?: string
          woreda?: string
          kebele?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          role?: 'admin' | 'supervisor' | 'health_worker' | 'data_clerk' | 'viewer'
          region?: string
          woreda?: string
          kebele?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      households: {
        Row: {
          id: string
          registration_number: string
          house_number: string
          head_name: string
          phone: string
          region: string
          woreda: string
          kebele: string
          gps_lat: number | null
          gps_lng: number | null
          vulnerability_status: 'none' | 'low' | 'medium' | 'high'
          programs: string[]
          members_count: number
          registered_by: string | null
          registered_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_number: string
          house_number?: string
          head_name: string
          phone?: string
          region?: string
          woreda?: string
          kebele?: string
          gps_lat?: number | null
          gps_lng?: number | null
          vulnerability_status?: 'none' | 'low' | 'medium' | 'high'
          programs?: string[]
          members_count?: number
          registered_by?: string | null
          registered_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_number?: string
          house_number?: string
          head_name?: string
          phone?: string
          region?: string
          woreda?: string
          kebele?: string
          gps_lat?: number | null
          gps_lng?: number | null
          vulnerability_status?: 'none' | 'low' | 'medium' | 'high'
          programs?: string[]
          members_count?: number
          registered_by?: string | null
          registered_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      maternal_records: {
        Row: {
          id: string
          household_id: string
          name: string
          age: number
          phone: string
          status: 'pregnant' | 'lactating' | 'both'
          gestational_age: number | null
          expected_delivery_date: string | null
          actual_delivery_date: string | null
          anc_visits: number
          pnc_visits: number
          depression_screening: 'not_done' | 'normal' | 'at_risk' | 'positive'
          iron_folic_supplementation: boolean
          family_support: 'good' | 'moderate' | 'poor'
          nutrition_status: 'normal' | 'malnourished' | 'obese'
          risk_level: 'low' | 'medium' | 'high'
          next_appointment: string | null
          missed_appointments: number
          registered_by: string | null
          region: string
          woreda: string
          kebele: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          age: number
          phone?: string
          status: 'pregnant' | 'lactating' | 'both'
          gestational_age?: number | null
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          anc_visits?: number
          pnc_visits?: number
          depression_screening?: 'not_done' | 'normal' | 'at_risk' | 'positive'
          iron_folic_supplementation?: boolean
          family_support?: 'good' | 'moderate' | 'poor'
          nutrition_status?: 'normal' | 'malnourished' | 'obese'
          risk_level?: 'low' | 'medium' | 'high'
          next_appointment?: string | null
          missed_appointments?: number
          registered_by?: string | null
          region?: string
          woreda?: string
          kebele?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          age?: number
          phone?: string
          status?: 'pregnant' | 'lactating' | 'both'
          gestational_age?: number | null
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          anc_visits?: number
          pnc_visits?: number
          depression_screening?: 'not_done' | 'normal' | 'at_risk' | 'positive'
          iron_folic_supplementation?: boolean
          family_support?: 'good' | 'moderate' | 'poor'
          nutrition_status?: 'normal' | 'malnourished' | 'obese'
          risk_level?: 'low' | 'medium' | 'high'
          next_appointment?: string | null
          missed_appointments?: number
          registered_by?: string | null
          region?: string
          woreda?: string
          kebele?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      child_records: {
        Row: {
          id: string
          household_id: string
          name: string
          sex: 'male' | 'female'
          date_of_birth: string
          age_months: number
          caregiver_name: string
          caregiver_phone: string
          nutrition_status: 'normal' | 'mam' | 'sam' | 'overweight'
          muac: number | null
          weight: number | null
          height: number | null
          disability_screening: 'none' | 'suspected' | 'confirmed'
          child_protection_flags: string[]
          next_appointment: string | null
          risk_level: 'low' | 'medium' | 'high'
          registered_by: string | null
          region: string
          woreda: string
          kebele: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          sex: 'male' | 'female'
          date_of_birth: string
          age_months?: number
          caregiver_name?: string
          caregiver_phone?: string
          nutrition_status?: 'normal' | 'mam' | 'sam' | 'overweight'
          muac?: number | null
          weight?: number | null
          height?: number | null
          disability_screening?: 'none' | 'suspected' | 'confirmed'
          child_protection_flags?: string[]
          next_appointment?: string | null
          risk_level?: 'low' | 'medium' | 'high'
          registered_by?: string | null
          region?: string
          woreda?: string
          kebele?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          sex?: 'male' | 'female'
          date_of_birth?: string
          age_months?: number
          caregiver_name?: string
          caregiver_phone?: string
          nutrition_status?: 'normal' | 'mam' | 'sam' | 'overweight'
          muac?: number | null
          weight?: number | null
          height?: number | null
          disability_screening?: 'none' | 'suspected' | 'confirmed'
          child_protection_flags?: string[]
          next_appointment?: string | null
          risk_level?: 'low' | 'medium' | 'high'
          registered_by?: string | null
          region?: string
          woreda?: string
          kebele?: string
          created_at?: string
          updated_at?: string
        }
      }
      visit_reports: {
        Row: {
          id: string
          household_id: string
          visit_number: number
          visit_date: string
          status: 'draft' | 'submitted' | 'approved' | 'returned'
          vulnerability_status: 'yes' | 'no'
          psnp_enrollment: 'yes' | 'no'
          cbhi_status: 'free' | 'paid' | 'no'
          tds_status: 'yes' | 'no'
          maternal_section: Json | null
          child_sections: Json[]
          risk_flags: Json[]
          hew_id: string
          submitted_at: string | null
          supervisor_id: string | null
          approved_at: string | null
          returned_at: string | null
          supervisor_comment: string | null
          draft_saved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          visit_number: number
          visit_date: string
          status?: 'draft' | 'submitted' | 'approved' | 'returned'
          vulnerability_status?: 'yes' | 'no'
          psnp_enrollment?: 'yes' | 'no'
          cbhi_status?: 'free' | 'paid' | 'no'
          tds_status?: 'yes' | 'no'
          maternal_section?: Json | null
          child_sections?: Json[]
          risk_flags?: Json[]
          hew_id: string
          submitted_at?: string | null
          supervisor_id?: string | null
          approved_at?: string | null
          returned_at?: string | null
          supervisor_comment?: string | null
          draft_saved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          visit_number?: number
          visit_date?: string
          status?: 'draft' | 'submitted' | 'approved' | 'returned'
          vulnerability_status?: 'yes' | 'no'
          psnp_enrollment?: 'yes' | 'no'
          cbhi_status?: 'free' | 'paid' | 'no'
          tds_status?: 'yes' | 'no'
          maternal_section?: Json | null
          child_sections?: Json[]
          risk_flags?: Json[]
          hew_id?: string
          submitted_at?: string | null
          supervisor_id?: string | null
          approved_at?: string | null
          returned_at?: string | null
          supervisor_comment?: string | null
          draft_saved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          patient_id: string
          patient_type: 'maternal' | 'child'
          patient_name: string
          referral_date: string
          reason: string
          referred_to: string
          service_received: string | null
          follow_up_date: string | null
          outcome: string | null
          status: 'pending' | 'in_progress' | 'completed'
          referred_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          patient_type: 'maternal' | 'child'
          patient_name: string
          referral_date?: string
          reason: string
          referred_to: string
          service_received?: string | null
          follow_up_date?: string | null
          outcome?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          patient_type?: 'maternal' | 'child'
          patient_name?: string
          referral_date?: string
          reason?: string
          referred_to?: string
          service_received?: string | null
          follow_up_date?: string | null
          outcome?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          patient_type: 'maternal' | 'child'
          patient_name: string
          date: string
          time: string
          type: string
          health_worker: string | null
          status: 'scheduled' | 'completed' | 'missed' | 'cancelled'
          notes: string | null
          reminders: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          patient_type: 'maternal' | 'child'
          patient_name: string
          date: string
          time: string
          type: string
          health_worker?: string | null
          status?: 'scheduled' | 'completed' | 'missed' | 'cancelled'
          notes?: string | null
          reminders?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          patient_type?: 'maternal' | 'child'
          patient_name?: string
          date?: string
          time?: string
          type?: string
          health_worker?: string | null
          status?: 'scheduled' | 'completed' | 'missed' | 'cancelled'
          notes?: string | null
          reminders?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_user_id: string
          type: 'submission' | 'approval' | 'returned' | 'risk_flag' | 'visit_reminder' | 'resubmit_reminder'
          title: string
          message: string
          related_report_id: string | null
          is_read: boolean
          is_urgent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_user_id: string
          type: 'submission' | 'approval' | 'returned' | 'risk_flag' | 'visit_reminder' | 'resubmit_reminder'
          title: string
          message: string
          related_report_id?: string | null
          is_read?: boolean
          is_urgent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_user_id?: string
          type?: 'submission' | 'approval' | 'returned' | 'risk_flag' | 'visit_reminder' | 'resubmit_reminder'
          title?: string
          message?: string
          related_report_id?: string | null
          is_read?: boolean
          is_urgent?: boolean
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
