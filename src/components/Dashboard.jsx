import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Função auxiliar de formatação de moeda (do original)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatCurrencyRaw = (value) => {
    // Para inputs numéricos, mantemos o número puro
    return value; 
};

export default function Dashboard({ session }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  // O original usava um toggle, aqui vamos simplificar com um select ou manter lógica similar
  const [type, setType] = useState('income'); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cálculos de Resumo
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const total = income - expense;

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

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount || !date) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: session.user.id,
          description,
          amount: parseFloat(amount),
          category,
          date,
          type // 'income' ou 'expense'
        }])
        .select();

      if (error) throw error;

      setTransactions([data[0], ...transactions]);
      // Limpar form
      setDescription('');
      setAmount('');
      setCategory('');
      setDate('');
      setIsModalOpen(false); // Fecha o modal após salvar
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

  return (
    <div>
      {/* HEADER: Mantendo layout original */}
      <header>
        <h1>dev.<span className="logo-span">finance$</span></h1>
        <div className="user-info">
            <span>{session.user.email}</span>
            <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <main className="main-container">
        
        {/* CARDS DE BALANÇO */}
        <section className="balance-container">
            <div className="card">
                <h3>
                    <span>Entradas</span>
                    <img src="https://assets.rocketseat.com.br/jakeliny/income.svg" alt="Income" />
                </h3>
                <p>{formatCurrency(income)}</p>
            </div>
            <div className="card">
                <h3>
                    <span>Saídas</span>
                    <img src="https://assets.rocketseat.com.br/jakeliny/expense.svg" alt="Expense" />
                </h3>
                <p>{formatCurrency(expense)}</p>
            </div>
            <div className="card total">
                <h3>
                    <span>Total</span>
                    <img src="https://assets.rocketseat.com.br/jakeliny/total.svg" alt="Total" />
                </h3>
                <p>{formatCurrency(total)}</p>
            </div>
        </section>

        {/* BARRA DE AÇÕES */}
        <section className="actions-bar">
            <button className="btn-new" onClick={() => setIsModalOpen(true)}>
                + Nova Transação
            </button>
        </section>

        {/* TABELA DE TRANSAÇÕES */}
        <section className="transaction-table-container">
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Categoria</th>
                        <th>Data</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5">Carregando...</td></tr>
                    ) : (
                        transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td className="description">{transaction.description}</td>
                                <td className={transaction.type === 'income' ? 'income' : 'expense'}>
                                    {transaction.type === 'expense' ? '- ' : ''}
                                    {formatCurrency(transaction.amount)}
                                </td>
                                <td>{transaction.category}</td>
                                <td>{new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td>
                                    <img 
                                        src="https://assets.rocketseat.com.br/jakeliny/minus.svg" 
                                        alt="Remover" 
                                        style={{cursor: 'pointer'}}
                                        onClick={() => handleDelete(transaction.id)}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </section>
      </main>

      {/* MODAL / FORMULÁRIO */}
      {isModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h2>Nova Transação</h2>
                  <form onSubmit={handleAddTransaction}>
                      <div className="input-group">
                          <input 
                            type="text" 
                            placeholder="Descrição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                      </div>
                      
                      <div className="input-group">
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="Valor (ex: 0,00)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                          <small>Use ponto para decimais (ex: 12.99)</small>
                      </div>

                       {/* Toggle de Tipo simplificado para o layout antigo */}
                      <div className="input-group">
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)}
                            style={{width: '100%', padding: '0.8rem', background: 'white'}}
                        >
                            <option value="income">Entrada (Income)</option>
                            <option value="expense">Saída (Expense)</option>
                        </select>
                      </div>

                      <div className="input-group">
                          <input 
                            type="text" 
                            placeholder="Categoria"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          />
                      </div>

                      <div className="input-group">
                          <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                          />
                      </div>

                      <div className="form-actions">
                          <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={() => setIsModalOpen(false)}
                          >
                              Cancelar
                          </button>
                          <button type="submit" className="btn-save">Salvar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}