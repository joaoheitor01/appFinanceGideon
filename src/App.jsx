// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [userPlan, setUserPlan] = useState('free'); // <--- NOVO ESTADO (padrão 'free')
  const [loading, setLoading] = useState(false);

  // ... (seus estados de email/password continuam aqui)

  useEffect(() => {
    // Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserPlan(session.user.id); // <--- BUSCAR PLANO
    });

    // Escuta mudanças na autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserPlan(session.user.id); // <--- BUSCAR PLANO AO LOGAR
      } else {
        setUserPlan('free'); // Reseta para free se deslogar
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- NOVA FUNÇÃO PARA BUSCAR O PLANO ---
  const fetchUserPlan = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        setUserPlan(data.plan);
        console.log('Plano do usuário:', data.plan);
      }
    } catch (error) {
      console.error('Erro ao buscar plano:', error.message);
    }
  };

  // ... (sua função handleLogin continua aqui)

  return (
    <div className="container">
      {!session ? (
        <SignUp /> 
        // Note: passe as props de login para o SignUp se necessário
      ) : (
        // AQUI ESTÁ O SEGREDO: Passamos o userPlan para o Dashboard
        <Dashboard key={session.user.id} session={session} userPlan={userPlan} />
      )}
    </div>
  );
}