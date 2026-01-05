// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../hooks/useTheme';
import DashboardLayout from '../layout/DashboardLayout';

const Dashboard = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlan, setUserPlan] = useState('Gratuito');
  
  // Estado do formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('income');

  // Carregar dados do usuário e transações
  useEffect(() => {
    if (user?.id) {
      loadUserData();
      loadTransactions();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setUserProfile(data);
      if (data?.plan) setUserPlan(data.plan);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatação de moeda
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(num));
  };

  const formatCurrencyWithSign = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(num));
    return num >= 0 ? formatted : `-${formatted}`;
  };

  // Cálculos
  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    
    const total = income - expense;
    
    return { income, expense, total };
  };

  // Resumo por mês
  const getMonthlySummary = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const currentYear = new Date().getFullYear();
    
    return months.map((monthName, index) => {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income' || t.amount > 0)
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense' || t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
      
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

  // Adicionar transação
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    if (!description || !amount) {
      alert('Por favor, preencha a descrição e o valor.');
      return;
    }

    try {
      const amountValue = parseFloat(amount);
      const finalAmount = type === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue);
      
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          description,
          amount: finalAmount,
          category: category || 'Outros',
          date,
          type
        }]);

      if (error) throw error;

      // Resetar formulário
      setDescription('');
      setAmount('');
      setCategory('');
      setType('income');
      setDate(new Date().toISOString().split('T')[0]);

      // Recarregar transações
      await loadTransactions();
      
      alert('Transação adicionada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    }
  };

  // Excluir transação
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

      setTransactions(transactions.filter(t => t.id !== id));
      alert('Transação excluída com sucesso!');
      
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      alert('Erro ao excluir transação. Tente novamente.');
    }
  };

  // Carregamento
  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: isDark ? '#121826' : '#f9fafb'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const totals = calculateTotals();
  const monthlySummary = getMonthlySummary();

  return (
    <DashboardLayout
      onToggleTheme={toggleTheme}
      isDark={isDark}
      userEmail={user?.email || 'usuário@email.com'}
      onLogout={signOut}
      userPlan={userPlan}
    >
      {/* Título do Dashboard */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: isDark ? '#ffffff' : '#1f2937',
          marginBottom: '8px'
        }}>
          Dashboard Financeiro
        </h1>
        <p style={{
          fontSize: '16px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          Gerencie suas receitas e despesas com facilidade
        </p>
      </div>

      {/* Cards de Resumo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Card Entradas */}
        <div style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? '#d1d5db' : '#4b5563'
            }}>
              ENTRADAS
            </span>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: isDark ? '#064e3b' : '#d1fae5'
            }}>
              <span style={{ fontSize: '20px', color: isDark ? '#34d399' : '#10b981' }}>↑</span>
            </div>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: isDark ? '#34d399' : '#10b981'
          }}>
            {formatCurrency(totals.income)}
          </div>
        </div>

        {/* Card Saídas */}
        <div style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? '#d1d5db' : '#4b5563'
            }}>
              SAÍDAS
            </span>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: isDark ? '#7f1d1d' : '#fee2e2'
            }}>
              <span style={{ fontSize: '20px', color: isDark ? '#f87171' : '#dc2626' }}>↓</span>
            </div>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: isDark ? '#f87171' : '#dc2626'
          }}>
            {formatCurrency(totals.expense)}
          </div>
        </div>

        {/* Card Saldo Total */}
        <div style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? '#d1d5db' : '#4b5563'
            }}>
              SALDO TOTAL
            </span>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: isDark ? '#1e40af' : '#dbeafe'
            }}>
              <span style={{ fontSize: '20px', color: isDark ? '#60a5fa' : '#3b82f6' }}>💰</span>
            </div>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: totals.total >= 0 
              ? (isDark ? '#34d399' : '#10b981')
              : (isDark ? '#f87171' : '#dc2626')
          }}>
            {formatCurrencyWithSign(totals.total)}
          </div>
        </div>
      </div>

      {/* Formulário de Nova Transação */}
      <div style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '40px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '24px',
          color: isDark ? '#ffffff' : '#1f2937'
        }}>
          Nova Transação
        </h2>
        
        {/* Botões de tipo */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => setType('income')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: type === 'income'
                ? (isDark ? '#065f46' : '#10b981')
                : (isDark ? '#374151' : '#f3f4f6'),
              color: type === 'income' ? '#ffffff' : (isDark ? '#d1d5db' : '#6b7280')
            }}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: type === 'expense'
                ? (isDark ? '#7f1d1d' : '#dc2626')
                : (isDark ? '#374151' : '#f3f4f6'),
              color: type === 'expense' ? '#ffffff' : (isDark ? '#d1d5db' : '#6b7280')
            }}
          >
            Saída
          </button>
        </div>

        <form onSubmit={handleAddTransaction}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#6b7280'
              }}>
                Descrição *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  color: isDark ? '#ffffff' : '#1f2937',
                  fontSize: '14px'
                }}
                placeholder="Ex: Salário, Mercado, etc."
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#6b7280'
              }}>
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  color: isDark ? '#ffffff' : '#1f2937',
                  fontSize: '14px'
                }}
                placeholder="0,00"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#6b7280'
              }}>
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  color: isDark ? '#ffffff' : '#1f2937',
                  fontSize: '14px'
                }}
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
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#6b7280'
              }}>
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  color: isDark ? '#ffffff' : '#1f2937',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              backgroundColor: type === 'income'
                ? (isDark ? '#10b981' : '#059669')
                : (isDark ? '#ef4444' : '#dc2626'),
              color: '#ffffff',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = type === 'income'
                ? (isDark ? '#0da271' : '#047857')
                : (isDark ? '#dc2626' : '#b91c1c');
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = type === 'income'
                ? (isDark ? '#10b981' : '#059669')
                : (isDark ? '#ef4444' : '#dc2626');
            }}
          >
            Adicionar Transação
          </button>
        </form>
      </div>

      {/* Grid Principal - Resumo Mensal e Últimas Transações */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px'
      }}>
        {/* Coluna 1: Resumo Mensal */}
        <div style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            color: isDark ? '#ffffff' : '#1f2937'
          }}>
            Resumo Mensal
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{
                  borderBottom: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`
                }}>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: isDark ? '#d1d5db' : '#6b7280'
                  }}>
                    Mês
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: isDark ? '#d1d5db' : '#6b7280'
                  }}>
                    Entradas
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: isDark ? '#d1d5db' : '#6b7280'
                  }}>
                    Saídas
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: isDark ? '#d1d5db' : '#6b7280'
                  }}>
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((month, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: `1px solid ${isDark ? '#374151' : '#f3f4f6'}`,

                      cursor: 'default'
                    }}
                  >
                    <td style={{
                      padding: '14px 16px',
                      color: isDark ? '#e5e7eb' : '#374151',
                      fontWeight: '500'
                    }}>
                      {month.name}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      textAlign: 'right',
                      fontWeight: '500',
                      color: isDark ? '#34d399' : '#059669'
                    }}>
                      {formatCurrency(month.income)}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      textAlign: 'right',
                      fontWeight: '500',
                      color: isDark ? '#f87171' : '#dc2626'
                    }}>
                      {formatCurrency(month.expense)}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: month.balance >= 0 
                        ? (isDark ? '#34d399' : '#059669')
                        : (isDark ? '#f87171' : '#dc2626')
                    }}>
                      {formatCurrencyWithSign(month.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p style={{
            marginTop: '16px',
            fontSize: '12px',
            color: isDark ? '#9ca3af' : '#9ca3af',
            textAlign: 'center'
          }}>
            Clique em um mês para ver detalhes
          </p>
        </div>

        {/* Coluna 2: Últimas Transações */}
        <div style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: isDark ? '#ffffff' : '#1f2937'
            }}>
              Últimas Transações
            </h3>
            <span style={{
              fontSize: '14px',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              {transactions.length} transações
            </span>
          </div>
          
          {transactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: isDark ? '#9ca3af' : '#9ca3af'
            }}>
              <p>Nenhuma transação cadastrada</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                Adicione sua primeira transação usando o formulário acima
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`
                  }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: isDark ? '#d1d5db' : '#6b7280'
                    }}>
                      Descrição
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: isDark ? '#d1d5db' : '#6b7280'
                    }}>
                      Categoria
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: isDark ? '#d1d5db' : '#6b7280'
                    }}>
                      Valor
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: isDark ? '#d1d5db' : '#6b7280'
                    }}>
                      Data
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: isDark ? '#d1d5db' : '#6b7280'
                    }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((transaction) => (
                    <tr key={transaction.id} style={{
                      borderBottom: `1px solid ${isDark ? '#374151' : '#f3f4f6'}`
                    }}>
                      <td style={{
                        padding: '14px 16px',
                        color: isDark ? '#e5e7eb' : '#374151',
                        fontWeight: '500'
                      }}>
                        {transaction.description}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        color: isDark ? '#d1d5db' : '#6b7280'
                      }}>
                        {transaction.category}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: transaction.amount >= 0 
                          ? (isDark ? '#34d399' : '#059669')
                          : (isDark ? '#f87171' : '#dc2626')
                      }}>
                        {formatCurrencyWithSign(transaction.amount)}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        color: isDark ? '#d1d5db' : '#6b7280'
                      }}>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ 
                        padding: '14px 16px',
                        textAlign: 'center'
                      }}>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '12px',
                            backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                            color: isDark ? '#fca5a5' : '#dc2626',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = isDark ? '#991b1b' : '#fecaca';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = isDark ? '#7f1d1d' : '#fee2e2';
                          }}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;