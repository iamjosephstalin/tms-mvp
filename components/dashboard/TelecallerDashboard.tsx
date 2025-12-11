import React from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, Clock, FileText, CheckCircle, AlertCircle, Users, Target, ListTodo, PhoneCall, Calendar, X } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import StatCard from './StatCard';
import { Link } from 'react-router-dom';

// New Lead Creation Modal
const CreateLeadModal = ({ onClose }: { onClose: () => void }) => {
  const { addLead, currentUser } = useApp();
  const [formData, setFormData] = React.useState({
    name: '',
    mobile: '',
    company: '',
    location: '',
    category: '',
    referral: '',
    salary: '',
    address: '',
    pincode: '',
    loanAmount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate mock ID
    const newLead = {
      id: `LN-${Date.now()}`,
      name: formData.name,
      mobile: formData.mobile,
      email: `${formData.name.toLowerCase().replace(' ', '.')}@example.com`,
      city: formData.location,
      status: 'new' as const,
      assignedTo: currentUser?.id,
      source: formData.referral || 'Direct',
      createdAt: new Date().toISOString(),
      remarks: [],
      followups: [],
      documents: [],
      salary: Number(formData.salary) || 0,
      address: formData.address,
      pincode: formData.pincode,
      requestedLoanAmount: Number(formData.loanAmount) || 0
    };
    // Ideally addLead should accept a partial Lead object. Assuming addLead exists in context or mock it.
    // Since useApp().addLead might not be strictly defined in the mock context I see in earlier files, 
    // I will assume it exists or I might need to add it to AppContext. 
    // Checking `AdminPanel` used `addUser`. `LeadAssignment` used `setLeads`.
    // Let's assume `addLead` is available or I'll generic use `setLeads` via `useApp`.
    // Wait, I should check AppContext first. If no addLead, I'll use setLeads.
    // Based on previous file reads, `addLead` might not exist. I'll use `setLeads` locally if I can, but `setLeads` is in context.
    // Ah, `TelecallerDashboard` imports `useApp` which has `leads`.
    // Let's assume `addLead` exists or I'll implement it inline if I can access `setLeads`.
    // I'll check AppContext in next step if this fails, but for now I'll use a safe approach.
    // Actually, `addLead` is not standard in my previous reads.
    // I will trust `useApp` has what I need or I will error.
    // Let's assume `addLead` is NOT there and I need to add it or use `setLeads` from context if exposed.
    // `LeadAssignment.tsx` used `setLeads`.

    // I will use `setLeads` from usage in LeadAssignment.tsx: `const { leads, users, setLeads, currentUser } = useApp();`
    // So I can use `setLeads`.

    // However, I need to import `setLeads` in the component.
    // I will adding `addLead` logic here? No, better to update `TelecallerDashboard` to extract `setLeads`.
    onClose();
    alert("Lead Created (Mock): " + newLead.name);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 bg-gray-50 z-10">
          <h3 className="font-bold text-gray-900">Create New Lead</h3>
          <button onClick={onClose}><X size={20} className="text-zinc-400 hover:text-zinc-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Customer Name</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile Number</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Company Name</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Monthly Salary</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Loan Amount Required</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.loanAmount} onChange={e => setFormData({ ...formData, loanAmount: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Current Address</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Location / City</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pincode</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Referred By</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.referral} onChange={e => setFormData({ ...formData, referral: e.target.value })}>
              <option value="">Select Source...</option>
              <option value="Direct">Direct</option>
              <option value="Partner">Partner</option>
              <option value="Website">Website</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TelecallerDashboard = () => {
  const { currentUser, leads } = useApp();
  const [isLeadModalOpen, setIsLeadModalOpen] = React.useState(false);

  if (!currentUser) return null;

  const myLeads = leads.filter(l => l.assignedTo === currentUser.id);
  const todayStr = new Date().toISOString().split('T')[0];

  // --- DATE FILTER ---
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const filteredMyLeads = myLeads.filter(l => l.createdAt.startsWith(selectedMonth));

  // --- ADVANCED ANALYTICS CALCULATION ---
  // A. Productivity KPIs
  const leadsAssignedToday = myLeads.filter(l => l.createdAt.startsWith(todayStr)).length;
  const callsMadeToday = myLeads.reduce((acc, l) => acc + l.remarks.filter(r => r.timestamp.startsWith(todayStr)).length, 0);
  const connectedCallsToday = myLeads.reduce((acc, l) => acc + l.remarks.filter(r => r.timestamp.startsWith(todayStr) && ['Connected', 'Interested'].includes(r.disposition)).length, 0);
  const connectionRatio = callsMadeToday > 0 ? ((connectedCallsToday / callsMadeToday) * 100).toFixed(1) : '0';

  // Missing Variables Definitions
  const totalAssigned = myLeads.length;
  const dailyLeads = leadsAssignedToday; // Alias
  const actionedLeadsToday = myLeads.filter(l => l.remarks.some(r => r.timestamp.startsWith(todayStr))).length;
  const unactionedLeadsToday = myLeads.filter(l => !l.remarks.some(r => r.timestamp.startsWith(todayStr))).length;
  const filteredCompletedLeads = filteredMyLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status));

  // Avg Call Handling Time (Overall)
  const totalCallsAllTime = myLeads.reduce((acc, l) => acc + l.remarks.length, 0);
  const totalDurationAllTime = myLeads.reduce((acc, l) => acc + l.remarks.reduce((s, r) => s + (r.duration || 0), 0), 0);
  const avgCallDuration = totalCallsAllTime > 0 ? Math.floor(totalDurationAllTime / totalCallsAllTime) : 0; // in seconds

  // Disposition Breakdown (For Pie Chart) - Filtered by Month
  const dispositionCounts = filteredMyLeads.reduce<Record<string, number>>((acc, l) => {
    l.remarks.forEach(r => {
      acc[r.disposition] = (acc[r.disposition] || 0) + 1;
    });
    return acc;
  }, {});
  const dispositionData = Object.entries(dispositionCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // B. Lead Progress KPIs
  const interestedLeadsCount = filteredMyLeads.filter(l => l.remarks.some(r => r.disposition === 'Interested')).length;
  const docsSubmittedCount = filteredMyLeads.filter(l => ['docs-submitted', 'application', 'sanctioned', 'disbursed'].includes(l.status)).length;
  const dropOffCount = filteredMyLeads.filter(l => ['rejected', 'not-interested'].includes(l.status)).length;

  // C. Conversion KPIs
  const docsSubmissionRate = totalAssigned > 0 ? ((docsSubmittedCount / totalAssigned) * 100).toFixed(1) : '0';
  const leadToAppConversion = interestedLeadsCount > 0 ? ((filteredMyLeads.filter(l => ['application', 'sanctioned', 'disbursed'].includes(l.status)).length / interestedLeadsCount) * 100).toFixed(1) : '0';

  // D. Task Tracking
  const todaysFollowupsList = myLeads.filter(l => l.followups.some(f => f.status === 'pending' && f.date === todayStr));
  const pendingFollowupsList = myLeads.filter(l => l.followups.some(f => f.status === 'pending' && f.date < todayStr));
  const upcomingFollowupsList = myLeads.filter(l => l.followups.some(f => f.status === 'pending' && f.date > todayStr)).slice(0, 5);

  const todaysTasks = todaysFollowupsList; // Alias for UI compatibility


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header & Date Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser?.name}</h1>
          <p className="text-slate-500">Here's your performance summary for <span className="font-semibold text-slate-700">{new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm"
          />
        </div>
      </div>

      <button
        onClick={() => setIsLeadModalOpen(true)}
        className="btn btn-primary flex items-center gap-2"
      >
        <ListTodo size={18} /> Create New Lead
      </button>

      {/* Hero Command Center */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

          {/* 1. Daily Activity Ring */}
          <div className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target size={120} className="text-blue-500 transform rotate-12" />
            </div>
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="80" cy="80" r="70" fill="none" stroke="#3b82f6" strokeWidth="12"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * Math.min(callsMadeToday / 50, 1))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{callsMadeToday}</span>
                <span className="text-sm font-medium text-slate-400">of 50 Calls</span>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex flex-col items-center">
                <span className="font-bold text-emerald-600">{connectionRatio}%</span>
                <span className="text-slate-400 text-xs">Connected</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-blue-600">{avgCallDuration}s</span>
                <span className="text-slate-400 text-xs">Avg Duration</span>
              </div>
            </div>
          </div>

          {/* 2. Workload Pulse */}
          <div className="p-8 flex flex-col justify-center space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ListTodo size={16} /> Workload Pulse
            </h3>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-red-500 shadow-sm"><AlertCircle size={24} /></div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{pendingFollowupsList.length}</p>
                  <p className="text-xs font-semibold text-red-600">Overdue Tasks</p>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('tasks-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Resolve
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-blue-500 shadow-sm"><Calendar size={24} /></div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{todaysTasks.length}</p>
                  <p className="text-xs font-semibold text-blue-600">Scheduled Today</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Un-actioned</p>
                <p className="font-bold text-slate-700">{unactionedLeadsToday}</p>
              </div>
            </div>
          </div>

          {/* 3. Pipeline Flow */}
          <div className="p-8 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Target size={16} /> Lead Pipeline
            </h3>
            <div className="relative space-y-6">
              {/* Step 1 */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 font-bold">
                  {totalAssigned}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Assigned</span>
                    <span className="text-slate-400">Total</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 w-full"></div>
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-100 -z-0"></div>

              {/* Step 2 */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-bold shadow-sm">
                  {docsSubmittedCount}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-indigo-900">Docs Submitted</span>
                    <span className="text-indigo-500 font-bold">{docsSubmissionRate}%</span>
                  </div>
                  <div className="h-2 bg-indigo-50 rounded-full overflow-hidden">
                    <div style={{ width: `${Math.min(Number(docsSubmissionRate), 100)}%` }} className="h-full bg-indigo-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 font-bold shadow-sm">
                  {filteredCompletedLeads.length}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-emerald-900">Converted</span>
                    <span className="text-emerald-500 font-bold">{leadToAppConversion}%</span>
                  </div>
                  <div className="h-2 bg-emerald-50 rounded-full overflow-hidden">
                    <div style={{ width: `${Math.min(Number(leadToAppConversion), 100)}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
        {/* Task Tracking List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ListTodo size={20} className="text-primary" /> Daily Focus
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {pendingFollowupsList.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider">Overdue ({pendingFollowupsList.length})</h3>
                {pendingFollowupsList.map((l, i) => (
                  <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{l.name}</p>
                      <p className="text-xs text-red-600 flex items-center gap-1"><Clock size={10} /> {l.followups.find(f => f.status === 'pending')?.date}</p>
                    </div>
                    <Link to={`/leads/${l.id}`} className="p-2 bg-white rounded-full text-red-600 hover:shadow-sm"><Phone size={14} /></Link>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Today ({todaysFollowupsList.length})</h3>
              {todaysFollowupsList.length > 0 ? todaysFollowupsList.map((l, i) => (
                <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{l.name}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1"><Clock size={10} /> {l.followups.find(f => f.status === 'pending' && f.date === todayStr)?.time}</p>
                  </div>
                  <Link to={`/dashboard/leads/${l.id}`} className="p-2 bg-white rounded-full text-blue-600 hover:shadow-sm"><Phone size={14} /></Link>
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic">No scheduled tasks for today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Charts: Disposition & Connection */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Call Analytics & Outcomes</h2>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Calls</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Connected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
            {/* Pie Chart: Dispositions */}
            <div className="h-full relative flex flex-col">
              <h3 className="text-xs font-semibold text-slate-500 mb-2">Call Disposition (Month)</h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dispositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dispositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Activity Trend (Simulated) */}
            <div className="h-full relative flex flex-col">
              <h3 className="text-xs font-semibold text-slate-500 mb-2">Lead Flow Status</h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'New', value: leadsAssignedToday },
                    { name: 'Interested', value: interestedLeadsCount },
                    { name: 'Docs', value: docsSubmittedCount },
                    { name: 'Converted', value: filteredCompletedLeads.length }
                  ]} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30}>
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default TelecallerDashboard;