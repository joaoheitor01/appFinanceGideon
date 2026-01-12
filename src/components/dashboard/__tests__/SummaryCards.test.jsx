// src/components/dashboard/__tests__/SummaryCards.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryCards from '../SummaryCards';

describe('SummaryCards', () => {
  test('renders all three summary cards with correct headings and formatted values', () => {
    const testData = {
      income: 5448.05,
      expense: -5233.92,
      total: 214.13,
    };

    render(<SummaryCards {...testData} />);

    // Check for "Entradas" card
    expect(screen.getByText('Entradas este mês')).toBeInTheDocument();
    expect(screen.getByText('R$\xa05.448,05')).toBeInTheDocument(); // Non-breaking space

    // Check for "Saídas" card
    expect(screen.getByText('Saídas este mês')).toBeInTheDocument();
    expect(screen.getByText('R$\xa05.233,92')).toBeInTheDocument();

    // Check for "Saldo Atual" card
    expect(screen.getByText('Saldo atual')).toBeInTheDocument();
    expect(screen.getByText('R$\xa0214,13')).toBeInTheDocument();
  });

  test('handles zero values correctly', () => {
    const zeroData = {
      income: 0,
      expense: 0,
      total: 0,
    };

    render(<SummaryCards {...zeroData} />);

    // Check that all values are displayed as R$ 0,00
    const zeroValues = screen.getAllByText('R$\xa00,00');
    expect(zeroValues).toHaveLength(3);
  });
});
