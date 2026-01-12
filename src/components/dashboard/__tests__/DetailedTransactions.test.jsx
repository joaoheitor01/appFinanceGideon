import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailedTransactions from '../DetailedTransactions';
import { BrowserRouter } from 'react-router-dom';

// Mock the NewTransactionModal to avoid dealing with its complexity in this test
jest.mock('../NewTransactionModal', () => () => <div data-testid="new-transaction-modal" />);

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <DetailedTransactions />
        </BrowserRouter>
    );
};

describe('DetailedTransactions', () => {
    test('renders the component with initial data', () => {
        renderComponent();

        expect(screen.getByText('Salário Mensal')).toBeInTheDocument();
        expect(screen.getByText('Supermercado')).toBeInTheDocument();
    });

    test('filters transactions by description', () => {
        renderComponent();

        const searchInput = screen.getByLabelText('Buscar transações');
        fireEvent.change(searchInput, { target: { value: 'Salário' } });

        expect(screen.getByText('Salário Mensal')).toBeInTheDocument();
        expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    });

    test('filters transactions by category', () => {
        renderComponent();

        const categorySelect = screen.getByLabelText('Filtrar por categoria');
        fireEvent.change(categorySelect, { target: { value: 'Lazer' } });

        expect(screen.getByText('Cinema')).toBeInTheDocument();
        expect(screen.getByText('Show')).toBeInTheDocument();
        expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    });

    test('paginates transactions', () => {
        renderComponent();

        // Initially, we should see the first 10 transactions
        expect(screen.getByText('Salário Mensal')).toBeInTheDocument();
        expect(screen.queryByText('Aluguel')).not.toBeInTheDocument();
        
        const nextPageButton = screen.getByText('Próxima');
        fireEvent.click(nextPageButton);

        // After clicking next, we should see the next transactions
        expect(screen.queryByText('Salário Mensal')).not.toBeInTheDocument();
        expect(screen.getByText('Aluguel')).toBeInTheDocument();
    });

    test('opens the new transaction modal', () => {
        renderComponent();

        const newTransactionButton = screen.getByText('Nova Transação');
        fireEvent.click(newTransactionButton);
        
        expect(screen.getByTestId('new-transaction-modal')).toBeInTheDocument();
    });
});
