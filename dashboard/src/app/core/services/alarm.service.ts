import { Service, inject, linkedSignal } from '@angular/core';
import { MeasurementService } from './measurement.service';
import { LiveMeasurement } from '../models/measurement.model';

export interface SystemAlarm {
  statusType: 'danger' | 'warning' | 'info';
  statusLabel: string;
  alarmMessage: string;
  time: string;
  metricType?: string;
}

const INITIAL_ALARMS: SystemAlarm[] = [
  {
    statusType: 'danger',
    statusLabel: $localize`Critical`,
    alarmMessage: $localize`Pressure exceeds safety limits in sector 7G`,
    time: '10:45:02'
  },
  {
    statusType: 'warning',
    statusLabel: $localize`Warning`,
    alarmMessage: $localize`Coolant flow rate below optimal threshold`,
    time: '10:42:15'
  },
  {
    statusType: 'info',
    statusLabel: $localize`Info`,
    alarmMessage: $localize`Routine maintenance scheduled for pump 3`,
    time: '09:00:00'
  }
];

@Service()
export class AlarmService {
  private readonly measurementService = inject(MeasurementService);

  /**
   * Linked signal derived from live measurements, which can also be written to (e.g., cleared).
   * Automatically monitors incoming telemetry and appends new critical alarms.
   */
  public readonly alarms = linkedSignal<LiveMeasurement[], SystemAlarm[]>({
    source: () => this.measurementService.latestLiveMeasurements(),
    computation: (measurements, previous) => {
      // If we have previous alarms state, carry them over; otherwise, initialize with mock alarms
      const currentAlarms = previous ? [...previous.value] : [...INITIAL_ALARMS];
      const metadata = this.measurementService.metadata.value();

      if (!measurements || measurements.length === 0 || !metadata) {
        return currentAlarms;
      }

      measurements.forEach(m => {
        const meta = metadata[m.type];
        if (!meta) return;

        if (m.value < meta.min || m.value > meta.max) {
          // Prevent spamming: Check if there's already an active critical alarm for this metric
          if (!currentAlarms.some(a => a.metricType === m.type)) {
            const time = new Date().toLocaleTimeString();
            const message = m.value > meta.max
              ? $localize`${meta.name} is too high (${m.value}:value:). Max allowed is ${meta.max}:max:.`
              : $localize`${meta.name} is too low (${m.value}:value:). Min allowed is ${meta.min}:min:.`;

            currentAlarms.unshift({
              statusType: 'danger',
              statusLabel: $localize`Critical`,
              alarmMessage: message,
              time,
              metricType: m.type
            });
          }
        }
      });

      return currentAlarms;
    }
  });

  public acknowledgeAll(): void {
    this.alarms.set([]);
  }
}
