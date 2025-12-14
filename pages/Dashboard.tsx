import React, { useEffect, useState } from 'react';
import { MockBackend } from '../services/mockBackend';
import { SecurityLog, BiometricMetrics } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sliders, AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState({ attempts: 0, blocks: 0, attacks: 0 });
  const [metrics, setMetrics] = useState<BiometricMetrics>(MockBackend.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentLogs = MockBackend.getLogs();
      setLogs(currentLogs);
      setMetrics(MockBackend.getMetrics());
      
      const attempts = currentLogs.filter(l => l.eventType.includes('AUTH')).length;
      const blocks = currentLogs.filter(l => l.eventType === 'AUTH_FAILURE').length;
      const attacks = currentLogs.filter(l => l.eventType === 'ATTACK_DETECTED' || l.eventType === 'SYSTEM_ALERT').length;
      
      setStats({ attempts, blocks, attacks });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    MockBackend.setThreshold(newVal);
    // Force immediate update
    setMetrics(MockBackend.getMetrics());
  };

  const chartData = [
    { name: 'Total Auth', value: stats.attempts },
    { name: 'Failures', value: stats.blocks },
    { name: 'Threats', value: stats.attacks },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <h3 className="text-zinc-500 text-sm font-medium">Total Authentications (Last Hour)</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats.attempts}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <h3 className="text-zinc-500 text-sm font-medium">Access Denied</h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.blocks}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <h3 className="text-zinc-500 text-sm font-medium">Active Threats Detected</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">{stats.attacks}</p>
        </div>
      </div>

      {/* Biometric Calibration & Performance Panel */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
         <div className="flex items-center mb-6">
            <Sliders className="text-blue-500 mr-2" />
            <h2 className="text-lg font-bold text-zinc-200">Biometric Engine Calibration</h2>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-zinc-400">
                    Matching Threshold: <span className="text-blue-400">{(metrics.threshold * 100).toFixed(0)}%</span>
                </label>
                <input 
                    type="range" 
                    min="0.50" 
                    max="0.99" 
                    step="0.01" 
                    value={metrics.threshold}
                    onChange={handleThresholdChange}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-zinc-500 italic leading-relaxed">
                   Higher threshold increases security (Lower FAR) but may cause inconvenience (Higher FRR). 
                   Lower threshold improves convenience but increases risk of spoofing.
                </p>
            </div>

            {/* FAR Metric */}
            <div className="bg-zinc-950 p-4 rounded border border-zinc-800 relative group cursor-help transition-all hover:border-zinc-600">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">False Acceptance Rate (FAR)</h4>
                    <HelpCircle size={14} className="text-zinc-600" />
                </div>
                <div className="text-2xl font-mono font-bold text-red-400">{metrics.far}%</div>
                <div className="text-xs text-zinc-600 mt-2">
                   Attackers successfully authenticated. 
                   <br/>Count: {metrics.falseAccepts}
                </div>
                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 p-3 w-64 bg-zinc-800 text-zinc-200 text-xs rounded shadow-xl border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                   <strong>Security Risk:</strong> The probability that the system incorrectly authorizes a non-authorized person. Ideally 0%.
                </div>
            </div>

            {/* FRR Metric */}
            <div className="bg-zinc-950 p-4 rounded border border-zinc-800 relative group cursor-help transition-all hover:border-zinc-600">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">False Rejection Rate (FRR)</h4>
                    <HelpCircle size={14} className="text-zinc-600" />
                </div>
                <div className="text-2xl font-mono font-bold text-orange-400">{metrics.frr}%</div>
                <div className="text-xs text-zinc-600 mt-2">
                   Valid users denied access.
                   <br/>Count: {metrics.falseRejects}
                </div>
                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 p-3 w-64 bg-zinc-800 text-zinc-200 text-xs rounded shadow-xl border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                   <strong>Usability Risk:</strong> The probability that the system fails to identify a valid user. High FRR frustrates users.
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg h-[300px]">
          <h3 className="text-zinc-400 text-sm mb-4">Security Metrics</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#eab308' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Logs Table */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg h-[300px] overflow-hidden flex flex-col">
          <h3 className="text-zinc-400 text-sm mb-4">Live Security Stream</h3>
          <div className="overflow-y-auto flex-1 space-y-2 pr-2">
            {logs.map((log) => (
              <div key={log.id} className="text-xs border-b border-zinc-800/50 pb-2 mb-2 last:border-0">
                <div className="flex justify-between text-zinc-500 mb-1">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`
                    ${log.eventType === 'CONFIG_CHANGE' ? 'text-blue-400' : ''}
                    ${log.severity === 'CRITICAL' ? 'text-red-500' : log.severity === 'WARNING' ? 'text-yellow-500' : 'text-emerald-500'}
                  `}>
                    {log.eventType}
                  </span>
                </div>
                <div className="text-zinc-300 font-mono truncate">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;