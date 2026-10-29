# IoT Based Air Quality Classification Using Deep Neural Network (DNN) Model

An academic final-year capstone project implementing a complete cyber-physical IoT telemetry and deep learning monitoring system.

---

## 1. Project Overview
This platform monitors 8 environmental parameters in real time:
- **PM2.5** (Particulate Matter $\le 2.5\mu\text{m}$) in $\mu\text{g/m}^3$
- **PM10** (Particulate Matter $\le 10\mu\text{m}$) in $\mu\text{g/m}^3$
- **CO** (Carbon Monoxide) in $\text{mg/m}^3$
- **NO₂** (Nitrogen Dioxide) in $\mu\text{g/m}^3$
- **SO₂** (Sulfur Dioxide) in $\mu\text{g/m}^3$
- **O₃** (Ozone) in $\mu\text{g/m}^3$
- **Temperature** in $^{\circ}\text{C}$
- **Relative Humidity** in $\%$

Air quality is classified into 6 standardized categories:
1. **Good** (AQI 0 – 50)
2. **Satisfactory** (AQI 51 – 100)
3. **Moderate** (AQI 101 – 200)
4. **Poor** (AQI 201 – 300)
5. **Very Poor** (AQI 301 – 400)
6. **Severe** (AQI 401 – 500+)

The system produces two distinct outputs:
1. **CPCB Regulatory NAQI Calculation**: Sub-index piecewise linear interpolation identifying the dominant pollutant.
2. **Deep Neural Network (DNN) Classification**: Multi-layer non-linear neural mapping that evaluates joint atmospheric interactions and yields Softmax class probabilities.

---

## 2. Technology Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React icons.
- **Backend:** Node.js Express server running live with Vite middleware on port 3000; Python FastAPI backend code in `/backend/`.
- **Machine Learning Engine:** Multi-layer feedforward Deep Neural Network with Dense layers, ReLU activations, Dropout regularization, Adam optimizer, early stopping, Z-score standardizer, and independent test evaluation.
- **Database:** Persistent file-backed JSON / SQLite relational store in `/data/`.
- **IoT Layer:** Multi-device simulated telemetry generator with 5 environmental scenarios and physical REST API ingestion (`POST /api/sensors/readings`).

---

## 3. Quick Start & Execution

### Running the Live Full-Stack Application
```bash
# Install dependencies
npm install

# Start development full-stack server (serves REST API + React UI on port 3000)
npm run dev
```

### Running Python FastAPI Backend (Alternative Setup)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Automated Test Suite
```bash
# Python backend tests
pytest backend/tests/test_api.py
```

---

## 4. System Navigation
The application provides 9 dedicated modules:
1. **Dashboard:** Primary real-time overview, current AQI, DNN prediction, sensor status, continuous pollutant spectrum, 24h trend charts, and health advisory.
2. **Live Monitoring:** Real-time parameter dials, target device selector, simulator scenario orchestration, and manual sensor test injection form.
3. **Air Quality Classification:** Interactive inference sliders, Softmax probability distribution bars, CPCB vs. DNN discrepancy analysis, and batch CSV predictions.
4. **Historical Data:** Filterable, searchable, and sortable historical telemetry table with CSV report export.
5. **Analytics & Reports:** Descriptive statistics table (mean, standard deviation, min, max), 24-hour diurnal profile curves, and data downloads.
6. **IoT Devices:** Sensor fleet management, online/offline status, node enrollment modal, and hardware transducer specifications.
7. **DNN Model Information:** Architectural diagram, layer details, dataset train/test split, confusion matrix heatmap, per-class classification report, and live model training workbench.
8. **Settings:** AQI standard selection (CPCB NAQI vs US EPA), sampling interval, sensor noise, and database reset controls.
9. **About Project:** Academic abstract, 5-tier architecture, and mathematical formulations.

---

## 5. Educational Disclaimer
This system is an academic research and engineering demonstration tool. Sensor readings, model predictions, and recommendations do not constitute statutory environmental compliance data or medical counsel.
