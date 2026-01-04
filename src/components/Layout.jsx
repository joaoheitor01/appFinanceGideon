import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {/* Header sempre visível */}
      <Header />
      
      <div className="main-container">
        {/* Sidebar visível apenas para usuários autenticados */}
        {user && <Sidebar />}
        
        {/* Conteúdo principal */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
      
      {/* Footer sempre visível */}
      <Footer />
    </div>
  );
};

  const { user } = useAuth();

  return (
    <div className="app-container">
      {/* Navbar visível apenas para usuários autenticados */}
      {user && <Navbar />}
      
      <div className="main-content">
        {/* Sidebar visível apenas para usuários autenticados */}
        {user && <Sidebar />}
        
        {/* Conteúdo principal das páginas */}
        <div className="content-wrapper">
          <Outlet /> {/* Aqui as páginas são renderizadas */}
        </div>
      </div>
      
      {/* Footer pode ser condicional também */}
      {user && <footer className="app-footer">© 2024 Gideon Finance</footer>}
    </div>
  );

export default Layout;