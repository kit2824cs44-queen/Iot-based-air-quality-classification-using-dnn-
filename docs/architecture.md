# System Architecture

## IoT Based Air Quality Classification Using Deep Neural Network (DNN)

This project implements an end-to-end Cyber-Physical Environmental Sensing and Deep Learning architecture.

```
+---------------------------------------------------------------------------------+
|                       1. PHYSICAL TRANSDUCER & HARDWARE LAYER                  |
|  - Laser Particulate Sensor (PMS5003): PM2.5, PM10 (µg/m³)                      |
|  - Electrochemical Gas Sensors: CO (mg/m³), NO₂ (µg/m³), SO₂ (µg/m³), O₃ (µg/m³)|
|  - Digital Ambient Sensor (SHT31): Temperature (°C), Relative Humidity (%)      |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
|                       2. EMBEDDED TELEMETRY & NETWORK TRANSPORT                 |
|  - Microcontroller: Espressif ESP32 Dual-Core @ 240MHz                          |
|  - Transports: HTTP/1.1 REST JSON (`POST /api/sensors/readings`), MQTT TLS 8883 |
|  - In-Process Simulator: Multi-scenario environmental generator                 |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
|                       3. INGESTION, VALIDATION & PERSISTENT STORE              |
|  - Input Validation: Numerical boundaries, non-negative bounds, schema checks   |
|  - CPCB Sub-Index Calculator: Piecewise linear interpolation per standard       |
|  - Persistent Store: File-backed JSON / SQLite relational store                 |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
|                       4. MACHINE LEARNING: DEEP NEURAL NETWORK (DNN)            |
|  - Z-Score Feature Standardization: z = (x - µ) / σ                            |
|  - Dense(128, ReLU) -> Dropout(0.3) -> Dense(64, ReLU) -> Dropout(0.2)         |
|    -> Dense(32, ReLU) -> Dense(6, Softmax)                                      |
|  - Optimization: Adam (lr=0.0025, β₁=0.9, β₂=0.999), Early Stopping             |
|  - Evaluation: Independent test set confusion matrix, precision, recall, F1     |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
|                       5. REAL-TIME INTERACTIVE PRESENTATION LAYER               |
|  - React 19 + Tailwind CSS single page web application                          |
|  - Live telemetry dashboards, historical query filtering, Recharts curves       |
|  - Health advisories, model fine-tuning workbench, and batch CSV inference      |
+---------------------------------------------------------------------------------+
```
