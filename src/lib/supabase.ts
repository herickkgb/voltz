import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || !supabase

/**
 * Retorna o client do Supabase ou lança erro se não configurado.
 * Use em funções que PRECISAM do Supabase (não aceita mock).
 */
export function getSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local'
    )
  }
  return supabase
}
