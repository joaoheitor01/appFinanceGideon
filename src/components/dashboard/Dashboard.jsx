// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../hooks/useTheme';
import DashboardLayout from '../layout/DashboardLayout';

/**
 * Dashboard - Página principal do Gideon Finance
 * 
 * Integra:
 * 1. DashboardLayout para estrutura visual
 * 2. AuthContext para autenticação
 * 3. useTheme para controle de tema
 * 4. Supabase para dados
 */

const Dashboard = () => {
  // Hook para controle de tema
  const { isDark, toggleTheme } = useTheme();
  
  // Hook para autenticação
  const { user, signOut, loading: authLoading } = useAuth();
  
  // Estados para dados
  const [transactions, setTransactions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para formulário
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'income'
  });

  // Estados para filtros e visualizações
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [showMonthDetails, setShowMonthDetails] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState([]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  /**
   * Carrega todos os dados necessários para o dashboard
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar perfil do usuário
      await loadUserProfile();
      
      // Carregar transações
      await loadTransactions();
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega o perfil do usuário do Supabase
   */
  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  /**
   * Carrega as transações do usuário
   */
  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  /**
   * Formata valores monetários para exibição
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  /**
   * Calcula os totais das transações
   */
  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Math.abs(t.amount) || 0), 0);
    
    const total = income - expense;
    
    return { income, expense, total };
  };

  /**
   * Agrupa transações por mês
   */
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
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (Math.abs(t.amount) || 0), 0);
      
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

  /**
   * Filtra transações pelo mês selecionado
   */
  const filterByMonth = (monthIndex) => {
    setCurrentMonth(monthIndex);
    const monthData = getMonthlySummary()[monthIndex];
    setSelectedMonthData(monthData.transactions);
    setShowMonthDetails(true);
  };

  /**
   * Adiciona uma nova transação
   */
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    if (!newTransaction.description || !newTransaction.amount) {
      alert('Por favor, preencha a descrição e o valor.');
      return;
    }

    try {
      const amountValue = parseFloat(newTransaction.amount);
      const finalAmount = newTransaction.type === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue);
      
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          description: newTransaction.description,
          amount: finalAmount,
          category: newTransaction.category || 'Outros',
          date: newTransaction.date,
          type: newTransaction.type
        }]);

      if (error) throw error;

      // Resetar formulário
      setNewTransaction({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        type: 'income'
      });

      // Recarregar transações
      await loadTransactions();
      
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    }
  };

  /**
   * Exclui uma transação
   */
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
      setFilteredTransactions(filteredTransactions.filter(t => t.id !== id));
      
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      alert('Erro ao excluir transação. Tente novamente.');
    }
  };

  // Carregamento inicial
  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc'
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

  // Dados calculados
  const totals = calculateTotals();
  const monthlySummary = getMonthlySummary();

  // Componente para exibir detalhes do mês
  const MonthDetailsModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: isDark ? '#ffffff' : '#1e293b'
            }}>
              Transações de {monthlySummary[currentMonth].name}
            </h2>
            <button
              onClick={() => setShowMonthDetails(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: isDark ? '#94a3b8' : '#64748b'
              }}
            >
              ✕
            </button>
          </div>
          
          {selectedMonthData.length === 0 ? (
            <p style={{
              textAlign: 'center',
              color: isDark ? '#94a3b8' : '#64748b',
              padding: '40px 0'
            }}>
              Nenhuma transação neste mês
            </p>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Descrição
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Categoria
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Valor
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Data
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthData.map((transaction) => (
                    <tr key={transaction.id} style={{
                      borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                    }}>
                      <td style={{ padding: '12px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        {transaction.description}
                      </td>
                      <td style={{ padding: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {transaction.category}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: '500',
                        color: transaction.amount >= 0 
                          ? (isDark ? '#86efac' : '#16a34a')
                          : (isDark ? '#fca5a5' : '#dc2626')
                      }}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td style={{ padding: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isDark ? '#fca5a5' : '#dc2626',
                            fontWeight: '500'
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
          
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => setShowMonthDetails(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: isDark ? '#334155' : '#e2e8f0',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontWeight: '500'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      onToggleTheme={toggleTheme}
      isDark={isDark}
      userEmail={user?.email || 'usuário@email.com'}
      onLogout={signOut}
      userPlan={userProfile?.plan || 'Gratuito'}
    >
      {/* Conteúdo do Dashboard organizado em cards */}
      
      {/* Cards de Resumo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Card Saldo Total */}
        <div style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? '#cbd5e1' : '#475569'
            }}>
              Saldo Total
            </h3>
            <div style={{
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#1e40af' : '#dbeafe'
            }}>
              <span style={{ fontSize: '20px' }}>💰</span>
            </div>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: totals.total >= 0 
              ? (isDark ? '#86efac' : '#16a34a')
              : (isDark ? '#fca5a5' : '#dc2626')
          }}>
            {formatCurrency(totals.total)}
          </div>
        </div>

        {/* Card Entradas */}
        <div style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? '#cbd5e1' : '#475569'
            }}>
              Entradas
            </h3>
            <div style={{
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#065f46' : '#d1fae5'
            }}>
              <span style={{ fontSize: '20px', color: isDark ? '#34d399' : '#10b981' }}>↑</span>
            </div>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: isDark ? '#34d399' : '#10b981'
          }}>
            {formatCurrency(totals.income)}
          </div>
        </div>

        {/* Card Saídas */}
        <div style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? '#cbd5e1' : '#475569'
            }}>
              Saídas
            </h3>
            <div style={{
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#7f1d1d' : '#fee2e2'
            }}>
              <span style={{ fontSize: '20px', color: isDark ? '#f87171' : '#dc2626' }}>↓</span>
            </div>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: isDark ? '#f87171' : '#dc2626'
          }}>
            {formatCurrency(totals.expense)}
          </div>
        </div>
      </div>

      {/* Formulário de Nova Transação */}
      <div style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '24px',
          color: isDark ? '#ffffff' : '#1e293b'
        }}>
          Nova Transação
        </h2>
        
        <form onSubmit={handleAddTransaction}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isDark ? '#cbd5e1' : '#475569'
              }}>
                Descrição *
              </label>
              <input
                type="text"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  description: e.target.value
                })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#1e293b',
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
                color: isDark ? '#cbd5e1' : '#475569'
              }}>
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  amount: e.target.value
                })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#1e293b',
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
                color: isDark ? '#cbd5e1' : '#475569'
              }}>
                Categoria
              </label>
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  category: e.target.value
                })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#1e293b',
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
                color: isDark ? '#cbd5e1' : '#475569'
              }}>
                Tipo
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setNewTransaction({
                    ...newTransaction,
                    type: 'income'
                  })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    backgroundColor: newTransaction.type === 'income'
                      ? (isDark ? '#065f46' : '#10b981')
                      : (isDark ? '#334155' : '#e2e8f0'),
                    color: newTransaction.type === 'income' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569')
                  }}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setNewTransaction({
                    ...newTransaction,
                    type: 'expense'
                  })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    backgroundColor: newTransaction.type === 'expense'
                      ? (isDark ? '#7f1d1d' : '#dc2626')
                      : (isDark ? '#334155' : '#e2e8f0'),
                    color: newTransaction.type === 'expense' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569')
                  }}
                >
                  Saída
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isDark ? '#cbd5e1' : '#475569'
              }}>
                Data
              </label>
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  date: e.target.value
                })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#1e293b',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              backgroundColor: newTransaction.type === 'income'
                ? (isDark ? '#10b981' : '#059669')
                : (isDark ? '#ef4444' : '#dc2626'),
              color: '#ffffff'
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
        gap: '24px'
      }}>
        {/* Coluna 1: Resumo Mensal */}
        <div style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDark ? '#ffffff' : '#1e293b'
            }}>
              Resumo Mensal
            </h3>
            <span style={{
              fontSize: '12px',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              Clique em um mês para ver detalhes
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: isDark ? '#cbd5e1' : '#475569'
                  }}>
                    Mês
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: isDark ? '#cbd5e1' : '#475569'
                  }}>
                    Entradas
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: isDark ? '#cbd5e1' : '#475569'
                  }}>
                    Saídas
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: isDark ? '#cbd5e1' : '#475569'
                  }}>
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((month, index) => (
                  <tr 
                    key={index}
                    onClick={() => filterByMonth(index)}
                    style={{
                      borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      cursor: month.transactions.length > 0 ? 'pointer' : 'default',
                      opacity: month.transactions.length === 0 ? 0.6 : 1
                    }}
                  >
                    <td style={{
                      padding: '12px',
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      fontWeight: '500'
                    }}>
                      {month.name}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '500',
                      color: isDark ? '#34d399' : '#10b981'
                    }}>
                      {formatCurrency(month.income)}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '500',
                      color: isDark ? '#f87171' : '#dc2626'
                    }}>
                      {formatCurrency(month.expense)}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: month.balance >= 0 
                        ? (isDark ? '#34d399' : '#10b981')
                        : (isDark ? '#f87171' : '#dc2626')
                    }}>
                      {formatCurrency(month.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coluna 2: Últimas Transações */}
        <div style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDark ? '#ffffff' : '#1e293b'
            }}>
              Últimas Transações
            </h3>
            <span style={{
              fontSize: '12px',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              {transactions.length} transações
            </span>
          </div>
          
          {transactions.length === 0 ? (
            <p style={{
              textAlign: 'center',
              color: isDark ? '#94a3b8' : '#64748b',
              padding: '40px 0'
            }}>
              Nenhuma transação cadastrada
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Descrição
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Categoria
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Valor
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 8).map((transaction) => (
                    <tr key={transaction.id} style={{
                      borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                    }}>
                      <td style={{
                        padding: '12px',
                        color: isDark ? '#e2e8f0' : '#1e293b',
                        fontWeight: '500'
                      }}>
                        {transaction.description}
                      </td>
                      <td style={{
                        padding: '12px',
                        color: isDark ? '#94a3b8' : '#64748b'
                      }}>
                        {transaction.category}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: '500',
                        color: transaction.amount >= 0 
                          ? (isDark ? '#34d399' : '#10b981')
                          : (isDark ? '#f87171' : '#dc2626')
                      }}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '12px',
                            backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                            color: isDark ? '#fca5a5' : '#dc2626'
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

      {/* Modal de detalhes do mês */}
      {showMonthDetails && <MonthDetailsModal />}
    </DashboardLayout>
  );
};

export default Dashboard;