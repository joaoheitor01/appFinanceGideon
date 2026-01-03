import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

function AppContent() {
  const [session, setSession] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [view, setView] = useState('login');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserPlan(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserPlan(session.user.id);
      } else {
        setUserPlan('free');
        setView('login');
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
      console.log('Usuário sem plano definido');
    }
  };

  if (session) {
    return <Dashboard session={session} userPlan={userPlan} />;
  }

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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}