/**
 * Represents a single point in time for a specific metric.
 */
export interface DataPoint {
  date: string;
  value: number;
}

/**
 * Represents a grouped collection of historical data points for a specific metric.
 */
export interface MeasurementSeries {
  type: string;
  data: DataPoint[];
}

/**
 * Represents a real-time data emission from the live WebSocket stream.
 */
export interface LiveMeasurement {
  type: string;
  value: number;
  date: string;
}

/**
 * Metadata defining the properties and operating thresholds of a measurement type.
 */
export interface MeasurementMetadata {
  i18nKey: string;
  chartI18nKey: string;
  unit: string;
  min: number;
  max: number;
  color: string;
  axis: string;
  stepSize: number;
}

/**
 * Dynamic translation helper mapping translation keys to localized strings using $localize.
 */
export function translateMetadataKey(i18nKey: string): string {
  switch (i18nKey) {
    case 'MEASUREMENTS.INLET_TEMP':
      return $localize`:@@MEASUREMENTS.INLET_TEMP:Inlet Temperature`;
    case 'MEASUREMENTS.OUTLET_TEMP':
      return $localize`:@@MEASUREMENTS.OUTLET_TEMP:Outlet Temperature`;
    case 'MEASUREMENTS.PRESSURE':
      return $localize`:@@MEASUREMENTS.PRESSURE:Coolant Pressure`;
    case 'MEASUREMENTS.FLOW_RATE':
      return $localize`:@@MEASUREMENTS.FLOW_RATE:Flow Rate`;
    case 'CHART.INLET_TEMP':
      return $localize`:@@CHART.INLET_TEMP:Inlet Temp`;
    case 'CHART.OUTLET_TEMP':
      return $localize`:@@CHART.OUTLET_TEMP:Outlet Temp`;
    case 'CHART.PRESSURE':
      return $localize`:@@CHART.PRESSURE:Pressure`;
    case 'CHART.FLOW':
      return $localize`:@@CHART.FLOW:Flow Rate`;
    default:
      return i18nKey;
  }
}

/**
 * Mock database payload representing the sensor configurations.
 */
export const MOCK_METADATA: Record<string, MeasurementMetadata> = {
  inletTemperature: {
    i18nKey: 'MEASUREMENTS.INLET_TEMP',
    chartI18nKey: 'CHART.INLET_TEMP',
    unit: '°C',
    min: 38,
    max: 47,
    color: '#3b82f6',
    axis: 'yTemperature',
    stepSize: 0.5
  },
  outletTemperature: {
    i18nKey: 'MEASUREMENTS.OUTLET_TEMP',
    chartI18nKey: 'CHART.OUTLET_TEMP',
    unit: '°C',
    min: 58,
    max: 67,
    color: '#f59e0b',
    axis: 'yTemperature',
    stepSize: 0.5
  },
  coolantPressure: {
    i18nKey: 'MEASUREMENTS.PRESSURE',
    chartI18nKey: 'CHART.PRESSURE',
    unit: 'bar',
    min: 1.5,
    max: 2.8,
    color: '#8b5cf6',
    axis: 'yPressure',
    stepSize: 0.05
  },
  flowRate: {
    i18nKey: 'MEASUREMENTS.FLOW_RATE',
    chartI18nKey: 'CHART.FLOW',
    unit: 'L/min',
    min: 90,
    max: 120,
    color: '#10b981',
    axis: 'yFlow',
    stepSize: 1
  }
};

