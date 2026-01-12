// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ArrowsRightLeftIcon, ChartPieIcon, FlagIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navLinkClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors";
  const activeLinkClasses = "bg-bg-hover text-text-primary";

  return (
    <>
      <aside className={`bg-bg-card border-r border-border-color p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative fixed h-full z-20`}>
        <div className="flex items-center gap-2">
          <BanknotesIcon className="h-8 w-8 text-primary-color" />
          <h1 className="h3">Gideon</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={({isActive}) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <HomeIcon className="h-6 w-6" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/transactions" className={({isActive}) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <ArrowsRightLeftIcon className="h-6 w-6" />
            <span>Transações</span>
          </NavLink>
          <NavLink to="/reports" className={({isActive}) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <ChartPieIcon className="h-6 w-6" />
            <span>Relatórios</span>
          </NavLink>
          <NavLink to="/goals" className={({isActive}) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <FlagIcon className="h-6 w-6" />
            <span>Metas</span>
          </NavLink>
        </nav>

        <div className="border-t border-border-color pt-6">
          <h2 className="text-sm font-semibold text-text-secondary mb-4">Filtros</h2>
          {/* Filter components will go here */}
        </div>

        <div className="border-t border-border-color pt-6">
          <h2 className="text-sm font-semibold text-text-secondary mb-4">Categorias</h2>
          {/* Category components will go here */}
        </div>
        
        <div className="mt-auto">
            {/* User profile / settings link can go here */}
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;