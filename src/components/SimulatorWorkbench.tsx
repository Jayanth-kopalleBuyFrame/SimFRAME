// This is Jayanth's change
import { useState, useCallback } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { Plus, Trash2, Save, ChevronDown, TrendingUp } from 'lucide-react';
import { 
  calculateCompleteScore,
  calculateCompleteCurrentScore,
  generateRandomCurrentScore,
} from '../utils/cohortCalculations';
import AccountBulkImport from './AccountBulkImport';

// This is Jayanth's change
export default function SimulatorWorkbench() {
  const {
    simulations,
    activeSimulationId,
    createSimulation,
    setActiveSimulation,
    updateSimulation,
    updateAction,
    addAction,
    deleteAction,
    deleteSimulation,
    accounts,
    activeAccountId,
    setActiveAccount,
    updateAccountSimulationAction,
    commitAccountsToCohorts,
    setActiveTab,
    getAllSimulations,
    uploads,
    activeUploadId,
    setActiveUpload,
    deleteUpload,
  } = useSimulatorStore();

  const [newSimulationName, setNewSimulationName] = useState('');
  const [showNewSimulation, setShowNewSimulation] = useState(false);
  const [selectedAccountSimulationIndex, setSelectedAccountSimulationIndex] = useState<number>(0);
  const [selectedCombinedSimId, setSelectedCombinedSimId] = useState<string>('');

  const activeSimulation = activeSimulationId
    ? simulations.get(activeSimulationId)
    : null;

  const activeAccount = activeAccountId
    ? accounts.get(activeAccountId)
    : null;

  // Filter accounts by active upload
  const filteredAccounts = Array.from(accounts.values()).filter(account => {
    if (!activeUploadId) return false;
    const upload = uploads.get(activeUploadId);
    return upload?.accountIds.includes(account.id);
  });

  // Get combined simulation list (filtered by active upload)
  const combinedSimulations = getAllSimulations().filter(item => {
    if (item.type === 'manual') return true; // Always show manual simulations
    if (item.type === 'account' && item.accountId) {
      // Only show account simulations from active upload
      const account = accounts.get(item.accountId);
      if (!account || !activeUploadId) return false;
      const upload = uploads.get(activeUploadId);
      return upload?.accountIds.includes(account.id);
    }
    return false;
  });

  // Get the selected simulation from account if account is active
  const displayedSimulation = activeAccount && activeAccount.simulations.length > 0
    ? activeAccount.simulations[selectedAccountSimulationIndex]
    : null;
  
  // Handle selection from combined dropdown
  const handleCombinedSimulationSelect = (combinedId: string) => {
    setSelectedCombinedSimId(combinedId);
    
    if (!combinedId) {
      // Clear selection
      setActiveSimulation('');
      setActiveAccount(null);
      return;
    }

    const item = combinedSimulations.find(s => s.id === combinedId);
    if (!item) return;

    if (item.type === 'manual') {
      // Extract actual simulation ID from "manual-{id}"
      const simId = combinedId.replace('manual-', '');
      setActiveSimulation(simId);
      setActiveAccount(null);
    } else if (item.type === 'account' && item.accountId && item.simulationId) {
      // Set account and find simulation index
      setActiveAccount(item.accountId);
      const account = accounts.get(item.accountId);
      if (account) {
        const simIndex = account.simulations.findIndex(s => s.simulationId === item.simulationId);
        if (simIndex !== -1) {
          setSelectedAccountSimulationIndex(simIndex);
        }
      }
      // Clear manual simulation selection
      setActiveSimulation('');
    }
  };

  const handleCreateSimulation = () => {
    if (newSimulationName.trim()) {
      const newSimId = createSimulation(newSimulationName.trim());
      
      // If there are uploaded accounts, populate the new simulation with an example from the first account
      if (filteredAccounts.length > 0) {
        const firstAccount = filteredAccounts[0];
        if (firstAccount.simulations.length > 0) {
          const exampleActions = firstAccount.simulations[0].actions.map(action => ({
            ...action,
            id: `action-${Math.random().toString(36).substr(2, 9)}`, // Generate new IDs
            events: 0, // Reset events to 0 for the new simulation
          }));
          
          // Update the new simulation with example actions
          updateSimulation(newSimId, { actions: exampleActions });
        }
      }
      
      setNewSimulationName('');
      setShowNewSimulation(false);
    }
  };

  const handleAddAction = () => {
    if (activeSimulationId) {
      addAction(activeSimulationId, {
        name: 'New Action',
        weight: 0,
        events: 0,
        currentScore: generateRandomCurrentScore(),
        proposedScore: 0,
        completeScore: 0,
      });
    }
  };

  // Handle events input change with automatic complete score calculation
  const handleEventsChange = useCallback((actionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (activeSimulationId && activeSimulation) {
      const action = activeSimulation.actions.find(a => a.id === actionId);
      if (action) {
        const newCompleteScore = calculateCompleteScore(numValue, action.proposedScore);
        updateAction(activeSimulationId, actionId, { 
          events: numValue,
          completeScore: newCompleteScore
        });
      }
    }
  }, [activeSimulationId, activeSimulation, updateAction]);

  // Handle proposed score change with automatic complete score calculation
  const handleProposedScoreChange = useCallback((actionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (activeSimulationId && activeSimulation) {
      const action = activeSimulation.actions.find(a => a.id === actionId);
      if (action) {
        const newCompleteScore = calculateCompleteScore(action.events, numValue);
        updateAction(activeSimulationId, actionId, { 
          proposedScore: numValue,
          completeScore: newCompleteScore
        });
      }
    }
  }, [activeSimulationId, activeSimulation, updateAction]);

  // Handle events change for ACCOUNT simulations
  const handleAccountEventsChange = useCallback((actionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (activeAccountId && displayedSimulation) {
      updateAccountSimulationAction(activeAccountId, displayedSimulation.simulationId, actionId, {
        events: numValue,
      });
    }
  }, [activeAccountId, displayedSimulation, updateAccountSimulationAction]);

  // Handle proposed score change for ACCOUNT simulations
  const handleAccountProposedScoreChange = useCallback((actionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (activeAccountId && displayedSimulation) {
      updateAccountSimulationAction(activeAccountId, displayedSimulation.simulationId, actionId, {
        proposedScore: numValue,
      });
    }
  }, [activeAccountId, displayedSimulation, updateAccountSimulationAction]);

  const handleDeleteSimulation = () => {
    if (activeSimulationId && confirm('Are you sure you want to delete this simulation?')) {
      deleteSimulation(activeSimulationId);
    }
  };

  // This is Jayanth's change
  // Handle commit accounts to cohorts
  const handleCommit = () => {
    const accountCount = filteredAccounts.length; // Only active upload accounts
    const manualSimCount = simulations.size;
    const totalCount = accountCount + manualSimCount;
    
    if (totalCount === 0) {
      alert('No accounts or simulations to commit. Please create simulations or import accounts first.');
      return;
    }

    // Count total simulations from active upload accounts only
    let accountSimulations = 0;
    filteredAccounts.forEach(account => {
      accountSimulations += account.simulations.length;
    });

    const confirmation = confirm(
      `Are you sure you want to commit to cohort analysis for FY 25-26?\n\n` +
      `${manualSimCount > 0 ? `• ${manualSimCount} manual simulation(s)\n` : ''}` +
      `${accountSimulations > 0 ? `• ${accountSimulations} imported account simulation(s) from "${uploads.get(activeUploadId || '')?.fileName || 'active upload'}"\n` : ''}` +
      `\nTotal: ${manualSimCount + accountSimulations} simulation(s) will be classified into cohorts.`
    );

    if (confirmation) {
      const result = commitAccountsToCohorts();
      alert(
        `Successfully committed to cohorts!\n\n` +
        `Low Engagement (0-1000): ${result.cohort2Count} simulations\n` +
        `Medium Engagement (1001-3000): ${result.cohort3Count} simulations\n` +
        `High Engagement (3000+): ${result.cohort1Count} simulations\n\n` +
        `View results in the Cohort Analysis tab.`
      );
      
      // Navigate to cohort analysis tab
      setActiveTab('cohort-analysis');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="tab-header-with-shadow mb-8">
          <h1 className="tab-header-title">Simulating Workbench</h1>
          <p className="tab-header-subtitle">Create and manage simulation scenarios</p>
        </div>

        {/* Account Bulk Import */}
        <AccountBulkImport />

        {/* Upload Tabs */}
        {uploads.size > 0 && (
          <div className="card section-spacing">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Uploaded Files</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(uploads.values()).map((upload) => (
                  <div
                    key={upload.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                      activeUploadId === upload.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                    onClick={() => setActiveUpload(upload.id)}
                  >
                    <span className="font-medium">{upload.fileName}</span>
                    <span className="text-xs opacity-70">
                      ({upload.accountIds.length} accounts)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete upload "${upload.fileName}" and all its accounts?`)) {
                          deleteUpload(upload.id);
                        }
                      }}
                      className="ml-2 p-1 hover:bg-red-100 rounded text-red-500"
                      title="Delete upload"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Score (for both account simulations and manual simulations) */}
        {((activeAccount && activeAccount.simulations.length > 0) || activeSimulation) && (
          <div className="card-padded section-spacing bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                <span className="text-2xl font-bold text-slate-800">
                  {activeAccount ? activeAccount.name : 'Account Score'}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 shadow-lg">
                  <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                    {activeAccount && (
                      <div className="text-xs font-medium text-slate-500 mb-1">Score</div>
                    )}
                    <div className={`${activeAccount ? 'text-3xl' : 'text-4xl'} font-bold text-primary-600`}>
                      {activeAccount 
                        ? (displayedSimulation?.accountScore.toFixed(0) || '0')
                        : (activeSimulation?.actions.reduce((sum, action) => sum + action.completeScore, 0).toFixed(0) || '0')
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Combined Simulation Selector */}
        <div className="card-padded section-spacing">
          <div className="flex-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Simulation (Manual + Account Simulations)
              </label>
              <div className="relative">
                <select
                  value={selectedCombinedSimId}
                  onChange={(e) => handleCombinedSimulationSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white pr-10"
                >
                  <option value="">Select a simulation...</option>
                  {combinedSimulations.length > 0 && (
                    <>
                      {/* Manual Simulations Section */}
                      {combinedSimulations.filter(s => s.type === 'manual').length > 0 && (
                        <optgroup label="Manual Simulations">
                          {combinedSimulations.filter(s => s.type === 'manual').map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.displayName}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {/* Account Simulations Grouped by Account */}
                      {(() => {
                        // Group account simulations by account name
                        const accountSimulations = combinedSimulations.filter(s => s.type === 'account');
                        const groupedByAccount = accountSimulations.reduce((acc, item) => {
                          const accountName = item.accountName || 'Unknown Account';
                          if (!acc[accountName]) {
                            acc[accountName] = [];
                          }
                          acc[accountName].push(item);
                          return acc;
                        }, {} as Record<string, typeof accountSimulations>);

                        return Object.entries(groupedByAccount).map(([accountName, sims]) => (
                          <optgroup key={accountName} label={accountName}>
                            {sims.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.displayName}
                              </option>
                            ))}
                          </optgroup>
                        ));
                      })()}
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNewSimulation(!showNewSimulation)}
                className="btn-primary flex-start gap-2"
              >
                <Plus className="w-5 h-5" />
                New Simulation
              </button>

              {activeSimulationId && (
                <button
                  onClick={handleDeleteSimulation}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex-start gap-2 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* New Simulation Form */}
          {showNewSimulation && (
            <div className="section-divider">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSimulationName}
                  onChange={(e) => setNewSimulationName(e.target.value)}
                  placeholder="Simulation name..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSimulation()}
                />
                <button
                  onClick={handleCreateSimulation}
                  className="btn-success px-6"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewSimulation(false);
                    setNewSimulationName('');
                  }}
                  className="btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions Table */}
        {(activeSimulation || displayedSimulation) && (
          <div className="card shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex-between">
              <div>
                <h2 className="card-title text-2xl">
                  {displayedSimulation 
                    ? `${displayedSimulation.simulationName}` 
                    : activeSimulation?.name}
                </h2>
              </div>
              <button
                onClick={handleCommit}
                disabled={filteredAccounts.length === 0 && simulations.size === 0}
                className={`${(filteredAccounts.length > 0 || simulations.size > 0) ? 'btn-primary' : 'bg-slate-400 cursor-not-allowed'} px-6 py-2 text-white rounded-lg transition-colors flex-start gap-2`}
                title={(filteredAccounts.length > 0 || simulations.size > 0) ? 'Commit accounts and simulations to cohort analysis' : 'Create simulations or import accounts first'}
              >
                <Save className="w-5 h-5" />
                Commit to Cohorts
              </button>
            </div>

            {/* This is Jayanth's change - Opportunity Data Inputs for Manual Simulations */}
            {/* Only show opportunity details if there are NO uploaded accounts (pure manual simulation) */}
            {activeSimulation && !displayedSimulation && filteredAccounts.length === 0 && (
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Opportunity Information</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Opportunity Status
                    </label>
                    <select
                      value={activeSimulation.opportunityStatus || ''}
                      onChange={(e) => updateSimulation(activeSimulationId!, { opportunityStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      <option value="Closed Live">Closed Live</option>
                      <option value="Closed Lost">Closed Lost</option>
                      <option value="Open Pipeline">Open Pipeline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Revenue Type
                    </label>
                    <select
                      value={activeSimulation.revenueType || ''}
                      onChange={(e) => updateSimulation(activeSimulationId!, { revenueType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="New">New</option>
                      <option value="Existing">Existing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Days Between Created and Go Live
                    </label>
                    <input
                      type="number"
                      value={activeSimulation.daysBetweenCreatedAndGoLive || ''}
                      onChange={(e) => updateSimulation(activeSimulationId!, { daysBetweenCreatedAndGoLive: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="1"
                      placeholder="Enter days"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Number of Opportunities
                    </label>
                    <input
                      type="number"
                      value={activeSimulation.numberOfOpportunities || ''}
                      onChange={(e) => updateSimulation(activeSimulationId!, { numberOfOpportunities: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="1"
                      placeholder="Enter count"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* This is Jayanth's change */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Events</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Proposed Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Complete Proposed Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(displayedSimulation || activeSimulation)!.actions.map((action) => {
                    const isReadOnly = !!displayedSimulation; // Read-only if viewing account simulation
                    return (
                      <tr key={action.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          {isReadOnly ? (
                            <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                              {action.name}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={action.name}
                              onChange={(e) =>
                                activeSimulationId && updateAction(activeSimulationId, action.id, { name: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={action.events}
                            onChange={(e) => 
                              displayedSimulation 
                                ? handleAccountEventsChange(action.id, e.target.value)
                                : handleEventsChange(action.id, e.target.value)
                            }
                            step="1"
                            min="0"
                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={action.proposedScore}
                            onChange={(e) => 
                              displayedSimulation 
                                ? handleAccountProposedScoreChange(action.id, e.target.value)
                                : handleProposedScoreChange(action.id, e.target.value)
                            }
                            step="1"
                            min="0"
                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-24 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium">
                            {action.completeScore.toFixed(0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {!isReadOnly && (
                            <button
                              onClick={() => activeSimulationId && deleteAction(activeSimulationId, action.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!displayedSimulation && (
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={handleAddAction}
                  className="btn-secondary flex-start gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Action
                </button>
              </div>
            )}
            {displayedSimulation && (
              <div className="p-6 border-t border-slate-200 bg-green-50">
                <p className="text-sm text-green-700 italic flex-start gap-2">
                  <span className="text-green-600">✓</span>
                  Viewing imported account simulation. Events and Proposed Scores are editable - changes will recalculate all derived fields automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* This is Jayanth's change - Account Details Section */}
        {/* {activeAccount && (
          <div className="card shadow-md overflow-hidden section-spacing">
            <div className="tab-header">
              <h2 className="text-2xl font-bold text-white">
                Account Details - {activeAccount.name}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Column Headers */}
              {/* <div className="grid grid-cols-4 gap-4 pb-4 border-b-2 border-slate-300">
                <div className="font-semibold text-slate-700">Opportunity Status</div>
                <div className="font-semibold text-slate-700">Revenue Type</div>
                <div className="font-semibold text-slate-700">Days Between Created and Go Live</div>
                <div className="font-semibold text-slate-700">Number of Opportunities</div>
              </div> */}

              {/* Simulations */}
              {/* {activeAccount.simulations.map((sim, simIndex) => (
                <div key={sim.simulationId} className="space-y-4">
                  <div className="flex items-center gap-2 text-primary-600 font-semibold text-lg">
                    <span>{sim.simulationName} details under this account</span>
                  </div> */}

                  {/* Opportunities for this simulation */}
                  {/* {sim.opportunities && sim.opportunities.length > 0 ? (
                    <div className="space-y-2 ml-4">
                      {sim.opportunities.map((opp, oppIndex) => (
                        <div key={oppIndex} className="grid grid-cols-4 gap-4 py-3 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                            {opp.opportunityStatus}
                          </div>
                          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                            {opp.revenueType}
                          </div>
                          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-center">
                            {opp.daysBetweenCreatedAndGoLive} days
                          </div>
                          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-center">
                            {opp.numberOfOpportunities}
                          </div>
                        </div>
                      ))} */}
                      
                      {/* This is Jayanth's change - Simulation Total */}
                      {/* <div className="grid grid-cols-4 gap-4 py-3 border-t-2 border-slate-300 mt-2">
                        <div className="col-span-2 px-3 py-2 font-bold text-slate-800">
                          Total for {sim.simulationName}
                        </div>
                        <div className="px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 text-center">
                          {calculateSimulationTotalDays(sim.opportunities)} days
                        </div>
                        <div className="px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 text-center">
                          {calculateSimulationTotalNumberOfOpportunities(sim.opportunities)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-4 text-sm text-slate-500 italic">No opportunities for this simulation</div>
                  )} */}

                  {/* Divider between simulations */}
                  {/* {simIndex < activeAccount.simulations.length - 1 && (
                    <div className="border-t border-slate-200 mt-6"></div>
                  )}
                </div>
              ))} */}

              {/* This is Jayanth's change - Grand Total Row */}
              {/* <div className="grid grid-cols-4 gap-4 py-4 border-t-4 border-slate-400 mt-6">
                <div className="col-span-2 px-3 py-2 font-bold text-slate-800 text-lg">
                  Grand Total for {activeAccount.name}
                </div>
                <div className="px-3 py-2 border-2 border-slate-400 rounded-lg font-bold text-slate-800 text-center text-lg">
                  {calculateAccountTotalDays(activeAccount.simulations)} days
                </div>
                <div className="px-3 py-2 border-2 border-slate-400 rounded-lg font-bold text-slate-800 text-center text-lg">
                  {calculateAccountTotalNumberOfOpportunitiesField(activeAccount.simulations)}
                </div>
              </div>
            </div>
          </div>
        )} */}

        {!activeSimulation && !displayedSimulation && (
          <div className="card-padded text-center">
            <div className="text-slate-400 mb-4">
              <Plus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Simulation Selected</h3>
            <p className="page-subtitle">Create a new simulation or select an account to view imported simulations</p>
          </div>
        )}
      </div>
    </div>
  );
}

