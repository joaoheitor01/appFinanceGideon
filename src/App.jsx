// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Login from './components/Login';     // <--- Importamos o novo Login
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import './App.css'; // Garanta que o CSS está sendo importado

export default function App() {
  const [session, setSession] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [view, setView] = useState('login'); // <--- Controla: 'login' ou 'signup'

  useEffect(() => {
    // 1. Verificar sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserPlan(session.user.id);
    });

    // 2. Escutar mudanças de login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserPlan(session.user.id);
      } else {
        setUserPlan('free');
        setView('login'); // Volta pro login ao sair
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserPlan = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();

      if (data) setUserPlan(data.plan);
    } catch (error) {
      console.log('Usuário sem plano definido ou erro de conexão.');
    }
  };

  // Se tem sessão, mostra o DASHBOARD
  if (session) {
    return <Dashboard session={session} userPlan={userPlan} />;
  }

  // Se NÃO tem sessão, mostra Login ou SignUp
  return (
    <div className="auth-wrapper">
      {view === 'login' ? (
        <Login onToggleView={() => setView('signup')} />
      ) : (
        <SignUp onToggleView={() => setView('login')} />
      )}
    </div>
  );
}