import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Color palette for charts
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

/**
 * ChartRenderer Component
 * Automatically detects data format and renders appropriate chart types
 */
const ChartRenderer = ({ data, title, chartType }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Determine chart type if not specified
  const inferredChartType = chartType || inferChartType(data);

  return (
    <div className="my-4 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      {title && (
        <h4 className="text-sm font-semibold text-blue-300 mb-3">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={300}>
        {renderChart(inferredChartType, data)}
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Infer the best chart type based on data structure
 */
const inferChartType = (data) => {
  if (!data || data.length === 0) return 'bar';

  const firstItem = data[0];
  const keys = Object.keys(firstItem);

  // Check if data contains percentages - ALWAYS use pie chart for percentage data
  const hasPercentageKey = keys.some(k => {
    const lowerKey = k.toLowerCase();
    return lowerKey.includes('percent') || 
           lowerKey.includes('percentage') ||
           k.includes('%') ||  // Check for % symbol (case-sensitive since it's a symbol)
           lowerKey.includes('weight %') ||
           lowerKey.includes('weight%');
  });
  
  // Check if values contain percentage symbols or are clearly percentages (0-100 range)
  const hasPercentageValues = keys.some(k => {
    const values = data.map(item => item[k]);
    
    // Skip columns with string values (like category names)
    const hasStrings = values.some(v => typeof v === 'string' && !v.includes('%'));
    if (hasStrings) return false;
    
    // Check if values are strings with % symbol
    if (values.some(v => typeof v === 'string' && v.includes('%'))) return true;
    
    // Check if numeric values are in percentage range (0-100) and sum to ~100
    const numericValues = values.filter(v => typeof v === 'number' && v >= 0 && v <= 100);
    if (numericValues.length === values.length && numericValues.length > 0) {
      const sum = numericValues.reduce((acc, v) => acc + v, 0);
      // Check if sum is close to 100 (allowing tolerance for rounding)
      return sum >= 90 && sum <= 110;
    }
    return false;
  });

  // If percentage data detected, use pie chart
  if (hasPercentageKey || hasPercentageValues) {
    return 'pie';
  }

  // If only 2 keys and one is 'name'/'category' and other is numeric - could be any chart
  if (keys.length === 2) {
    const hasCategory = keys.some(k => 
      ['name', 'category', 'label', 'month', 'year', 'date', 'time'].includes(k.toLowerCase())
    );
    
    if (hasCategory) {
      // Check if it's time series data
      const isTimeSeries = keys.some(k => 
        ['month', 'year', 'date', 'time', 'timestamp'].includes(k.toLowerCase())
      );
      if (isTimeSeries) return 'line';
      
      // For categorical data with small dataset, use pie
      if (data.length <= 8) return 'pie';
      
      // Otherwise use bar
      return 'bar';
    }
  }

  // If multiple numeric columns, use line chart
  const numericKeys = keys.filter(k => {
    const val = firstItem[k];
    return typeof val === 'number' && k.toLowerCase() !== 'year';
  });

  if (numericKeys.length > 1) return 'line';

  // Default to bar chart
  return 'bar';
};

/**
 * Render the appropriate chart based on type
 */
const renderChart = (chartType, data) => {
  const keys = Object.keys(data[0] || {});
  
  // Find category key - prioritize string values over numeric
  let categoryKey = keys.find(k => 
    ['name', 'category', 'label', 'month', 'year', 'date', 'time', 'solvent', 'component', 'item', 'field', 'type'].includes(k.toLowerCase())
  );
  
  // If not found by name, find the first column with string values
  if (!categoryKey) {
    categoryKey = keys.find(k => {
      const firstValue = data[0][k];
      return typeof firstValue === 'string';
    }) || keys[0];
  }
  
  const valueKeys = keys.filter(k => k !== categoryKey);

  switch (chartType.toLowerCase()) {
    case 'line':
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={categoryKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }} 
          />
          <Legend />
          {valueKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      );

    case 'bar':
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={categoryKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }} 
          />
          <Legend />
          {valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={COLORS[idx % COLORS.length]}
            />
          ))}
        </BarChart>
      );

    case 'pie':
      const valueKey = valueKeys[0] || 'value';
      return (
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={categoryKey}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }} 
          />
          <Legend />
        </PieChart>
      );

    case 'area':
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={categoryKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }} 
          />
          <Legend />
          {valueKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[idx % COLORS.length]}
              fill={COLORS[idx % COLORS.length]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      );

    case 'scatter':
      const xKey = valueKeys[0] || 'x';
      const yKey = valueKeys[1] || 'y';
      return (
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xKey} stroke="#9ca3af" />
          <YAxis dataKey={yKey} stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Legend />
          <Scatter
            name="Data Points"
            data={data}
            fill={COLORS[0]}
          />
        </ScatterChart>
      );

    default:
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={categoryKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }} 
          />
          <Legend />
          <Bar dataKey={valueKeys[0]} fill={COLORS[0]} />
        </BarChart>
      );
  }
};

export default ChartRenderer;


