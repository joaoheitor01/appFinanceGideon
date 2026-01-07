// src/components/layout/DashboardLayout.jsx
import React from 'react';

/**
 * DashboardLayout - Componente de layout principal para o Gideon Finance
 * 
 * Este componente fornece a estrutura visual base para todas as páginas do dashboard.
 * É responsável apenas pelo layout, sem nenhuma lógica de negócio.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo a ser renderizado dentro do layout
 * @param {Function} props.onToggleTheme - Função para alternar entre tema claro/escuro
 * @param {boolean} props.isDark - Se o tema atual é escuro
 * @param {string} props.userEmail - Email do usuário para exibir no header
 * @param {Function} props.onLogout - Função para logout
 * @param {string} props.userPlan - Plano do usuário (Gratuito, Premium, etc)
 * @returns {JSX.Element}
 */
const DashboardLayout = ({ 
  children, 
  onToggleTheme, 
  isDark = true, 
  userEmail = 'usuário@email.com',
  onLogout,
  userPlan = 'Gratuito'
}) => {
  return (
    <div className={`dashboard-layout ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {/* Header fixo no topo */}
      <header className="dashboard-header">
        <div className="header-container">
          {/* Logo e nome do app */}
          <div className="brand-section">
            <div className="logo">💰</div>
            <div className="brand-text">
              <h1 className="app-name">Gideon Finance</h1>
              <span className="app-tagline">Controle Financeiro Inteligente</span>
            </div>
          </div>
          
          {/* Controles do usuário */}
          <div className="user-controls">
            {/* Botão de alternar tema */}
            <button 
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
              title={isDark ? 'Tema escuro ativo' : 'Tema claro ativo'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            {/* Informações do usuário */}
            <div className="user-info">
              <div className="user-email">{userEmail}</div>
              <div className="user-plan">Plano: {userPlan}</div>
            </div>
            
            {/* Botão de logout */}
            <button 
              className="logout-btn"
              onClick={onLogout}
              aria-label="Sair da conta"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Gideon Finance - Todos os direitos reservados</p>
          <p className="footer-links">
            <a href="/sobre">Sobre</a>
            <a href="/contato">Contato</a>
            <a href="/privacidade">Privacidade</a>
            <a href="/termos">Termos</a>
          </p>
        </div>
      </footer>

      {/* Estilos CSS inline */}
      <style jsx>{`

        .dashboard-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }
        
        /* Tema escuro (padrão) */
        .dark-theme {
          background-color: #0f172a;
          color: #e2e8f0;
        }
        
        /* Tema claro */
        .light-theme {
          background-color: #f8fafc;
          color: #1e293b;
        }
        
        /* Header */
        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .dark-theme .dashboard-header {
          background-color: #1e293b;
          border-bottom: 1px solid #334155;
        }
        
        .light-theme .dashboard-header {
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }
        
        .brand-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .logo {
          font-size: 32px;
        }
        
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        
        .app-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }
        
        .dark-theme .app-name {
          color: #ffffff;
        }
        
        .light-theme .app-name {
          color: #1e293b;
        }
        
        .app-tagline {
          font-size: 12px;
          opacity: 0.8;
        }
        
        .user-controls {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        
        .theme-toggle {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }
        
        .dark-theme .theme-toggle:hover {
          background-color: #334155;
        }
        
        .light-theme .theme-toggle:hover {
          background-color: #f1f5f9;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .user-email {
          font-size: 14px;
          font-weight: 500;
        }
        
        .user-plan {
          font-size: 12px;
          opacity: 0.8;
        }
        
        .logout-btn {
          background: none;
          border: 1px solid;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .dark-theme .logout-btn {
          border-color: #ef4444;
          color: #ef4444;
        }
        
        .dark-theme .logout-btn:hover {
          background-color: #ef4444;
          color: #ffffff;
        }
        
        .light-theme .logout-btn {
          border-color: #dc2626;
          color: #dc2626;
        }
        
        .light-theme .logout-btn:hover {
          background-color: #dc2626;
          color: #ffffff;
        }
        
        /* Conteúdo principal */
        .dashboard-main {
          flex: 1;
          padding: 24px;
        }
        
        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        /* Grid responsivo */
        @media (min-width: 768px) {
          .dashboard-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
        }
        
        @media (max-width: 767px) {
          .dashboard-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
        }
        
        /* Cards base para conteúdo */
        .dashboard-content > * {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .dark-theme .dashboard-content > * {
          background-color: #1e293b;
          border: 1px solid #334155;
        }
        
        .light-theme .dashboard-content > * {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
        }
        
        /* Footer */
        .dashboard-footer {
          padding: 20px 24px;
          border-top: 1px solid;
        }
        
        .dark-theme .dashboard-footer {
          border-top-color: #334155;
          background-color: #1e293b;
        }
        
        .light-theme .dashboard-footer {
          border-top-color: #e2e8f0;
          background-color: #ffffff;
        }
        
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          text-align: center;
        }
        
        .footer-content p {
          margin: 8px 0;
          font-size: 14px;
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 12px;
        }
        
        .footer-links a {
          text-decoration: none;
          font-size: 14px;
          transition: opacity 0.2s ease;
        }
        
        .dark-theme .footer-links a {
          color: #60a5fa;
        }
        
        .light-theme .footer-links a {
          color: #2563eb;
        }
        
        .footer-links a:hover {
          opacity: 0.8;
        }
        
        /* Responsividade do header */
        @media (max-width: 768px) {
          .header-container {
            padding: 0 16px;
            height: 60px;
          }
          
          .brand-text {
            display: none;
          }
          
          .user-info {
            display: none;
          }
          
          .theme-toggle {
            padding: 6px;
          }
          
          .logout-btn {
            padding: 6px 12px;
            font-size: 14px;
          }
        }
        
        /* Responsividade do conteúdo */
        @media (max-width: 767px) {
          .dashboard-main {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
