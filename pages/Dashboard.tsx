import React from 'react';
import { useApp } from '../context/AppContext';
import TelecallerDashboard from '../components/dashboard/TelecallerDashboard';
import TeamLeadDashboard from '../components/dashboard/TeamLeadDashboard';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';

const Dashboard = () => {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {currentUser.role === 'telecaller' && <TelecallerDashboard />}
      {currentUser.role === 'admin' && <TeamLeadDashboard />}
      {currentUser.role === 'superadmin' && <SuperAdminDashboard />}
    </div>
  );
};

export default Dashboard;