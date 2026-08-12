import { Component, computed, inject, signal } from '@angular/core';
import { getChartDatasetOptions, getChartOptions, METRIC_OPTIONS, TIME_SPAN_OPTIONS } from './historical-chart.config';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MeasurementService } from '../../../../core/services/measurement.service';
import { CardModule } from 'primeng/card';
import { UiStateService } from '../../../../core/services/ui-state.service';

@Component({
  selector: 'app-historical-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, ToggleButtonModule, SelectButtonModule, CardModule],
  templateUrl: './historical-chart.component.html',
  styleUrl: './historical-chart.component.scss'
})
export class HistoricalChartComponent {
  public readonly measurementService = inject(MeasurementService);
  private readonly uiStateService = inject(UiStateService);

  // Options for the toggle buttons (now acting as the legend)
  public readonly metricOptions = METRIC_OPTIONS;

  // Currently selected metrics (all on by default)
  public selectedMetrics = signal<string[]>(['inletTemperature', 'outletTemperature', 'coolantPressure', 'flowRate']);

  public setMetric(metric: string, selected: boolean): void {
    const current = this.selectedMetrics();
    if (selected && !current.includes(metric)) {
      this.selectedMetrics.set([...current, metric]);
    } else if (!selected && current.includes(metric)) {
      this.selectedMetrics.set(current.filter(m => m !== metric));
    }
  }

  // Time span selector options
  public timeSpanOptions = TIME_SPAN_OPTIONS;

  // Track mobile state for RWD
  public isMobile = this.uiStateService.isMobile;

  // Format historical data for Chart.js
  public chartData = computed(() => {
    const rawData = this.measurementService.historicalData.value();
    if (!rawData || rawData.length === 0) return { labels: [], datasets: [] };

    const selected = this.selectedMetrics();
    const span = this.measurementService.timeSpan();

    const filteredData = rawData.filter(series => selected.includes(series.type));

    // Extract labels and format based on the selected time span
    const labels = rawData[0].data.map(d => {
      const date = new Date(d.date);
      if (span === 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } else if (span === 24 * 60 * 60 * 1000 || span === 8 * 60 * 60 * 1000) {
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    });

    const datasets = filteredData.map(series => {
      const metadata = this.measurementService.metadata.value()?.[series.type];
      const labelName = this.metricOptions.find(o => o.value === series.type)?.label || series.type;

      return getChartDatasetOptions(series.type, labelName, metadata?.unit || '', series.data.map(d => d.value));
    });

    return { labels, datasets };
  });

  // Chart configuration
  public chartOptions = computed(() => {
    return getChartOptions(this.selectedMetrics(), this.isMobile());
  });
}
