import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MeasurementService } from '../../core/services/measurement.service';
import { AlarmService } from '../../core/services/alarm.service';
import { SensorWidgetComponent } from './components/sensor-widget/sensor-widget.component';
import { HistoricalChartComponent } from './components/historical-chart/historical-chart.component';

/**
 * Main dashboard view.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SensorWidgetComponent, HistoricalChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardComponent implements OnInit {
  public readonly measurementService = inject(MeasurementService);
  public readonly alarmService = inject(AlarmService);
  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.measurementService.getLiveUpdates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
