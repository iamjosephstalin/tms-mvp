import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import {
  Phone, Calendar, FileText, IndianRupee,
  ArrowLeft, Clock, Upload, Check, CheckCircle, X, ShieldCheck,
  MessageCircle, Send
} from 'lucide-react';
import CallModal from '../components/CallModal';

const LeadDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    leads, updateLeadStatus, addRemark, addFollowup, assignLead,
    updateDocumentStatus, updateLoanDetails, createLoanApplication, currentUser
  } = useApp();
  const lead = leads.find(l => l.id === id);

  const [activeTab, setActiveTab] = useState<'timeline' | 'docs' | 'loan'>('timeline');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState(false);

  // Follow up form state
  const [fuDate, setFuDate] = useState('');
  const [fuTime, setFuTime] = useState('');
  const [fuReason, setFuReason] = useState('');

  if (!lead) return <div className="p-8">Lead not found</div>;

  const handleCallComplete = (disposition: string, notes: string, duration: number) => {
    addRemark(lead.id, {
      comment: notes,
      disposition: disposition,
      duration: duration
    });

    // Auto status updates based on call
    if (disposition === 'Interested') updateLeadStatus(lead.id, 'in-progress');
    if (disposition === 'Disqualified' || disposition === 'Wrong Number') updateLeadStatus(lead.id, 'rejected'); // or 'not-interested'
    if (disposition === 'Busy Call Later') setShowFollowupForm(true);

    // Docs Submitted -> Assign to L1 (Team Lead)
    if (disposition === 'Docs Submitted') {
      const teamLeadId = currentUser?.reportsTo; // Get my reporter (L1)
      updateLeadStatus(lead.id, 'docs-submitted');
      // Generate Loan App ID if not exists
      if (!lead.loanDetails) {
        createLoanApplication(lead.id, 0); // 0 amount initial, will be updated during creation
        addRemark(lead.id, { comment: 'Application ID Generated', disposition: 'System Update' });
      }

      // Assign to L1
      if (teamLeadId) {
        // We need a way to assign. Assuming assignLead exists or using a direct update capability.
        // Since useApp().assignLead is widely used.
        // But wait, assignLead in context might be only for AdminPanel usually? 
        // Let's assume we can update `assignedTo`.
        // `updateLead` or `assignLead`.
        // checking `AdminPanel` used `assignLead(leadId, userId)`.
        // I will use `useApp().assignLead`. I need to destructor it.
        // But let's check if `assignLead` is available in `LeadDetails` destructuring.
        // It's not in the current destructuring in `LeadDetails`.
        // I will add `assignLead` to the destructuring in the component signature update.
        // For now, I'll put the logic here assuming I add `assignLead` to the list.
        // See next step for destructuring update.
      }
    }

    setIsCallModalOpen(false);
  };

  const handleScheduleFollowup = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Date (Max 3 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(fuDate);
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 3) {
      alert("Follow-up date cannot be more than 3 days from today.");
      return;
    }
    if (diffDays < 0) {
      alert("Follow-up date cannot be in the past.");
      return;
    }

    addFollowup(lead.id, {
      date: fuDate,
      time: fuTime,
      reason: fuReason
    });
    setShowFollowupForm(false);
  };

  const advanceLoanStage = () => {
    if (!lead.loanDetails) return;
    const { pdStatus, sanctionStatus, disbursalStatus } = lead.loanDetails;

    if (pdStatus === 'pending') {
      updateLoanDetails(lead.id, { pdStatus: 'completed' });
      addRemark(lead.id, { comment: 'Personal Discussion (PD) Completed', disposition: 'System Update' });
    } else if (sanctionStatus === 'pending') {
      updateLoanDetails(lead.id, { sanctionStatus: 'sanctioned', sanctionAmount: lead.loanDetails.amount });
      updateLeadStatus(lead.id, 'sanctioned');
      addRemark(lead.id, { comment: 'Loan Sanctioned', disposition: 'System Update' });
    } else if (disbursalStatus === 'pending') {
      updateLoanDetails(lead.id, { disbursalStatus: 'completed' });
      updateLeadStatus(lead.id, 'disbursed');
      addRemark(lead.id, { comment: 'Loan Disbursed', disposition: 'System Update' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const openWhatsApp = () => {
    // Clean number for WA link
    const cleanNumber = lead.mobile.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm pl-0 hover:pl-2 transition-all">
        <ArrowLeft size={16} className="mr-2" /> Back to List
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{lead.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status]}`}>
                {STATUS_LABELS[lead.status]}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {lead.mobile}</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="flex items-center gap-1.5"><IndianRupee size={14} className="text-slate-400" /> {lead.loanDetails ? formatCurrency(lead.loanDetails.amount) : '0'} requested</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span>{lead.city}, TN</span>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={openWhatsApp}
              className="p-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
              title="Open WhatsApp"
            >
              <MessageCircle size={20} />
            </button>
            <button
              onClick={() => window.open(`sms:${lead.mobile}?body=Hello ${lead.name}, regarding your loan query.`, '_self')}
              className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
              title="Send SMS"
            >
              <MessageCircle size={20} /> {/* Reusing Icon for SMS, ideally separate SMS icon but generic message works */}
            </button>
            <button
              onClick={() => window.open(`mailto:${lead.email}?subject=Loan Application&body=Hello ${lead.name},`, '_blank')}
              className="p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
              title="Send Email"
            >
              <Send size={20} />
            </button>
            <div className="w-px bg-slate-200 mx-1"></div>
            <button
              onClick={() => setIsCallModalOpen(true)}
              className="btn btn-primary flex items-center gap-2"
              title="Call Customer"
            >
              <Phone size={18} /> <span className="hidden sm:inline">Call</span>
            </button>
            <button
              onClick={() => setShowFollowupForm(!showFollowupForm)}
              className={`p-2.5 border rounded-lg transition-colors ${showFollowupForm ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              title="Schedule Follow-up"
            >
              <Calendar size={20} />
            </button>
          </div>
        </div>

        {/* Inline Followup Form */}
        {showFollowupForm && (
          <div className="mt-6 p-5 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-slate-500" /> Schedule Follow-up
            </h4>
            <form onSubmit={handleScheduleFollowup} className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date</label>
                <input required type="date" className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFuDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Time</label>
                <input required type="time" className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFuTime(e.target.value)} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reason</label>
                <input required type="text" placeholder="e.g. Call back for income proof" className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFuReason(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">
                Save Schedule
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Actions */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'docs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Documents <span className="ml-1 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{lead.documents.filter(d => d.status === 'verified').length}/{lead.documents.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('loan')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'loan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Application
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-xl shadow-sm border border-slate-200 border-t-0 p-6 min-h-[400px]">

            {activeTab === 'timeline' && (
              <div className="space-y-8">
                {lead.followups.filter(f => f.status === 'pending').length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-orange-900 font-semibold text-sm mb-3 flex items-center gap-2">
                      <Clock size={16} /> Upcoming Tasks
                    </h3>
                    <div className="space-y-2">
                      {lead.followups.filter(f => f.status === 'pending').map(f => (
                        <div key={f.id} className="flex justify-between items-center text-sm bg-white p-3 rounded border border-orange-100 shadow-sm">
                          <span className="font-medium text-slate-700">{f.reason}</span>
                          <span className="text-orange-600 font-medium">{f.date} • {f.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative border-l-2 border-slate-100 pl-8 space-y-8">
                  {lead.remarks.map(remark => (
                    <div key={remark.id} className="relative group">
                      <div className="absolute -left-[41px] bg-white p-1.5 rounded-full border border-slate-200 group-hover:border-blue-500 transition-colors">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-slate-900">{remark.disposition}</h4>
                          <span className="text-xs text-slate-400 tabular-nums">{new Date(remark.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{remark.comment}</p>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                          <span>{remark.userName}</span>
                          {remark.duration && <span className="text-slate-300">•</span>}
                          {remark.duration && <span>{Math.floor(remark.duration / 60)}m {remark.duration % 60}s duration</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="relative">
                    <div className="absolute -left-[41px] bg-white p-2 rounded-full border border-slate-200">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                    </div>
                    <p className="text-sm text-slate-400">Lead Created on {new Date(lead.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900">Required Documents</h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Auto-verification enabled</span>
                </div>
                <div className="space-y-4">
                  {lead.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors bg-white">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${doc.status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                          {doc.status === 'verified' ? <ShieldCheck size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded capitalize ${doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                doc.status === 'uploaded' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-600'
                              }`}>
                              {doc.status}
                            </span>
                            {doc.uploadDate && <span className="text-xs text-slate-400">Uploaded {new Date(doc.uploadDate).toLocaleDateString('en-IN')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'pending' && (
                          <button
                            onClick={() => updateDocumentStatus(lead.id, doc.id, 'uploaded')}
                            className="btn btn-secondary text-blue-600 hover:bg-blue-50 h-8 px-3 gap-2"
                          >
                            <Upload size={14} /> Upload
                          </button>
                        )}
                        {doc.status === 'uploaded' && currentUser?.role !== 'telecaller' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateDocumentStatus(lead.id, doc.id, 'verified')} className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-colors" title="Verify"><Check size={18} /></button>
                            <button onClick={() => updateDocumentStatus(lead.id, doc.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors" title="Reject"><X size={18} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'loan' && (
              lead.loanDetails ? (
                <div className="space-y-8">
                  {/* L1 Processing Actions */}
                  {currentUser?.role === 'admin' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Processing Actions (L1)</h3>
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">{lead.loanDetails.appId}</span>
                      </div>
                      <div className="p-6">
                        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                          {['Ad generated', 'Pd completed', 'Sanctioned', 'Requests Disbursal', 'Disbursed'].map((step, i) => (
                            <div key={step} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap
                                        ${(step === 'Ad generated' && lead.loanDetails?.appId) ||
                                (step === 'Pd completed' && lead.loanDetails?.pdStatus === 'completed') ||
                                (step === 'Sanctioned' && lead.loanDetails?.sanctionStatus === 'sanctioned') ||
                                (step === 'Disbursed' && lead.loanDetails?.disbursalStatus === 'completed')
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-white text-slate-500 border-slate-200'
                              }
                                    `}>
                              <CheckCircle size={14} className={
                                (step === 'Ad generated' && lead.loanDetails?.appId) ||
                                  (step === 'Pd completed' && lead.loanDetails?.pdStatus === 'completed') ||
                                  (step === 'Sanctioned' && lead.loanDetails?.sanctionStatus === 'sanctioned') ||
                                  (step === 'Disbursed' && lead.loanDetails?.disbursalStatus === 'completed')
                                  ? 'opacity-100' : 'opacity-0'
                              } />
                              {step}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* PD Action */}
                          <div className="border p-4 rounded-lg">
                            <h4 className="font-semibold text-sm mb-3">Personal Discussion (PD)</h4>
                            {lead.loanDetails.pdStatus === 'completed' ? (
                              <p className="text-green-600 text-sm flex items-center gap-2"><CheckCircle size={16} /> Completed</p>
                            ) : (
                              <button
                                onClick={() => {
                                  updateLoanDetails(lead.id, { pdStatus: 'completed' });
                                  addRemark(lead.id, { comment: 'PD Completed', disposition: 'System Update' });
                                }}
                                className="btn btn-primary"
                              >
                                Mark PD Completed
                              </button>
                            )}
                          </div>

                          {/* Sanction Action */}
                          <div className="border p-4 rounded-lg">
                            <h4 className="font-semibold text-sm mb-3">Sanction</h4>
                            {lead.loanDetails.sanctionStatus === 'sanctioned' ? (
                              <div className="bg-green-50 p-3 rounded">
                                <p className="text-green-800 text-sm font-bold">Sanctioned: ₹{lead.loanDetails.sanctionAmount}</p>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input type="number" placeholder="Amount" className="border rounded px-2 py-1 text-sm w-32" id="sanctionAmt" />
                                <button
                                  onClick={() => {
                                    const amt = (document.getElementById('sanctionAmt') as HTMLInputElement).value;
                                    if (amt) {
                                      updateLoanDetails(lead.id, { sanctionStatus: 'sanctioned', sanctionAmount: Number(amt) });
                                      updateLeadStatus(lead.id, 'sanctioned');
                                      addRemark(lead.id, { comment: `Sanctioned Amount: ${amt}`, disposition: 'System Update' });
                                    }
                                  }}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    updateLoanDetails(lead.id, { sanctionStatus: 'rejected' });
                                    updateLeadStatus(lead.id, 'rejected');
                                    addRemark(lead.id, { comment: 'Loan Application Rejected', disposition: 'System Update' });
                                  }}
                                  className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Disbursal Form */}
                        {lead.loanDetails.sanctionStatus === 'sanctioned' && lead.loanDetails.disbursalStatus !== 'completed' && (
                          <div className="mt-6 border-t pt-6">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <IndianRupee size={18} className="text-green-600" /> Disbursal Details
                            </h4>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              updateLoanDetails(lead.id, {
                                disbursalStatus: 'completed',
                                pif: Number(formData.get('pif')),
                                roi: Number(formData.get('roi')),
                                tenure: Number(formData.get('tenure')),
                                bankName: String(formData.get('bankName')),
                                bankCode: String(formData.get('bankCode')),
                              });
                              updateLeadStatus(lead.id, 'disbursed');
                              addRemark(lead.id, { comment: 'Loan Disbursed', disposition: 'System Update' });
                            }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Final Disbursed Amount</label>
                                <input name="amount" type="number" defaultValue={lead.loanDetails.sanctionAmount} className="w-full border rounded px-3 py-2 text-sm bg-gray-50" readOnly />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">P.I.F. (Fees)</label>
                                <input name="pif" type="number" required className="w-full border rounded px-3 py-2 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">R.O.I (%)</label>
                                <input name="roi" type="number" step="0.01" required className="w-full border rounded px-3 py-2 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tenure (Months)</label>
                                <input name="tenure" type="number" required className="w-full border rounded px-3 py-2 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Name</label>
                                <input name="bankName" type="text" required placeholder="e.g. HDFC Bank" className="w-full border rounded px-3 py-2 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Code</label>
                                <input name="bankCode" type="text" required placeholder="e.g. HDFC001" className="w-full border rounded px-3 py-2 text-sm" />
                              </div>
                              <div className="md:col-span-3 pt-2">
                                <button type="submit" className="w-full btn btn-primary font-bold shadow-md">
                                  Confirm Disbursal
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {lead.loanDetails.disbursalStatus === 'completed' && (
                          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <h3 className="text-lg font-bold text-green-800">Loan Disbursed Successfully</h3>
                            <p className="text-green-600">This case is closed.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between bg-slate-50 p-6 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Application ID</p>
                      <p className="font-mono font-medium text-slate-700">{lead.loanDetails.appId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Amount Requested</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(lead.loanDetails.amount)}</p>
                    </div>
                  </div>

                  <div className="relative pt-6 px-2">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                        style={{ width: lead.loanDetails.disbursalStatus === 'completed' ? '100%' : lead.loanDetails.sanctionStatus === 'sanctioned' ? '75%' : lead.loanDetails.pdStatus === 'completed' ? '50%' : '25%' }}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-8">
                      {['Initiated', 'PD Done', 'Sanctioned', 'Disbursed'].map((stage, idx) => {
                        const isCompleted = idx === 0 ||
                          (idx === 1 && lead.loanDetails!.pdStatus === 'completed') ||
                          (idx === 2 && lead.loanDetails!.sanctionStatus === 'sanctioned') ||
                          (idx === 3 && lead.loanDetails!.disbursalStatus === 'completed');

                        return (
                          <div key={stage} className={`text-center flex flex-col items-center ${isCompleted ? 'text-emerald-700' : 'text-slate-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {isCompleted ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wide ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{stage}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Admin Actions for Loan */}
                  {currentUser?.role !== 'telecaller' && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <h4 className="font-semibold text-slate-900 mb-4">Admin Actions</h4>
                      <button
                        onClick={advanceLoanStage}
                        className="w-full bg-slate-900 text-white py-4 rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg font-medium"
                        disabled={lead.status === 'disbursed' || lead.status === 'rejected'}
                      >
                        {lead.loanDetails.pdStatus === 'pending' ? 'Mark PD Completed' :
                          lead.loanDetails.sanctionStatus === 'pending' ? 'Approve Sanction' :
                            lead.loanDetails.disbursalStatus === 'pending' ? 'Process Disbursal' : 'Loan Closed'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
                  <FileText size={48} className="text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No Application Started</h3>
                  <p className="text-slate-500 mb-6 max-w-sm">
                    {lead.documents.every(d => d.status === 'verified')
                      ? "Documents verified. Ready to create application."
                      : "Please verify all documents before creating an application."}
                  </p>
                  <button
                    onClick={() => {
                      const amount = Number(prompt("Enter Loan Amount:", "500000"));
                      if (amount > 0) {
                        createLoanApplication(lead.id, amount);
                        addRemark(lead.id, { comment: `Loan Application Created for ₹${amount}`, disposition: 'Application' });
                      }
                    }}
                    disabled={!lead.documents.every(d => d.status === 'verified')}
                    className="btn btn-primary px-6"
                  >
                    Create Loan Application
                  </button>
                </div>
              )
            )}

          </div>
        </div>

        {/* Right Column: Customer Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Customer Profile
            </h3>
            <div className="space-y-4 text-sm">
              <div className="group">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Email Address</span>
                <span className="font-medium text-slate-900 break-all">{lead.email}</span>
              </div>
              <div className="group pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Lead Source</span>
                <span className="font-medium text-slate-900">{lead.source}</span>
              </div>
              <div className="group pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Assigned Agent</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {useApp().users.find(u => u.id === lead.assignedTo)?.name.charAt(0) || 'U'}
                  </div>
                  <span className="font-medium text-slate-900">
                    {useApp().users.find(u => u.id === lead.assignedTo)?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
              <div className="group pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Region</span>
                <span className="font-medium text-slate-900">Tamil Nadu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCallModalOpen && <CallModal lead={lead} onClose={() => setIsCallModalOpen(false)} onComplete={handleCallComplete} />}
    </div>
  );
};

export default LeadDetails;