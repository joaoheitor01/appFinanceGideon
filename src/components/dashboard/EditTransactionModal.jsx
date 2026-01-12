// src/components/dashboard/EditTransactionModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useCurrencyMask, formatCurrency } from '../../hooks/useCurrencyMask';
import TagInput from '../common/TagInput';
import '../common/TagInput.css';
import CategorySelector from '../common/CategorySelector';
import './NewTransactionModal.css';

// Mock categories, should be fetched from context or props later
const INITIAL_CATEGORIES = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Salário'];

const EditTransactionModal = ({ isOpen, onClose, transaction, onUpdate, onDuplicate }) => {
    const [transactionType, setTransactionType] = useState('saida');
    const [description, setDescription] = useState('');
    const { maskedValue: amount, handleValueChange: handleAmountChange, getRawValue, setMaskedValue } = useCurrencyMask();
    const [date, setDate] = useState('');
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (transaction) {
            setTransactionType(transaction.amount >= 0 ? 'entrada' : 'saida');
            setDescription(transaction.description);
            setMaskedValue(formatCurrency(Math.abs(transaction.amount)));
            setDate(transaction.date);
            setCategory(transaction.category);
            setTags(transaction.tags || []);
        }
    }, [transaction, setMaskedValue]);

    const validate = () => {
        const newErrors = {};
        if (!description) newErrors.description = 'Descrição é obrigatória.';
        if (getRawValue(amount) <= 0) newErrors.amount = 'O valor deve ser maior que zero.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!validate()) return;
        
        const rawAmount = getRawValue(amount);
        const updatedTransaction = {
            ...transaction,
            date,
            description,
            category,
            amount: transactionType === 'entrada' ? rawAmount : -rawAmount,
            tags,
        };
        onUpdate(updatedTransaction);
    };

    const handleDuplicate = () => {
        const rawAmount = getRawValue(amount);
        const newTransaction = {
            ...transaction,
            id: Date.now(), // new id
            description: `${transaction.description} (Cópia)`,
            date,
            category,
            amount: transactionType === 'entrada' ? rawAmount : -rawAmount,
            tags,
        };
        onDuplicate(newTransaction);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Transação">
            {transaction && (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="toggle-switch">
                            <button
                                type="button"
                                className={`toggle-btn ${transactionType === 'saida' ? 'active' : ''}`}
                                onClick={() => setTransactionType('saida')}
                            >
                                Saída
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${transactionType === 'entrada' ? 'active' : ''}`}
                                onClick={() => setTransactionType('entrada')}
                            >
                                Entrada
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-description">Descrição</label>
                        <input
                            type="text"
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-amount">Valor</label>
                        <input
                            type="text"
                            id="edit-amount"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="R$ 0,00"
                        />
                        {errors.amount && <span className="error-message">{errors.amount}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-date">Data</label>
                        <input
                            type="date"
                            id="edit-date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-category">Categoria</label>
                        <CategorySelector
                            category={category}
                            setCategory={setCategory}
                            categories={categories}
                            setCategories={setCategories}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tags">Tags</label>
                        <TagInput tags={tags} setTags={setTags} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={handleDuplicate} className="btn btn-secondary">Duplicar</button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default EditTransactionModal;
