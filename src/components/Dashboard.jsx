// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Dashboard({ session, userPlan }) {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // --- ESTADOS NOVOS ---
  const [currentDate, setCurrentDate] = useState(new Date()); // Data atual selecionada
  const [categories, setCategories] = useState([
    "Alimentação", "Moradia", "Transporte", "Salário", "Lazer", "Saúde"
  ]);

  // Estados do Formulário
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dateForm, setDateForm] = useState(''); // Data do input
  const [isExpense, setIsExpense] = useState(false); // Toggle deslizante

  // 1. CARREGAR DADOS INICIAIS
  useEffect(() => {
    fetchTransactions();
    loadCategories(); // Carrega categorias salvas
  }, [session]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (data) setTransactions(data);
  };

  const loadCategories = () => {
    const saved = localStorage.getItem('gideon_categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    }
  };

  // 2. FUNÇÃO PARA ADICIONAR NOVA CATEGORIA
  const handleAddCategory = () => {
    const newCat = prompt("Nome da nova categoria:");
    if (newCat && !categories.includes(newCat)) {
      const updatedList = [...categories, newCat];
      setCategories(updatedList);
      localStorage.setItem('gideon_categories', JSON.stringify(updatedList));
      setCategory(newCat); // Já seleciona a nova
    }
  };

  // 3. FILTRAGEM POR MÊS (A MÁGICA)
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    // Ajuste de fuso horário simples para garantir comparação correta
    const tMonth = tDate.getUTCMonth(); 
    const tYear = tDate.getUTCFullYear();
    
    return tMonth === currentDate.getMonth() && tYear === currentDate.getFullYear();
  });

  // Funções de Navegação de Mês
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Formata "Janeiro 2026"
  const monthLabel = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // 4. CÁLCULOS (Baseados APENAS no mês filtrado)
  const income = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const total = income + expense;

  // 5. SALVAR TRANSAÇÃO
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !desc) return;

    let finalValue = parseFloat(amount.replace(',', '.'));
    if (isExpense) finalValue = Math.abs(finalValue) * -1; // Garante negativo
    else finalValue = Math.abs(finalValue); // Garante positivo

    const { error } = await supabase.from('transactions').insert({
      user_id: session.user.id,
      description: desc,
      amount: finalValue,
      category: category,
      date: dateForm,
      type: isExpense ? 'expense' : 'income'
    });

    if (error) alert('Erro: ' + error.message);
    else {
      setDesc(''); setAmount(''); setDateForm('');
      fetchTransactions();
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header>
        <div className="container header-content">
          <div id="logo">gideon</div>
          <div className="user-area">
            <button className="btn-plans" onClick={() => setShowModal(true)}>💎 Planos</button>
            <span id="user-email">{session.user.email}</span>
            <button className="btn-logout" onClick={() => supabase.auth.signOut()}>Sair</button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* --- NAVEGAÇÃO DE MÊS --- */}
        <div className="month-nav">
          <button onClick={prevMonth}>&lt;</button>
          <span>{monthLabel}</span>
          <button onClick={nextMonth}>&gt;</button>
        </div>

        {/* CARDS */}
        <section className="summary-grid">
          <div className="card">
            <header>
              <span>Entradas</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
            </header>
            <h3 className="text-green">{income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
          </div>
          <div className="card">
            <header>
              <span>Saídas</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
            </header>
            <h3 className="text-red">{expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
          </div>
          <div className="card total">
            <header>
              <span>Saldo Total</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4f4f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </header>
            <h3 className={total >= 0 ? 'text-green' : 'text-red'}>
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
        </section>

        {/* FORMULÁRIO */}
        <section className="card form-section" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleAddTransaction}>
            <div className="form-row">
              <input type="text" placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} required />
              <input type="number" step="0.01" placeholder="R$ 0,00" value={amount} onChange={e => setAmount(e.target.value)} required />
              
              {/* Categorias + Botão Add */}
              <div style={{ display: 'flex', gap: '5px' }}>
                <select value={category} onChange={e => setCategory(e.target.value)} required style={{ borderRadius: '8px 0 0 8px' }}>
                   <option value="">Categoria</option>
                   {categories.map((cat, index) => (
                     <option key={index} value={cat}>{cat}</option>
                   ))}
                </select>
                <button type="button" className="btn-add-cat" onClick={handleAddCategory} title="Nova Categoria">+</button>
              </div>

              {/* Toggle Deslizante */}
              <div className="switch-container">
                <span style={{ color: isExpense ? '#777' : '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>ENTRADA</span>
                <label className="switch">
                  <input type="checkbox" checked={isExpense} onChange={(e) => setIsExpense(e.target.checked)} />
                  <span className="slider round"></span>
                </label>
                <span style={{ color: isExpense ? '#ef4444' : '#777', fontWeight: 'bold', fontSize: '0.8rem' }}>SAÍDA</span>
              </div>

              <input type="date" value={dateForm} onChange={e => setDateForm(e.target.value)} required />
            </div>
            
            <div style={{ textAlign: 'right' }}>
               <button type="submit" className="btn-submit">ADICIONAR</button>
            </div>
          </form>
        </section>

        {/* TABELA */}
        <div className="tables-grid">
           <section className="card" style={{ gridColumn: 'span 2' }}>
              <h2 style={{ fontSize: '1rem', color: '#a1a1aa', marginBottom: '1rem' }}>
                Extrato de {monthLabel}
              </h2>
              {filteredTransactions.length === 0 ? (
                <p style={{ color: '#555', textAlign: 'center', padding: '20px' }}>Nenhum lançamento neste mês.</p>
              ) : (
                <table>
                  <thead>
                      <tr><th>Descrição</th><th>Categ.</th><th>Data</th><th className="text-right">Valor</th></tr>
                  </thead>
                  <tbody>
                      {filteredTransactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.description}</td>
                          <td>{t.category}</td>
                          <td>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
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

      {/* MODAL PLANOS (Mantido igual) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
             <h2 style={{ color: 'white', marginBottom: '20px' }}>Planos Gideon</h2>
             <div className={`plan-option ${userPlan === 'supporter' ? 'active' : ''}`}>
                <h3 style={{ color: '#10b981' }}>Apoiador 💎</h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Ajude o projeto a crescer!</p>
                <button className="btn-plans" style={{ marginTop: '10px', width: '100%' }}>
                   {userPlan === 'supporter' ? 'Plano Ativo' : 'Assinar (R$ 9,90)'}
                </button>
             </div>
             <button onClick={() => setShowModal(false)} style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}