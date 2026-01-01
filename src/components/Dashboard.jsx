// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Dashboard({ session, userPlan }) {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Estados do Formulário
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [isExpense, setIsExpense] = useState(false); // Toggle Entrada/Saída

  // 1. BUSCAR DADOS AO CARREGAR
  useEffect(() => {
    fetchTransactions();
  }, [session]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id) // Traz só os dados DESTE usuário
      .order('date', { ascending: false }); // Mais recentes primeiro

    if (data) setTransactions(data);
  };

  // 2. ADICIONAR NOVA TRANSAÇÃO
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !desc) return;

    // Se for despesa, multiplica por -1
    let finalValue = parseFloat(amount.replace(',', '.'));
    if (isExpense) finalValue = finalValue * -1;

    const { error } = await supabase.from('transactions').insert({
      user_id: session.user.id,
      description: desc,
      amount: finalValue,
      category: category,
      date: date,
      type: isExpense ? 'expense' : 'income'
    });

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      // Limpa formulário e recarrega dados
      setDesc(''); setAmount(''); setCategory(''); setDate('');
      fetchTransactions();
    }
  };

  // 3. CÁLCULOS (Matemática do Dashboard)
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const total = income + expense;

  return (
    <div className="dashboard-container">
      {/* --- HEADER --- */}
      <header>
        <div className="container header-content">
          <div id="logo">gideon</div>
          
          <div className="user-area">
            {/* BOTÃO PLANOS */}
            <button className="btn-plans" onClick={() => setShowModal(true)}>
               💎 Planos
            </button>
            
            <span id="user-email">{session.user.email}</span>
            <button className="btn-logout" onClick={() => supabase.auth.signOut()}>Sair</button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* --- CARDS COM DADOS REAIS --- */}
        <section className="summary-grid">
          <div className="card">
            <header><span>Entradas</span></header>
            <h3 className="text-green">
              {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
          <div className="card">
            <header><span>Saídas</span></header>
            <h3 className="text-red">
              {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
          <div className="card total">
            <header><span>Saldo Total</span></header>
            <h3 style={{ color: total >= 0 ? '#10b981' : '#ef4444' }}>
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
        </section>

        {/* --- FORMULÁRIO --- */}
        <section className="card form-section" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleAddTransaction}>
            <div className="form-row">
              <input 
                type="text" 
                placeholder="Descrição" 
                value={desc} onChange={e => setDesc(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                step="0.01" 
                placeholder="R$ 0,00" 
                value={amount} onChange={e => setAmount(e.target.value)} 
                required 
              />
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select value={category} onChange={e => setCategory(e.target.value)} required>
                   <option value="">Categoria</option>
                   <option value="Alimentação">Alimentação</option>
                   <option value="Moradia">Moradia</option>
                   <option value="Salário">Salário</option>
                   <option value="Lazer">Lazer</option>
                   <option value="Outros">Outros</option>
                </select>

                {/* BOTÃO TOGGLE (Entrada vs Saída) */}
                <button 
                  type="button"
                  onClick={() => setIsExpense(!isExpense)}
                  style={{
                    background: isExpense ? '#ef4444' : '#10b981',
                    border: 'none', color: 'white', padding: '0 10px', height: '3rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  {isExpense ? 'SAÍDA' : 'ENTRADA'}
                </button>
              </div>

              <input 
                type="date" 
                value={date} onChange={e => setDate(e.target.value)} 
                required 
              />
            </div>
            
            <div style={{ textAlign: 'right' }}>
               <button type="submit" className="btn-submit">ADICIONAR</button>
            </div>
          </form>
        </section>

        {/* --- TABELAS --- */}
        <div className="tables-grid">
           {/* Tabela de Extrato */}
           <section className="card" style={{ gridColumn: 'span 2' }}>
              <h2 style={{ fontSize: '1rem', color: '#a1a1aa', marginBottom: '1rem' }}>Extrato Recente</h2>
              {transactions.length === 0 ? (
                <p style={{ color: '#555', textAlign: 'center' }}>Nenhuma transação encontrada.</p>
              ) : (
                <table>
                  <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Categ.</th>
                        <th>Data</th>
                        <th className="text-right">Valor</th>
                      </tr>
                  </thead>
                  <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.description}</td>
                          <td>{t.category}</td>
                          <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                          <td className={`text-right ${t.amount >= 0 ? 'text-green' : 'text-red'}`}>
                            {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
           </section>
        </div>
      </main>

      {/* --- MODAL PLANOS --- */}
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