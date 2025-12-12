export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  AREA = 'area',
  PIE = 'pie',
  SCATTER = 'scatter',
  COMBO = 'combo'
}

export type Language = 'zh' | 'en';

export interface DataPoint {
  name: string;
  [key: string]: string | number;
}

export interface SeriesConfig {
  key: string;
  type: 'bar' | 'line';
  axis: 'left' | 'right';
}

export interface ChartData {
  title: string;
  description?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: DataPoint[];
  suggestedType: ChartType;
  seriesKeys: string[]; // Keys in data objects that represent values (e.g., "sales", "profit")
  seriesConfigs?: SeriesConfig[]; // Specific config for combo charts
}

export interface ChartConfig {
  type: ChartType;
  colors: string[];
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  showValue: boolean;
  showDescription: boolean;
  titleColor: string;
  backgroundColor: string;
  textColor: string;
  gridColor: string;
}

export const COLOR_THEMES = [
  {
    name: '活力',
    nameEn: 'Vibrant',
    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
  },
  {
    name: '商务',
    nameEn: 'Business',
    colors: ['#2563eb', '#1e293b', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#475569'],
  },
  {
    name: '日落',
    nameEn: 'Sunset',
    colors: ['#f43f5e', '#f97316', '#fbbf24', '#f59e0b', '#b45309', '#78350f', '#fff7ed'],
  },
  {
    name: '海洋',
    nameEn: 'Ocean',
    colors: ['#0ea5e9', '#0284c7', '#0369a1', '#06b6d4', '#22d3ee', '#67e8f9', '#ecfeff'],
  },
  {
    name: '森林',
    nameEn: 'Forest',
    colors: ['#22c55e', '#16a34a', '#15803d', '#84cc16', '#65a30d', '#4d7c0f', '#ecfccb'],
  },
  {
    name: '柔和',
    nameEn: 'Pastel',
    colors: ['#93c5fd', '#fca5a5', '#86efac', '#fcd34d', '#c4b5fd', '#f9a8d4', '#67e8f9'],
  },
  {
    name: '单色',
    nameEn: 'Monochrome',
    colors: ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'],
  }
];

export const DEFAULT_COLORS = COLOR_THEMES[0].colors;