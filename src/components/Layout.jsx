import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 bg-gray-100">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
