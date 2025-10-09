// This is Jayanth's change
import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSimulatorStore, type Action, type AccountSimulation } from '../store/simulatorStore';
import { calculateAccountScore, findMajorContributor, calculateActionWeights } from '../utils/cohortCalculations';

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
    
    // Build header row
    const headers = ['Account Name', 'Simulation Name'];
    templateActions.forEach(action => {
      headers.push(`${action.name} - Events`);
      headers.push(`${action.name} - Proposed Score`);
      headers.push(`${action.name} - Opportunity Status`);
      headers.push(`${action.name} - Revenue Type`);
      headers.push(`${action.name} - Days Between Created and Go Live`);
      headers.push(`${action.name} - Number of Opportunities`);
    });

    // Create sample rows
    const sampleData = [
      {
        'Account Name': 'Example Account 1',
        'Simulation Name': 'Q1 Strategy',
        ...templateActions.reduce((acc, action) => {
          acc[`${action.name} - Events`] = 0;
          acc[`${action.name} - Proposed Score`] = 0;
          acc[`${action.name} - Opportunity Status`] = 'Open';
          acc[`${action.name} - Revenue Type`] = 'New Business';
          acc[`${action.name} - Days Between Created and Go Live`] = 0;
          acc[`${action.name} - Number of Opportunities`] = 0;
          return acc;
        }, {} as Record<string, number | string>),
      },
      {
        'Account Name': 'Example Account 2',
        'Simulation Name': 'Q2 Strategy',
        ...templateActions.reduce((acc, action) => {
          acc[`${action.name} - Events`] = 0;
          acc[`${action.name} - Proposed Score`] = 0;
          acc[`${action.name} - Opportunity Status`] = 'Open';
          acc[`${action.name} - Revenue Type`] = 'New Business';
          acc[`${action.name} - Days Between Created and Go Live`] = 0;
          acc[`${action.name} - Number of Opportunities`] = 0;
          return acc;
        }, {} as Record<string, number | string>),
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

        // Dynamically detect actions from column headers
        const firstRow = jsonData[0];
        const columnNames = Object.keys(firstRow);
        
        // Extract unique action names from column patterns like "Action Name - Field Type"
        const actionNamesSet = new Set<string>();
        const fieldSuffixes = [
          ' - Events',
          ' - Proposed Score',
          ' - Opportunity Status',
          ' - Revenue Type',
          ' - Days Between Created and Go Live',
          ' - Number of Opportunities',
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

        // Parse and group data by account
        const accountsMap = new Map<string, { name: string; simulations: AccountSimulation[] }>();

        jsonData.forEach((row) => {
          const accountName = row['Account Name'];
          const simulationName = row['Simulation Name'];

          if (!accountName || !simulationName) {
            console.warn('Skipping row with missing Account Name or Simulation Name:', row);
            return;
          }

          // Extract action data from row using dynamically detected action names
          const actions: Action[] = detectedActionNames.map((actionName, index) => {
            const eventsKey = `${actionName} - Events`;
            const proposedScoreKey = `${actionName} - Proposed Score`;
            const opportunityStatusKey = `${actionName} - Opportunity Status`;
            const revenueTypeKey = `${actionName} - Revenue Type`;
            const daysBetweenKey = `${actionName} - Days Between Created and Go Live`;
            const numberOfOpportunitiesKey = `${actionName} - Number of Opportunities`;
            
            const events = Number(row[eventsKey]) || 0;
            const proposedScore = Number(row[proposedScoreKey]) || 0;
            const completeScore = events * proposedScore;
            const opportunityStatus = row[opportunityStatusKey] ? String(row[opportunityStatusKey]) : undefined;
            const revenueType = row[revenueTypeKey] ? String(row[revenueTypeKey]) : undefined;
            const daysBetweenCreatedAndGoLive = row[daysBetweenKey] ? Number(row[daysBetweenKey]) : undefined;
            const numberOfOpportunities = row[numberOfOpportunitiesKey] ? Number(row[numberOfOpportunitiesKey]) : undefined;

            return {
              id: `action-${index}-${Date.now()}-${Math.random()}`,
              name: actionName,
              weight: 0, // Will be calculated
              events,
              currentScore: Math.floor(Math.random() * 10) + 1,
              proposedScore,
              completeScore,
              opportunityStatus,
              revenueType,
              daysBetweenCreatedAndGoLive,
              numberOfOpportunities,
            };
          });

          // Calculate weights
          const proposedScores = actions.map(a => a.proposedScore);
          const weights = calculateActionWeights(proposedScores);
          actions.forEach((action, idx) => {
            action.weight = weights[idx] || 0;
          });

          // Calculate account score and major contributor
          const accountScore = calculateAccountScore(actions);
          const majorContributor = findMajorContributor(actions);

          const simulation: AccountSimulation = {
            simulationId: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            simulationName,
            actions,
            accountScore,
            majorContributor: majorContributor || undefined,
          };

          // Add to accounts map
          if (!accountsMap.has(accountName)) {
            accountsMap.set(accountName, {
              name: accountName,
              simulations: [],
            });
          }
          accountsMap.get(accountName)!.simulations.push(simulation);
        });

        // Convert map to array and bulk create
        const accountsArray = Array.from(accountsMap.values());
        bulkCreateAccounts(accountsArray, fileName);

        alert(`Successfully imported ${accountsArray.length} account(s) with ${jsonData.length} simulation(s) from "${fileName}"!`);
        
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

