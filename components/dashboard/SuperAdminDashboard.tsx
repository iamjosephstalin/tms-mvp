import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity, Users, Layers, Download, TrendingUp, IndianRupee,
  Filter, Calendar, MapPin, ChevronDown, PieChart as PieIcon,
  AlertTriangle, Globe, Landmark
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import StatCard from './StatCard';
import { MOCK_CITIES } from '../../constants';

const SuperAdminDashboard = () => {
  const { leads, users } = useApp();
  const [dateRange, setDateRange] = useState('30d');
  const [selectedCity, setSelectedCity] = useState('All');

  // --- Filtering Logic ---
  // --- DATE FILTER ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  // Also keeping dateRange for backward compat or specific chart overrides if needed, but primary filter is month now for dashboard consistency

  // --- Filtering Logic ---
  const filteredLeads = leads.filter(l =>
    (selectedCity === 'All' || l.city === selectedCity) &&
    l.createdAt.startsWith(selectedMonth)
  );

  // --- KPI METRICS ---
  const totalLeads = filteredLeads.length;
  const totalConversions = filteredLeads.filter(l => l.status === 'sanctioned' || l.status === 'disbursed').length;
  const overallConversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : '0';

  // --- FINANCIAL METRICS ---
  const totalSanctionedValue = filteredLeads
    .filter(l => ['sanctioned', 'disbursed'].includes(l.status))
    .reduce((acc, l) => acc + (l.loanDetails?.sanctionAmount || 0), 0);

  const totalDisbursedValue = filteredLeads
    .filter(l => l.status === 'disbursed')
    .reduce((acc, l) => acc + (l.loanDetails?.sanctionAmount || 0), 0);

  const projectedRevenue = totalDisbursedValue * 0.025; // 2.5% Commission Assumption

  // --- OPERATIONAL RISK INDICATORS ---
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const inactiveAgents = users.filter(u =>
    u.role === 'telecaller' &&
    u.status === 'active' &&
    (!u.lastActive || new Date(u.lastActive) < threeDaysAgo)
  ).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stagnantLeads = filteredLeads.filter(l =>
    ['new', 'in-progress', 'docs-submitted'].includes(l.status) &&
    (!l.remarks.length || new Date(l.remarks[l.remarks.length - 1].timestamp) < sevenDaysAgo)
  ).length;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const formatCompact = (val: number) =>
    Intl.NumberFormat('en-IN', { notation: "compact", maximumFractionDigits: 1 }).format(val);

  // --- CHARTS DATA ---

  // 1. Lead Source Performance
  const sourceStats = filteredLeads.reduce<Record<string, { total: number; converted: number }>>((acc, lead) => {
    if (!acc[lead.source]) acc[lead.source] = { total: 0, converted: 0 };
    acc[lead.source].total += 1;
    if (['sanctioned', 'disbursed'].includes(lead.status)) acc[lead.source].converted += 1;
    return acc;
  }, {});

  const sourcePerformance = Object.entries(sourceStats)
    .map(([source, data]) => ({
      name: source,
      leads: data.total,
      conversions: data.converted,
      rate: Math.round((data.converted / data.total) * 100)
    }))
    .sort((a, b) => b.leads - a.leads);

  // 1b. City Performance (Geo-Analytics)
  const cityStats = filteredLeads.reduce<Record<string, { total: number; converted: number; disbursedVal: number }>>((acc, lead) => {
    const city = lead.city || 'Unknown';
    if (!acc[city]) acc[city] = { total: 0, converted: 0, disbursedVal: 0 };
    acc[city].total += 1;
    if (['sanctioned', 'disbursed'].includes(lead.status)) acc[city].converted += 1;
    if (lead.status === 'disbursed') acc[city].disbursedVal += (lead.loanDetails?.sanctionAmount || 0);
    return acc;
  }, {});

  const cityPerformance = Object.entries(cityStats)
    .map(([city, data]) => ({
      city,
      leads: data.total,
      conversions: data.converted,
      disbursed: data.disbursedVal,
      rate: Math.round((data.converted / data.total) * 100)
    }))
    .sort((a, b) => b.disbursed - a.disbursed);

  // 2. SLA Tracking (Time to First Contact)
  // Mocking: <2h, 2-24h, >24h, Not Contacted
  const slaData = [
    { name: '< 2 Hours', value: 35 },
    { name: '2 - 24 Hours', value: 45 },
    { name: '> 24 Hours', value: 15 },
    { name: 'Breached', value: 5 },
  ];

  // 3. Monthly Funnel (Aggregated)
  const funnelData = [
    { stage: 'Assigned', count: totalLeads },
    { stage: 'Contacted', count: Math.floor(totalLeads * 0.85) },
    { stage: 'Interested', count: Math.floor(totalLeads * 0.45) },
    { stage: 'Converted', count: totalConversions },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Overview</h1>
          <p className="text-slate-500">Org-wide intelligence, cost analysis, and SLA tracking.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-slate-700"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="pl-9 pr-8 py-2 border rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Cities</option>
                {MOCK_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise KPIs */}
      {/* Enterprise Financial KPIs */}
      {/* Executive HUD */}
      <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 text-white overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/50">

          {/* 1. Revenue Ticker */}
          <div className="lg:col-span-2 p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-5">
              <IndianRupee size={200} />
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Landmark size={16} /> Total Revenue (Disbursed)
              </h3>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-black text-emerald-400">{formatCompact(totalDisbursedValue)}</span>
                <span className="text-emerald-500/80 font-medium">INR</span>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-slate-500 mb-0.5">Projected Revenue</p>
                  <p className="text-white font-bold">{formatCompact(projectedRevenue)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Pipeline Value</p>
                  <p className="text-white font-bold">{formatCompact(totalSanctionedValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Operational Health */}
          <div className="p-8">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity size={16} /> Operational Risk
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center group">
                <span className="text-slate-300">Stagnant Leads</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${stagnantLeads > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {stagnantLeads} Alerts
                </span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-300">Inactive Agents</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${inactiveAgents > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-400'}`}>
                  {inactiveAgents} Offline
                </span>
              </div>
            </div>
          </div>

          {/* 3. Global Stats */}
          <div className="p-8">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2">
              <Globe size={16} /> Network
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{totalLeads}</p>
                <p className="text-xs text-slate-500">Total Leads</p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-400">{totalConversions}</p>
                <p className="text-xs text-slate-500">Converted</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Lead Source Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Performance by Lead Source</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourcePerformance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="leads" name="Total Leads" fill="#94a3b8" barSize={12} radius={[0, 4, 4, 0]} />
                <Bar dataKey="conversions" name="Converted" fill="#10b981" barSize={12} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Tracking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">SLA Compliance (First Contact)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                  {slaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#ef4444' : index === 0 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Excellent</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Good</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Breached</span>
          </div>
        </div>

        {/* Global Monthly Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Org-Wide Lead Pipeline</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={funnelData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#4f46e5" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Globe size={20} className="text-blue-500" /> Regional Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Leads</th>
                  <th className="px-4 py-3">Conv. Rate</th>
                  <th className="px-4 py-3 text-right">Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cityPerformance.slice(0, 5).map(city => (
                  <tr key={city.city} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{city.city}</td>
                    <td className="px-4 py-3 text-slate-600">{city.leads}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${city.rate > 20 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{city.rate}%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCompact(city.disbursed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;