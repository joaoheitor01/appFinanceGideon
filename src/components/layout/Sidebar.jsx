// src/components/layout/Sidebar.jsx
import React from 'react';

const Sidebar = () => {
  return (
    <aside>
      <nav>
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/profile">Profile</a></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;