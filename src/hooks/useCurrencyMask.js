// src/hooks/useCurrencyMask.js
import { useState, useCallback } from 'react';

const formatCurrency = (value) => {
    if (!value) return '';

    // Remove non-digit characters
    let num = value.toString().replace(/\D/g, '');
    if (!num) return '';

    // Pad with zeros if needed
    num = num.padStart(3, '0');

    // Format to R$
    const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(parseFloat(num) / 100);

    return formatted;
};

const useCurrencyMask = (initialValue = '') => {
    const [maskedValue, setMaskedValue] = useState(formatCurrency(initialValue));

    const handleValueChange = useCallback((e) => {
        const rawValue = e.target.value;
        setMaskedValue(formatCurrency(rawValue));
    }, []);

    const getRawValue = (formattedValue) => {
        if (!formattedValue) return 0;
        const raw = formattedValue.replace(/\D/g, '');
        return parseFloat(raw) / 100;
    };
    
    return {
        maskedValue,
        handleValueChange,
        getRawValue,
        setMaskedValue
    };
};

export { useCurrencyMask, formatCurrency };
