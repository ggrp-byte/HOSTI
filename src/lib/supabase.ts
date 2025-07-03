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
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-my-custom-header': 'videostream-pro',
    },
  },
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('count', { count: 'exact', head: true })
    
    if (error) throw error
    return { success: true, message: 'Połączenie z Supabase działa' }
  } catch (error) {
    return { 
      success: false, 
      message: `Błąd połączenia z Supabase: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Test storage function
export const testSupabaseStorage = async () => {
  try {
    const { data, error } = await supabase.storage
      .from('videos')
      .list('', { limit: 1 })
    
    if (error) throw error
    return { success: true, message: 'Storage Supabase działa' }
  } catch (error) {
    return { 
      success: false, 
      message: `Błąd storage Supabase: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

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