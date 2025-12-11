import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, FileText, CheckCircle, Clock, IndianRupee, TrendingUp, BarChart2 } from 'lucide-react';
import StatCard from './StatCard';
import { Link } from 'react-router-dom';

const TeamLeadDashboard = () => {
    const { users, leads, currentUser } = useApp();

    // Filter leads assigned to this Team Lead or their team
    const myTeamLeads = leads.filter(l => {
        // If explicitly assigned to TL
        if (l.assignedTo === currentUser?.id) return true;

        // Or assigned to a member of their team
        const assignedUser = users.find(u => u.id === l.assignedTo);
        return assignedUser?.reportsTo === currentUser?.id;
    });

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
        const converted = memberLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status)).length;
        const disbursedVal = memberLeads
            .filter(l => l.status === 'disbursed')
            .reduce((acc, l) => acc + (l.loanDetails?.sanctionAmount || 0), 0);

        return {
            id: member.id,
            name: member.name,
            totalLeads: memberLeads.length,
            converted,
            disbursedVal,
            conversionRate: memberLeads.length > 0 ? ((converted / memberLeads.length) * 100).toFixed(1) : '0'
        };
    });

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team Lead Dashboard</h1>
                    <p className="text-slate-500">Performance Overview & Financials</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 shadow-sm">
                    <IndianRupee size={20} />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider">Total Disbursal Value</p>
                        <p className="text-xl font-bold">{formatCurrency(totalDisbursedValue)}</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Leads Assigned"
                    value={myTeamLeads.length}
                    icon={Users}
                    color="bg-blue-100 text-blue-600"
                    subtext="Total Team Volume"
                />
                <StatCard
                    title="Actioned Today"
                    value={actionedToday}
                    icon={CheckCircle}
                    color="bg-green-100 text-green-600"
                    subtext="Team Activity"
                />
                <StatCard
                    title="Pending Leads"
                    value={pendingLeads}
                    icon={Clock}
                    color="bg-orange-100 text-orange-600"
                    subtext="Requires Attention"
                />
                <StatCard
                    title="Conversions"
                    value={conversions}
                    icon={TrendingUp}
                    color="bg-purple-100 text-purple-600"
                    subtext="Sanctioned / Disbursed"
                />
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
                                <th className="px-6 py-4 font-semibold">Total Leads</th>
                                <th className="px-6 py-4 font-semibold">Converted</th>
                                <th className="px-6 py-4 font-semibold">Conversion Rate</th>
                                <th className="px-6 py-4 font-semibold text-right">Disbursal Value</th>
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
                                        <td className="px-6 py-4 text-emerald-600 font-medium">{report.converted}</td>
                                        <td className="px-6 py-4 text-slate-600">{report.conversionRate}%</td>
                                        <td className="px-6 py-4 text-slate-900 font-bold text-right">{formatCurrency(report.disbursedVal)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamLeadDashboard;
