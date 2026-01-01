import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Dashboard({ session, userPlan }) {
  const [showModal, setShowModal] = useState(false); // Controla se a janela de planos está aberta

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="dashboard-container">
      {/* --- CABEÇALHO --- */}
      <header className="app-header">
        <div className="header-left">
          <h2>Olá, {session.user.email}</h2>
          <span className={`plan-badge ${userPlan}`}>
            {userPlan === 'supporter' ? '🌟 APOIADOR' : 'FREE'}
          </span>
        </div>

        <div className="header-right">
          {/* BOTÃO PLANOS (NOVO) */}
          <button className="btn-plans" onClick={() => setShowModal(true)}>
            💎 Planos
          </button>

          <button className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      {/* --- CONTEÚDO DO SITE (MANTIDO) --- */}
      <main className="content-area">
        <h3>Resumo Financeiro</h3>
        <p className="placeholder-text">Seus dados financeiros aparecerão aqui...</p>
        {/* Aqui entrarão seus gráficos e tabelas depois */}
      </main>

      {/* --- MODAL DE PLANOS (JANELA FLUTUANTE) --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Escolha seu Plano</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✖</button>
            </div>

            <div className="plans-row">
              {/* Card Free */}
              <div className={`plan-card ${userPlan === 'free' ? 'active' : ''}`}>
                <h4>Free</h4>
                <p>Grátis para sempre</p>
                {userPlan === 'free' && <button disabled className="btn-current">Plano Atual</button>}
              </div>

              {/* Card Apoiador */}
              <div className={`plan-card supporter ${userPlan === 'supporter' ? 'active' : ''}`}>
                <h4>Apoiador</h4>
                <p>R$ 9,90 / mês</p>
                <ul>
                  <li>Modo Escuro</li>
                  <li>Relatórios VIP</li>
                  <li>Apoie o projeto</li>
                </ul>
                {userPlan === 'supporter' ? (
                  <button disabled className="btn-current">Você é Apoiador! 🌟</button>
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