import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard'; // <--- AQUI: Estamos "conectando" o novo arquivo

export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verifica se o usuário já está logado ao abrir o site
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  // --- A MÁGICA ACONTECE AQUI ---
  
  // 1. Se o Supabase disser que tem sessão (usuário logado):
  // Mostra o componente DASHBOARD (o painel financeiro)
  if (session) {
    return <Dashboard session={session} />;
  }

  // 2. Se não estiver logado e o usuário clicou em "Criar Conta":
  // Mostra a tela de CADASTRO
  if (view === 'signup') {
    return <SignUp onNavigateLogin={() => setView('login')} />;
  }

  // 3. Se não for nenhum dos anteriores:
  // Mostra a tela de LOGIN (padrão)
  return (
    <div id="login-screen">
      <div className="login-card">
        <h2>Gideon Finance</h2>
        <p>Faça login para continuar.</p>
        <form onSubmit={handleLogin}>
          <div className="input-container">
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
            />
          </div>
          <div className="input-container">
            <input 
                type="password" 
                placeholder="Senha" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'ENTRANDO...' : 'LOGIN'}
          </button>
        </form>
        <div className="login-footer">
          <span>Novo aqui? </span>
          <a href="#" onClick={() => setView('signup')}>Criar Conta</a>
        </div>
      </div>
    </div>
  );
}