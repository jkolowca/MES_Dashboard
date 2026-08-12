import { Component, computed, inject, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { MeasurementService } from '../../../../core/services/measurement.service';
import { LiveMeasurement } from '../../../../core/models/measurement.model';

@Component({
  selector: 'app-sensor-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule],
  templateUrl: './sensor-widget.component.html',
  styleUrl: './sensor-widget.component.scss'
})
export class SensorWidgetComponent {
  private readonly measurementService = inject(MeasurementService);

  public readonly measurement = input.required<LiveMeasurement>();
  public readonly trend = signal<'up' | 'down' | 'none'>('none');

  private previousValue = 0;
  private isFirst = true;

  constructor() {
    effect(() => {
      const current = this.measurement().value;
      if (!this.isFirst) {
        if (current > this.previousValue) {
          this.trend.set('up');
        } else if (current < this.previousValue) {
          this.trend.set('down');
        } else {
          this.trend.set('none');
        }
      }
      this.isFirst = false;
      this.previousValue = current;
    }, { allowSignalWrites: true });
  }

  private readonly metadata = computed(() => {
    return this.measurementService.metadata.value()?.[this.measurement().type];
  });

  public readonly min = computed(() => this.metadata()?.min || 0);
  public readonly max = computed(() => this.metadata()?.max || 0);
  public readonly unit = computed(() => this.metadata()?.unit || '');

  public readonly percentage = computed(() => {
    const meta = this.metadata();
    if (!meta) return 0;
    const { min, max } = meta;
    const range = max - min;
    if (range <= 0) return 100;
    const current = this.measurement().value - min;
    return Math.max(0, Math.min(100, Math.round((current / range) * 100)));
  });

  public readonly localizedName = computed(() => {
    const type = this.measurement().type;
    switch (type) {
      case 'inletTemperature': return $localize`:@@MEASUREMENTS.INLET_TEMP:Inlet Temperature`;
      case 'outletTemperature': return $localize`:@@MEASUREMENTS.OUTLET_TEMP:Outlet Temperature`;
      case 'coolantPressure': return $localize`:@@MEASUREMENTS.PRESSURE:Coolant Pressure`;
      case 'flowRate': return $localize`:@@MEASUREMENTS.FLOW_RATE:Flow Rate`;
      default: return type;
    }
  });

  public readonly statusClass = computed(() => {
    const meta = this.metadata();
    if (!meta) return 'status-normal';
    
    const value = this.measurement().value;
    const { min, max } = meta;
    
    if (value < min || value > max) {
      return 'status-danger';
    }
    
    // 15% buffer for warning status
    const warningBuffer = (max - min) * 0.15; 
    if (value < (min + warningBuffer) || value > (max - warningBuffer)) {
      return 'status-warning';
    }
    
    return 'status-normal';
  });
}
