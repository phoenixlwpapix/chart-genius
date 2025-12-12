import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LabelList,
  ComposedChart
} from 'recharts';
import { ChartConfig, ChartData, ChartType } from '../types';

interface ChartPreviewProps {
  data: ChartData;
  config: ChartConfig;
  containerRef: React.RefObject<HTMLDivElement>;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({ data, config, containerRef }) => {
  
  // Helper to ensure data values are numbers for Recharts, even if currently editing as string
  const cleanData = data.data.map(item => {
      const newItem: any = { ...item };
      data.seriesKeys.forEach(key => {
          const val = newItem[key];
          if (typeof val === 'string') {
               newItem[key] = val === '' ? 0 : parseFloat(val);
          }
      });
      return newItem;
  });

  // Helper to determine config for a series in Combo mode
  const getSeriesConfig = (key: string) => {
    // If we have explicit config from AI
    const explicit = data.seriesConfigs?.find(c => c.key === key);
    if (explicit) return explicit;
    
    // Fallback heuristic: if key contains "%" or "rate", make it a line on right axis
    const isRate = key.toLowerCase().includes('%') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('growth');
    return {
        key,
        type: isRate ? 'line' : 'bar',
        axis: isRate ? 'right' : 'left'
    };
  };

  const renderChart = () => {
    const commonProps = {
      data: cleanData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };
    
    // Theme colors
    const gridStroke = config.gridColor || "#334155";
    const textFill = config.textColor || "#94a3b8";
    const tooltipStyle = {
        backgroundColor: config.backgroundColor === '#ffffff' ? '#ffffff' : '#0a0a0a', 
        border: `1px solid ${config.gridColor}`, 
        borderRadius: '2px', // Sharper corners for modern feel
        color: config.backgroundColor === '#ffffff' ? '#0f172a' : '#f8fafc',
        fontSize: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    };

    switch (config.type) {
      case ChartType.BAR:
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />}
            <XAxis dataKey="name" stroke={textFill} tick={{fill: textFill, fontSize: 12}} />
            <YAxis stroke={textFill} tick={{fill: textFill, fontSize: 12}} label={{ value: data.yAxisLabel, angle: -90, position: 'insideLeft', fill: textFill, fontSize: 12 }}/>
            {config.showTooltip && <Tooltip contentStyle={tooltipStyle} cursor={{fill: config.backgroundColor === '#ffffff' ? '#f1f5f9' : '#1e1e1e'}} />}
            {config.showLegend && <Legend wrapperStyle={{ color: textFill, fontSize: '12px' }} />}
            {data.seriesKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={config.colors[index % config.colors.length]} radius={[2, 2, 0, 0]}>
                {config.showValue && <LabelList dataKey={key} position="top" fill={textFill} fontSize={12} />}
              </Bar>
            ))}
          </BarChart>
        );

      case ChartType.LINE:
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />}
            <XAxis dataKey="name" stroke={textFill} tick={{fill: textFill, fontSize: 12}} />
            <YAxis stroke={textFill} tick={{fill: textFill, fontSize: 12}} label={{ value: data.yAxisLabel, angle: -90, position: 'insideLeft', fill: textFill, fontSize: 12 }}/>
            {config.showTooltip && <Tooltip contentStyle={tooltipStyle} />}
            {config.showLegend && <Legend wrapperStyle={{ color: textFill, fontSize: '12px' }} />}
            {data.seriesKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={config.colors[index % config.colors.length]} 
                strokeWidth={3}
                dot={{ r: 3, fill: config.colors[index % config.colors.length], strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              >
                 {config.showValue && <LabelList dataKey={key} position="top" fill={textFill} fontSize={12} offset={10} />}
              </Line>
            ))}
          </LineChart>
        );

      case ChartType.AREA:
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />}
            <XAxis dataKey="name" stroke={textFill} tick={{fill: textFill, fontSize: 12}} />
            <YAxis stroke={textFill} tick={{fill: textFill, fontSize: 12}} label={{ value: data.yAxisLabel, angle: -90, position: 'insideLeft', fill: textFill, fontSize: 12 }}/>
            {config.showTooltip && <Tooltip contentStyle={tooltipStyle} />}
            {config.showLegend && <Legend wrapperStyle={{ color: textFill, fontSize: '12px' }} />}
            {data.seriesKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={config.colors[index % config.colors.length]} 
                fill={config.colors[index % config.colors.length]} 
                fillOpacity={0.3}
              >
                {config.showValue && <LabelList dataKey={key} position="top" fill={textFill} fontSize={12} />}
              </Area>
            ))}
          </AreaChart>
        );

      case ChartType.PIE:
        const pieDataKey = data.seriesKeys[0];
        return (
          <PieChart>
             {config.showTooltip && <Tooltip contentStyle={tooltipStyle} />}
             {config.showLegend && <Legend wrapperStyle={{ color: textFill, fontSize: '12px' }} />}
            <Pie
              data={cleanData}
              dataKey={pieDataKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={2}
            >
              {config.showValue && <LabelList dataKey={pieDataKey} position="outside" stroke="none" fill={textFill} fontSize={12} />}
              {cleanData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={config.colors[index % config.colors.length]} stroke={config.backgroundColor} />
              ))}
            </Pie>
          </PieChart>
        );
        
       case ChartType.SCATTER:
          return (
             <ScatterChart {...commonProps}>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />}
                <XAxis type="category" dataKey="name" name="Category" stroke={textFill} tick={{fill: textFill, fontSize: 12}} />
                <YAxis type="number" dataKey={data.seriesKeys[0]} name="Value" stroke={textFill} tick={{fill: textFill, fontSize: 12}} />
                {config.showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />}
                {config.showLegend && <Legend wrapperStyle={{ color: textFill, fontSize: '12px' }} />}
                {data.seriesKeys.map((key, index) => (
                    <Scatter key={key} name={key} data={cleanData} fill={config.colors[index % config.colors.length]}>
                        {config.showValue && <LabelList dataKey={key} position="top" fill={textFill} fontSize={12} />}
                    </Scatter>
                ))}
             </ScatterChart>
          );
      
      case ChartType.COMBO:
          return (
            <ComposedChart {...commonProps}>
               {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />}
               <XAxis dataKey="name" stroke={textFill} tick={{fill: textFill, fontSize: 12}} />
               
               <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke={textFill} 
                  tick={{fill: textFill, fontSize: 12}} 
                  label={{ value: data.yAxisLabel, angle: -90, position: 'insideLeft', fill: textFill, fontSize: 12 }} 
               />
               
               <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke={textFill} 
                  tick={{fill: textFill, fontSize: 12}} 
               />

               {config.showTooltip && <Tooltip contentStyle={tooltipStyle} cursor={{fill: config.backgroundColor === '#ffffff' ? '#f1f5f9' : '#1e1e1e'}} />}
               {config.showLegend && <Legend wrapperStyle={{ color: textFill, fontSize: '12px' }} />}
               
               {data.seriesKeys.map((key, index) => {
                   const sConf = getSeriesConfig(key);
                   const axisId = sConf.axis as string; 
                   const color = config.colors[index % config.colors.length];
                   
                   if (sConf.type === 'bar') {
                       return (
                           <Bar key={key} dataKey={key} yAxisId={axisId} fill={color} radius={[2, 2, 0, 0]}>
                               {config.showValue && <LabelList dataKey={key} position="top" fill={textFill} fontSize={12} />}
                           </Bar>
                       );
                   } else {
                       return (
                           <Line 
                               key={key} 
                               type="monotone" 
                               dataKey={key} 
                               yAxisId={axisId}
                               stroke={color} 
                               strokeWidth={3}
                               dot={{ r: 3, fill: color, strokeWidth: 0 }}
                               activeDot={{ r: 5 }}
                           >
                               {config.showValue && <LabelList dataKey={key} position="top" fill={textFill} fontSize={12} offset={10} />}
                           </Line>
                       );
                   }
               })}
            </ComposedChart>
          );

      default:
        return <div>不支持的图表类型</div>;
    }
  };

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full flex flex-col p-8 overflow-hidden relative transition-colors duration-300"
        style={{ backgroundColor: config.backgroundColor }} 
    >
      <div className="mb-8 text-center z-10">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: config.titleColor }}>{data.title}</h2>
        {config.showDescription && data.description && <p className="text-sm mt-2 font-medium" style={{ color: config.textColor, opacity: 0.9 }}>{data.description}</p>}
      </div>
      
      <div className="flex-1 min-h-0 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>

        {/* Unit label for Pie Chart - positioned on the right like a Y-Axis label */}
        {config.type === ChartType.PIE && data.yAxisLabel && (
           <div 
             className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
             style={{
                 transform: 'rotate(-90deg)',
                 transformOrigin: 'center right'
             }}
           >
              <span style={{ color: config.textColor }} className="text-xs font-medium tracking-wider uppercase opacity-70 whitespace-nowrap">
                {data.yAxisLabel}
              </span>
           </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 text-[10px] pointer-events-none opacity-40 font-medium tracking-wide" style={{ color: config.textColor }}>
        ChartGenius AI 生成
      </div>
    </div>
  );
};

export default ChartPreview;