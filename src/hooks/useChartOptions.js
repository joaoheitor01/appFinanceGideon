// src/hooks/useChartOptions.js
import { useMemo } from 'react';

/**
 * Custom hook to provide common Chart.js options.
 * This centralizes configurations like responsiveness, aspect ratio,
 * and plugin settings for legend and tooltips, promoting consistency
 * across different charts.
 *
 * @param {object} overrides - Optional object to override or extend default options.
 * @returns {object} The memoized Chart.js options object.
 */
export const useChartOptions = (overrides = {}) => {
  const commonOptions = useMemo(() => ({
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
    // Any other truly common options can go here
  }), []);

  return useMemo(() => ({ ...commonOptions, ...overrides }), [commonOptions, overrides]);
};
