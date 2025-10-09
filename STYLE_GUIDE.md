# Project Style Guide

This document describes the reusable CSS classes available in your project. All classes are defined in `src/index.css` and follow the color scheme and styling patterns from your SummaryTab component.

## Color Palette

### Primary Colors
- **Primary Blue**: Used for main actions, titles, and brand elements
- **Green**: Success states, positive metrics, approval indicators
- **Yellow**: Warnings, competitive comparisons
- **Purple**: Alternative metrics, final recommendations
- **Red**: Errors, minimum thresholds, alerts
- **Gray**: Neutral elements, borders, backgrounds

---

## Component Classes

### Cards

```jsx
// Basic card
<div className="card">Content</div>

// Card with padding
<div className="card-padded">
  <h2 className="card-title">Card Title</h2>
  <p>Card content...</p>
</div>
```

### Buttons

```jsx
// Primary action button
<button className="btn-primary">Save Changes</button>

// Success button
<button className="btn-success">Approve</button>

// Secondary button
<button className="btn-secondary">Cancel</button>

// Ghost button (minimal styling)
<button className="btn-ghost">Close</button>
```

### Navigation Tabs

```jsx
<div className="nav-tabs">
  <button className="nav-tab-active">Dashboard</button>
  <button className="nav-tab">Settings</button>
  <button className="nav-tab">Reports</button>
</div>
```

### Notifications

```jsx
// Success notification
<div className="notification-success">
  <h4 className="notification-title">Success!</h4>
  <p className="notification-text">Your changes have been saved.</p>
</div>

// Info notification
<div className="notification-info">
  <h4 className="notification-title">Information</h4>
  <p className="notification-text">New data is available.</p>
</div>

// Warning notification
<div className="notification-warning">
  <h4 className="notification-title">Warning</h4>
  <p className="notification-text">Please review before proceeding.</p>
</div>
```

### Status Badges

```jsx
// Success status
<div className="status-success">
  <p className="status-title">Approved</p>
  <p className="status-text">Ready for deployment</p>
</div>

// Info status
<div className="status-info">
  <p className="status-title">In Progress</p>
  <p className="status-text">Currently processing</p>
</div>

// Warning status
<div className="status-warning">
  <p className="status-title">Pending Review</p>
  <p className="status-text">Awaiting approval</p>
</div>
```

### Page Headers

```jsx
<div className="page-header">
  <div className="flex-start">
    <img src="logo.png" alt="Logo" className="brand-logo" />
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your metrics</p>
    </div>
  </div>
</div>
```

### Price Display

```jsx
<div>
  <p className="price-label">Final Price:</p>
  <p className="price-value-lg price-highlight">£3,200,000</p>
</div>

<div>
  <p className="price-label">Base Price:</p>
  <p className="price-value-md">£2,500,000</p>
</div>
```

### Charts & Visualizations

```jsx
// Chart bars
<div className="chart-bar-green" style={{height: '160px'}}></div>
<span className="chart-label">Internal Avg</span>
<span className="chart-value-green">£2,500,000</span>

<div className="chart-bar-blue" style={{height: '180px'}}></div>
<span className="chart-label">Recommended</span>
<span className="chart-value-blue">£2,800,000</span>

// Reference lines
<div className="chart-reference-line">
  <span className="chart-reference-label">£1,500,000</span>
</div>

// Axis labels
<span className="chart-axis-label">£0</span>
```

---

## Layout Classes

### Grid Layouts

```jsx
// 2-column grid (responsive)
<div className="grid-2-cols">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// 3-column grid (responsive)
<div className="grid-3-cols">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// Form grid (2 columns, always)
<div className="grid-form">
  <div>Field 1</div>
  <div>Field 2</div>
</div>
```

### Flex Utilities

```jsx
// Space between items
<div className="flex-between">
  <span>Left</span>
  <span>Right</span>
</div>

// Center items
<div className="flex-center">
  <span>Centered</span>
</div>

// Align items to start
<div className="flex-start">
  <img src="icon.png" />
  <span>Text</span>
</div>
```

### Spacing

```jsx
// Section spacing
<div className="section-spacing">Section content</div>

// Card spacing
<div className="card-spacing">Card content</div>

// Section divider
<div className="section-divider">
  <p>Content after divider</p>
</div>
```

---

## Icon Classes

```jsx
// Large icons with colors
<div className="icon-lg icon-success">✓</div>
<div className="icon-lg icon-info">ℹ</div>
<div className="icon-lg icon-warning">⚠</div>
```

---

## Hover Effects

```jsx
// Lift effect on hover
<div className="card hover-lift">Hover to lift</div>

// Shadow effect on hover
<div className="card hover-shadow">Hover for shadow</div>

// Combine both
<div className="card hover-lift hover-shadow">Interactive card</div>
```

---

## Usage Examples

### Example 1: Pricing Card

```jsx
<div className="card-padded">
  <h2 className="card-title">Price Recommendation</h2>
  
  <div className="grid-form">
    <div>
      <p className="price-label">Internal Price:</p>
      <p className="price-value-xl">£2,500,000</p>
    </div>
    <div>
      <p className="price-label">Competitive Price:</p>
      <p className="price-value-xl">£2,800,000</p>
    </div>
  </div>

  <div className="section-divider">
    <p className="price-label">Final Recommended Price:</p>
    <p className="price-value-lg price-highlight">£3,200,000</p>
  </div>

  <button className="btn-primary">Sync Final Price</button>

  <div className="status-success">
    <p className="status-title">Approval Status</p>
    <p className="status-text">Approved - Ready to Quote</p>
  </div>
</div>
```

### Example 2: Dashboard Header

```jsx
<div className="page-header">
  <div className="flex-between">
    <div className="flex-start">
      <img src="logo.png" alt="Logo" className="brand-logo" />
      <div>
        <h1 className="page-title">B2B Pricing Workbench</h1>
        <p className="page-subtitle">
          Make data-driven pricing decisions
        </p>
      </div>
    </div>
    <button className="btn-primary">New Quote</button>
  </div>
</div>
```

### Example 3: Notification with Actions

```jsx
<div className="notification-success">
  <div className="flex-between">
    <div className="flex-start" style={{gap: '12px'}}>
      <div className="icon-lg icon-success">📈</div>
      <div>
        <h4 className="notification-title">Data Updated</h4>
        <p className="notification-text">
          New pricing data is available
        </p>
      </div>
    </div>
    <div className="flex-start" style={{gap: '8px'}}>
      <button className="btn-success">Refresh</button>
      <button className="btn-ghost">✕</button>
    </div>
  </div>
</div>
```

---

## Best Practices

1. **Consistency**: Always use these predefined classes instead of custom Tailwind classes
2. **Composition**: Combine multiple classes to create complex components
3. **Semantic Naming**: Classes are named by purpose (card, button) not just appearance
4. **Responsive**: Grid and layout classes are responsive by default
5. **Hover States**: Button and interactive element hover states are built-in

---

## Color Reference

| Color | Usage | Example Classes |
|-------|-------|----------------|
| Blue (Primary) | Main actions, brand, highlights | `btn-primary`, `page-title`, `price-highlight` |
| Green | Success, approval, positive | `btn-success`, `notification-success`, `chart-bar-green` |
| Yellow | Warnings, competitive data | `notification-warning`, `chart-bar-yellow` |
| Purple | Alternative metrics | `chart-bar-purple`, `chart-value-purple` |
| Red | Errors, thresholds | `chart-reference-line`, `chart-reference-label` |
| Gray | Neutral, borders, text | `btn-secondary`, `price-label`, `page-subtitle` |

---

## Extending the Stylesheet

To add new component classes, edit `src/index.css` within the `@layer components` block:

```css
@layer components {
  .your-new-class {
    @apply /* Tailwind utilities */;
  }
}
```

This ensures your custom classes work seamlessly with Tailwind's utility classes and can be overridden when needed.
