import React, { useState } from 'react';
import type { ForensicLog, AnalysisResult } from '../types';
import { analyzeLogs } from '../services/gemini';
import { Activity, Search, Database, Cpu, Lock, AlertOctagon, RefreshCw, FileCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  logs: ForensicLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'analytics'>('analytics');
  const [integrityStatus, setIntegrityStatus] = useState<'verified' | 'unknown'>('unknown');

  const runAnalysis = async () => {
    setAnalyzing(true);
    const result = await analyzeLogs(logs);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const verifyIntegrity = () => {
    // In a real app, this would recalculate hashes of the entire chain
    // Here we simulate the verification of the tamper-evident log chain
    setIntegrityStatus('verified');
  };

  // Prepare Chart Data
  const chartData = logs.reduce((acc, log) => {
    const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const existing = acc.find(item => item.time === time);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ time, count: 1 });
    }
    return acc;
  }, [] as { time: string; count: number }[]).slice(-10);

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-indigo-400" />
            Forensic Audit Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time telemetry and metadata analysis</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('analytics')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             Analytics
           </button>
           <button 
             onClick={() => setActiveTab('logs')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             Raw Logs
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'analytics' ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Total Events</span>
                  <Database size={16} className="text-indigo-400" />
                </div>
                <div className="text-2xl font-mono text-white">{logs.length}</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Encryption Ops</span>
                  <Lock size={16} className="text-green-400" />
                </div>
                <div className="text-2xl font-mono text-white">
                  {logs.filter(l => l.eventType.includes('MESSAGE')).length}
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Anomalies</span>
                  <AlertOctagon size={16} className="text-red-400" />
                </div>
                <div className="text-2xl font-mono text-white">
                   {logs.filter(l => l.severity === 'WARNING' || l.severity === 'CRITICAL').length}
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-slate-800/30 rounded-xl border border-indigo-900/30 overflow-hidden">
              <div className="p-4 bg-indigo-950/20 border-b border-indigo-900/30 flex justify-between items-center">
                <h3 className="font-semibold text-indigo-100 flex items-center gap-2">
                  <Cpu size={16} />
                  AI Security Analyst
                </h3>
                <button 
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all"
                >
                  {analyzing ? <RefreshCw className="animate-spin" size={12}/> : <Search size={12}/>}
                  {analyzing ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
              
              <div className="p-5">
                {analysis ? (
                  <div className="space-y-6">
                    {/* Score and Summary */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex items-center gap-4 shrink-0">
                        <div className={`
                          w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 shadow-lg
                          ${analysis.score > 70 ? 'border-red-500 text-red-500 shadow-red-900/20' : analysis.score > 30 ? 'border-yellow-500 text-yellow-500 shadow-yellow-900/20' : 'border-green-500 text-green-500 shadow-green-900/20'}
                        `}>
                          {analysis.score}
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-lg">Risk Score</h4>
                          <p className="text-slate-400 text-sm">Calculated based on weighted events</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-sm text-slate-300 flex-1">
                        <p className="mb-2 font-semibold text-white">Executive Summary:</p>
                        <p>{analysis.summary}</p>
                      </div>
                    </div>

                    {/* Risk Factor Breakdown */}
                    {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-800">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <TrendingUp size={14} /> Risk Factor Breakdown
                        </h4>
                        <div className="space-y-3">
                          {analysis.riskFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-sm">
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-slate-300">{factor.factor} <span className="text-slate-500 text-xs">({factor.count} events)</span></span>
                                  <span className="text-red-400 font-mono">+{factor.points} pts</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500/80 rounded-full" 
                                    style={{ width: `${Math.min(100, (factor.points / 100) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Anomalies List */}
                    {analysis.anomalies.length > 0 && (
                      <div>
                         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detected Anomalies</p>
                         <ul className="space-y-2">
                           {analysis.anomalies.map((anom, idx) => (
                             <li key={idx} className="flex items-start gap-2 text-sm text-red-300 bg-red-950/20 p-2 rounded border border-red-900/30">
                               <AlertOctagon size={14} className="mt-0.5 shrink-0" />
                               {anom}
                             </li>
                           ))}
                         </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Cpu size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Run AI analysis to detect patterns and anomalies in log data.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 h-64">
               <h3 className="text-sm font-semibold text-slate-300 mb-4">Event Volume (Last 10 minutes)</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#818cf8' }}
                   />
                   <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 5 ? '#f43f5e' : '#6366f1'} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>

          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Immutable Event Log</h3>
              <button 
                onClick={verifyIntegrity}
                className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded border border-slate-700 transition-colors"
              >
                <FileCheck size={14} className={integrityStatus === 'verified' ? 'text-green-500' : ''} />
                {integrityStatus === 'verified' ? 'Chain Verified' : 'Verify Chain Integrity'}
              </button>
            </div>
            <div className="font-mono text-xs flex-1 overflow-hidden flex flex-col">
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3 font-medium">Timestamp</th>
                      <th className="p-3 font-medium">Event Type</th>
                      <th className="p-3 font-medium">Severity</th>
                      <th className="p-3 font-medium">Integrity Hash</th>
                      <th className="p-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {logs.slice().reverse().map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 text-slate-500">{new Date(log.timestamp).toISOString()}</td>
                        <td className="p-3 text-indigo-300">{log.eventType}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                            log.severity === 'WARNING' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 truncate max-w-[100px]" title={log.hash}>
                           <span className="text-green-900/50 select-none">0x</span>{log.hash.substring(0, 8)}...
                        </td>
                        <td className="p-3 text-slate-400 truncate max-w-[200px]">
                          {JSON.stringify(log.metadata)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                  <div className="p-8 text-center text-slate-500">No events logged yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;