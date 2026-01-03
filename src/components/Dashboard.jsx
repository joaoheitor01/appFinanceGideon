import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const formatCurrency = (value) => { 
  const signal = Number(value) < 0 ? "-" : "";
  let v = String(value).replace(/\D/g, "");
  v = (Number(v) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return signal + v;
};

export default function Dashboard({ session, userPlan }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false); 

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => { 
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false }); 
    if (data) setTransactions(data);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const amountFloat = parseFloat(amount.replace(',', '.')); 
    await supabase.from('transactions').insert([{
      user_id: session.user.id,
      description,
      amount: amountFloat,
      date,
      type: amountFloat < 0 ? 'expense' : 'income' 
    }]);
    fetchTransactions();
    setModalOpen(false); 
  };

  return (
    <div className="dashboard-container">
      <header>
        <div className="container header-content">
          <div id="logo">gideon</div> 
          <div className="user-area">
            <span>{session.user.email} ({userPlan})</span> 
            <button onClick={() => supabase.auth.signOut()} className="btn-logout">Sair</button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="summary-grid"> 
          <div className="card"><h3>Entradas</h3><p className="text-green">R$ 0,00</p></div>
          <div className="card"><h3>Saídas</h3><p className="text-red">R$ 0,00</p></div>
          <div className="card total"><h3>Saldo Total</h3><p>R$ 0,00</p></div> 
        </section>

        <button className="btn-plans" onClick={() => setModalOpen(true)}>+ Nova Transação</button>

        <table id="data-table"> 
          <thead><tr><th>Descrição</th><th>Valor</th><th>Data</th><th></th></tr></thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>{t.description}</td>
                <td className={t.amount < 0 ? "text-red" : "text-green"}>
                  {formatCurrency(t.amount * 100)}
                </td>
                <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}