/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';
import { AirQualityCategory, DeviceInfo, SensorReading } from '../types/index.ts';
import { fetchDevices, fetchReadings } from '../services/api.ts';
import { getCategoryMetadata } from '../utils/aqiCalculator.ts';

export const HistoricalDataView: React.FC = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [minPm25, setMinPm25] = useState<string>('');
  const [maxPm25, setMaxPm25] = useState<string>('');

  const loadData = async (newPage = page) => {
    setLoading(true);
    try {
      const res = await fetchReadings({
        device_id: selectedDevice || undefined,
        category: (selectedCategory as AirQualityCategory) || undefined,
        minPm25: minPm25 ? parseFloat(minPm25) : undefined,
        maxPm25: maxPm25 ? parseFloat(maxPm25) : undefined,
        sortOrder,
        page: newPage,
        limit: 15,
      });
      setReadings(res.data);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error fetching historical readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices().then(setDevices).catch(console.error);
    loadData(1);
  }, [selectedDevice, selectedCategory, sortOrder]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const handleResetFilters = () => {
    setSelectedDevice('');
    setSelectedCategory('');
    setMinPm25('');
    setMaxPm25('');
    setSortOrder('desc');
    loadData(1);
  };

  const handleDownloadCsv = () => {
    window.location.href = '/api/reports/export';
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            Historical Sensor Telemetry Repository
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted records queryable across all physical and simulated environmental sensor stations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(page)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <form onSubmit={handleApplyFilter} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          {/* Device */}
          <div>
            <label className="text-slate-400 block mb-1">Sensor Node</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="">All Sensor Nodes</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-slate-400 block mb-1">Classified Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              <option value="Good">Good (0-50)</option>
              <option value="Satisfactory">Satisfactory (51-100)</option>
              <option value="Moderate">Moderate (101-200)</option>
              <option value="Poor">Poor (201-300)</option>
              <option value="Very Poor">Very Poor (301-400)</option>
              <option value="Severe">Severe (401-500+)</option>
            </select>
          </div>

          {/* Min PM2.5 */}
          <div>
            <label className="text-slate-400 block mb-1">Min PM2.5 (µg/m³)</label>
            <input
              type="number"
              placeholder="e.g. 30"
              value={minPm25}
              onChange={(e) => setMinPm25(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Max PM2.5 */}
          <div>
            <label className="text-slate-400 block mb-1">Max PM2.5 (µg/m³)</label>
            <input
              type="number"
              placeholder="e.g. 250"
              value={maxPm25}
              onChange={(e) => setMaxPm25(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="text-slate-400 block mb-1">Chronological Sort</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="desc">Latest First (Desc)</option>
              <option value="asc">Oldest First (Asc)</option>
            </select>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded transition-colors"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Paginated Telemetry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            Displaying <strong className="text-white font-mono">{readings.length}</strong> of{' '}
            <strong className="text-white font-mono">{total}</strong> total recorded telemetry packets
          </span>
          <span className="font-mono">Page {page} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-3">RECORD ID</th>
                <th className="py-2.5 px-3">NODE ID</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">PM2.5 (µg/m³)</th>
                <th className="py-2.5 px-3">PM10 (µg/m³)</th>
                <th className="py-2.5 px-3">CO (mg/m³)</th>
                <th className="py-2.5 px-3">NO₂ (µg/m³)</th>
                <th className="py-2.5 px-3">SO₂ (µg/m³)</th>
                <th className="py-2.5 px-3">O₃ (µg/m³)</th>
                <th className="py-2.5 px-3">TEMP</th>
                <th className="py-2.5 px-3">HUM</th>
                <th className="py-2.5 px-3">CPCB AQI</th>
                <th className="py-2.5 px-3">DNN PREDICTION</th>
                <th className="py-2.5 px-3">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {readings.map((r) => {
                const catMeta = r.dnn_category ? getCategoryMetadata(r.dnn_category) : null;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{r.id.slice(-8)}</td>
                    <td className="py-2 px-3 text-slate-300 font-medium">{r.device_id}</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {new Date(r.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.pm25}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.pm10}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.co}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.no2}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.so2}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.o3}</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.temperature}°C</td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">{r.humidity}%</td>
                    <td className="py-2 px-3 font-semibold text-emerald-400 tabular-nums">{r.aqi ?? '--'}</td>
                    <td className="py-2 px-3">
                      <span className={`font-semibold font-sans ${catMeta?.color}`}>
                        {r.dnn_category}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-cyan-400 tabular-nums">
                      {r.dnn_confidence ? `${(r.dnn_confidence * 100).toFixed(1)}%` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigation */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => loadData(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white rounded flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => loadData(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white rounded flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
