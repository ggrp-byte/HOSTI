import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          name: string
          size: number
          type: string
          file_path: string
          thumbnail_path: string | null
          upload_date: string
          user_id: string | null
          public_url: string
          share_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          size: number
          type: string
          file_path: string
          thumbnail_path?: string | null
          upload_date?: string
          user_id?: string | null
          public_url: string
          share_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          size?: number
          type?: string
          file_path?: string
          thumbnail_path?: string | null
          upload_date?: string
          user_id?: string | null
          public_url?: string
          share_token?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}