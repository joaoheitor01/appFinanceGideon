import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kpajxjpliyqclkmdowbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OURRIqDVKngWfW8rOfJdQw_OyQFczHm';

// Verifica se as variáveis de ambiente estão configuradas
if (!SUPABASE_URL || !SUPABASE_KEY) { 
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true, // Mantém a sessão persistente
    autoRefreshToken: true, // Atualiza tokens automaticamente
    detectSessionInUrl: true, // Detecta sessão em URLs (para redirecionamentos)
  },
}) ;

