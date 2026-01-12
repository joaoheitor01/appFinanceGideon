// src/components/dashboard/CustomReportModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import './CustomReportModal.css';

const CustomReportModal = ({ isOpen, onClose }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('PDF');
    
    const handleGenerateReport = () => {
        // Logic to generate report will be implemented later
        console.log({
            startDate,
            endDate,
            reportType,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gerar Relatório Personalizado">
            <div className="report-form">
                <div className="form-group">
                    <label htmlFor="start-date">Data de Início</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="end-date">Data de Fim</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Tipo de Relatório</label>
                    <div className="report-type-options">
                        <button 
                            className={`report-type-btn ${reportType === 'PDF' ? 'active' : ''}`}
                            onClick={() => setReportType('PDF')}
                        >
                            PDF
                        </button>
                        <button 
                            className={`report-type-btn ${reportType === 'Excel' ? 'active' : ''}`}
                            onClick={() => setReportType('Excel')}
                        >
                            Excel
                        </button>
                        <button 
                            className={`report-type-btn ${reportType === 'Graph' ? 'active' : ''}`}
                            onClick={() => setReportType('Graph')}
                        >
                            Gráfico
                        </button>
                    </div>
                </div>
                <div className="report-preview">
                    {/* Report preview will be implemented later */}
                    <p>Pré-visualização do relatório aparecerá aqui.</p>
                </div>
                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="button" onClick={handleGenerateReport} className="btn btn-primary">Gerar</button>
                </div>
            </div>
        </Modal>
    );
};

export default CustomReportModal;
