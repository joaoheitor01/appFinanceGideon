// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Dashboard({ session, userPlan }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false); // Controle da janela de planos

  // Lógica do Modo Escuro (mantida)
  useEffect(() => {
    const savedTheme = localStorage.getItem('gideon_theme');
    if (savedTheme === 'dark' && userPlan === 'supporter') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [userPlan]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleDarkMode = () => {
    if (userPlan !== 'supporter') {
      // Se clicar no cadeado, abre a janela de planos para vender o peixe
      setShowPlanModal(true);
      return;
    }
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
      {/* --- HEADER --- */}
      <header className="dash-header">
        <div className="logo-area">
          <h1>Gideon Finance</h1>
          <span className="user-welcome">Olá, {session.user.user_metadata.full_name?.split(' ')[0]}</span>
        </div>

        <div className="actions-area">
          {/* Botão de Planos no Canto */}
          <button className="btn-plans" onClick={() => setShowPlanModal(true)}>
            💎 Planos
          </button>

          {/* Botão Modo Escuro */}
          <button 
            onClick={toggleDarkMode}
            className={`btn-theme ${userPlan !== 'supporter' ? 'locked' : ''}`}
            title={userPlan === 'supporter' ? "Alternar tema" : "Recurso exclusivo"}
          >
            {darkMode ? '🌙' : '☀️'}
            {userPlan !== 'supporter' && <span className="lock-icon">🔒</span>}
          </button>

          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL (O SITE) --- */}
      <main className="dash-content">
        {/* Cards de Resumo */}
        <div className="summary-cards">
          <div className="card summary-item">
            <h3>Entradas</h3>
            <p className="money income">R$ 0,00</p>
          </div>
          <div className="card summary-item">
            <h3>Saídas</h3>
            <p className="money expense">R$ 0,00</p>
          </div>
          <div className="card summary-item total">
            <h3>Saldo Atual</h3>
            <p className="money">R$ 0,00</p>
          </div>
        </div>

        {/* Área de Transações */}
        <div className="transactions-area card">
          <div className="area-header">
            <h3>Suas Transações</h3>
            <button className="btn-new">+ Nova Transação</button>
          </div>
          
          <div className="empty-state">
            <p>Nenhuma transação registrada ainda.</p>
          </div>
        </div>
      </main>

      {/* --- MODAL DE PLANOS (Janela Flutuante) --- */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Escolha seu Plano</h2>
              <button className="close-btn" onClick={() => setShowPlanModal(false)}>×</button>
            </div>
            
            <div className="plans-grid">
              {/* Plano Free */}
              <div className={`plan-card ${userPlan === 'free' ? 'active-plan' : ''}`}>
                <h3>Free</h3>
                <p className="price">R$ 0,00</p>
                <ul>
                  <li>✅ Controle de Entradas/Saídas</li>
                  <li>✅ Histórico Básico</li>
                  <li>❌ Modo Escuro</li>
                  <li>❌ Relatórios Avançados</li>
                </ul>
                {userPlan === 'free' && <button className="btn-current" disabled>Plano Atual</button>}
              </div>

              {/* Plano Apoiador */}
              <div className={`plan-card ${userPlan === 'supporter' ? 'active-plan supporter' : 'supporter'}`}>
                <div className="badge">RECOMENDADO</div>
                <h3>Apoiador</h3>
                <p className="price">R$ 9,90 <span className="period">/mês</span></p>
                <ul>
                  <li>✅ <strong>Tudo do Free</strong></li>
                  <li>✅ <strong>Modo Escuro (Dark Mode)</strong></li>
                  <li>✅ Relatórios Gráficos (Em breve)</li>
                  <li>✅ Suporte Prioritário</li>
                </ul>
                {userPlan === 'supporter' ? (
                  <button className="btn-current" disabled>Você é Apoiador! 🌟</button>
                ) : (
                  <button className="btn-upgrade">Quero ser Apoiador</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}