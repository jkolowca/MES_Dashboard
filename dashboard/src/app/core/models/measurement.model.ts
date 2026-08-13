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
  name: string;
  unit: string;
  min: number;
  max: number;
  color: string;
  axis: string;
  stepSize: number;
}

/**
 * Mock database payload representing the sensor configurations.
 */
export const MOCK_METADATA: Record<string, MeasurementMetadata> = {
  inletTemperature: {
    name: 'Inlet Temperature',
    unit: '°C',
    min: 38,
    max: 47,
    color: '#3b82f6',
    axis: 'yTemperature',
    stepSize: 0.5
  },
  outletTemperature: {
    name: 'Outlet Temperature',
    unit: '°C',
    min: 58,
    max: 67,
    color: '#f59e0b',
    axis: 'yTemperature',
    stepSize: 0.5
  },
  coolantPressure: {
    name: 'Coolant Pressure',
    unit: 'bar',
    min: 1.5,
    max: 2.8,
    color: '#8b5cf6',
    axis: 'yPressure',
    stepSize: 0.05
  },
  flowRate: {
    name: 'Flow Rate',
    unit: 'L/min',
    min: 90,
    max: 120,
    color: '#10b981',
    axis: 'yFlow',
    stepSize: 1
  }
};
