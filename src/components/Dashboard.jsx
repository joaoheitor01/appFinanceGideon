// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Dashboard({ session, userPlan }) {
  const [showModal, setShowModal] = useState(false);

  // Dados fictícios para o layout aparecer (depois ligamos no banco)
  const income = 0;
  const expense = 0;
  const total = 0;

  return (
    <div className="dashboard-container">
      {/* --- HEADER --- */}
      <header>
        <div className="container header-content">
          <div id="logo">gideon</div>
          
          <div className="user-area">
            {/* BOTÃO PLANOS NOVO */}
            <button className="btn-plans" onClick={() => setShowModal(true)}>
               💎 Planos
            </button>
            
            <span id="user-email">{session.user.email}</span>
            <button className="btn-logout" onClick={() => supabase.auth.signOut()}>Sair</button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* --- CARDS (Igual ao seu HTML original) --- */}
        <section className="summary-grid">
          <div className="card">
            <header><span>Entradas</span></header>
            <h3 className="text-green">R$ {income.toFixed(2)}</h3>
          </div>
          <div className="card">
            <header><span>Saídas</span></header>
            <h3 className="text-red">R$ {expense.toFixed(2)}</h3>
          </div>
          <div className="card total">
            <header><span>Saldo Total</span></header>
            <h3>R$ {total.toFixed(2)}</h3>
          </div>
        </section>

        {/* --- FORMULÁRIO --- */}
        <section className="card form-section" style={{ marginBottom: '2rem' }}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <input type="text" placeholder="Descrição" />
              <input type="text" placeholder="R$ 0,00" />
              <select>
                 <option>Categoria</option>
                 <option>Alimentação</option>
                 <option>Lazer</option>
              </select>
              <input type="date" />
            </div>
            <div style={{ textAlign: 'right' }}>
               <button type="submit" className="btn-submit">ADICIONAR</button>
            </div>
          </form>
        </section>

        {/* --- TABELAS --- */}
        <div className="tables-grid">
           <section className="card">
              <h2 style={{ fontSize: '1rem', color: '#a1a1aa', marginBottom: '1rem' }}>Resumo</h2>
              <table>
                 <thead>
                    <tr><th>Mês</th><th className="text-right">Saldo</th></tr>
                 </thead>
                 <tbody>
                    <tr><td>Janeiro</td><td className="text-right text-green">R$ 0,00</td></tr>
                 </tbody>
              </table>
           </section>

           <section className="card">
              <h2 style={{ fontSize: '1rem', color: '#a1a1aa', marginBottom: '1rem' }}>Detalhes</h2>
              <p style={{ color: '#555', fontSize: '0.9rem' }}>Nenhuma transação selecionada.</p>
           </section>
        </div>
      </main>

      {/* --- MODAL PLANOS (Estilo Gideon) --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
             <h2 style={{ color: 'white', marginBottom: '20px' }}>Escolha seu Plano</h2>
             
             <div className={`plan-option ${userPlan === 'free' ? 'active' : ''}`}>
                <h3 style={{ color: '#fff' }}>Free</h3>
                <p style={{ color: '#aaa' }}>Básico e funcional.</p>
             </div>
             
             <div className={`plan-option ${userPlan === 'supporter' ? 'active' : ''}`}>
                <h3 style={{ color: '#10b981' }}>Apoiador 💎</h3>
                <p style={{ color: '#aaa' }}>Modo Escuro + Relatórios</p>
                <button className="btn-plans" style={{ marginTop: '10px', width: '100%' }}>
                   {userPlan === 'supporter' ? 'Plano Atual' : 'Fazer Upgrade (R$ 9,90)'}
                </button>
             </div>
             
             <button 
               onClick={() => setShowModal(false)}
               style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}
             >
               Fechar
             </button>
          </div>
        </div>
      )}
    </div>
  );
}