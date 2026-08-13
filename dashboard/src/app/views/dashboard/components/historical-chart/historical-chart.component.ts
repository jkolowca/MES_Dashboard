import { Component, computed, inject, linkedSignal } from '@angular/core';
import { getChartDatasetOptions, getChartOptions, TIME_SPAN_OPTIONS, AxisScaleConfig } from './historical-chart.config';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MeasurementService } from '../../../../core/services/measurement.service';
import { CardModule } from 'primeng/card';
import { UiStateService } from '../../../../core/services/ui-state.service';

@Component({
  selector: 'app-historical-chart',
  imports: [FormsModule, ChartModule, ToggleButtonModule, SelectButtonModule, CardModule],
  templateUrl: './historical-chart.component.html',
  styleUrl: './historical-chart.component.scss'
})
export class HistoricalChartComponent {
  public readonly measurementService = inject(MeasurementService);
  private readonly uiStateService = inject(UiStateService);

  // Options for the toggle buttons (derived dynamically from API metadata)
  public readonly metricOptions = computed(() => {
    const meta = this.measurementService.metadata.value();
    if (!meta) return [];
    return Object.entries(meta).map(([key, value]) => ({
      label: value.name,
      value: key,
      color: value.color
    }));
  });

  // Currently selected metrics (automatically defaults to all keys when metadata loads)
  public selectedMetrics = linkedSignal({
    source: this.measurementService.metadata.value,
    computation: (meta): string[] => meta ? Object.keys(meta) : []
  });

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
    const rawData = this.measurementService.activeChartData();
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
      const labelName = metadata?.name ?? series.type;

      return getChartDatasetOptions(
        labelName,
        metadata?.unit || '',
        series.data.map(d => d.value),
        metadata?.color || '#94a3b8',
        metadata?.axis || 'y'
      );
    });

    return { labels, datasets };
  });

  // Chart configuration with dynamic scales
  public readonly chartOptions = computed(() => {
    const meta = this.measurementService.metadata.value();
    const selected = this.selectedMetrics();
    const activeAxes: string[] = [];
    const axesConfig: Record<string, AxisScaleConfig> = {};

    if (meta) {
      for (const key of selected) {
        const metricMeta = meta[key];
        if (metricMeta?.axis) {
          const { axis } = metricMeta;
          if (!activeAxes.includes(axis)) activeAxes.push(axis);
          if (!axesConfig[axis]) {
            axesConfig[axis] = {
              label: `${metricMeta.name} (${metricMeta.unit})`,
              color: metricMeta.color
            };
          }
        }
      }

      for (const axis of activeAxes) {
        const metricsForAxis = selected.filter(key => meta[key]?.axis === axis);
        if (metricsForAxis.length > 0) {
          const mins = metricsForAxis.map(key => meta[key].min);
          const maxs = metricsForAxis.map(key => meta[key].max);
          const minVal = Math.min(...mins);
          const maxVal = Math.max(...maxs);
          const range = maxVal - minVal;
          axesConfig[axis].min = +(minVal - 0.1 * range).toFixed(2);
          axesConfig[axis].max = +(maxVal + 0.1 * range).toFixed(2);
        }
      }
    }

    return getChartOptions(activeAxes, this.isMobile(), axesConfig, this.uiStateService.isDarkMode());
  });
}
