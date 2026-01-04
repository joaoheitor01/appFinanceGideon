// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Criação do contexto
const AuthContext = createContext({});

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica a sessão atual ao montar o componente
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Configura listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Evento de autenticação:', event);
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
      }
    );

    // Cleanup da subscription quando o componente é desmontado
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Função para login
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error.message);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastro
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Dados adicionais do usuário
        },
      });

      if (error) {
        console.error('Erro no cadastro:', error.message);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error.message);
        return { success: false, error };
      }

      // Limpa os estados locais
      setUser(null);
      setSession(null);
      
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Valores que serão expostos pelo contexto
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};