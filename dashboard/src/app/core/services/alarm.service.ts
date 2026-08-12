import { Service, signal, effect, inject } from '@angular/core';
import { MeasurementService } from './measurement.service';

export interface SystemAlarm {
  status: 'Critical' | 'Warning' | 'Info';
  message: string;
  time: string;
  metricType?: string;
}

@Service()
export class AlarmService {
  private readonly measurementService = inject(MeasurementService);

  public alarms = signal<SystemAlarm[]>([
    { status: 'Critical', message: 'Pressure exceeds safety limits in sector 7G', time: '10:45:02' },
    { status: 'Warning', message: 'Coolant flow rate below optimal threshold', time: '10:42:15' },
    { status: 'Info', message: 'Routine maintenance scheduled for pump 3', time: '09:00:00' }
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
      message = `${metricType} is too high (${value}). Max allowed is ${max}.`;
    } else {
      message = `${metricType} is too low (${value}). Min allowed is ${min}.`;
    }

    this.alarms.update(alarms => [
      { status: 'Critical', message, time, metricType },
      ...alarms
    ]);
  }

  public acknowledgeAll(): void {
    this.alarms.set([]);
  }
}
