/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  LineChart as LineChartIcon,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { fetchAnalytics } from '../services/api.ts';

export const AnalyticsReportsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAnalytics();
      setData(res);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadCsv = () => {
    window.location.href = '/api/reports/export';
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-sm">Synthesizing statistical telemetry analytics...</p>
      </div>
    );
  }

  const { summary, hourly_averages } = data || {};

  return (
    <div className="space-y-6">
      {/* Title & Action Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Environmental Telemetry Analytics & Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated diurnal cycles, descriptive statistics, and multi-variable dispersion distributions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full Dataset CSV</span>
          </button>
        </div>
      </div>

      {/* Statistical Summary Grid */}
      {summary && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Pollutant Descriptive Statistics</h3>
          <p className="text-xs text-slate-400 mb-4">
            Empirical parametric metrics computed across {summary.total_records} ingested continuous sensor readings
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-2.5 px-3">PARAMETER</th>
                  <th className="py-2.5 px-3">MEASUREMENT UNIT</th>
                  <th className="py-2.5 px-3">MEAN ($\mu$)</th>
                  <th className="py-2.5 px-3">STD DEV ($\sigma$)</th>
                  <th className="py-2.5 px-3">MINIMUM</th>
                  <th className="py-2.5 px-3">MAXIMUM</th>
                  <th className="py-2.5 px-3">CPCB 24H STANDARD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">PM2.5</td>
                  <td className="py-2.5 px-3 text-slate-400">µg/m³</td>
                  <td className="py-2.5 px-3 text-emerald-400 tabular-nums">{summary.pm25.mean}</td>
                  <td className="py-2.5 px-3 text-slate-300 tabular-nums">±{summary.pm25.std}</td>
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{summary.pm25.min}</td>
                  <td className="py-2.5 px-3 text-rose-400 tabular-nums">{summary.pm25.max}</td>
                  <td className="py-2.5 px-3 text-slate-400">60 µg/m³</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">PM10</td>
                  <td className="py-2.5 px-3 text-slate-400">µg/m³</td>
                  <td className="py-2.5 px-3 text-emerald-400 tabular-nums">{summary.pm10.mean}</td>
                  <td className="py-2.5 px-3 text-slate-300 tabular-nums">±{summary.pm10.std}</td>
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{summary.pm10.min}</td>
                  <td className="py-2.5 px-3 text-rose-400 tabular-nums">{summary.pm10.max}</td>
                  <td className="py-2.5 px-3 text-slate-400">100 µg/m³</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">CO</td>
                  <td className="py-2.5 px-3 text-slate-400">mg/m³</td>
                  <td className="py-2.5 px-3 text-emerald-400 tabular-nums">{summary.co.mean}</td>
                  <td className="py-2.5 px-3 text-slate-300 tabular-nums">±{summary.co.std}</td>
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{summary.co.min}</td>
                  <td className="py-2.5 px-3 text-rose-400 tabular-nums">{summary.co.max}</td>
                  <td className="py-2.5 px-3 text-slate-400">2.0 mg/m³ (8h)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">NO₂</td>
                  <td className="py-2.5 px-3 text-slate-400">µg/m³</td>
                  <td className="py-2.5 px-3 text-emerald-400 tabular-nums">{summary.no2.mean}</td>
                  <td className="py-2.5 px-3 text-slate-300 tabular-nums">±{summary.no2.std}</td>
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{summary.no2.min}</td>
                  <td className="py-2.5 px-3 text-rose-400 tabular-nums">{summary.no2.max}</td>
                  <td className="py-2.5 px-3 text-slate-400">80 µg/m³</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">SO₂</td>
                  <td className="py-2.5 px-3 text-slate-400">µg/m³</td>
                  <td className="py-2.5 px-3 text-emerald-400 tabular-nums">{summary.so2.mean}</td>
                  <td className="py-2.5 px-3 text-slate-300 tabular-nums">±{summary.so2.std}</td>
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{summary.so2.min}</td>
                  <td className="py-2.5 px-3 text-rose-400 tabular-nums">{summary.so2.max}</td>
                  <td className="py-2.5 px-3 text-slate-400">80 µg/m³</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">O₃</td>
                  <td className="py-2.5 px-3 text-slate-400">µg/m³</td>
                  <td className="py-2.5 px-3 text-emerald-400 tabular-nums">{summary.o3.mean}</td>
                  <td className="py-2.5 px-3 text-slate-300 tabular-nums">±{summary.o3.std}</td>
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{summary.o3.min}</td>
                  <td className="py-2.5 px-3 text-rose-400 tabular-nums">{summary.o3.max}</td>
                  <td className="py-2.5 px-3 text-slate-400">100 µg/m³ (8h)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hourly Diurnal Curves */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">24-Hour Diurnal Profile (Hourly Mean Pattern)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reflects morning rush (08:00–10:00), afternoon photochemical ozone accumulation, and evening vehicular peaks
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourly_averages} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="pm25" stroke="#10b981" strokeWidth={2} name="PM2.5 (µg/m³)" />
              <Line type="monotone" dataKey="pm10" stroke="#06b6d4" strokeWidth={2} name="PM10 (µg/m³)" />
              <Line type="monotone" dataKey="no2" stroke="#a855f7" strokeWidth={2} name="NO₂ (µg/m³)" />
              <Line type="monotone" dataKey="aqi" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" name="Mean AQI" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
