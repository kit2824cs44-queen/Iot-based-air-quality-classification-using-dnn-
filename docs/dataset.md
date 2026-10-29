# Dataset Specification & AQI Breakpoints

## 1. Parameters Monitored
The system monitors 8 input dimensions:

| Parameter | Symbol | Measurement Unit | Operational Range | Primary Environmental Sources |
| :--- | :--- | :--- | :--- | :--- |
| **Particulate Matter 2.5** | PM2.5 | µg/m³ | 0 – 500+ | Vehicular exhaust, industrial combustion, biomass burning |
| **Particulate Matter 10** | PM10 | µg/m³ | 0 – 600+ | Road dust, construction activity, mechanical abrasion |
| **Carbon Monoxide** | CO | mg/m³ | 0 – 50 | Incomplete combustion in internal combustion engines |
| **Nitrogen Dioxide** | NO₂ | µg/m³ | 0 – 600 | High-temperature diesel combustion, thermal power plants |
| **Sulfur Dioxide** | SO₂ | µg/m³ | 0 – 2000 | Heavy fuel oil combustion, coal boilers, metal smelting |
| **Ozone** | O₃ | µg/m³ | 0 – 1000 | Photochemical secondary reaction: $NO_x + VOC + h\nu$ |
| **Ambient Temperature** | Temp | °C | -20 – 60 | Solar radiation, atmospheric heat exchange |
| **Relative Humidity** | RH | % | 0 – 100 | Atmospheric moisture, thermal inversion precursor |

---

## 2. Central Pollution Control Board (CPCB) India Breakpoints
The CPCB National Air Quality Index assigns sub-indices based on the 24-hour average concentration ranges:

| Category | AQI Range | PM2.5 (µg/m³) | PM10 (µg/m³) | NO₂ (µg/m³) | SO₂ (µg/m³) | CO (mg/m³, 8h) | O₃ (µg/m³, 8h) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Good** | 0 – 50 | 0 – 30 | 0 – 50 | 0 – 40 | 0 – 40 | 0 – 1.0 | 0 – 50 |
| **Satisfactory** | 51 – 100 | 31 – 60 | 51 – 100 | 41 – 80 | 41 – 80 | 1.1 – 2.0 | 51 – 100 |
| **Moderate** | 101 – 200 | 61 – 90 | 101 – 250 | 81 – 180 | 81 – 380 | 2.1 – 10.0 | 101 – 168 |
| **Poor** | 201 – 300 | 91 – 120 | 251 – 350 | 181 – 280 | 381 – 800 | 10.1 – 17.0 | 169 – 208 |
| **Very Poor** | 301 – 400 | 121 – 250 | 351 – 430 | 281 – 400 | 801 – 1600 | 17.1 – 34.0 | 209 – 748 |
| **Severe** | 401 – 500+ | 250+ | 430+ | 400+ | 1600+ | 34.0+ | 748+ |

---

## 3. Data Preprocessing & Leakage Prevention
To guarantee rigorous model generalizability and avoid data leakage:
1. Feature vectors are normalized using the fitted training set mean $\mu$ and standard deviation $\sigma$:
   $$z_j = \frac{x_j - \mu_j}{\sigma_j}$$
2. The independent test set is held out during standardization parameter computation and early stopping checks.
3. No target category indicators or AQI sub-index calculations are leaked into the feature matrix $\mathbf{X}$.
