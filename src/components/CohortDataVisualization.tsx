// This is Jayanth's change
import { useState } from 'react';
import { X, PieChart, TrendingUp, BarChart3 } from 'lucide-react';

interface CohortMetrics {
  cohort: 1 | 2 | 3;
  accounts: number;
  winRate: number;
  avgDealSize: number;
  salesCycle: number;
  forecastedMarketingRevenueAttribution: number;
  forecastDelta?: number;
}

interface DeltaMetric {
  cohort: 1 | 2 | 3;
  accountsDelta: number;
  accountsDeltaPct: number;
  winRateDelta: number;
  avgDealSizeDelta: number;
  avgDealSizePct: number;
  salesCycleDelta: number;
  revenueDelta: number;
  revenueDeltaPct: number;
}

interface CohortDataVisualizationProps {
  isOpen: boolean;
  onClose: () => void;
  cohortDataByYear: CohortMetrics[][];
  deltaMetrics: (DeltaMetric | null)[] | null;
  selectedYears: string[];
}

type GraphType = 'accounts-pie' | 'revenue-pie' | 'accounts-bar' | 'revenue-bar' | 'winrate-bar' | 'dealsize-bar' | 'salescycle-bar' | 'cohort-comparison';

const COHORT_COLORS = ['#f97316', '#fbbf24', '#8b5cf6']; // Orange, Yellow, Violet

export default function CohortDataVisualization({
  isOpen,
  onClose,
  cohortDataByYear,
  deltaMetrics: _deltaMetrics,
  selectedYears,
}: CohortDataVisualizationProps) {
  const [selectedGraph, setSelectedGraph] = useState<GraphType>('cohort-comparison');

  if (!isOpen) return null;

  const getCohortLabel = (cohort: number) => {
    return cohort === 1 ? 'High Engagement' : cohort === 2 ? 'Low Engagement' : 'Medium Engagement';
  };

  // Render Accounts Pie Chart for latest year
  const renderAccountsPieChart = () => {
    if (cohortDataByYear.length === 0) return null;
    
    const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
    // Sort by engagement level: Low (2) -> Medium (3) -> High (1)
    const sortedData = [...latestYearData].sort((a, b) => {
      const order = { 2: 0, 3: 1, 1: 2 };
      return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
    });
    const total = sortedData.reduce((sum, c) => sum + c.accounts, 0);
    
    const radius = 120;
    const centerX = 150;
    const centerY = 150;
    
    let currentAngle = 0;
    const slices = sortedData.map((cohort, index) => {
      const percentage = (cohort.accounts / total) * 100;
      const angle = (cohort.accounts / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      let path: string;
      
      // Special case: if this slice is 100%, draw a full circle
      if (angle >= 359.99) {
        path = `M ${centerX} ${centerY} m ${-radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 ${-radius * 2},0`;
      } else {
        // Calculate path for pie slice
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);
        
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        
        const largeArc = angle > 180 ? 1 : 0;
        path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }
      
      return {
        path,
        color: COHORT_COLORS[index],
        cohort: cohort.cohort,
        accounts: cohort.accounts,
        percentage: percentage.toFixed(1),
      };
    });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Accounts Distribution - {selectedYears[selectedYears.length - 1]}
          </h3>
          <p className="text-sm text-slate-600">Total Accounts: {total}</p>
        </div>
        
        <div className="flex items-center justify-center gap-12">
          {/* Pie Chart */}
          <svg width="300" height="300" viewBox="0 0 300 300">
            {slices.map((slice, index) => (
              <g key={index}>
                <path
                  d={slice.path}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              </g>
            ))}
          </svg>
          
          {/* Legend */}
          <div className="space-y-4">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: slice.color }}
                ></div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {getCohortLabel(slice.cohort)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {slice.accounts} accounts ({slice.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Revenue Pie Chart for latest year
  const renderRevenuePieChart = () => {
    if (cohortDataByYear.length === 0) return null;
    
    const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
    // Sort by engagement level: Low (2) -> Medium (3) -> High (1)
    const sortedData = [...latestYearData].sort((a, b) => {
      const order = { 2: 0, 3: 1, 1: 2 };
      return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
    });
    const total = sortedData.reduce((sum, c) => sum + c.forecastedMarketingRevenueAttribution, 0);
    
    const radius = 120;
    const centerX = 150;
    const centerY = 150;
    
    let currentAngle = 0;
    const slices = sortedData.map((cohort, index) => {
      const percentage = (cohort.forecastedMarketingRevenueAttribution / total) * 100;
      const angle = (cohort.forecastedMarketingRevenueAttribution / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      let path: string;
      
      // Special case: if this slice is 100%, draw a full circle
      if (angle >= 359.99) {
        path = `M ${centerX} ${centerY} m ${-radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 ${-radius * 2},0`;
      } else {
        // Calculate path for pie slice
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);
        
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        
        const largeArc = angle > 180 ? 1 : 0;
        path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }
      
      return {
        path,
        color: COHORT_COLORS[index],
        cohort: cohort.cohort,
        revenue: cohort.forecastedMarketingRevenueAttribution,
        percentage: percentage.toFixed(1),
      };
    });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Revenue Distribution - {selectedYears[selectedYears.length - 1]}
          </h3>
          <p className="text-sm text-slate-600">
            Total Revenue: ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-12">
          {/* Pie Chart */}
          <svg width="300" height="300" viewBox="0 0 300 300">
            {slices.map((slice, index) => (
              <g key={index}>
                <path
                  d={slice.path}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              </g>
            ))}
          </svg>
          
          {/* Legend */}
          <div className="space-y-4">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: slice.color }}
                ></div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {getCohortLabel(slice.cohort)}
                  </div>
                  <div className="text-sm text-slate-600">
                    ${slice.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({slice.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Accounts Bar Chart Comparison
  const renderAccountsBarChart = () => {
    if (cohortDataByYear.length === 0) return null;
    
    const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
    // Sort by engagement level: Low (2), Medium (3), High (1)
    const sortedData = [...latestYearData].sort((a, b) => {
      const order = { 2: 0, 3: 1, 1: 2 };
      return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
    });

    const maxValue = Math.max(...sortedData.map(c => c.accounts));
    const width = 700;
    const height = 400;
    const padding = { top: 40, right: 60, bottom: 100, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / (sortedData.length * 2);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Accounts by Cohort - {selectedYears[selectedYears.length - 1]}
          </h3>
          <p className="text-sm text-slate-600">Total Accounts Comparison Across Engagement Levels</p>
        </div>

        <svg width={width} height={height} className="mx-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={padding.top + chartHeight * ratio}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * ratio}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={padding.top + chartHeight * ratio + 5}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                {Math.round(maxValue * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* Bars */}
          {sortedData.map((cohort, index) => {
            const barHeight = (cohort.accounts / maxValue) * chartHeight;
            const x = padding.left + (index * chartWidth) / sortedData.length + barWidth / 2;
            const y = padding.top + chartHeight - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={COHORT_COLORS[index]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${getCohortLabel(cohort.cohort)}: ${cohort.accounts} accounts`}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill={COHORT_COLORS[index]}
                >
                  {cohort.accounts}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[0]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 45}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[1]}
                </text>
              </g>
            );
          })}

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
            Number of Accounts
          </text>
        </svg>
      </div>
    );
  };

  // Render Revenue Bar Chart Comparison
  const renderRevenueBarChart = () => {
    if (cohortDataByYear.length === 0) return null;
    
    const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
    const sortedData = [...latestYearData].sort((a, b) => {
      const order = { 2: 0, 3: 1, 1: 2 };
      return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
    });

    const maxValue = Math.max(...sortedData.map(c => c.forecastedMarketingRevenueAttribution));
    const width = 700;
    const height = 400;
    const padding = { top: 40, right: 60, bottom: 100, left: 100 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / (sortedData.length * 2);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Revenue by Cohort - {selectedYears[selectedYears.length - 1]}
          </h3>
          <p className="text-sm text-slate-600">Forecasted Revenue Comparison Across Engagement Levels</p>
        </div>

        <svg width={width} height={height} className="mx-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={padding.top + chartHeight * ratio}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * ratio}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={padding.top + chartHeight * ratio + 5}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                ${(maxValue * (1 - ratio) / 1000).toFixed(0)}K
              </text>
            </g>
          ))}

          {sortedData.map((cohort, index) => {
            const barHeight = (cohort.forecastedMarketingRevenueAttribution / maxValue) * chartHeight;
            const x = padding.left + (index * chartWidth) / sortedData.length + barWidth / 2;
            const y = padding.top + chartHeight - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={COHORT_COLORS[index]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${getCohortLabel(cohort.cohort)}: $${cohort.forecastedMarketingRevenueAttribution.toLocaleString()}`}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={COHORT_COLORS[index]}
                >
                  ${(cohort.forecastedMarketingRevenueAttribution / 1000).toFixed(0)}K
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[0]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 45}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[1]}
                </text>
              </g>
            );
          })}

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

          <text
            x={25}
            y={height / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#475569"
            transform={`rotate(-90, 25, ${height / 2})`}
          >
            Forecasted Revenue ($)
          </text>
        </svg>
      </div>
    );
  };

  // Render Win Rate Bar Chart Comparison
  const renderWinRateBarChart = () => {
    if (cohortDataByYear.length === 0) return null;
    
    const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
    const sortedData = [...latestYearData].sort((a, b) => {
      const order = { 2: 0, 3: 1, 1: 2 };
      return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
    });

    const maxValue = Math.max(...sortedData.map(c => c.winRate));
    const width = 700;
    const height = 400;
    const padding = { top: 40, right: 60, bottom: 100, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / (sortedData.length * 2);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Win Rate by Cohort - {selectedYears[selectedYears.length - 1]}
          </h3>
          <p className="text-sm text-slate-600">Win Rate Comparison Across Engagement Levels</p>
        </div>

        <svg width={width} height={height} className="mx-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={padding.top + chartHeight * ratio}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * ratio}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={padding.top + chartHeight * ratio + 5}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                {(maxValue * 1.1 * (1 - ratio)).toFixed(1)}%
              </text>
            </g>
          ))}

          {sortedData.map((cohort, index) => {
            const barHeight = (cohort.winRate / (maxValue * 1.1)) * chartHeight;
            const x = padding.left + (index * chartWidth) / sortedData.length + barWidth / 2;
            const y = padding.top + chartHeight - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={COHORT_COLORS[index]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${getCohortLabel(cohort.cohort)}: ${cohort.winRate.toFixed(1)}%`}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill={COHORT_COLORS[index]}
                >
                  {cohort.winRate.toFixed(1)}%
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[0]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 45}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[1]}
                </text>
              </g>
            );
          })}

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

          <text
            x={20}
            y={height / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#475569"
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            Win Rate (%)
          </text>
        </svg>
      </div>
    );
  };

  // Render Deal Size Bar Chart Comparison
  const renderDealSizeBarChart = () => {
    if (cohortDataByYear.length === 0) return null;
    
    const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
    const sortedData = [...latestYearData].sort((a, b) => {
      const order = { 2: 0, 3: 1, 1: 2 };
      return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
    });

    const maxValue = Math.max(...sortedData.map(c => c.avgDealSize));
    const width = 700;
    const height = 400;
    const padding = { top: 40, right: 60, bottom: 100, left: 100 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / (sortedData.length * 2);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Average Deal Size by Cohort - {selectedYears[selectedYears.length - 1]}
          </h3>
          <p className="text-sm text-slate-600">Deal Size Comparison Across Engagement Levels</p>
        </div>

        <svg width={width} height={height} className="mx-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={padding.top + chartHeight * ratio}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * ratio}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={padding.top + chartHeight * ratio + 5}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                ${(maxValue * (1 - ratio) / 1000).toFixed(0)}K
              </text>
            </g>
          ))}

          {sortedData.map((cohort, index) => {
            const barHeight = (cohort.avgDealSize / maxValue) * chartHeight;
            const x = padding.left + (index * chartWidth) / sortedData.length + barWidth / 2;
            const y = padding.top + chartHeight - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={COHORT_COLORS[index]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${getCohortLabel(cohort.cohort)}: $${cohort.avgDealSize.toLocaleString()}`}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={COHORT_COLORS[index]}
                >
                  ${(cohort.avgDealSize / 1000).toFixed(1)}K
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[0]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 45}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[1]}
                </text>
              </g>
            );
          })}

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

          <text
            x={25}
            y={height / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#475569"
            transform={`rotate(-90, 25, ${height / 2})`}
          >
            Average Deal Size ($)
          </text>
        </svg>
      </div>
    );
  };

  // Render Sales Cycle Bar Chart Comparison
  const renderSalesCycleBarChart = () => {
    if (cohortDataByYear.length === 0) return null;
    
    const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
    const sortedData = [...latestYearData].sort((a, b) => {
      const order = { 2: 0, 3: 1, 1: 2 };
      return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
    });

    const maxValue = Math.max(...sortedData.map(c => c.salesCycle));
    const width = 700;
    const height = 400;
    const padding = { top: 40, right: 60, bottom: 100, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / (sortedData.length * 2);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Sales Cycle by Cohort - {selectedYears[selectedYears.length - 1]}
          </h3>
          <p className="text-sm text-slate-600">Average Sales Cycle Comparison Across Engagement Levels</p>
        </div>

        <svg width={width} height={height} className="mx-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={padding.top + chartHeight * ratio}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * ratio}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={padding.top + chartHeight * ratio + 5}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                {(maxValue * (1 - ratio)).toFixed(0)} days
              </text>
            </g>
          ))}

          {sortedData.map((cohort, index) => {
            const barHeight = (cohort.salesCycle / maxValue) * chartHeight;
            const x = padding.left + (index * chartWidth) / sortedData.length + barWidth / 2;
            const y = padding.top + chartHeight - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={COHORT_COLORS[index]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${getCohortLabel(cohort.cohort)}: ${cohort.salesCycle.toFixed(0)} days`}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill={COHORT_COLORS[index]}
                >
                  {cohort.salesCycle.toFixed(0)} days
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[0]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 45}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#334155"
                >
                  {getCohortLabel(cohort.cohort).split(' ')[1]}
                </text>
              </g>
            );
          })}

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

          <text
            x={20}
            y={height / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#475569"
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            Sales Cycle (Days)
          </text>
        </svg>
      </div>
    );
  };

  // Render Comprehensive Cohort Comparison with Trend Lines
  const renderCohortComparison = () => {
    if (cohortDataByYear.length === 0) return null;
    
    const latestYearData = cohortDataByYear[cohortDataByYear.length - 1];
    const sortedData = [...latestYearData].sort((a, b) => {
      const order = { 2: 0, 3: 1, 1: 2 };
      return order[a.cohort as 1 | 2 | 3] - order[b.cohort as 1 | 2 | 3];
    });

    // Define metrics for X-axis
    const metricNames = ['Accounts', 'Win Rate', 'Avg Deal Size', 'Sales Cycle', 'Revenue'];
    
    // Extract values for each cohort
    const cohortLines = sortedData.map((cohort, index) => ({
      cohort: cohort.cohort,
      label: getCohortLabel(cohort.cohort),
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

    const width = 900;
    const height = 500;
    const padding = { top: 60, right: 60, bottom: 80, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find global max for normalization
    const allValues = cohortLines.flatMap(line => line.values);
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    const valueRange = maxValue - minValue;

    // Calculate positions
    const xScale = chartWidth / (metricNames.length - 1);

    return (
      <div className="space-y-8 w-full">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            Cohort Performance Trends - {selectedYears[selectedYears.length - 1]}
          </h3>
          <p className="text-sm text-slate-600">Multi-Metric Performance Comparison Across Engagement Levels</p>
        </div>

        {/* Trend Line Chart */}
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

            {/* Vertical grid lines for metrics */}
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

            {/* Trend lines for each cohort */}
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
                  {/* Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={line.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {points.map((point, i) => (
                    <g key={i}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="6"
                        fill="#ffffff"
                        stroke={line.color}
                        strokeWidth="3"
                        className="hover:r-8 transition-all cursor-pointer"
                      >
                        <title>{`${line.label} - ${metricNames[i]}: ${point.displayValue}`}</title>
                      </circle>
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

            {/* X-axis labels (Metrics) */}
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

            {/* Chart Title */}
            <text
              x={width / 2}
              y={30}
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill="#1e293b"
            >
              Cohort Performance Trends
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
        </div>

        {/* Key Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedData.map((cohort, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border-t-4"
              style={{ borderTopColor: COHORT_COLORS[index] }}
            >
              <h4 className="font-bold text-lg text-slate-800 mb-3">
                {getCohortLabel(cohort.cohort)}
              </h4>
              <div className="space-y-2 text-sm">
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
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-slate-600">Total Revenue:</span>
                  <span className="font-semibold text-cyan-600">${(cohort.forecastedMarketingRevenueAttribution / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSelectedGraph = () => {
    switch (selectedGraph) {
      case 'cohort-comparison':
        return renderCohortComparison();
      case 'accounts-pie':
        return renderAccountsPieChart();
      case 'revenue-pie':
        return renderRevenuePieChart();
      case 'accounts-bar':
        return renderAccountsBarChart();
      case 'revenue-bar':
        return renderRevenueBarChart();
      case 'winrate-bar':
        return renderWinRateBarChart();
      case 'dealsize-bar':
        return renderDealSizeBarChart();
      case 'salescycle-bar':
        return renderSalesCycleBarChart();
      default:
        return null;
    }
  };

  const graphOptions = [
    { id: 'cohort-comparison', name: 'Complete Comparison', icon: BarChart3, category: 'Overview' },
    { id: 'accounts-pie', name: 'Accounts Distribution', icon: PieChart, category: 'Distribution' },
    { id: 'revenue-pie', name: 'Revenue Distribution', icon: PieChart, category: 'Distribution' },
    { id: 'accounts-bar', name: 'Accounts Comparison', icon: BarChart3, category: 'Metrics' },
    { id: 'revenue-bar', name: 'Revenue Comparison', icon: BarChart3, category: 'Metrics' },
    { id: 'winrate-bar', name: 'Win Rate Comparison', icon: TrendingUp, category: 'Metrics' },
    { id: 'dealsize-bar', name: 'Deal Size Comparison', icon: TrendingUp, category: 'Metrics' },
    { id: 'salescycle-bar', name: 'Sales Cycle Comparison', icon: TrendingUp, category: 'Metrics' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="tab-header flex-between px-6">
          <h2 className="text-2xl font-bold text-white">Data Visualization</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Graph Selection */}
          <div className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto">
            <div className="p-4">
              {/* Overview Section */}
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                Overview
              </h3>
              {graphOptions.filter(opt => opt.category === 'Overview').map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedGraph(option.id as GraphType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                      selectedGraph === option.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{option.name}</span>
                  </button>
                );
              })}

              {/* Distribution Charts */}
              <h3 className="text-sm font-semibold text-slate-700 mb-3 mt-6 uppercase tracking-wide">
                Distribution Charts
              </h3>
              {graphOptions.filter(opt => opt.category === 'Distribution').map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedGraph(option.id as GraphType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                      selectedGraph === option.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{option.name}</span>
                  </button>
                );
              })}

              {/* Metric Comparisons */}
              <h3 className="text-sm font-semibold text-slate-700 mb-3 mt-6 uppercase tracking-wide">
                Metric Comparisons
              </h3>
              {graphOptions.filter(opt => opt.category === 'Metrics').map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedGraph(option.id as GraphType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                      selectedGraph === option.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content - Visualization */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            {renderSelectedGraph()}
          </div>
        </div>
      </div>
    </div>
  );
}

