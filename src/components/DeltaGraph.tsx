// This is Jayanth's change
import { TrendingUp, DollarSign, Clock, Target, Users } from 'lucide-react';

// This is Jayanth's change
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

interface DeltaGraphProps {
  deltaMetrics: DeltaMetric[] | null;
  fromYear: string;
  toYear: string;
}

// Single color for all cohorts - dark navy blue
const COHORT_COLOR = '#003D6B';

export default function DeltaGraph({ deltaMetrics, fromYear, toYear }: DeltaGraphProps) {
  if (!deltaMetrics || deltaMetrics.length === 0) {
    return (
      <div className="card-padded text-center">
        <div className="text-slate-400 mb-4">
          <TrendingUp className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-slate-600 mb-2">No Delta Data Available</h3>
        <p className="page-subtitle">
          Commit accounts in the Simulating Workbench and select multiple years in Cohort Analysis to see trends
        </p>
      </div>
    );
  }

  // Find max values for scaling
  const maxRevenue = Math.max(...deltaMetrics.map(d => Math.abs(d.revenueDelta)));

  return (
    <div className="card shadow-md overflow-hidden">
      <div className="cohort-section-header">
        <div className="flex-start gap-3">
          <TrendingUp className="w-8 h-8 text-white" />
          <div>
            <h2 className="cohort-section-title">Performance Delta Overview</h2>
            <p className="text-white text-sm mt-1 opacity-90">
              Year-over-Year comparison: <span className="font-semibold">{fromYear}</span> → <span className="font-semibold">{toYear}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="p-8">

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {deltaMetrics.map((delta) => {
          return (
            <div
              key={delta.cohort}
              className="card hover-shadow transition-shadow border-l-4 p-4"
              style={{ borderColor: COHORT_COLOR }}
            >
              <div className="flex-start gap-2 mb-2">
                <div className="cohort-indicator rounded-full" />
                <span className="font-semibold text-slate-700">
                  {delta.cohort === 1 ? 'High Engagement' : delta.cohort === 2 ? 'Low Engagement' : 'Medium Engagement'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex-start gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span
                    className={`text-lg font-bold ${
                      delta.revenueDelta >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {delta.revenueDelta >= 0 ? '+' : ''}
                    ${(delta.revenueDelta / 1000).toFixed(0)}K
                  </span>
                </div>
                
                <div className="flex-start gap-2 text-xs text-slate-600">
                  <Users className="w-3 h-3" />
                  <span>
                    {delta.accountsDelta >= 0 ? '+' : ''}
                    {delta.accountsDelta} accounts
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Delta Bar Chart */}
      <div className="card-padded mb-6">
        <h3 className="card-title flex-start gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Forecasted Revenue Delta by Cohort
        </h3>
        
        <div className="space-y-4">
          {deltaMetrics.map((delta) => {
            const percentage = maxRevenue > 0 ? (Math.abs(delta.revenueDelta) / maxRevenue) * 100 : 0;
            const isPositive = delta.revenueDelta >= 0;
            
            return (
              <div key={delta.cohort} className="flex-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700">
                  {delta.cohort === 1 ? 'High Engagement' : delta.cohort === 2 ? 'Low Engagement' : 'Medium Engagement'}
                </div>
                
                <div className="flex-1 relative">
                  <div className="relative h-10 bg-slate-100 rounded-lg overflow-visible">
                     <div
                       className="absolute top-0 left-0 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                       style={{
                         width: `${percentage}%`,
                         backgroundColor: COHORT_COLOR,
                         opacity: 0.8,
                       }}
                     >
                      <span className="text-white font-semibold text-sm whitespace-nowrap">
                        {isPositive ? '+' : ''}${(delta.revenueDelta / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-24 text-right">
                  <span
                    className={`font-bold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {delta.revenueDeltaPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Metrics Grid */}
      <div className="grid-3-cols">
        {/* Accounts Growth */}
        <div className="card-padded">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex-start gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Accounts Growth
          </h4>
          {deltaMetrics.map((delta) => (
            <div key={delta.cohort} className="flex-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-600">
                {delta.cohort === 1 ? 'High Engagement' : delta.cohort === 2 ? 'Low Engagement' : 'Medium Engagement'}
              </span>
              <span
                className={`font-semibold ${
                  delta.accountsDelta >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {delta.accountsDelta >= 0 ? '+' : ''}
                {delta.accountsDelta}
              </span>
            </div>
          ))}
        </div>

        {/* Win Rate Change */}
        <div className="card-padded">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex-start gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            Win Rate Change
          </h4>
          {deltaMetrics.map((delta) => (
            <div key={delta.cohort} className="flex-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-600">
                {delta.cohort === 1 ? 'High Engagement' : delta.cohort === 2 ? 'Low Engagement' : 'Medium Engagement'}
              </span>
              <span
                className={`font-semibold ${
                  delta.winRateDelta >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {delta.winRateDelta >= 0 ? '+' : ''}
                {delta.winRateDelta.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

        {/* Avg Sales Pipeline Change */}
        <div className="card-padded">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex-start gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Avg Pipeline Change
          </h4>
          {deltaMetrics.map((delta) => (
            <div key={delta.cohort} className="flex-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-600">
                {delta.cohort === 1 ? 'High Engagement' : delta.cohort === 2 ? 'Low Engagement' : 'Medium Engagement'}
              </span>
              <span
                className={`font-semibold ${
                  delta.salesCycleDelta <= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {delta.salesCycleDelta >= 0 ? '+' : ''}
                {delta.salesCycleDelta} days
              </span>
            </div>
          ))}
        </div>
      </div>

      </div>
      
      {/* Summary */}
      <div className="mt-6 mx-8 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-slate-700">
          <strong className="text-primary-600">Summary:</strong>{' '}
          {deltaMetrics.reduce((sum, d) => sum + d.revenueDelta, 0) >= 0 ? (
            <>
              Overall forecasted revenue increased by{' '}
              <span className="font-bold text-green-600">
                +${(deltaMetrics.reduce((sum, d) => sum + d.revenueDelta, 0) / 1000).toFixed(0)}K
              </span>{' '}
              with{' '}
              <span className="font-bold">
                {deltaMetrics.reduce((sum, d) => sum + d.accountsDelta, 0)} net new accounts
              </span>
              .
            </>
          ) : (
            <>
              Overall forecasted revenue decreased by{' '}
              <span className="font-bold text-red-600">
                ${Math.abs(deltaMetrics.reduce((sum, d) => sum + d.revenueDelta, 0) / 1000).toFixed(0)}K
              </span>
              .
            </>
          )}
        </p>
      </div>
    </div>
  );
}

