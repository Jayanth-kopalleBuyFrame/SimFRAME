// This is Jayanth's change
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { recalculateSimulation } from '../utils/cohortCalculations';

// This is Jayanth's change
export interface Action {
  id: string;
  name: string;
  weight: number;
  events: number;
  currentScore: number;
  proposedScore: number;
  completeScore: number;
}

export interface Simulation {
  id: string;
  name: string;
  actions: Action[];
  createdAt: Date;
  lastModified: Date;
  // This is Jayanth's change - Manual simulation opportunity data
  opportunityStatus?: string;
  revenueType?: string;
  daysBetweenCreatedAndGoLive?: number;
  numberOfOpportunities?: number;
}

// This is Jayanth's change - Individual opportunity data
export interface Opportunity {
  opportunityStatus: string;
  revenueType: string;
  daysBetweenCreatedAndGoLive: number;
  numberOfOpportunities: number;
}

export interface AccountSimulation {
  simulationId: string;
  simulationName: string;
  actions: Action[];
  accountScore: number;
  majorContributor?: {
    actionName: string;
    contribution: number;
  };
  // This is Jayanth's change - Array of opportunities for this account
  opportunities: Opportunity[];
  // This is Jayanth's change - Total opportunities count (account-level field)
  totalOpportunities?: number;
}

export interface Account {
  id: string;
  name: string;
  simulations: AccountSimulation[];
  createdAt: Date;
  lastModified: Date;
}

export interface CohortData {
  cohortNumber: 1 | 2 | 3;
  accounts: number;
  year: string;
  previousYear?: {
    cohort: 1 | 2 | 3;
    accounts: number;
  };
}

// This is Jayanth's change
// This is Jayanth's change
export interface Upload {
  id: string;
  fileName: string;
  uploadedAt: Date;
  accountIds: string[];
}

// This is Jayanth's change
export interface CommittedCohortData {
  year: string;
  cohort1Count: number;
  cohort2Count: number;
  cohort3Count: number;
  committedAt: Date;
  cohort1Simulations?: AccountSimulation[];
  cohort2Simulations?: AccountSimulation[];
  cohort3Simulations?: AccountSimulation[];
}

// Combined simulation list item for dropdown
export interface CombinedSimulationItem {
  id: string;
  displayName: string;
  type: 'manual' | 'account';
  accountName?: string;
  accountId?: string;
  simulationId?: string; // For account simulations
}

// This is Jayanth's change
interface SimulatorState {
  // Current active simulation
  activeSimulationId: string | null;
  
  // All simulations
  simulations: Map<string, Simulation>;
  
  // Accounts
  accounts: Map<string, Account>;
  activeAccountId: string | null;
  
  // Uploads tracking
  uploads: Map<string, Upload>;
  activeUploadId: string | null;
  
  // Committed cohort data for FY 25-26
  committedCohortData: CommittedCohortData | null;
  
  // Current tab
  activeTab: 'dashboard' | 'simulator' | 'cohort-analysis';
  
  // Cohort analysis filters
  cohortFilters: {
    numberOfYears: number;
    selectedYears: string[];
  };
  
  // Simulation Actions
  setActiveTab: (tab: 'dashboard' | 'simulator' | 'cohort-analysis') => void;
  createSimulation: (name: string) => string;
  setActiveSimulation: (id: string) => void;
  updateSimulation: (id: string, updates: Partial<Simulation>) => void;
  deleteSimulation: (id: string) => void;
  addAction: (simulationId: string, action: Omit<Action, 'id'>) => void;
  updateAction: (simulationId: string, actionId: string, updates: Partial<Action>) => void;
  deleteAction: (simulationId: string, actionId: string) => void;
  setCohortFilters: (filters: Partial<SimulatorState['cohortFilters']>) => void;
  
  // Account Actions
  setActiveAccount: (id: string | null) => void;
  createAccount: (name: string) => string;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addSimulationToAccount: (accountId: string, simulation: AccountSimulation) => void;
  updateAccountSimulationAction: (accountId: string, simulationId: string, actionId: string, updates: Partial<Action>) => void;
  bulkCreateAccounts: (accounts: Omit<Account, 'id' | 'createdAt' | 'lastModified'>[], fileName: string) => string;
  commitAccountsToCohorts: () => CommittedCohortData;
  
  // Upload Actions
  setActiveUpload: (id: string | null) => void;
  deleteUpload: (id: string) => void;
  
  // Combined simulation list getter
  getAllSimulations: () => CombinedSimulationItem[];
}

// Default marketing actions
const DEFAULT_ACTIONS: Omit<Action, 'id'>[] = [
  { name: 'Email Opens', weight: 20, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
  { name: 'Outbound Response', weight: 15, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
  { name: 'Page Views', weight: 10, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
  { name: 'Content Downloads', weight: 15, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
  { name: 'Webinar Attendance', weight: 20, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
  { name: 'Demo Requests', weight: 20, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
];

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, get) => ({
  activeSimulationId: null,
  simulations: new Map(),
  accounts: new Map(),
  activeAccountId: null,
  uploads: new Map(),
  activeUploadId: null,
  committedCohortData: null,
  activeTab: 'dashboard',
  cohortFilters: {
    numberOfYears: 2,
    selectedYears: ['FY 24-25', 'FY 25-26'],
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  createSimulation: (name) => {
    const id = `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const actions: Action[] = DEFAULT_ACTIONS.map((action, index) => ({
      ...action,
      id: `action-${index}-${Date.now()}`,
    }));

    const newSimulation: Simulation = {
      id,
      name,
      actions,
      createdAt: new Date(),
      lastModified: new Date(),
    };

    set((state) => {
      const newSimulations = new Map(state.simulations);
      newSimulations.set(id, newSimulation);
      return {
        simulations: newSimulations,
        activeSimulationId: id,
      };
    });

    return id;
  },

  setActiveSimulation: (id) => set({ activeSimulationId: id }),

  updateSimulation: (id, updates) => {
    set((state) => {
      const newSimulations = new Map(state.simulations);
      const simulation = newSimulations.get(id);
      if (simulation) {
        newSimulations.set(id, {
          ...simulation,
          ...updates,
          lastModified: new Date(),
        });
      }
      return { simulations: newSimulations };
    });
  },

  deleteSimulation: (id) => {
    set((state) => {
      const newSimulations = new Map(state.simulations);
      newSimulations.delete(id);
      return {
        simulations: newSimulations,
        activeSimulationId: state.activeSimulationId === id ? null : state.activeSimulationId,
      };
    });
  },

  addAction: (simulationId, action) => {
    const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAction: Action = { ...action, id: actionId };

    set((state) => {
      const newSimulations = new Map(state.simulations);
      const simulation = newSimulations.get(simulationId);
      if (simulation) {
        newSimulations.set(simulationId, {
          ...simulation,
          actions: [...simulation.actions, newAction],
          lastModified: new Date(),
        });
      }
      return { simulations: newSimulations };
    });
  },

  updateAction: (simulationId, actionId, updates) => {
    set((state) => {
      const newSimulations = new Map(state.simulations);
      const simulation = newSimulations.get(simulationId);
      if (simulation) {
        const updatedActions = simulation.actions.map((action) =>
          action.id === actionId ? { ...action, ...updates } : action
        );
        newSimulations.set(simulationId, {
          ...simulation,
          actions: updatedActions,
          lastModified: new Date(),
        });
      }
      return { simulations: newSimulations };
    });
  },

  deleteAction: (simulationId, actionId) => {
    set((state) => {
      const newSimulations = new Map(state.simulations);
      const simulation = newSimulations.get(simulationId);
      if (simulation) {
        newSimulations.set(simulationId, {
          ...simulation,
          actions: simulation.actions.filter((action) => action.id !== actionId),
          lastModified: new Date(),
        });
      }
      return { simulations: newSimulations };
    });
  },

  setCohortFilters: (filters) => {
    set((state) => ({
      cohortFilters: { ...state.cohortFilters, ...filters },
    }));
  },

  // Account Management Functions
  setActiveAccount: (id) => set({ activeAccountId: id }),

  createAccount: (name) => {
    const id = `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAccount: Account = {
      id,
      name,
      simulations: [],
      createdAt: new Date(),
      lastModified: new Date(),
    };

    set((state) => {
      const newAccounts = new Map(state.accounts);
      newAccounts.set(id, newAccount);
      return {
        accounts: newAccounts,
        activeAccountId: id,
      };
    });

    return id;
  },

  updateAccount: (id, updates) => {
    set((state) => {
      const newAccounts = new Map(state.accounts);
      const account = newAccounts.get(id);
      if (account) {
        newAccounts.set(id, {
          ...account,
          ...updates,
          lastModified: new Date(),
        });
      }
      return { accounts: newAccounts };
    });
  },

  deleteAccount: (id) => {
    set((state) => {
      const newAccounts = new Map(state.accounts);
      newAccounts.delete(id);
      return {
        accounts: newAccounts,
        activeAccountId: state.activeAccountId === id ? null : state.activeAccountId,
      };
    });
  },

  addSimulationToAccount: (accountId, simulation) => {
    set((state) => {
      const newAccounts = new Map(state.accounts);
      const account = newAccounts.get(accountId);
      if (account) {
        newAccounts.set(accountId, {
          ...account,
          simulations: [...account.simulations, simulation],
          lastModified: new Date(),
        });
      }
      return { accounts: newAccounts };
    });
  },

  updateAccountSimulationAction: (accountId, simulationId, actionId, updates) => {
    set((state) => {
      const newAccounts = new Map(state.accounts);
      const account = newAccounts.get(accountId);
      
      if (!account) return { accounts: newAccounts };

      // Find the simulation
      const simulationIndex = account.simulations.findIndex(sim => sim.simulationId === simulationId);
      if (simulationIndex === -1) return { accounts: newAccounts };

      const simulation = account.simulations[simulationIndex];
      
      // Update the specific action
      const updatedActions = simulation.actions.map(action =>
        action.id === actionId ? { ...action, ...updates } : action
      );

      // Recalculate all derived fields
      const recalculated = recalculateSimulation(updatedActions);
      
      // Update the simulation with recalculated values
      const updatedSimulations = [...account.simulations];
      updatedSimulations[simulationIndex] = {
        ...simulation,
        actions: recalculated.actions,
        accountScore: recalculated.accountScore,
        majorContributor: recalculated.majorContributor || undefined,
      };

      // Update the account
      newAccounts.set(accountId, {
        ...account,
        simulations: updatedSimulations,
        lastModified: new Date(),
      });

      return { accounts: newAccounts };
    });
  },

  // This is Jayanth's change
  bulkCreateAccounts: (accountsData, fileName) => {
    let uploadId = '';
    set((state) => {
      const newAccounts = new Map(state.accounts);
      const newUploads = new Map(state.uploads);
      const accountIds: string[] = [];
      
      // Check if fileName already exists and suffix it
      let finalFileName = fileName;
      let counter = 1;
      const existingFileNames = Array.from(state.uploads.values()).map(u => u.fileName);
      while (existingFileNames.includes(finalFileName)) {
        finalFileName = `${fileName} (${counter})`;
        counter++;
      }
      
      // Create accounts
      accountsData.forEach((accountData) => {
        const id = `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newAccount: Account = {
          id,
          ...accountData,
          createdAt: new Date(),
          lastModified: new Date(),
        };
        newAccounts.set(id, newAccount);
        accountIds.push(id);
      });

      // Create upload session
      uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newUpload: Upload = {
        id: uploadId,
        fileName: finalFileName,
        uploadedAt: new Date(),
        accountIds,
      };
      newUploads.set(uploadId, newUpload);

      return { 
        accounts: newAccounts,
        uploads: newUploads,
        activeUploadId: uploadId,
      };
    });
    
    return uploadId;
  },

  setActiveUpload: (id) => set({ activeUploadId: id }),

  deleteUpload: (id) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      const upload = newUploads.get(id);
      
      if (upload) {
        // Delete all accounts associated with this upload
        const newAccounts = new Map(state.accounts);
        upload.accountIds.forEach(accountId => {
          newAccounts.delete(accountId);
        });
        
        newUploads.delete(id);
        
        return {
          uploads: newUploads,
          accounts: newAccounts,
          activeUploadId: state.activeUploadId === id ? null : state.activeUploadId,
        };
      }
      
      return {};
    });
  },

  // This is Jayanth's change
  commitAccountsToCohorts: () => {
    const state = get();
    const cohortCounts = {
      cohort1: 0,
      cohort2: 0,
      cohort3: 0,
    };

    // Store simulations by cohort for metric calculation
    const cohort1Simulations: AccountSimulation[] = [];
    const cohort2Simulations: AccountSimulation[] = [];
    const cohort3Simulations: AccountSimulation[] = [];

    // Get accounts from active upload only
    const activeUpload = state.activeUploadId ? state.uploads.get(state.activeUploadId) : null;
    const activeUploadAccountIds = activeUpload?.accountIds || [];

    // Count accounts from active upload only (each simulation counts as one)
    Array.from(state.accounts.values()).forEach((account) => {
      // Skip if not in active upload
      if (activeUploadAccountIds.length > 0 && !activeUploadAccountIds.includes(account.id)) {
        return;
      }
      
      account.simulations.forEach((sim) => {
        const score = sim.accountScore;
        
        // Classify into cohorts based on engagement levels
        // Cohort 1 = High Engagement: 3000+
        // Cohort 2 = Low Engagement: 0-1000
        // Cohort 3 = Medium Engagement: 1001-3000
        if (score >= 0 && score <= 1000) {
          cohortCounts.cohort2++;
          cohort2Simulations.push(sim);
        } else if (score >= 1001 && score <= 3000) {
          cohortCounts.cohort3++;
          cohort3Simulations.push(sim);
        } else if (score > 3000) {
          cohortCounts.cohort1++;
          cohort1Simulations.push(sim);
        } else {
          cohortCounts.cohort2++; // Default invalid scores to cohort 2 (Low Engagement)
          cohort2Simulations.push(sim);
        }
      });
    });

    // ALSO count manual simulations - each manual simulation is treated as one account
    Array.from(state.simulations.values()).forEach((simulation) => {
      // Recalculate the account score for this manual simulation
      const recalculated = recalculateSimulation(simulation.actions);
      const score = recalculated.accountScore;
      
      // This is Jayanth's change
      // Create an AccountSimulation-like object for manual simulations
      const manualSim: AccountSimulation = {
        simulationId: simulation.id,
        simulationName: simulation.name,
        actions: simulation.actions,
        accountScore: recalculated.accountScore,
        majorContributor: recalculated.majorContributor || undefined,
        // Manual simulations don't have opportunities
        opportunities: [],
        totalOpportunities: undefined,
      };
      
      // Classify into cohorts based on engagement levels
      // Cohort 1 = High Engagement: 3000+
      // Cohort 2 = Low Engagement: 0-1000
      // Cohort 3 = Medium Engagement: 1001-3000
      if (score >= 0 && score <= 1000) {
        cohortCounts.cohort2++;
        cohort2Simulations.push(manualSim);
      } else if (score >= 1001 && score <= 3000) {
        cohortCounts.cohort3++;
        cohort3Simulations.push(manualSim);
      } else if (score > 3000) {
        cohortCounts.cohort1++;
        cohort1Simulations.push(manualSim);
      } else {
        cohortCounts.cohort2++; // Default invalid scores to cohort 2 (Low Engagement)
        cohort2Simulations.push(manualSim);
      }
    });

    const committedData: CommittedCohortData = {
      year: 'FY 25-26',
      cohort1Count: cohortCounts.cohort1,
      cohort2Count: cohortCounts.cohort2,
      cohort3Count: cohortCounts.cohort3,
      committedAt: new Date(),
      cohort1Simulations,
      cohort2Simulations,
      cohort3Simulations,
    };

    set({ committedCohortData: committedData });
    
    return committedData;
  },

  // Get all simulations (manual + account) for dropdown
  getAllSimulations: () => {
    const state = get();
    const combined: CombinedSimulationItem[] = [];

    // Add manual simulations
    Array.from(state.simulations.values()).forEach((sim) => {
      combined.push({
        id: `manual-${sim.id}`,
        displayName: `[Manual] ${sim.name}`,
        type: 'manual',
      });
    });

    // Add account simulations
    Array.from(state.accounts.values()).forEach((account) => {
      account.simulations.forEach((sim) => {
        combined.push({
          id: `account-${account.id}-${sim.simulationId}`,
          displayName: `${sim.simulationName}`,
          type: 'account',
          accountName: account.name,
          accountId: account.id,
          simulationId: sim.simulationId,
        });
      });
    });

    return combined;
  },
    }),
    {
      name: 'simframe-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        simulations: Array.from(state.simulations.entries()),
        accounts: Array.from(state.accounts.entries()),
        uploads: Array.from(state.uploads.entries()),
        committedCohortData: state.committedCohortData,
        activeSimulationId: state.activeSimulationId,
        activeAccountId: state.activeAccountId,
        activeUploadId: state.activeUploadId,
        cohortFilters: state.cohortFilters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Maps
          state.simulations = new Map(state.simulations as any);
          state.accounts = new Map(state.accounts as any);
          state.uploads = new Map(state.uploads as any);
        }
      },
    }
  )
);

