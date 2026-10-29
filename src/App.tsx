/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar.tsx';
import { DashboardView } from './pages/DashboardView.tsx';
import { LiveMonitoringView } from './pages/LiveMonitoringView.tsx';
import { ClassificationView } from './pages/ClassificationView.tsx';
import { HistoricalDataView } from './pages/HistoricalDataView.tsx';
import { AnalyticsReportsView } from './pages/AnalyticsReportsView.tsx';
import { IoTDevicesView } from './pages/IoTDevicesView.tsx';
import { DNNModelInfoView } from './pages/DNNModelInfoView.tsx';
import { SettingsView } from './pages/SettingsView.tsx';
import { AboutProjectView } from './pages/AboutProjectView.tsx';
import { fetchDashboardSummary, toggleSimulator } from './services/api.ts';
import { DashboardSummary } from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulatorActive, setSimulatorActive] = useState<boolean>(true);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
      setSimulatorActive(data.simulated_mode);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 4000);
    return () => clearInterval(interval);
  }, [loadSummary]);

  const handleToggleSimulator = async () => {
    try {
      const updated = await toggleSimulator();
      setSimulatorActive(updated.active);
      loadSummary();
    } catch (err) {
      console.error('Failed to toggle simulator:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        simulatorActive={simulatorActive}
        onToggleSimulator={handleToggleSimulator}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            loading={loading}
            onRefresh={loadSummary}
            onNavigateTab={setActiveTab}
          />
        )}
        {activeTab === 'live' && <LiveMonitoringView />}
        {activeTab === 'classification' && <ClassificationView />}
        {activeTab === 'history' && <HistoricalDataView />}
        {activeTab === 'analytics' && <AnalyticsReportsView />}
        {activeTab === 'devices' && <IoTDevicesView />}
        {activeTab === 'model' && <DNNModelInfoView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'about' && <AboutProjectView />}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">IoT Air Quality Classification System</span>
            <span>·</span>
            <span>Deep Neural Network (DNN) Model</span>
            <span>·</span>
            <span>CPCB NAQI Methodology</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>Academic Demonstration</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-emerald-400 underline transition-colors"
            >
              Project Documentation
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
