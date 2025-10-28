import { useRef, useState } from 'react';
import { Upload, ChevronDown, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';
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
  const [showVisualization, setShowVisualization] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
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

  const formatNumber = (value: number) => {
    return Math.round(value).toLocaleString();
  };

  const formatPercentage = (value: number) => {
    // Value is already a decimal (e.g., 0.0996 for 9.96%)
    return `${(value * 100).toFixed(2)}%`;
  };

  const calculateDelta = (me: number, nme: number, isPercentage: boolean = false) => {
    const delta = me - nme;
    if (isPercentage) {
      return `${(delta * 100).toFixed(2)} pp`; // percentage points
    }
    return delta > 0 ? `+${formatNumber(delta)}` : formatNumber(delta);
  };

  const MetricRow = ({ label, me, nme, isChild = false, isPercentage = false, lowerIsBetter = false }: { 
    label: string; 
    me: number; 
    nme: number; 
    isChild?: boolean; 
    isPercentage?: boolean;
    lowerIsBetter?: boolean;
  }) => {
    const delta = me - nme;
    const isPositive = lowerIsBetter ? delta < 0 : delta > 0;
    const isNegative = lowerIsBetter ? delta > 0 : delta < 0;
    
    return (
      <tr className={`cohort-table-row ${isChild ? 'bg-slate-50' : ''}`}>
        <td className={`cohort-table-cell-bold ${isChild ? 'pl-12' : ''}`}>{label}</td>
        <td className="cohort-table-cell-center">
          {isPercentage ? formatPercentage(me) : formatNumber(me)}
        </td>
        <td className="cohort-table-cell-center">
          {isPercentage ? formatPercentage(nme) : formatNumber(nme)}
        </td>
        <td className="cohort-table-cell-center">
          <div className={`cohort-delta ${isPositive ? 'cohort-delta-positive' : isNegative ? 'cohort-delta-negative' : 'cohort-delta-neutral'}`}>
            {isPositive || isNegative ? (
              <TrendingUp className={`w-3 h-3 ${isNegative ? 'rotate-180' : ''}`} />
            ) : null}
            {calculateDelta(me, nme, isPercentage)}
          </div>
        </td>
      </tr>
    );
  };

  const ExpandableSection = ({ 
    title, 
    isExpanded, 
    onToggle, 
    me, 
    nme, 
    isPercentage = false,
    lowerIsBetter = false,
    children 
  }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void;
    me?: number;
    nme?: number;
    isPercentage?: boolean;
    lowerIsBetter?: boolean;
    children: React.ReactNode;
  }) => {
    const delta = me !== undefined && nme !== undefined ? me - nme : 0;
    const isPositive = lowerIsBetter ? delta < 0 : delta > 0;
    const isNegative = lowerIsBetter ? delta > 0 : delta < 0;
    
    return (
      <>
        <tr className="cohort-table-row cursor-pointer" onClick={onToggle}>
          <td className="cohort-table-cell-bold">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span>{title}</span>
            </div>
          </td>
          {me !== undefined && nme !== undefined ? (
            <>
              <td className="cohort-table-cell-center">
                {isPercentage ? formatPercentage(me) : formatNumber(me)}
              </td>
              <td className="cohort-table-cell-center">
                {isPercentage ? formatPercentage(nme) : formatNumber(nme)}
              </td>
              <td className="cohort-table-cell-center">
                <div className={`cohort-delta ${isPositive ? 'cohort-delta-positive' : isNegative ? 'cohort-delta-negative' : 'cohort-delta-neutral'}`}>
                  {isPositive || isNegative ? (
                    <TrendingUp className={`w-3 h-3 ${isNegative ? 'rotate-180' : ''}`} />
                  ) : null}
                  {calculateDelta(me, nme, isPercentage)}
                </div>
              </td>
            </>
          ) : (
            <>
              <td className="cohort-table-cell-center"></td>
              <td className="cohort-table-cell-center"></td>
              <td className="cohort-table-cell-center"></td>
            </>
          )}
        </tr>
        {isExpanded && children}
      </>
    );
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
      {marketingMetrics && (
        <>
          {/* Data Visualization Button */}
          <div className="section-spacing flex justify-end gap-4 mb-4">
            <button
              onClick={() => setShowVisualization(true)}
              className="flex-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <BarChart3 className="w-5 h-5" />
              Data Visualization
            </button>
          </div>

          {/* Hierarchical Metrics Table */}
          <div className="card shadow-md overflow-hidden section-spacing">
            <div className="cohort-section-header">
              <div className="flex-between">
                <h2 className="cohort-section-title">Marketing Engagement Metrics</h2>
                <span className="cohort-section-badge">✓ Uploaded Data</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">File: {marketingMetrics.fileName}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="cohort-table">
                <thead className="cohort-table-header">
                  <tr>
                    <th className="cohort-table-header-cell">Metric</th>
                    <th className="cohort-table-header-cell-center">
                      <div className="flex-center gap-2">
                        <div className="cohort-indicator"></div>
                        <span>Marketing-Engaged</span>
                      </div>
                    </th>
                    <th className="cohort-table-header-cell-center">
                      <div className="flex-center gap-2">
                        <div className="cohort-indicator"></div>
                        <span>Non-Marketing Engaged</span>
                      </div>
                    </th>
                    <th className="cohort-table-header-cell-center">Delta</th>
                  </tr>
                </thead>
                <tbody className="cohort-table-body">
                  {/* Number of Accounts */}
                  <MetricRow 
                    label="Number of Accounts" 
                    me={marketingMetrics.metrics.numberOfAccounts.marketingEngaged} 
                    nme={marketingMetrics.metrics.numberOfAccounts.nonMarketingEngaged} 
                  />
                  
                  {/* Number of Opportunities - Expandable */}
                  <ExpandableSection 
                    title="Number of Opportunities" 
                    isExpanded={expandedSections.has('opportunities')} 
                    onToggle={() => toggleSection('opportunities')}
                    // me={marketingMetrics.metrics.numberOfOpportunities.marketingEngaged}
                    // nme={marketingMetrics.metrics.numberOfOpportunities.nonMarketingEngaged}
                  >
                    <MetricRow 
                      label="Total Opportunities" 
                      me={marketingMetrics.metrics.numberOfOpportunities.marketingEngaged} 
                      nme={marketingMetrics.metrics.numberOfOpportunities.nonMarketingEngaged} 
                      isChild 
                    />
                    <MetricRow 
                      label="Open" 
                      me={marketingMetrics.metrics.open.marketingEngaged} 
                      nme={marketingMetrics.metrics.open.nonMarketingEngaged} 
                      isChild 
                    />
                    <MetricRow 
                      label="Closed Won" 
                      me={marketingMetrics.metrics.closedWon.marketingEngaged} 
                      nme={marketingMetrics.metrics.closedWon.nonMarketingEngaged} 
                      isChild 
                    />
                    <MetricRow 
                      label="Closed Lost" 
                      me={marketingMetrics.metrics.closedLost.marketingEngaged} 
                      nme={marketingMetrics.metrics.closedLost.nonMarketingEngaged} 
                      isChild 
                    />
                  </ExpandableSection>

                  {/* Win Rate - Expandable */}
                  <ExpandableSection 
                    title="Win Rate" 
                    isExpanded={expandedSections.has('winrate')} 
                    onToggle={() => toggleSection('winrate')}
                    // me={marketingMetrics.metrics.winRate.marketingEngaged}
                    // nme={marketingMetrics.metrics.winRate.nonMarketingEngaged}
                    isPercentage
                  >
                    <MetricRow 
                      label="Win Rate" 
                      me={marketingMetrics.metrics.winRate.marketingEngaged} 
                      nme={marketingMetrics.metrics.winRate.nonMarketingEngaged} 
                      isChild 
                      isPercentage
                    />
                    
                    {/* New Business Sub-section */}
                    <MetricRow 
                      label="New Business Win Rate" 
                      me={marketingMetrics.metrics.newBusiness.marketingEngaged} 
                      nme={marketingMetrics.metrics.newBusiness.nonMarketingEngaged} 
                      isChild 
                      isPercentage
                    />
                    <MetricRow 
                      label="New Business: Closed Won" 
                      me={marketingMetrics.metrics.newBusinessClosedWon.marketingEngaged} 
                      nme={marketingMetrics.metrics.newBusinessClosedWon.nonMarketingEngaged} 
                      isChild 
                    />
                    <MetricRow 
                      label="New Business: Closed Lost" 
                      me={marketingMetrics.metrics.newBusinessClosedLost.marketingEngaged} 
                      nme={marketingMetrics.metrics.newBusinessClosedLost.nonMarketingEngaged} 
                      isChild 
                    />
                    
                    {/* Channel Sales Sub-section */}
                    <MetricRow 
                      label="Channel Sales Win Rate" 
                      me={marketingMetrics.metrics.channelSales.marketingEngaged} 
                      nme={marketingMetrics.metrics.channelSales.nonMarketingEngaged} 
                      isChild 
                      isPercentage
                    />
                    <MetricRow 
                      label="Channel: Closed Won" 
                      me={marketingMetrics.metrics.channelClosedWon.marketingEngaged} 
                      nme={marketingMetrics.metrics.channelClosedWon.nonMarketingEngaged} 
                      isChild 
                    />
                    <MetricRow 
                      label="Channel: Closed Lost" 
                      me={marketingMetrics.metrics.channelClosedLost.marketingEngaged} 
                      nme={marketingMetrics.metrics.channelClosedLost.nonMarketingEngaged} 
                      isChild 
                    />
                    
                    {/* Network Sub-section */}
                    <MetricRow 
                      label="Network Win Rate" 
                      me={marketingMetrics.metrics.network.marketingEngaged} 
                      nme={marketingMetrics.metrics.network.nonMarketingEngaged} 
                      isChild 
                      isPercentage
                    />
                    <MetricRow 
                      label="Network: Closed Won" 
                      me={marketingMetrics.metrics.networkClosedWon.marketingEngaged} 
                      nme={marketingMetrics.metrics.networkClosedWon.nonMarketingEngaged} 
                      isChild 
                    />
                    <MetricRow 
                      label="Network: Closed Lost" 
                      me={marketingMetrics.metrics.networkClosedLost.marketingEngaged} 
                      nme={marketingMetrics.metrics.networkClosedLost.nonMarketingEngaged} 
                      isChild 
                    />
                  </ExpandableSection>

                  {/* Pipeline Velocity - Expandable */}
                  <ExpandableSection 
                    title="Average Pipeline Velocity (days)" 
                    isExpanded={expandedSections.has('velocity')} 
                    onToggle={() => toggleSection('velocity')}
                    // me={marketingMetrics.metrics.pipelineVelocityClosedLive.marketingEngaged}
                    // nme={marketingMetrics.metrics.pipelineVelocityClosedLive.nonMarketingEngaged}
                    lowerIsBetter
                  >
                    <MetricRow 
                      label="1. Qualification" 
                      me={marketingMetrics.metrics.pipelineVelocityQualification.marketingEngaged} 
                      nme={marketingMetrics.metrics.pipelineVelocityQualification.nonMarketingEngaged} 
                      isChild 
                      lowerIsBetter
                    />
                    <MetricRow 
                      label="2. Commercial Discussions" 
                      me={marketingMetrics.metrics.pipelineVelocityCommercialDiscussions.marketingEngaged} 
                      nme={marketingMetrics.metrics.pipelineVelocityCommercialDiscussions.nonMarketingEngaged} 
                      isChild 
                      lowerIsBetter
                    />
                    <MetricRow 
                      label="3. Onboarding Initiated" 
                      me={marketingMetrics.metrics.pipelineVelocityOnboardingInitiated.marketingEngaged} 
                      nme={marketingMetrics.metrics.pipelineVelocityOnboardingInitiated.nonMarketingEngaged} 
                      isChild 
                      lowerIsBetter
                    />
                    <MetricRow 
                      label="4. Contract Signed" 
                      me={marketingMetrics.metrics.pipelineVelocityContractSigned.marketingEngaged} 
                      nme={marketingMetrics.metrics.pipelineVelocityContractSigned.nonMarketingEngaged} 
                      isChild 
                      lowerIsBetter
                    />
                    <MetricRow 
                      label="Closed Live" 
                      me={marketingMetrics.metrics.pipelineVelocityClosedLive.marketingEngaged} 
                      nme={marketingMetrics.metrics.pipelineVelocityClosedLive.nonMarketingEngaged} 
                      isChild 
                      lowerIsBetter
                    />
                  </ExpandableSection>
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Visualization Modal */}
          <CohortDataVisualization
            isOpen={showVisualization}
            onClose={() => setShowVisualization(false)}
            cohortDataByYear={cohortDataByYear as any}
            deltaMetrics={null}
            selectedYears={['FY 24-25']}
            isMarketingMetrics={true}
          />
        </>
      )}
    </div>
  );
}

