// This is Jayanth's change
import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSimulatorStore, type Action, type AccountSimulation, type Opportunity } from '../store/simulatorStore';
import { 
  calculateAccountScore, 
  findMajorContributor, 
  calculateActionWeights,
  calculateMultipleAccountsTotalOpportunities
} from '../utils/cohortCalculations';

interface ExcelRow {
  'Account Name': string;
  [key: string]: string | number; // Dynamic action columns and opportunity fields
}

export default function AccountBulkImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { simulations, bulkCreateAccounts, createSimulation, updateSimulation } = useSimulatorStore();

  // Get all unique actions from existing simulations to build template
  const getTemplateActions = (): Action[] => {
    const simulationsArray = Array.from(simulations.values());
    if (simulationsArray.length === 0) {
      // Return default structure if no simulations exist
      return [
        { id: '1', name: 'Custom Redirect Click', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '2', name: 'Email Open', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '3', name: 'File Access', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '4', name: 'Landing Page Success', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '5', name: 'Page View', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '6', name: 'Site Search Query', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '7', name: 'Third Party Click', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '8', name: 'Tracker Link Click', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '9', name: 'Visitor Session', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '10', name: 'Outbound Response', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '11', name: 'Completed Meeting at Event', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '12', name: 'Networking event registration', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '13', name: 'Networking Event Attendance', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '14', name: 'Event Booth Visit', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '15', name: 'LinkedIn Engagement', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '16', name: 'LinkedIn Forms', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '17', name: 'Unsubscribe', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '18', name: 'Hard Bounced', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '19', name: 'Report', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '20', name: 'Case study', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '21', name: 'Network catalogue', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '22', name: 'Newsletter signup', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '23', name: 'Contact us form', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '24', name: 'High value page visit', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '25', name: '6Sense Temperature scores', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
        { id: '26', name: 'LinkedIn Ad Engagement', weight: 0, events: 0, currentScore: 0, proposedScore: 0, completeScore: 0 },
      ];
    }
    // Use actions from the first simulation as template
    return simulationsArray[0].actions;
  };

  const handleDownloadTemplate = () => {
    const templateActions = getTemplateActions();
    
    // Build header row with new structure
    const headers = ['Account Name'];
    
    // Add action event columns only (no proposed score in upload)
    templateActions.forEach(action => {
      headers.push(`${action.name} - Events`);
    });
    
    // Add opportunity fields at the end
    headers.push('Opportunity Status');
    headers.push('Revenue Type');
    headers.push('Days Between Created and Go Live');
    headers.push('Total Opportunities');
    headers.push('Number of Opportunities');

    // Create sample rows - each row represents ONE opportunity for an account
    // Same account appears multiple times with same events but different opportunity data
    const sampleData = [
      {
        'Account Name': 'Example Account 1',
        ...templateActions.reduce((acc, action) => {
          acc[`${action.name} - Events`] = 10;
          return acc;
        }, {} as Record<string, number | string>),
        'Opportunity Status': 'Closed Live',
        'Revenue Type': 'New',
        'Days Between Created and Go Live': 162,
        'Total Opportunities': 11,
        'Number of Opportunities': 5,
      },
      {
        'Account Name': 'Example Account 1',
        ...templateActions.reduce((acc, action) => {
          acc[`${action.name} - Events`] = 10;
          return acc;
        }, {} as Record<string, number | string>),
        'Opportunity Status': 'Closed Lost',
        'Revenue Type': 'Existing',
        'Days Between Created and Go Live': 102,
        'Total Opportunities': 11,
        'Number of Opportunities': 5,
      },
      {
        'Account Name': 'Example Account 1',
        ...templateActions.reduce((acc, action) => {
          acc[`${action.name} - Events`] = 10;
          return acc;
        }, {} as Record<string, number | string>),
        'Opportunity Status': 'Closed Live',
        'Revenue Type': 'Existing',
        'Days Between Created and Go Live': 136,
        'Total Opportunities': 11,
        'Number of Opportunities': 1,
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

  // Handle file upload and parse new format
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

        // Detect action columns from headers (format: "Action Name - Events")
        const firstRow = jsonData[0];
        const columnNames = Object.keys(firstRow);
        
        const actionNamesSet = new Set<string>();
        columnNames.forEach(colName => {
          if (colName.endsWith(' - Events')) {
            const actionName = colName.substring(0, colName.length - ' - Events'.length);
            actionNamesSet.add(actionName);
          }
        });

        const detectedActionNames = Array.from(actionNamesSet);
        
        if (detectedActionNames.length === 0) {
          alert('No valid action columns found. Please ensure columns follow the pattern: "Action Name - Events".');
          return;
        }

        console.log(`Detected ${detectedActionNames.length} actions:`, detectedActionNames);

        // Helper function to find column value with flexible matching
        const findColumnValue = (row: ExcelRow, possibleNames: string[]): any => {
          for (const name of possibleNames) {
            const value = row[name];
            if (value !== undefined && value !== null && value !== '') {
              return value;
            }
          }
          return undefined;
        };
        
        // Group rows by Account Name (each row = one opportunity)
        const accountsMap = new Map<string, {
          accountName: string;
          actions: Action[];
          opportunities: Opportunity[];
          totalOpportunities?: number;
        }>();

        jsonData.forEach((row, rowIndex) => {
          const accountName = row['Account Name'];

          if (!accountName) {
            console.warn(`Row ${rowIndex + 1}: Skipping row with missing Account Name`);
            return;
          }

          // Parse opportunity data from this row
          const opportunityStatusValue = findColumnValue(row, [
            'Opportunity Status',
            'Opportunity status',
            'opportunity status',
          ]);
          
          const revenueTypeValue = findColumnValue(row, [
            'Revenue Type',
            'Revenue type',
            'revenue type',
          ]);
          
          const daysValue = findColumnValue(row, [
            'Days Between Created and Go Live',
            'Days between created and go live',
            'Days between created and go live date',
          ]);

          const numberOfOpportunitiesValue = findColumnValue(row, [
            'Number of Opportunities',
            'Number of opportunities',
            'number of opportunities',
          ]);

          // Validate minimum required data
          const hasMinimumData = opportunityStatusValue && daysValue !== undefined;
          
          if (!hasMinimumData) {
            console.warn(`Row ${rowIndex + 1}: Skipping ${accountName} - Missing required opportunity data`);
            return;
          }
          
          const opportunity: Opportunity = {
            opportunityStatus: String(opportunityStatusValue),
            revenueType: revenueTypeValue ? String(revenueTypeValue) : 'Not Specified',
            daysBetweenCreatedAndGoLive: Number(daysValue) || 0,
            numberOfOpportunities: numberOfOpportunitiesValue ? Number(numberOfOpportunitiesValue) : 0,
          };

          if (!accountsMap.has(accountName)) {
            // First row for this account: extract events and create actions
            const actions: Action[] = detectedActionNames.map((actionName, index) => {
              const eventsKey = `${actionName} - Events`;
              const events = Number(row[eventsKey]) || 0;
              
              // Generate baseline current score (5-15 range)
              const currentScore = Math.floor(Math.random() * 11) + 5;
              
              // Generate default proposed score (8-12 range) for realistic distribution
              const proposedScore = Math.floor(Math.random() * 5) + 8;
              const completeScore = events * proposedScore;

              return {
                id: `action-${index}-${Date.now()}-${Math.random()}`,
                name: actionName,
                weight: 0, // Will be calculated
                events,
                currentScore,
                proposedScore,
                completeScore,
              };
            });

            // Read Total Opportunities from first row
            const totalOpportunitiesValue = findColumnValue(row, [
              'Total Opportunities',
              'Total opportunities',
              'total opportunities',
            ]);

            accountsMap.set(accountName, {
              accountName,
              actions,
              opportunities: [opportunity],
              totalOpportunities: totalOpportunitiesValue ? Number(totalOpportunitiesValue) : undefined,
            });
            
            console.log(`Row ${rowIndex + 1}: Created account "${accountName}" with 1 opportunity`);
          } else {
            // Subsequent row for same account: just add opportunity
            accountsMap.get(accountName)!.opportunities.push(opportunity);
            console.log(`Row ${rowIndex + 1}: Added opportunity to "${accountName}"`);
          }
        });

        // CREATE ONE GLOBAL SIMULATION for all accounts
        // Use actions from the first account as the template
        const firstAccount = Array.from(accountsMap.values())[0];
        let globalSimId = '';
        
        if (firstAccount) {
          // Calculate weights for the global simulation
          const proposedScores = firstAccount.actions.map(a => a.proposedScore);
          const weights = calculateActionWeights(proposedScores);
          firstAccount.actions.forEach((action, idx) => {
            action.weight = weights[idx] || 0;
          });

          // Create ONE global simulation
          globalSimId = createSimulation(`Imported: ${fileName}`);
          
          // Update the global simulation with uploaded actions
          updateSimulation(globalSimId, { actions: firstAccount.actions });
          
          console.log(`Created global simulation: "${fileName}" with ${firstAccount.actions.length} actions`);
        }

        // Build accounts array - each account stores only per-account event data
        // All accounts reference the same global simulation
        const accountsArray = Array.from(accountsMap.values()).map((accountData) => {
          // Calculate weights based on proposed scores
          const proposedScores = accountData.actions.map(a => a.proposedScore);
          const weights = calculateActionWeights(proposedScores);
          accountData.actions.forEach((action, idx) => {
            action.weight = weights[idx] || 0;
          });

          // Calculate account score and major contributor
          const accountScore = calculateAccountScore(accountData.actions);
          const majorContributor = findMajorContributor(accountData.actions);

          // Create simulation referencing the global simulation ID
          const simulation: AccountSimulation = {
            simulationId: globalSimId, // Use the global simulation ID
            simulationName: `Imported: ${fileName}`,
            actions: accountData.actions, // Store per-account event data
            accountScore,
            majorContributor: majorContributor || undefined,
            opportunities: accountData.opportunities,
            totalOpportunities: accountData.totalOpportunities,
          };

          return {
            name: accountData.accountName,
            simulations: [simulation], // Each account has one simulation referencing the global one
          };
        });

        // Log summary
        console.log('=== Import Summary ===');
        accountsArray.forEach(account => {
          console.log(`Account: ${account.name}`);
          account.simulations.forEach(sim => {
            console.log(`  - Actions: ${sim.actions.length}`);
            console.log(`  - Opportunities: ${sim.opportunities.length}`);
            console.log(`  - Total Opportunities: ${sim.totalOpportunities}`);
          });
        });
        
        bulkCreateAccounts(accountsArray, fileName);

        const totalOpportunities = calculateMultipleAccountsTotalOpportunities(accountsArray);
        
        alert(
          `Successfully imported ${accountsArray.length} account(s) with ${totalOpportunities} opportunities and 1 global simulation from "${fileName}"!`
        );
        
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

