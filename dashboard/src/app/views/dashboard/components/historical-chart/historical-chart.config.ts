export const METRIC_OPTIONS = [
  { label: $localize`:@@CHART.INLET_TEMP:Inlet Temp`, value: 'inletTemperature', color: '#3b82f6' },
  { label: $localize`:@@CHART.OUTLET_TEMP:Outlet Temp`, value: 'outletTemperature', color: '#f59e0b' },
  { label: $localize`:@@CHART.PRESSURE:Pressure`, value: 'coolantPressure', color: '#8b5cf6' },
  { label: $localize`:@@CHART.FLOW:Flow Rate`, value: 'flowRate', color: '#10b981' }
];

export const TIME_SPAN_OPTIONS = [
  { label: '1H', value: 60 * 60 * 1000 },
  { label: '8H', value: 8 * 60 * 60 * 1000 },
  { label: '24H', value: 24 * 60 * 60 * 1000 },
  { label: '7D', value: 7 * 24 * 60 * 60 * 1000 }
];


export const CHART_COLORS: Record<string, { border: string, bg: string }> = {
  inletTemperature: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  outletTemperature: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  coolantPressure: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  flowRate: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
};

export const CHART_AXIS_MAPPING: Record<string, string> = {
  inletTemperature: 'yTemperature',
  outletTemperature: 'yTemperature',
  coolantPressure: 'yPressure',
  flowRate: 'yFlow'
};

export function getChartDatasetOptions(seriesType: string, labelName: string, unit: string, data: number[]) {
  return {
    label: `${labelName} (${unit})`,
    data: data,
    borderColor: CHART_COLORS[seriesType].border,
    backgroundColor: CHART_COLORS[seriesType].bg,
    borderWidth: 2.5,
    fill: true,
    tension: 0.4,
    yAxisID: CHART_AXIS_MAPPING[seriesType],
    pointRadius: 0,
    pointHitRadius: 10,
    pointHoverRadius: 6,
    pointHoverBackgroundColor: CHART_COLORS[seriesType].border,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2
  };
}

export function getChartOptions(selectedMetrics: string[], isMobile: boolean) {
  const activeAxes: string[] = [];
  for (const metric of selectedMetrics) {
    let axis = '';
    if (metric === 'inletTemperature' || metric === 'outletTemperature') axis = 'yTemperature';
    else if (metric === 'coolantPressure') axis = 'yPressure';
    else if (metric === 'flowRate') axis = 'yFlow';

    if (axis && !activeAxes.includes(axis)) {
      activeAxes.push(axis);
    }
  }

  const showTemp = activeAxes.includes('yTemperature');
  const showPressure = activeAxes.includes('yPressure');
  const showFlow = activeAxes.includes('yFlow');

  const getPosition = (axis: string) => activeAxes[0] === axis ? 'left' : 'right';

  const getGrid = (axis: string) => {
    if (activeAxes[0] === axis) {
      return { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false, drawTicks: false };
    }
    return { display: false, drawOnChartArea: false, drawTicks: false };
  };

  return {
    maintainAspectRatio: true,
    aspectRatio: isMobile ? 1.2 : 2.5,
    animation: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'var(--font-family)', size: isMobile ? 11 : 13 },
        bodyFont: { family: 'var(--font-family)', size: isMobile ? 11 : 13 },
        padding: isMobile ? 8 : 12,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--p-text-color)',
          maxTicksLimit: isMobile ? 3 : 8,
          font: { family: 'var(--font-family)', size: isMobile ? 10 : 12 },
          padding: isMobile ? 5 : 10
        },
        grid: {
          display: false,
          drawBorder: false,
          drawTicks: false
        },
        border: { display: false }
      },
      yTemperature: {
        type: 'linear',
        display: showTemp,
        position: getPosition('yTemperature'),
        title: {
          display: !isMobile,
          text: 'Temperature (°C)',
          color: 'var(--p-text-color)',
          font: { family: 'var(--font-family)', size: 13, weight: '700' },
          padding: { bottom: 10, top: 10 }
        },
        ticks: {
          color: 'var(--p-text-color)',
          font: { family: 'var(--font-family)', size: isMobile ? 10 : 12, weight: '500' },
          padding: isMobile ? 5 : 10
        },
        grid: getGrid('yTemperature'),
        border: { display: false }
      },
      yPressure: {
        type: 'linear',
        display: showPressure,
        position: getPosition('yPressure'),
        title: {
          display: !isMobile,
          text: 'Pressure (bar)',
          color: '#6d28d9',
          font: { family: 'var(--font-family)', size: 13, weight: '700' },
          padding: { bottom: 10, top: 10 }
        },
        ticks: {
          color: '#6d28d9',
          font: { family: 'var(--font-family)', size: 12, weight: '500' },
          padding: isMobile ? 5 : 10
        },
        grid: getGrid('yPressure'),
        border: { display: false }
      },
      yFlow: {
        type: 'linear',
        display: showFlow,
        position: getPosition('yFlow'),
        title: {
          display: !isMobile,
          text: 'Flow (L/min)',
          color: '#047857',
          font: { family: 'var(--font-family)', size: 13, weight: '700' },
          padding: { bottom: 10, top: 10 }
        },
        ticks: {
          color: '#047857',
          font: { family: 'var(--font-family)', size: 12, weight: '500' },
          padding: isMobile ? 5 : 10
        },
        grid: getGrid('yFlow'),
        border: { display: false }
      }
    }
  };
}
