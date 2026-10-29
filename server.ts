/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DataStore } from './server/dataStore.ts';
import { DeepNeuralNetwork } from './server/dnnEngine.ts';
import { IoTSimulator } from './server/iotSimulator.ts';
import { calculateAQI, getCategoryFromAQI } from './src/utils/aqiCalculator.ts';
import { AirQualityCategory } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize persistent data store and DNN engine
const dataStore = new DataStore();
const dnn = new DeepNeuralNetwork();

const MODEL_PATH = path.resolve(process.cwd(), 'data', 'dnn_model.json');

// Check if saved model exists; if not, train initial model with high accuracy on seed dataset
async function initModel() {
  const loaded = dnn.loadFromFile(MODEL_PATH);
  if (!loaded) {
    console.log('No pre-existing DNN model found on disk. Training initial model on CPCB seed dataset...');
    const trainData = dataStore.getTrainingDataset();
    await dnn.train(trainData, {
      epochs: 35,
      batchSize: 32,
      learningRate: 0.003,
      valSplit: 0.15,
      patience: 8,
    });
    dnn.saveToFile(MODEL_PATH);
    console.log(`Initial DNN model trained successfully. Test Accuracy: ${dnn.metrics?.accuracy}%`);
  } else {
    console.log(`Loaded existing DNN model v${dnn.version}. Evaluated Accuracy: ${dnn.metrics?.accuracy}%`);
  }
}

// Initialize IoT Simulator
let simulator: IoTSimulator;

initModel().then(() => {
  simulator = new IoTSimulator(dataStore, dnn);
});

/* ==========================================================================
   REST API Endpoints
   ========================================================================== */

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'IoT Air Quality DNN Classification API',
    version: '2.4.0',
    model_status: dnn.isTrained ? 'trained' : 'untrained',
    simulator_active: simulator ? simulator.getConfig().active : false,
  });
});

// 2. Dashboard summary
app.get('/api/dashboard/summary', (req: Request, res: Response) => {
  const settings = dataStore.getSettings();
  const latest = dataStore.getLatestReading();
  const devices = dataStore.getDevices();
  const allReadings = dataStore.getReadings({ limit: 1000 }).data;

  // Calculate AQI for latest reading
  let calculatedAqi = null;
  let latestPrediction = null;

  if (latest) {
    calculatedAqi = calculateAQI(latest, settings.aqi_standard);
    latestPrediction = dnn.predict([
      latest.pm25,
      latest.pm10,
      latest.co,
      latest.no2,
      latest.so2,
      latest.o3,
      latest.temperature,
      latest.humidity,
    ]);

    // Check discrepancy
    const matches = calculatedAqi.category === latestPrediction.predicted_category;
    latestPrediction.aqi_comparison = {
      aqi_category: calculatedAqi.category,
      aqi_value: calculatedAqi.aqi,
      matches_dnn: matches,
      explanation: matches
        ? `Both the ${settings.aqi_standard} regulatory index and the Deep Neural Network classified this reading as "${calculatedAqi.category}". The primary driver is ${calculatedAqi.prominent_pollutant} with a sub-index of ${calculatedAqi.aqi}.`
        : `Discrepancy noted: Regulatory ${settings.aqi_standard} classifies this as "${calculatedAqi.category}" (AQI ${calculatedAqi.aqi}), whereas the DNN model predicts "${latestPrediction.predicted_category}" (${(latestPrediction.confidence * 100).toFixed(1)}% confidence). The DNN incorporates multi-variable synergies including temperature, humidity, and joint toxicities not captured by linear single-pollutant maxima.`,
    };
  }

  // Category distribution
  const counts: Record<AirQualityCategory, number> = {
    Good: 0,
    Satisfactory: 0,
    Moderate: 0,
    Poor: 0,
    'Very Poor': 0,
    Severe: 0,
  };

  allReadings.forEach((r) => {
    const cat = r.dnn_category || r.aqi_category;
    if (cat && counts[cat] !== undefined) {
      counts[cat]++;
    }
  });

  const total = allReadings.length || 1;
  const category_distribution = Object.entries(counts).map(([cat, cnt]) => ({
    category: cat as AirQualityCategory,
    count: cnt,
    percentage: Number(((cnt / total) * 100).toFixed(1)),
  }));

  // Recent 24h trend (sampled 24 data points)
  const recent24h = allReadings.slice(-24).map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    aqi: r.aqi || 0,
    pm25: r.pm25,
    pm10: r.pm10,
    no2: r.no2,
    temperature: r.temperature,
    category: r.dnn_category || r.aqi_category || 'Moderate',
  }));

  const activeSensors = devices.filter((d) => d.status === 'online').length;

  res.json({
    latest_reading: latest,
    calculated_aqi: calculatedAqi,
    latest_prediction: latestPrediction,
    active_sensors_count: activeSensors,
    total_readings_count: allReadings.length,
    simulated_mode: simulator ? simulator.getConfig().active : true,
    system_status: activeSensors > 0 ? 'nominal' : 'warning',
    last_updated: latest?.timestamp || new Date().toISOString(),
    category_distribution,
    recent_trend_24h: recent24h,
  });
});

// 3. IoT Sensor Ingestion API
app.post('/api/sensors/readings', (req: Request, res: Response) => {
  const {
    device_id,
    pm25,
    pm10,
    co,
    no2,
    so2,
    o3,
    temperature,
    humidity,
    timestamp,
    source,
  } = req.body;

  // Validation rules
  if (!device_id || typeof device_id !== 'string') {
    return res.status(400).json({ error: 'Field "device_id" is required and must be a string' });
  }

  const numericFields = { pm25, pm10, co, no2, so2, o3, temperature, humidity };
  for (const [key, val] of Object.entries(numericFields)) {
    if (val === undefined || val === null || typeof val !== 'number' || isNaN(val)) {
      return res.status(400).json({ error: `Field "${key}" must be a valid numeric measurement` });
    }
  }

  if (pm25 < 0 || pm10 < 0 || co < 0 || no2 < 0 || so2 < 0 || o3 < 0) {
    return res.status(400).json({ error: 'Pollutant concentrations cannot be negative' });
  }

  if (humidity < 0 || humidity > 100) {
    return res.status(400).json({ error: 'Relative humidity must be between 0% and 100%' });
  }

  if (temperature < -50 || temperature > 70) {
    return res.status(400).json({ error: 'Temperature is outside realistic operational sensor bounds (-50°C to 70°C)' });
  }

  // Run DNN prediction
  const dnnResult = dnn.predict([pm25, pm10, co, no2, so2, o3, temperature, humidity]);

  const reading = dataStore.addReading({
    device_id,
    pm25,
    pm10,
    co,
    no2,
    so2,
    o3,
    temperature,
    humidity,
    timestamp: timestamp || new Date().toISOString(),
    source: source || 'physical',
    dnn_category: dnnResult.predicted_category,
    dnn_confidence: dnnResult.confidence,
  });

  res.status(201).json({
    success: true,
    message: 'Sensor reading ingested and classified successfully',
    reading,
    classification: dnnResult,
  });
});

// 4. Query Historical Sensor Readings
app.get('/api/sensors/readings', (req: Request, res: Response) => {
  const {
    device_id,
    category,
    startDate,
    endDate,
    minPm25,
    maxPm25,
    sortOrder,
    page,
    limit,
  } = req.query;

  const results = dataStore.getReadings({
    deviceId: device_id as string | undefined,
    category: category as AirQualityCategory | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
    minPm25: minPm25 ? parseFloat(minPm25 as string) : undefined,
    maxPm25: maxPm25 ? parseFloat(maxPm25 as string) : undefined,
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });

  res.json(results);
});

// 5. IoT Sensor Devices
app.get('/api/sensors', (req: Request, res: Response) => {
  const devices = dataStore.getDevices();
  res.json(devices);
});

app.post('/api/sensors', (req: Request, res: Response) => {
  const { id, name, location, coordinates } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Device id and name are required' });
  }
  const dev = dataStore.registerDevice({ id, name, location, coordinates });
  res.status(201).json(dev);
});

// 6. Deep Neural Network Prediction API (Single Reading)
app.post('/api/predict', (req: Request, res: Response) => {
  const { pm25, pm10, co, no2, so2, o3, temperature, humidity } = req.body;

  const fields = { pm25, pm10, co, no2, so2, o3, temperature, humidity };
  for (const [key, val] of Object.entries(fields)) {
    if (val === undefined || val === null || isNaN(Number(val))) {
      return res.status(400).json({ error: `Missing or invalid parameter "${key}"` });
    }
  }

  const features = [
    Number(pm25),
    Number(pm10),
    Number(co),
    Number(no2),
    Number(so2),
    Number(o3),
    Number(temperature),
    Number(humidity),
  ];

  const dnnResult = dnn.predict(features);

  // Regulatory calculation comparison
  const settings = dataStore.getSettings();
  const aqiResult = calculateAQI(
    {
      pm25: Number(pm25),
      pm10: Number(pm10),
      co: Number(co),
      no2: Number(no2),
      so2: Number(so2),
      o3: Number(o3),
    },
    settings.aqi_standard
  );

  const matches = aqiResult.category === dnnResult.predicted_category;
  dnnResult.aqi_comparison = {
    aqi_category: aqiResult.category,
    aqi_value: aqiResult.aqi,
    matches_dnn: matches,
    explanation: matches
      ? `Consensus: Both the ${settings.aqi_standard} index (${aqiResult.aqi}) and the trained Deep Neural Network classified this profile as "${aqiResult.category}". Key environmental driver: ${aqiResult.prominent_pollutant}.`
      : `Discrepancy: ${settings.aqi_standard} yields AQI ${aqiResult.aqi} ("${aqiResult.category}"), whereas DNN predicts "${dnnResult.predicted_category}" with ${(dnnResult.confidence * 100).toFixed(1)}% confidence. Non-linear thermodynamic interactions (Temp ${temperature}°C, Humidity ${humidity}%) influenced the neural representation.`,
  };

  res.json({
    prediction: dnnResult,
    aqi_calculation: aqiResult,
  });
});

// 7. Batch CSV Prediction API
app.post('/api/predict/batch', (req: Request, res: Response) => {
  const { readings } = req.body;
  if (!Array.isArray(readings) || readings.length === 0) {
    return res.status(400).json({ error: 'Expected non-empty array of readings in "readings"' });
  }

  if (readings.length > 500) {
    return res.status(400).json({ error: 'Batch prediction limit is 500 items per request' });
  }

  const results = readings.map((item, idx) => {
    const f = [
      Number(item.pm25 || 0),
      Number(item.pm10 || 0),
      Number(item.co || 0),
      Number(item.no2 || 0),
      Number(item.so2 || 0),
      Number(item.o3 || 0),
      Number(item.temperature || 25),
      Number(item.humidity || 50),
    ];
    const pred = dnn.predict(f);
    const aqi = calculateAQI(
      {
        pm25: f[0],
        pm10: f[1],
        co: f[2],
        no2: f[3],
        so2: f[4],
        o3: f[5],
      },
      dataStore.getSettings().aqi_standard
    );

    return {
      index: idx + 1,
      device_id: item.device_id || `BATCH-${idx + 1}`,
      inputs: {
        pm25: f[0],
        pm10: f[1],
        co: f[2],
        no2: f[3],
        so2: f[4],
        o3: f[5],
        temperature: f[6],
        humidity: f[7],
      },
      predicted_category: pred.predicted_category,
      confidence: pred.confidence,
      calculated_aqi: aqi.aqi,
      aqi_category: aqi.category,
    };
  });

  const categoryCounts: Record<string, number> = {};
  results.forEach((r) => {
    categoryCounts[r.predicted_category] = (categoryCounts[r.predicted_category] || 0) + 1;
  });

  res.json({
    total_processed: results.length,
    category_summary: categoryCounts,
    predictions: results,
  });
});

// 8. Analytics & Reports
app.get('/api/analytics', (req: Request, res: Response) => {
  const all = dataStore.getReadings({ limit: 2000 }).data;
  if (all.length === 0) {
    return res.json({
      summary: null,
      hourly_averages: [],
      pollutant_correlations: [],
    });
  }

  // Compute statistical aggregates
  const statsFor = (arr: number[]) => {
    const sum = arr.reduce((a, b) => a + b, 0);
    const mean = sum / arr.length;
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const variance = arr.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / arr.length;
    return {
      mean: Number(mean.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      std: Number(Math.sqrt(variance).toFixed(2)),
    };
  };

  const pm25List = all.map((r) => r.pm25);
  const pm10List = all.map((r) => r.pm10);
  const coList = all.map((r) => r.co);
  const no2List = all.map((r) => r.no2);
  const so2List = all.map((r) => r.so2);
  const o3List = all.map((r) => r.o3);

  // Hourly averages (0 - 23)
  const hourlyBuckets: { [hour: number]: { count: number; pm25: number; pm10: number; no2: number; aqi: number } } = {};
  for (let h = 0; h < 24; h++) {
    hourlyBuckets[h] = { count: 0, pm25: 0, pm10: 0, no2: 0, aqi: 0 };
  }

  all.forEach((r) => {
    const h = new Date(r.timestamp).getHours();
    hourlyBuckets[h].count++;
    hourlyBuckets[h].pm25 += r.pm25;
    hourlyBuckets[h].pm10 += r.pm10;
    hourlyBuckets[h].no2 += r.no2;
    hourlyBuckets[h].aqi += r.aqi || 0;
  });

  const hourlyAverages = Object.entries(hourlyBuckets).map(([h, b]) => ({
    hour: `${h.padStart(2, '0')}:00`,
    pm25: b.count ? Number((b.pm25 / b.count).toFixed(1)) : 0,
    pm10: b.count ? Number((b.pm10 / b.count).toFixed(1)) : 0,
    no2: b.count ? Number((b.no2 / b.count).toFixed(1)) : 0,
    aqi: b.count ? Math.round(b.aqi / b.count) : 0,
  }));

  res.json({
    summary: {
      total_records: all.length,
      pm25: statsFor(pm25List),
      pm10: statsFor(pm10List),
      co: statsFor(coList),
      no2: statsFor(no2List),
      so2: statsFor(so2List),
      o3: statsFor(o3List),
    },
    hourly_averages: hourlyAverages,
  });
});

// 9. Model Information & Metrics
app.get('/api/model/info', (req: Request, res: Response) => {
  res.json(dnn.getModelInfo());
});

app.get('/api/model/metrics', (req: Request, res: Response) => {
  if (!dnn.metrics) {
    return res.status(404).json({ error: 'Model has not completed evaluation yet' });
  }
  res.json(dnn.metrics);
});

// 10. Model Training Workbench
app.post('/api/model/train', async (req: Request, res: Response) => {
  const { epochs, batch_size, learning_rate } = req.body;

  const ep = Math.min(60, Math.max(5, parseInt(epochs || '30', 10)));
  const bs = Math.min(64, Math.max(8, parseInt(batch_size || '32', 10)));
  const lr = Math.min(0.05, Math.max(0.0001, parseFloat(learning_rate || '0.0025')));

  const trainDataset = dataStore.getTrainingDataset();

  const metrics = await dnn.train(trainDataset, {
    epochs: ep,
    batchSize: bs,
    learningRate: lr,
    valSplit: 0.15,
    patience: 8,
  });

  dnn.saveToFile(MODEL_PATH);

  res.json({
    success: true,
    message: `Model trained successfully over ${ep} epochs`,
    metrics,
    model_info: dnn.getModelInfo(),
  });
});

// 11. Sample Dataset / Download Template
app.get('/api/dataset/sample', (req: Request, res: Response) => {
  const dataset = dataStore.getTrainingDataset().slice(0, 100);
  res.json(dataset);
});

// 12. CSV Export
app.get('/api/reports/export', (req: Request, res: Response) => {
  const readings = dataStore.getReadings({ limit: 5000 }).data;
  const headers = [
    'Reading ID',
    'Device ID',
    'Timestamp (UTC)',
    'PM2.5 (ug/m3)',
    'PM10 (ug/m3)',
    'CO (mg/m3)',
    'NO2 (ug/m3)',
    'SO2 (ug/m3)',
    'O3 (ug/m3)',
    'Temperature (C)',
    'Humidity (%)',
    'Calculated AQI',
    'AQI Category',
    'DNN Predicted Category',
    'DNN Confidence',
    'Source',
  ];

  const rows = readings.map((r) => [
    r.id,
    r.device_id,
    r.timestamp,
    r.pm25,
    r.pm10,
    r.co,
    r.no2,
    r.so2,
    r.o3,
    r.temperature,
    r.humidity,
    r.aqi || '',
    r.aqi_category || '',
    r.dnn_category || '',
    r.dnn_confidence || '',
    r.source,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="iot_air_quality_telemetry.csv"');
  res.send(csvContent);
});

// 13. Simulator Controls
app.get('/api/simulator/config', (req: Request, res: Response) => {
  res.json(simulator ? simulator.getConfig() : dataStore.getSettings().simulator_config);
});

app.post('/api/simulator/config', (req: Request, res: Response) => {
  const updated = simulator.updateConfig(req.body);
  res.json(updated);
});

app.post('/api/simulator/toggle', (req: Request, res: Response) => {
  const current = simulator.getConfig();
  const updated = simulator.updateConfig({ active: !current.active });
  res.json(updated);
});

// 14. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(dataStore.getSettings());
});

app.post('/api/settings', (req: Request, res: Response) => {
  const updated = dataStore.updateSettings(req.body);
  res.json(updated);
});

// 15. Reset Data
app.post('/api/reset-data', (req: Request, res: Response) => {
  dataStore.clearReadings();
  res.json({ success: true, message: 'Sensor readings cleared' });
});

/* ==========================================================================
   Vite Middleware Mounting & Server Startup
   ========================================================================== */

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` IoT Air Quality DNN Monitoring Engine active on port ${PORT}`);
    console.log(` Health API: http://localhost:${PORT}/api/health`);
    console.log(` Web Dashboard: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
