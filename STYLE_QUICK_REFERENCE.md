# Style Quick Reference

## Most Common Classes

### Cards & Containers
| Class | Use Case |
|-------|----------|
| `card` | Basic white card with border and shadow |
| `card-padded` | Card with padding (most common) |
| `card-title` | Heading inside a card |

### Buttons
| Class | Use Case |
|-------|----------|
| `btn-primary` | Main action (blue) |
| `btn-success` | Success action (green) |
| `btn-secondary` | Secondary action (gray) |
| `btn-ghost` | Minimal styling |

### Page Structure
| Class | Use Case |
|-------|----------|
| `page-header` | Top banner with logo |
| `page-title` | Main page heading |
| `page-subtitle` | Description under title |
| `nav-tabs` | Navigation tab container |
| `nav-tab-active` | Active tab button |
| `nav-tab` | Inactive tab button |

### Notifications & Status
| Class | Use Case |
|-------|----------|
| `notification-success` | Success message banner |
| `notification-info` | Information banner |
| `notification-warning` | Warning banner |
| `status-success` | Success badge/box |
| `status-info` | Info badge/box |
| `status-warning` | Warning badge/box |

### Prices & Numbers
| Class | Use Case |
|-------|----------|
| `price-label` | Label above price |
| `price-value-lg` | Large price (3xl) |
| `price-value-xl` | Extra large price (2xl) |
| `price-value-md` | Medium price (xl) |
| `price-highlight` | Blue highlighted price |

### Layout
| Class | Use Case |
|-------|----------|
| `grid-2-cols` | Responsive 2-column grid |
| `grid-3-cols` | Responsive 3-column grid |
| `grid-form` | 2-column form grid |
| `flex-between` | Space between items |
| `flex-center` | Center items |
| `flex-start` | Align to start |

### Charts
| Class | Use Case |
|-------|----------|
| `chart-bar-green` | Green chart bar |
| `chart-bar-blue` | Blue chart bar |
| `chart-bar-yellow` | Yellow chart bar |
| `chart-bar-purple` | Purple chart bar |
| `chart-label` | Label below chart element |
| `chart-value-green` | Green value text |
| `chart-value-blue` | Blue value text |

### Utilities
| Class | Use Case |
|-------|----------|
| `section-spacing` | Space between sections (mb-6) |
| `section-divider` | Border with spacing |
| `brand-logo` | Logo image sizing |
| `hover-lift` | Lift on hover |
| `hover-shadow` | Shadow on hover |

---

## Common Combinations

```jsx
// Pricing card
<div className="card-padded">
  <h2 className="card-title">Title</h2>
  <p className="price-label">Label</p>
  <p className="price-value-lg price-highlight">£XXX</p>
  <button className="btn-primary">Action</button>
</div>

// Success notification
<div className="notification-success">
  <h4 className="notification-title">Success!</h4>
  <p className="notification-text">Message here</p>
</div>

// Header with logo
<div className="page-header">
  <div className="flex-start">
    <img src="logo.png" className="brand-logo" />
    <div>
      <h1 className="page-title">Title</h1>
      <p className="page-subtitle">Subtitle</p>
    </div>
  </div>
</div>

// Navigation
<div className="nav-tabs">
  <button className="nav-tab-active">Active</button>
  <button className="nav-tab">Inactive</button>
</div>
```

---

## Color Meanings

| Color | Meaning |
|-------|---------|
| **Blue** | Primary actions, brand, recommendations |
| **Green** | Success, approval, positive metrics |
| **Yellow** | Warnings, competitive data |
| **Purple** | Alternative metrics, final values |
| **Red** | Errors, thresholds, minimums |
| **Gray** | Neutral, secondary, borders |
