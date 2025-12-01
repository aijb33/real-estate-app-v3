
import React from 'react';
import { LayoutDashboard, Image as ImageIcon, Settings, User as UserIcon, Zap, LogOut, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  currentView: 'dashboard' | 'project' | 'editor';
  onNavigate: (view: 'dashboard' | 'project' | 'editor') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, currentView, onNavigate }) => {
  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-slate-950 border-r border-slate-800 fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="p-6 flex items-center space-x-3">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white">
                <path d="M3 21h18M5 21v-7l8-6 8 6v7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <div>
            <h1 className="text-xl font-bold text-white tracking-tight">One Roof</h1>
            <p className="text-xs text-slate-500">AI Design Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
        </div>
        
        <button 
          onClick={() => onNavigate('editor')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left
            ${currentView === 'editor' && !user /* Hack: logic handled in parent */
              ? 'bg-blue-500/10 text-cyan-400 border border-blue-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <ImageIcon size={18} />
          <span className="font-medium">Virtual Staging</span>
        </button>

        <button 
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left
            ${currentView === 'dashboard' || currentView === 'project'
              ? 'bg-blue-500/10 text-cyan-400 border border-blue-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <LayoutDashboard size={18} />
          <span className="font-medium">Projects</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors text-left">
          <Settings size={18} />
          <span className="font-medium">Settings</span>
        </button>
      </nav>

      {/* Credits Card */}
      <div className="px-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={48} className="text-cyan-500" />
            </div>
            <div className="flex items-center space-x-2 mb-2 text-cyan-400">
                <Zap size={16} fill="currentColor" />
                <span className="text-xs font-bold uppercase tracking-wider">Premium Plan</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">2,450</div>
            <div className="text-xs text-slate-400">Credits remaining</div>
            <button className="mt-3 w-full py-1.5 text-xs font-medium text-white bg-slate-700 hover:bg-slate-600 rounded transition-colors">
                Top up credits
            </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center w-full space-x-3 mb-3 p-2 rounded-lg transition-colors">
            <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                <UserIcon size={16} className="text-slate-300"/>
            </div>
            <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name || 'Agent'}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email || 'Pro Plan'}</div>
            </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center justify-center w-full space-x-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
