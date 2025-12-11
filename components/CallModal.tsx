import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, User, Clock, Mic } from 'lucide-react';
import { DISPOSITIONS } from '../constants';
import { Lead } from '../types';

interface CallModalProps {
  lead: Lead;
  onClose: () => void;
  onComplete: (disposition: string, notes: string, duration: number) => void;
}

const CallModal: React.FC<CallModalProps> = ({ lead, onClose, onComplete }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Simulate connection time
    const connectTimer = setTimeout(() => {
      setStatus('connected');
      startTimer();
    }, 1500);

    return () => {
      clearTimeout(connectTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('ended');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Phone size={32} />
          </div>
          <h2 className="text-xl font-bold">{lead.name}</h2>
          <p className="text-slate-400">{lead.mobile}</p>
          <div className="mt-4 text-2xl font-mono font-medium text-blue-400">
            {status === 'connecting' ? 'Connecting...' : status === 'connected' ? formatTime(duration) : 'Call Ended'}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {status !== 'ended' ? (
            <div className="text-center">
              <p className="text-gray-500 mb-8">Calling via Secure VoIP...</p>
              <button 
                onClick={handleEndCall}
                className="bg-red-500 hover:bg-red-600 text-white w-full py-4 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Phone className="rotate-135" /> End Call
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Notes</label>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Enter remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disposition</label>
                <div className="grid grid-cols-2 gap-2">
                  {DISPOSITIONS.map(disp => (
                    <button
                      key={disp}
                      onClick={() => onComplete(disp, notes, duration)}
                      className="px-3 py-2 border rounded hover:bg-blue-50 hover:border-blue-500 text-sm transition-colors text-left"
                    >
                      {disp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
