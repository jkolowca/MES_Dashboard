import { Service, resource, signal, linkedSignal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MeasurementSeries, LiveMeasurement, DataPoint, MeasurementMetadata, MOCK_METADATA } from '../models/measurement.model';

/**
 * Service responsible for managing telemetry measurements, simulating real-time WebSocket
 * updates and REST API responses for historical charts.
 */
@Service()
export class MeasurementService {

  /** Metadata configuration for the sensors. */
  public readonly metadata = resource<Record<string, MeasurementMetadata>, void>({
    loader: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_METADATA;
    }
  });

  /** Selected chart time span (default: 8 hours). */
  public readonly timeSpan = signal<number>(8 * 60 * 60 * 1000);

  /** Maps the selected timeSpan to a clean data point resolution. */
  public readonly currentResolutionMs = computed(() => {
    const span = this.timeSpan();
    return span / 60;
  });

  /** Historical data loaded from simulated API based on selected timeSpan. */
  public readonly historicalData = resource<MeasurementSeries[], number>({
    params: () => this.timeSpan(),
    loader: async ({ params: span }) => {
      await new Promise(resolve => setTimeout(resolve, 800));

      const now = new Date();
      const start = new Date(now.getTime() - span);
      const intervalMs = this.currentResolutionMs();
      const dataPoints = Math.max(1, Math.floor(span / intervalMs));

      return Object.keys(MOCK_METADATA).map(type =>
        generateSeries(type, dataPoints, intervalMs, start)
      );
    }
  });

  /** Active historical chart data that resets on historicalData changes. */
  public readonly activeChartData = linkedSignal<MeasurementSeries[] | undefined, MeasurementSeries[]>({
    source: () => this.historicalData.value(),
    computation: (data) => data ? JSON.parse(JSON.stringify(data)) : []
  });

  /** Current state of live values for random walk simulation. */
  private readonly currentLiveValues: Record<string, number> = Object.keys(MOCK_METADATA).reduce((acc, key) => {
    const meta = MOCK_METADATA[key];
    acc[key] = +(meta.min + (meta.max - meta.min) / 2).toFixed(2);
    return acc;
  }, {} as Record<string, number>);

  /** Reactive real-time stream of live measurements running every 1 second. */
  public readonly latestLiveMeasurements = toSignal(
    interval(1000).pipe(
      map(() => {
        const date = new Date().toISOString();
        return Object.keys(this.currentLiveValues).map(type => {
          const meta = MOCK_METADATA[type];
          // Simple random walk clamped to safe boundaries
          const step = (Math.random() - 0.5) * meta.stepSize;
          const nextVal = Math.max(meta.min, Math.min(meta.max, this.currentLiveValues[type] + step));
          this.currentLiveValues[type] = +nextVal.toFixed(2);

          return { type, value: this.currentLiveValues[type], date };
        });
      }),
      tap(measurements => this.updateActiveChartData(measurements))
    ),
    { initialValue: [] as LiveMeasurement[] }
  );

  /** Updates the active chart data series with the latest live measurements. */
  private updateActiveChartData(measurements: LiveMeasurement[]): void {
    const currentData = this.activeChartData();
    if (!currentData || currentData.length === 0) return;

    const resolutionMs = this.currentResolutionMs();
    const cutoff = new Date().getTime() - this.timeSpan();

    this.activeChartData.update(seriesList =>
      seriesList.map(series => {
        const measurement = measurements.find(m => m.type === series.type);
        if (!measurement) return series;

        const data = [...series.data];
        const last = data[data.length - 1];
        const newTime = new Date(measurement.date).getTime();

        if (last && (newTime - new Date(last.date).getTime()) < resolutionMs) {
          // Update last point in same resolution bucket
          data[data.length - 1] = { date: measurement.date, value: measurement.value };
        } else {
          // Push to new bucket
          data.push({ date: measurement.date, value: measurement.value });
        }

        // Keep sliding window active by filtering older points
        return {
          ...series,
          data: data.filter(d => new Date(d.date).getTime() >= cutoff)
        };
      })
    );
  }
}

/** Generates simulated telemetry historical series using a random walk. */
function generateSeries(
  type: string,
  dataPoints: number,
  intervalMs: number,
  startDate: Date
): MeasurementSeries {
  const meta = MOCK_METADATA[type];
  const data: DataPoint[] = [];
  let currentValue = +(meta.min + (meta.max - meta.min) / 2).toFixed(2);
  const startTime = startDate.getTime();

  for (let i = 0; i <= dataPoints; i++) {
    const date = new Date(startTime + i * intervalMs).toISOString();
    const step = (Math.random() - 0.5) * meta.stepSize;
    currentValue = Math.max(meta.min, Math.min(meta.max, currentValue + step));
    data.push({ date, value: +currentValue.toFixed(2) });
  }

  return { type, data };
}
