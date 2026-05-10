export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          username: string | null;
          chess_rating: number | null;
          preferred_color: 'white' | 'black' | 'both' | null;
          skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          subscription_tier: 'free' | 'pro' | 'elite' | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          chess_rating?: number | null;
          preferred_color?: 'white' | 'black' | 'both' | null;
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          subscription_tier?: 'free' | 'pro' | 'elite' | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          chess_rating?: number | null;
          preferred_color?: 'white' | 'black' | 'both' | null;
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          subscription_tier?: 'free' | 'pro' | 'elite' | null;
        };
      };
      repertoires: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          name: string;
          description: string | null;
          color: 'white' | 'black';
          opening_name: string | null;
          eco_code: string | null;
          total_study_time: number;
          total_moves_studied: number;
          moves: Json;
          is_public: boolean;
          tags: string[];
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color: 'white' | 'black';
          opening_name?: string | null;
          eco_code?: string | null;
          total_study_time?: number;
          total_moves_studied?: number;
          moves?: Json;
          is_public?: boolean;
          tags?: string[];
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: 'white' | 'black';
          opening_name?: string | null;
          eco_code?: string | null;
          total_study_time?: number;
          total_moves_studied?: number;
          moves?: Json;
          is_public?: boolean;
          tags?: string[];
        };
      };
      training_sessions: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          repertoire_id: string | null;
          duration_seconds: number;
          moves_played: number;
          correct_moves: number;
          session_type: 'drill' | 'exploration' | 'analysis';
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          repertoire_id?: string | null;
          duration_seconds: number;
          moves_played: number;
          correct_moves: number;
          session_type: 'drill' | 'exploration' | 'analysis';
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          repertoire_id?: string | null;
          duration_seconds?: number;
          moves_played?: number;
          correct_moves?: number;
          session_type?: 'drill' | 'exploration' | 'analysis';
        };
      };
      daily_tips: {
        Row: {
          id: string;
          date: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          title?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      chess_color: 'white' | 'black';
      skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      subscription_tier: 'free' | 'pro' | 'elite';
    };
  };
}
