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
      benchmark_prices: {
        Row: {
          as_of_date: string
          benchmark_id: string
          close_value: number
          created_at: string
          id: string
          return_pct: number | null
        }
        Insert: {
          as_of_date: string
          benchmark_id: string
          close_value: number
          created_at?: string
          id?: string
          return_pct?: number | null
        }
        Update: {
          as_of_date?: string
          benchmark_id?: string
          close_value?: number
          created_at?: string
          id?: string
          return_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "benchmark_prices_benchmark_id_fkey"
            columns: ["benchmark_id"]
            isOneToOne: false
            referencedRelation: "benchmarks"
            referencedColumns: ["id"]
          },
        ]
      }
      benchmarks: {
        Row: {
          code: string
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          kind: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chart_drawings: {
        Row: {
          created_at: string
          drawings: Json
          id: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drawings?: Json
          id?: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drawings?: Json
          id?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      competition_entries: {
        Row: {
          competition_id: string | null
          created_at: string
          currency: string
          id: string
          status: string
          tier_fee: number
          user_id: string
        }
        Insert: {
          competition_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          status?: string
          tier_fee: number
          user_id: string
        }
        Update: {
          competition_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          status?: string
          tier_fee?: number
          user_id?: string
        }
        Relationships: []
      }
      competition_trades: {
        Row: {
          closed_at: string | null
          code: string
          competition_id: string
          created_at: string
          entry: number
          exit: number | null
          id: string
          lots: number
          opened_at: string
          pnl: number | null
          side: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          code: string
          competition_id: string
          created_at?: string
          entry: number
          exit?: number | null
          id?: string
          lots: number
          opened_at?: string
          pnl?: number | null
          side: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          code?: string
          competition_id?: string
          created_at?: string
          entry?: number
          exit?: number | null
          id?: string
          lots?: number
          opened_at?: string
          pnl?: number | null
          side?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      copy_audit_log: {
        Row: {
          actor_id: string | null
          created_at: string
          event: string
          id: string
          payload: Json
          target_user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event: string
          id?: string
          payload?: Json
          target_user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event?: string
          id?: string
          payload?: Json
          target_user_id?: string | null
        }
        Relationships: []
      }
      copy_execution_log: {
        Row: {
          calc_method: string | null
          copy_mode: string | null
          created_at: string
          event_type: string
          executed_at: string
          failure_reason: string | null
          id: string
          latency_ms: number | null
          lot_size: number | null
          master_id: string
          master_trade_id: string | null
          metadata: Json
          queue_id: string | null
          status: string
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          calc_method?: string | null
          copy_mode?: string | null
          created_at?: string
          event_type: string
          executed_at?: string
          failure_reason?: string | null
          id?: string
          latency_ms?: number | null
          lot_size?: number | null
          master_id: string
          master_trade_id?: string | null
          metadata?: Json
          queue_id?: string | null
          status: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          calc_method?: string | null
          copy_mode?: string | null
          created_at?: string
          event_type?: string
          executed_at?: string
          failure_reason?: string | null
          id?: string
          latency_ms?: number | null
          lot_size?: number | null
          master_id?: string
          master_trade_id?: string | null
          metadata?: Json
          queue_id?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copy_execution_log_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "copy_execution_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_execution_log_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "v_copy_queue_admin"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_execution_modes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          is_enabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          is_enabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          is_enabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      copy_execution_queue: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          dedupe_key: string
          enqueued_at: string
          event_type: string
          id: string
          last_error: string | null
          master_id: string
          master_trade_id: string | null
          payload: Json
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          dedupe_key: string
          enqueued_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          master_id: string
          master_trade_id?: string | null
          payload?: Json
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          dedupe_key?: string
          enqueued_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          master_id?: string
          master_trade_id?: string | null
          payload?: Json
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_execution_queue_master_trade_id_fkey"
            columns: ["master_trade_id"]
            isOneToOne: false
            referencedRelation: "copy_master_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_follower_settings: {
        Row: {
          capital_allocation: number
          close_on_unsubscribe: boolean
          copy_mode: string
          copy_stop_loss_pct: number | null
          copy_take_profit_pct: number | null
          created_at: string
          daily_realized_pnl: number
          fixed_lot_size: number | null
          id: string
          is_paused: boolean
          last_reset_date: string
          max_allocation: number | null
          max_daily_loss: number | null
          max_open_positions: number | null
          max_overall_loss: number | null
          max_position_size: number | null
          multiplier: number | null
          overall_realized_pnl: number
          percentage_per_trade: number | null
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capital_allocation?: number
          close_on_unsubscribe?: boolean
          copy_mode?: string
          copy_stop_loss_pct?: number | null
          copy_take_profit_pct?: number | null
          created_at?: string
          daily_realized_pnl?: number
          fixed_lot_size?: number | null
          id?: string
          is_paused?: boolean
          last_reset_date?: string
          max_allocation?: number | null
          max_daily_loss?: number | null
          max_open_positions?: number | null
          max_overall_loss?: number | null
          max_position_size?: number | null
          multiplier?: number | null
          overall_realized_pnl?: number
          percentage_per_trade?: number | null
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capital_allocation?: number
          close_on_unsubscribe?: boolean
          copy_mode?: string
          copy_stop_loss_pct?: number | null
          copy_take_profit_pct?: number | null
          created_at?: string
          daily_realized_pnl?: number
          fixed_lot_size?: number | null
          id?: string
          is_paused?: boolean
          last_reset_date?: string
          max_allocation?: number | null
          max_daily_loss?: number | null
          max_open_positions?: number | null
          max_overall_loss?: number | null
          max_position_size?: number | null
          multiplier?: number | null
          overall_realized_pnl?: number
          percentage_per_trade?: number | null
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_follower_settings_copy_mode_fkey"
            columns: ["copy_mode"]
            isOneToOne: false
            referencedRelation: "copy_execution_modes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "copy_follower_settings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: true
            referencedRelation: "copy_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_master_trades: {
        Row: {
          closed_at: string | null
          created_at: string
          entry_price: number
          exit_price: number | null
          id: string
          master_id: string
          opened_at: string
          pnl_pct: number | null
          side: string
          status: string
          symbol: string
          updated_at: string
          volume: number
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          entry_price: number
          exit_price?: number | null
          id?: string
          master_id: string
          opened_at?: string
          pnl_pct?: number | null
          side: string
          status?: string
          symbol: string
          updated_at?: string
          volume: number
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          master_id?: string
          opened_at?: string
          pnl_pct?: number | null
          side?: string
          status?: string
          symbol?: string
          updated_at?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "copy_master_trades_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "copy_masters"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_masters: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_active: boolean
          min_capital: number
          name: string
          performance_fee_pct: number
          risk_level: string
          total_return_pct: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          min_capital?: number
          name: string
          performance_fee_pct?: number
          risk_level?: string
          total_return_pct?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          min_capital?: number
          name?: string
          performance_fee_pct?: number
          risk_level?: string
          total_return_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      copy_performance_daily: {
        Row: {
          avg_latency_ms: number | null
          created_at: string
          day: string
          executed_count: number
          failed_count: number
          id: string
          master_id: string | null
          skipped_count: number
          subscription_id: string | null
          success_rate: number | null
          updated_at: string
        }
        Insert: {
          avg_latency_ms?: number | null
          created_at?: string
          day: string
          executed_count?: number
          failed_count?: number
          id?: string
          master_id?: string | null
          skipped_count?: number
          subscription_id?: string | null
          success_rate?: number | null
          updated_at?: string
        }
        Update: {
          avg_latency_ms?: number | null
          created_at?: string
          day?: string
          executed_count?: number
          failed_count?: number
          id?: string
          master_id?: string | null
          skipped_count?: number
          subscription_id?: string | null
          success_rate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      copy_subscriptions: {
        Row: {
          allocated_amount: number
          closed_at: string | null
          copy_ratio: number
          created_at: string
          currency: string
          id: string
          master_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_amount: number
          closed_at?: string | null
          copy_ratio?: number
          created_at?: string
          currency?: string
          id?: string
          master_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_amount?: number
          closed_at?: string | null
          copy_ratio?: number
          created_at?: string
          currency?: string
          id?: string
          master_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_subscriptions_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "copy_masters"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_trade_fills: {
        Row: {
          allocated_amount: number
          created_at: string
          id: string
          master_trade_id: string
          pnl: number
          status: string
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_amount: number
          created_at?: string
          id?: string
          master_trade_id: string
          pnl?: number
          status?: string
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string
          id?: string
          master_trade_id?: string
          pnl?: number
          status?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_trade_fills_master_trade_id_fkey"
            columns: ["master_trade_id"]
            isOneToOne: false
            referencedRelation: "copy_master_trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_trade_fills_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "copy_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
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
          tx_hash: string | null
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
          tx_hash?: string | null
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
          tx_hash?: string | null
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
      fee_events: {
        Row: {
          base_amount: number
          created_at: string
          currency: string
          fee_amount: number
          id: string
          kind: Database["public"]["Enums"]["fee_kind"]
          metadata: Json
          package_id: string | null
          period_end: string | null
          period_start: string | null
          rate_pct: number
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          base_amount: number
          created_at?: string
          currency?: string
          fee_amount: number
          id?: string
          kind: Database["public"]["Enums"]["fee_kind"]
          metadata?: Json
          package_id?: string | null
          period_end?: string | null
          period_start?: string | null
          rate_pct: number
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          base_amount?: number
          created_at?: string
          currency?: string
          fee_amount?: number
          id?: string
          kind?: Database["public"]["Enums"]["fee_kind"]
          metadata?: Json
          package_id?: string | null
          period_end?: string | null
          period_start?: string | null
          rate_pct?: number
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_events_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_events_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_aum_by_package"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "fee_events_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_portfolio_ranking"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "fee_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
      instruments: {
        Row: {
          base_currency: string | null
          category: string
          contract_size: number
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          lot_step: number
          margin_rate: number
          max_lot: number
          min_lot: number
          pip_size: number
          price_precision: number
          quote_currency: string | null
          symbol: string
        }
        Insert: {
          base_currency?: string | null
          category: string
          contract_size?: number
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          lot_step?: number
          margin_rate?: number
          max_lot?: number
          min_lot?: number
          pip_size?: number
          price_precision?: number
          quote_currency?: string | null
          symbol: string
        }
        Update: {
          base_currency?: string | null
          category?: string
          contract_size?: number
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          lot_step?: number
          margin_rate?: number
          max_lot?: number
          min_lot?: number
          pip_size?: number
          price_precision?: number
          quote_currency?: string | null
          symbol?: string
        }
        Relationships: []
      }
      investment_lifecycle_events: {
        Row: {
          actor_id: string | null
          amount: number | null
          created_at: string
          currency: string | null
          event: Database["public"]["Enums"]["investment_event"]
          id: string
          metadata: Json
          reference_id: string | null
          reference_table: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          amount?: number | null
          created_at?: string
          currency?: string | null
          event: Database["public"]["Enums"]["investment_event"]
          id?: string
          metadata?: Json
          reference_id?: string | null
          reference_table?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          amount?: number | null
          created_at?: string
          currency?: string | null
          event?: Database["public"]["Enums"]["investment_event"]
          id?: string
          metadata?: Json
          reference_id?: string | null
          reference_table?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_lifecycle_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
      ledger_entries: {
        Row: {
          account: Database["public"]["Enums"]["ledger_account"]
          amount: number
          created_at: string
          currency: string
          direction: number
          event: Database["public"]["Enums"]["ledger_event"]
          id: string
          metadata: Json
          reference_id: string | null
          reference_table: string | null
          tx_id: string
          user_id: string
        }
        Insert: {
          account: Database["public"]["Enums"]["ledger_account"]
          amount: number
          created_at?: string
          currency?: string
          direction: number
          event: Database["public"]["Enums"]["ledger_event"]
          id?: string
          metadata?: Json
          reference_id?: string | null
          reference_table?: string | null
          tx_id: string
          user_id: string
        }
        Update: {
          account?: Database["public"]["Enums"]["ledger_account"]
          amount?: number
          created_at?: string
          currency?: string
          direction?: number
          event?: Database["public"]["Enums"]["ledger_event"]
          id?: string
          metadata?: Json
          reference_id?: string | null
          reference_table?: string | null
          tx_id?: string
          user_id?: string
        }
        Relationships: []
      }
      market_data_candles: {
        Row: {
          bucket_start: string
          close: number
          created_at: string
          high: number
          id: string
          low: number
          open: number
          provider_code: string
          symbol: string
          timeframe: string
          updated_at: string
          volume: number | null
        }
        Insert: {
          bucket_start: string
          close: number
          created_at?: string
          high: number
          id?: string
          low: number
          open: number
          provider_code: string
          symbol: string
          timeframe: string
          updated_at?: string
          volume?: number | null
        }
        Update: {
          bucket_start?: string
          close?: number
          created_at?: string
          high?: number
          id?: string
          low?: number
          open?: number
          provider_code?: string
          symbol?: string
          timeframe?: string
          updated_at?: string
          volume?: number | null
        }
        Relationships: []
      }
      market_data_failover_history: {
        Row: {
          from_provider: string | null
          id: string
          metadata: Json
          reason: string | null
          to_provider: string
          triggered_at: string
          triggered_by: string | null
        }
        Insert: {
          from_provider?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
          to_provider: string
          triggered_at?: string
          triggered_by?: string | null
        }
        Update: {
          from_provider?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
          to_provider?: string
          triggered_at?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      market_data_health: {
        Row: {
          failure_count: number
          id: string
          is_current_active: boolean
          last_failure_at: string | null
          last_success_at: string | null
          provider_code: string
          recovery_count: number
          status: string
          updated_at: string
          uptime_pct: number | null
        }
        Insert: {
          failure_count?: number
          id?: string
          is_current_active?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          provider_code: string
          recovery_count?: number
          status?: string
          updated_at?: string
          uptime_pct?: number | null
        }
        Update: {
          failure_count?: number
          id?: string
          is_current_active?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          provider_code?: string
          recovery_count?: number
          status?: string
          updated_at?: string
          uptime_pct?: number | null
        }
        Relationships: []
      }
      market_data_latency_samples: {
        Row: {
          channel: string
          id: number
          latency_ms: number
          metadata: Json
          provider_code: string
          sampled_at: string
        }
        Insert: {
          channel: string
          id?: number
          latency_ms: number
          metadata?: Json
          provider_code: string
          sampled_at?: string
        }
        Update: {
          channel?: string
          id?: number
          latency_ms?: number
          metadata?: Json
          provider_code?: string
          sampled_at?: string
        }
        Relationships: []
      }
      market_data_prices_latest: {
        Row: {
          ask: number | null
          asset_class: string | null
          bid: number | null
          id: string
          metadata: Json
          price: number
          price_time: string
          provider_code: string
          received_at: string
          symbol: string
          volume: number | null
        }
        Insert: {
          ask?: number | null
          asset_class?: string | null
          bid?: number | null
          id?: string
          metadata?: Json
          price: number
          price_time: string
          provider_code: string
          received_at?: string
          symbol: string
          volume?: number | null
        }
        Update: {
          ask?: number | null
          asset_class?: string | null
          bid?: number | null
          id?: string
          metadata?: Json
          price?: number
          price_time?: string
          provider_code?: string
          received_at?: string
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
      market_data_providers: {
        Row: {
          base_url: string | null
          code: string
          config: Json
          created_at: string
          id: string
          is_enabled: boolean
          name: string
          priority: number
          role: string
          supports_polling: boolean
          supports_websocket: boolean
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          code: string
          config?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          name: string
          priority?: number
          role?: string
          supports_polling?: boolean
          supports_websocket?: boolean
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          code?: string
          config?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          name?: string
          priority?: number
          role?: string
          supports_polling?: boolean
          supports_websocket?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      market_data_ticks: {
        Row: {
          id: number
          price: number
          price_time: string
          provider_code: string
          received_at: string
          symbol: string
          volume: number | null
        }
        Insert: {
          id?: number
          price: number
          price_time: string
          provider_code: string
          received_at?: string
          symbol: string
          volume?: number | null
        }
        Update: {
          id?: number
          price?: number
          price_time?: string
          provider_code?: string
          received_at?: string
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
      market_sessions: {
        Row: {
          closes_at: string | null
          created_at: string
          holidays: string[] | null
          id: string
          is_24x7: boolean
          market_code: string
          opens_at: string | null
          session_name: string
          timezone: string
          updated_at: string
          weekdays: number[]
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          holidays?: string[] | null
          id?: string
          is_24x7?: boolean
          market_code: string
          opens_at?: string | null
          session_name: string
          timezone?: string
          updated_at?: string
          weekdays?: number[]
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          holidays?: string[] | null
          id?: string
          is_24x7?: boolean
          market_code?: string
          opens_at?: string | null
          session_name?: string
          timezone?: string
          updated_at?: string
          weekdays?: number[]
        }
        Relationships: []
      }
      master_eligibility_rules: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          max_drawdown_pct: number
          min_account_age_days: number
          min_closed_trades: number
          min_monthly_return_pct: number
          min_trading_days: number
          min_trust_score: number
          min_verification_level: string
          min_win_rate_pct: number
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_drawdown_pct?: number
          min_account_age_days?: number
          min_closed_trades?: number
          min_monthly_return_pct?: number
          min_trading_days?: number
          min_trust_score?: number
          min_verification_level?: string
          min_win_rate_pct?: number
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_drawdown_pct?: number
          min_account_age_days?: number
          min_closed_trades?: number
          min_monthly_return_pct?: number
          min_trading_days?: number
          min_trust_score?: number
          min_verification_level?: string
          min_win_rate_pct?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      master_levels: {
        Row: {
          badge: string | null
          benefits: Json
          code: string
          created_at: string
          id: string
          is_active: boolean
          min_assets_copied: number
          min_followers: number
          min_months_active: number
          min_performance_pct: number
          min_score: number
          name: string
          rank: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          benefits?: Json
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_assets_copied?: number
          min_followers?: number
          min_months_active?: number
          min_performance_pct?: number
          min_score?: number
          name: string
          rank: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          benefits?: Json
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_assets_copied?: number
          min_followers?: number
          min_months_active?: number
          min_performance_pct?: number
          min_score?: number
          name?: string
          rank?: number
          updated_at?: string
        }
        Relationships: []
      }
      master_trader_applications: {
        Row: {
          admin_notes: string | null
          approved_master_id: string | null
          auto_eligibility_passed: boolean | null
          avg_holding_time: string | null
          biography: string | null
          created_at: string
          eligibility_snapshot: Json
          experience_years: number | null
          id: string
          preferred_assets: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          social_links: Json
          status: string
          strategy_description: string | null
          trading_markets: string[]
          trading_style: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_master_id?: string | null
          auto_eligibility_passed?: boolean | null
          avg_holding_time?: string | null
          biography?: string | null
          created_at?: string
          eligibility_snapshot?: Json
          experience_years?: number | null
          id?: string
          preferred_assets?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          social_links?: Json
          status?: string
          strategy_description?: string | null
          trading_markets?: string[]
          trading_style?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_master_id?: string | null
          auto_eligibility_passed?: boolean | null
          avg_holding_time?: string | null
          biography?: string | null
          created_at?: string
          eligibility_snapshot?: Json
          experience_years?: number | null
          id?: string
          preferred_assets?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          social_links?: Json
          status?: string
          strategy_description?: string | null
          trading_markets?: string[]
          trading_style?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_trader_applications_approved_master_id_fkey"
            columns: ["approved_master_id"]
            isOneToOne: false
            referencedRelation: "copy_masters"
            referencedColumns: ["id"]
          },
        ]
      }
      master_trader_audit: {
        Row: {
          actor_id: string | null
          application_id: string | null
          created_at: string
          event: string
          id: string
          master_profile_id: string | null
          payload: Json
          target_user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          application_id?: string | null
          created_at?: string
          event: string
          id?: string
          master_profile_id?: string | null
          payload?: Json
          target_user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          application_id?: string | null
          created_at?: string
          event?: string
          id?: string
          master_profile_id?: string | null
          payload?: Json
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_trader_audit_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "master_trader_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_trader_audit_master_profile_id_fkey"
            columns: ["master_profile_id"]
            isOneToOne: false
            referencedRelation: "master_trader_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_trader_audit_master_profile_id_fkey"
            columns: ["master_profile_id"]
            isOneToOne: false
            referencedRelation: "v_master_traders_public"
            referencedColumns: ["id"]
          },
        ]
      }
      master_trader_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_code: string
          expires_at: string | null
          id: string
          master_profile_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_code: string
          expires_at?: string | null
          id?: string
          master_profile_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_code?: string
          expires_at?: string | null
          id?: string
          master_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_trader_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "master_verification_badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "master_trader_badges_master_profile_id_fkey"
            columns: ["master_profile_id"]
            isOneToOne: false
            referencedRelation: "master_trader_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_trader_badges_master_profile_id_fkey"
            columns: ["master_profile_id"]
            isOneToOne: false
            referencedRelation: "v_master_traders_public"
            referencedColumns: ["id"]
          },
        ]
      }
      master_trader_profiles: {
        Row: {
          account_age_days: number | null
          annual_return_pct: number | null
          application_id: string | null
          assets_copied: number
          avatar_url: string | null
          average_return_pct: number | null
          avg_holding_time: string | null
          avg_trade_duration_hours: number | null
          biography: string | null
          copy_master_id: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          followers_count: number
          id: string
          is_banned: boolean
          is_featured: boolean
          is_hidden: boolean
          languages: string[]
          level_code: string | null
          markets: string[]
          max_drawdown_pct: number | null
          metadata: Json
          monthly_return_pct: number | null
          monthly_stats: Json
          portfolio_size: number | null
          recent_performance: Json
          risk_category: string | null
          sharpe_ratio: number | null
          status: string
          subscribers_count: number
          trading_since: string | null
          trading_style: string | null
          trust_score: number | null
          updated_at: string
          user_id: string
          win_rate_pct: number | null
          years_experience: number | null
        }
        Insert: {
          account_age_days?: number | null
          annual_return_pct?: number | null
          application_id?: string | null
          assets_copied?: number
          avatar_url?: string | null
          average_return_pct?: number | null
          avg_holding_time?: string | null
          avg_trade_duration_hours?: number | null
          biography?: string | null
          copy_master_id?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number
          id?: string
          is_banned?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          languages?: string[]
          level_code?: string | null
          markets?: string[]
          max_drawdown_pct?: number | null
          metadata?: Json
          monthly_return_pct?: number | null
          monthly_stats?: Json
          portfolio_size?: number | null
          recent_performance?: Json
          risk_category?: string | null
          sharpe_ratio?: number | null
          status?: string
          subscribers_count?: number
          trading_since?: string | null
          trading_style?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          win_rate_pct?: number | null
          years_experience?: number | null
        }
        Update: {
          account_age_days?: number | null
          annual_return_pct?: number | null
          application_id?: string | null
          assets_copied?: number
          avatar_url?: string | null
          average_return_pct?: number | null
          avg_holding_time?: string | null
          avg_trade_duration_hours?: number | null
          biography?: string | null
          copy_master_id?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number
          id?: string
          is_banned?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          languages?: string[]
          level_code?: string | null
          markets?: string[]
          max_drawdown_pct?: number | null
          metadata?: Json
          monthly_return_pct?: number | null
          monthly_stats?: Json
          portfolio_size?: number | null
          recent_performance?: Json
          risk_category?: string | null
          sharpe_ratio?: number | null
          status?: string
          subscribers_count?: number
          trading_since?: string | null
          trading_style?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          win_rate_pct?: number | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "master_trader_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "master_trader_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_trader_profiles_copy_master_id_fkey"
            columns: ["copy_master_id"]
            isOneToOne: true
            referencedRelation: "copy_masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_trader_profiles_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "master_levels"
            referencedColumns: ["code"]
          },
        ]
      }
      master_verification_badges: {
        Row: {
          code: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
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
      nav_snapshots: {
        Row: {
          active_investors: number
          aum: number
          created_at: string
          currency: string
          id: string
          metadata: Json
          nav_per_unit: number
          package_id: string
          snapshot_date: string
        }
        Insert: {
          active_investors?: number
          aum?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          nav_per_unit?: number
          package_id: string
          snapshot_date?: string
        }
        Update: {
          active_investors?: number
          aum?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          nav_per_unit?: number
          package_id?: string
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_snapshots_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nav_snapshots_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_aum_by_package"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "nav_snapshots_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_portfolio_ranking"
            referencedColumns: ["package_id"]
          },
        ]
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
      package_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          asset_allocation: Json
          benchmark_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          effective_date: string
          id: string
          investment_strategy: string | null
          is_current: boolean
          management_fee_pct: number | null
          metadata: Json
          package_id: string
          performance_fee_pct: number | null
          risk_level: string | null
          updated_at: string
          version_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          asset_allocation?: Json
          benchmark_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_date?: string
          id?: string
          investment_strategy?: string | null
          is_current?: boolean
          management_fee_pct?: number | null
          metadata?: Json
          package_id: string
          performance_fee_pct?: number | null
          risk_level?: string | null
          updated_at?: string
          version_number: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          asset_allocation?: Json
          benchmark_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_date?: string
          id?: string
          investment_strategy?: string | null
          is_current?: boolean
          management_fee_pct?: number | null
          metadata?: Json
          package_id?: string
          performance_fee_pct?: number | null
          risk_level?: string | null
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_versions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_versions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_aum_by_package"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "package_versions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_portfolio_ranking"
            referencedColumns: ["package_id"]
          },
        ]
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
      portfolio_health_scores: {
        Row: {
          as_of_date: string
          capital_preservation_score: number | null
          consistency_score: number | null
          created_at: string
          drawdown_score: number | null
          id: string
          metadata: Json
          overall_score: number
          package_id: string
          performance_score: number | null
          risk_score: number | null
          satisfaction_score: number | null
          updated_at: string
        }
        Insert: {
          as_of_date?: string
          capital_preservation_score?: number | null
          consistency_score?: number | null
          created_at?: string
          drawdown_score?: number | null
          id?: string
          metadata?: Json
          overall_score: number
          package_id: string
          performance_score?: number | null
          risk_score?: number | null
          satisfaction_score?: number | null
          updated_at?: string
        }
        Update: {
          as_of_date?: string
          capital_preservation_score?: number | null
          consistency_score?: number | null
          created_at?: string
          drawdown_score?: number | null
          id?: string
          metadata?: Json
          overall_score?: number
          package_id?: string
          performance_score?: number | null
          risk_score?: number | null
          satisfaction_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_health_scores_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_health_scores_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_aum_by_package"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "portfolio_health_scores_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_portfolio_ranking"
            referencedColumns: ["package_id"]
          },
        ]
      }
      portfolio_managers: {
        Row: {
          allocation_pct: number
          assigned_at: string
          created_at: string
          id: string
          is_active: boolean
          manager_id: string
          package_id: string
          updated_at: string
        }
        Insert: {
          allocation_pct?: number
          assigned_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_id: string
          package_id: string
          updated_at?: string
        }
        Update: {
          allocation_pct?: number
          assigned_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_id?: string
          package_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_managers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_managers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_aum_by_package"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "portfolio_managers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_portfolio_ranking"
            referencedColumns: ["package_id"]
          },
        ]
      }
      portfolio_risk_metrics: {
        Row: {
          benchmark_id: string | null
          benchmark_return_pct: number | null
          calmar_ratio: number | null
          created_at: string
          id: string
          max_drawdown_pct: number | null
          metadata: Json
          monthly_win_ratio: number | null
          package_id: string
          package_version_id: string | null
          period_end: string
          period_start: string
          portfolio_return_pct: number | null
          profit_consistency: number | null
          risk_score: number | null
          sharpe_ratio: number | null
          sortino_ratio: number | null
          stability_score: number | null
          tracking_difference_pct: number | null
          updated_at: string
          volatility_pct: number | null
        }
        Insert: {
          benchmark_id?: string | null
          benchmark_return_pct?: number | null
          calmar_ratio?: number | null
          created_at?: string
          id?: string
          max_drawdown_pct?: number | null
          metadata?: Json
          monthly_win_ratio?: number | null
          package_id: string
          package_version_id?: string | null
          period_end: string
          period_start: string
          portfolio_return_pct?: number | null
          profit_consistency?: number | null
          risk_score?: number | null
          sharpe_ratio?: number | null
          sortino_ratio?: number | null
          stability_score?: number | null
          tracking_difference_pct?: number | null
          updated_at?: string
          volatility_pct?: number | null
        }
        Update: {
          benchmark_id?: string | null
          benchmark_return_pct?: number | null
          calmar_ratio?: number | null
          created_at?: string
          id?: string
          max_drawdown_pct?: number | null
          metadata?: Json
          monthly_win_ratio?: number | null
          package_id?: string
          package_version_id?: string | null
          period_end?: string
          period_start?: string
          portfolio_return_pct?: number | null
          profit_consistency?: number | null
          risk_score?: number | null
          sharpe_ratio?: number | null
          sortino_ratio?: number | null
          stability_score?: number | null
          tracking_difference_pct?: number | null
          updated_at?: string
          volatility_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_risk_metrics_benchmark_id_fkey"
            columns: ["benchmark_id"]
            isOneToOne: false
            referencedRelation: "benchmarks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_risk_metrics_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_risk_metrics_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_aum_by_package"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "portfolio_risk_metrics_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_portfolio_ranking"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "portfolio_risk_metrics_package_version_id_fkey"
            columns: ["package_version_id"]
            isOneToOne: false
            referencedRelation: "package_versions"
            referencedColumns: ["id"]
          },
        ]
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
      price_alerts: {
        Row: {
          condition: string
          created_at: string
          enabled: boolean
          id: string
          symbol: string
          target_price: number
          triggered: boolean
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          enabled?: boolean
          id?: string
          symbol: string
          target_price: number
          triggered?: boolean
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          enabled?: boolean
          id?: string
          symbol?: string
          target_price?: number
          triggered?: boolean
          triggered_at?: string | null
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
          package_version_id: string | null
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
          package_version_id?: string | null
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
          package_version_id?: string | null
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
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_aum_by_package"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_portfolio_ranking"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "subscriptions_package_version_id_fkey"
            columns: ["package_version_id"]
            isOneToOne: false
            referencedRelation: "package_versions"
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
      trading_accounts: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          leverage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          leverage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          leverage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trading_audit_log: {
        Row: {
          created_at: string
          event: string
          id: string
          payload: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          payload?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          payload?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      trading_history: {
        Row: {
          account_id: string
          close_price: number
          closed_at: string
          commission: number
          entry_price: number
          id: string
          opened_at: string
          profit: number
          side: string
          swap: number
          symbol: string
          user_id: string
          volume: number
        }
        Insert: {
          account_id: string
          close_price: number
          closed_at?: string
          commission?: number
          entry_price: number
          id?: string
          opened_at: string
          profit: number
          side: string
          swap?: number
          symbol: string
          user_id: string
          volume: number
        }
        Update: {
          account_id?: string
          close_price?: number
          closed_at?: string
          commission?: number
          entry_price?: number
          id?: string
          opened_at?: string
          profit?: number
          side?: string
          swap?: number
          symbol?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "trading_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_orders: {
        Row: {
          account_id: string
          created_at: string
          filled_at: string | null
          filled_price: number | null
          id: string
          order_type: string
          price: number | null
          side: string
          status: string
          stop_loss: number | null
          stop_price: number | null
          symbol: string
          take_profit: number | null
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          account_id: string
          created_at?: string
          filled_at?: string | null
          filled_price?: number | null
          id?: string
          order_type: string
          price?: number | null
          side: string
          status?: string
          stop_loss?: number | null
          stop_price?: number | null
          symbol: string
          take_profit?: number | null
          updated_at?: string
          user_id: string
          volume: number
        }
        Update: {
          account_id?: string
          created_at?: string
          filled_at?: string | null
          filled_price?: number | null
          id?: string
          order_type?: string
          price?: number | null
          side?: string
          status?: string
          stop_loss?: number | null
          stop_price?: number | null
          symbol?: string
          take_profit?: number | null
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "trading_orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_positions: {
        Row: {
          account_id: string
          commission: number
          entry_price: number
          id: string
          opened_at: string
          side: string
          stop_loss: number | null
          swap: number
          symbol: string
          take_profit: number | null
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          account_id: string
          commission?: number
          entry_price: number
          id?: string
          opened_at?: string
          side: string
          stop_loss?: number | null
          swap?: number
          symbol: string
          take_profit?: number | null
          updated_at?: string
          user_id: string
          volume: number
        }
        Update: {
          account_id?: string
          commission?: number
          entry_price?: number
          id?: string
          opened_at?: string
          side?: string
          stop_loss?: number | null
          swap?: number
          symbol?: string
          take_profit?: number | null
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "trading_positions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
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
      watchlist_items: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          symbol: string
          user_id: string
          watchlist_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          symbol: string
          user_id: string
          watchlist_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          symbol?: string
          user_id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
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
      v_admin_aum_dashboard: {
        Row: {
          active_investors: number | null
          aum: number | null
          monthly_fee_revenue: number | null
          monthly_inflows: number | null
          monthly_outflows: number | null
          total_users: number | null
        }
        Relationships: []
      }
      v_aum_by_package: {
        Row: {
          active_investors: number | null
          aum: number | null
          name: string | null
          package_id: string | null
        }
        Relationships: []
      }
      v_copy_queue_admin: {
        Row: {
          attempts: number | null
          completed_at: string | null
          enqueued_at: string | null
          event_type: string | null
          id: string | null
          last_error: string | null
          master_id: string | null
          master_name: string | null
          master_trade_id: string | null
          side: string | null
          started_at: string | null
          status: string | null
          symbol: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copy_execution_queue_master_trade_id_fkey"
            columns: ["master_trade_id"]
            isOneToOne: false
            referencedRelation: "copy_master_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      v_investor_analytics: {
        Row: {
          active_capital: number | null
          display_name: string | null
          email: string | null
          investment_age_days: number | null
          joined_at: string | null
          net_investment: number | null
          total_deposits: number | null
          total_fees: number | null
          total_profit: number | null
          total_withdrawals: number | null
          user_id: string | null
        }
        Insert: {
          active_capital?: never
          display_name?: string | null
          email?: string | null
          investment_age_days?: never
          joined_at?: string | null
          net_investment?: never
          total_deposits?: never
          total_fees?: never
          total_profit?: never
          total_withdrawals?: never
          user_id?: string | null
        }
        Update: {
          active_capital?: never
          display_name?: string | null
          email?: string | null
          investment_age_days?: never
          joined_at?: string | null
          net_investment?: never
          total_deposits?: never
          total_fees?: never
          total_profit?: never
          total_withdrawals?: never
          user_id?: string | null
        }
        Relationships: []
      }
      v_investor_summary: {
        Row: {
          active_capital: number | null
          total_deposited: number | null
          total_fees: number | null
          total_profits: number | null
          total_referral: number | null
          total_withdrawn: number | null
          user_id: string | null
        }
        Insert: {
          active_capital?: never
          total_deposited?: never
          total_fees?: never
          total_profits?: never
          total_referral?: never
          total_withdrawn?: never
          user_id?: string | null
        }
        Update: {
          active_capital?: never
          total_deposited?: never
          total_fees?: never
          total_profits?: never
          total_referral?: never
          total_withdrawn?: never
          user_id?: string | null
        }
        Relationships: []
      }
      v_ledger_balances: {
        Row: {
          account: Database["public"]["Enums"]["ledger_account"] | null
          balance: number | null
          currency: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_master_traders_public: {
        Row: {
          account_age_days: number | null
          annual_return_pct: number | null
          assets_copied: number | null
          avatar_url: string | null
          average_return_pct: number | null
          avg_holding_time: string | null
          avg_trade_duration_hours: number | null
          badges: Json | null
          biography: string | null
          copy_master_id: string | null
          cover_url: string | null
          display_name: string | null
          followers_count: number | null
          id: string | null
          is_featured: boolean | null
          languages: string[] | null
          level_badge: string | null
          level_code: string | null
          level_name: string | null
          level_rank: number | null
          markets: string[] | null
          max_drawdown_pct: number | null
          monthly_return_pct: number | null
          monthly_stats: Json | null
          portfolio_size: number | null
          recent_performance: Json | null
          risk_category: string | null
          sharpe_ratio: number | null
          subscribers_count: number | null
          trading_since: string | null
          trading_style: string | null
          trust_score: number | null
          user_id: string | null
          win_rate_pct: number | null
          years_experience: number | null
        }
        Relationships: [
          {
            foreignKeyName: "master_trader_profiles_copy_master_id_fkey"
            columns: ["copy_master_id"]
            isOneToOne: true
            referencedRelation: "copy_masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_trader_profiles_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "master_levels"
            referencedColumns: ["code"]
          },
        ]
      }
      v_md_latest_prices: {
        Row: {
          price: number | null
          price_time: string | null
          provider_code: string | null
          received_at: string | null
          symbol: string | null
        }
        Relationships: []
      }
      v_md_provider_health: {
        Row: {
          avg_latency_1h: number | null
          code: string | null
          failure_count: number | null
          is_current_active: boolean | null
          is_enabled: boolean | null
          last_failure_at: string | null
          last_success_at: string | null
          name: string | null
          priority: number | null
          recovery_count: number | null
          role: string | null
          status: string | null
        }
        Relationships: []
      }
      v_portfolio_ranking: {
        Row: {
          aum: number | null
          health_score: number | null
          investors: number | null
          latest_return_pct: number | null
          max_drawdown_pct: number | null
          name: string | null
          package_id: string | null
          risk_score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_adjust_balance: {
        Args: { _delta: number; _reason: string; _user_id: string }
        Returns: Json
      }
      close_master_trade: {
        Args: { _exit_price: number; _trade_id: string }
        Returns: Json
      }
      copy_calc_follower_lot: {
        Args: {
          _master_capital: number
          _master_lot: number
          _settings: Database["public"]["Tables"]["copy_follower_settings"]["Row"]
        }
        Returns: number
      }
      copy_enqueue_master_event: {
        Args: {
          _dedupe_key?: string
          _event_type: string
          _master_id: string
          _master_trade_id: string
          _payload?: Json
        }
        Returns: string
      }
      copy_force_sync: { Args: { _master_id: string }; Returns: Json }
      copy_pause_subscription: {
        Args: { _subscription_id: string }
        Returns: Json
      }
      copy_process_queue_item: { Args: { _queue_id: string }; Returns: Json }
      copy_resume_subscription: {
        Args: { _subscription_id: string }
        Returns: Json
      }
      copy_retry_failed: { Args: { _queue_id: string }; Returns: Json }
      distribute_weekly_profits: { Args: never; Returns: number }
      email_has_role: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      enter_competition: {
        Args: { _competition_id: string; _tier_fee: number }
        Returns: string
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
      ledger_post: {
        Args: {
          _amount: number
          _credit: Database["public"]["Enums"]["ledger_account"]
          _currency: string
          _debit: Database["public"]["Enums"]["ledger_account"]
          _event: Database["public"]["Enums"]["ledger_event"]
          _metadata?: Json
          _ref_id: string
          _ref_table: string
          _user_id: string
        }
        Returns: string
      }
      master_application_decide: {
        Args: {
          _application_id: string
          _decision: string
          _level_code?: string
          _notes?: string
        }
        Returns: Json
      }
      master_profile_action: {
        Args: {
          _action: string
          _notes?: string
          _profile_id: string
          _value?: string
        }
        Returns: Json
      }
      md_force_failover: {
        Args: { _reason?: string; _to_provider: string }
        Returns: Json
      }
      md_get_active_provider: { Args: never; Returns: string }
      md_ingest_price: {
        Args: {
          _asset_class?: string
          _price: number
          _price_time: string
          _provider: string
          _symbol: string
          _volume?: number
        }
        Returns: Json
      }
      md_record_health: {
        Args: { _code: string; _latency_ms?: number; _success: boolean }
        Returns: undefined
      }
      md_toggle_provider: {
        Args: { _code: string; _enabled: boolean }
        Returns: Json
      }
      subscribe_to_master: {
        Args: { _amount: number; _master_id: string }
        Returns: Json
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
      fee_kind: "management" | "performance" | "entry" | "exit" | "other"
      investment_event:
        | "subscription_created"
        | "subscription_activated"
        | "subscription_paused"
        | "subscription_closed"
        | "capital_increased"
        | "capital_reduced"
        | "redemption_requested"
        | "redemption_approved"
        | "redemption_rejected"
        | "distribution_credited"
        | "fee_charged"
        | "manager_assigned"
        | "manager_unassigned"
      ledger_account:
        | "wallet"
        | "subscription"
        | "competition"
        | "copy_allocation"
        | "profit_income"
        | "referral_income"
        | "fee"
        | "adjustment"
        | "external"
      ledger_event:
        | "deposit_approved"
        | "withdrawal_approved"
        | "withdrawal_reversed"
        | "subscription_open"
        | "subscription_close"
        | "competition_enter"
        | "competition_settle"
        | "copy_allocate"
        | "copy_settle"
        | "profit_distribution"
        | "referral_earning"
        | "admin_adjustment"
        | "fee_charge"
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
      fee_kind: ["management", "performance", "entry", "exit", "other"],
      investment_event: [
        "subscription_created",
        "subscription_activated",
        "subscription_paused",
        "subscription_closed",
        "capital_increased",
        "capital_reduced",
        "redemption_requested",
        "redemption_approved",
        "redemption_rejected",
        "distribution_credited",
        "fee_charged",
        "manager_assigned",
        "manager_unassigned",
      ],
      ledger_account: [
        "wallet",
        "subscription",
        "competition",
        "copy_allocation",
        "profit_income",
        "referral_income",
        "fee",
        "adjustment",
        "external",
      ],
      ledger_event: [
        "deposit_approved",
        "withdrawal_approved",
        "withdrawal_reversed",
        "subscription_open",
        "subscription_close",
        "competition_enter",
        "competition_settle",
        "copy_allocate",
        "copy_settle",
        "profit_distribution",
        "referral_earning",
        "admin_adjustment",
        "fee_charge",
      ],
      risk_preference: ["conservative", "balanced", "aggressive"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: ["open", "pending", "resolved", "closed"],
      verification_status: ["unverified", "pending", "approved", "rejected"],
    },
  },
} as const
