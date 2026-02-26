import React, { useState } from 'react';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import { User, UserRole, ForensicLog, LogEventType } from './types';
import { Shield, MessageSquare, Activity, Settings, LogOut } from 'lucide-react';
import * as CryptoService from './services/crypto';

// Mock Current User
const CURRENT_USER: User = {
  id: 'user-001',
  username: 'agent.smith',
  role: UserRole.USER,
  avatar: 'https://picsum.photos/40/40',
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'dashboard' | 'settings'>('chat');
  const [logs, setLogs] = useState<ForensicLog[]>([]);

  // Centralized Logging Logic
  const handleLogEvent = async (type: LogEventType, metadata: any, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
    // Generate a secure hash for the log entry to ensure chain of custody
    const payload = JSON.stringify({ type, metadata, timestamp: Date.now(), userId: CURRENT_USER.id });
    const logHash = await CryptoService.hashData(payload);

    const newLog: ForensicLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userId: CURRENT_USER.id,
      eventType: type,
      metadata,
      severity,
      hash: logHash
    };

    setLogs(prev => [...prev, newLog]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/50">
                <Shield size={20} className="text-white" />
              </div>
              <span className="hidden lg:block font-bold text-lg tracking-tight text-white">SecureTrace</span>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <button
              onClick={() => setActiveView('chat')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeView === 'chat' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <MessageSquare size={20} />
              <span className="hidden lg:block font-medium">Secure Chat</span>
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeView === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Activity size={20} />
              <span className="hidden lg:block font-medium">Forensics</span>
            </button>
             <button
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-900 hover:text-white`}
            >
              <Settings size={20} />
              <span className="hidden lg:block font-medium">Configuration</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
               AS
             </div>
             <div className="hidden lg:block overflow-hidden">
               <p className="text-sm font-medium text-white truncate">Agent Smith</p>
               <p className="text-xs text-slate-500 truncate">ID: 884-21-X</p>
             </div>
             <button className="hidden lg:block ml-auto text-slate-500 hover:text-white">
               <LogOut size={16} />
             </button>
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden h-screen">
        {activeView === 'chat' ? (
          <Chat currentUser={CURRENT_USER} onLogEvent={handleLogEvent} />
        ) : activeView === 'dashboard' ? (
          <Dashboard logs={logs} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Settings Placeholder
          </div>
        )}
      </main>
    </div>
  );
};

export default App;