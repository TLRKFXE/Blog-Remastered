import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function isValidHttpUrl(value: string | undefined) {
  if (!value)
    return false

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  catch {
    return false
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

if (supabaseUrl && !isValidHttpUrl(supabaseUrl)) {
  console.warn('[supabase] VITE_SUPABASE_URL is invalid, expected http/https URL')
}

const safeSupabaseUrl = isValidHttpUrl(supabaseUrl)
  ? supabaseUrl
  : 'https://example.com'

const safeSupabaseAnonKey = supabaseAnonKey || 'public-anon-placeholder'

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey)

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email || !ADMIN_EMAIL)
    return false

  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}
