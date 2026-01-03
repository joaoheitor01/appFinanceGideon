import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const formatCurrency = (value) => {
  const signal = Number(value) < 0 ? "-" : "";
  let v = String(Math.abs(value)).replace(/\D/g, "");
  v = (Number(v) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return signal + v;
};

export default function Dashboard({ session }) {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
      if (data) setTransactions(data);
    };
    fetchTransactions();
  }, [session.user.id]);

  const calculateMonthly = () => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    let mData = months.map((name, index) => ({ name, index, balance: 0 }));
    transactions.forEach(t => {
      const mIdx = new Date(t.date + 'T00:00:00').getMonth();
      mData[mIdx].balance += Number(t.amount);
    });
    return mData;
  };

  const monthlyData = calculateMonthly();
  const filteredTransactions = selectedMonth !== null 
    ? transactions.filter(t => new Date(t.date + 'T00:00:00').getMonth() === selectedMonth)
    : [];

  return (
    <div className="container">
      <header style={{padding: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>gideon</h1>
        <button onClick={() => supabase.auth.signOut()} className="card" style={{cursor: 'pointer', padding: '0.5rem 1rem'}}>Sair</button>
      </header>
      <div className="tables-grid">
        <section className="card">
          <h2>Resumo Mensal</h2>
          <table>
            <thead><tr><th>Mês</th><th style={{textAlign: 'right'}}>Saldo</th></tr></thead>
            <tbody>
              {monthlyData.map((m) => (
                <tr key={m.name} onClick={() => setSelectedMonth(m.index)} style={{cursor: 'pointer', opacity: m.balance === 0 ? 0.3 : 1}}>
                  <td>{m.name}</td>
                  <td style={{textAlign: 'right'}} className={m.balance >= 0 ? "text-green" : "text-red"}>{formatCurrency(m.balance * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card" style={{display: selectedMonth !== null ? 'block' : 'none'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <h2>Detalhes</h2>
            <button onClick={() => setSelectedMonth(null)} style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer'}}>✕</button>
          </div>
          <table>
            <thead><tr><th>Desc</th><th>Valor</th></tr></thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.description}</td>
                  <td className={t.amount < 0 ? "text-red" : "text-green"}>{formatCurrency(t.amount * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}