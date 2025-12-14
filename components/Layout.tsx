import React from 'react';
import { LayoutDashboard, ShieldAlert, Fingerprint, Activity, Server, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'access', label: 'Access Control', icon: Fingerprint },
    { id: 'attacks', label: 'Threat Sim', icon: ShieldAlert },
    { id: 'logs', label: 'Audit Logs', icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-zinc-800 flex flex-col bg-zinc-900/40 backdrop-blur-xl transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-800">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center shadow-lg shadow-emerald-900/20">
             <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <div className="ml-3 hidden lg:block">
            <h1 className="text-sm font-bold tracking-wider text-zinc-100">BIOSEC</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest">ENTERPRISE</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start lg:px-4 py-3 rounded-md transition-all duration-200 group ${
                  isActive 
                    ? 'bg-zinc-800/80 text-white border border-zinc-700/50 shadow-sm' 
                    : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                }`}
              >
                <Icon size={20} className={`transition-colors ${isActive ? 'text-emerald-500' : 'group-hover:text-zinc-300'}`} />
                <span className="ml-3 text-sm font-medium hidden lg:block">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 hidden lg:block shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800 hidden lg:block">
          <div className="flex items-center space-x-3 px-2">
            <div className="relative">
              <Server size={16} className="text-zinc-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse border-2 border-zinc-900"></div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-zinc-500">System Status</p>
              <p className="text-xs text-emerald-500 font-mono">OPERATIONAL</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950 relative">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/20 backdrop-blur-sm z-10">
          <div className="flex items-center text-xs text-zinc-500 space-x-2">
            <span>SECURE CONSOLE</span>
            <span>/</span>
            <span className="text-zinc-300 uppercase font-semibold">{activePage}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono text-zinc-500">{new Date().toLocaleDateString()}</span>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
               <span className="text-xs text-zinc-400">Admin Session</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-10 relative">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            <div className="relative z-10 max-w-7xl mx-auto h-full">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;