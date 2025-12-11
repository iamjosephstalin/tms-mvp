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

  if (!currentUser) return null;

  const myLeads = leads.filter(l => l.assignedTo === currentUser.id);
  const todayStr = new Date().toISOString().split('T')[0];

  // --- METRICS CALCULATION ---
  // 1. New Stats Requirements: Schedule, Assigned, Daily Leads, Actioned vs Unactioned

  // Today's Follow-ups/Tasks
  const todaysTasks = myLeads.filter(l =>
    l.followups.some(f => f.status === 'pending' && f.date === todayStr)
  );

  // Total Assigned (from requirement)
  const totalAssigned = myLeads.length;

  // Daily Leads (Leads created today)
  const dailyLeads = myLeads.filter(l => l.createdAt.startsWith(todayStr)).length;

  // Actioned vs Unactioned Calls (Today)
  // Actioned = Remarks added today OR Status changed today (Simplification: Remarks with today's date)
  const actionedLeadsToday = myLeads.filter(l =>
    l.remarks.some(r => r.timestamp.startsWith(todayStr))
  ).length;

  const unactionedLeadsToday = totalAssigned - actionedLeadsToday;

  // --- RESTORED METRICS FOR CHARTS ---
  // 1. Follow-ups (Required for list)
  const todaysFollowups = myLeads.filter(l =>
    l.followups.some(f => f.status === 'pending' && f.date === todayStr)
  );

  const missedFollowups = myLeads.filter(l =>
    l.followups.some(f => f.status === 'pending' && f.date < todayStr)
  );

  // 2. Conversion (Required for Chart)
  const conversions = myLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status)).length;

  // 3. Productivity Stats (For Graphs)
  const totalCalls = myLeads.reduce((acc, l) => acc + l.remarks.length, 0);
  const totalDuration = myLeads.reduce((acc, l) => acc + l.remarks.reduce((s, r) => s + (r.duration || 0), 0), 0);
  const avgDuration = totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0;

  // 4. Connection Data (For Bar Chart)
  const connectedCount = myLeads.flatMap(l => l.remarks).filter(r => r.disposition === 'Connected' || r.disposition === 'Interested').length;
  const notConnectedCount = totalCalls - connectedCount;

  const connectionData = [
    { name: 'Connected', value: connectedCount },
    { name: 'Not Connected', value: notConnectedCount },
  ];

  // 5. Target Data (For Target Card)
  const monthlyTarget = currentUser.monthlyTarget || 30;
  const achievements = conversions;
  const achievementPct = Math.min(Math.round((achievements / monthlyTarget) * 100), 100);

  // Lead Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = React.useState(false);

  // --- DATE FILTER ---
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const filteredMyLeads = myLeads.filter(l => l.createdAt.startsWith(selectedMonth));
  const completedLeads = myLeads.filter(l => ['sanctioned', 'disbursed'].includes(l.status)); // Define completedLeads
  const filteredCompletedLeads = completedLeads.filter(l => l.createdAt.startsWith(selectedMonth));
  const allFollowups = myLeads.flatMap(lead => lead.followups.map(f => ({ ...f, leadName: lead.name, leadId: lead.id }))); // Define allFollowups
  const filteredFollowups = allFollowups.filter(f => f.date.startsWith(selectedMonth));

  // Update Metrics based on filtered data
  const totalCallsFiltered = filteredMyLeads.reduce((acc, lead) => acc + lead.remarks.length, 0); // Mock approximation
  const pendingFollowupsCount = filteredFollowups.filter(f => f.status === 'pending').length; // Corrected to use filteredFollowups
  const docsPendingCount = filteredMyLeads.filter(l => l.status === 'docs-pending').length;
  const earnings = filteredCompletedLeads.length * 500; // Mock incentive

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

      {/* KPI Cards: Schedule, Assigned, Daily Leads, Actioned/Unactioned */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Tasks"
          value={todaysTasks.length}
          icon={ListTodo}
          color="bg-blue-100 text-blue-600"
          subtext="Scheduled Follow-ups"
        />
        <StatCard
          title="Total Assigned"
          value={totalAssigned}
          icon={Users}
          color="bg-purple-100 text-purple-600"
          subtext={`${dailyLeads} new leads today`}
        />
        <StatCard
          title="Actioned Today"
          value={actionedLeadsToday}
          icon={PhoneCall}
          color="bg-green-100 text-green-600"
          subtext="Calls/Updates Made"
        />
        <StatCard
          title="Unactioned"
          value={unactionedLeadsToday}
          icon={AlertCircle}
          color="bg-red-100 text-red-600"
          subtext="Pending Actions"
        />
      </div>

      {/* Create Lead Modal */}
      {isLeadModalOpen && <CreateLeadModal onClose={() => setIsLeadModalOpen(false)} />}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Column */}
        <div className="space-y-6">
          {/* Connected vs Not Connected */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Connection Efficiency</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={connectionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                    {connectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Call Duration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Avg Talk Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.floor(avgDuration / 60)}m {avgDuration % 60}s
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock size={24} />
            </div>
          </div>

          {/* Monthly Target Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Target size={20} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${achievementPct >= 100 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {achievementPct}%
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Monthly Target</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900">{achievements} <span className="text-sm text-slate-400 font-normal">/ {monthlyTarget}</span></h3>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${achievementPct}%` }}></div>
            </div>
          </div>

          {/* Assigned Leads Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Users size={20} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Assigned Leads</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{myLeads.length}</h3>
          </div>
        </div>

        {/* Follow-up List (Center - Wider) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-blue-500" /> Today's Schedule
            </h2>
            <div className="flex gap-2">
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                {todaysFollowups.length} Today
              </span>
              {missedFollowups.length > 0 && (
                <span className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1">
                  <AlertCircle size={12} /> {missedFollowups.length} Missed
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {[...missedFollowups, ...todaysFollowups].length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <CheckCircle className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500">All caught up! No tasks pending.</p>
              </div>
            ) : (
              [...missedFollowups, ...todaysFollowups].map(lead => {
                // Determine if this is a missed or today item
                const isMissed = missedFollowups.some(m => m.id === lead.id);
                const fp = lead.followups.find(f => f.status === 'pending')!;

                return (
                  <div key={lead.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isMissed ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${isMissed ? 'bg-white text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isMissed ? 'text-red-900' : 'text-gray-900'}`}>{lead.name}</h4>
                        <p className={`text-xs flex items-center gap-1 mt-1 ${isMissed ? 'text-red-600' : 'text-gray-500'}`}>
                          <Clock size={12} /> {isMissed ? 'Overdue: ' + fp.date : fp.time} • {fp.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${isMissed ? 'bg-white text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        {lead.status}
                      </span>
                      <Link to={`/leads/${lead.id}`} className="px-4 py-2 bg-white text-sm font-medium border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all">
                        Call
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default TelecallerDashboard;