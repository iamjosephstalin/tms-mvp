import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Phone, Server, Shield } from 'lucide-react';

const Settings = () => {
    const { currentUser } = useApp();
    const [apiKey, setApiKey] = useState('sk_live_51M...');
    const [recordingRetention, setRecordingRetention] = useState('90');
    const [autoAssignment, setAutoAssignment] = useState(true);

    if (currentUser?.role !== 'superadmin') {
        return (
            <div className="p-8 text-center text-red-600">
                Access Denied. Super Admin only.
            </div>
        );
    }

    const handleSave = () => {
        alert("Settings saved successfully!");
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>

            <div className="space-y-6">
                {/* Telephony Integration */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Phone size={20} className="text-blue-600" /> Telephony Integration
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API Key (Exotel/Twilio)</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="call_recording"
                                checked={true}
                                readOnly
                                className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor="call_recording" className="text-sm text-gray-700">Enable Call Recording</label>
                        </div>
                    </div>
                </div>

                {/* Data & Security */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-blue-600" /> Data & Security
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recording Retention (Days)</label>
                            <select
                                value={recordingRetention}
                                onChange={(e) => setRecordingRetention(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="30">30 Days</option>
                                <option value="60">60 Days</option>
                                <option value="90">90 Days</option>
                                <option value="365">1 Year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Workflow */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Server size={20} className="text-blue-600" /> Workflow Automation
                    </h2>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Auto-Assign New Leads</p>
                            <p className="text-xs text-gray-500">Automatically distribute web leads to available agents.</p>
                        </div>
                        <button
                            onClick={() => setAutoAssignment(!autoAssignment)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${autoAssignment ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoAssignment ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-800 shadow-md"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
