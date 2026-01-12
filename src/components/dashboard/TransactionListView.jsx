// src/components/dashboard/TransactionListView.jsx
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const TransactionListView = ({ transactions, onEdit, onDelete, onSelect, selectedIds }) => {
    if (!transactions || transactions.length === 0) {
        return <p className="text-center text-sm text-text-secondary">Nenhuma transação encontrada.</p>;
    }

    return (
        <div className="space-y-4">
            {transactions.map(t => (
                <div
                    key={t.id}
                    aria-label={`Transação ${t.description}`}
                    className="card flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            aria-label={`Selecionar transação ${t.id}`}
                            checked={selectedIds.includes(t.id)}
                            onChange={() => onSelect(t.id)}
                            className="h-4 w-4 rounded border-gray-300 text-secondary-color focus:ring-secondary-color"
                        />
                        <div>
                            <div className="font-semibold text-text-primary">{t.description}</div>
                            <div className="text-sm text-text-secondary">{t.category}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold ${t.amount > 0 ? 'bg-primary-color/10 text-primary-color' : 'bg-danger-color/10 text-danger-color'}`}>
                            {t.amount > 0 ? (
                                <ArrowUpIcon className="h-4 w-4" />
                            ) : (
                                <ArrowDownIcon className="h-4 w-4" />
                            )}
                            <span>R$ {t.amount.toFixed(2).replace('.', ',')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(t)} aria-label={`Editar ${t.id}`} className="btn btn-sm btn-outline"><PencilIcon className="h-4 w-4" /></button>
                            <button onClick={() => onDelete(t.id)} aria-label={`Excluir ${t.id}`} className="btn btn-sm btn-danger"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TransactionListView;