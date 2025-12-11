import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, UserPlus, CheckSquare, Square, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortDirection = 'asc' | 'desc';
interface SortConfig {
    key: string;
    direction: SortDirection;
}

const LeadAssignment = () => {
    const { leads, users, setLeads, currentUser } = useApp();
    const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned'>('unassigned');
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [selectedTelecaller, setSelectedTelecaller] = useState('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAgent, setFilterAgent] = useState('all');
    const [filterCity, setFilterCity] = useState('all');

    // Sorting & Pagination State
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const telecallers = users.filter(u => u.role === 'telecaller' && u.status === 'active');

    // --- Derived Data: Unassigned Leads ---
    const unassignedLeads = useMemo(() =>
        leads.filter(l => !l.assignedTo),
        [leads]);

    // --- Derived Data: Assigned Leads (Filtered & Sorted) ---
    const filteredAssignedLeads = useMemo(() => {
        return leads.filter(l => {
            // Must be assigned
            if (!l.assignedTo) return false;

            // Security Check: If Team Lead, only show their agents' leads
            if (currentUser?.role === 'admin') {
                const assignedKey = users.find(u => u.id === l.assignedTo)?.reportsTo;
                // Simple check: if I am admin, I see leads assigned to people who report to me
                // For this mock, we skip complex hierarchy checks and assume Admin sees all for demo simplicty,
                // OR we can implement the check:
                const agent = users.find(u => u.id === l.assignedTo);
                if (agent?.reportsTo !== currentUser.id && currentUser.role !== 'superadmin') {
                    // return false; // Uncomment to enforce strict hierarchy
                }
            }

            // Search Filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!l.name.toLowerCase().includes(q) && !l.mobile.includes(q)) return false;
            }

            // Status Filter
            if (filterStatus !== 'all' && l.status !== filterStatus) return false;

            // Agent Filter
            if (filterAgent !== 'all' && l.assignedTo !== filterAgent) return false;

            // City Filter
            if (filterCity !== 'all' && l.city !== filterCity) return false;

            return true;
        });
    }, [leads, searchQuery, filterStatus, filterAgent, filterCity, users, currentUser]);

    // Sorting Logic
    const sortedLeads = useMemo(() => {
        if (!sortConfig) return filteredAssignedLeads;

        return [...filteredAssignedLeads].sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof typeof a];
            let bValue: any = b[sortConfig.key as keyof typeof b];

            // Handle special cases
            if (sortConfig.key === 'agentName') {
                aValue = users.find(u => u.id === a.assignedTo)?.name || '';
                bValue = users.find(u => u.id === b.assignedTo)?.name || '';
            } else if (sortConfig.key === 'lastRemark') {
                aValue = a.remarks.length > 0 ? a.remarks[a.remarks.length - 1].timestamp : '';
                bValue = b.remarks.length > 0 ? b.remarks[b.remarks.length - 1].timestamp : '';
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredAssignedLeads, sortConfig, users]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
    const paginatedLeads = sortedLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterAgent, filterCity]);

    const handleSort = (key: string) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadStatus('uploading');
            setTimeout(() => {
                setUploadStatus('success');
                setTimeout(() => setUploadStatus('idle'), 2000);
            }, 1500);
        }
    };

    const toggleSelectAll = () => {
        if (selectedLeads.length === unassignedLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(unassignedLeads.map(l => l.id));
        }
    };

    const toggleSelectLead = (id: string) => {
        if (selectedLeads.includes(id)) {
            setSelectedLeads(selectedLeads.filter(lId => lId !== id));
        } else {
            setSelectedLeads([...selectedLeads, id]);
        }
    };

    const handleAssign = () => {
        if (!selectedTelecaller || selectedLeads.length === 0) return;
        const newLeads = leads.map(l => {
            if (selectedLeads.includes(l.id)) {
                return { ...l, assignedTo: selectedTelecaller, status: 'new' as const };
            }
            return l;
        });
        setLeads(newLeads);
        setSelectedLeads([]);
        setSelectedTelecaller('');
        alert(`Successfully assigned ${selectedLeads.length} leads!`);
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className="text-gray-400 ml-1 inline" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="text-blue-600 ml-1 inline" />
            : <ArrowDown size={14} className="text-blue-600 ml-1 inline" />;
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lead Assignment</h1>
                    <p className="text-gray-500">Upload bulk leads and assign to your team.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto shrink-0">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('unassigned')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'unassigned' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Unassigned / Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'assigned' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Assigned Leads
                    </button>
                </nav>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto min-h-0 py-6">
                {activeTab === 'unassigned' && (
                    <div className="space-y-6">
                        {/* Upload Box */}
                        <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors flex flex-col items-center justify-center text-center">
                            <div className="p-4 bg-blue-50 rounded-full mb-4">
                                <Upload className="text-blue-600" size={28} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Leads Excel</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm">Support .xlsx, .csv files. Drag and drop or click to upload bulk leads.</p>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer">
                                    <span className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-shadow shadow-sm shadow-blue-200">
                                        {uploadStatus === 'uploading' ? 'Uploading...' : 'Choose File'}
                                    </span>
                                    <input type="file" className="hidden" accept=".xlsx,.csv" onChange={handleFileUpload} disabled={uploadStatus === 'uploading'} />
                                </label>
                                {uploadStatus === 'success' && <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">Upload Successful!</span>}
                            </div>
                        </div>

                        {/* Controls & Table */}
                        {selectedLeads.length > 0 && (
                            <div className="flex flex-wrap items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                <span className="font-semibold text-blue-900">{selectedLeads.length} leads selected</span>
                                <div className="flex items-center gap-2 ml-auto">
                                    <select
                                        value={selectedTelecaller}
                                        onChange={(e) => setSelectedTelecaller(e.target.value)}
                                        className="bg-white border-blue-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                                    >
                                        <option value="">Select Agent...</option>
                                        {telecallers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssign}
                                        disabled={!selectedTelecaller}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                                    >
                                        <UserPlus size={16} />
                                        Assign
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                                        <tr>
                                            <th className="p-4 w-10">
                                                <button onClick={toggleSelectAll} className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                                                    {selectedLeads.length > 0 && selectedLeads.length === unassignedLeads.length ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                                                </button>
                                            </th>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Mobile</th>
                                            <th className="p-4">City</th>
                                            <th className="p-4">Source</th>
                                            <th className="p-4">Date Added</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {unassignedLeads.length === 0 ? (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">No unassigned leads found.</td></tr>
                                        ) : (
                                            unassignedLeads.map(lead => (
                                                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-4">
                                                        <button onClick={() => toggleSelectLead(lead.id)} className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                                                            {selectedLeads.includes(lead.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                                                        </button>
                                                    </td>
                                                    <td className="p-4 font-medium text-gray-900">{lead.name}</td>
                                                    <td className="p-4 text-gray-500">{lead.mobile}</td>
                                                    <td className="p-4">{lead.city}</td>
                                                    <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200">{lead.source}</span></td>
                                                    <td className="p-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assigned' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow hover:shadow-sm"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All Agents</option>
                                    {telecallers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All Statuses</option>
                                    {['new', 'in-progress', 'sanctioned', 'disbursed', 'rejected'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                                <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All Cities</option>
                                    {Array.from(new Set(leads.map(l => l.city))).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                                        <tr>
                                            <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                                Lead Name <SortIcon columnKey="name" />
                                            </th>
                                            <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('agentName')}>
                                                Assigned Agent <SortIcon columnKey="agentName" />
                                            </th>
                                            <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                                                Status <SortIcon columnKey="status" />
                                            </th>
                                            <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('city')}>
                                                City <SortIcon columnKey="city" />
                                            </th>
                                            <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('lastRemark')}>
                                                Last Remark <SortIcon columnKey="lastRemark" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedLeads.length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No leads found matching your filters.</td></tr>
                                        ) : (
                                            paginatedLeads.map(lead => (
                                                <tr key={lead.id} className="hover:bg-gray-50/50">
                                                    <td className="p-4 font-medium text-gray-900">{lead.name}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                                                {users.find(u => u.id === lead.assignedTo)?.name.charAt(0)}
                                                            </div>
                                                            <span className="truncate max-w-[120px]">{users.find(u => u.id === lead.assignedTo)?.name || 'Unknown'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                                        ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                                lead.status === 'sanctioned' ? 'bg-green-100 text-green-700' :
                                                                    lead.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-700'}`}>
                                                            {lead.status.replace('-', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">{lead.city}</td>
                                                    <td className="p-4 max-w-xs truncate text-gray-500">
                                                        {lead.remarks.length > 0 ? lead.remarks[lead.remarks.length - 1].comment : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {sortedLeads.length > 0 && (
                                <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-gray-50">
                                    <span className="text-xs text-gray-500">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedLeads.length)} of {sortedLeads.length} entries
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1 px-3 border rounded-md bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1 px-3 border rounded-md bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>        </div>
    );
};

export default LeadAssignment;
