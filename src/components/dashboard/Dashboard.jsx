import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../services/supabase";
import { useTheme } from "../../contexts/ThemeContext";
import DashboardLayout from '../components/layout/DashboardLayout';

// Exemplo de componentes de conteúdo
import ResumoMensal from '../components/ResumoMensal';
import UltimasTransacoes from '../components/UltimasTransacoes';

const DashboardPage = () => {
  // Estas funções seriam fornecidas por contextos ou props
  const handleToggleTheme = () => {
    // Lógica para alternar tema
  };
  
  const handleLogout = () => {
    // Lógica para logout
  };

  return (
    <DashboardLayout
      onToggleTheme={handleToggleTheme}
      isDark={true} // Tema escuro padrão
      userEmail="usuario@email.com"
      onLogout={handleLogout}
      userPlan="Premium"
    >
      {/* Coluna esquerda no desktop, topo no mobile */}
      <ResumoMensal />
      
      {/* Coluna direita no desktop, abaixo no mobile */}
      <UltimasTransacoes />
      
      {/* Você pode adicionar mais componentes que seguirão o grid */}
    </DashboardLayout>
  );
};

const Dashboard = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Use AuthContext para obter session e signOut
  const { session, signOut, loading: authLoading, user: authUser } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMonthDetails, setShowMonthDetails] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthTransactions, setMonthTransactions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlan, setUserPlan] = useState('Gratuito');

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('income');

  // Carregar perfil do usuário
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data);
        if (data?.plan) {
          setUserPlan(data.plan);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error.message);
      }
    };
    
    fetchUserProfile();
  }, [authUser]);

  // Carregar transações
  useEffect(() => {
    if (!authUser?.id) return;
    
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Erro ao buscar transações:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    
    // Definir data atual para o form
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, [authUser]);

  // Funções utilitárias
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
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
          user_id: authUser.id,
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

      // Recarregar transações
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: false });
        
      setTransactions(data || []);
      
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

  const handleCloseMonthDetails = () => {
    setShowMonthDetails(false);
    setSelectedMonth(null);
    setMonthTransactions([]);
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Verificar se está carregando
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Verificar se usuário está autenticado
  if (!authUser) {
    return null; // Redirecionamento será feito pelo ProtectedRoute
  }

  const summary = calculateSummary();
  const monthlyData = getMonthlySummary();

  // Modal para detalhes do mês
  const MonthDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Transações de {selectedMonth}
            </h2>
            <button
              onClick={handleCloseMonthDetails}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          {monthTransactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Nenhuma transação neste mês
            </p>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {monthTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {transaction.category}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.amount >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Excluir"
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
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCloseMonthDetails}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 shadow-md transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              Gideon Finance
            </h1>
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Controle Financeiro
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Botão de alternância de tema */}
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-lg transition ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            <div className={`hidden md:flex flex-col items-end ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="font-medium">{authUser?.email}</div>
              <div className="text-sm opacity-75">Plano: {userPlan}</div>
            </div>
            
            <button 
              onClick={handleLogout}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isDark 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Dashboard Financeiro
          </h1>
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Gerencie suas receitas e despesas com facilidade
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Entradas */}
          <div className={`rounded-xl shadow-lg p-6 transition ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Entradas
              </h3>
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                <span className="text-green-500 text-xl">↑</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-500">
              {formatCurrency(summary.income)}
            </div>
          </div>

          {/* Card Saídas */}
          <div className={`rounded-xl shadow-lg p-6 transition ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Saídas
              </h3>
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <span className="text-red-500 text-xl">↓</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-500">
              {formatCurrency(summary.expense)}
            </div>
          </div>

          {/* Card Saldo Total */}
          <div className={`rounded-xl shadow-lg p-6 transition ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Saldo Total
              </h3>
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <span className="text-blue-500 text-xl">⚖️</span>
              </div>
            </div>
            <div className={`text-3xl font-bold ${
              summary.total >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(summary.total)}
            </div>
          </div>
        </div>

        {/* Formulário de Nova Transação */}
        <div className={`mb-8 rounded-xl shadow-lg p-6 transition ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Nova Transação
          </h2>
          
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setType('income')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                type === 'income'
                  ? isDark
                    ? 'bg-green-700 text-white'
                    : 'bg-green-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              Entrada
            </button>
            <button
              onClick={() => setType('expense')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                type === 'expense'
                  ? isDark
                    ? 'bg-red-700 text-white'
                    : 'bg-red-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              Saída
            </button>
          </div>

          <form onSubmit={handleAddTransaction}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Descrição
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Ex: Salário, Mercado, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Valor (R$)
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
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

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Categoria
                </label>
                <div className="flex space-x-2">
                  <select 
                    className={`flex-grow px-4 py-2 rounded-lg border transition ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
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
                    className={`px-3 py-2 rounded-lg font-medium transition ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    onClick={() => {
                      const newCat = prompt('Nova categoria:');
                      if (newCat) {
                        setCategory(newCat);
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Data
                </label>
                <input
                  type="date"
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`px-6 py-3 rounded-lg font-medium transition ${
                type === 'income'
                  ? isDark
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                  : isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Adicionar Transação
            </button>
          </form>
        </div>

        {/* Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo Mensal */}
          <div className={`rounded-xl shadow-lg p-6 transition ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Resumo Mensal
              </h3>
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Clique em um mês para ver detalhes
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={`border-b ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className={`text-left py-3 px-4 font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Mês
                    </th>
                    <th className={`text-right py-3 px-4 font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Entradas
                    </th>
                    <th className={`text-right py-3 px-4 font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Saídas
                    </th>
                    <th className={`text-right py-3 px-4 font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, index) => (
                    <tr 
                      key={index}
                      onClick={() => handleMonthClick(month)}
                      className={`cursor-pointer transition hover:opacity-80 ${
                        isDark 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-50'
                      } ${month.transactions.length === 0 ? 'opacity-60' : ''}`}
                    >
                      <td className={`py-3 px-4 ${
                        isDark ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                        {month.name}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        month.income > 0 ? 'text-green-500' : ''
                      }`}>
                        {formatCurrency(month.income)}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        month.expense > 0 ? 'text-red-500' : ''
                      }`}>
                        {formatCurrency(month.expense)}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        month.balance >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {formatCurrency(month.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Últimas Transações */}
          <div className={`rounded-xl shadow-lg p-6 transition ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Últimas Transações
              </h3>
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {transactions.length} transações encontradas
              </span>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Carregando transações...
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nenhuma transação cadastrada
                </p>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className={`border-b ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className={`text-left py-3 px-4 font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Descrição
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Categoria
                      </th>
                      <th className={`text-right py-3 px-4 font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Valor
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Data
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr 
                        key={transaction.id}
                        className={`border-b ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <td className={`py-3 px-4 ${
                          isDark ? 'text-gray-300' : 'text-gray-800'
                        }`}>
                          {transaction.description}
                        </td>
                        <td className={`py-3 px-4 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {transaction.category}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className={`py-3 px-4 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className={`font-medium ${
                              isDark 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-red-500 hover:text-red-700'
                            }`}
                            title="Excluir"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de detalhes do mês */}
      {showMonthDetails && <MonthDetailsModal />}

      {/* Footer */}
      <footer className={`mt-12 py-6 border-t transition ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            © {new Date().getFullYear()} Gideon Finance - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;