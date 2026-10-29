/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Radio,
  RefreshCw,
  Save,
  Server,
  Sliders,
  Trash2,
} from 'lucide-react';
import { AQIStandard, SimulatorConfig, StoredSettings } from '../types/index.ts';
import {
  fetchHealth,
  fetchSettings,
  fetchSimulatorConfig,
  resetDatabase,
  updateSettings,
  updateSimulatorConfig,
} from '../services/api.ts';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<StoredSettings | null>(null);
  const [simConfig, setSimConfig] = useState<SimulatorConfig | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, sim, h] = await Promise.all([
        fetchSettings(),
        fetchSimulatorConfig(),
        fetchHealth(),
      ]);
      setSettings(s);
      setSimConfig(sim);
      setHealth(h);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !simConfig) return;
    try {
      await Promise.all([
        updateSettings(settings),
        updateSimulatorConfig(simConfig),
      ]);
      setSaveSuccess('Configuration updated and saved to persistent store.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to clear historical sensor readings?')) return;
    try {
      await resetDatabase();
      setResetSuccess('Historical database cleared.');
      setTimeout(() => setResetSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset database');
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-sm">Loading telemetry configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            System Preferences & Telemetry Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure AQI regulatory standards, simulation cadence, and persistence parameters
          </p>
        </div>

        {saveSuccess && (
          <div className="p-2 px-3 bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 rounded-lg text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Regulatory AQI Calculation Standard */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Regulatory AQI Standard Selection</h3>
          <p className="text-xs text-slate-400">
            Select the breakpoint index formula used to calculate sub-indices and compare against DNN classifications:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <label
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                settings?.aqi_standard === 'CPCB_INDIA'
                  ? 'bg-slate-800 border-emerald-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  name="aqi_standard"
                  checked={settings?.aqi_standard === 'CPCB_INDIA'}
                  onChange={() => setSettings({ ...settings!, aqi_standard: 'CPCB_INDIA' })}
                  className="accent-emerald-500"
                />
                <span className="font-semibold text-sm">CPCB National AQI (India)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed pl-5">
                Central Pollution Control Board 6-tier classification (Good, Satisfactory, Moderate, Poor, Very Poor, Severe). Mandates minimum 3 pollutants with particulate representation.
              </p>
            </label>

            <label
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                settings?.aqi_standard === 'US_EPA'
                  ? 'bg-slate-800 border-emerald-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  name="aqi_standard"
                  checked={settings?.aqi_standard === 'US_EPA'}
                  onChange={() => setSettings({ ...settings!, aqi_standard: 'US_EPA' })}
                  className="accent-emerald-500"
                />
                <span className="font-semibold text-sm">US EPA Air Quality Index</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed pl-5">
                United States Environmental Protection Agency formula standardized to equivalent 6 categories for comparative academic analysis.
              </p>
            </label>
          </div>
        </div>

        {/* Simulation Stream Settings */}
        {simConfig && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">IoT Sensor Simulator Cadence</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Telemetry Broadcast Interval (Seconds)</label>
                <select
                  value={simConfig.interval_seconds}
                  onChange={(e) => setSimConfig({ ...simConfig, interval_seconds: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded px-3 py-2 font-mono"
                >
                  <option value={1}>1 Second (High Frequency)</option>
                  <option value={2}>2 Seconds</option>
                  <option value={3}>3 Seconds (Recommended)</option>
                  <option value={5}>5 Seconds</option>
                  <option value={10}>10 Seconds</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Transducer Noise Emulation</label>
                <select
                  value={simConfig.noise_level}
                  onChange={(e) => setSimConfig({ ...simConfig, noise_level: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded px-3 py-2 font-mono"
                >
                  <option value="low">Low Noise (±5% drift)</option>
                  <option value="moderate">Moderate Noise (±12% drift)</option>
                  <option value="high">High Atmospheric Turbulence (±25% drift)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </form>

      {/* Backend & Persistence Diagnostics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Backend Service Runtime & Health
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block mb-0.5">API Server State:</span>
            <span className="text-emerald-400 font-mono font-semibold uppercase">{health?.status || 'Active'}</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block mb-0.5">Model Engine:</span>
            <span className="text-cyan-400 font-mono font-semibold">{health?.model_status || 'Trained'}</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block mb-0.5">Local Port & Transport:</span>
            <span className="text-white font-mono">Port 3000 (HTTP REST)</span>
          </div>
        </div>

        {/* Database Clear Action */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Reset Sensor Telemetry Database</span>
            <span className="text-[11px] text-slate-400 block">Purge accumulated records and reseed baseline profile</span>
          </div>
          <button
            onClick={handleResetData}
            className="px-3 py-1.5 bg-rose-950 border border-rose-700/60 hover:bg-rose-900 text-rose-300 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Readings</span>
          </button>
        </div>
        {resetSuccess && (
          <div className="p-2 text-xs text-rose-300 bg-rose-950/60 rounded">
            {resetSuccess}
          </div>
        )}
      </div>
    </div>
  );
};
