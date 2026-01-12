// src/utils/__tests__/finance.test.js
import { formatCurrency } from '../finance';

describe('finance utility functions', () => {
  describe('formatCurrency', () => {
    test('should format a positive number as BRL currency', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    });

    test('should format a negative number as BRL currency', () => {
      expect(formatCurrency(-1234.56)).toBe('R$ -1.234,56');
    });

    test('should format zero as BRL currency', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    test('should handle numbers with more than two decimal places by rounding', () => {
      expect(formatCurrency(1234.567)).toBe('R$ 1.234,57');
    });

    test('should handle numbers with less than two decimal places by adding zeros', () => {
      expect(formatCurrency(100)).toBe('R$ 100,00');
    });

    test('should format a large number correctly', () => {
      expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89');
    });
  });
});