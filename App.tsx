import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import LeadDetails from './pages/LeadDetails';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';
import LeadAssignment from './pages/LeadAssignment';
import AgentsManagement from './pages/AgentsManagement';
import Settings from './pages/Settings';

const PrivateRoute = () => {
  const { currentUser } = useApp();
  return currentUser ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
};

// Route only accessible by admins
const AdminRoute = () => {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

// Route only accessible by superadmins
const SuperAdminRoute = () => {
  const { currentUser } = useApp();
  return currentUser?.role === 'superadmin' ? <Outlet /> : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads" element={<LeadList />} />
        <Route path="/leads/:id" element={<LeadDetails />} />

        {/* Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/reports" element={<Reports />} />
          <Route path="/lead-assignment" element={<LeadAssignment />} />
          <Route path="/agents" element={<AgentsManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route element={<SuperAdminRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
          {/* SuperAdmin specific routes can go here if any */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
