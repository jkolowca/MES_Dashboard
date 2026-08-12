import { Service, resource, signal, WritableSignal, linkedSignal, computed } from '@angular/core';
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
   * Calculated temporal resolution in milliseconds based on selected time span.
   */
  public readonly currentResolutionMs = computed(() => {
    const span = this.timeSpan();
    const rawInterval = span / 90;
    
    const NICE_INTERVALS = [
      60 * 1000,          // 1 minute
      5 * 60 * 1000,      // 5 minutes
      15 * 60 * 1000,     // 15 minutes
      30 * 60 * 1000,     // 30 minutes
      60 * 60 * 1000,     // 1 hour
      2 * 60 * 60 * 1000  // 2 hours
    ];

    return NICE_INTERVALS.reduce((prev, curr) => 
      Math.abs(curr - rawInterval) < Math.abs(prev - rawInterval) ? curr : prev
    );
  });

  /**
   * Simulated REST API returning historical data series.
   */
  public historicalData = resource<MeasurementSeries[], number>({
    params: () => this.timeSpan(),
    loader: async ({ params: span }) => {
      await new Promise(resolve => setTimeout(resolve, 800));

      const now = new Date();
      const start = new Date(now.getTime() - span);
      const intervalMs = this.currentResolutionMs();

      // Calculate how many data points are between the start and end dates
      const diffMs = now.getTime() - start.getTime();
      const dataPoints = Math.max(1, Math.floor(diffMs / intervalMs));

      return Object.keys(MOCK_METADATA).map(type => {
        const meta = MOCK_METADATA[type];
        const startValue = +(meta.min + (meta.max - meta.min) / 2).toFixed(2);
        return generateSeries(type, startValue, meta.stepSize, dataPoints, intervalMs, start);
      });
    }
  });

  /**
   * Linked signal holding the active historical chart data,
   * automatically resetting when historicalData resource resolves.
   */
  public readonly activeChartData = linkedSignal<MeasurementSeries[] | undefined, MeasurementSeries[]>({
    source: () => this.historicalData.value(),
    computation: (data) => data ? JSON.parse(JSON.stringify(data)) : []
  });

  /** Current state for the live random walk */
  private currentLiveValues: Record<string, number> = Object.keys(MOCK_METADATA).reduce((acc, key) => {
    const meta = MOCK_METADATA[key];
    acc[key] = +(meta.min + (meta.max - meta.min) / 2).toFixed(2);
    return acc;
  }, {} as Record<string, number>);

  /**
   * Simulated WebSocket stream emitting new data every 1s.
   */
  public getLiveUpdates(): Observable<LiveMeasurement[]> {
    return interval(1000).pipe(
      map(() => {
        const date = new Date().toISOString();

        return Object.keys(this.currentLiveValues).map(type => {
          const stepSize = MOCK_METADATA[type]?.stepSize || 1;
          this.currentLiveValues[type] = generateNextValue(type, this.currentLiveValues[type], stepSize);
          return { type, value: this.currentLiveValues[type], date };
        });
      }),
      tap(measurements => {
        this.latestLiveMeasurements.set(measurements);
        this.updateActiveChartData(measurements);
      })
    );
  }

  /**
   * Updates the active chart data series with the latest live measurements,
   * respecting the temporal resolution and maintaining a sliding window of timeSpan.
   */
  private updateActiveChartData(measurements: LiveMeasurement[]): void {
    const currentData = this.activeChartData();
    if (!currentData || currentData.length === 0) {
      return;
    }

    const resolutionMs = this.currentResolutionMs();
    const span = this.timeSpan();
    const nowTime = new Date().getTime();
    const cutoff = nowTime - span;

    this.activeChartData.update(seriesList => {
      return seriesList.map(series => {
        const measurement = measurements.find(m => m.type === series.type);
        if (!measurement) {
          return series;
        }

        const dataPoints = [...series.data];
        if (dataPoints.length === 0) {
          dataPoints.push({ date: measurement.date, value: measurement.value });
        } else {
          const lastPoint = dataPoints[dataPoints.length - 1];
          const lastTime = new Date(lastPoint.date).getTime();
          const newTime = new Date(measurement.date).getTime();
          const diff = newTime - lastTime;

          if (diff < resolutionMs) {
            // Within the same bucket: update the last point's value and date
            dataPoints[dataPoints.length - 1] = {
              date: measurement.date,
              value: measurement.value
            };
          } else {
            // New bucket: append new point
            dataPoints.push({
              date: measurement.date,
              value: measurement.value
            });
          }
        }

        // Keep only points within the sliding time window
        const trimmedPoints = dataPoints.filter(dp => new Date(dp.date).getTime() >= cutoff);

        return {
          ...series,
          data: trimmedPoints
        };
      });
    });
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
