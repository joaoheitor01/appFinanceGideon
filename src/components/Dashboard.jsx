import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Dashboard({ session }) {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
  const [selectedMonthName, setSelectedMonthName] = useState('');

  // Estados do Formulário
  const [desc, setDesc] = useState('');
  const [amountString, setAmountString] = useState('');
  const [amountValue, setAmountValue] = useState(0);
  const [category, setCategory] = useState('Alimentação');
  const [isExpense, setIsExpense] = useState(true);

  // Lista de Categorias
  const [categories, setCategories] = useState([
    "Alimentação", "Moradia", "Transporte", "Lazer", "Salário", "Outros"
  ]);

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  useEffect(() => { 
      fetchTransactions(); 
      loadCategories(); 
  }, []);

  const fetchTransactions = async () => {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (data) setTransactions(data);
  };

  const loadCategories = () => {
      const stored = localStorage.getItem("gideon.categories");
      if (stored) {
          setCategories(JSON.parse(stored));
      }
  };

  const handleAddCategory = () => {
      const newCat = prompt("Nova categoria:");
      if (newCat && newCat.trim() !== "") {
          const newList = [...categories, newCat];
          setCategories(newList);
          setCategory(newCat);
          localStorage.setItem("gideon.categories", JSON.stringify(newList));
      }
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    const numericValue = Number(value) / 100;
    setAmountValue(numericValue);
    setAmountString(numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!desc || !amountValue) return;

    const finalAmount = isExpense ? -Math.abs(amountValue) : Math.abs(amountValue);

    const { error } = await supabase.from('transactions').insert([{
      user_id: session.user.id,
      description: desc,
      amount: finalAmount,
      category,
      type: isExpense ? 'expense' : 'income',
      date: new Date().toISOString()
    }]);

    if (!error) {
      setDesc(''); setAmountString(''); setAmountValue(0);
      fetchTransactions();
    }
  };

  const handleDelete = async (id) => {
    if(confirm("Excluir transação?")) {
        await supabase.from('transactions').delete().eq('id', id);
        fetchTransactions();
    }
  };

  const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const getMonthIndexFromDate = (dateStr) => {
      const date = new Date(dateStr);
      return new Date(date.valueOf() + date.getTimezoneOffset() * 60000).getMonth();
  };

  // Cálculos
  const summaryData = months.map((name, index) => {
      const monthTrans = transactions.filter(t => getMonthIndexFromDate(t.date) === index);
      const income = monthTrans.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
      const expense = monthTrans.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
      return { name, index, income, expense, balance: income + expense, hasData: monthTrans.length > 0 };
  });

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

  const details = selectedMonthIndex !== null 
    ? transactions.filter(t => getMonthIndexFromDate(t.date) === selectedMonthIndex)
    : [];

  return (
    <div className="container">
      <header>
        <div className="header-title">Gideon Finance</div>
        <div className="user-area">
            <span>{session.user.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="btn-logout">Sair</button>
        </div>
      </header>

      <section className="summary-grid">
        <div className="card"><header><span>Entradas</span></header><h3 className="text-green">{formatMoney(totalIncome)}</h3></div>
        <div className="card"><header><span>Saídas</span></header><h3 className="text-red">{formatMoney(totalExpense)}</h3></div>
        <div className="card"><header><span>Total</span></header><h3 style={{color: (totalIncome + totalExpense) >= 0 ? '#fff' : '#ef4444'}}>{formatMoney(totalIncome + totalExpense)}</h3></div>
      </section>

      <section className="form-section">
        <form onSubmit={handleAdd} className="form-row">
            <div><input type="text" placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} required /></div>
            <div><input type="text" placeholder="R$ 0,00" value={amountString} onChange={handleAmountChange} required /></div>
            
            <div style={{display:'flex', gap:'0.5rem'}}>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <button 
                    type="button" 
                    onClick={handleAddCategory}
                    style={{
                        background: '#333', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '8px', 
                        width: '3rem', 
                        fontSize: '1.2rem', 
                        cursor: 'pointer'
                    }}
                    title="Nova Categoria"
                >
                    +
                </button>
            </div>

            <div className="toggle-wrapper">
                <span style={{color: isExpense ? '#718096' : '#10b981', fontSize:'0.9rem', fontWeight:'600'}}>Entrada</span>
                <label className="switch">
                    <input type="checkbox" checked={isExpense} onChange={() => setIsExpense(!isExpense)} />
                    <span className="slider"></span>
                </label>
                <span style={{color: isExpense ? '#ef4444' : '#718096', fontSize:'0.9rem', fontWeight:'600'}}>Saída</span>
            </div>

            <button type="submit" className="btn-submit">ADICIONAR</button>
        </form>
      </section>

      <div className="tables-grid">
        
        <section className="table-card">
            <h2>Resumo por Mês</h2>
            <div style={{overflowX: 'auto'}}>
                <table>
                    <thead><tr><th>Mês</th><th className="text-right">Entradas</th><th className="text-right">Saídas</th><th className="text-right">Saldo</th></tr></thead>
                    <tbody>
                        {summaryData.map((m) => (
                            <tr key={m.name} 
                                className={`month-row ${selectedMonthIndex === m.index ? 'active' : ''}`}
                                onClick={() => { setSelectedMonthIndex(m.index); setSelectedMonthName(m.name); }}
                                style={{ opacity: m.hasData ? 1 : 0.4 }}
                            >
                                <td>{m.name}</td>
                                <td className="text-right text-green">{formatMoney(m.income)}</td>
                                <td className="text-right text-red">{formatMoney(m.expense)}</td>
                                <td className={`text-right ${m.balance >= 0 ? 'text-green' : 'text-red'}`}><strong>{formatMoney(m.balance)}</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

        <section className="table-card" style={{ display: selectedMonthIndex !== null ? 'block' : 'none' }}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <h2>Extrato de {selectedMonthName}</h2>
                <button onClick={() => setSelectedMonthIndex(null)} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer'}}>✕</button>
            </div>
            <table>
                <thead><tr><th>Desc</th><th>Valor</th><th>Data</th><th></th></tr></thead>
                <tbody>
                    {details.length === 0 ? (
                        <tr><td colSpan="4" style={{textAlign:'center', padding:'2rem', color:'#555'}}>Vazio</td></tr>
                    ) : (
                        details.map(t => (
                            <tr key={t.id}>
                                <td>
                                    <div style={{fontWeight:'500'}}>{t.description}</div>
                                    <div style={{fontSize:'0.8rem', color:'#718096'}}>{t.category}</div>
                                </td>
                                <td className={t.amount > 0 ? 'text-green' : 'text-red'}>{formatMoney(t.amount)}</td>
                                <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                <td style={{textAlign:'right'}}>
                                    <button onClick={() => handleDelete(t.id)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}>🗑️</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </section>

      </div>
    </div>
  );
}