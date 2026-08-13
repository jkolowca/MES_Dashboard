import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { MeasurementService } from '../../../../core/services/measurement.service';
import { LiveMeasurement } from '../../../../core/models/measurement.model';

@Component({
  selector: 'app-sensor-widget',
  imports: [DatePipe, CardModule, ProgressBarModule],
  templateUrl: './sensor-widget.component.html',
  styleUrl: './sensor-widget.component.scss'
})
export class SensorWidgetComponent {
  private readonly measurementService = inject(MeasurementService);

  public readonly measurement = input.required<LiveMeasurement>();

  /**
   * Tracks the trend of sensor values reactively using a linkedSignal.
   * Compares the current value against the previous cached source value.
   */
  public readonly trend = linkedSignal<number, 'up' | 'down' | 'none'>({
    source: () => this.measurement().value,
    computation: (current, previous) => {
      if (!previous) return 'none';
      if (current > previous.source) return 'up';
      if (current < previous.source) return 'down';
      return 'none';
    }
  });

  /** Exposes the sensor metadata definition. */
  public readonly metadata = computed(() => {
    return this.measurementService.metadata.value()?.[this.measurement().type];
  });

  /** Calculates current value percentage relative to the min/max range. */
  public readonly percentage = computed(() => {
    const meta = this.metadata();
    if (!meta) return 0;
    const { min, max } = meta;
    const range = max - min;
    if (range <= 0) return 100;
    const current = this.measurement().value - min;
    return Math.max(0, Math.min(100, Math.round((current / range) * 100)));
  });

  /** Display name of the metric. */
  public readonly localizedName = computed(() => {
    return this.metadata()?.name || this.measurement().type;
  });

  /** CSS class to color code warning/danger/normal levels based on metadata bounds. */
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
