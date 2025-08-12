import React from 'react';

const SidebarToggle = ({ onToggle, className = "" }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 
        flex items-center justify-center group
        ${className}
      `}
      title="Open Navigation Menu"
    >
      <svg 
        className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 6h16M4 12h16M4 18h16" 
        />
      </svg>
    </button>
  );
};

export default SidebarToggle; 