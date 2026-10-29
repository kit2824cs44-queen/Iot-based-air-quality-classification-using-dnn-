/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AirQualityCategory, AQICalculationResult, AQIStandard } from '../types/index.ts';

/**
 * Breakpoint definition for a pollutant sub-index.
 */
interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

/**
 * CPCB (India National AQI) Official Breakpoints:
 * Sub-index bands:
 * Good: 0 - 50
 * Satisfactory: 51 - 100
 * Moderate: 101 - 200
 * Poor: 201 - 300
 * Very Poor: 301 - 400
 * Severe: 401 - 500
 */
const CPCB_BREAKPOINTS: Record<string, Breakpoint[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 30, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 60, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 90, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 120, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 250, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 100, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 250, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 350, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 430, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 40, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 80, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 180, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 280, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 400, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 40, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 80, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 380, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 800, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1600, cHigh: 2000, iLow: 401, iHigh: 500 },
  ],
  co: [ // mg/m³
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.0, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.0, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.0, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.0, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.0, cHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 100, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 168, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 208, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 748, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

/**
 * US EPA Breakpoints (standardized to 6 categories for comparability)
 */
const EPA_BREAKPOINTS: Record<string, Breakpoint[]> = {
  pm25: [
    { cLow: 0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
    { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
    { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
    { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
    { cLow: 1250, cHigh: 2049, iLow: 301, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
    { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
    { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
    { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
    { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
    { cLow: 605, cHigh: 1004, iLow: 301, iHigh: 500 },
  ],
  co: [ // mg/m³
    { cLow: 0, cHigh: 5.0, iLow: 0, iHigh: 50 },
    { cLow: 5.1, cHigh: 10.8, iLow: 51, iHigh: 100 },
    { cLow: 10.9, cHigh: 14.2, iLow: 101, iHigh: 150 },
    { cLow: 14.3, cHigh: 17.6, iLow: 151, iHigh: 200 },
    { cLow: 17.7, cHigh: 34.8, iLow: 201, iHigh: 300 },
    { cLow: 34.9, cHigh: 57.2, iLow: 301, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
    { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
    { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
    { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
    { cLow: 201, cHigh: 500, iLow: 301, iHigh: 500 },
  ],
};

/**
 * Calculates a single pollutant sub-index given concentration and breakpoint table.
 */
function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration < 0 || isNaN(concentration)) return 0;

  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const idx = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(idx);
    }
  }

  // Handle concentration higher than max defined breakpoint
  const highestBp = breakpoints[breakpoints.length - 1];
  if (concentration > highestBp.cHigh) {
    const idx = ((highestBp.iHigh - highestBp.iLow) / (highestBp.cHigh - highestBp.cLow)) * (concentration - highestBp.cLow) + highestBp.iLow;
    return Math.min(500, Math.round(idx));
  }

  return 0;
}

/**
 * Maps numeric AQI value to category according to CPCB Indian NAQI standard.
 */
export function getCategoryFromAQI(aqi: number, standard: AQIStandard = 'CPCB_INDIA'): AirQualityCategory {
  if (standard === 'CPCB_INDIA') {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 200) return 'Moderate';
    if (aqi <= 300) return 'Poor';
    if (aqi <= 400) return 'Very Poor';
    return 'Severe';
  } else {
    // EPA mapping to 6 uniform academic categories
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory'; // EPA Moderate
    if (aqi <= 150) return 'Moderate';     // EPA Unhealthy for Sensitive Groups
    if (aqi <= 200) return 'Poor';         // EPA Unhealthy
    if (aqi <= 300) return 'Very Poor';    // EPA Very Unhealthy
    return 'Severe';                       // EPA Hazardous
  }
}

/**
 * Get category metadata for UI styling and accessibility.
 */
export function getCategoryMetadata(category: AirQualityCategory) {
  switch (category) {
    case 'Good':
      return {
        label: 'Good',
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800',
        badgeBg: 'bg-emerald-600',
        description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
        aqiRange: '0 - 50',
      };
    case 'Satisfactory':
      return {
        label: 'Satisfactory',
        color: 'text-teal-700 dark:text-teal-400',
        bg: 'bg-teal-50 dark:bg-teal-950/40',
        border: 'border-teal-200 dark:border-teal-800',
        badgeBg: 'bg-teal-600',
        description: 'Minor breathing discomfort to sensitive people; acceptable for general population.',
        aqiRange: '51 - 100',
      };
    case 'Moderate':
      return {
        label: 'Moderate',
        color: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800',
        badgeBg: 'bg-amber-600',
        description: 'Breathing discomfort to people with lungs, asthma and heart diseases.',
        aqiRange: '101 - 200',
      };
    case 'Poor':
      return {
        label: 'Poor',
        color: 'text-orange-700 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        border: 'border-orange-200 dark:border-orange-800',
        badgeBg: 'bg-orange-600',
        description: 'Breathing discomfort to most people on prolonged exposure.',
        aqiRange: '201 - 300',
      };
    case 'Very Poor':
      return {
        label: 'Very Poor',
        color: 'text-rose-700 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-200 dark:border-rose-800',
        badgeBg: 'bg-rose-600',
        description: 'Respiratory illness on prolonged exposure; severe effect on sensitive groups.',
        aqiRange: '301 - 400',
      };
    case 'Severe':
      return {
        label: 'Severe',
        color: 'text-purple-700 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        border: 'border-purple-200 dark:border-purple-800',
        badgeBg: 'bg-purple-700',
        description: 'Affects healthy people and seriously impacts those with existing diseases.',
        aqiRange: '401 - 500+',
      };
  }
}

/**
 * Generates health advisories based on the classified category.
 */
export function getHealthAdvisory(category: AirQualityCategory) {
  switch (category) {
    case 'Good':
      return {
        general: 'Air quality is ideal for all outdoor activities.',
        sensitive_groups: 'No restrictions needed for children or elderly.',
        outdoor_activity: 'Normal outdoor activities and exercise recommended.',
        protective_measures: 'No masks or air purification required.',
      };
    case 'Satisfactory':
      return {
        general: 'Acceptable air quality for the general public.',
        sensitive_groups: 'Individuals unusually sensitive to ozone or particulate matter should monitor symptoms.',
        outdoor_activity: 'Safe for general outdoor recreation and sports.',
        protective_measures: 'Ventilate indoor spaces during morning hours.',
      };
    case 'Moderate':
      return {
        general: 'Noticeable haze; potential irritation of eyes and respiratory tract.',
        sensitive_groups: 'Children, asthmatics, and senior citizens should reduce prolonged exertion outdoors.',
        outdoor_activity: 'Moderate activities permitted; avoid heavy cardio along congested roads.',
        protective_measures: 'Keep windows closed during heavy traffic peaks.',
      };
    case 'Poor':
      return {
        general: 'Increased likelihood of respiratory symptoms in healthy individuals.',
        sensitive_groups: 'People with respiratory or cardiac ailments should strictly stay indoors.',
        outdoor_activity: 'Avoid outdoor exercise and prolonged exposure.',
        protective_measures: 'Wear N95/FFP2 masks outdoors and run indoor HEPA purifiers.',
      };
    case 'Very Poor':
      return {
        general: 'Significant health alert: public exposure carries elevated risk of acute lung irritation.',
        sensitive_groups: 'High risk of aggravation of heart and lung conditions.',
        outdoor_activity: 'Suspension of all non-essential outdoor physical activities.',
        protective_measures: 'Seal doors and windows; use active particulate filtration indoors.',
      };
    case 'Severe':
      return {
        general: 'Emergency environmental conditions; potential serious health impact for the entire population.',
        sensitive_groups: 'Severe danger of medical emergencies for vulnerable demographics.',
        outdoor_activity: 'Strict stay-at-home advisory; completely avoid going outside.',
        protective_measures: 'Continuous medical-grade air filtration and emergency health preparedness.',
      };
  }
}

/**
 * Calculates complete AQI result according to specified regulatory standard.
 * Under CPCB guidelines:
 * - At least 3 pollutants must be monitored.
 * - At least one of PM2.5 or PM10 must be present.
 * - Overall AQI = max(sub-index of each available pollutant).
 */
export function calculateAQI(
  reading: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  },
  standard: AQIStandard = 'CPCB_INDIA'
): AQICalculationResult {
  const table = standard === 'CPCB_INDIA' ? CPCB_BREAKPOINTS : EPA_BREAKPOINTS;
  const subIndices: Record<string, number> = {};
  const missingCritical: string[] = [];

  if (reading.pm25 !== undefined && reading.pm25 >= 0) {
    subIndices.pm25 = calculateSubIndex(reading.pm25, table.pm25);
  }
  if (reading.pm10 !== undefined && reading.pm10 >= 0) {
    subIndices.pm10 = calculateSubIndex(reading.pm10, table.pm10);
  }
  if (reading.no2 !== undefined && reading.no2 >= 0) {
    subIndices.no2 = calculateSubIndex(reading.no2, table.no2);
  }
  if (reading.so2 !== undefined && reading.so2 >= 0) {
    subIndices.so2 = calculateSubIndex(reading.so2, table.so2);
  }
  if (reading.co !== undefined && reading.co >= 0) {
    subIndices.co = calculateSubIndex(reading.co, table.co);
  }
  if (reading.o3 !== undefined && reading.o3 >= 0) {
    subIndices.o3 = calculateSubIndex(reading.o3, table.o3);
  }

  // Verification checks for CPCB standard
  const hasParticulate = subIndices.pm25 !== undefined || subIndices.pm10 !== undefined;
  if (!hasParticulate) {
    missingCritical.push('PM2.5 or PM10');
  }

  const monitoredCount = Object.keys(subIndices).length;
  const isValid = monitoredCount >= 3 && hasParticulate;

  if (monitoredCount === 0) {
    return {
      aqi: 0,
      category: 'Good',
      standard,
      prominent_pollutant: 'None',
      sub_indices: {},
      is_valid: false,
      missing_critical_pollutants: ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3'],
      advisory: getHealthAdvisory('Good'),
    };
  }

  let maxSubIndex = 0;
  let prominent = 'PM2.5';

  for (const [pollutant, val] of Object.entries(subIndices)) {
    if (val >= maxSubIndex) {
      maxSubIndex = val;
      prominent = pollutant.toUpperCase();
    }
  }

  const category = getCategoryFromAQI(maxSubIndex, standard);

  return {
    aqi: maxSubIndex,
    category,
    standard,
    prominent_pollutant: prominent,
    sub_indices: subIndices,
    is_valid: isValid,
    missing_critical_pollutants: missingCritical.length > 0 ? missingCritical : undefined,
    advisory: getHealthAdvisory(category),
  };
}
