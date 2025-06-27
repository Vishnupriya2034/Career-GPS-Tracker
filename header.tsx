import React from "react";
import { Bell } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="md:hidden ml-2 text-lg font-semibold text-primary">CS Career GPS</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-1 text-gray-400 rounded-full hover:bg-gray-100 focus:outline-none">
            <Bell className="h-6 w-6" />
          </button>
          
          <div className="relative">
            <button className="flex items-center focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-medium">
                <span>R</span>
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">Riya</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
