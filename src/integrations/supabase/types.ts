export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aggregated_pricing: {
        Row: {
          avg_price: number
          clinic_name: string
          id: string
          max_price: number
          min_price: number
          price_volatility: number
          sample_size: number
          treatment_type: string
          updated_at: string
        }
        Insert: {
          avg_price: number
          clinic_name: string
          id?: string
          max_price: number
          min_price: number
          price_volatility?: number
          sample_size: number
          treatment_type: string
          updated_at?: string
        }
        Update: {
          avg_price?: number
          clinic_name?: string
          id?: string
          max_price?: number
          min_price?: number
          price_volatility?: number
          sample_size?: number
          treatment_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinic_insights: {
        Row: {
          availability_score: number
          avg_user_rating: number
          clinic_name: string
          confidence_level: string
          demand_score: number
          id: string
          pricing_percentile: number
          sample_size: number
          updated_at: string
        }
        Insert: {
          availability_score?: number
          avg_user_rating?: number
          clinic_name: string
          confidence_level?: string
          demand_score?: number
          id?: string
          pricing_percentile?: number
          sample_size?: number
          updated_at?: string
        }
        Update: {
          availability_score?: number
          avg_user_rating?: number
          clinic_name?: string
          confidence_level?: string
          demand_score?: number
          id?: string
          pricing_percentile?: number
          sample_size?: number
          updated_at?: string
        }
        Relationships: []
      }
      clinics: {
        Row: {
          base_price_egg_donation: number | null
          base_price_freezing: number | null
          base_price_ivf: number | null
          city: string | null
          country: string
          created_at: string
          extras_estimate: number | null
          id: string
          medication_estimate: number | null
          name: string
          rating_score: number | null
          success_rate_estimate: number | null
          tier: string
          total_estimated_price: number | null
          treatments_available: string[]
        }
        Insert: {
          base_price_egg_donation?: number | null
          base_price_freezing?: number | null
          base_price_ivf?: number | null
          city?: string | null
          country?: string
          created_at?: string
          extras_estimate?: number | null
          id?: string
          medication_estimate?: number | null
          name: string
          rating_score?: number | null
          success_rate_estimate?: number | null
          tier?: string
          total_estimated_price?: number | null
          treatments_available?: string[]
        }
        Update: {
          base_price_egg_donation?: number | null
          base_price_freezing?: number | null
          base_price_ivf?: number | null
          city?: string | null
          country?: string
          created_at?: string
          extras_estimate?: number | null
          id?: string
          medication_estimate?: number | null
          name?: string
          rating_score?: number | null
          success_rate_estimate?: number | null
          tier?: string
          total_estimated_price?: number | null
          treatments_available?: string[]
        }
        Relationships: []
      }
      matches: {
        Row: {
          clinic_id: string
          created_at: string
          estimated_price: number | null
          explanation: string | null
          id: string
          match_score: number | null
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          estimated_price?: number | null
          explanation?: string | null
          id?: string
          match_score?: number | null
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          estimated_price?: number | null
          explanation?: string | null
          id?: string
          match_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          budget_range: string | null
          country_preference: string
          created_at: string
          diagnosis: string[]
          gender: string | null
          id: string
          previous_treatments: string[]
          treatment_interest: string | null
          trying_duration: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          budget_range?: string | null
          country_preference?: string
          created_at?: string
          diagnosis?: string[]
          gender?: string | null
          id: string
          previous_treatments?: string[]
          treatment_interest?: string | null
          trying_duration?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          budget_range?: string | null
          country_preference?: string
          created_at?: string
          diagnosis?: string[]
          gender?: string | null
          id?: string
          previous_treatments?: string[]
          treatment_interest?: string | null
          trying_duration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_submitted_quotes: {
        Row: {
          base_price: number
          clinic_name: string
          country: string
          created_at: string
          date_received: string | null
          extras_cost: number
          id: string
          is_verified: boolean
          medication_cost: number
          notes: string | null
          total_price: number | null
          treatment_type: string
          user_id: string | null
        }
        Insert: {
          base_price: number
          clinic_name: string
          country: string
          created_at?: string
          date_received?: string | null
          extras_cost?: number
          id?: string
          is_verified?: boolean
          medication_cost?: number
          notes?: string | null
          total_price?: number | null
          treatment_type: string
          user_id?: string | null
        }
        Update: {
          base_price?: number
          clinic_name?: string
          country?: string
          created_at?: string
          date_received?: string | null
          extras_cost?: number
          id?: string
          is_verified?: boolean
          medication_cost?: number
          notes?: string | null
          total_price?: number | null
          treatment_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_submitted_quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      refresh_aggregated_pricing: { Args: never; Returns: undefined }
      refresh_clinic_insights: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
