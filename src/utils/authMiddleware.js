// src/utils/authMiddleware.js
import { supabase } from '../services/supabase';

export const withAuth = async (handler) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Não autenticado');
  }
  
  return handler(session.user);
};

// Exemplo de uso:
/*
export const fetchProtectedData = async () => {
  return withAuth(async (user) => {
    const { data } = await supabase
      .from('protected_data')
      .select('*')
      .eq('user_id', user.id);
    
    return data;
  });
};
*/