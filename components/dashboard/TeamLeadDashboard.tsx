import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, FileText, CheckCircle, Clock, IndianRupee, TrendingUp, BarChart2, Calendar, Activity, AlertTriangle, Phone } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import StatCard from './StatCard';
import { Link } from 'react-router-dom';

const TeamLeadDashboard = () => {
    const { users, leads, currentUser } = useApp();

    // Filter leads assigned to this Team Lead or their team
    // --- DATE FILTER ---
    const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Filter leads assigned to this Team Lead or their team
    const myTeamLeadsRaw = leads.filter(l => {
        // If explicitly assigned to TL
        if (l.assignedTo === currentUser?.id) return true;

        // Or assigned to a member of their team
        const assignedUser = users.find(u => u.id === l.assignedTo);
        return assignedUser?.reportsTo === currentUser?.id;
    });

    // Apply Date Filter
    const myTeamLeads = myTeamLeadsRaw.filter(l => l.createdAt.startsWith(selectedMonth));

    // --- METRICS ---

    // 1. Total Disbursal Value (Financial Tracking)
    const totalDisbursedValue = myTeamLeads
        .filter(l => l.status === 'disbursed' && l.loanDetails?.disbursalStatus === 'completed')
        .reduce((acc, l) => acc + (l.loanDetails?.sanctionAmount || 0), 0);

    // 2. Lead Conversion Count
    const conversions = myTeamLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status)).length;

    // 3. Pending Leads
    const pendingLeads = myTeamLeads.filter(l => ['new', 'docs-pending', 'docs-submitted', 'application'].includes(l.status)).length;

    // 4. Actioned Leads (Simplification: Leads with remarks today)
    const todayStr = new Date().toISOString().split('T')[0];
    const actionedToday = myTeamLeads.filter(l => l.remarks.some(r => r.timestamp.startsWith(todayStr))).length;

    // 5. Team Reports Data
    const myTeamMembers = users.filter(u => u.reportsTo === currentUser?.id);
    const teamReport = myTeamMembers.map(member => {
        const memberLeads = myTeamLeads.filter(l => l.assignedTo === member.id);
        const calls = memberLeads.reduce((acc, l) => acc + l.remarks.length, 0);
        const interested = memberLeads.filter(l => l.remarks.some(r => r.disposition === 'Interested')).length;
        const docsSubmitted = memberLeads.filter(l => ['docs-submitted', 'application', 'sanctioned', 'disbursed'].includes(l.status)).length;
        const pdCompleted = memberLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status) || l.loanDetails?.pdStatus === 'completed').length;
        const converted = memberLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status)).length;
        const disbursedVal = memberLeads
            .filter(l => l.status === 'disbursed')
            .reduce((acc, l) => acc + (l.loanDetails?.sanctionAmount || 0), 0);

        return {
            id: member.id,
            name: member.name,
            totalLeads: memberLeads.length,
            calls,
            interested,
            docsSubmitted,
            pdCompleted,
            converted,
            disbursedVal,
            conversionRate: memberLeads.length > 0 ? ((converted / memberLeads.length) * 100).toFixed(1) : '0'
        };
    });

    // --- ADVANCED METRICS ---
    // A. Team Performance
    const teamCallsToday = myTeamLeads.reduce((acc, l) => acc + l.remarks.filter(r => r.timestamp.startsWith(todayStr)).length, 0);
    const teamConnectedToday = myTeamLeads.reduce((acc, l) => acc + l.remarks.filter(r => r.timestamp.startsWith(todayStr) && ['Connected', 'Interested'].includes(r.disposition)).length, 0);
    const teamFollowupsDue = myTeamLeads.filter(l => l.followups.some(f => f.status === 'pending' && f.date === todayStr)).length;

    // B. Application Pipeline
    const docsPendingPDCount = myTeamLeads.filter(l => l.status === 'docs-submitted' || (l.status === 'application' && l.loanDetails?.pdStatus === 'pending')).length;
    const pdCompletedCount = myTeamLeads.filter(l => l.loanDetails?.pdStatus === 'completed' || ['sanctioned', 'disbursed'].includes(l.status)).length;
    const sanctionedCount = myTeamLeads.filter(l => l.status === 'sanctioned' || l.status === 'disbursed').length;
    const disbursedCount = myTeamLeads.filter(l => l.status === 'disbursed').length;

    // D. Financials
    const totalSanctionValue = myTeamLeads
        .filter(l => ['sanctioned', 'disbursed'].includes(l.status))
        .reduce((acc, l) => acc + (l.loanDetails?.sanctionAmount || 0), 0);
    const avgTicketSize = disbursedCount > 0 ? Math.round(totalDisbursedValue / disbursedCount) : 0;

    // C. Funnel Data
    const funnelData = [
        { stage: 'Assigned', value: myTeamLeads.length, fill: '#64748b' },
        { stage: 'Interested', value: myTeamLeads.filter(l => l.remarks.some(r => r.disposition === 'Interested')).length, fill: '#3b82f6' },
        { stage: 'Docs Submitted', value: myTeamLeads.filter(l => ['docs-submitted', 'application', 'sanctioned', 'disbursed'].includes(l.status)).length, fill: '#8b5cf6' },
        { stage: 'PD Done', value: pdCompletedCount, fill: '#d946ef' },
        { stage: 'Sanctioned', value: sanctionedCount, fill: '#f59e0b' },
        { stage: 'Disbursed', value: disbursedCount, fill: '#10b981' },
    ];

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team Lead Dashboard</h1>
                    <p className="text-slate-500">Performance Summary for <span className="font-semibold text-slate-700">{new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 shadow-sm">
                        <IndianRupee size={20} />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider">Total Disbursal</p>
                            <p className="text-xl font-bold">{formatCurrency(totalDisbursedValue)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Command Center */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                {/* 1. Team Activity Monitor */}
                <div className="p-8 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={120} className="text-blue-500" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Activity size={16} /> Team Activity
                    </h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-black text-slate-900">{teamCallsToday}</span>
                        <span className="text-sm font-medium text-slate-400 mb-1">Calls Today</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div style={{ width: '65%' }} className="h-full bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-600 font-medium">{teamConnectedToday} Connected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            <span className="text-slate-600 font-medium">{teamFollowupsDue} Follow-ups</span>
                        </div>
                    </div>
                </div>

                {/* 2. Processing Pipeline Pulse */}
                <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <TrendingUp size={16} /> Processing Pulse
                    </h3>
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg mb-2 border border-indigo-100">
                                {docsPendingPDCount}
                            </div>
                            <span className="text-xs font-semibold text-slate-500">Pending PD</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200 relative">
                            <div className="absolute inset-0 bg-slate-200"></div>
                            <div className="absolute right-0 -top-1 w-2 h-2 bg-slate-300 rounded-full"></div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-lg mb-2 border border-emerald-100">
                                {sanctionedCount}
                            </div>
                            <span className="text-xs font-semibold text-slate-500">Sanctioned</span>
                        </div>
                    </div>
                </div>

                {/* 3. Financial Ribbon */}
                <div className="p-8 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <IndianRupee size={16} /> Financials
                    </h3>
                    <div className="mb-4">
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Total Disbursed</p>
                        <p className="text-3xl font-black text-emerald-600">{formatCurrency(totalDisbursedValue)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Pipeline Value</p>
                        <p className="text-xl font-bold text-slate-700">{formatCurrency(totalSanctionValue)}</p>
                    </div>
                </div>

            </div>

            {/* Funnel Visualization */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" /> Application Funnel
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="stage" type="category" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" barSize={25} radius={[0, 4, 4, 0]}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Team Performance Report */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <BarChart2 size={20} className="text-blue-600" /> Team Reports
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Agent Name</th>
                                <th className="px-6 py-4 font-semibold">Leads</th>
                                <th className="px-6 py-4 font-semibold">Calls</th>
                                <th className="px-6 py-4 font-semibold">Docs</th>
                                <th className="px-6 py-4 font-semibold">PD Done</th>
                                <th className="px-6 py-4 font-semibold">Converted</th>
                                <th className="px-6 py-4 font-semibold text-right">Disbursed (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teamReport.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No team members found</td></tr>
                            ) : (
                                teamReport.map(report => (
                                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{report.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{report.totalLeads}</td>
                                        <td className="px-6 py-4 text-slate-600">{report.calls}</td>
                                        <td className="px-6 py-4 text-slate-600">{report.docsSubmitted}</td>
                                        <td className="px-6 py-4 text-slate-600">{report.pdCompleted}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-medium">{report.converted} ({report.conversionRate}%)</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(report.disbursedVal)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Agent Productivity Monitor (WFH) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Activity size={20} className="text-orange-500" /> Live Agent Monitor
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Real-time Activity</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 1. Hourly Activity Heatmap */}
                    <div className="h-64">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Activity Heatmap (Today)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={
                                Array.from({ length: 9 }, (_, i) => {
                                    const hour = 9 + i; // 9 AM to 5 PM
                                    return {
                                        hour: `${hour}:00`,
                                        calls: teamReport.reduce((acc, agent) => {
                                            // Mock logic: Distribute total calls across hours based on mock randomness
                                            // In real app, we filter 'remarks' by timestamp hour
                                            // For now, simulating 'active' hours
                                            return acc + Math.floor(agent.calls * (Math.random() * 0.2));
                                        }, 0)
                                    };
                                })
                            } margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="hour" fontSize={11} />
                                <YAxis fontSize={11} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="calls" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 2. Live Activity Feed & Idle Alerts */}
                    <div className="flex flex-col h-64">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Live Feed & Alerts</h4>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {/* Mock Idle Alert */}
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 animate-pulse">
                                <div className="p-2 bg-white rounded-full text-red-500"><AlertTriangle size={16} /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">High Idle Time: Anitha Krishnan</p>
                                    <p className="text-xs text-red-600">No activity for 55 minutes</p>
                                </div>
                            </div>

                            {/* Mock Live Actions */}
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-full text-blue-500"><Phone size={14} /></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700">
                                            <span className="font-bold text-slate-900">Karthik Raja</span> updated status to <span className="font-semibold text-blue-600">Interested</span>
                                        </p>
                                        <p className="text-xs text-slate-400">Just now</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
};

export default TeamLeadDashboard;
