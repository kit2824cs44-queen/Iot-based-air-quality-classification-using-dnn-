/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulatorConfig } from '../src/types/index.ts';
import { DataStore } from './dataStore.ts';
import { DeepNeuralNetwork } from './dnnEngine.ts';

export class IoTSimulator {
  private timer: NodeJS.Timeout | null = null;
  private currentDeviceIndex = 0;

  constructor(
    private dataStore: DataStore,
    private dnn: DeepNeuralNetwork
  ) {
    const config = this.dataStore.getSettings().simulator_config;
    if (config.active) {
      this.start();
    }
  }

  public getConfig(): SimulatorConfig {
    return this.dataStore.getSettings().simulator_config;
  }

  public updateConfig(partial: Partial<SimulatorConfig>): SimulatorConfig {
    const current = this.getConfig();
    const updated = { ...current, ...partial };
    this.dataStore.updateSettings({ simulator_config: updated });

    if (updated.active) {
      this.restart();
    } else {
      this.stop();
    }

    return updated;
  }

  public start(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    const config = this.getConfig();
    const intervalMs = Math.max(1000, config.interval_seconds * 1000);

    this.timer = setInterval(() => {
      this.step();
    }, intervalMs);

    this.dataStore.updateSettings({
      simulator_config: { ...config, active: true },
    });
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const config = this.getConfig();
    this.dataStore.updateSettings({
      simulator_config: { ...config, active: false },
    });
  }

  public restart(): void {
    this.stop();
    this.start();
  }

  /**
   * Generates a single continuous reading step for one IoT sensor device
   */
  public step(): void {
    const config = this.getConfig();
    if (!config.devices || config.devices.length === 0) return;

    const deviceId = config.devices[this.currentDeviceIndex % config.devices.length];
    this.currentDeviceIndex++;

    const now = new Date();
    const hour = now.getHours();

    // Noise scale
    let noiseFactor = 0.05;
    if (config.noise_level === 'moderate') noiseFactor = 0.12;
    if (config.noise_level === 'high') noiseFactor = 0.25;

    const noise = () => (Math.random() * 2 - 1) * noiseFactor;

    // Baseline profiles per scenario
    let base = {
      pm25: 45,
      pm10: 85,
      co: 1.2,
      no2: 45,
      so2: 25,
      o3: 40,
      temperature: 28,
      humidity: 55,
    };

    switch (config.scenario) {
      case 'traffic_peak':
        base = {
          pm25: 115,
          pm10: 275,
          co: 12.5,
          no2: 215,
          so2: 75,
          o3: 110,
          temperature: 31,
          humidity: 48,
        };
        break;
      case 'industrial_surge':
        base = {
          pm25: 145,
          pm10: 340,
          co: 15.2,
          no2: 240,
          so2: 420,
          o3: 130,
          temperature: 33,
          humidity: 60,
        };
        break;
      case 'clean_rural':
        base = {
          pm25: 16,
          pm10: 34,
          co: 0.45,
          no2: 15,
          so2: 6,
          o3: 32,
          temperature: 24,
          humidity: 50,
        };
        break;
      case 'stagnant_inversion':
        base = {
          pm25: 295,
          pm10: 460,
          co: 32.0,
          no2: 380,
          so2: 360,
          o3: 175,
          temperature: 14,
          humidity: 92,
        };
        break;
      case 'realistic_urban':
      default:
        // Diurnal traffic cycle: morning 8-10, evening 18-21
        const isRush = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21);
        if (deviceId === 'AQI-DEVICE-001' && isRush) {
          base = { pm25: 95, pm10: 210, co: 6.8, no2: 145, so2: 55, o3: 75, temperature: 29, humidity: 58 };
        } else if (deviceId === 'AQI-DEVICE-002') {
          base = { pm25: 82, pm10: 185, co: 4.2, no2: 95, so2: 160, o3: 65, temperature: 30, humidity: 54 };
        } else if (deviceId === 'AQI-DEVICE-004') {
          base = { pm25: 28, pm10: 58, co: 0.8, no2: 28, so2: 12, o3: 45, temperature: 26, humidity: 62 };
        } else {
          base = { pm25: 52, pm10: 95, co: 1.6, no2: 58, so2: 28, o3: 55, temperature: 28, humidity: 56 };
        }
        break;
    }

    const pm25 = Math.max(1, Number((base.pm25 * (1 + noise())).toFixed(1)));
    const pm10 = Math.max(pm25 + 5, Number((base.pm10 * (1 + noise())).toFixed(1)));
    const co = Math.max(0.05, Number((base.co * (1 + noise())).toFixed(2)));
    const no2 = Math.max(1, Number((base.no2 * (1 + noise())).toFixed(1)));
    const so2 = Math.max(1, Number((base.so2 * (1 + noise())).toFixed(1)));
    const o3 = Math.max(1, Number((base.o3 * (1 + noise())).toFixed(1)));
    const temperature = Number((base.temperature + noise() * 2).toFixed(1));
    const humidity = Math.min(99, Math.max(15, Number((base.humidity + noise() * 5).toFixed(1))));

    // Run DNN classification on the new reading
    const dnnResult = this.dnn.predict([
      pm25,
      pm10,
      co,
      no2,
      so2,
      o3,
      temperature,
      humidity,
    ]);

    this.dataStore.addReading({
      device_id: deviceId,
      pm25,
      pm10,
      co,
      no2,
      so2,
      o3,
      temperature,
      humidity,
      timestamp: now.toISOString(),
      source: 'simulated',
      dnn_category: dnnResult.predicted_category,
      dnn_confidence: dnnResult.confidence,
    });
  }
}
