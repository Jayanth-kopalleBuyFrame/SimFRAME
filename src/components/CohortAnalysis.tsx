// This is Jayanth's change
import { useMemo, useState } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { 
  generateHardcodedCohortData, 
  generateCohortMetricsFromAccounts,
  calculateYearOverYearDeltas
} from '../utils/cohortCalculations';
import { TrendingUp, AlertCircle, Award, Eye, EyeOff } from 'lucide-react';
import CohortAnalysisPDFExport from './CohortAnalysisPDFExport';

// All cohorts now use the same dark navy blue color

// This is Jayanth's change
const COHORT_RANGES = {
  1: '3000+',
  2: '0-1000',
  3: '1001-3000',
};

// This is Jayanth's change
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

export default function CohortAnalysis() {
  const { cohortFilters, setCohortFilters, committedCohortData } = useSimulatorStore();
  const availableYears = ['FY 24-25', 'FY 25-26', 'FY 26-27', 'FY 27-28'];
  const [showCohortFlow, setShowCohortFlow] = useState(false);

  const handleYearSelection = (year: string) => {
    const selected = cohortFilters.selectedYears.includes(year)
      ? cohortFilters.selectedYears.filter((y) => y !== year)
      : [...cohortFilters.selectedYears, year];
    
    setCohortFilters({ selectedYears: selected.sort() });
  };

  // Generate cohort data for all selected years
  const cohortDataByYear = useMemo(() => {
    return cohortFilters.selectedYears.map((year) => {
      if (year === 'FY 25-26' && committedCohortData) {
        // Use committed data for FY 25-26
        return [
          generateCohortMetricsFromAccounts(1, committedCohortData.cohort1Count, committedCohortData.cohort1Actions || [], year),
          generateCohortMetricsFromAccounts(2, committedCohortData.cohort2Count, committedCohortData.cohort2Actions || [], year),
          generateCohortMetricsFromAccounts(3, committedCohortData.cohort3Count, committedCohortData.cohort3Actions || [], year),
        ];
      }
      // Use hardcoded data for other years
      return generateHardcodedCohortData(year);
    });
  }, [cohortFilters.selectedYears, committedCohortData]);

  // Calculate year-over-year deltas
  const cohortDataWithDeltas = useMemo(() => {
    return cohortDataByYear.map((yearData, index) => {
      if (index === 0) return yearData;
      const previousYearData = cohortDataByYear[index - 1];
      return calculateYearOverYearDeltas(yearData, previousYearData);
    });
  }, [cohortDataByYear]);

  // Calculate delta metrics across all years
  const deltaMetrics = useMemo(() => {
    if (cohortFilters.selectedYears.length < 2) return null;

    const firstYear = cohortDataByYear[0];
    const lastYear = cohortDataByYear[cohortDataByYear.length - 1];

    return [1, 2, 3].map((cohortNum) => {
      const first = firstYear.find((c) => c.cohort === cohortNum);
      const last = lastYear.find((c) => c.cohort === cohortNum);

      if (!first || !last) return null;

      const accountsDelta = last.accounts - first.accounts;
      const accountsDeltaPct = ((accountsDelta / first.accounts) * 100);
      
      const winRateDelta = last.winRate - first.winRate;
      const avgDealSizeDelta = last.avgDealSize - first.avgDealSize;
      const avgDealSizePct = ((avgDealSizeDelta / first.avgDealSize) * 100);
      
      const salesCycleDelta = last.salesCycle - first.salesCycle;
      const revenueDelta = last.forecastedMarketingRevenueAttribution - first.forecastedMarketingRevenueAttribution;
      const revenueDeltaPct = ((revenueDelta / first.forecastedMarketingRevenueAttribution) * 100);

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
    }).filter(Boolean);
  }, [cohortDataByYear, cohortFilters.selectedYears]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="tab-header-with-shadow mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="tab-header-title">Cohort Analysis</h1>
              <p className="tab-header-subtitle">Analyze account cohorts and forecast revenue attribution</p>
            </div>
            <CohortAnalysisPDFExport />
          </div>
        </div>

        {/* Committed Data Banner */}
        {committedCohortData && (
          <div className="notification-success">
            <div className="flex-start gap-4">
              <div className="flex-shrink-0">
                <Award className="icon-lg icon-success" />
              </div>
              <div className="flex-1">
                <h3 className="notification-title text-lg mb-2">
                  Accounts Committed to FY 25-26
                </h3>
                <div className="grid-3-cols text-sm">
                  <div className="flex-start gap-2">
                    <div className="cohort-indicator"></div>
                    <span className="text-slate-700">
                      <span className="font-semibold">{committedCohortData.cohort1Count}</span> accounts in Cohort 1 (High Engagement)
                    </span>
                  </div>
                  <div className="flex-start gap-2">
                    <div className="cohort-indicator"></div>
                    <span className="text-slate-700">
                      <span className="font-semibold">{committedCohortData.cohort2Count}</span> accounts in Cohort 2 (Low Engagement)
                    </span>
                  </div>
                  <div className="flex-start gap-2">
                    <div className="cohort-indicator"></div>
                    <span className="text-slate-700">
                      <span className="font-semibold">{committedCohortData.cohort3Count}</span> accounts in Cohort 3 (Medium Engagement)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Committed on {committedCohortData.committedAt.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card-padded section-spacing">
          <h2 className="card-title">Filters</h2>
          
          <div className="grid-2-cols">
            {/* Number of Years */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Years
              </label>
              <select
                value={cohortFilters.numberOfYears}
                onChange={(e) => setCohortFilters({ numberOfYears: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Year' : 'Years'}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Years
              </label>
              <div className="flex flex-wrap gap-2">
                {availableYears.map((year) => {
                  const isSelected = cohortFilters.selectedYears.includes(year);
                  const isDisabled = !isSelected && cohortFilters.selectedYears.length >= cohortFilters.numberOfYears;
                  
                  return (
                    <button
                      key={year}
                      onClick={() => handleYearSelection(year)}
                      disabled={isDisabled}
                      className={
                        isSelected 
                          ? 'cohort-year-button-active'
                          : isDisabled
                          ? 'cohort-year-button-disabled'
                          : 'cohort-year-button-inactive'
                      }
                    >
                      {year}
                      {year === 'FY 25-26' && committedCohortData && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cohort Legend */}
          <div className="section-divider">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Cohort Definitions (Account Score Ranges)</h3>
            <div className="grid-3-cols">
              {([1, 2, 3] as const).map((cohort) => (
                <div key={cohort} className="flex-start gap-3">
                  <div className="cohort-indicator-lg"></div>
                  <span className="text-sm text-slate-600">
                    {COHORT_NAMES[cohort]} ({COHORT_ENGAGEMENT_LABELS[cohort]}): {COHORT_RANGES[cohort]} score
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* No Committed Data Warning */}
        {!committedCohortData && cohortFilters.selectedYears.includes('FY 25-26') && (
          <div className="notification-warning">
            <div className="flex-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="notification-title mb-1">No Committed Data for FY 25-26</h3>
                <p className="notification-text">
                  FY 25-26 is showing placeholder data. Import accounts and commit them in the Simulating Workbench tab to see actual projections.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cohort Flow Visualization - Toggle Button */}
        {cohortFilters.selectedYears.length > 0 && (
          <div className="section-spacing flex justify-end mb-4">
            <button
              onClick={() => setShowCohortFlow(!showCohortFlow)}
              className="flex-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md"
            >
              {showCohortFlow ? (
                <>
                  <EyeOff className="w-5 h-5" />
                  Hide Cohort Flow
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Show Cohort Flow
                </>
              )}
            </button>
          </div>
        )}

        {/* Cohort Flow Visualization */}
        {cohortFilters.selectedYears.length > 0 && showCohortFlow && (
          <div className="card shadow-md overflow-hidden section-spacing">
            <div className="cohort-section-header">
              <h2 className="cohort-section-title">Cohort Flow Visualization</h2>
            </div>
            <div className="p-6">
            
            <div className="overflow-x-auto">
              <div className="flex gap-16 min-w-max pb-4 justify-center">
                {cohortDataByYear.map((yearData, yearIndex) => (
                  <div key={yearIndex} className="flex flex-col items-center gap-8">
                    <div className="cohort-flow-year-label">
                      {cohortFilters.selectedYears[yearIndex]}
                    </div>
                    
                    {yearData.map((cohort) => {
                      // Calculate change from first year
                      const firstYearCohort = cohortDataByYear[0]?.find(c => c.cohort === cohort.cohort);
                      const change = firstYearCohort && yearIndex > 0 ? cohort.accounts - firstYearCohort.accounts : null;
                      
                      return (
                        <div key={cohort.cohort} className="relative flex flex-col items-center gap-3">
                          {/* Engagement Label Above Circle */}
                          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                            {COHORT_ENGAGEMENT_LABELS[cohort.cohort as 1 | 2 | 3]}
                          </div>
                          
                          {/* Circle */}
                          <div className="cohort-circle">
                            <div className="cohort-circle-label">#Accounts</div>
                            <div className="cohort-circle-count">{cohort.accounts}</div>
                            <div className="cohort-circle-subtitle">{COHORT_NAMES[cohort.cohort as 1 | 2 | 3]}</div>
                            
                            {/* Show change inside circle if not first year */}
                            {change !== null && yearIndex > 0 && (
                              <div className={
                                change > 0 ? 'cohort-circle-delta-positive' : 
                                change < 0 ? 'cohort-circle-delta-negative' : 
                                'cohort-circle-delta-neutral'
                              }>
                                <TrendingUp className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
                                <span>{change > 0 ? '+' : ''}{change}</span>
                              </div>
                            )}
                          </div>

                          {/* Flow lines to next year */}
                          {yearIndex < cohortDataByYear.length - 1 && (
                            <div className="cohort-flow-arrow">
                              <svg className="w-16 h-2" style={{ overflow: 'visible' }}>
                                <line 
                                  x1="0" 
                                  y1="1" 
                                  x2="64" 
                                  y2="1" 
                                  stroke="#94a3b8" 
                                  strokeWidth="2"
                                  markerEnd="url(#arrowhead)"
                                />
                                <defs>
                                  <marker
                                    id="arrowhead"
                                    markerWidth="10"
                                    markerHeight="10"
                                    refX="9"
                                    refY="3"
                                    orient="auto"
                                  >
                                    <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                                  </marker>
                                </defs>
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Metrics Tables for Each Year - Transposed (Metrics as Rows, Cohorts as Columns) */}
        {cohortDataWithDeltas.map((yearData, yearIndex) => (
          <div key={yearIndex} className="card shadow-md overflow-hidden section-spacing">
            <div className="cohort-section-header">
              <div className="flex-between">
                <h2 className="cohort-section-title">
                  {cohortFilters.selectedYears[yearIndex]} - Cohort Metrics
                </h2>
                {cohortFilters.selectedYears[yearIndex] === 'FY 25-26' && committedCohortData && (
                  <span className="cohort-section-badge">
                    ✓ Committed Data
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="cohort-table">
                <thead className="cohort-table-header">
                  <tr>
                    <th className="cohort-table-header-cell">Metric</th>
                    {yearData.map((cohort) => (
                      <th key={cohort.cohort} className="cohort-table-header-cell-center">
                        <div className="flex-center gap-2">
                          <div className="cohort-indicator"></div>
                          <span>{COHORT_NAMES[cohort.cohort as 1 | 2 | 3]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="cohort-table-body">
                  <tr className="cohort-table-row">
                    <td className="cohort-table-cell-bold">Accounts</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="cohort-table-cell-center">{cohort.accounts}</td>
                    ))}
                  </tr>
                  <tr className="cohort-table-row">
                    <td className="cohort-table-cell-bold">Win Rate</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="cohort-table-cell-center">{cohort.winRate.toFixed(1)}%</td>
                    ))}
                  </tr>
                  <tr className="cohort-table-row">
                    <td className="cohort-table-cell-bold">Avg Deal Size</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="cohort-table-cell-center">
                        ${cohort.avgDealSize.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="cohort-table-row">
                    <td className="cohort-table-cell-bold">Avg Sales Pipeline (Days)</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="cohort-table-cell-center">{cohort.salesCycle}</td>
                    ))}
                  </tr>
                  <tr className="cohort-table-row">
                    <td className="cohort-table-cell-bold">Forecasted Marketing Revenue</td>
                    {yearData.map((cohort) => (
                      <td key={cohort.cohort} className="cohort-table-cell-center">
                        ${cohort.forecastedMarketingRevenueAttribution.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    ))}
                  </tr>
                  {yearIndex > 0 && (
                    <tr className="cohort-table-row">
                      <td className="cohort-table-cell-bold">YoY Revenue Delta</td>
                      {yearData.map((cohort) => (
                        <td key={cohort.cohort} className="cohort-table-cell-center">
                          <span
                            className={`font-semibold ${
                              cohort.forecastDelta > 0
                                ? 'text-green-600'
                                : cohort.forecastDelta < 0
                                ? 'text-red-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {cohort.forecastDelta > 0 ? '+' : ''}
                            {cohort.forecastDelta.toFixed(1)}%
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
          <div className="card shadow-md overflow-hidden section-spacing">
            <div className="cohort-section-header">
              <div className="flex-start gap-3">
                <TrendingUp className="w-8 h-8 text-white" />
                <div>
                  <h2 className="cohort-section-title">
                    Year-over-Year Delta Analysis
                  </h2>
                  <p className="text-white text-sm mt-1 opacity-90">
                    Comparing {cohortFilters.selectedYears[0]} to {cohortFilters.selectedYears[cohortFilters.selectedYears.length - 1]}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="delta-table">
                <thead className="delta-table-header">
                  <tr>
                    <th className="delta-table-header-cell text-left">Metric</th>
                    {deltaMetrics.map((delta: any) => (
                      <th key={delta.cohort} className="delta-table-header-cell">
                        <div className="flex-center gap-2">
                          <div className="cohort-indicator"></div>
                          <span>{COHORT_NAMES[delta.cohort as 1 | 2 | 3]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="delta-table-body">
                  <tr className="delta-table-row">
                    <td className="delta-table-metric-cell">Accounts Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="delta-table-value-cell">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${delta.accountsDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {delta.accountsDelta >= 0 ? '+' : ''}{delta.accountsDelta}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({delta.accountsDeltaPct >= 0 ? '+' : ''}{delta.accountsDeltaPct.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="delta-table-row">
                    <td className="delta-table-metric-cell">Win Rate Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="delta-table-value-cell">
                        <span className={`font-semibold ${delta.winRateDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta.winRateDelta >= 0 ? '+' : ''}{delta.winRateDelta.toFixed(1)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="delta-table-row">
                    <td className="delta-table-metric-cell">Avg Deal Size Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="delta-table-value-cell">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${delta.avgDealSizeDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {delta.avgDealSizeDelta >= 0 ? '+' : ''}${Math.abs(delta.avgDealSizeDelta).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({delta.avgDealSizePct >= 0 ? '+' : ''}{delta.avgDealSizePct.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="delta-table-row">
                    <td className="delta-table-metric-cell">Sales Cycle Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="delta-table-value-cell">
                        <span className={`font-semibold ${delta.salesCycleDelta <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta.salesCycleDelta >= 0 ? '+' : ''}{delta.salesCycleDelta} days
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="delta-table-row">
                    <td className="delta-table-metric-cell">Revenue Δ</td>
                    {deltaMetrics.map((delta: any) => (
                      <td key={delta.cohort} className="delta-table-value-cell">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold text-lg ${delta.revenueDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {delta.revenueDelta >= 0 ? '+' : ''}${Math.abs(delta.revenueDelta).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({delta.revenueDeltaPct >= 0 ? '+' : ''}{delta.revenueDeltaPct.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="p-6 bg-white border-t border-slate-200">
              <p className="text-sm text-slate-600 italic">
                <strong>Note:</strong> Positive deltas in Accounts, Win Rate, Avg Deal Size, and Revenue indicate growth. 
                Negative delta in Sales Cycle indicates improvement (faster deals).
              </p>
            </div>
          </div>
        )}

        {cohortFilters.selectedYears.length === 0 && (
          <div className="card-padded text-center">
            <div className="text-slate-400 mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Years Selected</h3>
            <p className="page-subtitle">Select years from the filters above to view cohort analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
