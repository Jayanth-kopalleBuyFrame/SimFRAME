import { useRef, useState } from 'react';
import { Upload, TrendingUp, Eye, EyeOff, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSimulatorStore, type MarketingMetrics } from '../store/simulatorStore';
import CohortDataVisualization from './CohortDataVisualization';

// Transform marketing metrics into cohort format
interface CohortMetrics {
  cohort: 1 | 2 | 3; // Use 1=Marketing-Engaged, 2=Non-Marketing Engaged
  accounts: number;
  winRate: number;
  avgDealSize: number;
  salesCycle: number;
  forecastedMarketingRevenueAttribution: number;
  year: string;
  yearOverYearDelta?: {
    accountsDelta: number;
    winRateDelta: number;
    avgDealSizeDelta: number;
    salesCycleDelta: number;
    revenueDelta: number;
  };
}

export default function MarketingMetricsUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setMarketingMetrics, marketingMetrics } = useSimulatorStore();
  const [showCohortFlow, setShowCohortFlow] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Find the "Revenue Type" sheet
        const sheetName = workbook.SheetNames.find(s => 
          s.toLowerCase().includes('revenue type') || s.toLowerCase().includes('new')
        );
        
        if (!sheetName) {
          alert('Could not find "Revenue Type: New" sheet in the file.');
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });

        // Parse the metrics from rows (skipping header rows)
        const metrics: MarketingMetrics = {
          uploadedAt: new Date(),
          fileName,
          metrics: {
            numberOfAccounts: { marketingEngaged: Number(rawData[3]?.[1]) || 0, nonMarketingEngaged: Number(rawData[3]?.[2]) || 0 },
            numberOfOpportunities: { marketingEngaged: Number(rawData[4]?.[1]) || 0, nonMarketingEngaged: Number(rawData[4]?.[2]) || 0 },
            open: { marketingEngaged: Number(rawData[5]?.[1]) || 0, nonMarketingEngaged: Number(rawData[5]?.[2]) || 0 },
            closedWon: { marketingEngaged: Number(rawData[6]?.[1]) || 0, nonMarketingEngaged: Number(rawData[6]?.[2]) || 0 },
            closedLost: { marketingEngaged: Number(rawData[7]?.[1]) || 0, nonMarketingEngaged: Number(rawData[7]?.[2]) || 0 },
            winRate: { marketingEngaged: Number(rawData[8]?.[1]) || 0, nonMarketingEngaged: Number(rawData[8]?.[2]) || 0 },
            newBusiness: { marketingEngaged: Number(rawData[9]?.[1]) || 0, nonMarketingEngaged: Number(rawData[9]?.[2]) || 0 },
            newBusinessClosedWon: { marketingEngaged: Number(rawData[10]?.[1]) || 0, nonMarketingEngaged: Number(rawData[10]?.[2]) || 0 },
            newBusinessClosedLost: { marketingEngaged: Number(rawData[11]?.[1]) || 0, nonMarketingEngaged: Number(rawData[11]?.[2]) || 0 },
            channelSales: { marketingEngaged: Number(rawData[12]?.[1]) || 0, nonMarketingEngaged: Number(rawData[12]?.[2]) || 0 },
            channelClosedWon: { marketingEngaged: Number(rawData[13]?.[1]) || 0, nonMarketingEngaged: Number(rawData[13]?.[2]) || 0 },
            channelClosedLost: { marketingEngaged: Number(rawData[14]?.[1]) || 0, nonMarketingEngaged: Number(rawData[14]?.[2]) || 0 },
            network: { marketingEngaged: Number(rawData[15]?.[1]) || 0, nonMarketingEngaged: Number(rawData[15]?.[2]) || 0 },
            networkClosedWon: { marketingEngaged: Number(rawData[16]?.[1]) || 0, nonMarketingEngaged: Number(rawData[16]?.[2]) || 0 },
            networkClosedLost: { marketingEngaged: Number(rawData[17]?.[1]) || 0, nonMarketingEngaged: Number(rawData[17]?.[2]) || 0 },
            pipelineVelocityQualification: { marketingEngaged: Number(rawData[19]?.[1]) || 0, nonMarketingEngaged: Number(rawData[19]?.[2]) || 0 },
            pipelineVelocityCommercialDiscussions: { marketingEngaged: Number(rawData[20]?.[1]) || 0, nonMarketingEngaged: Number(rawData[20]?.[2]) || 0 },
            pipelineVelocityOnboardingInitiated: { marketingEngaged: Number(rawData[21]?.[1]) || 0, nonMarketingEngaged: Number(rawData[21]?.[2]) || 0 },
            pipelineVelocityContractSigned: { marketingEngaged: Number(rawData[22]?.[1]) || 0, nonMarketingEngaged: Number(rawData[22]?.[2]) || 0 },
            pipelineVelocityClosedLive: { marketingEngaged: Number(rawData[23]?.[1]) || 0, nonMarketingEngaged: Number(rawData[23]?.[2]) || 0 },
          },
        };

        setMarketingMetrics(metrics);
        alert(`Successfully loaded marketing metrics from "${fileName}"!`);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing file. Please ensure it matches the expected format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Transform marketing metrics into cohort format for visualization
  const transformToCohortMetrics = (): CohortMetrics[][] => {
    if (!marketingMetrics) return [];

    const m = marketingMetrics.metrics;
    const year = 'FY 24-25';
    
    // Estimate avg deal size from opportunities and closed won
    const avgDealSizeMarketing = m.closedWon.marketingEngaged > 0 
      ? (m.closedWon.marketingEngaged * 125000) / m.closedWon.marketingEngaged 
      : 125000;
    const avgDealSizeNonMarketing = m.closedWon.nonMarketingEngaged > 0
      ? (m.closedWon.nonMarketingEngaged * 125000) / m.closedWon.nonMarketingEngaged
      : 125000;

    const cohortData: CohortMetrics[] = [
      {
        cohort: 1, // Marketing-Engaged
        accounts: m.numberOfAccounts.marketingEngaged,
        winRate: m.winRate.marketingEngaged * 100,
        avgDealSize: avgDealSizeMarketing,
        salesCycle: m.pipelineVelocityClosedLive.marketingEngaged,
        forecastedMarketingRevenueAttribution: m.closedWon.marketingEngaged * avgDealSizeMarketing,
        year,
      },
      {
        cohort: 2, // Non-Marketing Engaged  
        accounts: m.numberOfAccounts.nonMarketingEngaged,
        winRate: m.winRate.nonMarketingEngaged * 100,
        avgDealSize: avgDealSizeNonMarketing,
        salesCycle: m.pipelineVelocityClosedLive.nonMarketingEngaged,
        forecastedMarketingRevenueAttribution: m.closedWon.nonMarketingEngaged * avgDealSizeNonMarketing,
        year,
      },
    ];

    return [cohortData];
  };

  const cohortDataByYear = transformToCohortMetrics();
  const cohortDataWithDeltas = cohortDataByYear; // No year-over-year for single year

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return Math.round(value).toLocaleString();
  };

  return (
    <div>
      {/* Upload Section */}
      <div className="notification-info section-spacing hover-shadow">
        <div className="flex-between">
          <div>
            <h3 className="notification-title text-lg mb-1">Upload Marketing Metrics</h3>
            <p className="notification-text">
              Upload the "Revenue Type: New" sheet to analyze Marketing-Engaged vs Non-Marketing Engaged cohorts
            </p>
          </div>
          <button
            onClick={handleUploadClick}
            className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Upload className="w-5 h-5" />
            Upload Metrics
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Display Metrics */}
      {marketingMetrics && cohortDataByYear.length > 0 && (
        <>
          {/* Cohort Flow Visualization & Data Visualization - Toggle Buttons */}
          <div className="section-spacing flex justify-end gap-4 mb-4">
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

            <button
              onClick={() => setShowVisualization(true)}
              className="flex-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <BarChart3 className="w-5 h-5" />
              Data Visualization
            </button>
          </div>

          {/* Cohort Flow Visualization */}
          {showCohortFlow && (
            <div className="card shadow-md overflow-hidden section-spacing">
              <div className="cohort-section-header">
                <h2 className="cohort-section-title">Marketing Engagement Cohort Flow</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <div className="flex gap-16 min-w-max pb-4 justify-center">
                    {cohortDataByYear.map((yearData, yearIndex) => (
                      <div key={yearIndex} className="flex flex-col items-center gap-8">
                        <div className="cohort-flow-year-label">FY 24-25</div>
                        
                        {yearData.map((cohort) => (
                          <div key={cohort.cohort} className="relative flex flex-col items-center gap-3">
                            {/* Circle */}
                            <div className="cohort-circle">
                              <div className="cohort-circle-label">#Accounts</div>
                              <div className="cohort-circle-count">{cohort.accounts}</div>
                              <div className="cohort-circle-subtitle">
                                {cohort.cohort === 1 ? 'Marketing-Engaged' : 'Non-Marketing Engaged'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Table */}
          {cohortDataWithDeltas.map((yearData, yearIndex) => (
            <div key={yearIndex} className="card shadow-md overflow-hidden section-spacing">
              <div className="cohort-section-header">
                <div className="flex-between">
                  <h2 className="cohort-section-title">
                    FY 24-25 - Marketing Engagement Metrics
                  </h2>
                  <span className="cohort-section-badge">
                    ✓ Uploaded Data
                  </span>
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
                            <span>{cohort.cohort === 1 ? 'Marketing-Engaged' : 'Non-Marketing Engaged'}</span>
                          </div>
                        </th>
                      ))}
                      <th className="cohort-table-header-cell-center">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="cohort-table-body">
                    <tr className="cohort-table-row">
                      <td className="cohort-table-cell-bold">Accounts</td>
                      {yearData.map((cohort) => (
                        <td key={cohort.cohort} className="cohort-table-cell-center">{cohort.accounts}</td>
                      ))}
                      <td className="cohort-table-cell-center">
                        <div className="cohort-delta cohort-delta-neutral">
                          {yearData[0].accounts - yearData[1].accounts}
                        </div>
                      </td>
                    </tr>
                    <tr className="cohort-table-row">
                      <td className="cohort-table-cell-bold">Win Rate</td>
                      {yearData.map((cohort) => (
                        <td key={cohort.cohort} className="cohort-table-cell-center">{cohort.winRate.toFixed(1)}%</td>
                      ))}
                      <td className="cohort-table-cell-center">
                        <div className={`cohort-delta ${yearData[0].winRate - yearData[1].winRate > 0 ? 'cohort-delta-positive' : 'cohort-delta-negative'}`}>
                          <TrendingUp className={`w-3 h-3 ${yearData[0].winRate - yearData[1].winRate < 0 ? 'rotate-180' : ''}`} />
                          {(yearData[0].winRate - yearData[1].winRate).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                    <tr className="cohort-table-row">
                      <td className="cohort-table-cell-bold">Avg Deal Size</td>
                      {yearData.map((cohort) => (
                        <td key={cohort.cohort} className="cohort-table-cell-center">
                          {formatCurrency(cohort.avgDealSize)}
                        </td>
                      ))}
                      <td className="cohort-table-cell-center">
                        <div className={`cohort-delta ${yearData[0].avgDealSize - yearData[1].avgDealSize > 0 ? 'cohort-delta-positive' : 'cohort-delta-negative'}`}>
                          <TrendingUp className={`w-3 h-3 ${yearData[0].avgDealSize - yearData[1].avgDealSize < 0 ? 'rotate-180' : ''}`} />
                          {formatCurrency(Math.abs(yearData[0].avgDealSize - yearData[1].avgDealSize))}
                        </div>
                      </td>
                    </tr>
                    <tr className="cohort-table-row">
                      <td className="cohort-table-cell-bold">Sales Cycle (days)</td>
                      {yearData.map((cohort) => (
                        <td key={cohort.cohort} className="cohort-table-cell-center">{formatNumber(cohort.salesCycle)}</td>
                      ))}
                      <td className="cohort-table-cell-center">
                        <div className={`cohort-delta ${yearData[0].salesCycle - yearData[1].salesCycle < 0 ? 'cohort-delta-positive' : 'cohort-delta-negative'}`}>
                          <TrendingUp className={`w-3 h-3 ${yearData[0].salesCycle - yearData[1].salesCycle > 0 ? 'rotate-180' : ''}`} />
                          {formatNumber(Math.abs(yearData[0].salesCycle - yearData[1].salesCycle))}
                        </div>
                      </td>
                    </tr>
                    <tr className="cohort-table-row">
                      <td className="cohort-table-cell-bold">Forecasted Marketing Revenue Attribution</td>
                      {yearData.map((cohort) => (
                        <td key={cohort.cohort} className="cohort-table-cell-center">
                          {formatCurrency(cohort.forecastedMarketingRevenueAttribution)}
                        </td>
                      ))}
                      <td className="cohort-table-cell-center">
                        <div className={`cohort-delta ${yearData[0].forecastedMarketingRevenueAttribution - yearData[1].forecastedMarketingRevenueAttribution > 0 ? 'cohort-delta-positive' : 'cohort-delta-negative'}`}>
                          <TrendingUp className={`w-3 h-3 ${yearData[0].forecastedMarketingRevenueAttribution - yearData[1].forecastedMarketingRevenueAttribution < 0 ? 'rotate-180' : ''}`} />
                          {formatCurrency(Math.abs(yearData[0].forecastedMarketingRevenueAttribution - yearData[1].forecastedMarketingRevenueAttribution))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Data Visualization Modal */}
          <CohortDataVisualization
            isOpen={showVisualization}
            onClose={() => setShowVisualization(false)}
            cohortDataByYear={cohortDataByYear as any}
            deltaMetrics={null}
            selectedYears={['FY 24-25']}
          />
        </>
      )}
    </div>
  );
}

