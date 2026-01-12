// src/utils/finance.js
// Funções de lógica financeira
// Aqui não tem UI, só cálculo

export function calcularSaldo(transacoes = []) {
  return 0
}

export function gastosDoMes(transacoes = []) {
  return 0
}

export function compararMesAtualAnterior(transacoes = []) {
  return {
    valor: 0,
    positivo: true
  }
}

/**
 * Formats a number as a currency string in BRL.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string (e.g., "R$ 1.234,56").
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}