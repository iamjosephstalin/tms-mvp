import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity, Users, Layers, Download, TrendingUp, IndianRupee,
  Filter, Calendar, MapPin, ChevronDown, PieChart as PieIcon
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
  const filteredLeads = leads.filter(l =>
    selectedCity === 'All' || l.city === selectedCity
  );

  // --- KPI METRICS ---
  const totalLeads = filteredLeads.length;
  const totalConversions = filteredLeads.filter(l => l.status === 'sanctioned' || l.status === 'disbursed').length;
  const overallConversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : '0';

  // Cost Per Acquisition (CPA) - Mock Calculation
  // Assume generic fixed cost of operations + variable cost per lead
  const fixedCost = 50000;
  const variableCostPerLead = 200;
  const totalCost = fixedCost + (totalLeads * variableCostPerLead);
  const cpa = totalConversions > 0 ? Math.round(totalCost / totalConversions) : 0;

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
          <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-gray-500">Org-wide intelligence, cost analysis, and SLA tracking.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="pl-9 pr-8 py-2 border rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="mtd">Month to Date</option>
                <option value="ytd">Year to Date</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={Layers}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Conversions"
          value={totalConversions}
          icon={TrendingUp}
          color="bg-emerald-100 text-emerald-600"
          subtext={`Rate: ${overallConversionRate}%`}
        />
        <StatCard
          title="Cost Per Acquisition"
          value={`₹${cpa}`}
          icon={IndianRupee}
          color="bg-orange-100 text-orange-600"
          subtext="Est. Marketing + Ops"
        />
        <StatCard
          title="Active Workforce"
          value={users.filter(u => u.role === 'telecaller').length}
          icon={Users}
          color="bg-purple-100 text-purple-600"
          subtext="Agents Online"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Lead Source Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Performance by Lead Source</h2>
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
          <h2 className="text-lg font-bold text-gray-900 mb-6">SLA Compliance (First Contact)</h2>
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
          <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Excellent</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Good</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Breached</span>
          </div>
        </div>

        {/* Global Monthly Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Org-Wide Lead Pipeline</h2>
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

      </div>
    </div>
  );
};

export default SuperAdminDashboard;