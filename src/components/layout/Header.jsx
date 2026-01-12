// src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, ChevronDownIcon, ArrowDownOnSquareIcon, PlusIcon, UserCircleIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar }) => {
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const periodRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodRef.current && !periodRef.current.contains(event.target)) {
        setPeriodDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-bg-card border-b border-border-color p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="btn btn-outline" onClick={toggleSidebar}>
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div>
            <div className="text-sm text-text-secondary">
                <Link to="/" className="hover:underline">Gideon Finance</Link> &gt; <span>Dashboard</span>
            </div>
            <h1 className="h3">Dashboard Financeiro</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={periodRef}>
          <button
            className="btn btn-outline"
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
          >
            <span>Janeiro 2024</span>
            <ChevronDownIcon className="h-5 w-5" />
          </button>
          {periodDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 card">
              <a href="#" className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-hover">Janeiro 2024</a>
              <a href="#" className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-hover">Fevereiro 2024</a>
              <a href="#" className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-hover">Março 2024</a>
            </div>
          )}
        </div>
        <button className="btn btn-outline">
            <ArrowDownOnSquareIcon className="h-5 w-5" />
            <span>Exportar Relatório</span>
        </button>
        <button className="btn btn-primary">
            <PlusIcon className="h-5 w-5" />
            <span>Nova Transação</span>
        </button>
        <div className="relative" ref={userRef}>
            <button onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                <UserCircleIcon className="h-10 w-10 text-text-secondary" />
            </button>
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 card">
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-hover">
                <UserCircleIcon className="h-5 w-5" />
                <span>Perfil</span>
              </Link>
              <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-hover">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Configurações</span>
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-danger-color hover:bg-bg-hover w-full">
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;