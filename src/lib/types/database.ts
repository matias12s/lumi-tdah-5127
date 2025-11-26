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
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          completed: boolean
          priority: 'urgent' | 'high' | 'medium' | 'low'
          steps: string[] | null
          current_step: number | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          completed?: boolean
          priority?: 'urgent' | 'high' | 'medium' | 'low'
          steps?: string[] | null
          current_step?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          completed?: boolean
          priority?: 'urgent' | 'high' | 'medium' | 'low'
          steps?: string[] | null
          current_step?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked: boolean
          progress: number | null
          unlocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked?: boolean
          progress?: number | null
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked?: boolean
          progress?: number | null
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          tasks_completed: number
          focus_sessions: number
          current_streak: number
          total_points: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tasks_completed?: number
          focus_sessions?: number
          current_streak?: number
          total_points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tasks_completed?: number
          focus_sessions?: number
          current_streak?: number
          total_points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      quick_captures: {
        Row: {
          id: string
          user_id: string
          content: string
          type: 'text' | 'audio' | 'photo'
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          type: 'text' | 'audio' | 'photo'
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          type?: 'text' | 'audio' | 'photo'
          timestamp?: string
          created_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          user_name: string
          user_avatar: string
          content: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          user_avatar: string
          content: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          user_avatar?: string
          content?: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority: 'urgent' | 'high' | 'medium' | 'low'
      capture_type: 'text' | 'audio' | 'photo'
    }
  }
}
