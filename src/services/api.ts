/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AirQualityCategory,
  DashboardSummary,
  DeviceInfo,
  ModelInfo,
  ModelMetrics,
  SensorReading,
  SimulatorConfig,
  StoredSettings,
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to load dashboard summary');
  return res.json();
}

export async function fetchDevices(): Promise<DeviceInfo[]> {
  const res = await fetch(`${API_BASE}/sensors`);
  if (!res.ok) throw new Error('Failed to load devices');
  return res.json();
}

export async function registerDevice(data: {
  id: string;
  name: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
}): Promise<DeviceInfo> {
  const res = await fetch(`${API_BASE}/sensors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to register device');
  }
  return res.json();
}

export async function fetchReadings(params: {
  device_id?: string;
  category?: AirQualityCategory;
  startDate?: string;
  endDate?: string;
  minPm25?: number;
  maxPm25?: number;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<{
  data: SensorReading[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const url = new URL(`${window.location.origin}${API_BASE}/sensors/readings`);
  if (params.device_id) url.searchParams.set('device_id', params.device_id);
  if (params.category) url.searchParams.set('category', params.category);
  if (params.startDate) url.searchParams.set('startDate', params.startDate);
  if (params.endDate) url.searchParams.set('endDate', params.endDate);
  if (params.minPm25 !== undefined) url.searchParams.set('minPm25', params.minPm25.toString());
  if (params.maxPm25 !== undefined) url.searchParams.set('maxPm25', params.maxPm25.toString());
  if (params.sortOrder) url.searchParams.set('sortOrder', params.sortOrder);
  if (params.page) url.searchParams.set('page', params.page.toString());
  if (params.limit) url.searchParams.set('limit', params.limit.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch historical readings');
  return res.json();
}

export async function submitSensorReading(payload: {
  device_id: string;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  temperature: number;
  humidity: number;
  timestamp?: string;
  source?: 'simulated' | 'physical' | 'manual';
}) {
  const res = await fetch(`${API_BASE}/sensors/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit sensor reading');
  }
  return res.json();
}

export async function predictReading(features: {
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  temperature: number;
  humidity: number;
}) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to obtain DNN prediction');
  }
  return res.json();
}

export async function predictBatch(readings: any[]) {
  const res = await fetch(`${API_BASE}/predict/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readings }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Batch prediction failed');
  }
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${API_BASE}/model/info`);
  if (!res.ok) throw new Error('Failed to fetch model information');
  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelMetrics> {
  const res = await fetch(`${API_BASE}/model/metrics`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function trainModel(params: {
  epochs: number;
  batch_size: number;
  learning_rate: number;
}) {
  const res = await fetch(`${API_BASE}/model/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Model training failed');
  }
  return res.json();
}

export async function fetchSimulatorConfig(): Promise<SimulatorConfig> {
  const res = await fetch(`${API_BASE}/simulator/config`);
  if (!res.ok) throw new Error('Failed to load simulator configuration');
  return res.json();
}

export async function updateSimulatorConfig(config: Partial<SimulatorConfig>): Promise<SimulatorConfig> {
  const res = await fetch(`${API_BASE}/simulator/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to update simulator configuration');
  return res.json();
}

export async function toggleSimulator(): Promise<SimulatorConfig> {
  const res = await fetch(`${API_BASE}/simulator/toggle`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle simulator');
  return res.json();
}

export async function fetchSettings(): Promise<StoredSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateSettings(settings: Partial<StoredSettings>): Promise<StoredSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset-data`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}
