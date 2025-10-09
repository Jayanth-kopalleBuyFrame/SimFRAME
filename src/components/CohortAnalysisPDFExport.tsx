// This is Jayanth's change
import { useRef } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { 
  generateHardcodedCohortData, 
  generateCohortMetricsFromAccounts,
  calculateYearOverYearDeltas
} from '../utils/cohortCalculations';
import { Download } from 'lucide-react';
import DeltaGraph from './DeltaGraph';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COHORT_RANGES = {
  1: '3000+',
  2: '0-1000',
  3: '1001-3000',
};

const COHORT_NAMES = {
  1: 'Cohort 1',
  2: 'Cohort 2',
  3: 'Cohort 3',
};

const COHORT_ENGAGEMENT_LABELS = {
  1: 'High Engagement',
  2: 'Low Engagement',
  3: 'Medium Engagement',
};

export default function CohortAnalysisPDFExport() {
  const { cohortFilters, committedCohortData } = useSimulatorStore();
  const contentRef = useRef<HTMLDivElement>(null);

  // This is Jayanth's change
  // Generate cohort data for all selected years
  const cohortDataByYear = cohortFilters.selectedYears.map((year) => {
    if (year === 'FY 25-26' && committedCohortData) {
      return [
        generateCohortMetricsFromAccounts(1, committedCohortData.cohort1Count, committedCohortData.cohort1Simulations || [], year),
        generateCohortMetricsFromAccounts(2, committedCohortData.cohort2Count, committedCohortData.cohort2Simulations || [], year),
        generateCohortMetricsFromAccounts(3, committedCohortData.cohort3Count, committedCohortData.cohort3Simulations || [], year),
      ];
    }
    return generateHardcodedCohortData(year);
  });

  // Calculate year-over-year deltas
  const cohortDataWithDeltas = cohortDataByYear.map((yearData, index) => {
    if (index === 0) return yearData;
    const previousYearData = cohortDataByYear[index - 1];
    return calculateYearOverYearDeltas(yearData, previousYearData);
  });

  // Calculate delta metrics
  const deltaMetrics = cohortFilters.selectedYears.length >= 2 ? [1, 2, 3].map((cohortNum) => {
    const firstYear = cohortDataByYear[0];
    const lastYear = cohortDataByYear[cohortDataByYear.length - 1];
    const first = firstYear.find((c) => c.cohort === cohortNum);
    const last = lastYear.find((c) => c.cohort === cohortNum);

    if (!first || !last) return null;

    const accountsDelta = last.accounts - first.accounts;
    const accountsDeltaPct = (accountsDelta / first.accounts) * 100;
    const winRateDelta = last.winRate - first.winRate;
    const avgDealSizeDelta = last.avgDealSize - first.avgDealSize;
    const avgDealSizePct = (avgDealSizeDelta / first.avgDealSize) * 100;
    const salesCycleDelta = last.salesCycle - first.salesCycle;
    const revenueDelta = last.forecastedMarketingRevenueAttribution - first.forecastedMarketingRevenueAttribution;
    const revenueDeltaPct = (revenueDelta / first.forecastedMarketingRevenueAttribution) * 100;

    return {
      cohort: cohortNum as 1 | 2 | 3,
      accountsDelta,
      accountsDeltaPct,
      winRateDelta,
      avgDealSizeDelta,
      avgDealSizePct,
      salesCycleDelta,
      revenueDelta,
      revenueDeltaPct,
    };
  }).filter(Boolean) : null;

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      // Get all sections
      const sections = contentRef.current.querySelectorAll('.pdf-section');
      let currentY = margin;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        // Capture section as canvas
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (currentY + imgHeight > pageHeight - margin && i > 0) {
          pdf.addPage();
          currentY = margin;
        }

        // Add image to PDF
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5;

        // Add new page if not the last section
        if (i < sections.length - 1 && currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = margin;
        }
      }

      // Save PDF
      const fileName = `Cohort_Analysis_${cohortFilters.selectedYears.join('_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={handleDownloadPDF}
        disabled={cohortFilters.selectedYears.length === 0}
        className={`${
          cohortFilters.selectedYears.length > 0
            ? 'btn-primary'
            : 'bg-slate-400 cursor-not-allowed'
        } flex items-center gap-2 shadow-md hover:shadow-lg`}
      >
        <Download className="w-5 h-5" />
        Download PDF Report
      </button>

      {/* Hidden content for PDF generation */}
      <div ref={contentRef} className="fixed -left-[9999px] w-[1200px] bg-white">
        {/* Header */}
        <div className="pdf-section p-8 bg-white">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">SimFRAME Cohort Analysis Report</h1>
          <p className="text-slate-600 mb-4">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          {committedCohortData && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Accounts Committed to FY 25-26
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold">{committedCohortData.cohort1Count}</span> accounts in Cohort 1 (High Engagement)
                </div>
                <div>
                  <span className="font-semibold">{committedCohortData.cohort2Count}</span> accounts in Cohort 2 (Low Engagement)
                </div>
                <div>
                  <span className="font-semibold">{committedCohortData.cohort3Count}</span> accounts in Cohort 3 (Medium Engagement)
                </div>
              </div>
            </div>
          )}
          <div className="border-t-2 border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Cohort Definitions</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {([1, 2, 3] as const).map((cohort) => (
                <div key={cohort} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#003D6B' }}></div>
                  <span className="text-slate-600">
                    {COHORT_NAMES[cohort]} ({COHORT_ENGAGEMENT_LABELS[cohort]}): {COHORT_RANGES[cohort]} score
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Complete Comparison Trend Graph */}
        {cohortFilters.selectedYears.length > 0 && cohortDataByYear.length > 0 && (
          <div className="pdf-section p-8 bg-white">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Cohort Performance Trends - {cohortFilters.selectedYears[cohortFilters.selectedYears.length - 1]}
              </h2>
              <p className="text-sm text-slate-600">Multi-Metric Performance Comparison Across Engagement Levels</p>
            </div>

            {(() => {
              const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
              const sortedData = [...latestYearData].sort((a, b) => {
                const order = { 2: 0, 3: 1, 1: 2 };
                return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
              });

              const COHORT_COLORS = ['#f97316', '#fbbf24', '#8b5cf6']; // Orange, Yellow, Violet
              const metricNames = ['Accounts', 'Win Rate', 'Avg Deal Size', 'Sales Cycle', 'Revenue'];
              
              const cohortLines = sortedData.map((cohort, index) => ({
                cohort: cohort.cohort,
                label: COHORT_ENGAGEMENT_LABELS[cohort.cohort as 1 | 2 | 3],
                color: COHORT_COLORS[index],
                values: [
                  cohort.accounts,
                  cohort.winRate,
                  cohort.avgDealSize / 1000,
                  cohort.salesCycle,
                  cohort.forecastedMarketingRevenueAttribution / 1000
                ],
                displayValues: [
                  `${cohort.accounts}`,
                  `${cohort.winRate.toFixed(1)}%`,
                  `$${(cohort.avgDealSize / 1000).toFixed(1)}K`,
                  `${cohort.salesCycle.toFixed(0)} days`,
                  `$${(cohort.forecastedMarketingRevenueAttribution / 1000).toFixed(0)}K`
                ]
              }));

              const width = 1100;
              const height = 500;
              const padding = { top: 60, right: 60, bottom: 80, left: 80 };
              const chartWidth = width - padding.left - padding.right;
              const chartHeight = height - padding.top - padding.bottom;

              const allValues = cohortLines.flatMap(line => line.values);
              const maxValue = Math.max(...allValues);
              const minValue = Math.min(...allValues);
              const valueRange = maxValue - minValue;
              const xScale = chartWidth / (metricNames.length - 1);

              return (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <svg width={width} height={height} className="mx-auto">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                      <g key={i}>
                        <line
                          x1={padding.left}
                          y1={padding.top + chartHeight * ratio}
                          x2={padding.left + chartWidth}
                          y2={padding.top + chartHeight * ratio}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      </g>
                    ))}

                    {/* Vertical grid lines */}
                    {metricNames.map((_, index) => (
                      <line
                        key={index}
                        x1={padding.left + index * xScale}
                        y1={padding.top}
                        x2={padding.left + index * xScale}
                        y2={padding.top + chartHeight}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Trend lines */}
                    {cohortLines.map((line, lineIndex) => {
                      const points = line.values.map((value, metricIndex) => {
                        const normalizedValue = (value - minValue) / valueRange;
                        return {
                          x: padding.left + metricIndex * xScale,
                          y: padding.top + chartHeight - (normalizedValue * chartHeight),
                          value: value,
                          displayValue: line.displayValues[metricIndex]
                        };
                      });

                      const pathData = points.map((p, i) => 
                        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                      ).join(' ');

                      return (
                        <g key={lineIndex}>
                          <path
                            d={pathData}
                            fill="none"
                            stroke={line.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {points.map((point, i) => (
                            <g key={i}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill="#ffffff"
                                stroke={line.color}
                                strokeWidth="3"
                              />
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill={line.color}
                              />
                            </g>
                          ))}
                        </g>
                      );
                    })}

                    {/* X-axis labels */}
                    {metricNames.map((metric, index) => (
                      <text
                        key={index}
                        x={padding.left + index * xScale}
                        y={padding.top + chartHeight + 35}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="600"
                        fill="#475569"
                      >
                        {metric}
                      </text>
                    ))}

                    {/* Axes */}
                    <line
                      x1={padding.left}
                      y1={padding.top}
                      x2={padding.left}
                      y2={padding.top + chartHeight}
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                    <line
                      x1={padding.left}
                      y1={padding.top + chartHeight}
                      x2={padding.left + chartWidth}
                      y2={padding.top + chartHeight}
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />

                    {/* Y-axis label */}
                    <text
                      x={20}
                      y={height / 2}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="600"
                      fill="#475569"
                      transform={`rotate(-90, 20, ${height / 2})`}
                    >
                      Performance Index
                    </text>

                    {/* X-axis label */}
                    <text
                      x={width / 2}
                      y={height - 20}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="600"
                      fill="#475569"
                    >
                      Key Metrics
                    </text>
                  </svg>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-6 mt-6">
                    {cohortLines.map((line, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-1 rounded"
                            style={{ backgroundColor: line.color }}
                          ></div>
                          <div 
                            className="w-3 h-3 rounded-full border-2 -ml-1.5"
                            style={{ 
                              backgroundColor: '#ffffff',
                              borderColor: line.color
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {line.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Key Insights Cards */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {sortedData.map((cohort, index) => (
                      <div 
                        key={index}
                        className="bg-white rounded-lg border-2 p-4"
                        style={{ borderColor: COHORT_COLORS[index] }}
                      >
                        <h4 className="font-bold text-base text-slate-800 mb-3">
                          {COHORT_ENGAGEMENT_LABELS[cohort.cohort as 1 | 2 | 3]}
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Accounts:</span>
                            <span className="font-semibold text-slate-800">{cohort.accounts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Win Rate:</span>
                            <span className="font-semibold text-blue-600">{cohort.winRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Avg Deal Size:</span>
                            <span className="font-semibold text-purple-600">${(cohort.avgDealSize / 1000).toFixed(1)}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Sales Cycle:</span>
                            <span className="font-semibold text-amber-600">{cohort.salesCycle.toFixed(0)} days</span>
                          </div>
                          <div className="flex justify-between border-t pt-1 mt-1">
                            <span className="text-slate-600">Revenue:</span>
                            <span className="font-semibold text-cyan-600">${(cohort.forecastedMarketingRevenueAttribution / 1000).toFixed(0)}K</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Delta Graph */}
        {deltaMetrics && deltaMetrics.length > 0 && (
          <div className="pdf-section p-8 bg-white">
            <DeltaGraph
              deltaMetrics={deltaMetrics as any}
              fromYear={cohortFilters.selectedYears[0]}
              toYear={cohortFilters.selectedYears[cohortFilters.selectedYears.length - 1]}
            />
          </div>
        )}

        {/* Cohort Flow */}
        {cohortFilters.selectedYears.length > 0 && (
          <div className="pdf-section p-8 bg-white">
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-lg">
              Cohort Flow Visualization
            </h2>
            <div className="border border-slate-200 rounded-b-lg p-6">
              <div className="flex gap-16 justify-center">
                {cohortDataByYear.map((yearData, yearIndex) => (
                  <div key={yearIndex} className="flex flex-col items-center gap-8">
                    <div className="text-lg font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg">
                      {cohortFilters.selectedYears[yearIndex]}
                    </div>
                    
                    {yearData.map((cohort) => {
                      const firstYearCohort = cohortDataByYear[0]?.find(c => c.cohort === cohort.cohort);
                      const change = firstYearCohort && yearIndex > 0 ? cohort.accounts - firstYearCohort.accounts : null;
                      
                      return (
                        <div key={cohort.cohort} className="flex flex-col items-center gap-3">
                          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                            {COHORT_ENGAGEMENT_LABELS[cohort.cohort as 1 | 2 | 3]}
                          </div>
                          
                          <div className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center" style={{ backgroundColor: '#003D6B', color: 'white' }}>
                            <div className="text-xs opacity-80">#Accounts</div>
                            <div className="text-3xl font-bold">{cohort.accounts}</div>
                            <div className="text-sm">{COHORT_NAMES[cohort.cohort as 1 | 2 | 3]}</div>
                            
                            {change !== null && yearIndex > 0 && (
                              <div className={`absolute -bottom-2 px-2 py-1 rounded-full text-xs font-bold ${
                                change > 0 ? 'bg-green-500' : change < 0 ? 'bg-red-500' : 'bg-gray-500'
                              }`}>
                                {change > 0 ? '+' : ''}{change}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metrics Tables */}
        {cohortDataWithDeltas.map((yearData, yearIndex) => (
          <div key={yearIndex} className="pdf-section p-8 bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold text-white">
                {cohortFilters.selectedYears[yearIndex]} - Cohort Metrics
              </h2>
            </div>
            
            <div className="border border-slate-200 rounded-b-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Metric</th>
                    {yearData.map((cohort) => (
                      <th key={cohort.cohort} className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">
                        {COHORT_NAMES[cohort.cohort as 1 | 2 | 3]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Accounts</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="px-4 py-3 text-center">{cohort.accounts}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Win Rate</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="px-4 py-3 text-center">{cohort.winRate.toFixed(1)}%</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Avg Deal Size</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="px-4 py-3 text-center">${cohort.avgDealSize.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Avg Sales Pipeline (Days)</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="px-4 py-3 text-center">{cohort.salesCycle}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Forecasted Marketing Revenue</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="px-4 py-3 text-center">
                        ${cohort.forecastedMarketingRevenueAttribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    ))}
                  </tr>
                  {yearIndex > 0 && (
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">YoY Revenue Delta</td>
                      {yearData.map((cohort) => (
                        <td key={cohort.cohort} className="px-4 py-3 text-center">
                          <span className={`font-semibold ${
                            cohort.forecastDelta > 0 ? 'text-green-600' :
                            cohort.forecastDelta < 0 ? 'text-red-600' : 'text-slate-600'
                          }`}>
                            {cohort.forecastDelta > 0 ? '+' : ''}{cohort.forecastDelta.toFixed(1)}%
                          </span>
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Delta Comparison Table */}
        {deltaMetrics && deltaMetrics.length > 0 && cohortFilters.selectedYears.length >= 2 && (
          <div className="pdf-section p-8 bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold text-white">
                Year-over-Year Delta Analysis
              </h2>
              <p className="text-white text-sm mt-1">
                Comparing {cohortFilters.selectedYears[0]} to {cohortFilters.selectedYears[cohortFilters.selectedYears.length - 1]}
              </p>
            </div>
            
            <div className="border border-slate-200 rounded-b-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Metric</th>
                    {deltaMetrics.map((delta: any) => (
                      <th key={delta.cohort} className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">
                        {COHORT_NAMES[delta.cohort as 1 | 2 | 3]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Accounts Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="px-4 py-3 text-center">
                        <span className={`font-semibold ${delta.accountsDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta.accountsDelta >= 0 ? '+' : ''}{delta.accountsDelta} ({delta.accountsDeltaPct.toFixed(1)}%)
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Win Rate Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="px-4 py-3 text-center">
                        <span className={`font-semibold ${delta.winRateDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta.winRateDelta >= 0 ? '+' : ''}{delta.winRateDelta.toFixed(1)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Avg Deal Size Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="px-4 py-3 text-center">
                        <span className={`font-semibold ${delta.avgDealSizeDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta.avgDealSizeDelta >= 0 ? '+' : ''}${Math.abs(delta.avgDealSizeDelta).toLocaleString()} ({delta.avgDealSizePct.toFixed(1)}%)
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">Sales Cycle Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="px-4 py-3 text-center">
                        <span className={`font-semibold ${delta.salesCycleDelta <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta.salesCycleDelta >= 0 ? '+' : ''}{delta.salesCycleDelta} days
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">Revenue Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="px-4 py-3 text-center">
                        <span className={`font-bold text-lg ${delta.revenueDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta.revenueDelta >= 0 ? '+' : ''}${Math.abs(delta.revenueDelta).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({delta.revenueDeltaPct.toFixed(1)}%)
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

