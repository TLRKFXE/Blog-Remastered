import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email || !ADMIN_EMAIL)
    return false

  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

