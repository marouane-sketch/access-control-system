import React, { useState, useEffect } from 'react';
import { MockBackend } from '../services/mockBackend';
import { SecurityLog } from '../types';
import { Activity, Download, Search, Filter, AlertTriangle, Shield, AlertOctagon, Info, ChevronDown, ChevronRight } from 'lucide-react';

const SecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>(MockBackend.getLogs());
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Auto-refresh logs every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(MockBackend.getLogs());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredLogs = logs.filter(log => {
    const matchesSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;
    const matchesType = filterType === 'ALL' || log.eventType === filterType;
    const matchesSearch = 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.sourceIp.includes(searchTerm) ||
        (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSeverity && matchesType && matchesSearch;
  });

  // Export to CSV
  const handleExport = () => {
    const headers = ['Timestamp', 'Severity', 'Event Type', 'User', 'IP Address', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        `"${log.timestamp}"`,
        `"${log.severity}"`,
        `"${log.eventType}"`,
        `"${log.username || 'N/A'}"`,
        `"${log.sourceIp}"`,
        `"${log.details.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_logs_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
        case 'CRITICAL': return <AlertOctagon size={16} className="text-red-500" />;
        case 'WARNING': return <AlertTriangle size={16} className="text-yellow-500" />;
        default: return <Info size={16} className="text-emerald-500" />;
    }
  };

  const toggleRow = (id: string) => {
      setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
         <div className="flex items-center text-zinc-100">
            <Activity className="mr-3 text-emerald-500" />
            <div>
                <h2 className="text-lg font-bold">Security Operations Center</h2>
                <p className="text-xs text-zinc-500">Live Incident Stream & Audit Trail</p>
            </div>
         </div>
         
         <div className="flex items-center space-x-3">
             <button 
                onClick={() => setLogs(MockBackend.getLogs())}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded flex items-center border border-zinc-700"
             >
                Refresh
             </button>
             <button 
                onClick={handleExport}
                className="text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-800 px-3 py-2 rounded flex items-center transition-colors"
             >
                <Download size={14} className="mr-2" />
                Export CSV
             </button>
         </div>
      </div>

      {/* Toolbar & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 mb-4">
          
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs text-zinc-500">
              <div className="flex items-center"><Info size={12} className="text-emerald-500 mr-1" /> Info</div>
              <div className="flex items-center"><AlertTriangle size={12} className="text-yellow-500 mr-1" /> Warning</div>
              <div className="flex items-center"><AlertOctagon size={12} className="text-red-500 mr-1" /> Critical</div>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 bg-zinc-950 border border-zinc-700 rounded pl-9 pr-4 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
            </div>
            <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 focus:border-emerald-500 appearance-none outline-none"
            >
                <option value="ALL">Severity: All</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
            </select>
          </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-zinc-800 rounded bg-zinc-950/50">
        <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0 z-10 border-b border-zinc-800">
            <tr>
                <th className="p-3 w-10"></th>
                <th className="p-3 w-10"></th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">User</th>
                <th className="p-3">Source IP</th>
                <th className="p-3">Details</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-mono text-xs">
            {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                    <React.Fragment key={log.id}>
                        <tr 
                            className={`hover:bg-zinc-800/50 transition-colors cursor-pointer ${expandedRow === log.id ? 'bg-zinc-800/30' : ''}`}
                            onClick={() => toggleRow(log.id)}
                        >
                            <td className="p-3 text-center">{getSeverityIcon(log.severity)}</td>
                            <td className="p-3 text-center">
                                {expandedRow === log.id ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                            </td>
                            <td className="p-3 text-zinc-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    log.eventType.includes('ATTACK') || log.eventType.includes('FAILURE') ? 'bg-red-900/20 border-red-900/50 text-red-400' :
                                    log.eventType.includes('SUCCESS') ? 'bg-green-900/20 border-green-900/50 text-green-400' :
                                    'bg-zinc-800 border-zinc-700 text-zinc-400'
                                }`}>
                                    {log.eventType}
                                </span>
                            </td>
                            <td className={`p-3 ${log.username ? 'text-zinc-300' : 'text-zinc-600 italic'}`}>
                                {log.username || '-'}
                            </td>
                            <td className="p-3 text-blue-400/80">{log.sourceIp}</td>
                            <td className="p-3 text-zinc-300 max-w-xs truncate" title={log.details}>
                                {log.details}
                            </td>
                        </tr>
                        {/* Expanded Details Row */}
                        {expandedRow === log.id && (
                            <tr className="bg-zinc-900/50">
                                <td colSpan={7} className="p-4 border-b border-zinc-800">
                                    <div className="bg-black border border-zinc-800 rounded p-3 text-zinc-400 font-mono text-xs whitespace-pre-wrap">
                                        <div className="flex justify-between text-zinc-600 mb-2 uppercase font-bold text-[10px]">
                                            <span>Full Log Record</span>
                                            <span>ID: {log.id}</span>
                                        </div>
                                        {JSON.stringify(log, null, 2)}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))
            ) : (
                <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-600">
                        No logs match current filters.
                    </td>
                </tr>
            )}
            </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-zinc-600 flex justify-between">
          <span>Total Records: {logs.length}</span>
          <span>Showing: {filteredLogs.length}</span>
      </div>
    </div>
  );
};

export default SecurityLogs;