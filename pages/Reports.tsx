import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText, Download, Filter, Calendar, Users,
  Search, ChevronDown, CheckSquare, XSquare, Table
} from 'lucide-react';
import ExportDropdown from '../components/ExportDropdown';

type ReportType = 'dar' | 'followup' | 'conversion' | 'productivity' | 'missed' | 'interest';

const ReportTypes = [
  { id: 'dar', label: 'Daily Activity Report (DAR)', desc: 'Calls made, duration, and outcomes per agent.' },
  { id: 'followup', label: 'Follow-up Pending', desc: 'Leads with overdue or scheduled follow-ups.' },
  { id: 'conversion', label: 'Conversion Report', desc: 'Sanctioned and Disbursed leads details.' },
  { id: 'productivity', label: 'Telecaller Productivity', desc: 'Login hours, connect rate, and efficiency.' },
  { id: 'missed', label: 'Missed Call & Callback', desc: 'Calls not connected and requested callbacks.' },
  { id: 'interest', label: 'Interest Category', desc: 'Leads distributed by interest levels.' },
];

const Reports = () => {
  const { leads, users, currentUser } = useApp();
  const [activeReport, setActiveReport] = useState<ReportType>('dar');
  const [showFilters, setShowFilters] = useState(true);

  // --- FILTERS STATE ---
  const [dateRange, setDateRange] = useState('today');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Determine available agents based on role
  // Super Admin: All Telecallers
  // Admin (Team Lead): Only Telecallers reporting to them
  const availableAgents = users.filter(u => {
    if (u.role !== 'telecaller') return false;
    if (currentUser?.role === 'superadmin') return true;
    if (currentUser?.role === 'admin') return u.reportsTo === currentUser.id;
    return false;
  });

  // --- MOCK DATA GENERATION BASED ON REPORT TYPE ---
  // In a real app, this would query the backend with filters. Here we filter `leads` state.

  const generateReportData = () => {
    let data = leads;

    // 1. Role-based Data Scope Access
    if (currentUser?.role === 'admin') {
      // Team Lead can only see leads assigned to THEIR team members
      const myTeamIds = availableAgents.map(a => a.id);
      data = data.filter(l => l.assignedTo && myTeamIds.includes(l.assignedTo));
    }

    // Filter by Agent
    if (selectedAgent !== 'all') {
      data = data.filter(l => l.assignedTo === selectedAgent);
    }
    // Filter by Status
    if (selectedStatus !== 'all') {
      data = data.filter(l => l.status === selectedStatus);
    }

    // Transform based on Report Type
    switch (activeReport) {
      case 'dar':
        // Return Call Activity Logs
        return data.flatMap(l => l.remarks.map(r => ({
          id: r.id,
          date: r.timestamp.split('T')[0],
          agent: r.userName,
          lead: l.name,
          mobile: l.mobile,
          disposition: r.disposition,
          duration: r.duration ? `${Math.floor(r.duration / 60)}m ${r.duration % 60}s` : '-',
          comment: r.comment
        }))).slice(0, 50); // Limit for mock

      case 'followup':
        return data.filter(l => l.status === 'follow-up' || l.followups.length > 0)
          .flatMap(l => l.followups.filter(f => f.status === 'pending').map(f => ({
            id: f.id,
            dueDate: f.date,
            time: f.time,
            lead: l.name,
            mobile: l.mobile,
            agent: users.find(u => u.id === l.assignedTo)?.name || 'Unassigned',
            reason: f.reason,
            status: f.status
          })));

      case 'conversion':
        return data.filter(l => ['sanctioned', 'disbursed'].includes(l.status)).map(l => ({
          id: l.id,
          lead: l.name,
          mobile: l.mobile,
          city: l.city,
          status: l.status,
          amount: l.loanDetails?.amount,
          sanctionedAmt: l.loanDetails?.sanctionAmount,
          agent: users.find(u => u.id === l.assignedTo)?.name || 'Unassigned',
        }));

      case 'missed':
        return data.flatMap(l => l.remarks.filter(r => ['No Answer', 'Call Back'].includes(r.disposition)).map(r => ({
          id: r.id,
          date: r.timestamp.split('T')[0],
          lead: l.name,
          mobile: l.mobile,
          type: r.disposition,
          agent: r.userName,
          comment: r.comment
        })));

      default:
        return [];
    }
  };

  const reportData = generateReportData();

  // --- EXPORT FUNCTION ---
  const handleExport = (format: string) => {
    // Mock export logic
    const fileName = `tms_${activeReport}_report_${new Date().toISOString().split('T')[0]}.${format}`;
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", fileName);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else {
      // CSV/Excel Mock
      const headers = reportData.length > 0 ? Object.keys(reportData[0]).join(",") : "";
      const rows = reportData.map(row => Object.values(row).join(",")).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports Generator</h1>
          <p className="text-slate-500">Generate detailed insights and export data.</p>
        </div>

        <div className="flex gap-2">
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">

        {/* Sidebar - Report Types */}
        <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto lg:overflow-y-auto shrink-0 flex lg:flex-col">
          <div className="p-4 bg-slate-50 border-r lg:border-r-0 lg:border-b border-slate-200 font-semibold text-slate-700 shrink-0 lg:w-full flex items-center lg:block whitespace-nowrap sticky left-0 z-10">
            Report Types
          </div>
          <div className="p-2 flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {ReportTypes.map(rtype => (
              <button
                key={rtype.id}
                onClick={() => setActiveReport(rtype.id as ReportType)}
                className={`text-left p-3 rounded-lg text-sm transition-colors whitespace-nowrap lg:whitespace-normal min-w-[200px] lg:min-w-0 ${activeReport === rtype.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="font-semibold">{rtype.label}</div>
                <div className="text-xs opacity-70 mt-1 line-clamp-1 hidden lg:block">{rtype.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">

          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Filter size={18} /> Filters:
            </div>

            <div className="relative">
              <select
                className="pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7d">Last 7 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="relative">
              <select
                className="pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="all">All Agents</option>
                {availableAgents.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {activeReport === 'conversion' && (
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="sanctioned">Sanctioned</option>
                  <option value="disbursed">Disbursed</option>
                </select>
              </div>
            )}

            <div className="ml-auto text-sm text-slate-500">
              Showing {reportData.length} records
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto p-0 relative">
            <div className="absolute inset-0 overflow-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[800px] lg:min-w-0">
                <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
                  <tr>
                    {reportData.length > 0 ? Object.keys(reportData[0]).map(key => (
                      <th key={key} className="px-6 py-3 font-medium capitalize border-b border-slate-200 whitespace-nowrap bg-slate-50">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    )) : (
                      <th className="px-6 py-3">No Data</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.length > 0 ? (
                    reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-blue-50/50">
                        {Object.values(row).map((val: any, i) => (
                          <td key={i} className="px-6 py-3 text-slate-700 whitespace-nowrap">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                        <Table className="mx-auto mb-2 opacity-50" size={32} />
                        No records found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reports;