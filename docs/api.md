# REST API Documentation

Base URL: `http://localhost:3000/api`

---

### 1. Ingest IoT Sensor Reading
`POST /api/sensors/readings`

**Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "device_id": "AQI-DEVICE-001",
  "pm25": 45.2,
  "pm10": 85.0,
  "co": 1.25,
  "no2": 42.0,
  "so2": 18.0,
  "o3": 35.0,
  "temperature": 28.5,
  "humidity": 55.0,
  "timestamp": "2026-10-28T12:00:00.000Z",
  "source": "physical"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Sensor reading ingested and classified successfully",
  "reading": {
    "id": "reading-1742080000000-123",
    "device_id": "AQI-DEVICE-001",
    "pm25": 45.2,
    "pm10": 85.0,
    "co": 1.25,
    "no2": 42.0,
    "so2": 18.0,
    "o3": 35.0,
    "temperature": 28.5,
    "humidity": 55.0,
    "timestamp": "2026-10-28T12:00:00.000Z",
    "aqi": 85,
    "aqi_category": "Satisfactory",
    "dnn_category": "Satisfactory",
    "dnn_confidence": 0.941
  },
  "classification": {
    "predicted_category": "Satisfactory",
    "confidence": 0.941,
    "class_probabilities": {
      "Good": 0.042,
      "Satisfactory": 0.941,
      "Moderate": 0.015,
      "Poor": 0.001,
      "Very Poor": 0.0,
      "Severe": 0.0
    }
  }
}
```

---

### 2. Deep Neural Network Prediction (Single Reading)
`POST /api/predict`

**Request Body:**
```json
{
  "pm25": 115.0,
  "pm10": 285.0,
  "co": 12.5,
  "no2": 215.0,
  "so2": 75.0,
  "o3": 110.0,
  "temperature": 31.0,
  "humidity": 48.0
}
```

---

### 3. Query Historical Readings
`GET /api/sensors/readings?device_id=AQI-DEVICE-001&category=Poor&page=1&limit=20`

---

### 4. Retrain DNN Model
`POST /api/model/train`

**Request Body:**
```json
{
  "epochs": 35,
  "batch_size": 32,
  "learning_rate": 0.0025
}
```

---

### 5. Export Telemetry CSV
`GET /api/reports/export`
Returns downloadable CSV file with all historical telemetry.
