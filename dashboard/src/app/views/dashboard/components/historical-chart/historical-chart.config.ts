export const TIME_SPAN_OPTIONS = [
  { label: '10M', value: 10 * 60 * 1000 },
  { label: '1H', value: 60 * 60 * 1000 },
  { label: '8H', value: 8 * 60 * 60 * 1000 },
  { label: '24H', value: 24 * 60 * 60 * 1000 },
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

export interface AxisScaleConfig {
  label: string;
  color: string;
  min?: number;
  max?: number;
}

/**
 * Dynamically builds the options configuration for Chart.js,
 * constructing individual y-scales dynamically based on the active axis config.
 */
export function getChartOptions(
  activeAxes: string[],
  isMobile: boolean,
  axesConfig: Record<string, AxisScaleConfig>,
  isDarkMode?: boolean
) {
  const getPosition = (axis: string) => activeAxes[0] === axis ? 'left' : 'right';

  const getGrid = (axis: string) => {
    if (activeAxes[0] === axis) {
      return {
        color: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        drawBorder: false,
        drawTicks: false
      };
    }
    return { display: false, drawOnChartArea: false, drawTicks: false };
  };

  const textColor = isDarkMode ? '#cbd5e1' : '#475569';
  const fontFamily = "'IBM Plex Sans', sans-serif";

  // Build the dynamic scales object starting with the x-axis
  const scales: Record<string, object> = {
    x: {
      ticks: {
        color: textColor,
        maxTicksLimit: isMobile ? 3 : 8,
        font: { family: fontFamily, size: isMobile ? 10 : 12 },
        padding: isMobile ? 5 : 10
      },
      grid: {
        display: false,
        drawBorder: false,
        drawTicks: false
      },
      border: { display: false }
    }
  };

  // Add y-axis configurations dynamically
  for (const axis of activeAxes) {
    const config = axesConfig[axis];
    if (!config) continue;

    scales[axis] = {
      type: 'linear',
      display: true,
      position: getPosition(axis),
      title: {
        display: !isMobile,
        text: config.label,
        color: config.color,
        font: { family: fontFamily, size: 13, weight: '700' },
        padding: { bottom: 10, top: 10 }
      },
      ticks: {
        color: config.color,
        font: { family: fontFamily, size: isMobile ? 10 : 12, weight: '500' },
        padding: isMobile ? 5 : 10,
        includeBounds: true
      },
      grid: getGrid(axis),
      border: { display: false },
      min: config.min,
      max: config.max
    };
  }

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
        titleFont: { family: fontFamily, size: isMobile ? 11 : 13 },
        bodyFont: { family: fontFamily, size: isMobile ? 11 : 13 },
        padding: isMobile ? 8 : 12,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales
  };
}
