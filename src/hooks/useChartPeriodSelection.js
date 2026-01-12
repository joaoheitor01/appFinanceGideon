// src/hooks/useChartPeriodSelection.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing chart period selection and related data fetching.
 *
 * @param {object} options - Configuration options for the hook.
 * @param {function} options.prefetchChartData - Function to prefetch chart data (e.g., from react-query's useChartData).
 * @param {function} options.debouncedRefetch - Debounced refetch function for chart data (e.g., from react-query's useChartData).
 * @param {string[]} [options.periods=['3M', '6M', '1A', 'Tudo']] - Array of available periods.
 * @param {string} [options.initialPeriod='6M'] - The initial active period.
 * @returns {object} An object containing:
 *   - activePeriod: The currently active period.
 *   - handlePeriodChange: Function to call when the period changes.
 *   - handlePeriodPrefetch: Function to call on mouse enter for prefetching.
 *   - periods: The array of periods.
 */
export const useChartPeriodSelection = ({
  prefetchChartData,
  debouncedRefetch,
  periods = ['3M', '6M', '1A', 'Tudo'],
  initialPeriod = '6M',
}) => {
  const [activePeriod, setActivePeriod] = useState(initialPeriod);

  // Effect for debounced refetch when activePeriod changes
  useEffect(() => {
    // Ensure debouncedRefetch is available before calling
    if (debouncedRefetch) {
      debouncedRefetch();
    }
  }, [activePeriod, debouncedRefetch]);

  const handlePeriodChange = useCallback((period) => {
    setActivePeriod(period);
  }, []);

  const handlePeriodPrefetch = useCallback((chartKey, period) => {
    // Ensure prefetchChartData is available before calling
    if (prefetchChartData) {
      prefetchChartData(chartKey, { period: period });
    }
  }, [prefetchChartData]);

  return {
    activePeriod,
    handlePeriodChange,
    handlePeriodPrefetch,
    periods,
  };
};
