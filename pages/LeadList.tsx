import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Link } from 'react-router-dom';
import {
  Search, Filter, ChevronRight, Download, Phone,
  ArrowUpDown, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import CallModal from '../components/CallModal';
import { Lead } from '../types';

type SortConfig = {
  key: keyof Lead | 'lastRemark';
  direction: 'asc' | 'desc';
} | null;

const LeadList = () => {
  const { leads, currentUser, addRemark, updateLeadStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'priority' | 'pending' | 'backlog'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Call Modal State
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);

  // 1. Access Control
  const accessibleLeads = currentUser?.role === 'telecaller'
    ? leads.filter(l => l.assignedTo === currentUser.id)
    : leads;

  // 2. Tab Logic
  const tabFilteredLeads = accessibleLeads.filter(lead => {
    switch (activeTab) {
      case 'priority': return lead.status === 'follow-up' || lead.status === 'in-progress';
      case 'pending': return lead.status === 'new' || lead.status === 'docs-pending';
      case 'backlog': return lead.status === 'not-interested' || lead.status === 'rejected';
      default: return true;
    }
  });

  // 3. Search & Filter
  const filteredLeads = tabFilteredLeads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.mobile.includes(searchTerm) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 4. Sorting Logic
  const sortedLeads = useMemo(() => {
    if (!sortConfig) return filteredLeads;

    return [...filteredLeads].sort((a, b) => {
      if (sortConfig.key === 'lastRemark') {
        const lastA = a.remarks[0]?.timestamp || '';
        const lastB = b.remarks[0]?.timestamp || '';
        return sortConfig.direction === 'asc'
          ? lastA.localeCompare(lastB)
          : lastB.localeCompare(lastA);
      }

      const valA = a[sortConfig.key] as string;
      const valB = b[sortConfig.key] as string;

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortConfig]);

  // 5. Pagination Logic
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof Lead | 'lastRemark') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  const handleCallComplete = (disposition: string, notes: string, duration: number) => {
    if (!selectedLeadForCall) return;
    addRemark(selectedLeadForCall.id, {
      comment: notes,
      disposition: disposition,
      duration: duration
    });
    if (disposition === 'Interested') updateLeadStatus(selectedLeadForCall.id, 'in-progress');
    setSelectedLeadForCall(null);
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "Mobile", "City", "Status", "Last Remark"];
    const rows = filteredLeads.map(l => [
      l.id, l.name, l.mobile, l.city, l.status,
      l.remarks[0]?.disposition || '-'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads Management</h1>
          <p className="text-slate-500">Manage, track and interact with your pipeline.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border flex items-center gap-2 transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={18} /> <span className="hidden sm:inline">Filters</span>
          </button>
          {currentUser?.role !== 'telecaller' && (
            <button
              onClick={handleExport}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 transition-all shadow-sm"
            >
              <Download size={18} /> <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 shrink-0 overflow-x-auto max-w-full">
        {[
          { id: 'all', label: 'All Leads' },
          { id: 'priority', label: 'Priority / Follow-up' },
          { id: 'pending', label: 'New / Pending' },
          { id: 'backlog', label: 'Backlog' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 animate-in slide-in-from-top-2 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search name, mobile, city..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full text-slate-900 placeholder:text-slate-400"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="w-full sm:w-auto">
            <select
              className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Statuses</option>
              {Object.keys(STATUS_LABELS).map(key => (
                <option key={key} value={key}>{STATUS_LABELS[key as keyof typeof STATUS_LABELS]}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">

        {/* Helper function for mobile card view */}
        <div className="md:hidden divide-y divide-slate-100 overflow-y-auto">
          {paginatedLeads.length > 0 ? (
            paginatedLeads.map(lead => (
              <div key={lead.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {lead.id}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[lead.status]}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Mobile</span>
                    <span className="font-medium">{lead.mobile}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-slate-400">City</span>
                    <span className="font-medium">{lead.city}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-1">Last Remark:</span>
                  {lead.remarks.length > 0 ? (
                    <span>
                      <span className="font-medium text-slate-800">{lead.remarks[0].disposition}</span> - {lead.remarks[0].comment.substring(0, 50)}...
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No remarks yet</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => setSelectedLeadForCall(lead)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <Phone size={14} /> Call
                  </button>
                  <Link
                    to={`/leads/${lead.id}`}
                    className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                    View Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p>No leads found matching your filters.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th onClick={() => handleSort('name')} className="px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">Customer <ArrowUpDown size={14} className="text-slate-400" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap">Contact</th>
                <th onClick={() => handleSort('city')} className="px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">City <ArrowUpDown size={14} className="text-slate-400" /></div>
                </th>
                <th onClick={() => handleSort('status')} className="px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">Status <ArrowUpDown size={14} className="text-slate-400" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap">Last Remark</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {lead.id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-medium">{lead.mobile}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{lead.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {lead.remarks.length > 0 ? (
                        <span title={lead.remarks[0].comment}>
                          <span className="font-medium text-slate-700">{lead.remarks[0].disposition}</span>
                          <span className="text-slate-400 mx-1">-</span>
                          {lead.remarks[0].comment.substring(0, 30)}...
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">No remarks</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLeadForCall(lead)}
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                          title="Call Now"
                        >
                          <Phone size={14} />
                        </button>
                        <Link
                          to={`/leads/${lead.id}`}
                          className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          View <ChevronRight size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-slate-200" />
                      <p>No leads found matching your filters.</p>
                      <button
                        onClick={() => { setSearchTerm(''); setFilterStatus('all'); setActiveTab('all'); }}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedLeads.length > 0 && (
          <div className="border-t border-slate-200 p-4 bg-white flex items-center justify-between shrink-0">
            <div className="text-sm text-slate-500 hidden sm:block">
              Showing <span className="font-semibold text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, sortedLeads.length)}</span> to <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, sortedLeads.length)}</span> of <span className="font-semibold text-slate-900">{sortedLeads.length}</span> leads
            </div>

            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Simple logic to show window around current page could be added here
                  // For now, just showing first 5 or logic to shift can be complex
                  // Simplified: Just 1,2,3... if total < 5. Else show current.
                  let pNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) pNum = currentPage - 2 + i;
                    if (pNum > totalPages) pNum = i + 1; // Fallback reset (simplified)
                  }

                  // Better simple pagination:
                  // Just show current page number input or simple text for now to keep code clean
                  return null;
                })}
                <span className="text-sm font-medium text-slate-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLeadForCall && (
        <CallModal
          lead={selectedLeadForCall}
          onClose={() => setSelectedLeadForCall(null)}
          onComplete={handleCallComplete}
        />
      )}
    </div>
  );
};

export default LeadList;