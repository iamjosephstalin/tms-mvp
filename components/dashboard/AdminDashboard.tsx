import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users, BarChart2, Target, Briefcase,
  AlertTriangle, FileCheck, PhoneForwarded, CheckCircle, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import StatCard from './StatCard';

const AdminDashboard = () => {
  const { leads, users } = useApp();
  const telecallers = users.filter(u => u.role === 'telecaller');
  const todayStr = new Date().toISOString().split('T')[0];

  // --- TEAM METRICS ---

  const totalAssigned = leads.filter(l => l.assignedTo).length;
  const unassigned = leads.filter(l => !l.assignedTo).length;

  // Calls
  const teamCallsToday = leads.reduce((acc, l) => {
    return acc + l.remarks.filter(r => r.timestamp.startsWith(todayStr)).length;
  }, 0);

  // Follow-ups Adherence
  const totalFollowupsDueToday = leads.filter(l => l.followups.some(f => f.date === todayStr)).length;
  const completedFollowupsToday = leads.filter(l => l.followups.some(f => f.date === todayStr && f.status === 'completed')).length; // Mock logic, usually relies on status change history
  const adherenceRate = totalFollowupsDueToday > 0 ? Math.round((completedFollowupsToday / totalFollowupsDueToday) * 100) : 85; // Mocking 85% if no data for demo

  // Target vs Achievement (Mock Targets)
  const monthlyTarget = 100; // 100 conversions
  const teamConversions = leads.filter(l => ['sanctioned', 'disbursed'].includes(l.status)).length;
  const achievementPct = Math.min(Math.round((teamConversions / monthlyTarget) * 100), 100);

  // --- CHARTS DATA ---

  // 1. Funnel
  const funnelData = [
    { name: 'Contacted', value: leads.filter(l => l.remarks.length > 0).length },
    { name: 'Interested', value: leads.filter(l => l.status === 'in-progress' || l.status === 'docs-pending').length },
    { name: 'Docs Submitted', value: leads.filter(l => l.status === 'docs-submitted' || l.status === 'application').length },
    { name: 'Sanctioned', value: leads.filter(l => l.status === 'sanctioned').length },
    { name: 'Disbursed', value: leads.filter(l => l.status === 'disbursed').length },
  ];

  // 2. Interest Category Distribution (Mocked based on remarks or status)
  const interestData = [
    { name: 'High Interest', value: leads.filter(l => l.status === 'in-progress').length },
    { name: 'Medium Interest', value: leads.filter(l => l.status === 'follow-up').length },
    { name: 'Low Interest', value: leads.filter(l => l.status === 'new').length },
    { name: 'Not Interested', value: leads.filter(l => l.status === 'not-interested').length },
  ];
  const INTEREST_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#94a3b8'];

  // 3. Telecaller Performance Table
  const callerPerformance = telecallers.map(user => {
    const userLeads = leads.filter(l => l.assignedTo === user.id);
    const callsMade = userLeads.reduce((acc, l) => acc + l.remarks.length, 0);
    const converted = userLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status)).length;

    // Connect Rate
    const connectedCalls = userLeads.flatMap(l => l.remarks).filter(r => r.disposition === 'Connected').length;
    const connectRate = callsMade > 0 ? Math.round((connectedCalls / callsMade) * 100) : 0;

    // Adherence Score (Mock random 70-100%)
    const adherence = Math.floor(Math.random() * 30) + 70;

    return {
      name: user.name,
      leads: userLeads.length,
      calls: callsMade,
      converted,
      connectRate,
      adherence
    };
  }).sort((a, b) => b.converted - a.converted); // Leaderboard sorting

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Performance</h1>
          <p className="text-gray-500">Track targets, adherence, and outcomes.</p>
        </div>
        <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-orange-100">
          Target Achievement: {achievementPct}%
          <div className="w-20 h-2 bg-orange-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-600" style={{ width: `${achievementPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Leads Assigned"
          value={totalAssigned}
          icon={Users}
          color="bg-blue-100 text-blue-600"
          subtext={`${unassigned} Unassigned`}
        />
        <StatCard
          title="Team Calls Today"
          value={teamCallsToday}
          icon={PhoneForwarded}
          color="bg-indigo-100 text-indigo-600"
          trend="up"
        />
        <StatCard
          title="Conversion Count"
          value={teamConversions}
          icon={Target}
          color="bg-emerald-100 text-emerald-600"
          subtext={`Target: ${monthlyTarget}`}
        />
        <StatCard
          title="Follow-up Adherence"
          value={`${adherenceRate}%`}
          icon={Clock}
          color="bg-purple-100 text-purple-600"
          subtext="On-time completion"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Agent Leaderboard</h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">Ranked by Conversions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Rank</th>
                  <th className="px-6 py-3 font-medium">Agent</th>
                  <th className="px-6 py-3 font-medium text-center">Calls</th>
                  <th className="px-6 py-3 font-medium text-center">Connect %</th>
                  <th className="px-6 py-3 font-medium text-center">Adherence</th>
                  <th className="px-6 py-3 font-medium text-right">Wins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {callerPerformance.map((agent, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-400">#{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        {agent.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{agent.calls}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${agent.connectRate > 40 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {agent.connectRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${agent.adherence > 90 ? 'bg-green-500' : agent.adherence > 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${agent.adherence}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{agent.adherence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">{agent.converted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interest Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Interest Breakdown</h2>
          <p className="text-xs text-gray-500 mb-6">Categorization based on lead status</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interestData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {interestData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INTEREST_COLORS[index % INTEREST_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Chart - Full Width Bottom */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Team Conversion Funnel</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} label={{ position: 'top' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;