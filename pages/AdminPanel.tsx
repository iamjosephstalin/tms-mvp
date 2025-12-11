import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, UserPlus, Check, Search, Filter, ChevronLeft, ChevronRight, X, Phone, Settings } from 'lucide-react';
import ExportDropdown from '../components/ExportDropdown';

const AddUserModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (user: any) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'telecaller' | 'admin'>('telecaller');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Add New Team Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole('telecaller')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${role === 'telecaller' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Phone size={16} /> Telecaller
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${role === 'admin' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings size={16} /> Team Lead
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              if (name && email) {
                onAdd({ name, email, role });
                onClose();
                setName(''); setEmail(''); setRole('telecaller');
              }
            }}
            disabled={!name || !email}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { users, addUser, toggleUserStatus, currentUser, updateUser } = useApp();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'telecaller' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const itemsPerPage = 8;

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 1. Role Check
      if (user.role === 'superadmin') return false; // Hide superadmin self
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;

      // 2. Status Check
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;

      // 3. Search Check
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(lowerTerm) ||
          user.email.toLowerCase().includes(lowerTerm)
        );
      }

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddUser = (userData: any) => {
    addUser({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      reportsTo: currentUser?.role === 'admin' ? currentUser.id : undefined
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team & Target</h1>
          <p className="text-gray-500 text-sm">Manage users, assignments, and monthly goals.</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown onExport={(fmt) => alert(`Exporting Users as ${fmt.toUpperCase()}...`)} />
          {currentUser?.role === 'superadmin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <UserPlus size={18} /> Add Member
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none border-gray-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Team Leads</option>
              <option value="telecaller">Telecallers</option>
            </select>
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                {currentUser?.role === 'superadmin' && (
                  <>
                    <th className="px-6 py-4">Reports To</th>
                    <th className="px-6 py-4 text-right">Monthly Target</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                          <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {user.role === 'admin' ? 'Team Lead' : 'Telecaller'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${user.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {currentUser?.role === 'superadmin' && (
                      <>
                        <td className="px-6 py-4">
                          {user.role === 'telecaller' ? (
                            <select
                              className="w-full max-w-[160px] border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:border-blue-300"
                              value={user.reportsTo || ''}
                              onChange={(e) => updateUser(user.id, { reportsTo: e.target.value })}
                            >
                              <option value="">Unassigned</option>
                              {users.filter(u => u.role === 'admin' || u.role === 'superadmin').map(lead => (
                                <option key={lead.id} value={lead.id}>{lead.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-400 text-xs italic">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 group/input">
                            <span className="text-gray-400 text-xs font-medium">₹</span>
                            <input
                              type="number"
                              className="w-24 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded px-2 py-1 text-sm text-right bg-transparent focus:bg-white transition-all outline-none font-medium tabular-nums"
                              value={user.monthlyTarget || 0}
                              onChange={(e) => updateUser(user.id, { monthlyTarget: Number(e.target.value) })}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`text-xs font-medium px-3 py-1.5 rounded transition-colors
                                                    ${user.status === 'active'
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                              }`}
                          >
                            {user.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> members
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
};

export default AdminPanel;
