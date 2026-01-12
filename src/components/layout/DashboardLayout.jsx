// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import Header from './Header'; // Import the new header
import Sidebar from './Sidebar'; // Import the Sidebar

const DashboardLayout = ({ 
  children, 
  onToggleTheme, 
  isDark = true, 
  userEmail = 'usuário@email.com',
  onLogout,
  userPlan = 'Gratuito'
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-bg-dark-primary text-text-primary">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar}
          onToggleTheme={onToggleTheme}
          isDark={isDark}
          userEmail={userEmail}
          onLogout={onLogout}
          userPlan={userPlan}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-bg-dark-primary p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;