import React, { useState } from 'react';
import { Settings as SettingsIcon, Plus, X, ShieldAlert } from 'lucide-react';

interface SettingsProps {
  keywords: string[];
  onAdd: (keyword: string) => void;
  onRemove: (keyword: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ keywords, onAdd, onRemove }) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      onAdd(newKeyword.trim().toLowerCase());
      setNewKeyword('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="text-indigo-400" />
            System Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage security policies and DLP rules</p>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-900/30 p-2 rounded-lg text-red-400">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">DLP Keywords</h3>
                <p className="text-slate-400 text-sm">Messages containing these terms will be flagged in forensic logs.</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter new keyword..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newKeyword.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {keywords.map(word => (
                <div key={word} className="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 group">
                  {word}
                  <button
                    onClick={() => onRemove(word)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;