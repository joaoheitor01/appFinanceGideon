import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Recebemos 'session' e 'userPlan' vindos do App.jsx
export default function Dashboard({ session, userPlan }) {
  const [darkMode, setDarkMode] = useState(false);

  // Efeito 1: Carregar preferência salva ao iniciar
  useEffect(() => {
    // Só aplica o tema escuro se o usuário tiver salvo ISSO E for Supporter
    const savedTheme = localStorage.getItem('gideon_theme');
    
    if (savedTheme === 'dark' && userPlan === 'supporter') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      // Garante que comece limpo caso contrário
      document.body.classList.remove('dark-mode');
    }
  }, [userPlan]); // Se o plano mudar (upgrade em tempo real), ele reavalia

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleDarkMode = () => {
    // 1. Bloqueio de Segurança: Se não for supporter, para aqui.
    if (userPlan !== 'supporter') {
      alert("🔒 Recurso exclusivo para Apoiadores! \n\nTorne-se um Apoiador para desbloquear o Modo Escuro e ajudar a manter o Gideon Finance.");
      return;
    }

    // 2. Lógica de troca de tema (só executa se for supporter)
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('gideon_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('gideon_theme', 'light');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px',
        borderBottom: '1px solid #ccc'
      }}>
        <div>
          <h2>Olá, {session.user.user_metadata.full_name || session.user.email}</h2>
          <p>
            Status do Plano: 
            {/* Badge visual do plano */}
            <span style={{ 
              backgroundColor: userPlan === 'supporter' ? '#ffd700' : '#e0e0e0',
              color: userPlan === 'supporter' ? '#000' : '#333',
              padding: '4px 8px',
              borderRadius: '4px',
              marginLeft: '8px',
              fontWeight: 'bold',
              fontSize: '0.8rem'
            }}>
              {userPlan === 'supporter' ? '🌟 APOIADOR' : 'FREE'}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* BOTÃO MODO ESCURO */}
          <button 
            onClick={toggleDarkMode}
            style={{
              cursor: userPlan === 'supporter' ? 'pointer' : 'not-allowed',
              opacity: userPlan === 'supporter' ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title={userPlan === 'supporter' ? "Alternar tema" : "Bloqueado no plano Free"}
          >
            {darkMode ? '☀️ Claro' : '🌙 Escuro'}
            {userPlan !== 'supporter' && '🔒'} 
          </button>

          <button onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        {/* Seus componentes de transação, gráficos, etc entram aqui */}
        <div className="content-card">
          <h3>Resumo Financeiro</h3>
          <p>Seus dados carregados aqui...</p>
        </div>
      </main>
    </div>
  );
}