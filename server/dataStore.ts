/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import {
  AirQualityCategory,
  AQIStandard,
  DeviceInfo,
  SensorReading,
  SimulatorConfig,
} from '../src/types/index.ts';
import { calculateAQI } from '../src/utils/aqiCalculator.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');

export interface StoredSettings {
  aqi_standard: AQIStandard;
  simulator_config: SimulatorConfig;
  temperature_unit: 'C' | 'F';
  auto_refresh_seconds: number;
}

export class DataStore {
  private readingsFile = path.join(DATA_DIR, 'sensor_readings.json');
  private devicesFile = path.join(DATA_DIR, 'devices.json');
  private settingsFile = path.join(DATA_DIR, 'settings.json');

  private readings: SensorReading[] = [];
  private devices: DeviceInfo[] = [];
  private settings: StoredSettings = {
    aqi_standard: 'CPCB_INDIA',
    simulator_config: {
      active: true,
      interval_seconds: 3,
      scenario: 'realistic_urban',
      noise_level: 'low',
      devices: ['AQI-DEVICE-001', 'AQI-DEVICE-002', 'AQI-DEVICE-003', 'AQI-DEVICE-004'],
    },
    temperature_unit: 'C',
    auto_refresh_seconds: 5,
  };

  constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.settingsFile)) {
        this.settings = JSON.parse(fs.readFileSync(this.settingsFile, 'utf-8'));
      } else {
        this.saveSettings();
      }

      if (fs.existsSync(this.devicesFile)) {
        this.devices = JSON.parse(fs.readFileSync(this.devicesFile, 'utf-8'));
      } else {
        this.initDefaultDevices();
      }

      if (fs.existsSync(this.readingsFile)) {
        this.readings = JSON.parse(fs.readFileSync(this.readingsFile, 'utf-8'));
      } else {
        this.seedHistoricalReadings();
      }
    } catch (err) {
      console.error('Error loading data files, re-initializing defaults:', err);
      this.initDefaultDevices();
      this.seedHistoricalReadings();
    }
  }

  private initDefaultDevices(): void {
    this.devices = [
      {
        id: 'AQI-DEVICE-001',
        name: 'Traffic Junction Monitor (Sector 18)',
        location: 'Central Arterial Road, Urban Zone',
        status: 'online',
        last_seen: new Date().toISOString(),
        reading_count: 140,
        firmware_version: 'v2.1.4-esp32',
        battery_level: 98,
        ip_address: '192.168.1.101',
        coordinates: { lat: 28.6139, lng: 77.2090 },
      },
      {
        id: 'AQI-DEVICE-002',
        name: 'Industrial Corridor Air Station',
        location: 'Phase-II Industrial Park Boundary',
        status: 'online',
        last_seen: new Date(Date.now() - 15000).toISOString(),
        reading_count: 135,
        firmware_version: 'v2.1.4-esp32',
        battery_level: 94,
        ip_address: '192.168.1.102',
        coordinates: { lat: 28.5355, lng: 77.2732 },
      },
      {
        id: 'AQI-DEVICE-003',
        name: 'Academic Campus Micro-Station',
        location: 'Central University Quadrangle',
        status: 'online',
        last_seen: new Date(Date.now() - 8000).toISOString(),
        reading_count: 152,
        firmware_version: 'v2.2.0-esp32',
        battery_level: 100,
        ip_address: '192.168.1.103',
        coordinates: { lat: 28.5450, lng: 77.1926 },
      },
      {
        id: 'AQI-DEVICE-004',
        name: 'Botanical Garden Ecological Node',
        location: 'Eco-Park Western Perimeter',
        status: 'online',
        last_seen: new Date(Date.now() - 30000).toISOString(),
        reading_count: 118,
        firmware_version: 'v2.0.8-esp32',
        battery_level: 91,
        ip_address: '192.168.1.104',
        coordinates: { lat: 28.5933, lng: 77.2215 },
      },
    ];
    this.saveDevices();
  }

  /**
   * Generates realistic, authentic historical multi-pollutant dataset
   * representative of CPCB continuous ambient air quality monitoring stations.
   */
  private seedHistoricalReadings(): void {
    const historical: SensorReading[] = [];
    const now = Date.now();
    const oneHour = 3600 * 1000;

    // We will generate 180 readings spanning the past 48 hours across our 4 devices
    // with day-night diurnal variations and episodes
    const profiles = [
      { name: 'good', pm25: 18, pm10: 38, co: 0.5, no2: 18, so2: 8, o3: 25, temp: 24, hum: 45 },
      { name: 'satisfactory', pm25: 42, pm10: 75, co: 1.2, no2: 52, so2: 24, o3: 45, temp: 28, hum: 55 },
      { name: 'moderate', pm25: 78, pm10: 165, co: 3.5, no2: 120, so2: 65, o3: 85, temp: 31, hum: 62 },
      { name: 'poor', pm25: 112, pm10: 290, co: 12.0, no2: 210, so2: 140, o3: 135, temp: 26, hum: 70 },
      { name: 'very_poor', pm25: 185, pm10: 380, co: 22.0, no2: 320, so2: 260, o3: 180, temp: 22, hum: 82 },
      { name: 'severe', pm25: 320, pm10: 490, co: 38.0, no2: 440, so2: 410, o3: 240, temp: 19, hum: 91 },
    ];

    const deviceIds = ['AQI-DEVICE-001', 'AQI-DEVICE-002', 'AQI-DEVICE-003', 'AQI-DEVICE-004'];

    for (let i = 180; i >= 0; i--) {
      const timestamp = new Date(now - i * (oneHour / 4)).toISOString();
      const devId = deviceIds[i % deviceIds.length];

      // Time of day effect (0-23)
      const hour = new Date(timestamp).getHours();
      // Rush hour or temperature inversion
      let profileIdx = 1; // Satisfactory default
      if (devId === 'AQI-DEVICE-002') {
        // Industrial: leans moderate to poor
        profileIdx = (hour >= 8 && hour <= 19) ? (i % 2 === 0 ? 3 : 2) : 2;
      } else if (devId === 'AQI-DEVICE-001') {
        // Traffic: rush hour morning 8-10, evening 17-21
        if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
          profileIdx = i % 3 === 0 ? 4 : 3;
        } else {
          profileIdx = 2;
        }
      } else if (devId === 'AQI-DEVICE-004') {
        // Ecological park: Good to satisfactory
        profileIdx = hour > 14 ? 1 : 0;
      } else {
        // Campus: satisfactory to moderate
        profileIdx = i % 4 === 0 ? 0 : (i % 3 === 0 ? 2 : 1);
      }

      // Add episodic severe events in older history for class balance
      if (i > 140 && i < 155) profileIdx = 5; // Severe smog episode
      if (i > 100 && i < 115) profileIdx = 4; // Very poor episode

      const base = profiles[profileIdx];
      const noise = () => (Math.random() - 0.5) * 0.2;

      const pm25 = Number(Math.max(2, base.pm25 * (1 + noise())).toFixed(1));
      const pm10 = Number(Math.max(5, base.pm10 * (1 + noise())).toFixed(1));
      const co = Number(Math.max(0.1, base.co * (1 + noise())).toFixed(2));
      const no2 = Number(Math.max(2, base.no2 * (1 + noise())).toFixed(1));
      const so2 = Number(Math.max(1, base.so2 * (1 + noise())).toFixed(1));
      const o3 = Number(Math.max(2, base.o3 * (1 + noise())).toFixed(1));
      const temperature = Number((base.temp + (Math.sin((hour - 6) / 24 * Math.PI * 2) * 4) + noise() * 2).toFixed(1));
      const humidity = Number(Math.min(99, Math.max(20, base.hum + (Math.cos((hour - 4) / 24 * Math.PI * 2) * 10) + noise() * 5)).toFixed(1));

      const aqiRes = calculateAQI({ pm25, pm10, co, no2, so2, o3 }, this.settings.aqi_standard);

      historical.push({
        id: `reading-${1000 + i}`,
        device_id: devId,
        pm25,
        pm10,
        co,
        no2,
        so2,
        o3,
        temperature,
        humidity,
        timestamp,
        source: 'simulated',
        aqi: aqiRes.aqi,
        aqi_category: aqiRes.category,
        dnn_category: aqiRes.category,
        dnn_confidence: Number((0.85 + Math.random() * 0.14).toFixed(3)),
      });
    }

    this.readings = historical;
    this.saveReadings();
  }

  public getSettings(): StoredSettings {
    return this.settings;
  }

  public updateSettings(partial: Partial<StoredSettings>): StoredSettings {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    return this.settings;
  }

  public getDevices(): DeviceInfo[] {
    // Dynamically update status based on last_seen
    const now = Date.now();
    return this.devices.map((dev) => {
      const diffMs = now - new Date(dev.last_seen).getTime();
      let status: 'online' | 'offline' | 'degraded' = 'online';
      if (diffMs > 120000) {
        status = 'offline';
      } else if (diffMs > 45000) {
        status = 'degraded';
      }
      return { ...dev, status };
    });
  }

  public getDeviceById(id: string): DeviceInfo | undefined {
    return this.devices.find((d) => d.id === id);
  }

  public registerDevice(device: Partial<DeviceInfo> & { id: string; name: string }): DeviceInfo {
    const existingIndex = this.devices.findIndex((d) => d.id === device.id);
    const newDev: DeviceInfo = {
      id: device.id,
      name: device.name,
      location: device.location || 'Unassigned Field Station',
      status: 'online',
      last_seen: new Date().toISOString(),
      reading_count: existingIndex >= 0 ? this.devices[existingIndex].reading_count : 0,
      firmware_version: device.firmware_version || 'v2.2.0-esp32',
      battery_level: device.battery_level ?? 100,
      ip_address: device.ip_address || '192.168.1.150',
      coordinates: device.coordinates || { lat: 28.6139, lng: 77.2090 },
    };

    if (existingIndex >= 0) {
      this.devices[existingIndex] = newDev;
    } else {
      this.devices.push(newDev);
    }
    this.saveDevices();
    return newDev;
  }

  public addReading(payload: {
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
    dnn_category?: AirQualityCategory;
    dnn_confidence?: number;
  }): SensorReading {
    const id = `reading-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = payload.timestamp || new Date().toISOString();

    const aqiResult = calculateAQI(
      {
        pm25: payload.pm25,
        pm10: payload.pm10,
        co: payload.co,
        no2: payload.no2,
        so2: payload.so2,
        o3: payload.o3,
      },
      this.settings.aqi_standard
    );

    const newReading: SensorReading = {
      id,
      device_id: payload.device_id,
      pm25: Number(payload.pm25.toFixed(1)),
      pm10: Number(payload.pm10.toFixed(1)),
      co: Number(payload.co.toFixed(2)),
      no2: Number(payload.no2.toFixed(1)),
      so2: Number(payload.so2.toFixed(1)),
      o3: Number(payload.o3.toFixed(1)),
      temperature: Number(payload.temperature.toFixed(1)),
      humidity: Number(payload.humidity.toFixed(1)),
      timestamp,
      source: payload.source || 'physical',
      aqi: aqiResult.aqi,
      aqi_category: aqiResult.category,
      dnn_category: payload.dnn_category || aqiResult.category,
      dnn_confidence: payload.dnn_confidence,
    };

    this.readings.push(newReading);

    // Keep database size bounded in memory/disk to 3000 most recent records
    if (this.readings.length > 3000) {
      this.readings = this.readings.slice(this.readings.length - 2500);
    }

    // Update device stats
    const dev = this.devices.find((d) => d.id === payload.device_id);
    if (dev) {
      dev.last_seen = timestamp;
      dev.reading_count = (dev.reading_count || 0) + 1;
      this.saveDevices();
    } else {
      // Auto-register device if unknown
      this.registerDevice({
        id: payload.device_id,
        name: `Node ${payload.device_id}`,
      });
    }

    this.saveReadings();
    return newReading;
  }

  public getLatestReading(deviceId?: string): SensorReading | null {
    if (this.readings.length === 0) return null;
    if (deviceId) {
      for (let i = this.readings.length - 1; i >= 0; i--) {
        if (this.readings[i].device_id === deviceId) return this.readings[i];
      }
    }
    return this.readings[this.readings.length - 1];
  }

  public getReadings(params: {
    deviceId?: string;
    category?: AirQualityCategory;
    startDate?: string;
    endDate?: string;
    minPm25?: number;
    maxPm25?: number;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): {
    data: SensorReading[];
    total: number;
    page: number;
    totalPages: number;
  } {
    let list = [...this.readings];

    if (params.deviceId) {
      list = list.filter((r) => r.device_id === params.deviceId);
    }
    if (params.category) {
      list = list.filter((r) => r.dnn_category === params.category || r.aqi_category === params.category);
    }
    if (params.startDate) {
      const startMs = new Date(params.startDate).getTime();
      list = list.filter((r) => new Date(r.timestamp).getTime() >= startMs);
    }
    if (params.endDate) {
      const endMs = new Date(params.endDate).getTime();
      list = list.filter((r) => new Date(r.timestamp).getTime() <= endMs);
    }
    if (params.minPm25 !== undefined) {
      list = list.filter((r) => r.pm25 >= params.minPm25!);
    }
    if (params.maxPm25 !== undefined) {
      list = list.filter((r) => r.pm25 <= params.maxPm25!);
    }

    // Sort by timestamp
    const isAsc = params.sortOrder === 'asc';
    list.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return isAsc ? tA - tB : tB - tA;
    });

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const pagedData = list.slice(offset, offset + limit);

    return {
      data: pagedData,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Generates a 600-sample balanced dataset for Deep Neural Network training
   */
  public getTrainingDataset(): { features: number[]; category: AirQualityCategory }[] {
    const dataset: { features: number[]; category: AirQualityCategory }[] = [];

    // Distinct realistic concentration envelopes per category
    const archetypes: Record<AirQualityCategory, {
      pm25: [number, number];
      pm10: [number, number];
      co: [number, number];
      no2: [number, number];
      so2: [number, number];
      o3: [number, number];
      temp: [number, number];
      hum: [number, number];
    }> = {
      Good: {
        pm25: [5, 28],
        pm10: [10, 48],
        co: [0.1, 0.9],
        no2: [5, 38],
        so2: [2, 35],
        o3: [10, 48],
        temp: [18, 32],
        hum: [30, 60],
      },
      Satisfactory: {
        pm25: [31, 58],
        pm10: [51, 98],
        co: [1.0, 1.9],
        no2: [41, 78],
        so2: [41, 78],
        o3: [51, 98],
        temp: [20, 36],
        hum: [40, 70],
      },
      Moderate: {
        pm25: [61, 89],
        pm10: [101, 245],
        co: [2.1, 9.5],
        no2: [81, 175],
        so2: [81, 370],
        o3: [101, 165],
        temp: [22, 38],
        hum: [45, 75],
      },
      Poor: {
        pm25: [91, 118],
        pm10: [251, 345],
        co: [10.1, 16.5],
        no2: [181, 275],
        so2: [381, 780],
        o3: [169, 205],
        temp: [15, 30],
        hum: [50, 85],
      },
      'Very Poor': {
        pm25: [121, 245],
        pm10: [351, 425],
        co: [17.1, 33.5],
        no2: [281, 395],
        so2: [801, 1550],
        o3: [209, 450],
        temp: [12, 28],
        hum: [65, 92],
      },
      Severe: {
        pm25: [251, 480],
        pm10: [431, 650],
        co: [34.1, 48.0],
        no2: [401, 580],
        so2: [1601, 1980],
        o3: [451, 780],
        temp: [8, 24],
        hum: [75, 98],
      },
    };

    const categories: AirQualityCategory[] = [
      'Good',
      'Satisfactory',
      'Moderate',
      'Poor',
      'Very Poor',
      'Severe',
    ];

    const samplesPerCat = 120; // 6 * 120 = 720 samples total

    categories.forEach((cat) => {
      const arch = archetypes[cat];
      for (let s = 0; s < samplesPerCat; s++) {
        const randRange = (min: number, max: number) => min + Math.random() * (max - min);

        // Core features
        const pm25 = randRange(arch.pm25[0], arch.pm25[1]);
        const pm10 = randRange(arch.pm10[0], arch.pm10[1]);
        const co = randRange(arch.co[0], arch.co[1]);
        const no2 = randRange(arch.no2[0], arch.no2[1]);
        const so2 = randRange(arch.so2[0], arch.so2[1]);
        const o3 = randRange(arch.o3[0], arch.o3[1]);
        const temp = randRange(arch.temp[0], arch.temp[1]);
        const hum = randRange(arch.hum[0], arch.hum[1]);

        dataset.push({
          features: [
            Number(pm25.toFixed(1)),
            Number(pm10.toFixed(1)),
            Number(co.toFixed(2)),
            Number(no2.toFixed(1)),
            Number(so2.toFixed(1)),
            Number(o3.toFixed(1)),
            Number(temp.toFixed(1)),
            Number(hum.toFixed(1)),
          ],
          category: cat,
        });
      }
    });

    return dataset;
  }

  private saveReadings(): void {
    try {
      fs.writeFileSync(this.readingsFile, JSON.stringify(this.readings, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write readings file:', err);
    }
  }

  private saveDevices(): void {
    try {
      fs.writeFileSync(this.devicesFile, JSON.stringify(this.devices, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write devices file:', err);
    }
  }

  private saveSettings(): void {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write settings file:', err);
    }
  }

  public clearReadings(): void {
    this.readings = [];
    this.saveReadings();
  }
}
