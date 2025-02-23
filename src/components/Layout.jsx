import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 bg-gray-100">
        <div className="h-full overflow-y-auto">
          <Outlet /> {/* This is where the route-specific component renders */}
        </div>
      </main>
    </div>
  );
};

export default Layout;