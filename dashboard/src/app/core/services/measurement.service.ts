import { Service, resource, signal, WritableSignal } from '@angular/core';
import { MeasurementSeries, LiveMeasurement, DataPoint, MeasurementMetadata, MOCK_METADATA } from '../models/measurement.model';
import { interval, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * Service simulating backend REST API and WebSocket streams.
 */
@Service()
export class MeasurementService {

  /**
   * Signal exposing the latest live measurements array.
   */
  public readonly latestLiveMeasurements: WritableSignal<LiveMeasurement[]> = signal([]);

  /**
   * Simulated REST API returning the configuration metadata for the sensors.
   */
  public metadata = resource<Record<string, MeasurementMetadata>, void>({
    loader: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_METADATA;
    }
  });

  /**
   * Signal holding the current date range for historical data requests.
   * Changing this signal will automatically trigger the resource to fetch new data.
   * Initial range: 1 hour.
   */
  public historicalDataRange: WritableSignal<{ start: Date; end: Date }> = signal({
    start: new Date(Date.now() - 60 * 60 * 1000),
    end: new Date()
  });

  /**
   * Simulated REST API returning historical data series.
   */
  public historicalData = resource<MeasurementSeries[], { start: Date; end: Date }>({
    params: () => this.historicalDataRange(),
    loader: async ({ params: range }) => {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Calculate how many data points are between the start and end dates (1 minute intervals)
      const diffMs = range.end.getTime() - range.start.getTime();
      const intervalMs = 60000;
      const dataPoints = Math.max(1, Math.floor(diffMs / intervalMs));

      return [
        generateSeries('inletTemperature', 40, 5, dataPoints, intervalMs, range.start),
        generateSeries('outletTemperature', 60, 5, dataPoints, intervalMs, range.start),
        generateSeries('coolantPressure', 2, 0.5, dataPoints, intervalMs, range.start),
        generateSeries('flowRate', 100, 10, dataPoints, intervalMs, range.start)
      ];
    }
  });

  /**
   * Simulated WebSocket stream emitting new data every 2s.
   */
  public getLiveUpdates(): Observable<LiveMeasurement[]> {
    return interval(2000).pipe(
      map(() => {
        const date = new Date().toISOString();
        return [
          { type: 'inletTemperature', value: calculateRandomValue(40, 5), date },
          { type: 'outletTemperature', value: calculateRandomValue(60, 5), date },
          { type: 'coolantPressure', value: calculateRandomValue(2, 0.5), date },
          { type: 'flowRate', value: calculateRandomValue(100, 10), date }
        ];
      }),
      tap(measurements => this.latestLiveMeasurements.set(measurements))
    );
  }
}

/**
 * Generates a historical data series.
 */
function generateSeries(
  type: string,
  baseValue: number,
  variance: number,
  dataPoints: number,
  intervalMs: number,
  startDate: Date = new Date()): MeasurementSeries {
  const data: DataPoint[] = [];
  for (let i = 0; i <= dataPoints; i++) {
    const date = new Date(startDate.getTime() + i * intervalMs).toISOString();
    const value = calculateRandomValue(baseValue, variance);
    data.push({ date, value });
  }
  return { type, data };
}

/**
 * Calculates a random value within a given variance.
 */
function calculateRandomValue(baseValue: number, variance: number): number {
  return +(Math.random() * variance + baseValue).toFixed(2);
}
