import React, { useState } from 'react';
import { ChartConfig, ChartData, ChartType, COLOR_THEMES, Language } from '../types';
import { Settings, Palette, Type, LayoutGrid, Download, Moon, Sun } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface EditorPanelProps {
  chartData: ChartData;
  setChartData: (data: ChartData) => void;
  config: ChartConfig;
  setConfig: (config: ChartConfig) => void;
  chartRef: React.RefObject<HTMLDivElement>;
  language: Language;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ chartData, setChartData, config, setConfig, chartRef, language }) => {
  const [activeTab, setActiveTab] = useState<'style' | 'data'>('style');

  const dict = {
    zh: {
        style: '样式设计',
        data: '数据源',
        theme: '画布背景',
        dark: '深色模式',
        light: '浅色模式',
        chartType: '图表类型',
        colorTheme: '配色主题',
        displayOptions: '显示选项',
        showGrid: '显示网格线',
        showLegend: '显示图例',
        showTooltip: '显示提示框',
        showValue: '显示数值',
        textContent: '文字内容',
        mainTitle: '主标题',
        subTitle: '副标题 / 描述',
        subTitlePlaceholder: '可选的副标题',
        xAxis: 'X 轴标签',
        yAxis: 'Y 轴标签',
        category: '类别 (X轴)',
        newData: '新数据',
        addRow: '+ 添加数据行',
        downloadPng: '保存图片 (PNG)',
        downloadHtml: '保存网页 (HTML)',
        editTip: '直接在下方表格中编辑数据。',
        chartTypes: {
            bar: '柱状图',
            line: '折线图',
            area: '面积图',
            pie: '饼图',
            scatter: '散点图',
            combo: '组合图'
        }
    },
    en: {
        style: 'Style',
        data: 'Data',
        theme: 'Canvas Background',
        dark: 'Dark Mode',
        light: 'Light Mode',
        chartType: 'Chart Type',
        colorTheme: 'Color Theme',
        displayOptions: 'Display Options',
        showGrid: 'Show Grid',
        showLegend: 'Show Legend',
        showTooltip: 'Show Tooltip',
        showValue: 'Show Values',
        textContent: 'Text Content',
        mainTitle: 'Main Title',
        subTitle: 'Subtitle / Desc',
        subTitlePlaceholder: 'Optional subtitle',
        xAxis: 'X-Axis Label',
        yAxis: 'Y-Axis Label',
        category: 'Category (X)',
        newData: 'New Data',
        addRow: '+ Add Row',
        downloadPng: 'Save Image (PNG)',
        downloadHtml: 'Save Webpage (HTML)',
        editTip: 'Edit data directly in the table below.',
        chartTypes: {
            bar: 'Bar',
            line: 'Line',
            area: 'Area',
            pie: 'Pie',
            scatter: 'Scatter',
            combo: 'Combo'
        }
    }
  };

  const t = dict[language];

  const handleDownloadImage = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(chartRef.current, { backgroundColor: config.backgroundColor });
        const link = document.createElement('a');
        link.download = `chart-genius-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Failed to download image', error);
      }
    }
  };

  const handleDownloadHTML = () => {
    // Generate labels (Reverted to just name for Pie charts)
    const labels = chartData.data.map(d => d.name);

    const datasets = config.type === ChartType.PIE 
    ? [{
        label: chartData.seriesKeys[0],
        data: chartData.data.map(d => d[chartData.seriesKeys[0]]),
        backgroundColor: config.colors,
      }]
    : chartData.seriesKeys.map((key, i) => ({
        label: key,
        data: chartData.data.map(d => d[key]),
        backgroundColor: config.type === 'bar' ? config.colors[i % config.colors.length] : `${config.colors[i % config.colors.length]}33`,
        borderColor: config.colors[i % config.colors.length],
        fill: config.type === 'area',
        borderWidth: 2,
        // Basic mapping for Combo in Chart.js export (simplistic approach)
        type: (config.type === ChartType.COMBO && (key.toLowerCase().includes('rate') || key.includes('%'))) ? 'line' : undefined,
        yAxisID: (config.type === ChartType.COMBO && (key.toLowerCase().includes('rate') || key.includes('%'))) ? 'y1' : 'y',
      }));

    const chartJsType = config.type === 'area' ? 'line' : (config.type === ChartType.COMBO ? 'bar' : config.type);
    
    // For Pie charts, we use the chart.js title plugin to show the yAxisLabel on the right
    const showPieUnit = config.type === ChartType.PIE && chartData.yAxisLabel;
    const pieUnitText = chartData.yAxisLabel || '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="${language === 'zh' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <title>${chartData.title}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: -apple-system, "Noto Sans SC", "Microsoft YaHei", sans-serif; padding: 40px; background: #f8fafc; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 4px; border: 1px solid #e2e8f0; }
    h1 { text-align: center; color: #334155; margin-bottom: 10px; font-weight: 600; }
    p { text-align: center; color: #64748b; margin-bottom: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${chartData.title}</h1>
    ${config.showDescription ? `<p>${chartData.description || ''}</p>` : ''}
    <canvas id="myChart"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
      type: '${chartJsType}',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: ${JSON.stringify(datasets)}
      },
      options: {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
          legend: { position: 'bottom' },
          title: { 
            display: ${showPieUnit ? 'true' : 'false'},
            text: '${pieUnitText}',
            position: 'right',
            font: { size: 12 },
            color: '#64748b'
          }
        },
        ${config.type === ChartType.COMBO ? `
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        }
        ` : ''}
      }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateDataPoint = (index: number, key: string, value: string) => {
    const newData = [...chartData.data];
    const newItem = { ...newData[index] };
    if (key === 'name') {
        newItem.name = value;
    } else {
        if (value === '') {
            newItem[key] = '';
        } else {
             newItem[key] = value;
        }
    }
    newData[index] = newItem;
    setChartData({ ...chartData, data: newData });
  };
  
  const applyTheme = (theme: 'dark' | 'light') => {
      if (theme === 'dark') {
          setConfig({
              ...config,
              backgroundColor: '#0a0a0a', // Neutral 950
              titleColor: '#f8fafc', // Slate 50
              textColor: '#94a3b8', // Slate 400
              gridColor: '#262626', // Neutral 800
          });
      } else {
          setConfig({
              ...config,
              backgroundColor: '#ffffff', // White
              titleColor: '#0f172a', // Slate 900
              textColor: '#64748b', // Slate 500
              gridColor: '#e2e8f0', // Slate 200
          });
      }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 border-none overflow-hidden text-sm">
      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-4 text-xs font-semibold tracking-wider uppercase transition-colors ${
            activeTab === 'style' ? 'text-white border-b border-white bg-neutral-900' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Palette size={14} /> {t.style}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-4 text-xs font-semibold tracking-wider uppercase transition-colors ${
            activeTab === 'data' ? 'text-white border-b border-white bg-neutral-900' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <LayoutGrid size={14} /> {t.data}
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'style' ? (
          <div className="space-y-8">
            
            {/* Chart Theme (Dark/Light) */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{t.theme}</label>
              <div className="grid grid-cols-2 gap-px bg-neutral-800 border border-neutral-800">
                 <button 
                   onClick={() => applyTheme('dark')}
                   className={`flex items-center justify-center gap-2 py-2.5 text-xs transition-colors ${config.backgroundColor === '#0a0a0a' ? 'bg-neutral-800 text-white font-medium' : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-900'}`}
                 >
                    <Moon size={12} /> {t.dark}
                 </button>
                 <button 
                   onClick={() => applyTheme('light')}
                   className={`flex items-center justify-center gap-2 py-2.5 text-xs transition-colors ${config.backgroundColor === '#ffffff' ? 'bg-white text-black font-medium' : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-900'}`}
                 >
                    <Sun size={12} /> {t.light}
                 </button>
              </div>
            </div>
            
            {/* Chart Type */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{t.chartType}</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(ChartType).map((type) => (
                  <button
                    key={type}
                    onClick={() => setConfig({ ...config, type })}
                    className={`px-2 py-2 rounded-sm text-xs transition-all border ${
                      config.type === type 
                        ? 'bg-white text-black border-white font-semibold' 
                        : 'bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    {t.chartTypes[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Themes */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{t.colorTheme}</label>
              <div className="grid grid-cols-2 gap-2">
                 {COLOR_THEMES.map((theme) => {
                   const isActive = JSON.stringify(config.colors) === JSON.stringify(theme.colors);
                   return (
                    <button
                        key={theme.name}
                        onClick={() => setConfig({ ...config, colors: theme.colors })}
                        className={`p-2.5 rounded-sm border transition-all text-left group flex flex-col gap-2 ${
                        isActive
                            ? 'bg-neutral-900 border-white' 
                            : 'bg-transparent border-neutral-800 hover:border-neutral-600'
                        }`}
                    >
                        <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`}>{language === 'en' ? theme.nameEn : theme.name}</span>
                        <div className="flex h-2 w-full gap-0.5">
                            {theme.colors.map((c, i) => (
                                <div key={i} style={{ backgroundColor: c }} className="flex-1 h-full first:rounded-l-sm last:rounded-r-sm" />
                            ))}
                        </div>
                    </button>
                   );
                 })}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
               <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{t.displayOptions}</label>
               <div className="space-y-px bg-neutral-800 border border-neutral-800">
                 {[
                   { key: 'showGrid', label: t.showGrid },
                   { key: 'showLegend', label: t.showLegend },
                   { key: 'showTooltip', label: t.showTooltip },
                   { key: 'showValue', label: t.showValue },
                 ].map(({ key, label }) => (
                   <label key={key} className="flex items-center justify-between p-3 bg-neutral-950 cursor-pointer hover:bg-neutral-900 transition-colors">
                     <span className="text-xs text-neutral-300">{label}</span>
                     <div className={`w-3.5 h-3.5 border ${
                        (config as any)[key] ? 'bg-white border-white' : 'border-neutral-600'
                     } flex items-center justify-center`}>
                        {(config as any)[key] && <div className="w-2 h-2 bg-black"></div>}
                     </div>
                     <input
                        type="checkbox"
                        checked={(config as any)[key]}
                        onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                        className="hidden"
                     />
                   </label>
                 ))}
               </div>
            </div>

            {/* Labels */}
             <div className="space-y-4 border-t border-neutral-800 pt-6">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{t.textContent}</label>
                <div>
                    <label className="text-[10px] text-neutral-500 mb-1.5 block uppercase">{t.mainTitle}</label>
                    <input 
                        type="text" 
                        value={chartData.title}
                        onChange={(e) => setChartData({...chartData, title: e.target.value})}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] text-neutral-500 uppercase">{t.subTitle}</label>
                        <input 
                            type="checkbox" 
                            checked={config.showDescription} 
                            onChange={(e) => setConfig({...config, showDescription: e.target.checked})}
                            className="w-3 h-3 border border-neutral-600 bg-transparent checked:bg-white checked:border-white focus:ring-0 rounded-none cursor-pointer"
                        />
                    </div>
                    {config.showDescription && (
                        <input 
                            type="text" 
                            value={chartData.description || ''}
                            onChange={(e) => setChartData({...chartData, description: e.target.value})}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                            placeholder={t.subTitlePlaceholder}
                        />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-neutral-500 mb-1.5 block uppercase">{t.xAxis}</label>
                        <input 
                            type="text" 
                            value={chartData.xAxisLabel || ''}
                            onChange={(e) => setChartData({...chartData, xAxisLabel: e.target.value})}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-neutral-500 mb-1.5 block uppercase">{t.yAxis}</label>
                        <input 
                            type="text" 
                            value={chartData.yAxisLabel || ''}
                            onChange={(e) => setChartData({...chartData, yAxisLabel: e.target.value})}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                        />
                    </div>
                </div>
             </div>

          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-neutral-500">{t.editTip}</p>
            <div className="overflow-x-auto border border-neutral-800 rounded-sm">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-900 text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">
                  <tr>
                    <th className="px-3 py-3 border-b border-neutral-800">{t.category}</th>
                    {chartData.seriesKeys.map((key, i) => (
                         <th key={key} className="px-3 py-3 border-b border-neutral-800 border-l">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {chartData.data.map((point, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900 transition-colors group">
                      <td className="px-1 py-1">
                        <input
                            type="text"
                            value={point.name}
                            onChange={(e) => updateDataPoint(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border-none text-neutral-300 focus:text-white px-2 py-1.5 focus:outline-none"
                        />
                      </td>
                      {chartData.seriesKeys.map((key) => (
                         <td key={`${idx}-${key}`} className="px-1 py-1 border-l border-neutral-800">
                            <input
                                type="number"
                                value={point[key]}
                                onChange={(e) => updateDataPoint(idx, key, e.target.value)}
                                className="w-full bg-transparent border-none text-neutral-300 focus:text-white px-2 py-1.5 focus:outline-none text-right font-mono"
                            />
                         </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => {
                    const newItem: any = { name: t.newData };
                    chartData.seriesKeys.forEach(k => newItem[k] = 0);
                    setChartData({...chartData, data: [...chartData.data, newItem]});
                }}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium transition-colors border-t border-neutral-800"
              >
                {t.addRow}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-neutral-800 bg-neutral-950">
         <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={handleDownloadImage}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-sm font-semibold transition-colors text-xs"
            >
                <Download size={14} /> {t.downloadPng}
            </button>
            <button 
                onClick={handleDownloadHTML}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-sm font-medium transition-colors text-xs"
            >
                <Download size={14} /> {t.downloadHtml}
            </button>
         </div>
      </div>
    </div>
  );
};

export default EditorPanel;