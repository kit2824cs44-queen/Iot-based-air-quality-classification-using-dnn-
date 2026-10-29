/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Droplets,
  Layers,
  Radio,
  Thermometer,
  Wind,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardSummary } from '../types/index.ts';
import { getCategoryMetadata } from '../utils/aqiCalculator.ts';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigateTab: (tab: any) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Good: '#10B981',        // Emerald-500
  Satisfactory: '#14B8A6',// Teal-500
  Moderate: '#F59E0B',    // Amber-500
  Poor: '#F97316',        // Orange-500
  'Very Poor': '#F43F5E', // Rose-500
  Severe: '#A855F7',      // Purple-500
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  loading,
  onRefresh,
  onNavigateTab,
}) => {
  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm">Synchronizing telemetry and DNN classification pipeline...</p>
      </div>
    );
  }

  if (!summary || !summary.latest_reading) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl max-w-xl mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">No Telemetry Ingested</h3>
        <p className="text-sm text-slate-400 mt-1 mb-4">
          The IoT sensor bus is awaiting data streams. Start the simulator or submit manual readings.
        </p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
        >
          Check Again
        </button>
      </div>
    );
  }

  const { latest_reading, calculated_aqi, latest_prediction } = summary;
  const aqiMeta = calculated_aqi ? getCategoryMetadata(calculated_aqi.category) : null;
  const dnnMeta = latest_prediction ? getCategoryMetadata(latest_prediction.predicted_category) : null;

  return (
    <div className="space-y-6">
      {/* Simulation / Physical Badge Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 px-4 py-2.5 rounded-lg text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            Station: <span className="font-mono text-emerald-300">{latest_reading.device_id}</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {new Date(latest_reading.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
          <span className="text-slate-600">·</span>
          <span>
            Mode:{' '}
            <span className={latest_reading.source === 'simulated' ? 'text-amber-400' : 'text-emerald-400'}>
              {latest_reading.source === 'simulated' ? 'Simulated Demo Stream' : 'Live Physical Hardware'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
          >
            <Activity className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Primary KPI Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Calculated AQI */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="tracking-wider uppercase font-medium">Calculated CPCB AQI</span>
            <span className="font-mono text-[11px] text-slate-500">MAX SUB-INDEX</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-white tabular-nums">
              {calculated_aqi?.aqi ?? '--'}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">INDEX</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className={`font-semibold ${aqiMeta?.color}`}>
              {calculated_aqi?.category}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Driver: {calculated_aqi?.prominent_pollutant}
            </span>
          </div>
        </div>

        {/* Card 2: Deep Neural Network Prediction */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="tracking-wider uppercase font-medium flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              DNN Classification
            </span>
            <span className="font-mono text-[11px] text-cyan-400">MULTI-LAYER</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {latest_prediction?.predicted_category ?? '--'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">
              Confidence:{' '}
              <span className="text-cyan-400 font-mono font-medium tabular-nums">
                {latest_prediction ? `${(latest_prediction.confidence * 100).toFixed(1)}%` : '--'}
              </span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Softmax Output</span>
          </div>
        </div>

        {/* Card 3: Sensor Fleet Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="tracking-wider uppercase font-medium">IoT Fleet Status</span>
            <span className="font-mono text-[11px] text-emerald-400">ONLINE</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-white tabular-nums">
              {summary.active_sensors_count}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">/ 4 NODES ACTIVE</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Total Ingested:</span>
            <span className="text-emerald-400 font-mono tabular-nums">
              {summary.total_readings_count.toLocaleString()} records
            </span>
          </div>
        </div>

        {/* Card 4: Microclimate Condition */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="tracking-wider uppercase font-medium">Microclimate Ambience</span>
            <span className="font-mono text-[11px] text-slate-500">SURFACE METRICS</span>
          </div>
          <div className="flex items-baseline gap-4">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {latest_reading.temperature}°C
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-teal-400" />
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {latest_reading.humidity}%
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Atmospheric Dispersion:</span>
            <span className="text-slate-200 font-medium">
              {latest_reading.humidity > 75 ? 'Low (Inversion Risk)' : 'Normal Dispersion'}
            </span>
          </div>
        </div>
      </div>

      {/* Pollutant Spectrum Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Continuous Pollutant Spectrum</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Validated real-time physical sensor telemetry parameters with regulatory units
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('classification')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Run Custom Simulation →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* PM2.5 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">PM2.5</span>
              <span className="font-mono text-[10px] text-slate-500">µg/m³</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {latest_reading.pm25}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Sub-Index: <span className="text-emerald-400 font-mono font-medium">{calculated_aqi?.sub_indices.pm25 ?? '--'}</span>
            </div>
          </div>

          {/* PM10 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">PM10</span>
              <span className="font-mono text-[10px] text-slate-500">µg/m³</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {latest_reading.pm10}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Sub-Index: <span className="text-emerald-400 font-mono font-medium">{calculated_aqi?.sub_indices.pm10 ?? '--'}</span>
            </div>
          </div>

          {/* CO */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">CO</span>
              <span className="font-mono text-[10px] text-slate-500">mg/m³</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {latest_reading.co}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Sub-Index: <span className="text-emerald-400 font-mono font-medium">{calculated_aqi?.sub_indices.co ?? '--'}</span>
            </div>
          </div>

          {/* NO2 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">NO₂</span>
              <span className="font-mono text-[10px] text-slate-500">µg/m³</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {latest_reading.no2}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Sub-Index: <span className="text-emerald-400 font-mono font-medium">{calculated_aqi?.sub_indices.no2 ?? '--'}</span>
            </div>
          </div>

          {/* SO2 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">SO₂</span>
              <span className="font-mono text-[10px] text-slate-500">µg/m³</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {latest_reading.so2}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Sub-Index: <span className="text-emerald-400 font-mono font-medium">{calculated_aqi?.sub_indices.so2 ?? '--'}</span>
            </div>
          </div>

          {/* O3 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">O₃</span>
              <span className="font-mono text-[10px] text-slate-500">µg/m³</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {latest_reading.o3}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Sub-Index: <span className="text-emerald-400 font-mono font-medium">{calculated_aqi?.sub_indices.o3 ?? '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: 24h Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Particulate and AQI Curve */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">24-Hour Telemetry Chronology</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous PM2.5, PM10, and calculated AQI timeline
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> PM2.5
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> PM10
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> AQI
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.recent_trend_24h} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pm25"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="PM2.5 (µg/m³)"
                />
                <Line
                  type="monotone"
                  dataKey="pm10"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="PM10 (µg/m³)"
                />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="AQI Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Air Quality Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Classification Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical frequency across all historical sensor readings
            </p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.category_distribution}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {summary.category_distribution.map((entry) => (
                    <Cell
                      key={`cell-${entry.category}`}
                      fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {summary.category_distribution.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#94a3b8' }}
                  />
                  <span>{item.category}</span>
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discrepancy Analysis & Health Advisory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DNN vs Regulatory AQI Explanation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">DNN vs. Regulatory AQI Comparison</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {latest_prediction?.aqi_comparison?.explanation}
          </p>
          <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Standard Used:</span>
              <span className="font-mono text-slate-200">CPCB National Air Quality Index (NAQI)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Agreement Status:</span>
              <span
                className={`font-medium ${
                  latest_prediction?.aqi_comparison?.matches_dnn ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {latest_prediction?.aqi_comparison?.matches_dnn ? 'Identical Classification' : 'Multi-Factor Divergence'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Educational Limitation:</span>
              <span className="text-slate-400 italic">Academic research monitor; not legal compliance evidence</span>
            </div>
          </div>
        </div>

        {/* Environmental Health Recommendations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Health Recommendations</h3>
          </div>
          <p className="text-xs text-slate-300 mb-3 font-medium">
            {calculated_aqi?.advisory.general}
          </p>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">Sensitive Groups:</strong> {calculated_aqi?.advisory.sensitive_groups}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">Outdoor Activity:</strong> {calculated_aqi?.advisory.outdoor_activity}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">Protective Measures:</strong> {calculated_aqi?.advisory.protective_measures}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
