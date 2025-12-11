import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Users, Phone, FileText,
  LogOut, BarChart3, List, X, UserPlus
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  if (!currentUser) return null;

  const isActive = (path: string) => location.pathname === path
    ? 'bg-blue-600/10 text-blue-500 border-r-2 border-blue-500'
    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-r-2 border-transparent';

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col h-full transition-transform duration-300 ease-in-out shadow-2xl
      md:translate-x-0 md:static md:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-3 tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Phone className="text-white" size={18} />
          </div>
          <span className="text-white">TMS <span className="text-slate-500 font-normal">CRM</span></span>
        </h1>
        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        <Link
          to="/"
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/')}`}
        >
          <LayoutDashboard size={18} />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>

        <Link
          to="/leads"
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/leads')}`}
        >
          <List size={18} />
          <span className="text-sm font-medium">Leads Pipeline</span>
        </Link>

        {currentUser.role !== 'telecaller' && (
          <>
            <Link
              to="/reports"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/reports')}`}
            >
              <BarChart3 size={18} />
              <span className="text-sm font-medium">Analytics</span>
            </Link>
            {currentUser.role === 'admin' && (
              <Link
                to="/agents"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/agents')}`}
              >
                <Users size={18} />
                <span className="text-sm font-medium">My Agents</span>
              </Link>
            )}
            {currentUser.role === 'superadmin' && (
              <Link
                to="/admin"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin')}`}
              >
                <Users size={18} />
                <span className="text-sm font-medium">Team & Target</span>
              </Link>
            )}
            <Link
              to="/lead-assignment"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/lead-assignment')}`}
            >
              <UserPlus size={18} />
              <span className="text-sm font-medium">Lead Assignment</span>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-[#0F172A] shrink-0">
        <div className="flex items-center gap-3 mb-4 px-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group">
          <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full bg-slate-700 border-2 border-slate-600 group-hover:border-slate-400 transition-colors" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-200 group-hover:text-white">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{currentUser.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 w-full text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;