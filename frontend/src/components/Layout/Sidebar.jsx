import React from 'react';
import { NavLink } from 'react-router-dom';
import { PlusCircle, Image } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: PlusCircle, label: 'Create Meme', path: '/create' },
    { icon: Image, label: 'Gallery', path: '/gallery' },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
          MemeDashboard
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
