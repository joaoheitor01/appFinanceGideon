import React, { useState, useMemo } from 'react';
import TransactionListView from './TransactionListView';
import NewTransactionModal from './NewTransactionModal';
import Modal from '../common/Modal';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { PencilIcon, TrashIcon, PlusIcon, TableCellsIcon, ListBulletIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Mock Data
const mockData = [
    { id: 1, date: '2024-07-26', description: 'Salário Mensal', category: 'Salário', amount: 5000 },
    { id: 2, date: '2024-07-25', description: 'Supermercado', category: 'Alimentação', amount: -250.75 },
    { id: 3, date: '2024-07-24', description: 'Conta de Luz', category: 'Moradia', amount: -120.00 },
    { id: 4, date: '2024-07-24', description: 'Cinema', category: 'Lazer', amount: -45.00 },
    { id: 5, date: '2024-07-23', description: 'Uber', category: 'Transporte', amount: -25.50 },
    { id: 6, date: '2024-07-22', description: 'Curso de React', category: 'Educação', amount: -300.00 },
    { id: 7, date: '2024-07-21', description: 'Farmácia', category: 'Saúde', amount: -75.20 },
    { id: 8, date: '2024-06-26', description: 'Salário Mensal', category: 'Salário', amount: 5000 },
    { id: 9, date: '2024-06-25', description: 'Jantar fora', category: 'Alimentação', amount: -120.00 },
    { id: 10, date: '2024-06-22', description: 'Gasolina', category: 'Transporte', amount: -150.00 },
    { id: 11, date: '2024-06-20', description: 'Aluguel', category: 'Moradia', amount: -1500.00 },
    { id: 12, date: '2024-06-18', description: 'Show', category: 'Lazer', amount: -200.00 },
];

const CATEGORIES = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Salário'];

const EditTransactionSchema = Yup.object().shape({
    description: Yup.string().required('Descrição é obrigatória.'),
    amount: Yup.number().positive('O valor deve ser positivo.').required('O valor é obrigatório.'),
    category: Yup.string().required('A categoria é obrigatória.'),
    date: Yup.date().required('A data é obrigatória.'),
});

const DetailedTransactions = () => {
    const [transactions, setTransactions] = useState(mockData);
    const [viewMode, setViewMode] = useState('table');
    const [filters, setFilters] = useState({ search: '', category: 'all' });
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isNewTransactionModalOpen, setNewTransactionModalOpen] = useState(false);

    const ITEMS_PER_PAGE = 10;

    const handleAddTransaction = (newTransaction) => {
        setTransactions([newTransaction, ...transactions]);
    };

    const handleEdit = (transaction) => {
        setItemToEdit(transaction);
        setShowEditModal(true);
    };

    const handleUpdate = (values) => {
        const updatedTransaction = {
            ...itemToEdit,
            ...values,
            amount: values.transactionType === 'saida' ? -Math.abs(values.amount) : Math.abs(values.amount),
        };
    
        setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    
        setShowEditModal(false);
        setItemToEdit(null);
    };

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const searchMatch = t.description.toLowerCase().includes(filters.search.toLowerCase());
                const categoryMatch = filters.category === 'all' || t.category === filters.category;
                return searchMatch && categoryMatch;
            });
    }, [transactions, filters]);

    const sortedTransactions = useMemo(() => {
        let sortableItems = [...filteredTransactions];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredTransactions, sortConfig]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedTransactions, currentPage]);

    const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) {
            return ' ⇅';
        }
        if (sortConfig.direction === 'ascending') {
            return ' ↑';
        }
        return ' ↓';
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setTransactions(transactions.filter(t => t.id !== itemToDelete));
        setShowDeleteModal(false);
        setItemToDelete(null);
    };
    
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedTransactions.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    
    const exportToCSV = () => {
        const selectedTransactions = transactions.filter(t => selectedIds.includes(t.id));
        if (selectedTransactions.length === 0) {
            alert("Nenhuma transação selecionada para exportar.");
            return;
        }

        const headers = ["Data", "Descrição", "Categoria", "Valor"];
        const csvContent = [
            headers.join(','),
            ...selectedTransactions.map(t => [
                new Date(t.date).toLocaleDateString('pt-BR'),
                `"${t.description}"`, 
                t.category,
                t.amount.toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `transacoes-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectedTotal = useMemo(() => {
        return transactions
            .filter(t => selectedIds.includes(t.id))
            .reduce((sum, t) => sum + t.amount, 0);
    }, [selectedIds, transactions]);

    return (
        <section aria-label="Transações detalhadas" className="card">
            <NewTransactionModal 
                isOpen={isNewTransactionModalOpen}
                onClose={() => setNewTransactionModalOpen(false)}
                onAddTransaction={handleAddTransaction}
            />

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Exclusão">
                <p>Você tem certeza que deseja excluir esta transação?</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Cancelar</button>
                    <button onClick={confirmDelete} className="btn btn-danger">Excluir</button>
                </div>
            </Modal>

            {itemToEdit && (
                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Transação">
                    <Formik
                        initialValues={{
                            date: itemToEdit.date,
                            description: itemToEdit.description,
                            amount: Math.abs(itemToEdit.amount),
                            category: itemToEdit.category,
                            transactionType: itemToEdit.amount > 0 ? 'entrada' : 'saida',
                        }}
                        validationSchema={EditTransactionSchema}
                        onSubmit={handleUpdate}
                    >
                        {({ isSubmitting, setFieldValue, values }) => (
                            <Form className="space-y-4">
                                <div className="input-group">
                                    <label htmlFor="date" className="input-label">Data</label>
                                    <Field type="date" id="date" name="date" className="input-field" />
                                    <ErrorMessage name="date" component="div" className="text-danger-color text-sm mt-1" />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="description" className="input-label">Descrição</label>
                                    <Field type="text" id="description" name="description" className="input-field" />
                                    <ErrorMessage name="description" component="div" className="text-danger-color text-sm mt-1" />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="amount" className="input-label">Valor</label>
                                    <Field type="number" step="0.01" id="amount" name="amount" className="input-field" />
                                    <ErrorMessage name="amount" component="div" className="text-danger-color text-sm mt-1" />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="category" className="input-label">Categoria</label>
                                    <Field as="select" id="category" name="category" className="input-field">
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </Field>
                                    <ErrorMessage name="category" component="div" className="text-danger-color text-sm mt-1" />
                                </div>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Salvar</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Buscar por descrição..."
                        className="input-field"
                        onChange={e => setFilters({...filters, search: e.target.value})}
                        aria-label="Buscar transações"
                    />
                    <select className="input-field" onChange={e => setFilters({...filters, category: e.target.value})} aria-label="Filtrar por categoria">
                        <option value="all">Todas as Categorias</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setNewTransactionModalOpen(true)} className="btn btn-primary">
                        <PlusIcon className="h-5 w-5" />
                        <span>Nova Transação</span>
                    </button>
                    <button onClick={() => setViewMode(viewMode === 'table' ? 'list' : 'table')} className="btn btn-outline">
                        {viewMode === 'table' ? <ListBulletIcon className="h-5 w-5" /> : <TableCellsIcon className="h-5 w-5" />}
                    </button>
                    <button onClick={exportToCSV} disabled={selectedIds.length === 0} className="btn btn-outline" aria-disabled={selectedIds.length === 0}>
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                    <table className="table table-striped table-hover w-full">
                        <thead>
                            <tr>
                                <th><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0} /></th>
                                <th onClick={() => handleSort('date')}>Data{getSortIndicator('date')}</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th onClick={() => handleSort('amount')}>Valor{getSortIndicator('amount')}</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTransactions.map(t => (
                                <tr key={t.id} className={selectedIds.includes(t.id) ? 'bg-bg-hover' : ''}>
                                    <td><input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => handleSelectRow(t.id)} /></td>
                                    <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                    <td>{t.description}</td>
                                    <td><span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary-color/20 text-secondary-color">{t.category}</span></td>
                                    <td className={t.amount > 0 ? 'text-primary-color' : 'text-danger-color'}>R$ {t.amount.toFixed(2).replace('.',',')}</td>
                                    <td className="flex gap-2">
                                        <button onClick={() => handleEdit(t)} className="btn btn-sm btn-outline"><PencilIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(t.id)} className="btn btn-sm btn-danger"><TrashIcon className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <TransactionListView 
                    transactions={paginatedTransactions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSelect={handleSelectRow}
                    selectedIds={selectedIds}
                />
            )}

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mt-4">
            <div className="text-sm text-text-secondary">
                {selectedIds.length > 0 ? (
                    <span>
                        Total Selecionado: <span className="font-semibold text-text-primary">R$ {selectedTotal.toFixed(2).replace('.', ',')}</span>
                    </span>
                ) : (
                    <span>
                        Total da Página: <span className="font-semibold text-text-primary">R$ {paginatedTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2).replace('.', ',')}</span>
                    </span>
                )}
            </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Página {currentPage} de {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-sm btn-outline">Anterior</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-sm btn-outline">Próxima</button>
                </div>
            </div>
        </section>
    );
};

export default DetailedTransactions;