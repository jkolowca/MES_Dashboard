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
   * Selected time span for historical data in milliseconds.
   */
  public timeSpan = signal<number>(8 * 60 * 60 * 1000);

  /**
   * Simulated REST API returning historical data series.
   */
  public historicalData = resource<MeasurementSeries[], number>({
    params: () => this.timeSpan(),
    loader: async ({ params: span }) => {
      await new Promise(resolve => setTimeout(resolve, 800));

      const now = new Date();
      const start = new Date(now.getTime() - span);
      // Calculate target interval based on desired number of points (~90 points)
      const rawInterval = span / 90;
      
      // Standard human-readable intervals
      const NICE_INTERVALS = [
        60 * 1000,          // 1 minute
        5 * 60 * 1000,      // 5 minutes
        15 * 60 * 1000,     // 15 minutes
        30 * 60 * 1000,     // 30 minutes
        60 * 60 * 1000,     // 1 hour
        2 * 60 * 60 * 1000  // 2 hours
      ];

      // Find the closest standard interval
      const intervalMs = NICE_INTERVALS.reduce((prev, curr) => 
        Math.abs(curr - rawInterval) < Math.abs(prev - rawInterval) ? curr : prev
      );

      // Calculate how many data points are between the start and end dates
      const diffMs = now.getTime() - start.getTime();
      const dataPoints = Math.max(1, Math.floor(diffMs / intervalMs));

      return [
        generateSeries('inletTemperature', 42, 1, dataPoints, intervalMs, start),
        generateSeries('outletTemperature', 62, 1, dataPoints, intervalMs, start),
        generateSeries('coolantPressure', 2.1, 0.1, dataPoints, intervalMs, start),
        generateSeries('flowRate', 105, 2, dataPoints, intervalMs, start)
      ];
    }
  });

  /** Current state for the live random walk */
  private currentLiveValues: Record<string, number> = {
    inletTemperature: 42,
    outletTemperature: 62,
    coolantPressure: 2.1,
    flowRate: 105
  };

  /**
   * Simulated WebSocket stream emitting new data every 2s.
   */
  public getLiveUpdates(): Observable<LiveMeasurement[]> {
    return interval(2000).pipe(
      map(() => {
        const date = new Date().toISOString();
        const stepSizes: Record<string, number> = {
          inletTemperature: 0.5,
          outletTemperature: 0.5,
          coolantPressure: 0.05,
          flowRate: 1
        };

        return Object.keys(this.currentLiveValues).map(type => {
          this.currentLiveValues[type] = generateNextValue(type, this.currentLiveValues[type], stepSizes[type]);
          return { type, value: this.currentLiveValues[type], date };
        });
      }),
      tap(measurements => {
        this.latestLiveMeasurements.set(measurements);
      })
    );
  }
}

/**
 * Generates a historical data series using a random walk.
 */
function generateSeries(
  type: string,
  startValue: number,
  stepSize: number,
  dataPoints: number,
  intervalMs: number,
  startDate: Date = new Date()): MeasurementSeries {
  const data: DataPoint[] = [];
  let currentValue = startValue;

  for (let i = 0; i <= dataPoints; i++) {
    const date = new Date(startDate.getTime() + i * intervalMs).toISOString();
    currentValue = generateNextValue(type, currentValue, stepSize);
    data.push({ date, value: currentValue });
  }
  return { type, data };
}

/**
 * Calculates the next value in a random walk, with occasional edge cases and soft boundaries.
 */
function generateNextValue(type: string, current: number, stepSize: number): number {
  const { min, max } = MOCK_METADATA[type];

  // 1% chance of an edge case spike
  if (Math.random() < 0.01) {
    return +(Math.random() > 0.5 ? max + stepSize : min - stepSize).toFixed(2);
  }

  // Simple random walk
  let next = current + (Math.random() - 0.5) * stepSize;

  // Keep it mostly in the safe zone
  const safeMax = max - (max - min) * 0.2;
  const safeMin = min + (max - min) * 0.2;

  if (next > safeMax) next -= stepSize;
  if (next < safeMin) next += stepSize;

  return +next.toFixed(2);
}
