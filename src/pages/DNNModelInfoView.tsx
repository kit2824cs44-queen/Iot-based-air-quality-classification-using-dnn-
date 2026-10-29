/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle2,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ModelInfo, ModelMetrics } from '../types/index.ts';
import { fetchModelInfo, trainModel } from '../services/api.ts';

export const DNNModelInfoView: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainSuccess, setTrainSuccess] = useState<string | null>(null);

  // Training parameters
  const [epochs, setEpochs] = useState<number>(35);
  const [batchSize, setBatchSize] = useState<number>(32);
  const [learningRate, setLearningRate] = useState<number>(0.0025);

  const loadInfo = async () => {
    setLoading(true);
    try {
      const info = await fetchModelInfo();
      setModelInfo(info);
    } catch (err) {
      console.error('Error fetching model info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInfo();
  }, []);

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    setTraining(true);
    setTrainSuccess(null);
    try {
      const res = await trainModel({
        epochs,
        batch_size: batchSize,
        learning_rate: learningRate,
      });
      setTrainSuccess(`Training completed! Final Test Accuracy: ${res.metrics.accuracy}%`);
      setModelInfo(res.model_info);
    } catch (err: any) {
      alert(err.message || 'Model training failed');
    } finally {
      setTraining(false);
    }
  };

  if (loading && !modelInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Brain className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
        <p className="text-sm">Inspecting Deep Neural Network architecture & weights...</p>
      </div>
    );
  }

  const metrics = modelInfo?.metrics;
  const history = modelInfo?.training_history;

  // Format training history for chart
  const historyChartData = history?.epochs.map((ep, idx) => ({
    epoch: ep,
    train_loss: history.train_loss[idx],
    val_loss: history.val_loss[idx],
    train_acc: history.train_acc[idx],
    val_acc: history.val_acc[idx],
  })) || [];

  return (
    <div className="space-y-6">
      {/* Title & Metadata Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Deep Neural Network (DNN) Architecture & Pipeline Specifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multi-layer perceptron with Dropout regularization, ReLU non-linearities, and Softmax classification
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>Version: <strong className="text-emerald-400">{modelInfo?.version}</strong></span>
          <span>·</span>
          <span>Status: <strong className="text-emerald-400 uppercase">{modelInfo?.status}</strong></span>
        </div>
      </div>

      {/* Model Image Asset & Architecture Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Diagram Render Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="relative aspect-video w-full bg-slate-950">
            <img
              src="/src/assets/images/dnn_network_diagram_1793250776268.jpg"
              alt="Deep Neural Network Architecture Diagram"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur border border-slate-700 rounded text-[11px] text-cyan-400 font-mono">
              Topology: 8 → 128 → 64 → 32 → 6
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
              Topological Flow & Activation Functions
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized 8-D input feature vectors propagate through 3 hidden Dense layers with Rectified Linear Unit (ReLU) activations and Dropout regularization ($p=0.3, 0.2$), feeding a 6-class normalized Softmax output probability vector.
            </p>
          </div>
        </div>

        {/* Layer Specification & Dataset Provenance */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Layer Hyperparameters & Training Data Split
          </h3>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">TOTAL SAMPLES</span>
                <span className="text-white font-bold">{modelInfo?.dataset_info.total_samples}</span>
              </div>
              <div>
                <span className="text-slate-500 block">TRAIN / VAL SPLIT</span>
                <span className="text-emerald-400 font-bold">
                  {modelInfo?.dataset_info.train_samples} / {modelInfo?.dataset_info.val_samples}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">INDEPENDENT TEST SET</span>
                <span className="text-cyan-400 font-bold">{modelInfo?.dataset_info.test_samples}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Input Layer:</span>
                <span className="font-mono text-white">8 Features [PM2.5, PM10, CO, NO₂, SO₂, O₃, Temp, Humidity]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dense Layer 1:</span>
                <span className="font-mono text-emerald-400">128 Neurons · ReLU · Dropout(0.30)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dense Layer 2:</span>
                <span className="font-mono text-emerald-400">64 Neurons · ReLU · Dropout(0.20)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dense Layer 3:</span>
                <span className="font-mono text-emerald-400">32 Neurons · ReLU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output Layer:</span>
                <span className="font-mono text-cyan-400">6 Output Units · Softmax</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loss & Optimizer:</span>
                <span className="font-mono text-slate-200">Categorical Cross-Entropy · Adam (β₁=0.9, β₂=0.999)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Feature Scaling:</span>
                <span className="font-mono text-slate-200">Z-Score Standardization: $z = (x - \mu)/\sigma$</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              <strong>Dataset License:</strong> {modelInfo?.dataset_info.license}
            </div>
          </div>
        </div>
      </div>

      {/* Actual Independent Test Set Evaluation Metrics */}
      {metrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Independent Test Accuracy</span>
              <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                {metrics.accuracy}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">N = {metrics.test_samples} unseen samples</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Macro Average F1</span>
              <span className="text-3xl font-bold font-mono text-cyan-400 tabular-nums">
                {metrics.macro_f1}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Unweighted class mean</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Weighted F1-Score</span>
              <span className="text-3xl font-bold font-mono text-teal-400 tabular-nums">
                {metrics.weighted_f1}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Support-adjusted score</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Cross-Entropy Test Loss</span>
              <span className="text-3xl font-bold font-mono text-amber-400 tabular-nums">
                {metrics.loss}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Evaluated on test split</span>
            </div>
          </div>

          {/* Classification Report & Confusion Matrix Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Per-Class Classification Report (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Per-Class Classification Report</h3>
              <p className="text-xs text-slate-400 mb-3">
                Precision, Recall, and F1-score evaluated across each air quality class on independent test data
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">CATEGORY</th>
                      <th className="py-2.5 px-3">PRECISION</th>
                      <th className="py-2.5 px-3">RECALL</th>
                      <th className="py-2.5 px-3">F1-SCORE</th>
                      <th className="py-2.5 px-3">SUPPORT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono">
                    {metrics.classification_report.map((item) => (
                      <tr key={item.category} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-white">{item.category}</td>
                        <td className="py-2 px-3 text-emerald-400 tabular-nums">{item.precision}%</td>
                        <td className="py-2 px-3 text-cyan-400 tabular-nums">{item.recall}%</td>
                        <td className="py-2 px-3 text-amber-400 tabular-nums">{item.f1_score}%</td>
                        <td className="py-2 px-3 text-slate-300 tabular-nums">{item.support}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6x6 Confusion Matrix (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Confusion Matrix Heatmap</h3>
              <p className="text-xs text-slate-400 mb-3">
                True class (vertical axis) vs. Model Predicted class (horizontal axis)
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1 text-slate-500 font-normal">True \ Pred</th>
                      {metrics.confusion_matrix.labels.map((lbl) => (
                        <th key={lbl} className="p-1 text-slate-300 font-mono" title={lbl}>
                          {lbl.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.confusion_matrix.matrix.map((row, rIdx) => {
                      const trueLabel = metrics.confusion_matrix.labels[rIdx];
                      return (
                        <tr key={trueLabel}>
                          <td className="p-1 text-slate-300 font-mono text-left font-semibold" title={trueLabel}>
                            {trueLabel.slice(0, 3)}
                          </td>
                          {row.map((val, cIdx) => {
                            const isDiagonal = rIdx === cIdx;
                            return (
                              <td
                                key={`${rIdx}-${cIdx}`}
                                className={`p-1.5 font-mono border border-slate-800 ${
                                  isDiagonal
                                    ? val > 0
                                      ? 'bg-emerald-950/80 text-emerald-300 font-bold'
                                      : 'bg-slate-950 text-slate-500'
                                    : val > 0
                                    ? 'bg-rose-950/60 text-rose-300 font-semibold'
                                    : 'bg-slate-950 text-slate-600'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Epoch Loss & Accuracy Curves */}
          {historyChartData.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Training & Validation Convergence Curves</h3>
              <p className="text-xs text-slate-400 mb-4">
                Epoch-wise loss minimization and accuracy progression showing early stopping convergence
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Loss Curve */}
                <div className="h-60 w-full">
                  <span className="text-xs text-slate-400 block mb-2 font-mono">Cross-Entropy Loss (Lower is better)</span>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="train_loss" stroke="#38bdf8" dot={false} strokeWidth={2} name="Train Loss" />
                      <Line type="monotone" dataKey="val_loss" stroke="#f43f5e" dot={false} strokeWidth={2} name="Val Loss" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Accuracy Curve */}
                <div className="h-60 w-full">
                  <span className="text-xs text-slate-400 block mb-2 font-mono">Classification Accuracy % (Higher is better)</span>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[40, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="train_acc" stroke="#10b981" dot={false} strokeWidth={2} name="Train Acc %" />
                      <Line type="monotone" dataKey="val_acc" stroke="#a855f7" dot={false} strokeWidth={2} name="Val Acc %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model Training Workbench */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Interactive DNN Training & Fine-Tuning Workbench
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Re-train the model in real time using the seed dataset with configurable Adam hyperparameters
            </p>
          </div>
        </div>

        <form onSubmit={handleTrain} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Epochs (Iterations)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Mini-Batch Size</label>
              <input
                type="number"
                min="8"
                max="64"
                step="8"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Learning Rate ($\alpha$)</label>
              <input
                type="number"
                min="0.0001"
                max="0.05"
                step="0.0005"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {trainSuccess && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{trainSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={training}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{training ? 'Training DNN Weights on Dataset...' : 'Start Training & Evaluation Run'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
