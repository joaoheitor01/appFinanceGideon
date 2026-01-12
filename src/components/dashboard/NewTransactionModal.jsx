// src/components/dashboard/NewTransactionModal.jsx
import React from 'react';
import Modal from '../common/Modal';
import { useCurrencyMask } from '../../hooks/useCurrencyMask';
import TagInput from '../common/TagInput';
import CategorySelector from '../common/CategorySelector';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Mock categories, should be fetched from context or props later
const INITIAL_CATEGORIES = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Salário'];

const TransactionSchema = Yup.object().shape({
  description: Yup.string().required('Descrição é obrigatória.'),
  amount: Yup.string().test('is-greater-than-zero', 'O valor deve ser maior que zero.', (value) => {
    const rawValue = parseFloat(value.replace(/\./g, '').replace(',', '.').replace('R$', ''));
    return rawValue > 0;
  }).required('O valor é obrigatório.'),
  date: Yup.date().required('A data é obrigatória.'),
  category: Yup.string().required('A categoria é obrigatória.'),
});

const NewTransactionModal = ({ isOpen, onClose, onAddTransaction }) => {
    const { maskedValue, handleValueChange, getRawValue } = useCurrencyMask();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Transação">
            <Formik
                initialValues={{
                    transactionType: 'saida',
                    description: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    category: INITIAL_CATEGORIES[0],
                    tags: [],
                }}
                validationSchema={TransactionSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    const rawAmount = getRawValue(values.amount);
                    const newTransaction = {
                        id: Date.now(),
                        date: values.date,
                        description: values.description,
                        category: values.category,
                        amount: values.transactionType === 'entrada' ? rawAmount : -rawAmount,
                        tags: values.tags,
                    };
                    onAddTransaction(newTransaction);
                    resetForm();
                    onClose();
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting, setFieldValue, values }) => (
                    <Form>
                        <div className="input-group">
                            <div className="flex gap-2">
                                <button 
                                    type="button"
                                    className={`btn w-full ${values.transactionType === 'saida' ? 'btn-primary' : 'btn-outline'}`} 
                                    onClick={() => setFieldValue('transactionType', 'saida')}
                                >
                                    Saída
                                </button>
                                <button 
                                    type="button"
                                    className={`btn w-full ${values.transactionType === 'entrada' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setFieldValue('transactionType', 'entrada')}
                                >
                                    Entrada
                                </button>
                            </div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="description" className="input-label">Descrição</label>
                            <Field 
                                type="text" 
                                id="description"
                                name="description"
                                placeholder="Ex: Compras do mês"
                                className="input-field"
                            />
                            <ErrorMessage name="description" component="div" className="text-danger-color text-sm mt-1" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="amount" className="input-label">Valor</label>
                            <Field
                                type="text"
                                id="amount"
                                name="amount"
                                placeholder="R$ 0,00"
                                className="input-field"
                                value={maskedValue}
                                onChange={(e) => {
                                    handleValueChange(e);
                                    setFieldValue('amount', e.target.value);
                                }}
                            />
                            <ErrorMessage name="amount" component="div" className="text-danger-color text-sm mt-1" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="date" className="input-label">Data</label>
                            <Field 
                                type="date" 
                                id="date"
                                name="date"
                                className="input-field"
                            />
                            <ErrorMessage name="date" component="div" className="text-danger-color text-sm mt-1" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="category" className="input-label">Categoria</label>
                            <CategorySelector 
                                category={values.category}
                                setCategory={(c) => setFieldValue('category', c)}
                                categories={INITIAL_CATEGORIES}
                                setCategories={() => {}}
                            />
                            <ErrorMessage name="category" component="div" className="text-danger-color text-sm mt-1" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="tags" className="input-label">Tags</label>
                            <TagInput tags={values.tags} setTags={(t) => setFieldValue('tags', t)} />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default NewTransactionModal;