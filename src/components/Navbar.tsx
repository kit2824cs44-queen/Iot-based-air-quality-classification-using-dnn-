/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  Cpu,
  Database,
  FileText,
  Info,
  Radio,
  Sliders,
  Play,
  Square,
  BarChart3,
  Flame,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'live'
  | 'classification'
  | 'history'
  | 'analytics'
  | 'devices'
  | 'model'
  | 'settings'
  | 'about';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  simulatorActive: boolean;
  onToggleSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  simulatorActive,
  onToggleSimulator,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'live', label: 'Live Monitoring', icon: <Radio className="w-4 h-4" /> },
    { id: 'classification', label: 'Classification', icon: <Flame className="w-4 h-4" /> },
    { id: 'history', label: 'Historical Data', icon: <Database className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'devices', label: 'IoT Devices', icon: <Cpu className="w-4 h-4" /> },
    { id: 'model', label: 'DNN Model', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-4 h-4" /> },
    { id: 'about', label: 'About Project', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block">
                AirSens<span className="text-emerald-400">DNN</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                IoT TELEMETRY · CPCB
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action (Simulator Toggle) & Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleSimulator}
              title={simulatorActive ? 'Pause IoT sensor simulator' : 'Start IoT sensor simulator'}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap border ${
                simulatorActive
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {simulatorActive ? (
                <>
                  <Square className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Sim Stream Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-slate-400 fill-slate-400" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2.5 ${
                activeTab === item.id
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
