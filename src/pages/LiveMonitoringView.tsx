/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  Check,
  Cpu,
  Flame,
  Play,
  Radio,
  Send,
  Sliders,
  Square,
  Thermometer,
  Zap,
} from 'lucide-react';
import {
  DeviceInfo,
  SensorReading,
  SimulatorConfig,
} from '../types/index.ts';
import {
  fetchDevices,
  fetchReadings,
  fetchSimulatorConfig,
  submitSensorReading,
  updateSimulatorConfig,
} from '../services/api.ts';
import { getCategoryMetadata } from '../utils/aqiCalculator.ts';

export const LiveMonitoringView: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('AQI-DEVICE-001');
  const [latestReadings, setLatestReadings] = useState<SensorReading[]>([]);
  const [simConfig, setSimConfig] = useState<SimulatorConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingManual, setSubmittingManual] = useState<boolean>(false);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  // Manual test reading state
  const [manualForm, setManualForm] = useState({
    device_id: 'AQI-DEVICE-001',
    pm25: 45.0,
    pm10: 85.0,
    co: 1.2,
    no2: 45.0,
    so2: 18.0,
    o3: 35.0,
    temperature: 28.5,
    humidity: 55.0,
  });

  const loadData = async () => {
    try {
      const [devList, readData, sConf] = await Promise.all([
        fetchDevices(),
        fetchReadings({ device_id: selectedDeviceId, limit: 10 }),
        fetchSimulatorConfig(),
      ]);
      setDevices(devList);
      setLatestReadings(readData.data);
      setSimConfig(sConf);
    } catch (err) {
      console.error('Error fetching live monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [selectedDeviceId]);

  const handleToggleSimulator = async () => {
    if (!simConfig) return;
    try {
      const updated = await updateSimulatorConfig({ active: !simConfig.active });
      setSimConfig(updated);
    } catch (err) {
      console.error('Failed to toggle simulator:', err);
    }
  };

  const handleScenarioChange = async (scenario: any) => {
    if (!simConfig) return;
    try {
      const updated = await updateSimulatorConfig({ scenario });
      setSimConfig(updated);
    } catch (err) {
      console.error('Failed to update scenario:', err);
    }
  };

  const handleIntervalChange = async (interval_seconds: number) => {
    if (!simConfig) return;
    try {
      const updated = await updateSimulatorConfig({ interval_seconds });
      setSimConfig(updated);
    } catch (err) {
      console.error('Failed to update interval:', err);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingManual(true);
    setManualSuccess(null);
    setManualError(null);

    try {
      const res = await submitSensorReading({
        ...manualForm,
        source: 'manual',
      });
      setManualSuccess(`Reading ingested! Classified as: ${res.classification.predicted_category} (${(res.classification.confidence * 100).toFixed(1)}% confidence)`);
      loadData();
    } catch (err: any) {
      setManualError(err.message || 'Failed to ingest sensor payload');
    } finally {
      setSubmittingManual(false);
    }
  };

  const currentReading = latestReadings[0];
  const currentDev = devices.find((d) => d.id === selectedDeviceId);

  return (
    <div className="space-y-6">
      {/* Top Console Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Live IoT Telemetry Bus</h2>
            <p className="text-xs text-slate-400">
              Active streaming ingestion through REST endpoint <code className="text-slate-300 font-mono">POST /api/sensors/readings</code>
            </p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Target Sensor Node:</span>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          >
            {devices.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.id} - {dev.name} ({dev.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sensor Node Telemetry Gauges */}
      {currentReading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* PM2.5 */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">PM2.5</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums block">
              {currentReading.pm25}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">µg/m³</span>
          </div>

          {/* PM10 */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">PM10</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums block">
              {currentReading.pm10}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">µg/m³</span>
          </div>

          {/* CO */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">CO</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums block">
              {currentReading.co}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">mg/m³</span>
          </div>

          {/* NO2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">NO₂</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums block">
              {currentReading.no2}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">µg/m³</span>
          </div>

          {/* SO2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">SO₂</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums block">
              {currentReading.so2}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">µg/m³</span>
          </div>

          {/* O3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">O₃</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums block">
              {currentReading.o3}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">µg/m³</span>
          </div>

          {/* Temperature */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Temp</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums block">
              {currentReading.temperature}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">°C</span>
          </div>

          {/* Humidity */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Humidity</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums block">
              {currentReading.humidity}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">% RH</span>
          </div>
        </div>
      )}

      {/* Simulator Control Matrix & Manual Injection Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulator Orchestration Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">IoT Simulator Engine</h3>
            </div>
            <button
              onClick={handleToggleSimulator}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                simConfig?.active
                  ? 'bg-rose-950/80 border border-rose-600/60 text-rose-300 hover:bg-rose-900'
                  : 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 hover:bg-emerald-900'
              }`}
            >
              {simConfig?.active ? (
                <>
                  <Square className="w-3.5 h-3.5" /> Stop Simulation
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Simulation
                </>
              )}
            </button>
          </div>

          {simConfig && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Simulation Environmental Scenario:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'realistic_urban', name: 'Realistic Urban Cycle' },
                    { id: 'traffic_peak', name: 'Traffic Peak Rush Hour' },
                    { id: 'industrial_surge', name: 'Industrial Stack Surge' },
                    { id: 'clean_rural', name: 'Clean Rural Ecological' },
                    { id: 'stagnant_inversion', name: 'Winter Thermal Inversion' },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => handleScenarioChange(sc.id)}
                      className={`px-3 py-2 text-left rounded-lg border transition-all ${
                        simConfig.scenario === sc.id
                          ? 'bg-slate-800 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300 font-medium">Sampling & Transmission Interval:</span>
                  <span className="font-mono text-emerald-400">{simConfig.interval_seconds} seconds</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={simConfig.interval_seconds}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400 text-[11px] leading-relaxed">
                <strong>MQTT Integration Note:</strong> Simulator runs in-process with automated ingestion into the database. If physical ESP32 / Arduino hardware is deployed, readings can also be streamed via MQTT topic <code className="text-slate-200">sensors/airquality/&#123;device_id&#125;/readings</code>.
              </div>
            </div>
          )}
        </div>

        {/* Manual Test Payload Injection Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Manual Sensor Reading Injection</h3>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">PM2.5 (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  required
                  value={manualForm.pm25}
                  onChange={(e) => setManualForm({ ...manualForm, pm25: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">PM10 (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  required
                  value={manualForm.pm10}
                  onChange={(e) => setManualForm({ ...manualForm, pm10: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">CO (mg/m³)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={manualForm.co}
                  onChange={(e) => setManualForm({ ...manualForm, co: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">NO₂ (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  required
                  value={manualForm.no2}
                  onChange={(e) => setManualForm({ ...manualForm, no2: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">SO₂ (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2000"
                  required
                  value={manualForm.so2}
                  onChange={(e) => setManualForm({ ...manualForm, so2: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">O₃ (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  required
                  value={manualForm.o3}
                  onChange={(e) => setManualForm({ ...manualForm, o3: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  min="-20"
                  max="60"
                  required
                  value={manualForm.temperature}
                  onChange={(e) => setManualForm({ ...manualForm, temperature: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={manualForm.humidity}
                  onChange={(e) => setManualForm({ ...manualForm, humidity: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {manualSuccess && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-600/60 rounded text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{manualSuccess}</span>
              </div>
            )}

            {manualError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-600/60 rounded text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingManual}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingManual ? 'Ingesting & Classifying...' : 'Submit Sensor Telemetry Packet'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Live Ingested Packets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Ingested Telemetry Feed ({selectedDeviceId})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">SOURCE</th>
                <th className="py-2.5 px-3">PM2.5</th>
                <th className="py-2.5 px-3">PM10</th>
                <th className="py-2.5 px-3">CO</th>
                <th className="py-2.5 px-3">NO₂</th>
                <th className="py-2.5 px-3">SO₂</th>
                <th className="py-2.5 px-3">O₃</th>
                <th className="py-2.5 px-3">TEMP</th>
                <th className="py-2.5 px-3">HUM</th>
                <th className="py-2.5 px-3">CPCB AQI</th>
                <th className="py-2.5 px-3">DNN PREDICTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {latestReadings.map((r) => {
                const catMeta = r.dnn_category ? getCategoryMetadata(r.dnn_category) : null;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-300">
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-[11px] font-sans ${r.source === 'simulated' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {r.source}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.pm25}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.pm10}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.co}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.no2}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.so2}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.o3}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.temperature}°C</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.humidity}%</td>
                    <td className="py-2 px-3 font-semibold text-emerald-400 tabular-nums">
                      {r.aqi ?? '--'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`font-semibold font-sans ${catMeta?.color}`}>
                        {r.dnn_category}
                      </span>{' '}
                      <span className="text-[10px] text-slate-500">
                        ({r.dnn_confidence ? `${(r.dnn_confidence * 100).toFixed(0)}%` : '--'})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
