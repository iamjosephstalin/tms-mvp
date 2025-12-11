import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtext, trend }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-start justify-between transition-all hover:-translate-y-1 hover:shadow-lg group">
      <div>
        <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{value}</h3>
        {subtext && (
          <p className={`text-xs font-medium flex items-center gap-1.5 mt-2 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-400'}`}>
            {trend === 'up' && '↑'} {trend === 'down' && '↓'} {subtext}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
    </div>
  );
};

export default StatCard;