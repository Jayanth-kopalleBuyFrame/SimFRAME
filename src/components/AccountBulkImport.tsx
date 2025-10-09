// This is Jayanth's change
import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSimulatorStore, type Action, type AccountSimulation } from '../store/simulatorStore';
import { 
  calculateAccountScore, 
  findMajorContributor, 
  calculateActionWeights,
  calculateMultipleAccountsTotalOpportunities,
  calculateTotalSimulations
} from '../utils/cohortCalculations';

interface ExcelRow {
  'Account Name': string;
  'Simulation Name': string;
  [key: string]: string | number; // Dynamic action columns
}

export default function AccountBulkImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { simulations, bulkCreateAccounts } = useSimulatorStore();

  // Get all unique actions from existing simulations to build template
  const getTemplateActions = (): Action[] => {
    const simulationsArray = Array.from(simulations.values());
    if (simulationsArray.length === 0) {
      // Return default structure if no simulations exist
      return [
        { id: '1', name: 'Email Opens', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '2', name: 'Outbound Response', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '3', name: 'Page Views', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '4', name: 'Content Downloads', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '5', name: 'Webinar Attendance', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '6', name: 'Demo Requests', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
      ];
    }
    // Use actions from the first simulation as template
    return simulationsArray[0].actions;
  };

  const handleDownloadTemplate = () => {
    const templateActions = getTemplateActions();
    
    // This is Jayanth's change
    // Build header row - account-specific fields moved outside action columns
    const headers = ['Account Name', 'Simulation Name'];
    templateActions.forEach(action => {
      headers.push(`${action.name} - Events`);
      headers.push(`${action.name} - Proposed Score`);
    });
    // This is Jayanth's change  
    // Add account-specific columns at the end (each row = one opportunity)
    headers.push('Opportunity Status');
    headers.push('Revenue Type');
    headers.push('Days Between Created and Go Live');
    headers.push('Total Opportunities');
    headers.push('Number of Opportunities');

    // This is Jayanth's change
    // Create sample rows - each row represents ONE opportunity for an account
    const sampleData = [
      {
        'Account Name': 'Example Account 1',
        'Simulation Name': 'Q1 Strategy',
        ...templateActions.reduce((acc, action) => {
          acc[`${action.name} - Events`] = 10;
          acc[`${action.name} - Proposed Score`] = 5;
          return acc;
        }, {} as Record<string, number | string>),
        'Opportunity Status': 'Closed Live',
        'Revenue Type': 'New',
        'Days Between Created and Go Live': 82,
        'Total Opportunities': 3,
        'Number of Opportunities': 2,
      },
      {
        'Account Name': 'Example Account 1',
        'Simulation Name': 'Q1 Strategy',
        ...templateActions.reduce((acc, action) => {
          acc[`${action.name} - Events`] = 10;
          acc[`${action.name} - Proposed Score`] = 5;
          return acc;
        }, {} as Record<string, number | string>),
        'Opportunity Status': 'Closed Lost',
        'Revenue Type': 'New',
        'Days Between Created and Go Live': 89,
        'Total Opportunities': 3,
        'Number of Opportunities': 1,
      },
      {
        'Account Name': 'Example Account 1',
        'Simulation Name': 'Q1 Strategy',
        ...templateActions.reduce((acc, action) => {
          acc[`${action.name} - Events`] = 10;
          acc[`${action.name} - Proposed Score`] = 5;
          return acc;
        }, {} as Record<string, number | string>),
        'Opportunity Status': 'Closed Live',
        'Revenue Type': 'Existing',
        'Days Between Created and Go Live': 84,
        'Total Opportunities': 3,
        'Number of Opportunities': 3,
      },
    ];

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Accounts Template');

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Download file
    XLSX.writeFile(wb, `Account_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };

  // This is Jayanth's change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        if (jsonData.length === 0) {
          alert('The uploaded file is empty. Please check your file and try again.');
          return;
        }

        // This is Jayanth's change
        // Dynamically detect actions from column headers
        const firstRow = jsonData[0];
        const columnNames = Object.keys(firstRow);
        
        // Extract unique action names from column patterns like "Action Name - Events/Proposed Score"
        const actionNamesSet = new Set<string>();
        const fieldSuffixes = [
          ' - Events',
          ' - Proposed Score',
        ];
        
        columnNames.forEach(colName => {
          for (const suffix of fieldSuffixes) {
            if (colName.endsWith(suffix)) {
              const actionName = colName.substring(0, colName.length - suffix.length);
              actionNamesSet.add(actionName);
              break;
            }
          }
        });

        const detectedActionNames = Array.from(actionNamesSet);
        
        if (detectedActionNames.length === 0) {
          alert('No valid action columns found. Please ensure columns follow the pattern: "Action Name - Events", "Action Name - Proposed Score", etc.');
          return;
        }

        // This is Jayanth's change
        // Helper function to find column value with case-insensitive and flexible matching
        const findColumnValue = (row: ExcelRow, possibleNames: string[]): any => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
              return row[name];
            }
          }
          return undefined;
        };
        
        // This is Jayanth's change
        // Group rows by Account Name + Simulation Name (each row = one opportunity)
        const simulationMap = new Map<string, {
          accountName: string;
          simulationName: string;
          actions: Action[] | null;
          opportunities: Array<{opportunityStatus: string; revenueType: string; daysBetweenCreatedAndGoLive: number; numberOfOpportunities: number}>;
          totalOpportunities?: number;
        }>();

        jsonData.forEach((row) => {
          const accountName = row['Account Name'];
          const simulationName = row['Simulation Name'];

          if (!accountName || !simulationName) {
            console.warn('Skipping row with missing Account Name or Simulation Name:', row);
            return;
          }

          const key = `${accountName}|||${simulationName}`;
          
          // Read opportunity data from this row (each row is one opportunity)
          const opportunityStatusValue = findColumnValue(row, [
            'Opportunity Status',
            'Opportunity status',
            'opportunity status',
            'OpportunityStatus'
          ]);
          
          const revenueTypeValue = findColumnValue(row, [
            'Revenue Type',
            'Revenue type',
            'revenue type',
            'RevenueType'
          ]);
          
          const daysValue = findColumnValue(row, [
            'Days Between Created and Go Live',
            'Days between created and go live',
            'Days between created and go live date',
            'Days Between Created and Go Live Date',
            'days between created and go live date'
          ]);

          const numberOfOpportunitiesValue = findColumnValue(row, [
            'Number of Opportunities',
            'Number of opportunities',
            'number of opportunities',
            'NumberOfOpportunities',
            '# of Opportunities',
            'No. of Opportunities'
          ]);

          // This is Jayanth's change
          // Add opportunity if we have at least opportunity status and days (revenue type can be optional)
          const hasMinimumData = opportunityStatusValue && daysValue !== undefined && daysValue !== null && daysValue !== '';
          
          if (!hasMinimumData) {
            console.warn(`Skipping row for ${accountName} - ${simulationName}: Missing required opportunity data`, {
              opportunityStatus: opportunityStatusValue,
              revenueType: revenueTypeValue,
              days: daysValue
            });
          }
          
          if (hasMinimumData) {
            const opportunity = {
              opportunityStatus: String(opportunityStatusValue),
              revenueType: revenueTypeValue ? String(revenueTypeValue) : 'Not Specified',
              daysBetweenCreatedAndGoLive: Number(daysValue) || 0,
              numberOfOpportunities: numberOfOpportunitiesValue ? Number(numberOfOpportunitiesValue) : 0,
            };

            if (!simulationMap.has(key)) {
              // First row for this account+simulation: extract actions and total opportunities
              const actions: Action[] = detectedActionNames.map((actionName, index) => {
                const eventsKey = `${actionName} - Events`;
                const proposedScoreKey = `${actionName} - Proposed Score`;
                
                const events = Number(row[eventsKey]) || 0;
                const proposedScore = Number(row[proposedScoreKey]) || 0;
                const completeScore = events * proposedScore;

                return {
                  id: `action-${index}-${Date.now()}-${Math.random()}`,
                  name: actionName,
                  weight: 0, // Will be calculated
                  events,
                  currentScore: Math.floor(Math.random() * 10) + 1,
                  proposedScore,
                  completeScore,
                };
              });

              // Read Total Opportunities from first row
              const totalOpportunitiesValue = findColumnValue(row, [
                'Total Opportunities',
                'Total opportunities',
                'total opportunities',
                'TotalOpportunities'
              ]);

              simulationMap.set(key, {
                accountName,
                simulationName,
                actions,
                opportunities: [opportunity],
                totalOpportunities: totalOpportunitiesValue ? Number(totalOpportunitiesValue) : undefined,
              });
              
              console.log(`Created new simulation group for ${accountName} - ${simulationName} with 1 opportunity`);
            } else {
              // Subsequent row for same account+simulation: just add opportunity
              simulationMap.get(key)!.opportunities.push(opportunity);
              console.log(`Added opportunity to ${accountName} - ${simulationName}. Total opportunities: ${simulationMap.get(key)!.opportunities.length}`);
            }
          }
        });

        // Build accounts from grouped simulations
        const accountsMap = new Map<string, { name: string; simulations: AccountSimulation[] }>();

        simulationMap.forEach((simData) => {
          if (!simData.actions) return;

          // Calculate weights
          const proposedScores = simData.actions.map(a => a.proposedScore);
          const weights = calculateActionWeights(proposedScores);
          simData.actions.forEach((action, idx) => {
            action.weight = weights[idx] || 0;
          });

          // Calculate account score and major contributor
          const accountScore = calculateAccountScore(simData.actions);
          const majorContributor = findMajorContributor(simData.actions);

          // This is Jayanth's change
          const simulation: AccountSimulation = {
            simulationId: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            simulationName: simData.simulationName,
            actions: simData.actions,
            accountScore,
            majorContributor: majorContributor || undefined,
            opportunities: simData.opportunities,
            totalOpportunities: simData.totalOpportunities,
          };

          // Add to accounts map
          if (!accountsMap.has(simData.accountName)) {
            accountsMap.set(simData.accountName, {
              name: simData.accountName,
              simulations: [],
            });
          }
          accountsMap.get(simData.accountName)!.simulations.push(simulation);
        });

        // This is Jayanth's change
        // Convert map to array and bulk create
        const accountsArray = Array.from(accountsMap.values());
        
        // Log summary before creating
        console.log('=== Import Summary ===');
        accountsArray.forEach(account => {
          console.log(`Account: ${account.name}`);
          account.simulations.forEach(sim => {
            console.log(`  - Simulation: ${sim.simulationName}`);
            console.log(`    Actions: ${sim.actions.length}`);
            console.log(`    Opportunities: ${sim.opportunities.length}`);
            console.log(`    Total Opportunities Field: ${sim.totalOpportunities}`);
          });
        });
        
        bulkCreateAccounts(accountsArray, fileName);

        // This is Jayanth's change - Use utility functions for calculations
        const totalOpportunities = calculateMultipleAccountsTotalOpportunities(accountsArray);
        const totalSimulations = calculateTotalSimulations(accountsArray);
        
        alert(`Successfully imported ${accountsArray.length} account(s) with ${totalSimulations} simulation(s) and ${totalOpportunities} opportunities from "${fileName}"!`);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing file. Please ensure it matches the template format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="notification-info section-spacing hover-shadow">
      <div className="flex-between">
        <div>
          <h3 className="notification-title text-lg mb-1">Bulk Account Import</h3>
          <p className="notification-text">
            Download the template, fill in account details, and upload to import multiple accounts
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="btn-success flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>

          <button
            onClick={handleUploadFile}
            className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Upload className="w-5 h-5" />
            Upload Accounts
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
    </div>
  );
}

