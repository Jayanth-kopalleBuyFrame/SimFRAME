// This is Jayanth's change
import { useSimulatorStore } from './store/simulatorStore';
import Dashboard from './components/Dashboard';
import SimulatorWorkbench from './components/SimulatorWorkbench';
import CohortAnalysis from './components/CohortAnalysis';
import { Sliders, Home, TrendingUp } from 'lucide-react';

function App() {
  const { activeTab, setActiveTab } = useSimulatorStore();

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'simulator' as const, label: 'Simulating Workbench', icon: Sliders },
    { id: 'cohort-analysis' as const, label: 'Cohort Analysis', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-bar-content">
          <div className="nav-bar-inner">
            <div className="nav-bar-brand">
              <img src="/logo.png" alt="Logo" className="nav-bar-brand-icon" />
              <span className="nav-bar-brand-text">SimFRAME</span>
            </div>

            <div className="nav-bar-tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-bar-tab ${
                      activeTab === tab.id
                        ? 'nav-bar-tab-active'
                        : 'nav-bar-tab-inactive'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'simulator' && <SimulatorWorkbench />}
        {activeTab === 'cohort-analysis' && <CohortAnalysis />}
      </main>
    </div>
  );
}

export default App;

