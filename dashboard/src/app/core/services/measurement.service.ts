import { Service, resource, signal, linkedSignal, computed, effect } from '@angular/core';
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

  /** Selected chart time span (default: 10 minutes). */
  public readonly timeSpan = signal<number>(10 * 60 * 1000);

  /** Maps the selected timeSpan to a resolution rounded to the nearest whole second. */
  public readonly currentResolutionMs = computed(() => {
    const span = this.timeSpan();
    return Math.round(span / 120 / 1000) * 1000;
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
    computation: (data) => data ? structuredClone(data) : []
  });

  /** Current state of live values for random walk simulation. */
  private readonly currentLiveValues: Record<string, number> = Object.keys(MOCK_METADATA).reduce((acc, key) => {
    const meta = MOCK_METADATA[key];
    acc[key] = +((meta.min + meta.max) / 2).toFixed(2);
    return acc;
  }, {} as Record<string, number>);

  constructor() {
    // Seed live values from the end of each historical series so the simulation
    // continues seamlessly without a visible jump at the history/live seam.
    effect(() => {
      const data = this.historicalData.value();
      if (!data) return;
      data.forEach(series => {
        const lastPoint = series.data[series.data.length - 1];
        if (lastPoint) this.currentLiveValues[series.type] = lastPoint.value;
      });
    });
  }

  /** Reactive real-time stream of live measurements running every 1 second. */
  public readonly latestLiveMeasurements = toSignal(
    interval(1000).pipe(
      // Advance the random walk state — side effect belongs in tap, not map
      tap(() => {
        Object.keys(this.currentLiveValues).forEach(type => {
          this.currentLiveValues[type] = getNextSimulationValue(this.currentLiveValues[type], MOCK_METADATA[type]);
        });
      }),
      // Pure snapshot of the current values after advancing
      map(tick => ({
        tick,
        measurements: Object.keys(this.currentLiveValues).map(type => ({
          type,
          value: this.currentLiveValues[type],
          date: new Date().toISOString()
        }))
      })),
      // Only update chart data on resolution-aligned ticks; toSignal still receives every second
      tap(({ tick, measurements }) => {
        const resolutionSeconds = this.currentResolutionMs() / 1000;
        if (tick % resolutionSeconds === 0) {
          this.updateActiveChartData(measurements);
        }
      }),
      map(({ measurements }) => measurements)
    ),
    { initialValue: [] as LiveMeasurement[] }
  );

  /**
   * Appends a live measurement tick to the active chart data and trims the sliding time window.
   * Only called on resolution-aligned ticks — the filtering is handled upstream in the RxJS pipe.
   */
  private updateActiveChartData(measurements: LiveMeasurement[]): void {
    const currentData = this.activeChartData();
    if (!currentData || currentData.length === 0) return;

    const firstMeasurement = measurements.find(m => m.type === currentData[0].type);
    if (!firstMeasurement) return;

    const newTime = Date.parse(firstMeasurement.date);
    const cutoff = newTime - this.timeSpan();

    this.activeChartData.update(seriesList =>
      seriesList.map(series => {
        const measurement = measurements.find(m => m.type === series.type);
        if (!measurement) return series;
        return {
          ...series,
          data: [...series.data, { date: measurement.date, value: measurement.value }]
            .filter(d => Date.parse(d.date) >= cutoff)
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
  let currentValue = +((meta.min + meta.max) / 2).toFixed(2);
  const startTime = startDate.getTime();

  for (let i = 0; i <= dataPoints; i++) {
    const date = new Date(startTime + i * intervalMs).toISOString();
    currentValue = getNextSimulationValue(currentValue, meta);
    data.push({ date, value: currentValue });
  }

  return { type, data };
}

/**
 * Calculates the next step in a random walk simulation for a telemetry metric.
 * Includes a margin of 15% outside the normal boundaries to simulate outliers.
 * Applies a conditional "gravity" pull force once the value drifts outside the safe range.
 */
function getNextSimulationValue(currentVal: number, meta: MeasurementMetadata): number {
  const range = meta.max - meta.min;
  const margin = range * 0.15;

  let pull = 0;
  if (currentVal > meta.max) {
    pull = (meta.max - currentVal) * 0.15; // Pull down towards the safe range
  } else if (currentVal < meta.min) {
    pull = (meta.min - currentVal) * 0.15; // Pull up towards the safe range
  }

  const step = (Math.random() - 0.5) * meta.stepSize + pull;
  const nextVal = Math.max(meta.min - margin, Math.min(meta.max + margin, currentVal + step));
  return +nextVal.toFixed(2);
}
