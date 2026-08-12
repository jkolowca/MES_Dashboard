export const TIME_SPAN_OPTIONS = [
  { label: '1H', value: 60 * 60 * 1000 },
  { label: '8H', value: 8 * 60 * 60 * 1000 },
  { label: '24H', value: 24 * 60 * 60 * 1000 },
  { label: '7D', value: 7 * 24 * 60 * 60 * 1000 }
];

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getChartDatasetOptions(
  labelName: string,
  unit: string,
  data: number[],
  color: string,
  axis: string
) {
  const border = color || '#94a3b8';
  const bg = border.startsWith('#') ? hexToRgba(border, 0.1) : border;

  return {
    label: `${labelName} (${unit})`,
    data: data,
    borderColor: border,
    backgroundColor: bg,
    borderWidth: 2.5,
    fill: true,
    tension: 0.4,
    yAxisID: axis || 'y',
    pointRadius: 0,
    pointHitRadius: 10,
    pointHoverRadius: 6,
    pointHoverBackgroundColor: border,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2
  };
}

export function getChartOptions(activeAxes: string[], isMobile: boolean) {
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
