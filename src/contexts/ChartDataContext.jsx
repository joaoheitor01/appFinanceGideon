// src/contexts/ChartDataContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

const ChartDataContext = createContext();

const API_TIMEOUT_MS = 3000; // 3 seconds timeout for API calls

export const ChartDataProvider = ({ children }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // { type: 'network' | 'api' | 'timeout' | 'generic', message: string }
  const [isOffline, setIsOffline] = useState(false); // Simulate offline state

  const simulateFetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsOffline(false); // Reset offline status on retry

    // Simulate offline condition (e.g., 10% chance)
    if (Math.random() < 0.1) {
        setIsOffline(true);
        setIsLoading(false);
        setError({ type: 'offline', message: 'Você está offline. Verifique sua conexão com a internet.' });
        return;
    }

    try {
      const dataPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate network error (e.g., 15% chance)
          if (Math.random() < 0.15) {
            reject({ type: 'network', message: 'Falha na conexão de rede. Tente novamente.' });
          }
          // Simulate API error (e.g., 20% chance)
          else if (Math.random() < 0.20) {
            reject({ type: 'api', message: 'Erro ao buscar dados do servidor. Código: 500' });
          }
          // Simulate empty data (e.g., 10% chance)
          else if (Math.random() < 0.10) {
            resolve({
                labels: [],
                datasets: [] // Empty datasets
            });
          }
          // Successful data fetch
          else {
            resolve({
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [
                  {
                    label: 'Entradas',
                    data: [3500, 4200, 4000, 4800, 5500, 5448.05],
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: 'Saídas',
                    data: [3000, 3800, 4100, 4400, 4900, 5233.92],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                  },
                ],
              });
          }
        }, Math.random() * 1500 + 500); // Simulate 0.5s to 2s fetch time
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject({ type: 'timeout', message: 'A requisição demorou muito para responder.' }), API_TIMEOUT_MS)
      );

      const result = await Promise.race([dataPromise, timeoutPromise]);
      setChartData(result);
      setError(null);
    } catch (err) {
      if (err.type) {
        setError(err);
      } else {
        setError({ type: 'generic', message: 'Ocorreu um erro inesperado: ' + err.message });
      }
      setChartData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    simulateFetch();
  }, [simulateFetch]); // Fetch data on mount

  const retryFetch = () => {
    simulateFetch();
  };

  const chartOptions = { // Standard chart options, can be passed down or configured in component
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const value = {
    chartData,
    isLoading,
    error,
    isOffline,
    retryFetch,
    chartOptions
  };

  return <ChartDataContext.Provider value={value}>{children}</ChartDataContext.Provider>;
};

export const useChartData = () => {
  const context = useContext(ChartDataContext);
  if (context === undefined) {
    throw new Error('useChartData must be used within a ChartDataProvider');
  }
  return context;
};
