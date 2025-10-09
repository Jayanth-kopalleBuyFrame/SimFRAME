# Marketing Simulator

A comprehensive marketing simulation platform for analyzing scenarios and calculating account scores with cohort analysis.

## Features

- **Dashboard**: Clean, minimalist UI with animated heartbeat button
- **Simulator Workbench**: Create and manage multiple simulation scenarios with marketing actions and weighted scores
- **Cohort Analysis**: Visualize account cohorts with revenue forecasting and multi-year comparisons

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Anime.js** for animations
- **Lucide React** for icons

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx              # Landing page with animated CTA
│   ├── SimulatorWorkbench.tsx     # Scenario management and action configuration
│   └── CohortAnalysis.tsx         # Cohort visualization and metrics
├── store/
│   └── simulatorStore.ts          # Zustand store (single source of truth)
├── utils/
│   └── cohortCalculations.ts      # Cohort metrics calculation functions
├── App.tsx                        # Main app with navigation
├── main.tsx                       # Entry point
└── index.css                      # Global styles with Tailwind
```

## State Management

The application uses a single Zustand store (`simulatorStore.ts`) that manages:

- Multiple simulation scenarios with unique IDs
- Marketing actions with weights, scores, and calculations
- Cohort analysis filters and data
- Active tab navigation
- Data persistence across tab switches

## Usage

### Creating a Simulation

1. Navigate to the **Simulator Workbench** tab
2. Click **New Simulation**
3. Enter a simulation name
4. Configure actions with weights (must total 100%)
5. Input current and proposed scores

### Analyzing Cohorts

1. Navigate to the **Cohort Analysis** tab
2. Select number of years to analyze
3. Choose specific fiscal years
4. View cohort flows, metrics, and revenue forecasts

## Formulas (Placeholders)

The following formulas are placeholders and can be customized:

- **Win Rate**: `(deals won / total deals) * 100 * cohort_multiplier`
- **Avg Deal Size**: `total revenue / number of deals * cohort_multiplier`
- **Sales Cycle**: `avg days from opportunity to close + cohort_adjustment`
- **Forecasted Revenue**: `accounts * win_rate * avg_deal_size * marketing_influence_factor`
- **Forecast Delta**: `(proposed - current) / current * 100`

## Development Notes

- All weights in an action set must sum to 100%
- Each simulation has a unique ID for data isolation
- Cohorts are defined by score ranges:
  - Cohort 1: 10-20 score
  - Cohort 2: 21-30 score
  - Cohort 3: 31-50 score

## Best Practices Followed

- Monolithic architecture with clear module boundaries
- TypeScript for type safety
- ESLint for code quality
- Small, single-purpose functions
- Clean state management with Zustand
- Responsive, accessible UI

## License

MIT

