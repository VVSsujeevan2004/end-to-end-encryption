import React, { useState } from 'react';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Login from './components/Login';
import { type User, type ForensicLog, LogEventType } from './types';
import { Shield, MessageSquare, Activity, Settings as SettingsIcon, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import * as CryptoService from './services/crypto';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'chat' | 'dashboard' | 'settings'>('chat');
  const [logs, setLogs] = useState<ForensicLog[]>([]);
  const [suspiciousKeywords, setSuspiciousKeywords] = useState<string[]>(['leak', 'hack', 'password', 'bribe', 'confidential', 'off the record']);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Centralized Logging Logic
  // Accepts an optional userId override, otherwise uses the current state user
  const handleLogEvent = async (type: LogEventType, metadata: any, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO', userIdOverride?: string) => {
    const targetUserId = userIdOverride || user?.id || 'unknown';
    
    // Generate a secure hash for the log entry to ensure chain of custody
    const payload = JSON.stringify({ type, metadata, timestamp: Date.now(), userId: targetUserId });
    const logHash = await CryptoService.hashData(payload);

    const newLog: ForensicLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userId: targetUserId,
      eventType: type,
      metadata,
      severity,
      hash: logHash
    };

    setLogs(prev => [...prev, newLog]);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    handleLogEvent(LogEventType.LOGIN, { method: 'PASSWORD', status: 'SUCCESS' }, 'INFO', loggedInUser.id);
  };

  const handleLogout = () => {
    if (user) {
      handleLogEvent(LogEventType.LOGOUT, { status: 'SUCCESS' }, 'INFO');
    }
    setUser(null);
    setActiveView('chat'); // Reset view for next login
    setIsSidebarExpanded(false);
  };

  const addKeyword = (keyword: string) => {
    setSuspiciousKeywords(prev => [...prev, keyword]);
    handleLogEvent(LogEventType.ANOMALY_DETECTED, { action: 'DLP_RULE_ADDED', keyword }, 'INFO');
  };

  const removeKeyword = (keyword: string) => {
    setSuspiciousKeywords(prev => prev.filter(k => k !== keyword));
    handleLogEvent(LogEventType.ANOMALY_DETECTED, { action: 'DLP_RULE_REMOVED', keyword }, 'WARNING');
  };

  // If not authenticated, show Login Screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Authenticated Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden relative">
      {/* Sidebar Navigation */}
      <nav className={`
        bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300 z-50
        ${isSidebarExpanded ? 'w-64 absolute lg:relative h-full shadow-2xl' : 'w-20 relative'}
      `}>
        <div>
          <div className="h-16 flex items-center px-4 border-b border-slate-800">
            {/* Header Content Wrapper */}
            <div className="w-full flex items-center justify-between">
              
              {/* 1. Collapsed State: Show Hamburger (Visible on all screens when collapsed) */}
              <div className={`w-full flex justify-center ${isSidebarExpanded ? 'hidden' : 'block'}`}>
                 <button 
                  onClick={() => setIsSidebarExpanded(true)}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-900"
                  title="Expand Menu"
                >
                  <Menu size={24} />
                </button>
              </div>

              {/* 2. Expanded State: Show Logo & Title & Close Button */}
              <div className={`flex items-center justify-between w-full ${!isSidebarExpanded && 'hidden'}`}>
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/50 shrink-0">
                    <Shield size={20} className="text-white" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-white truncate">SecureTrace</span>
                </div>
                
                {/* Close Button (Visible on all screens when expanded) */}
                <button 
                  onClick={() => setIsSidebarExpanded(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded"
                  title="Collapse Menu"
                >
                  {/* Show X on mobile, Chevron on Desktop for better UX */}
                  <span className="lg:hidden"><X size={20} /></span>
                  <span className="hidden lg:block"><ChevronLeft size={20} /></span>
                </button>
              </div>

            </div>
          </div>

          <div className="p-4 space-y-2">
            <button
              onClick={() => { setActiveView('chat'); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeView === 'chat' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
              title="Secure Chat"
            >
              <MessageSquare size={20} className="shrink-0" />
              <span className={`font-medium whitespace-nowrap ${isSidebarExpanded ? 'block' : 'hidden'}`}>Secure Chat</span>
            </button>
            <button
              onClick={() => { setActiveView('dashboard'); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeView === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
              title="Forensics"
            >
              <Activity size={20} className="shrink-0" />
              <span className={`font-medium whitespace-nowrap ${isSidebarExpanded ? 'block' : 'hidden'}`}>Forensics</span>
            </button>
             <button
              onClick={() => { setActiveView('settings'); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeView === 'settings' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
              title="Configuration"
            >
              <SettingsIcon size={20} className="shrink-0" />
              <span className={`font-medium whitespace-nowrap ${isSidebarExpanded ? 'block' : 'hidden'}`}>Configuration</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
               {user.username.substring(0, 2).toUpperCase()}
             </div>
             <div className={`overflow-hidden ${isSidebarExpanded ? 'block' : 'hidden'}`}>
               <p className="text-sm font-medium text-white truncate">{user.username}</p>
               <p className="text-xs text-slate-500 truncate">ID: {user.id}</p>
             </div>
             <button 
               onClick={handleLogout}
               className={`ml-auto text-slate-500 hover:text-white ${isSidebarExpanded ? 'block' : 'hidden'}`}
               title="Logout"
             >
               <LogOut size={16} />
             </button>
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {/* Overlay for mobile when menu is open */}
      {isSidebarExpanded && (
        <div 
          className="absolute inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}

      <main className="flex-1 p-4 lg:p-6 overflow-hidden h-screen w-full">
        {activeView === 'chat' ? (
          <Chat 
            currentUser={user} 
            onLogEvent={handleLogEvent} 
            suspiciousKeywords={suspiciousKeywords} 
          />
        ) : activeView === 'dashboard' ? (
          <Dashboard logs={logs} />
        ) : (
          <Settings 
            keywords={suspiciousKeywords} 
            onAdd={addKeyword} 
            onRemove={removeKeyword} 
          />
        )}
      </main>
    </div>
  );
};

export default App;