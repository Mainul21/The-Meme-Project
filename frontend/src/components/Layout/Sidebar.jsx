import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Image, X, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = [
    { icon: PlusCircle, label: 'Create Meme', path: '/upload' },
    { icon: Image, label: 'Meme Feed', path: '/meme-feed' },
    { icon: Image, label: 'My Gallery', path: '/gallery' },
  ];

  if (user && user.admin) { // precise admin check depends on custom claim or separate DB role, for now assume all users or specific logic
    // Ideally we check a claim, but here we might just show it.
    // For this mvp, let's just add it.
    navItems.push({ icon: Settings, label: 'Admin', path: '/admin' });
  }

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
          MemeDashboard
        </h1>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              // Close sidebar on mobile when a link is clicked
              if (window.innerWidth < 1024) onClose();
            }}
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

      <div className="p-4 border-t border-slate-800">
        {user ? (
          <div className="flex flex-col gap-3">
            <Link to="/profile" className="flex items-center gap-3 px-2 hover:bg-slate-800 rounded-lg p-2 transition-colors">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-medium text-slate-200 truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors font-medium"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
