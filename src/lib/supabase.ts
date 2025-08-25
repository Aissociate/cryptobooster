import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types générés automatiquement par Supabase
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          subscription: 'free' | 'basic' | 'premium' | 'pro';
          role: 'visitor' | 'member' | 'admin';
          created_at: string;
          last_login: string;
          settings: any;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string | null;
          subscription?: 'free' | 'basic' | 'premium' | 'pro';
          role?: 'visitor' | 'member' | 'admin';
          created_at?: string;
          last_login?: string;
          settings?: any;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          subscription?: 'free' | 'basic' | 'premium' | 'pro';
          role?: 'visitor' | 'member' | 'admin';
          created_at?: string;
          last_login?: string;
          settings?: any;
          updated_at?: string;
        };
      };
      crypto_analyses: {
        Row: {
          id: string;
          crypto_id: string;
          crypto_symbol: string;
          crypto_name: string;
          current_price: number;
          market_cap: number | null;
          market_cap_rank: number | null;
          volume_24h: number | null;
          price_changes: any;
          ai_analysis: any;
          ai_score: number;
          chart_urls: any;
          timeframes: any;
          trends: any;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          crypto_id: string;
          crypto_symbol: string;
          crypto_name: string;
          current_price: number;
          market_cap?: number | null;
          market_cap_rank?: number | null;
          volume_24h?: number | null;
          price_changes?: any;
          ai_analysis: any;
          ai_score?: number;
          chart_urls?: any;
          timeframes?: any;
          trends?: any;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          crypto_id?: string;
          crypto_symbol?: string;
          crypto_name?: string;
          current_price?: number;
          market_cap?: number | null;
          market_cap_rank?: number | null;
          volume_24h?: number | null;
          price_changes?: any;
          ai_analysis?: any;
          ai_score?: number;
          chart_urls?: any;
          timeframes?: any;
          trends?: any;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trading_positions: {
        Row: {
          id: string;
          user_id: string;
          crypto_id: string;
          crypto_symbol: string;
          crypto_name: string;
          crypto_image: string | null;
          trading_signal: any;
          ai_analysis_data: any | null;
          pattern_analysis: any | null;
          status: 'pending' | 'active' | 'closed' | 'cancelled';
          target_hit: 'none' | 'tp1' | 'tp2' | 'sl';
          notes: string | null;
          is_manually_edited: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          crypto_id: string;
          crypto_symbol: string;
          crypto_name: string;
          crypto_image?: string | null;
          trading_signal: any;
          ai_analysis_data?: any | null;
          pattern_analysis?: any | null;
          status?: 'pending' | 'active' | 'closed' | 'cancelled';
          target_hit?: 'none' | 'tp1' | 'tp2' | 'sl';
          notes?: string | null;
          is_manually_edited?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          crypto_id?: string;
          crypto_symbol?: string;
          crypto_name?: string;
          crypto_image?: string | null;
          trading_signal?: any;
          ai_analysis_data?: any | null;
          pattern_analysis?: any | null;
          status?: 'pending' | 'active' | 'closed' | 'cancelled';
          target_hit?: 'none' | 'tp1' | 'tp2' | 'sl';
          notes?: string | null;
          is_manually_edited?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      signal_updates: {
        Row: {
          id: string;
          position_id: string;
          user_id: string;
          update_type: string;
          old_data: any | null;
          new_data: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          position_id: string;
          user_id: string;
          update_type: string;
          old_data?: any | null;
          new_data?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          position_id?: string;
          user_id?: string;
          update_type?: string;
          old_data?: any | null;
          new_data?: any | null;
          created_at?: string;
        };
      };
      crypto_snapshots: {
        Row: {
          id: string;
          crypto_id: string;
          snapshot_data: any;
          snapshot_type: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          crypto_id: string;
          snapshot_data: any;
          snapshot_type?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          crypto_id?: string;
          snapshot_data?: any;
          snapshot_type?: string;
          created_by?: string;
          created_at?: string;
        };
      };
    };
    Enums: {
      subscription_type: 'free' | 'basic' | 'premium' | 'pro';
      user_role: 'visitor' | 'member' | 'admin';
      position_status: 'pending' | 'active' | 'closed' | 'cancelled';
      target_hit: 'none' | 'tp1' | 'tp2' | 'sl';
    };
  };
};