/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Cpu,
  FileCode,
  GraduationCap,
  Layers,
  Radio,
  ShieldAlert,
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Presentation Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
          <GraduationCap className="w-4 h-4" />
          Final Year Engineering Academic Project
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          IoT Based Air Quality Classification Using Deep Neural Network (DNN)
        </h1>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
          An end-to-end environmental cyber-physical system integrating physical sensor transducers, RESTful telemetry pipelines, CPCB National Air Quality Index calculation, and a multi-layer Deep Neural Network classifier for multi-variable atmospheric hazard prediction.
        </p>
      </div>

      {/* Abstract & Research Motivation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Academic Abstract & Motivation
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Conventional regulatory Air Quality Index (AQI) calculations rely on linear piecewise interpolation that isolates the single worst pollutant sub-index [AQI = max(I_i)], ignoring complex non-linear photochemical interactions, synergistic pollutant toxicities, and thermodynamic trapping caused by humidity and temperature inversions.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          This system addresses that limitation by training a Deep Neural Network (DNN) over continuous 8-dimensional environmental sensor vectors (PM2.5, PM10, CO, NO₂, SO₂, O₃, Ambient Temperature, and Relative Humidity). The model learns latent multi-pollutant correlations, outputting normalized Softmax class probabilities and comparing neural predictions directly against regulatory CPCB indices to explain systemic atmospheric phenomena.
        </p>
      </div>

      {/* 5-Tier System Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          End-to-End Cyber-Physical Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* Tier 1 */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">TIER 1</span>
              <h4 className="font-semibold text-white">Transducer Array</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                PMS5003 laser particulate sensor, electrochemical gas sensors (CO, NO₂, SO₂, O₃), and SHT31 temperature/humidity probes.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-2">Physical Layer</span>
          </div>

          {/* Tier 2 */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">TIER 2</span>
              <h4 className="font-semibold text-white">IoT Node Telemetry</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                ESP32 dual-core Xtensa MCU running FreeRTOS with ADC sampling, Wi-Fi / MQTT transport, and REST JSON payload publishing.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-2">Ingestion Layer</span>
          </div>

          {/* Tier 3 */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">TIER 3</span>
              <h4 className="font-semibold text-white">Backend & Store</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Full-stack Express/FastAPI server with ACID persistent file/SQL store, data validation, and CPCB sub-index linear calculator.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-2">Database Layer</span>
          </div>

          {/* Tier 4 */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold block mb-1">TIER 4</span>
              <h4 className="font-semibold text-white">Deep Neural Net</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                StandardScaler normalization + Dense(128, ReLU) + Dropout(0.3) + Dense(64) + Dropout(0.2) + Dense(32) + Dense(6, Softmax).
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-2">Inference Layer</span>
          </div>

          {/* Tier 5 */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1">TIER 5</span>
              <h4 className="font-semibold text-white">Interactive UI</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                React 19 SPA with Tailwind CSS, Recharts time-series, live telemetry feeds, batch CSV inference, and health advisories.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-2">Presentation Layer</span>
          </div>
        </div>
      </div>

      {/* Mathematical Formulations Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-amber-400" />
          Mathematical Formulations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* CPCB NAQI Equation */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-emerald-400">1. CPCB Sub-Index Linear Formula</h4>
            <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-200">
              I_p = ((I_high - I_low) / (BP_high - BP_low)) * (C_p - BP_low) + I_low
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Where C_p is pollutant concentration, BP_low and BP_high are breakpoint limits, and I_low, I_high are the respective AQI sub-index boundaries. Overall AQI = max_p(I_p).
            </p>
          </div>

          {/* DNN Forward Pass */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-cyan-400">2. Deep Neural Network Forward Propagation</h4>
            <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-200">
              z^[l] = W^[l] * a^[l-1] + b^[l],  a^[l] = max(0, z^[l])
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Each hidden layer applies an affine linear transformation followed by Rectified Linear Unit (ReLU) activations to learn complex non-linear spatial dependencies.
            </p>
          </div>

          {/* Softmax Probability */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-purple-400">3. Softmax Output Probabilities</h4>
            <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-200">
              P(y = c | x) = exp(z_c) / Σ exp(z_j)
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Logits from the final Dense(6) layer are converted into a probability distribution over the 6 target categories, satisfying Σ P(y = c | x) = 1.0.
            </p>
          </div>

          {/* Cross Entropy Loss */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-rose-400">4. Categorical Cross-Entropy Objective</h4>
            <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-200">
              L = - Σ y_k * log(y_hat_k + ε)
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Optimized via Adam with adaptive first and second moments (m_t, v_t), bias corrections, and weight regularization.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Disclaimer & Limitations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-1">
          <h4 className="font-semibold text-slate-200">Educational Research & Implementation Notice</h4>
          <p className="leading-relaxed">
            This project is developed strictly as an academic engineering demonstration for IoT telemetry and machine learning classification. Sensor calibrations, neural predictions, and health recommendations are provided for educational purposes and do not substitute for certified statutory ambient air quality measurement stations or medical consultation.
          </p>
        </div>
      </div>
    </div>
  );
};
