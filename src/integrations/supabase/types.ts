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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string | null
          customer_id: string
          demo_url: string | null
          enable_voice_recognition: boolean | null
          franchisee_id: string
          id: string
          is_active: boolean | null
          knowledge_base: string | null
          message_count: number | null
          name: string
          open_ai_key: string
          open_ai_key_encrypted: string | null
          phone_number: string | null
          prompt: string | null
          response_time: number | null
          sector: string
          updated_at: string | null
          whatsapp_connected: boolean | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          demo_url?: string | null
          enable_voice_recognition?: boolean | null
          franchisee_id: string
          id?: string
          is_active?: boolean | null
          knowledge_base?: string | null
          message_count?: number | null
          name: string
          open_ai_key: string
          open_ai_key_encrypted?: string | null
          phone_number?: string | null
          prompt?: string | null
          response_time?: number | null
          sector: string
          updated_at?: string | null
          whatsapp_connected?: boolean | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          demo_url?: string | null
          enable_voice_recognition?: boolean | null
          franchisee_id?: string
          id?: string
          is_active?: boolean | null
          knowledge_base?: string | null
          message_count?: number | null
          name?: string
          open_ai_key?: string
          open_ai_key_encrypted?: string | null
          phone_number?: string | null
          prompt?: string | null
          response_time?: number | null
          sector?: string
          updated_at?: string | null
          whatsapp_connected?: boolean | null
        }
        Relationships: []
      }
      ai_interaction_logs: {
        Row: {
          agent_id: string | null
          ai_response: string
          conversation_id: string | null
          created_at: string
          id: string
          model_used: string | null
          response_time_ms: number | null
          tokens_used: number | null
          user_message: string
        }
        Insert: {
          agent_id?: string | null
          ai_response: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          model_used?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_message: string
        }
        Update: {
          agent_id?: string | null
          ai_response?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          model_used?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_interaction_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_whatsapp_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interaction_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_whatsapp_agents: {
        Row: {
          agent_id: string
          auto_response: boolean | null
          created_at: string
          evolution_config_id: string | null
          id: string
          is_active: boolean | null
          model: string | null
          openai_api_key: string | null
          openai_api_key_encrypted: string | null
          phone_number: string
          response_delay_seconds: number | null
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          auto_response?: boolean | null
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          openai_api_key?: string | null
          openai_api_key_encrypted?: string | null
          phone_number: string
          response_delay_seconds?: number | null
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          auto_response?: boolean | null
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          openai_api_key?: string | null
          openai_api_key_encrypted?: string | null
          phone_number?: string
          response_delay_seconds?: number | null
          system_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_whatsapp_agents_evolution_config_id_fkey"
            columns: ["evolution_config_id"]
            isOneToOne: false
            referencedRelation: "evolution_api_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_types: {
        Row: {
          created_at: string | null
          customer_id: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          description?: string | null
          duration_minutes: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_types_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          end_time: string
          franchisee_id: string
          id: string
          location: string | null
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          end_time: string
          franchisee_id: string
          id?: string
          location?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          end_time?: string
          franchisee_id?: string
          id?: string
          location?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availabilities: {
        Row: {
          created_at: string | null
          customer_id: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          agent_count: number | null
          business_name: string
          contact_phone: string | null
          created_at: string | null
          document: string | null
          email: string
          franchisee_id: string
          id: string
          logo: string | null
          name: string
          portal_url: string | null
          role: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          agent_count?: number | null
          business_name: string
          contact_phone?: string | null
          created_at?: string | null
          document?: string | null
          email: string
          franchisee_id: string
          id?: string
          logo?: string | null
          name: string
          portal_url?: string | null
          role?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          agent_count?: number | null
          business_name?: string
          contact_phone?: string | null
          created_at?: string | null
          document?: string | null
          email?: string
          franchisee_id?: string
          id?: string
          logo?: string | null
          name?: string
          portal_url?: string | null
          role?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      evolution_api_configs: {
        Row: {
          created_at: string
          franchisee_id: string
          global_config_id: string | null
          id: string
          instance_name: string
          qr_code: string | null
          qr_code_expires_at: string | null
          status: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          franchisee_id: string
          global_config_id?: string | null
          id?: string
          instance_name: string
          qr_code?: string | null
          qr_code_expires_at?: string | null
          status?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          franchisee_id?: string
          global_config_id?: string | null
          id?: string
          instance_name?: string
          qr_code?: string | null
          qr_code_expires_at?: string | null
          status?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolution_api_configs_global_config_id_fkey"
            columns: ["global_config_id"]
            isOneToOne: false
            referencedRelation: "evolution_global_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_global_configs: {
        Row: {
          api_key: string
          api_url: string
          created_at: string
          global_api_key: string | null
          id: string
          is_active: boolean
          manager_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          api_key: string
          api_url: string
          created_at?: string
          global_api_key?: string | null
          id?: string
          is_active?: boolean
          manager_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          api_url?: string
          created_at?: string
          global_api_key?: string | null
          id?: string
          is_active?: boolean
          manager_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          category_id: string | null
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          file_size_mb: number | null
          id: string
          is_premium: boolean | null
          is_published: boolean | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_size_mb?: number | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_size_mb?: string | null
          id?: string
          is_premium?: string | null
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lesson_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          notes: string | null
          progress_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          notes?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          notes?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          agent_id: string | null
          contact_name: string | null
          contact_number: string
          created_at: string
          evolution_config_id: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          contact_name?: string | null
          contact_number: string
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          contact_name?: string | null
          contact_number?: string
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_whatsapp_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_evolution_config_id_fkey"
            columns: ["evolution_config_id"]
            isOneToOne: false
            referencedRelation: "evolution_api_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          ai_response_generated: boolean | null
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_from_me: boolean
          media_url: string | null
          message_id: string
          message_type: string | null
          sender_type: string
          timestamp: string
        }
        Insert: {
          ai_response_generated?: boolean | null
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_from_me: boolean
          media_url?: string | null
          message_id: string
          message_type?: string | null
          sender_type: string
          timestamp?: string
        }
        Update: {
          ai_response_generated?: boolean | null
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_from_me?: boolean
          media_url?: string | null
          message_id?: string
          message_type?: string | null
          sender_type?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_safe_agents: {
        Args: Record<PropertyKey, never>
        Returns: {
          api_key_status: string
          created_at: string
          customer_id: string
          franchisee_id: string
          id: string
          is_active: boolean
          message_count: number
          name: string
          phone_number: string
          response_time: number
          sector: string
          updated_at: string
          whatsapp_connected: boolean
        }[]
      }
      debug_user_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_user_id: string
          has_admin_role: boolean
          user_roles_count: number
        }[]
      }
      encrypt_api_key: {
        Args: { api_key: string }
        Returns: string
      }
      get_active_ai_agents: {
        Args: { config_id_param: string }
        Returns: {
          agent_id: string
          auto_response: boolean
          id: string
          model: string
          phone_number: string
          system_prompt: string
        }[]
      }
      get_active_evolution_config: {
        Args: { franchisee_id_param: string }
        Returns: {
          id: string
          instance_name: string
          status: string
        }[]
      }
      get_agent_api_key: {
        Args: { agent_id_param: string }
        Returns: string
      }
      get_franchisees_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_count: number
          created_at: string
          customer_count: number
          email: string
          id: string
          is_active: boolean
          name: string
          revenue: number
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      verify_api_key: {
        Args: { api_key: string; encrypted_key: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "franchisee" | "customer"
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
    Enums: {
      app_role: ["admin", "franchisee", "customer"],
    },
  },
} as const
