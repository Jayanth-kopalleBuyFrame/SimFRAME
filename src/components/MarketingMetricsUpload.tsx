import { useRef, useState } from 'react';
import { Upload, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
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
      <div className={`grid grid-cols-4 gap-4 py-3 border-b border-slate-200 hover:bg-slate-50 ${isChild ? 'pl-8' : ''}`}>
        <div className="font-medium text-slate-800">{label}</div>
        <div className="text-center text-slate-700">
          {isPercentage ? formatPercentage(me) : formatNumber(me)}
        </div>
        <div className="text-center text-slate-700">
          {isPercentage ? formatPercentage(nme) : formatNumber(nme)}
        </div>
        <div className={`text-center font-semibold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-slate-600'}`}>
          {calculateDelta(me, nme, isPercentage)}
        </div>
      </div>
    );
  };

  const ExpandableSection = ({ title, isExpanded, onToggle, children }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
  }) => (
    <>
      <div 
        className="grid grid-cols-4 gap-4 py-3 border-b-2 border-slate-300 bg-slate-100 hover:bg-slate-200 cursor-pointer"
        onClick={onToggle}
      >
        <div className="font-bold text-slate-900 flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {title}
        </div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {isExpanded && children}
    </>
  );

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
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-blue-50">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Marketing Engagement Analysis</h2>
              <p className="text-sm text-slate-600">File: {marketingMetrics.fileName}</p>
            </div>

            <div className="overflow-x-auto">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 py-4 px-6 bg-slate-50 border-b-2 border-slate-300">
                <div className="font-bold text-slate-900">Metric</div>
                <div className="font-bold text-slate-900 text-center">Marketing-Engaged</div>
                <div className="font-bold text-slate-900 text-center">Non-Marketing Engaged</div>
                <div className="font-bold text-slate-900 text-center">Delta</div>
              </div>

              <div className="px-6">
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
                >
                  <MetricRow 
                    label="Overall Win Rate" 
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
              </div>
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

