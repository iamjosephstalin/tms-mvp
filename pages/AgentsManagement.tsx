import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Phone, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortDirection = 'asc' | 'desc';
interface SortConfig {
    key: string;
    direction: SortDirection;
}

const AgentsManagement = () => {
    const { users, leads, currentUser } = useApp();

    // State for Filters, Sort, Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // 1. Filter Agents - SHOW ONLY MY TEAM (Assigned Telecallers)
    const myAgents = useMemo(() => {
        return users.filter(u => {
            if (u.role !== 'telecaller') return false;
            // Strict check: Must report to the current logged-in Team Lead
            if (u.reportsTo !== currentUser?.id) return false;

            // Search Filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
            }
            return true;
        });
    }, [users, currentUser, searchQuery]);

    // Helper to calc stats
    const getAgentStats = (agentId: string) => {
        const agentLeads = leads.filter(l => l.assignedTo === agentId);
        const activeLeads = agentLeads.filter(l => !['disbursed', 'rejected', 'not-interested'].includes(l.status)).length;
        const conversions = agentLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status)).length;
        return { activeLeads, conversions, totalLeads: agentLeads.length };
    };

    // 2. Sort Agents
    const sortedAgents = useMemo(() => {
        if (!sortConfig) return myAgents;

        return [...myAgents].sort((a, b) => {
            const statsA = getAgentStats(a.id);
            const statsB = getAgentStats(b.id);

            let aValue: any = '';
            let bValue: any = '';

            switch (sortConfig.key) {
                case 'name': aValue = a.name; bValue = b.name; break;
                case 'status': aValue = a.status; bValue = b.status; break;
                case 'activeLeads': aValue = statsA.activeLeads; bValue = statsB.activeLeads; break;
                case 'conversions': aValue = statsA.conversions; bValue = statsB.conversions; break;
                case 'efficiency':
                    aValue = statsA.totalLeads > 0 ? (statsA.conversions / statsA.totalLeads) : 0;
                    bValue = statsB.totalLeads > 0 ? (statsB.conversions / statsB.totalLeads) : 0;
                    break;
                default: return 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [myAgents, sortConfig, leads]);

    // 3. Pagination
    const totalPages = Math.ceil(sortedAgents.length / itemsPerPage);
    const paginatedAgents = sortedAgents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key: string) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
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
                    <h1 className="text-2xl font-bold text-gray-900">My Agents</h1>
                    <p className="text-gray-500">Manage your team and view their performance.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                    <Users size={16} />
                    Total Agents: {myAgents.length}
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center shrink-0">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search agent by name..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left text-sm text-gray-600 relative">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                        Agent Name <SortIcon columnKey="name" />
                                    </th>
                                    <th className="p-4">Contact Info</th>
                                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                                        Status <SortIcon columnKey="status" />
                                    </th>
                                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('activeLeads')}>
                                        Active Leads <SortIcon columnKey="activeLeads" />
                                    </th>
                                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('conversions')}>
                                        Conversions <SortIcon columnKey="conversions" />
                                    </th>
                                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('efficiency')}>
                                        Conversion % <SortIcon columnKey="efficiency" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedAgents.length > 0 ? (
                                    paginatedAgents.map(agent => {
                                        const stats = getAgentStats(agent.id);
                                        const efficiency = stats.totalLeads > 0 ? ((stats.conversions / stats.totalLeads) * 100).toFixed(1) : '0.0';

                                        return (
                                            <tr key={agent.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                                            <img src={agent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{agent.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col text-xs">
                                                        <span className="text-gray-900">{agent.email}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-xs border ${agent.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                        {agent.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium text-blue-600">{stats.activeLeads}</td>
                                                <td className="p-4 font-medium text-emerald-600">{stats.conversions}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(Number(efficiency), 100)}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-medium">{efficiency}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400">
                                            No agents found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t flex justify-between items-center bg-gray-50 text-sm">
                            <span className="text-gray-500">Page {currentPage} of {totalPages}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentsManagement;
