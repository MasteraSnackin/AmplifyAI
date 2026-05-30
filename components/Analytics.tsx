import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowLeft, Users, MousePointer2, Share2, TrendingUp, Briefcase, DollarSign, Eye } from 'lucide-react';
import { MarketingStrategy } from '../types';

interface AnalyticsProps {
  onBack: () => void;
  strategy?: MarketingStrategy;
}

const engagementData = [
  { name: 'Mon', twitter: 400, linkedin: 240, instagram: 240 },
  { name: 'Tue', twitter: 300, linkedin: 139, instagram: 221 },
  { name: 'Wed', twitter: 200, linkedin: 980, instagram: 229 },
  { name: 'Thu', twitter: 278, linkedin: 390, instagram: 200 },
  { name: 'Fri', twitter: 189, linkedin: 480, instagram: 218 },
  { name: 'Sat', twitter: 239, linkedin: 380, instagram: 250 },
  { name: 'Sun', twitter: 349, linkedin: 430, instagram: 210 },
];

const generateGrowthData = (goalType: string) => [
  { name: 'Week 1', value: 120 },
  { name: 'Week 2', value: 230 },
  { name: 'Week 3', value: 450 },
  { name: 'Week 4', value: 580 },
];

export const Analytics: React.FC<AnalyticsProps> = ({ onBack, strategy }) => {
  
  // Determine metric labels based on Strategy Goal
  const getGoalMetrics = () => {
    const goal = strategy?.campaignGoal.toLowerCase() || 'engagement';
    
    if (goal.includes('hiring') || goal.includes('recruit')) {
      return { label: 'Applications', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' };
    }
    if (goal.includes('sales') || goal.includes('revenue') || goal.includes('conversion')) {
      return { label: 'Sales Conversions', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    }
    if (goal.includes('awareness') || goal.includes('reach') || goal.includes('brand')) {
      return { label: 'Brand Impressions', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
    return { label: 'Quiz Completions', icon: MousePointer2, color: 'text-indigo-600', bg: 'bg-indigo-50' };
  };

  const primaryMetric = getGoalMetrics();
  const growthData = generateGrowthData(primaryMetric.label);

  return (
    <div className="max-w-5xl mx-auto mt-8 pb-12 px-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Strategy
      </button>

      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
               {strategy?.campaignGoal || 'General'} Campaign
             </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Performance Tracking</h2>
          <p className="text-slate-500 mt-1">Real-time metrics for <span className="font-semibold text-slate-700">{strategy?.targetAudience || 'Target Audience'}</span></p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Impressions" value="12.5k" change="+14%" icon={Users} color="text-slate-600" bg="bg-slate-100" />
        {/* Dynamic Primary Metric Card */}
        <StatCard 
          title={primaryMetric.label} 
          value="843" 
          change="+22%" 
          icon={primaryMetric.icon} 
          color={primaryMetric.color} 
          bg={primaryMetric.bg} 
        />
        <StatCard title="Viral Reach" value="45%" change="+5%" icon={TrendingUp} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Social Shares" value="129" change="+18%" icon={Share2} color="text-pink-600" bg="bg-pink-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-6">Engagement by Platform</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="twitter" fill="#0ea5e9" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="linkedin" fill="#1d4ed8" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="instagram" fill="#db2777" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-6">{primaryMetric.label} Velocity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<any> = ({ title, value, change, icon: Icon, color, bg }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{change}</span>
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-sm text-slate-500">{title}</div>
  </div>
);
