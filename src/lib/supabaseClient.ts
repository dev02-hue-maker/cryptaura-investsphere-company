import { createClient } from '@supabase/supabase-js'

// We use fallback empty strings so the build process doesn't crash 
// if it can't read the .env file for a split second.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
})