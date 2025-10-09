// This is Jayanth's change
import { useMemo } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import DeltaGraph from './DeltaGraph';
import { Play, TrendingUp, BarChart3, Target } from 'lucide-react';
import {
  generateHardcodedCohortData,
  generateCohortMetricsFromAccounts,
} from '../utils/cohortCalculations';

export default function Dashboard() {
  const { committedCohortData, cohortFilters, setActiveTab } = useSimulatorStore();

  // Calculate delta metrics if we have committed data
  const deltaMetrics = useMemo(() => {
    if (!committedCohortData) return null;

    // Use the selected years from cohort filters, or default comparison
    const fromYear = cohortFilters.selectedYears[0] || 'FY 24-25';
    const toYear = 'FY 25-26'; // Committed data is always FY 25-26

    // Get hardcoded data for the "from" year
    const previousYearData = generateHardcodedCohortData(fromYear);
    
    // Get current year data from committed accounts
    const currentYearData = [
      generateCohortMetricsFromAccounts(1, committedCohortData.cohort1Count, committedCohortData.cohort1Actions || [], toYear),
      generateCohortMetricsFromAccounts(2, committedCohortData.cohort2Count, committedCohortData.cohort2Actions || [], toYear),
      generateCohortMetricsFromAccounts(3, committedCohortData.cohort3Count, committedCohortData.cohort3Actions || [], toYear),
    ];

    // Calculate deltas for each cohort
    return [1, 2, 3].map((cohortNum) => {
      const previous = previousYearData.find((c) => c.cohort === cohortNum);
      const current = currentYearData.find((c) => c.cohort === cohortNum);

      if (!previous || !current) return null;

      const accountsDelta = current.accounts - previous.accounts;
      const accountsDeltaPct = (accountsDelta / previous.accounts) * 100;

      const winRateDelta = current.winRate - previous.winRate;
      const avgDealSizeDelta = current.avgDealSize - previous.avgDealSize;
      const avgDealSizePct = (avgDealSizeDelta / previous.avgDealSize) * 100;

      const salesCycleDelta = current.salesCycle - previous.salesCycle;
      const revenueDelta =
        current.forecastedMarketingRevenueAttribution -
        previous.forecastedMarketingRevenueAttribution;
      const revenueDeltaPct =
        (revenueDelta / previous.forecastedMarketingRevenueAttribution) * 100;

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
    }).filter(Boolean) as any;
  }, [committedCohortData, cohortFilters.selectedYears]);

  const handleStartSimulation = () => {
    setActiveTab('simulator');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Welcome Section with Start Button */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Welcome to SimFRAME
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Simulate scenarios, calculate account scores, and analyze cohort performance
          </p>
          <button
            onClick={handleStartSimulation}
            className="dashboard-start-button flex-center gap-3 mx-auto"
          >
            <Play className="w-6 h-6" />
            Start Simulation
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid-3-cols mb-12">
          <div className="dashboard-info-card">
            <div className="dashboard-info-number">01</div>
            <h3 className="dashboard-info-title">Create Scenarios</h3>
            <p className="dashboard-info-text">
              Build multiple simulation scenarios with custom actions and weights
            </p>
          </div>

          <div className="dashboard-info-card">
            <div className="dashboard-info-number">02</div>
            <h3 className="dashboard-info-title">Calculate Scores</h3>
            <p className="dashboard-info-text">
              Analyze current and proposed scores for different marketing actions
            </p>
          </div>

          <div className="dashboard-info-card">
            <div className="dashboard-info-number">03</div>
            <h3 className="dashboard-info-title">Analyze Cohorts</h3>
            <p className="dashboard-info-text">
              View cohort analysis with revenue attribution and forecasts
            </p>
          </div>
        </div>

        {/* Delta Graph Section */}
        {deltaMetrics && deltaMetrics.length > 0 ? (
          <div className="w-full">
            <DeltaGraph
              deltaMetrics={deltaMetrics}
              fromYear={cohortFilters.selectedYears[0] || 'FY 24-25'}
              toYear="FY 25-26"
            />
          </div>
        ) : (
          <div className="card-padded text-center">
            <div className="flex-center gap-4 mb-6">
              <TrendingUp className="w-16 h-16 text-slate-300" />
              <BarChart3 className="w-16 h-16 text-slate-300" />
              <Target className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-600 mb-3">
              No Performance Data Yet
            </h3>
            <p className="page-subtitle mb-6 max-w-2xl mx-auto">
              Create simulations in the Simulating Workbench, commit them to cohorts, and return here to see year-over-year performance deltas and insights.
            </p>
            <button
              onClick={handleStartSimulation}
              className="dashboard-start-button mx-auto"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

