import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout">
      {user && <Header toggleSidebar={toggleSidebar} />}
      
      <div className={`main-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {user && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
        
        <main className="content-area">
          <Outlet />
        </main>
      </div>
      
      {user && <Footer />}
    </div>
  );
};

export default Layout;
