// Dashboard com layout claro e centralizado
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const Dashboard = ({ session, userPlan }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMonthDetails, setShowMonthDetails] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthTransactions, setMonthTransactions] = useState([]);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('income');

  // Carregar transações
  useEffect(() => {
    fetchTransactions();
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, [session]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Funções utilitárias (mantidas do código original)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const maskCurrency = (input) => {
    let value = input.replace(/\D/g, '');
    value = (Number(value) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return value;
  };

  const parseCurrency = (valueString) => {
    if (!valueString) return 0;
    const cleanNumbers = valueString.replace(/\D/g, '');
    return Number(cleanNumbers) / 100;
  };

  // Cálculos
  const calculateSummary = () => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.amount > 0) {
        income += t.amount;
      } else {
        expense += Math.abs(t.amount);
      }
    });

    const total = income - expense;

    return { income, expense, total };
  };

  const getMonthlySummary = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const now = new Date();
    const currentYear = now.getFullYear();
    
    return months.map((monthName, index) => {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });

      let income = 0;
      let expense = 0;

      monthTransactions.forEach(t => {
        if (t.amount > 0) {
          income += t.amount;
        } else {
          expense += Math.abs(t.amount);
        }
      });

      const balance = income - expense;

      return {
        name: monthName,
        income,
        expense,
        balance,
        transactions: monthTransactions
      };
    });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    if (!description || !amount || !date) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const amountValue = parseCurrency(amount);
    const finalAmount = type === 'expense' ? amountValue * -1 : amountValue;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: session.user.id,
          description,
          amount: finalAmount,
          category: category || 'Outros',
          date,
          type
        }]);

      if (error) throw error;

      // Reset form
      setDescription('');
      setAmount('');
      setCategory('');
      setType('income');
      setShowModal(false);

      // Recarregar transações
      await fetchTransactions();
      
    } catch (error) {
      console.error('Erro ao adicionar transação:', error.message);
      alert('Erro ao salvar transação.');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualizar lista local
      setTransactions(transactions.filter(t => t.id !== id));
      if (showMonthDetails) {
        setMonthTransactions(monthTransactions.filter(t => t.id !== id));
      }
      
    } catch (error) {
      console.error('Erro ao excluir transação:', error.message);
      alert('Erro ao excluir transação.');
    }
  };

  const handleMonthClick = (monthData) => {
    setSelectedMonth(monthData.name);
    setMonthTransactions(monthData.transactions);
    setShowMonthDetails(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const summary = calculateSummary();
  const monthlyData = getMonthlySummary();

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="container header-content">
          <div className="brand">
            <h1>Gideon Finance</h1>
            <span className="brand-subtitle">Controle Financeiro</span>
          </div>
          
          <div className="user-area">
            <div className="user-info">
              <div className="user-email">{session.user.email}</div>
              <div className="user-plan">Plano: {userPlan}</div>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="main-content container fade-in">
        <div className="text-center mb-8">
          <h1 className="page-title">Dashboard Financeiro</h1>
          <p className="page-subtitle">Gerencie suas receitas e despesas com facilidade</p>
        </div>

        {/* Cards de Resumo */}
        <section className="summary-section">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">Entradas</span>
                <div className="card-icon income-icon">
                  <i>↑</i>
                </div>
              </div>
              <div className="card-value income-value">
                {formatCurrency(summary.income)}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">Saídas</span>
                <div className="card-icon expense-icon">
                  <i>↓</i>
                </div>
              </div>
              <div className="card-value expense-value">
                {formatCurrency(summary.expense)}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">Saldo Total</span>
                <div className="card-icon total-icon">
                  <i>⚖️</i>
                </div>
              </div>
              <div className="card-value total-value">
                {formatCurrency(summary.total)}
              </div>
            </div>
          </div>
        </section>

        {/* Formulário de Nova Transação */}
        <section className="form-section">
          <h2 className="section-title">Nova Transação</h2>
          
          <div className="type-toggle mb-4">
            <label 
              className={`toggle-label income-label ${type === 'income' ? 'active' : ''}`}
              onClick={() => setType('income')}
            >
              Entrada
            </label>
            <label 
              className={`toggle-label expense-label ${type === 'expense' ? 'active' : ''}`}
              onClick={() => setType('expense')}
            >
              Saída
            </label>
          </div>

          <form onSubmit={handleAddTransaction} className="transaction-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Salário, Mercado, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Valor (R$)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value) {
                      e.target.value = maskCurrency(e.target.value);
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoria</label>
                <div className="category-wrapper">
                  <select 
                    className="form-select" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Moradia">Moradia</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Outros">Outros</option>
                  </select>
                  <button 
                    type="button" 
                    className="btn-add-category"
                    onClick={() => {
                      const newCat = prompt('Nova categoria:');
                      if (newCat) {
                        // Aqui você pode adicionar a nova categoria à lista
                        // Por enquanto apenas preenche o campo
                        setCategory(newCat);
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Adicionar Transação
              </button>
            </div>
          </form>
        </section>

        {/* Tabelas */}
        <section className="tables-section">
          {/* Resumo Mensal */}
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Resumo Mensal</h3>
              <span className="text-muted">Clique em um mês para ver detalhes</span>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th className="text-right">Entradas</th>
                    <th className="text-right">Saídas</th>
                    <th className="text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, index) => (
                    <tr 
                      key={index} 
                      onClick={() => handleMonthClick(month)}
                      style={{ cursor: 'pointer' }}
                      className={month.transactions.length === 0 ? 'text-muted' : ''}
                    >
                      <td>{month.name}</td>
                      <td className={`text-right ${month.income > 0 ? 'text-green' : ''}`}>
                        {formatCurrency(month.income)}
                      </td>
                      <td className={`text-right ${month.expense > 0 ? 'text-red' : ''}`}>
                        {formatCurrency(month.expense)}
                      </td>
                      <td className={`text-right ${month.balance >= 0 ? 'text-green' : 'text-red'}`}>
                        <strong>{formatCurrency(month.balance)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Últimas Transações */}
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Últimas Transações</h3>
              <span className="text-muted">
                {transactions.length} transações encontradas
              </span>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th className="text-right">Valor</th>
                    <th>Data</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        Carregando transações...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        Nenhuma transação cadastrada
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.description}</td>
                        <td>{transaction.category}</td>
                        <td className={`text-right ${transaction.amount >= 0 ? 'text-green' : 'text-red'}`}>
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td>{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            title="Excluir"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;