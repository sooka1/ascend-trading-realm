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
      deposits: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          method: string
          notes: string | null
          reference: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          method?: string
          notes?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string
          notes?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          from_status: string | null
          id: string
          metadata: Json | null
          reason: string | null
          request_id: string
          request_kind: string
          target_user_id: string
          to_status: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          request_id: string
          request_kind: string
          target_user_id: string
          to_status?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          request_id?: string
          request_kind?: string
          target_user_id?: string
          to_status?: string | null
        }
        Relationships: []
      }
      guest_inquiries: {
        Row: {
          admin_reply: string | null
          body: string
          created_at: string
          email: string | null
          id: string
          is_read: boolean
          name: string | null
          phone: string | null
          replied_at: string | null
          replied_by: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          admin_reply?: string | null
          body: string
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          name?: string | null
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          admin_reply?: string | null
          body?: string
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          name?: string | null
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      investment_requests: {
        Row: {
          capital_range: Database["public"]["Enums"]["capital_range"]
          country: string
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          risk_preference: Database["public"]["Enums"]["risk_preference"]
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          capital_range: Database["public"]["Enums"]["capital_range"]
          country: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          risk_preference: Database["public"]["Enums"]["risk_preference"]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          capital_range?: Database["public"]["Enums"]["capital_range"]
          country?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          risk_preference?: Database["public"]["Enums"]["risk_preference"]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          from_role: string
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          from_role: string
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          from_role?: string
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_broadcasts: {
        Row: {
          body: string | null
          created_at: string
          error: string | null
          id: string
          recipients_count: number
          sender_id: string
          status: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          error?: string | null
          id?: string
          recipients_count?: number
          sender_id: string
          status?: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          error?: string | null
          id?: string
          recipients_count?: number
          sender_id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          description: string | null
          id: string
          lockup_months: number
          min_amount: number
          name: string
          risk_level: string
          sort_order: number
          target_return_pct: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          lockup_months?: number
          min_amount?: number
          name: string
          risk_level?: string
          sort_order?: number
          target_return_pct?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          lockup_months?: number
          min_amount?: number
          name?: string
          risk_level?: string
          sort_order?: number
          target_return_pct?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          allocation: Json
          as_of_date: string
          created_at: string
          equity: number
          id: string
          pnl: number
          portfolio_id: string
          user_id: string
        }
        Insert: {
          allocation?: Json
          as_of_date: string
          created_at?: string
          equity: number
          id?: string
          pnl?: number
          portfolio_id: string
          user_id: string
        }
        Update: {
          allocation?: Json
          as_of_date?: string
          created_at?: string
          equity?: number
          id?: string
          pnl?: number
          portfolio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_snapshots_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          base_currency: string
          created_at: string
          id: string
          inception_date: string
          name: string
          strategy: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          id?: string
          inception_date?: string
          name: string
          strategy: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          id?: string
          inception_date?: string
          name?: string
          strategy?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_keys: {
        Row: {
          created_at: string
          secret_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          secret_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          secret_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          id_back_url: string | null
          id_front_url: string | null
          language: string | null
          public_key: string | null
          referral_code: string | null
          referred_by: string | null
          selfie_url: string | null
          timezone: string | null
          updated_at: string
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          id_back_url?: string | null
          id_front_url?: string | null
          language?: string | null
          public_key?: string | null
          referral_code?: string | null
          referred_by?: string | null
          selfie_url?: string | null
          timezone?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          language?: string | null
          public_key?: string | null
          referral_code?: string | null
          referred_by?: string | null
          selfie_url?: string | null
          timezone?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Relationships: []
      }
      profit_distributions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          period_end: string
          period_start: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          period_end: string
          period_start: string
          subscription_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          period_end?: string
          period_start?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profit_distributions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_earnings: {
        Row: {
          amount: number
          created_at: string
          currency: string
          deposit_id: string | null
          id: string
          rate: number
          referee_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          deposit_id?: string | null
          id?: string
          rate?: number
          referee_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          deposit_id?: string | null
          id?: string
          rate?: number
          referee_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_earnings_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: true
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      statements: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          kind: string
          period: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          kind: string
          period: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          kind?: string
          period?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_amount_changes: {
        Row: {
          amount_after: number
          amount_before: number
          amount_delta: number
          created_at: string
          currency: string
          id: string
          reason: string | null
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount_after: number
          amount_before: number
          amount_delta: number
          created_at?: string
          currency?: string
          id?: string
          reason?: string | null
          subscription_id: string
          user_id: string
        }
        Update: {
          amount_after?: number
          amount_before?: number
          amount_delta?: number
          created_at?: string
          currency?: string
          id?: string
          reason?: string | null
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_amount_changes_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          ends_at: string | null
          id: string
          package_id: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          ends_at?: string | null
          id?: string
          package_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          ends_at?: string | null
          id?: string
          package_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_last_read_at: string | null
          assigned_to: string | null
          category: string | null
          client_last_read_at: string | null
          created_at: string
          id: string
          last_message_at: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_last_read_at?: string | null
          assigned_to?: string | null
          category?: string | null
          client_last_read_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_last_read_at?: string | null
          assigned_to?: string | null
          category?: string | null
          client_last_read_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_backfill_log: {
        Row: {
          id: string
          notes: string | null
          operation: string
          ran_at: string
          rows_skipped: number
          rows_updated: number
        }
        Insert: {
          id?: string
          notes?: string | null
          operation: string
          ran_at?: string
          rows_skipped?: number
          rows_updated?: number
        }
        Update: {
          id?: string
          notes?: string | null
          operation?: string
          ran_at?: string
          rows_skipped?: number
          rows_updated?: number
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachment_mime: string | null
          attachment_name: string | null
          attachment_path: string | null
          attachment_size: number | null
          body: string | null
          body_admin: string | null
          created_at: string
          id: string
          is_staff: boolean
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachment_mime?: string | null
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          body?: string | null
          body_admin?: string | null
          created_at?: string
          id?: string
          is_staff?: boolean
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachment_mime?: string | null
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          body?: string | null
          body_admin?: string | null
          created_at?: string
          id?: string
          is_staff?: boolean
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string
          id: string
          note: string | null
          occurred_at: string
          pnl: number
          portfolio_id: string
          price: number
          quantity: number
          side: string
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          occurred_at?: string
          pnl?: number
          portfolio_id: string
          price: number
          quantity: number
          side: string
          symbol: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          occurred_at?: string
          pnl?: number
          portfolio_id?: string
          price?: number
          quantity?: number
          side?: string
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
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
      withdrawal_audit_log: {
        Row: {
          amount_after: number | null
          amount_before: number | null
          amount_delta: number
          created_at: string
          currency: string
          event: string
          id: string
          metadata: Json | null
          subscription_id: string | null
          user_id: string
          withdrawal_id: string
        }
        Insert: {
          amount_after?: number | null
          amount_before?: number | null
          amount_delta: number
          created_at?: string
          currency?: string
          event: string
          id?: string
          metadata?: Json | null
          subscription_id?: string | null
          user_id: string
          withdrawal_id: string
        }
        Update: {
          amount_after?: number | null
          amount_before?: number | null
          amount_delta?: number
          created_at?: string
          currency?: string
          event?: string
          id?: string
          metadata?: Json | null
          subscription_id?: string | null
          user_id?: string
          withdrawal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_audit_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_audit_log_withdrawal_id_fkey"
            columns: ["withdrawal_id"]
            isOneToOne: false
            referencedRelation: "withdrawals"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          currency: string
          destination: string
          iban: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          swift: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          destination: string
          iban?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          swift?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          destination?: string
          iban?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          swift?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      distribute_weekly_profits: { Args: never; Returns: number }
      email_has_role: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      generate_referral_code: { Args: never; Returns: string }
      get_super_admin_public_key: { Args: never; Returns: string }
      get_ticket_owner_public_key: {
        Args: { _ticket_id: string }
        Returns: string
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "super_admin"
        | "portfolio_manager"
        | "compliance_officer"
        | "finance"
        | "support"
        | "investor"
      capital_range: "1k_10k" | "10k_50k" | "50k_250k" | "250k_1m" | "1m_plus"
      risk_preference: "conservative" | "balanced" | "aggressive"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status: "open" | "pending" | "resolved" | "closed"
      verification_status: "unverified" | "pending" | "approved" | "rejected"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "super_admin",
        "portfolio_manager",
        "compliance_officer",
        "finance",
        "support",
        "investor",
      ],
      capital_range: ["1k_10k", "10k_50k", "50k_250k", "250k_1m", "1m_plus"],
      risk_preference: ["conservative", "balanced", "aggressive"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: ["open", "pending", "resolved", "closed"],
      verification_status: ["unverified", "pending", "approved", "rejected"],
    },
  },
} as const
