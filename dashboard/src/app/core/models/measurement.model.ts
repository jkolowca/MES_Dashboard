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
  unit: string;
  min: number;
  max: number;
}

/**
 * Mock database payload representing the sensor configurations.
 */
export const MOCK_METADATA: Record<string, MeasurementMetadata> = {
  inletTemperature: { i18nKey: 'MEASUREMENTS.INLET_TEMP', unit: '°C', min: 38, max: 47 },
  outletTemperature: { i18nKey: 'MEASUREMENTS.OUTLET_TEMP', unit: '°C', min: 58, max: 67 },
  coolantPressure: { i18nKey: 'MEASUREMENTS.PRESSURE', unit: 'bar', min: 1.5, max: 2.8 },
  flowRate: { i18nKey: 'MEASUREMENTS.FLOW_RATE', unit: 'L/min', min: 90, max: 120 }
};
