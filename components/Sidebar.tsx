import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  List,
  UserPlus,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return pathname === path
      ? 'text-white bg-zinc-800/50 border-l-2 border-indigo-500' // Active: Black/Grey bg, White text, Indigo Indicator
      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border-l-2 border-transparent'; // Inactive: Muted text
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all duration-200 group ${isActive(to)}`}
    >
      <Icon size={16} className={`group-hover:text-indigo-400 transition-colors ${pathname === to ? 'text-indigo-500' : ''}`} />
      <span>{label}</span>
      {pathname === to && (
        <div className="ml-auto w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
      )}
    </Link>
  );

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col
      `}
    >
      {/* Brand */}
      <div className="h-14 flex items-center px-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-white font-bold tracking-tight">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-xs">T</div>
          <span className="text-lg">TMS<span className="text-zinc-600 font-normal">.ent</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1">
        <div className="px-4 mb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Platform</div>

        <NavItem to="/" icon={LayoutDashboard} label="Overview" />
        <NavItem to="/leads" icon={List} label="All Leads" />

        {currentUser && currentUser.role !== 'telecaller' && (
          <>
            <div className="px-4 mt-6 mb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Management</div>
            <NavItem to="/reports" icon={BarChart3} label="Analytics" />
            <NavItem to="/lead-assignment" icon={UserPlus} label="Assignments" />

            {currentUser.role === 'admin' && (
              <NavItem to="/agents" icon={Users} label="My Team" />
            )}
            {currentUser.role === 'superadmin' && (
              <NavItem to="/admin" icon={Briefcase} label="Organization" />
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <NavItem to="/settings" icon={Settings} label="Settings" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-all border-l-2 border-transparent mt-1"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;