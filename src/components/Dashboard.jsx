import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const formatCurrency = (value) => {
  const signal = Number(value) < 0 ? "-" : "";
  value = String(value).replace(/\D/g, "");
  value = Number(value) / 100;
  value = value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
  return signal + value;
};

export default function Dashboard({ session }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = () => {
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
      if (transaction.amount > 0) {
        income += Number(transaction.amount);
      } else {
        expense += Number(transaction.amount);
      }
    });

    return {
      income: formatCurrency(income * 100), // Multiplicando por 100 pois formatCurrency divide
      expense: formatCurrency(expense * 100),
      total: formatCurrency((income + expense) * 100)
    };
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount || !date) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
      // Convertendo valor para float compatível com Supabase
      const amountFloat = parseFloat(amount.replace(',', '.')); 
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: session.user.id,
          description,
          amount: amountFloat, // O backend deve decidir se é entrada ou saída ou o usuário digita -
          category: 'Geral', // Padrão se não houver campo
          date,
          type: amountFloat < 0 ? 'expense' : 'income'
        }])
        .select();

      if (error) throw error;

      setTransactions([data[0], ...transactions]);
      setDescription('');
      setAmount('');
      setDate('');
      setModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar:', error.message);
      alert('Erro ao salvar transação');
    }
  };

  const handleDelete = async (id) => {
    try {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
        console.error("Erro ao deletar", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const balance = calculateBalance();

  return (
    <>
      <header>
        <div className="container header-content">
          <h1>dev.finance$</h1>
          <div className="user-display">
             {session.user.email} 
             <button onClick={handleLogout} className="btn-logout" style={{marginLeft: '10px'}}>Sair</button>
          </div>
        </div>
      </header>

      <main className="container">
        
        <section id="balance">
          <div className="card">
            <h3>
              <span>Entradas</span>
              <img src="https://assets.rocketseat.com.br/jakeliny/income.svg" alt="Imagem de entradas" />
            </h3>
            <p>{balance.income}</p>
          </div>

          <div className="card">
            <h3>
              <span>Saídas</span>
              <img src="https://assets.rocketseat.com.br/jakeliny/expense.svg" alt="Imagem de saídas" />
            </h3>
            <p>{balance.expense}</p>
          </div>

          <div className="card total">
            <h3>
              <span>Total</span>
              <img src="https://assets.rocketseat.com.br/jakeliny/total.svg" alt="Imagem de total" />
            </h3>
            <p>{balance.total}</p>
          </div>
        </section>

        <section id="transaction">
          <h2 className="sr-only">Transações</h2>
          
          <a href="#" className="button new" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>
            + Nova Transação
          </a>

          <div className="table-container">
            <table id="data-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr><td colSpan="4">Carregando...</td></tr>
                ) : (
                    transactions.map((t) => (
                        <tr key={t.id}>
                          <td className="description">{t.description}</td>
                          <td className={t.amount < 0 ? "expense" : "income"}>
                            {formatCurrency(t.amount * 100)}
                          </td>
                          <td>{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                          <td>
                            <img 
                                src="https://assets.rocketseat.com.br/jakeliny/minus.svg" 
                                alt="Remover transação" 
                                onClick={() => handleDelete(t.id)}
                                style={{cursor: 'pointer'}} 
                            />
                          </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay active">
          <div className="modal">
            <div id="form">
              <h2>Nova Transação</h2>
              <form onSubmit={handleAddTransaction}>
                <div className="input-group">
                  <label className="sr-only" htmlFor="description">Descrição</label>
                  <input 
                    type="text" 
                    id="description" 
                    name="description" 
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="sr-only" htmlFor="amount">Valor</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    id="amount" 
                    name="amount" 
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <small className="help">Use o sinal - (negativo) para despesas e , (vírgula) para casas decimais</small>
                </div>

                <div className="input-group">
                  <label className="sr-only" htmlFor="date">Data</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="input-group actions">
                  <a href="#" className="button cancel" onClick={(e) => { e.preventDefault(); setModalOpen(false); }}>Cancelar</a>
                  <button type="submit">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}