/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AirQualityCategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export type AQIStandard = 'CPCB_INDIA' | 'US_EPA';

export interface SensorReading {
  id: string;
  device_id: string;
  pm25: number;        // µg/m³
  pm10: number;        // µg/m³
  co: number;          // mg/m³
  no2: number;         // µg/m³
  so2: number;         // µg/m³
  o3: number;          // µg/m³
  temperature: number; // °C
  humidity: number;    // %
  timestamp: string;   // ISO-8601
  source: 'simulated' | 'physical' | 'manual';
  aqi?: number;
  aqi_category?: AirQualityCategory;
  dnn_category?: AirQualityCategory;
  dnn_confidence?: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'degraded';
  last_seen: string;
  reading_count: number;
  firmware_version: string;
  battery_level?: number;
  ip_address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AQICalculationResult {
  aqi: number;
  category: AirQualityCategory;
  standard: AQIStandard;
  prominent_pollutant: string;
  sub_indices: Record<string, number>;
  is_valid: boolean;
  missing_critical_pollutants?: string[];
  advisory: {
    general: string;
    sensitive_groups: string;
    outdoor_activity: string;
    protective_measures: string;
  };
}

export interface DNNPredictionResult {
  predicted_category: AirQualityCategory;
  confidence: number;
  class_probabilities: Record<AirQualityCategory, number>;
  model_version: string;
  timestamp: string;
  feature_contributions?: Record<string, number>;
  aqi_comparison?: {
    aqi_category: AirQualityCategory;
    aqi_value: number;
    matches_dnn: boolean;
    explanation: string;
  };
  health_recommendation: {
    title: string;
    summary: string;
    action_items: string[];
    risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  };
}

export interface ConfusionMatrixData {
  labels: AirQualityCategory[];
  matrix: number[][]; // true_class x predicted_class
  total_samples: number;
}

export interface ClassReportItem {
  category: AirQualityCategory;
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export interface ModelMetrics {
  accuracy: number;
  macro_f1: number;
  weighted_f1: number;
  loss: number;
  confusion_matrix: ConfusionMatrixData;
  classification_report: ClassReportItem[];
  test_samples: number;
  evaluated_at: string;
}

export interface ModelInfo {
  model_name: string;
  version: string;
  architecture: {
    layers: string[];
    hidden_units: number[];
    activations: string[];
    dropout_rates: number[];
    output_activation: string;
  };
  features: string[];
  classes: AirQualityCategory[];
  status: 'untrained' | 'training' | 'trained';
  last_trained: string | null;
  dataset_info: {
    name: string;
    license: string;
    total_samples: number;
    train_samples: number;
    val_samples: number;
    test_samples: number;
  };
  metrics?: ModelMetrics;
  training_history?: {
    epochs: number[];
    train_loss: number[];
    val_loss: number[];
    train_acc: number[];
    val_acc: number[];
  };
}

export interface DashboardSummary {
  latest_reading: SensorReading | null;
  calculated_aqi: AQICalculationResult | null;
  latest_prediction: DNNPredictionResult | null;
  active_sensors_count: number;
  total_readings_count: number;
  simulated_mode: boolean;
  system_status: 'nominal' | 'warning' | 'error';
  last_updated: string;
  category_distribution: {
    category: AirQualityCategory;
    count: number;
    percentage: number;
  }[];
  recent_trend_24h: {
    time: string;
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
    temperature: number;
    category: AirQualityCategory;
  }[];
}

export interface SimulatorConfig {
  active: boolean;
  interval_seconds: number;
  scenario: 'realistic_urban' | 'traffic_peak' | 'industrial_surge' | 'clean_rural' | 'stagnant_inversion';
  noise_level: 'low' | 'moderate' | 'high';
  devices: string[];
}

export interface StoredSettings {
  aqi_standard: AQIStandard;
  simulator_config: SimulatorConfig;
  temperature_unit: 'C' | 'F';
  auto_refresh_seconds: number;
}

