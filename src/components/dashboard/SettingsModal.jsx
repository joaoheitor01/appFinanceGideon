// src/components/dashboard/SettingsModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('profile');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="tab-content">
                        <h4>Perfil</h4>
                        <div className="form-group">
                            <label>Avatar</label>
                            <input type="file" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="currency">Moeda</label>
                            <select id="currency" defaultValue="BRL">
                                <option value="BRL">Real (R$)</option>
                                <option value="USD">Dólar (US$)</option>
                                <option value="EUR">Euro (€)</option>
                            </select>
                        </div>
                    </div>
                );
            case 'categories':
                return <div className="tab-content"><h4>Categorias</h4><p>Gerenciamento de categorias em breve.</p></div>;
            case 'goals':
                return <div className="tab-content"><h4>Metas</h4><p>Configuração de metas em breve.</p></div>;
            case 'export':
                return (
                    <div className="tab-content">
                        <h4>Exportação e Backup</h4>
                        <div className="form-group">
                            <label>Backup Automático</label>
                            <div className="toggle-switch">
                                {/* Basic toggle, can be improved */}
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configurações">
            <div className="settings-container">
                <div className="settings-tabs">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Perfil</button>
                    <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>Categorias</button>
                    <button className={activeTab === 'goals' ? 'active' : ''} onClick={() => setActiveTab('goals')}>Metas</button>
                    <button className={activeTab === 'export' ? 'active' : ''} onClick={() => setActiveTab('export')}>Exportação</button>
                </div>
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
