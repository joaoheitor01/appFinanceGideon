// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import DashboardLayout from '../layout/DashboardLayout';
import './Dashboard.css';

import SummaryCards from './SummaryCards';

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
      <div className={`loading-screen ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="spinner"></div>
      </div>    );
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
      <div className="text-center mb-8">
  <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
    Dashboard Financeiro
  </h1>
  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
    Gerencie suas receitas e despesas com facilidade
  </p>
</div>

{/* Cards de Resumo */}
<SummaryCards income={totals.income} expense={totals.expense} total={totals.total} />

      {/* Formulário de Nova Transação */}
<div className={`rounded-xl p-6 mb-10 shadow-md border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
  <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
    Nova Transação
  </h2>
  
  {/* Botões de tipo */}
  <div className="flex gap-3 mb-6">
    <button
      type="button"
      onClick={() => setType('income')}
      className={`flex-1 p-3 rounded-lg font-semibold text-sm ${type === 'income' ? (isDark ? 'bg-green-700 text-white' : 'bg-green-600 text-white') : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')}`}
    >
      Entrada
    </button>
    <button
      type="button"
      onClick={() => setType('expense')}
      className={`flex-1 p-3 rounded-lg font-semibold text-sm ${type === 'expense' ? (isDark ? 'bg-red-700 text-white' : 'bg-red-600 text-white') : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')}`}
    >
      Saída
    </button>
  </div>

  <form onSubmit={handleAddTransaction}>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Descrição *
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={`w-full p-3 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'} text-sm`}
          placeholder="Ex: Salário, Mercado, etc."
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Valor (R$) *
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className={`w-full p-3 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'} text-sm`}
          placeholder="0,00"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Categoria
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full p-3 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'} text-sm`}
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
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Data
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-full p-3 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'} text-sm`}
        />
      </div>
    </div>

    <button
      type="submit"
      className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${type === 'income' ? (isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600') : (isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600')}`}
    >
      Adicionar Transação
    </button>
  </form>
</div>

      {/* Grid Principal - Resumo Mensal e Últimas Transações */}
      {/* Grid Principal - Resumo Mensal e Últimas Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1: Resumo Mensal */}
        <div className={`rounded-xl p-6 shadow-md border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-semibold mb-5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Resumo Mensal
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`p-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mês
                  </th>
                  <th className={`p-3 text-right font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Entradas
                  </th>
                  <th className={`p-3 text-right font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Saídas
                  </th>
                  <th className={`p-3 text-right font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((month, index) => (
                  <tr 
                    key={index}
                    className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                  >
                    <td className={`p-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {month.name}
                    </td>
                    <td className={`p-3 text-right font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(month.income)}
                    </td>
                    <td className={`p-3 text-right font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {formatCurrency(month.expense)}
                    </td>
                    <td className={`p-3 text-right font-semibold ${month.balance >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                      {formatCurrencyWithSign(month.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className={`mt-4 text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Clique em um mês para ver detalhes
          </p>
        </div>
      
        {/* Coluna 2: Últimas Transações */}
        <div className={`rounded-xl p-6 shadow-md border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Últimas Transações
            </h3>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {transactions.length} transações
            </span>
          </div>
          
          {transactions.length === 0 ? (
            <div className={`text-center py-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <p>Nenhuma transação cadastrada</p>
              <p className="text-xs mt-2">
                Adicione sua primeira transação usando o formulário acima
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`p-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Descrição
                    </th>
                    <th className={`p-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Categoria
                    </th>
                    <th className={`p-3 text-right font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Valor
                    </th>
                    <th className={`p-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Data
                    </th>
                    <th className={`p-3 text-center font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((transaction) => (
                    <tr key={transaction.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`p-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {transaction.description}
                      </td>
                      <td className={`p-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {transaction.category}
                      </td>
                      <td className={`p-3 text-right font-semibold ${transaction.amount >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                        {formatCurrencyWithSign(transaction.amount)}
                      </td>
                      <td className={`p-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className={`px-3 py-1 rounded-md font-medium text-xs transition-all ${isDark ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
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
      </div>    </DashboardLayout>
  );
};

export default Dashboard;export default Dashboard;
