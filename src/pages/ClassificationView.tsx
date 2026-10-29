/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  Upload,
} from 'lucide-react';
import { predictBatch, predictReading } from '../services/api.ts';
import { AirQualityCategory, DNNPredictionResult } from '../types/index.ts';
import { getCategoryMetadata } from '../utils/aqiCalculator.ts';

export const ClassificationView: React.FC = () => {
  // Input parameters
  const [params, setParams] = useState({
    pm25: 85.0,
    pm10: 175.0,
    co: 3.5,
    no2: 120.0,
    so2: 65.0,
    o3: 85.0,
    temperature: 30.0,
    humidity: 62.0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DNNPredictionResult | null>(null);
  const [aqiCalc, setAqiCalc] = useState<any>(null);

  // Batch prediction state
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [batchSummary, setBatchSummary] = useState<Record<string, number> | null>(null);

  const presets = [
    {
      name: 'Pristine Clean Air',
      desc: 'High mountain / rural eco-zone',
      data: { pm25: 12, pm10: 25, co: 0.3, no2: 12, so2: 5, o3: 20, temperature: 22, humidity: 45 },
    },
    {
      name: 'Moderate Urban Ambience',
      desc: 'Typical city afternoon baseline',
      data: { pm25: 55, pm10: 95, co: 1.5, no2: 65, so2: 30, o3: 65, temperature: 28, humidity: 55 },
    },
    {
      name: 'Heavy Traffic Rush Hour',
      desc: 'Congested highway junction with vehicular NO2/CO',
      data: { pm25: 110, pm10: 280, co: 11.5, no2: 210, so2: 80, o3: 130, temperature: 31, humidity: 50 },
    },
    {
      name: 'Industrial Smog Inversion',
      desc: 'High SO2/particulates with stagnant cold air',
      data: { pm25: 280, pm10: 440, co: 32.0, no2: 380, so2: 380, o3: 160, temperature: 14, humidity: 90 },
    },
  ];

  const handleRunInference = async (customParams = params) => {
    setLoading(true);
    try {
      const res = await predictReading(customParams);
      setResult(res.prediction);
      setAqiCalc(res.aqi_calculation);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetData: typeof params) => {
    setParams(presetData);
    handleRunInference(presetData);
  };

  // Initial load
  React.useEffect(() => {
    handleRunInference();
  }, []);

  const handleLoadSampleBatch = async () => {
    setBatchLoading(true);
    try {
      // 20 realistic sample rows
      const sampleRows = [
        { device_id: 'NODE-01', pm25: 14, pm10: 28, co: 0.4, no2: 15, so2: 6, o3: 25, temperature: 22, humidity: 40 },
        { device_id: 'NODE-02', pm25: 42, pm10: 78, co: 1.1, no2: 48, so2: 22, o3: 45, temperature: 26, humidity: 50 },
        { device_id: 'NODE-03', pm25: 75, pm10: 160, co: 3.2, no2: 110, so2: 55, o3: 80, temperature: 29, humidity: 60 },
        { device_id: 'NODE-04', pm25: 115, pm10: 290, co: 12.0, no2: 220, so2: 95, o3: 140, temperature: 32, humidity: 52 },
        { device_id: 'NODE-05', pm25: 195, pm10: 390, co: 24.0, no2: 330, so2: 240, o3: 190, temperature: 20, humidity: 75 },
        { device_id: 'NODE-06', pm25: 310, pm10: 480, co: 38.0, no2: 430, so2: 390, o3: 230, temperature: 15, humidity: 88 },
        { device_id: 'NODE-07', pm25: 22, pm10: 44, co: 0.6, no2: 25, so2: 10, o3: 35, temperature: 24, humidity: 48 },
        { device_id: 'NODE-08', pm25: 62, pm10: 125, co: 2.4, no2: 85, so2: 40, o3: 70, temperature: 28, humidity: 58 },
      ];
      const res = await predictBatch(sampleRows);
      setBatchResults(res.predictions);
      setBatchSummary(res.category_summary);
    } catch (err) {
      console.error('Batch error:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  const activeCategoryMeta = result ? getCategoryMetadata(result.predicted_category) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Deep Neural Network (DNN) Classification Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inference using trained multi-layer dense architecture with Softmax probability distributions
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((pr) => (
            <button
              key={pr.name}
              onClick={() => applyPreset(pr.data)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
            >
              {pr.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Inference Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Sensor Input Vector (x ∈ ℝ⁸)
            </h3>
            <button
              onClick={() => handleRunInference()}
              disabled={loading}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Re-evaluate
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* PM2.5 */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>PM2.5 (Fine Particulate)</span>
                <span className="font-mono text-emerald-400 font-medium tabular-nums">{params.pm25} µg/m³</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="1"
                value={params.pm25}
                onChange={(e) => setParams({ ...params, pm25: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* PM10 */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>PM10 (Coarse Particulate)</span>
                <span className="font-mono text-emerald-400 font-medium tabular-nums">{params.pm10} µg/m³</span>
              </div>
              <input
                type="range"
                min="0"
                max="600"
                step="1"
                value={params.pm10}
                onChange={(e) => setParams({ ...params, pm10: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* CO */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>CO (Carbon Monoxide)</span>
                <span className="font-mono text-emerald-400 font-medium tabular-nums">{params.co} mg/m³</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.1"
                value={params.co}
                onChange={(e) => setParams({ ...params, co: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* NO2 */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>NO₂ (Nitrogen Dioxide)</span>
                <span className="font-mono text-emerald-400 font-medium tabular-nums">{params.no2} µg/m³</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="1"
                value={params.no2}
                onChange={(e) => setParams({ ...params, no2: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* SO2 */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>SO₂ (Sulfur Dioxide)</span>
                <span className="font-mono text-emerald-400 font-medium tabular-nums">{params.so2} µg/m³</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="2"
                value={params.so2}
                onChange={(e) => setParams({ ...params, so2: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* O3 */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>O₃ (Ozone)</span>
                <span className="font-mono text-emerald-400 font-medium tabular-nums">{params.o3} µg/m³</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="1"
                value={params.o3}
                onChange={(e) => setParams({ ...params, o3: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Microclimate */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span>Temp (°C)</span>
                  <span className="font-mono text-amber-400 tabular-nums">{params.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="50"
                  step="1"
                  value={params.temperature}
                  onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span>Humidity (%)</span>
                  <span className="font-mono text-teal-400 tabular-nums">{params.humidity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="99"
                  step="1"
                  value={params.humidity}
                  onChange={(e) => setParams({ ...params, humidity: parseFloat(e.target.value) })}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleRunInference()}
              disabled={loading}
              className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating Deep Neural Network...' : 'Compute DNN Prediction'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Prediction Results HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result && (
            <>
              {/* Primary Prediction Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-3 border-b border-slate-800">
                  <span className="uppercase tracking-wider font-semibold">Classification Outcome</span>
                  <span className="font-mono text-slate-400">Model: {result.model_version}</span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Predicted Category:</span>
                    <span className={`text-3xl font-extrabold tracking-tight ${activeCategoryMeta?.color}`}>
                      {result.predicted_category}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block mb-1">Model Confidence:</span>
                    <span className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80">
                  {activeCategoryMeta?.description}
                </p>
              </div>

              {/* Softmax Probability Distribution */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Softmax Output Probability Distribution [P(Class | x)]
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(result.class_probabilities).map(([cat, prob]) => {
                    const isWinner = cat === result.predicted_category;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={isWinner ? 'font-semibold text-white' : 'text-slate-400'}>
                            {cat}
                          </span>
                          <span className="font-mono text-slate-300 tabular-nums">
                            {(prob * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isWinner ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                            style={{ width: `${Math.max(2, prob * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Regulatory AQI vs DNN Comparison Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Discrepancy & Verification Analysis
                  </h4>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CPCB Regulatory AQI:</span>
                    <span className="font-mono text-white font-semibold">
                      {aqiCalc?.aqi} ({aqiCalc?.category})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">DNN Neural Category:</span>
                    <span className="font-mono text-cyan-400 font-semibold">
                      {result.predicted_category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Agreement Verdict:</span>
                    <span
                      className={`font-semibold ${
                        result.aqi_comparison?.matches_dnn ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {result.aqi_comparison?.matches_dnn ? 'Match' : 'Divergent Synergistic Assessment'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {result.aqi_comparison?.explanation}
                </p>
              </div>

              {/* Preventive Health Advisory */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  Health Advisory & Protective Protocols
                </h4>
                <p className="text-xs text-slate-300 font-medium mb-3">
                  {result.health_recommendation.summary}
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {result.health_recommendation.action_items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Batch CSV Prediction Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              Batch CSV Inference Workflow
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute mass predictions on CSV telemetry arrays without single-record latency
            </p>
          </div>
          <button
            onClick={handleLoadSampleBatch}
            disabled={batchLoading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{batchLoading ? 'Processing Batch...' : 'Load & Classify Sample Batch'}</span>
          </button>
        </div>

        {batchSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(batchSummary).map(([cat, cnt]) => (
              <div key={cat} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg text-xs">
                <span className="text-slate-400 block">{cat}</span>
                <span className="text-lg font-bold font-mono text-white tabular-nums">{cnt} rows</span>
              </div>
            ))}
          </div>
        )}

        {batchResults && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">DEVICE</th>
                  <th className="py-2 px-3">PM2.5</th>
                  <th className="py-2 px-3">PM10</th>
                  <th className="py-2 px-3">CO</th>
                  <th className="py-2 px-3">NO₂</th>
                  <th className="py-2 px-3">TEMP</th>
                  <th className="py-2 px-3">AQI</th>
                  <th className="py-2 px-3">DNN PREDICTION</th>
                  <th className="py-2 px-3">CONFIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {batchResults.map((row) => (
                  <tr key={row.index} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-slate-400">{row.index}</td>
                    <td className="py-2 px-3 text-slate-200">{row.device_id}</td>
                    <td className="py-2 px-3 text-slate-300">{row.inputs.pm25}</td>
                    <td className="py-2 px-3 text-slate-300">{row.inputs.pm10}</td>
                    <td className="py-2 px-3 text-slate-300">{row.inputs.co}</td>
                    <td className="py-2 px-3 text-slate-300">{row.inputs.no2}</td>
                    <td className="py-2 px-3 text-slate-300">{row.inputs.temperature}°C</td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">{row.calculated_aqi}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-white">{row.predicted_category}</td>
                    <td className="py-2 px-3 text-cyan-400">{(row.confidence * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
