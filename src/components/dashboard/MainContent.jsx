// src/components/dashboard/MainContent.jsx
import React, { lazy, Suspense } from 'react';
import ChartSkeleton from '../common/ChartSkeleton';
import ChartErrorBoundary from '../common/ChartErrorBoundary';
import { 
    ShoppingCartIcon, 
    HomeIcon, 
    TruckIcon, 
    FilmIcon, 
    HeartIcon, 
    CurrencyDollarIcon, 
    ArchiveBoxIcon 
} from '@heroicons/react/24/outline';

// Mock Data
const mockTransactions = [
  { id: 1, type: 'expense', category: 'Alimentação', description: 'Supermercado', amount: -150.75, date: 'Hoje' },
  { id: 2, type: 'income', category: 'Salário', description: 'Salário Mensal', amount: 5000, date: 'Ontem' },
  { id: 3, type: 'expense', category: 'Transporte', description: 'Uber', amount: -25.50, date: 'Ontem' },
  { id: 4, type: 'expense', category: 'Lazer', description: 'Cinema', amount: -45.00, date: '2 dias atrás' },
  { id: 5, type: 'expense', category: 'Moradia', description: 'Conta de Luz', amount: -120.00, date: '3 dias atrás' },
];

const categoryIcons = {
  'Alimentação': <ShoppingCartIcon className="h-6 w-6" />,
  'Moradia': <HomeIcon className="h-6 w-6" />,
  'Transporte': <TruckIcon className="h-6 w-6" />,
  'Lazer': <FilmIcon className="h-6 w-6" />,
  'Saúde': <HeartIcon className="h-6 w-6" />,
  'Salário': <CurrencyDollarIcon className="h-6 w-6" />,
  'Outros': <ArchiveBoxIcon className="h-6 w-6" />,
};

const LazyEvolutionChart = lazy(() => import('./EvolutionChart'));

const RecentTransactions = () => {
  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3 className="h3">Últimas Transações</h3>
        <a href="#" className="text-sm font-semibold text-secondary-color hover:underline">Ver todas</a>
      </div>
      <ul className="divide-y divide-border-color">
        {mockTransactions.map(t => (
          <li key={t.id} className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-bg-hover rounded-lg text-text-secondary">
                    {categoryIcons[t.category] || <ArchiveBoxIcon className="h-6 w-6" />}
                </div>
                <div>
                    <p className="font-semibold text-text-primary">{t.description}</p>
                    <p className="text-sm text-text-secondary">{t.date}</p>
                </div>
            </div>
            <div className={`font-semibold ${t.type === 'income' ? 'text-primary-color' : 'text-danger-color'}`}>
              {t.type === 'income' ? '+' : '-'}R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}
            </div>
          </li>
        ))}
      </ul>
      <div className="card-footer">
        <button className="btn btn-primary w-full">Adicionar transação rápida</button>
      </div>
    </div>
  );
};

const MainContent = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <ChartErrorBoundary>
                <Suspense fallback={<ChartSkeleton />}>
                <LazyEvolutionChart />
                </Suspense>
            </ChartErrorBoundary>
        </div>
      <RecentTransactions />
    </div>
  );
};

export default MainContent;
