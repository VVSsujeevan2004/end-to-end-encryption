import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Fingerprint } from 'lucide-react';
import { type User as UserType, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'agent' | 'user2'>('agent');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay and auth check
    setTimeout(() => {
      if (password === 'password') { // Mock password check
        const user: UserType = selectedRole === 'agent' 
          ? {
              id: 'user-001',
              username: 'agent.smith',
              role: UserRole.USER,
              avatar: 'https://picsum.photos/id/1005/40/40',
            }
          : {
              id: 'user-002',
              username: 'user2.agent',
              role: UserRole.USER,
              avatar: 'https://picsum.photos/id/1025/40/40',
            };
        onLogin(user);
      } else {
        setError('Invalid credentials');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 relative">
        <div className="p-8 border-b border-slate-800 bg-slate-900/50">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-900/50">
              <Shield size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">SecureTrace E2EE</h1>
          <p className="text-center text-slate-400 text-sm">Forensic-Grade Secure Communication</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">Select Identity</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('agent')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  selectedRole === 'agent'
                    ? 'bg-indigo-600/10 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">AS</div>
                <span className="text-xs font-medium">Agent Smith</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('user2')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  selectedRole === 'user2'
                    ? 'bg-indigo-600/10 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">U2</div>
                <span className="text-xs font-medium">User 2 Agent</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Access Key (Password)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter 'password'"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded border border-red-900/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
          
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
              <Fingerprint size={12} />
              Biometric Handshake Required
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;