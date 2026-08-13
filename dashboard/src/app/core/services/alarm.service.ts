import { Service, signal, effect, inject } from '@angular/core';
import { MeasurementService } from './measurement.service';

export interface SystemAlarm {
  statusType: 'danger' | 'warning' | 'info';
  statusLabel: string;
  alarmMessage: string;
  time: string;
  metricType?: string;
}

@Service()
export class AlarmService {
  private readonly measurementService = inject(MeasurementService);

  public alarms = signal<SystemAlarm[]>([
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
  ]);

  constructor() {
    // Monitor live measurements to generate new alarms
    effect(() => {
      const measurements = this.measurementService.latestLiveMeasurements();
      const metadata = this.measurementService.metadata.value();

      if (!measurements || !metadata) return;

      measurements.forEach(m => {
        const meta = metadata[m.type];
        if (!meta) return;

        if (m.value < meta.min || m.value > meta.max) {
          this.triggerAlarm(m.type, m.value, meta.min, meta.max);
        }
      });
    }, { allowSignalWrites: true });
  }

  private triggerAlarm(metricType: string, value: number, min: number, max: number) {
    const currentAlarms = this.alarms();
    // Prevent spamming: Check if there's already an active critical alarm for this metric
    if (currentAlarms.some(a => a.metricType === metricType)) {
      return;
    }

    const time = new Date().toLocaleTimeString();
    let message = '';

    if (value > max) {
      message = $localize`${metricType} is too high (${value}:value:). Max allowed is ${max}:max:.`;
    } else {
      message = $localize`${metricType} is too low (${value}:value:). Min allowed is ${min}:min:.`;
    }

    this.alarms.update(alarms => [
      {
        statusType: 'danger',
        statusLabel: $localize`Critical`,
        alarmMessage: message,
        time,
        metricType
      },
      ...alarms
    ]);
  }

  public acknowledgeAll(): void {
    this.alarms.set([]);
  }
}
