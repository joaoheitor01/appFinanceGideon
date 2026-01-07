import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

export default Layout;
