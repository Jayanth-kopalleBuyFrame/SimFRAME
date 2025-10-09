// This is Jayanth's change

// This is Jayanth's change
export interface CohortMetrics {
  cohort: 1 | 2 | 3;
  year: string;
  accounts: number;
  winRate: number;
  avgDealSize: number;
  salesCycle: number; // in days (now called Average Sales Pipeline)
  forecastedMarketingRevenueAttribution: number;
  forecastDelta: number;
}

export interface CohortFlowData {
  fromYear: string;
  toYear: string;
  fromCohort: 1 | 2 | 3;
  toCohort: 1 | 2 | 3;
  accounts: number;
  change: number; // positive or negative
}

/**
 * Calculate win rate for a cohort
 * Formula placeholder: (deals won / total deals) * 100
 */
export function calculateWinRate(
  cohort: 1 | 2 | 3,
  dealsWon: number,
  totalDeals: number
): number {
  if (totalDeals === 0) return 0;
  
  // Higher cohorts have better win rates (placeholder multiplier)
  const cohortMultiplier = cohort * 0.05;
  const baseWinRate = (dealsWon / totalDeals) * 100;
  
  return Math.min(100, baseWinRate * (1 + cohortMultiplier));
}

/**
 * Calculate average deal size for a cohort
 * Formula placeholder: total revenue / number of deals
 */
export function calculateAvgDealSize(
  cohort: 1 | 2 | 3,
  totalRevenue: number,
  numberOfDeals: number
): number {
  if (numberOfDeals === 0) return 0;
  
  // Higher cohorts tend to have larger deal sizes
  const cohortMultiplier = cohort * 1.2;
  const baseAvg = totalRevenue / numberOfDeals;
  
  return baseAvg * cohortMultiplier;
}

/**
 * Calculate sales cycle duration (time to go-live)
 * Formula placeholder: average days from opportunity to closed-won
 */
export function calculateSalesCycle(
  cohort: 1 | 2 | 3,
  totalDays: number,
  numberOfDeals: number
): number {
  if (numberOfDeals === 0) return 0;
  
  // Lower cohorts typically have longer sales cycles
  const cohortAdjustment = (4 - cohort) * 15; // days adjustment
  const baseAvg = totalDays / numberOfDeals;
  
  return baseAvg + cohortAdjustment;
}

/**
 * Calculate forecasted marketing revenue attribution
 * Formula placeholder: accounts * win_rate * avg_deal_size * marketing_influence_factor
 */
export function calculateForecastedRevenue(
  cohort: 1 | 2 | 3,
  accounts: number,
  winRate: number,
  avgDealSize: number
): number {
  // Marketing influence factor increases with cohort engagement
  const marketingInfluenceFactor = 0.3 + (cohort * 0.1);
  
  return accounts * (winRate / 100) * avgDealSize * marketingInfluenceFactor;
}

/**
 * Calculate forecast delta between current and proposed
 * Formula placeholder: (proposed_revenue - current_revenue) / current_revenue * 100
 */
export function calculateForecastDelta(
  currentRevenue: number,
  proposedRevenue: number
): number {
  if (currentRevenue === 0) {
    return proposedRevenue > 0 ? 100 : 0;
  }
  
  return ((proposedRevenue - currentRevenue) / currentRevenue) * 100;
}

/**
 * Generate sample cohort data for demonstration
 */
// This is Jayanth's change
export function generateSampleCohortData(year: string): CohortMetrics[] {
  const baseCohorts: CohortMetrics[] = [
    {
      cohort: 1,
      year,
      accounts: 25,
      winRate: 40,
      avgDealSize: 100000,
      salesCycle: 60,
      forecastedMarketingRevenueAttribution: 0,
      forecastDelta: 0,
    },
    {
      cohort: 2,
      year,
      accounts: 100,
      winRate: 15,
      avgDealSize: 50000,
      salesCycle: 120,
      forecastedMarketingRevenueAttribution: 0,
      forecastDelta: 0,
    },
    {
      cohort: 3,
      year,
      accounts: 50,
      winRate: 25,
      avgDealSize: 75000,
      salesCycle: 90,
      forecastedMarketingRevenueAttribution: 0,
      forecastDelta: 0,
    },
  ];

  // Calculate forecasted revenue for each cohort
  return baseCohorts.map((cohort) => ({
    ...cohort,
    forecastedMarketingRevenueAttribution: calculateForecastedRevenue(
      cohort.cohort,
      cohort.accounts,
      cohort.winRate,
      cohort.avgDealSize
    ),
  }));
}

/**
 * Generate cohort flow data (transitions between cohorts across years)
 */
export function generateCohortFlows(
  fromYear: string,
  toYear: string
): CohortFlowData[] {
  // Sample flows showing account movement between cohorts
  return [
    { fromYear, toYear, fromCohort: 1, toCohort: 1, accounts: 50, change: -50 },
    { fromYear, toYear, fromCohort: 1, toCohort: 2, accounts: 50, change: 50 },
    { fromYear, toYear, fromCohort: 2, toCohort: 2, accounts: 100, change: 50 },
    { fromYear, toYear, fromCohort: 2, toCohort: 3, accounts: 0, change: 0 },
    { fromYear, toYear, fromCohort: 3, toCohort: 3, accounts: 75, change: 50 },
  ];
}

// ============================================
// SIMULATION CALCULATIONS
// ============================================

/**
 * Calculate weight percentage for an action based on its proposed score
 * Formula: (Proposed Score / Total Proposed Scores) * 100
 */
export function calculateActionWeight(
  proposedScore: number,
  totalProposedScore: number
): number {
  if (totalProposedScore === 0) return 0;
  return (proposedScore / totalProposedScore) * 100;
}

/**
 * Calculate weights for all actions proportionally
 * Returns an array of weights that sum to 100%
 */
export function calculateActionWeights(proposedScores: number[]): number[] {
  const total = proposedScores.reduce((sum, score) => sum + score, 0);
  
  if (total === 0) {
    // If no proposed scores, distribute evenly
    return proposedScores.map(() => 0);
  }
  
  return proposedScores.map(score => calculateActionWeight(score, total));
}

/**
 * Calculate complete current score based on events and current score
 * Formula: Events * Current Score
 */
export function calculateCompleteCurrentScore(
  events: number,
  currentScore: number
): number {
  return events * currentScore;
}

/**
 * Calculate complete proposed score based on events and proposed score
 * Formula: Events * Proposed Score
 */
export function calculateCompleteScore(
  events: number,
  proposedScore: number
): number {
  return events * proposedScore;
}

/**
 * Generate a random current score between 1 and 10
 */
export function generateRandomCurrentScore(): number {
  return Math.floor(Math.random() * 10) + 1;
}

/**
 * Calculate Account Score for a simulation
 * Account Score = Sum of all Complete Scores for all actions
 * This is Jayanth's change
 */
export function calculateAccountScore(
  actions: Array<{ completeScore: number }>
): number {
  return actions.reduce((total, action) => {
    return total + action.completeScore;
  }, 0);
}

/**
 * Identify the major contributor (action with highest weighted contribution)
 * Returns the action name and its contribution to the total score
 */
export function findMajorContributor(
  actions: Array<{ 
    name: string; 
    weight: number; 
    completeScore: number 
  }>
): { actionName: string; contribution: number } | null {
  if (actions.length === 0) return null;

  let maxContribution = 0;
  let majorAction = actions[0];

  actions.forEach(action => {
    const contribution = (action.weight / 100) * action.completeScore;
    if (contribution > maxContribution) {
      maxContribution = contribution;
      majorAction = action;
    }
  });

  return {
    actionName: majorAction.name,
    contribution: maxContribution,
  };
}

// ============================================
// COHORT CLASSIFICATION & METRICS
// ============================================

// This is Jayanth's change
/**
 * Classify account into cohort based on Account Score
 * High Engagement (Cohort 1): 3000+
 * Low Engagement (Cohort 2): 0-1000
 * Medium Engagement (Cohort 3): 1001-3000
 */
export function classifyAccountIntoCohort(accountScore: number): 1 | 2 | 3 {
  if (accountScore > 3000) return 1; // High Engagement
  if (accountScore >= 0 && accountScore <= 1000) return 2; // Low Engagement
  if (accountScore >= 1001 && accountScore <= 3000) return 3; // Medium Engagement
  
  // Default to cohort 2 if negative or invalid (least profitable)
  return 2;
}

// This is Jayanth's change
/**
 * Calculate Win Rate for a cohort based on actual opportunity data
 * Formula: (Total Closed Live Opportunities) / (Total Closed Live + Total Closed Lost) * 100
 * 
 * @param simulations - All account simulations in the cohort
 * @returns Win rate as a percentage
 */
export function calculateCohortWinRate(
  simulations: Array<{
    opportunities: Array<{
      opportunityStatus: string;
    }>;
  }>
): number {
  let closedLiveCount = 0;
  let closedLostCount = 0;

  simulations.forEach(sim => {
    sim.opportunities.forEach(opp => {
      const status = opp.opportunityStatus?.toLowerCase() || '';
      
      if (status.includes('closed') && status.includes('live')) {
        closedLiveCount++;
      } else if (status.includes('closed') && status.includes('lost')) {
        closedLostCount++;
      }
    });
  });

  const total = closedLiveCount + closedLostCount;
  if (total === 0) return 0;
  
  return (closedLiveCount / total) * 100;
}

// This is Jayanth's change
/**
 * Calculate Average Deal Size for a cohort
 * Higher engagement cohorts typically close larger deals
 * Formula: Base deal size × cohort multiplier
 * 
 * Industry benchmarks (B2B SaaS):
 * - Enterprise deals (Cohort 1 - High Engagement): $100K-$150K
 * - Small deals (Cohort 2 - Low Engagement): $40K-$60K
 * - Medium deals (Cohort 3 - Medium Engagement): $70K-$90K
 */
export function calculateCohortAvgDealSize(cohort: 1 | 2 | 3, accountCount: number): number {
  const baseDealSizes = {
    1: 125000, // $125K average - High Engagement
    2: 50000,  // $50K average - Low Engagement
    3: 80000,  // $80K average - Medium Engagement
  };
  
  // Larger cohorts may have slightly lower average (mix of deal sizes)
  const volumeAdjustment = accountCount > 100 ? 0.95 : 1.0;
  
  return baseDealSizes[cohort] * volumeAdjustment;
}

// This is Jayanth's change
/**
 * Calculate Average Sales Pipeline (Average Days Between Created and Go Live)
 * Formula: Sum of all daysBetweenCreatedAndGoLive / Total number of opportunities
 * 
 * @param simulations - All account simulations in the cohort
 * @returns Average sales pipeline in days
 */
export function calculateAverageSalesPipeline(
  simulations: Array<{
    opportunities: Array<{
      daysBetweenCreatedAndGoLive: number;
    }>;
  }>
): number {
  let totalDays = 0;
  let count = 0;

  simulations.forEach(sim => {
    sim.opportunities.forEach(opp => {
      if (opp.daysBetweenCreatedAndGoLive !== undefined && opp.daysBetweenCreatedAndGoLive !== null) {
        totalDays += opp.daysBetweenCreatedAndGoLive;
        count++;
      }
    });
  });

  if (count === 0) return 0;
  
  return Math.round(totalDays / count);
}

// This is Jayanth's change
/**
 * Calculate Forecasted Marketing Revenue Attribution
 * Formula: Accounts × (Win Rate / 100) × Avg Deal Size × Marketing Attribution Factor
 * 
 * Marketing Attribution Factor:
 * - Cohort 1: 0.7 (70% - High Engagement, high marketing influence)
 * - Cohort 2: 0.3 (30% - Low Engagement, lower marketing influence)
 * - Cohort 3: 0.5 (50% - Medium Engagement, moderate marketing influence)
 */
export function calculateCohortMarketingRevenue(
  cohort: 1 | 2 | 3,
  accountCount: number,
  winRate: number,
  avgDealSize: number
): number {
  const marketingAttributionFactors = {
    1: 0.7, // 70% attribution - High Engagement
    2: 0.3, // 30% attribution - Low Engagement
    3: 0.5, // 50% attribution - Medium Engagement
  };
  
  return accountCount * (winRate / 100) * avgDealSize * marketingAttributionFactors[cohort];
}

// This is Jayanth's change
/**
 * Generate cohort metrics from committed account simulations
 * 
 * @param cohortNumber - The cohort number (1, 2, or 3)
 * @param accountCount - Number of accounts in the cohort
 * @param simulations - All account simulations in this cohort
 * @param year - Fiscal year
 * @returns Complete cohort metrics
 */
export function generateCohortMetricsFromAccounts(
  cohortNumber: 1 | 2 | 3,
  accountCount: number,
  simulations: Array<{
    opportunities: Array<{
      opportunityStatus: string;
      revenueType: string;
      daysBetweenCreatedAndGoLive: number;
    }>;
  }>,
  year: string = 'FY 25-26'
): CohortMetrics {
  // Calculate metrics from actual opportunity data
  const winRate = calculateCohortWinRate(simulations);
  const salesCycle = calculateAverageSalesPipeline(simulations);
  
  // Keep using calculated values for deal size (can be updated later with real data)
  const avgDealSize = calculateCohortAvgDealSize(cohortNumber, accountCount);
  
  // Calculate forecasted revenue using the new win rate
  const forecastedRevenue = calculateCohortMarketingRevenue(
    cohortNumber,
    accountCount,
    winRate,
    avgDealSize
  );
  
  return {
    cohort: cohortNumber,
    year,
    accounts: accountCount,
    winRate,
    avgDealSize,
    salesCycle,
    forecastedMarketingRevenueAttribution: forecastedRevenue,
    forecastDelta: 0, // Will be calculated when comparing with previous year
  };
}

/**
 * Generate hardcoded cohort data for historical/future years
 */
export function generateHardcodedCohortData(year: string): CohortMetrics[] {
  const yearData: Record<string, CohortMetrics[]> = {
    'FY 24-25': [
      {
        cohort: 1,
        year: 'FY 24-25',
        accounts: 30,
        winRate: 42,
        avgDealSize: 120000,
        salesCycle: 65,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
      {
        cohort: 2,
        year: 'FY 24-25',
        accounts: 120,
        winRate: 16,
        avgDealSize: 48000,
        salesCycle: 140,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
      {
        cohort: 3,
        year: 'FY 24-25',
        accounts: 60,
        winRate: 28,
        avgDealSize: 75000,
        salesCycle: 95,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
    ],
    'FY 26-27': [
      {
        cohort: 1,
        year: 'FY 26-27',
        accounts: 45,
        winRate: 48,
        avgDealSize: 135000,
        salesCycle: 55,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
      {
        cohort: 2,
        year: 'FY 26-27',
        accounts: 140,
        winRate: 18,
        avgDealSize: 52000,
        salesCycle: 130,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
      {
        cohort: 3,
        year: 'FY 26-27',
        accounts: 80,
        winRate: 32,
        avgDealSize: 85000,
        salesCycle: 85,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
    ],
    'FY 27-28': [
      {
        cohort: 1,
        year: 'FY 27-28',
        accounts: 55,
        winRate: 50,
        avgDealSize: 145000,
        salesCycle: 50,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
      {
        cohort: 2,
        year: 'FY 27-28',
        accounts: 160,
        winRate: 19,
        avgDealSize: 55000,
        salesCycle: 125,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
      {
        cohort: 3,
        year: 'FY 27-28',
        accounts: 95,
        winRate: 34,
        avgDealSize: 90000,
        salesCycle: 80,
        forecastedMarketingRevenueAttribution: 0,
        forecastDelta: 0,
      },
    ],
  };
  
  const data = yearData[year] || [];
  
  // Calculate forecasted revenue for each cohort
  return data.map((cohort) => ({
    ...cohort,
    forecastedMarketingRevenueAttribution: calculateCohortMarketingRevenue(
      cohort.cohort,
      cohort.accounts,
      cohort.winRate,
      cohort.avgDealSize
    ),
  }));
}

/**
 * Calculate delta metrics between two fiscal years
 */
export function calculateYearOverYearDeltas(
  currentYear: CohortMetrics[],
  previousYear: CohortMetrics[]
): CohortMetrics[] {
  return currentYear.map((current) => {
    const previous = previousYear.find((p) => p.cohort === current.cohort);
    
    if (!previous) return current;
    
    return {
      ...current,
      forecastDelta: calculateForecastDelta(
        previous.forecastedMarketingRevenueAttribution,
        current.forecastedMarketingRevenueAttribution
      ),
    };
  });
}

// ============================================
// ACCOUNT/SIMULATION UTILITY CALCULATIONS
// ============================================

// This is Jayanth's change
/**
 * Calculate total days between created and go live for a single simulation
 * @param opportunities - Array of opportunities
 * @returns Total days
 */
export function calculateSimulationTotalDays(
  opportunities: Array<{ daysBetweenCreatedAndGoLive: number }>
): number {
  return opportunities.reduce((sum, opp) => sum + opp.daysBetweenCreatedAndGoLive, 0);
}

// This is Jayanth's change
/**
 * Calculate sum of numberOfOpportunities for a single simulation
 * @param opportunities - Array of opportunities
 * @returns Sum of numberOfOpportunities
 */
export function calculateSimulationTotalNumberOfOpportunities(
  opportunities: Array<{ numberOfOpportunities: number }>
): number {
  return opportunities.reduce((sum, opp) => sum + opp.numberOfOpportunities, 0);
}

// This is Jayanth's change
/**
 * Calculate total days between created and go live for all simulations in an account
 * @param simulations - Array of account simulations
 * @returns Total days across all simulations
 */
export function calculateAccountTotalDays(
  simulations: Array<{
    opportunities: Array<{ daysBetweenCreatedAndGoLive: number }>;
  }>
): number {
  return simulations.reduce((total, sim) => 
    total + calculateSimulationTotalDays(sim.opportunities), 0
  );
}

// This is Jayanth's change
/**
 * Calculate total number of opportunities across all simulations in an account
 * @param simulations - Array of account simulations
 * @returns Total opportunity count
 */
export function calculateAccountTotalOpportunities(
  simulations: Array<{
    opportunities: Array<any>;
  }>
): number {
  return simulations.reduce((total, sim) => total + sim.opportunities.length, 0);
}

// This is Jayanth's change
/**
 * Calculate sum of numberOfOpportunities field across all simulations in an account
 * @param simulations - Array of account simulations
 * @returns Sum of numberOfOpportunities field
 */
export function calculateAccountTotalNumberOfOpportunitiesField(
  simulations: Array<{
    opportunities: Array<{ numberOfOpportunities: number }>;
  }>
): number {
  return simulations.reduce((total, sim) => 
    total + calculateSimulationTotalNumberOfOpportunities(sim.opportunities), 0
  );
}

// This is Jayanth's change
/**
 * Calculate total number of opportunities across multiple accounts
 * @param accounts - Array of accounts with simulations
 * @returns Total opportunity count across all accounts
 */
export function calculateMultipleAccountsTotalOpportunities(
  accounts: Array<{
    simulations: Array<{
      opportunities: Array<any>;
    }>;
  }>
): number {
  return accounts.reduce((sum, acc) => 
    sum + calculateAccountTotalOpportunities(acc.simulations), 0
  );
}

// This is Jayanth's change
/**
 * Calculate total number of simulations across multiple accounts
 * @param accounts - Array of accounts with simulations
 * @returns Total simulation count
 */
export function calculateTotalSimulations(
  accounts: Array<{
    simulations: Array<any>;
  }>
): number {
  return accounts.reduce((sum, a) => sum + a.simulations.length, 0);
}

// ============================================
// SIMULATION RECALCULATION UTILITY
// ============================================

/**
 * Recalculate all derived fields for a simulation
 * This is the single source of truth for recalculation logic
 * Used by both manual simulations and account simulations
 * 
 * @param actions - Array of actions with current values
 * @returns Updated actions with recalculated weights/completeScores, plus accountScore and majorContributor
 */
export function recalculateSimulation(
  actions: Array<{
    id: string;
    name: string;
    weight: number;
    events: number;
    currentScore: number;
    proposedScore: number;
    completeScore: number;
  }>
) {
  // Step 1: Recalculate complete scores for all actions
  const actionsWithCompleteScores = actions.map(action => ({
    ...action,
    completeScore: calculateCompleteScore(action.events, action.proposedScore),
  }));

  // Step 2: Recalculate weights based on proposed scores
  const proposedScores = actionsWithCompleteScores.map(a => a.proposedScore);
  const weights = calculateActionWeights(proposedScores);

  // Step 3: Apply weights to actions
  const updatedActions = actionsWithCompleteScores.map((action, index) => ({
    ...action,
    weight: weights[index] || 0,
  }));

  // Step 4: Calculate account score
  const accountScore = calculateAccountScore(updatedActions);

  // Step 5: Find major contributor
  const majorContributor = findMajorContributor(updatedActions);

  return {
    actions: updatedActions,
    accountScore,
    majorContributor,
  };
}

