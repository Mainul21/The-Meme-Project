import React from 'react';
import { Search, Menu } from 'lucide-react';
import Input from '../UI/Input';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="h-16 lg:h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 w-full lg:w-auto">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="w-full lg:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search memes..." 
              className="w-full bg-slate-800/50 border-none rounded-full py-2 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-6">
        {/* Icons removed as requested */}
      </div>
    </header>
  );
};

export default Header;
