// src/hooks/useChartData.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce'; // Assuming use-debounce is available or will be installed

// If use-debounce is not available, a simple debounce:
// const simpleDebounce = (func, delay) => {
//   let timeout;
//   return function(...args) {
//     const context = this;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(context, args), delay);
//   };
// };

// Mock API endpoint for chart data
const fetchChartDataFromApi = async ({ queryKey }) => {
  const [_key, endpoint, filters] = queryKey;
  console.log(`Fetching chart data for endpoint: ${endpoint} with filters:`, filters);

  // Simulate API call with delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));

  // Simulate various API responses
  const random = Math.random();

  if (random < 0.1) { // Simulate offline (10% chance)
    throw new Error('Você está offline. Verifique sua conexão com a internet.');
  } else if (random < 0.25) { // Simulate network error (15% chance)
    throw new Error('Falha na conexão de rede. Tente novamente.');
  } else if (random < 0.40) { // Simulate API error (15% chance)
    throw new Error('Erro ao buscar dados do servidor. Código: 500');
  } else if (random < 0.50) { // Simulate empty data (10% chance)
    return {
      labels: [],
      datasets: []
    };
  } else { // Simulate success
    return {
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
    };
  }
};


export const useChartData = (endpoint, filters = {}, options) => {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['chartData', endpoint, filters],
    queryFn: fetchChartDataFromApi,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: true, // Default in React Query, explicit for clarity
    retry: 3, // Retry failed queries 3 times
    ...options,
  });

  // Debounced refetch for filter changes
  const debouncedRefetch = useDebouncedCallback(() => {
    queryResult.refetch();
  }, 500); // Debounce for 500ms

  // Placeholder for prefetching on hover
  const prefetchChartData = useCallback((prefetchEndpoint, prefetchFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: ['chartData', prefetchEndpoint, prefetchFilters],
      queryFn: fetchChartDataFromApi,
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  // Placeholder for optimistic updates - would typically be part of a mutation
  // For charts displaying historical data, optimistic updates are less common.
  // If this chart were to display data that a user is actively modifying (e.g., adding a transaction),
  // you would use useMutation with onMutate, onError, onSettled callbacks.
  const optimisticUpdatePlaceholder = () => {
    console.log("Optimistic update would be implemented here for mutable data.");
  };

  return {
    ...queryResult,
    debouncedRefetch,
    prefetchChartData,
    optimisticUpdatePlaceholder,
  };
};