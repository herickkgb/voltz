import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente do Supabase não configuradas no .env.local')
}

export const supabase = createClient(supabaseUrl || 'https://mock.supabase.co', supabaseAnonKey || 'mock-key')

/**
 * Retorna o client do Supabase ou lança erro se não configurado.
 * Use em funções que PRECISAM do Supabase (não aceita mock).
 */
export function getSupabase() {
  if (!supabaseUrl) {
    throw new Error(
      'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local'
    )
  }
  return supabase
}
