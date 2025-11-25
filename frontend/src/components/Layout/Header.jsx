import React from 'react';
import { Search } from 'lucide-react';
import Input from '../UI/Input';

const Header = () => {
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="w-96">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search memes..." 
            className="w-full bg-slate-800/50 border-none rounded-full py-2 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Icons removed as requested */}
      </div>
    </header>
  );
};

export default Header;
