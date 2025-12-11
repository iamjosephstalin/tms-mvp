import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('priya@tms.com');
  const [password, setPassword] = useState('admin123');
  const { login, currentUser } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">D</div>
            <span className="text-xl font-bold tracking-tight">DialFi Enterprise</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Secure Telecalling & Loan Processing System</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Manage leads, track sanctions, and streamline document collection with our banking-grade CRM tailored for high-volume operations.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <span>© 2024 FinTech Corp</span>
          <span>•</span>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Support</span>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500">Sign in to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium text-slate-900"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium text-slate-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary h-10 text-base"
            >
              Sign In <ArrowRight size={18} className="ml-2" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Access Profiles (TN)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => { setEmail('vikram@tms.com'); setPassword('admin123') }} className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
                <span className="block text-xs text-slate-500 mb-1">Super Admin</span>
                <span className="block font-semibold text-slate-900 group-hover:text-blue-700 text-sm">Vikram M.</span>
              </button>
              <button onClick={() => { setEmail('priya@tms.com'); setPassword('admin123') }} className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
                <span className="block text-xs text-slate-500 mb-1">Team Lead</span>
                <span className="block font-semibold text-slate-900 group-hover:text-blue-700 text-sm">Priya Sundar</span>
              </button>
              <button onClick={() => { setEmail('karthik@tms.com'); setPassword('user123') }} className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
                <span className="block text-xs text-slate-500 mb-1">Telecaller</span>
                <span className="block font-semibold text-slate-900 group-hover:text-blue-700 text-sm">Karthik Raja</span>
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 justify-center text-xs text-slate-400 bg-slate-50 py-2 rounded-full">
              <ShieldCheck size={14} /> 256-bit Bank Grade Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;