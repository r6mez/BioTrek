import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ChartRenderer from '../components/ChartRenderer';
import { extractChartsFromText, parseChartDirective } from '../utils/dataParser';

/**
 * Test page to verify chart visualization works
 * This page allows you to test different data formats
 */
export default function ChartTest() {
  const [testResponse, setTestResponse] = useState('');
  const [detectedCharts, setDetectedCharts] = useState([]);

  // Test data examples
  const examples = [
    {
      name: 'Markdown Table',
      data: `Here's the mission success rate by agency:

| Agency | Success Rate | Missions |
|--------|--------------|----------|
| NASA   | 95           | 120      |
| ESA    | 92           | 85       |
| JAXA   | 88           | 45       |
| ISRO   | 90           | 38       |

As you can see, NASA has the highest success rate.`
    },
    {
      name: 'JSON Array',
      data: `Here's the temperature data from Mars:

\`\`\`json
[
  {"day": "Monday", "temperature": -60},
  {"day": "Tuesday", "temperature": -55},
  {"day": "Wednesday", "temperature": -58},
  {"day": "Thursday", "temperature": -52},
  {"day": "Friday", "temperature": -48},
  {"day": "Saturday", "temperature": -50},
  {"day": "Sunday", "temperature": -53}
]
\`\`\`

The temperature shows typical Martian variations.`
    },
    {
      name: 'List Data',
      data: `Distribution of microorganisms found:
- Bacteria: 320
- Fungi: 180
- Archaea: 95
- Viruses: 45

This shows bacteria are the most abundant.`
    },
    {
      name: 'Chart Directive (Line)',
      data: `[CHART:line]
[
  {"year": 2019, "missions": 8},
  {"year": 2020, "missions": 12},
  {"year": 2021, "missions": 15},
  {"year": 2022, "missions": 18},
  {"year": 2023, "missions": 22}
]`
    },
    {
      name: 'CSV Format',
      data: `Space agency budget allocation:

\`\`\`csv
Department,Budget
Research,35
Development,30
Operations,25
Administration,10
\`\`\`

The breakdown shows research gets the largest portion.`
    },
    {
      name: 'Multiple Charts',
      data: `# Mission Analysis Report

**Annual Success Rates:**

| Year | Success Rate |
|------|--------------|
| 2020 | 87           |
| 2021 | 91           |
| 2022 | 94           |
| 2023 | 96           |

**Budget Distribution:**

\`\`\`json
[
  {"category": "Research", "amount": 350},
  {"category": "Development", "amount": 280},
  {"category": "Operations", "amount": 220},
  {"category": "Training", "amount": 150}
]
\`\`\`

Both metrics show positive trends.`
    }
  ];

  const handleTest = (exampleData) => {
    setTestResponse(exampleData);
    
    // Extract charts
    const charts = extractChartsFromText(exampleData);
    const directives = parseChartDirective(exampleData);
    
    const allCharts = [...directives, ...charts];
    setDetectedCharts(allCharts);
    
    console.log('Test Response:', exampleData);
    console.log('Detected Charts:', allCharts);
  };

  const handleCustomTest = () => {
    const charts = extractChartsFromText(testResponse);
    const directives = parseChartDirective(testResponse);
    
    const allCharts = [...directives, ...charts];
    setDetectedCharts(allCharts);
    
    console.log('Custom Test Response:', testResponse);
    console.log('Detected Charts:', allCharts);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white px-10 py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6 text-center">
            Chart Visualization Test
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Test the chart detection and rendering functionality
          </p>

          {/* Example Buttons */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Test Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTest(example.data)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all"
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="mb-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Custom Test Input</h2>
            <textarea
              value={testResponse}
              onChange={(e) => setTestResponse(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white min-h-[200px] font-mono text-sm"
              placeholder="Paste your chatbot response here to test chart detection..."
            />
            <button
              onClick={handleCustomTest}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all"
            >
              Test Chart Detection
            </button>
          </div>

          {/* Results */}
          {testResponse && (
            <div className="space-y-6">
              {/* Detected Charts Info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Detection Results</h2>
                <div className="bg-gray-900 rounded p-4 font-mono text-sm">
                  <p className="text-blue-400">
                    Charts Detected: <span className="text-white font-bold">{detectedCharts.length}</span>
                  </p>
                  {detectedCharts.length > 0 && (
                    <div className="mt-2">
                      {detectedCharts.map((chart, idx) => (
                        <div key={idx} className="mt-2 text-gray-300">
                          <p>Chart {idx + 1}:</p>
                          <p className="ml-4">- Type: {chart.type || 'auto-detect'}</p>
                          <p className="ml-4">- Title: {chart.title}</p>
                          <p className="ml-4">- Data points: {chart.data.length}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {detectedCharts.length === 0 && (
                    <p className="text-red-400 mt-2">
                      No visualizable data detected. Make sure your response contains tables, JSON arrays, or lists with numerical data.
                    </p>
                  )}
                </div>
              </div>

              {/* Rendered Charts */}
              {detectedCharts.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4">Rendered Charts</h2>
                  {detectedCharts.map((chart, idx) => (
                    <ChartRenderer
                      key={idx}
                      data={chart.data}
                      title={chart.title}
                      chartType={chart.type}
                    />
                  ))}
                </div>
              )}

              {/* Original Response */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Original Response</h2>
                <pre className="bg-gray-900 rounded p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {testResponse}
                </pre>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-300">How to Format Chatbot Responses</h3>
            <div className="text-gray-300 space-y-2">
              <p>✅ <strong>Markdown Tables:</strong> Use standard markdown table syntax</p>
              <p>✅ <strong>JSON Data:</strong> Wrap in code blocks with ```json or inline arrays</p>
              <p>✅ <strong>Lists:</strong> Use bullet points with numbers (- Item: 123)</p>
              <p>✅ <strong>CSV:</strong> Use ```csv code blocks</p>
              <p>✅ <strong>Chart Directives:</strong> Use [CHART:type] before data</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


