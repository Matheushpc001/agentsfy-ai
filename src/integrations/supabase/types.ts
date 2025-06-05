export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          created_at: string
          evolution_config_id: string | null
          id: string
          is_active: boolean | null
          model: string | null
          openai_api_key: string | null
          phone_number: string
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          openai_api_key?: string | null
          phone_number: string
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          openai_api_key?: string | null
          phone_number?: string
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
      evolution_api_configs: {
        Row: {
          api_key: string
          api_url: string
          created_at: string
          franchisee_id: string
          id: string
          instance_name: string
          qr_code: string | null
          qr_code_expires_at: string | null
          status: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          api_url: string
          created_at?: string
          franchisee_id: string
          id?: string
          instance_name: string
          qr_code?: string | null
          qr_code_expires_at?: string | null
          status?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          api_url?: string
          created_at?: string
          franchisee_id?: string
          id?: string
          instance_name?: string
          qr_code?: string | null
          qr_code_expires_at?: string | null
          status?: string | null
          updated_at?: string
          webhook_url?: string | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
