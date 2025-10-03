/**
 * Data Parser Utility
 * Extracts and parses visualizable data from text responses
 */

/**
 * Main function to extract charts from text
 * Returns an array of chart objects with data, title, and type
 */
export const extractChartsFromText = (text) => {
  if (!text) return [];

  const charts = [];

  // Try to extract JSON data blocks
  const jsonCharts = extractJSONData(text);
  charts.push(...jsonCharts);

  // Try to extract markdown tables
  const tableCharts = extractMarkdownTables(text);
  charts.push(...tableCharts);

  // Try to extract CSV-like data
  const csvCharts = extractCSVData(text);
  charts.push(...csvCharts);

  // Try to extract numbered/bulleted lists with data
  const listCharts = extractListData(text);
  charts.push(...listCharts);

  return charts;
};

/**
 * Extract JSON data blocks from text
 */
const extractJSONData = (text) => {
  const charts = [];
  
  // Match JSON code blocks or inline JSON
  const jsonBlockRegex = /```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/g;
  const inlineJsonRegex = /(?:^|\n)(\[[\s\S]*?\]|\{[\s\S]*?\})(?:\n|$)/g;

  let match;
  
  // Try code blocks first
  while ((match = jsonBlockRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      
      if (isValidChartData(data)) {
        charts.push({
          data,
          title: 'Data Visualization',
          type: null, // Will be inferred
        });
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  // If no code blocks found, try inline JSON
  if (charts.length === 0) {
    while ((match = inlineJsonRegex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const data = Array.isArray(parsed) ? parsed : [parsed];
        
        if (isValidChartData(data)) {
          charts.push({
            data,
            title: 'Data Visualization',
            type: null,
          });
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }
  }

  return charts;
};

/**
 * Extract markdown tables from text
 */
const extractMarkdownTables = (text) => {
  const charts = [];
  
  // Match markdown tables
  const tableRegex = /(?:^|\n)((?:\|[^\n]+\|\n)+)/gm;
  let match;

  while ((match = tableRegex.exec(text)) !== null) {
    const tableText = match[1];
    const rows = tableText.trim().split('\n').filter(row => row.includes('|'));
    
    if (rows.length < 3) continue; // Need at least header, separator, and one data row

    // Parse header
    const headers = rows[0]
      .split('|')
      .map(h => h.trim())
      .filter(h => h);

    // Skip separator row (typically |---|---|)
    const dataRows = rows.slice(2);

    const data = dataRows.map(row => {
      const values = row
        .split('|')
        .map(v => v.trim())
        .filter(v => v);

      const obj = {};
      headers.forEach((header, idx) => {
        if (values[idx] !== undefined) {
          let value = values[idx];
          
          // Handle percentage values (e.g., "70%" -> 70)
          if (typeof value === 'string' && value.includes('%')) {
            const numStr = value.replace('%', '').trim();
            const num = parseFloat(numStr);
            obj[header] = isNaN(num) ? value : num;
          } else {
            // Try to parse as number
            const num = parseFloat(value);
            obj[header] = isNaN(num) ? value : num;
          }
        }
      });
      return obj;
    });

    if (isValidChartData(data)) {
      charts.push({
        data,
        title: 'Table Data',
        type: null,
      });
    }
  }

  return charts;
};

/**
 * Extract CSV-like data from text
 */
const extractCSVData = (text) => {
  const charts = [];
  
  // Look for CSV blocks
  const csvBlockRegex = /```(?:csv)?\s*([\s\S]*?)\s*```/g;
  let match;

  while ((match = csvBlockRegex.exec(text)) !== null) {
    const csvText = match[1];
    const data = parseCSV(csvText);
    
    if (isValidChartData(data)) {
      charts.push({
        data,
        title: 'CSV Data',
        type: null,
      });
    }
  }

  return charts;
};

/**
 * Parse CSV text into array of objects
 */
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    
    headers.forEach((header, idx) => {
      if (values[idx] !== undefined) {
        const num = parseFloat(values[idx]);
        obj[header] = isNaN(num) ? values[idx] : num;
      }
    });
    
    data.push(obj);
  }

  return data;
};

/**
 * Extract data from numbered or bulleted lists
 */
const extractListData = (text) => {
  const charts = [];
  
  // Look for patterns like:
  // - Item: 100
  // - Another: 200
  const listRegex = /(?:^|\n)((?:[-*•]\s+[^:\n]+:\s*\d+(?:\.\d+)?(?:\n|$))+)/gm;
  let match;

  while ((match = listRegex.exec(text)) !== null) {
    const listText = match[1];
    const items = listText.trim().split('\n');
    
    const data = items.map(item => {
      const colonMatch = item.match(/[-*•]\s+([^:]+):\s*(\d+(?:\.\d+)?)/);
      if (colonMatch) {
        return {
          name: colonMatch[1].trim(),
          value: parseFloat(colonMatch[2]),
        };
      }
      return null;
    }).filter(item => item !== null);

    if (data.length > 0 && isValidChartData(data)) {
      charts.push({
        data,
        title: 'List Data',
        type: null,
      });
    }
  }

  return charts;
};

/**
 * Check if data is valid for charting
 */
const isValidChartData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return false;
  
  // Check if objects have at least one key
  const firstItem = data[0];
  if (typeof firstItem !== 'object' || firstItem === null) return false;
  
  const keys = Object.keys(firstItem);
  if (keys.length < 1) return false;

  // Check if at least one value is numeric
  const hasNumeric = keys.some(key => {
    return data.some(item => typeof item[key] === 'number');
  });

  return hasNumeric;
};

/**
 * Parse explicit chart directives from text
 * Example: [CHART:line] {...data...}
 */
export const parseChartDirective = (text) => {
  const directiveRegex = /\[CHART:(\w+)\]\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/g;
  const charts = [];
  let match;

  while ((match = directiveRegex.exec(text)) !== null) {
    const chartType = match[1];
    try {
      const parsed = JSON.parse(match[2]);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      
      if (isValidChartData(data)) {
        charts.push({
          data,
          type: chartType,
          title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        });
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  return charts;
};

/**
 * Extract chart configuration from response metadata
 */
export const extractChartFromMetadata = (metadata) => {
  if (!metadata || !metadata.chartData) return null;

  const { chartData, chartType, chartTitle } = metadata;
  
  if (isValidChartData(chartData)) {
    return {
      data: chartData,
      type: chartType || null,
      title: chartTitle || 'Data Visualization',
    };
  }

  return null;
};


