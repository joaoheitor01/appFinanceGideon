// src/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import SummaryCards from '../components/dashboard/SummaryCards';
import MainContent from '../components/dashboard/MainContent';
import DetailedTransactions from '../components/dashboard/DetailedTransactions';
import '../components/dashboard/SummaryCards.css';
import '../components/dashboard/MainContent.css';
import '../components/dashboard/DetailedTransactions.css';
import '../components/dashboard/Dashboard.css';

const Dashboard = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlan, setUserPlan] = useState('Gratuito');

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

  // Carregamento
  if (authLoading || loading) {
    return (
      <div className={`loading-screen ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="spinner"></div>
      </div>
    );
  }

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

      <SummaryCards />

      <MainContent />

      <DetailedTransactions />
    </DashboardLayout>
  );
};

export default Dashboard;
