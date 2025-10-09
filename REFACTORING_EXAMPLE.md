# Refactoring Example: Using Stylesheet Classes

This document shows how to refactor your components to use the centralized stylesheet classes instead of inline Tailwind utilities.

## Before and After Comparison

### Notification Banner

**Before (Inline Tailwind):**
```jsx
<div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="text-green-500 text-xl">📈</div>
      <div>
        <h4 className="text-green-800 font-medium">Corridor data updated</h4>
        <p className="text-green-600 text-sm">
          New pricing data is available.
        </p>
      </div>
    </div>
  </div>
</div>
```

**After (Stylesheet Classes):**
```jsx
<div className="notification-success">
  <div className="flex-between">
    <div className="flex-start space-x-3">
      <div className="icon-lg icon-success">📈</div>
      <div>
        <h4 className="notification-title">Corridor data updated</h4>
        <p className="notification-text">
          New pricing data is available.
        </p>
      </div>
    </div>
  </div>
</div>
```

---

### Page Header

**Before (Inline Tailwind):**
```jsx
<div className="bg-white p-4 flex items-center justify-between border border-gray-200 rounded-t-lg">
  <div className="flex items-center">
    <img src="assets/Logo.png" alt="Logo" className="h-12 mr-4" />
    <div>
      <h1 className="text-2xl font-bold text-primary">B2B Pricing Workbench</h1>
      <p className="text-gray-600 text-sm">Make data-driven pricing decisions</p>
    </div>
  </div>
</div>
```

**After (Stylesheet Classes):**
```jsx
<div className="page-header">
  <div className="flex-start">
    <img src="assets/Logo.png" alt="Logo" className="brand-logo" />
    <div>
      <h1 className="page-title">B2B Pricing Workbench</h1>
      <p className="page-subtitle">Make data-driven pricing decisions</p>
    </div>
  </div>
</div>
```

---

### Navigation Tabs

**Before (Inline Tailwind):**
```jsx
<div className="bg-gray-100 p-2 border-x border-b border-gray-200 mb-6">
  <div className="flex space-x-4">
    <button className="px-4 py-2 bg-white rounded shadow text-primary font-medium">
      Dashboard
    </button>
    <button className="px-4 py-2 hover:bg-gray-200 rounded text-gray-700">
      Internal Pricing
    </button>
  </div>
</div>
```

**After (Stylesheet Classes):**
```jsx
<div className="nav-tabs section-spacing">
  <div className="flex space-x-4">
    <button className="nav-tab-active">Dashboard</button>
    <button className="nav-tab">Internal Pricing</button>
  </div>
</div>
```

---

### Pricing Card

**Before (Inline Tailwind):**
```jsx
<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
  <h2 className="text-lg font-semibold text-primary mb-4">Price Recommendation</h2>
  
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div>
      <p className="text-gray-600 mb-1">Internal Winning Price:</p>
      <p className="text-2xl font-bold">£2,500,000</p>
    </div>
  </div>

  <div className="border-t border-gray-200 pt-4 mb-4">
    <p className="text-gray-600 mb-1">Final Recommended Price:</p>
    <p className="text-3xl font-bold text-blue-600">£3,200,000</p>
  </div>

  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
    Sync Final Price
  </button>

  <div className="bg-green-50 mt-4 p-3 rounded border border-green-200">
    <p className="font-medium text-green-800">Approval Status</p>
    <p className="text-green-700">Approved - Ready to Quote</p>
  </div>
</div>
```

**After (Stylesheet Classes):**
```jsx
<div className="card-padded">
  <h2 className="card-title">Price Recommendation</h2>
  
  <div className="grid-form mb-6">
    <div>
      <p className="price-label">Internal Winning Price:</p>
      <p className="price-value-xl">£2,500,000</p>
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

---

### Buttons

**Before (Inline Tailwind):**
```jsx
<button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
  Sync Price
</button>

<button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
  🔄 Refresh Dashboard
</button>

<button className="px-4 py-2 hover:bg-gray-200 rounded text-gray-700">
  Cancel
</button>
```

**After (Stylesheet Classes):**
```jsx
<button className="btn-primary">Sync Price</button>

<button className="btn-success">🔄 Refresh Dashboard</button>

<button className="btn-secondary">Cancel</button>
```

---

### Chart Elements

**Before (Inline Tailwind):**
```jsx
<div className="flex flex-col items-center">
  <div className="bg-green-200 w-16 h-40 rounded-t-sm"></div>
  <span className="text-xs mt-2">Internal Avg</span>
  <span className="text-xs text-green-600">£2,500,000</span>
</div>

<div className="flex flex-col items-center">
  <div className="bg-blue-200 w-16 h-42 rounded-t-sm"></div>
  <span className="text-xs mt-2">Base Rec.</span>
  <span className="text-xs text-blue-600">£2,700,000</span>
</div>
```

**After (Stylesheet Classes):**
```jsx
<div className="flex flex-col items-center">
  <div className="chart-bar-green h-40"></div>
  <span className="chart-label">Internal Avg</span>
  <span className="chart-value-green">£2,500,000</span>
</div>

<div className="flex flex-col items-center">
  <div className="chart-bar-blue h-42"></div>
  <span className="chart-label">Base Rec.</span>
  <span className="chart-value-blue">£2,700,000</span>
</div>
```

---

## Migration Steps

1. **Install Dependencies**: Ensure Tailwind CSS is properly configured
2. **Import Stylesheet**: The classes are automatically available from `src/index.css`
3. **Replace Inline Classes**: Use Find & Replace to swap common patterns:
   - `bg-white p-6 rounded-lg border border-gray-200 shadow-sm` → `card-padded`
   - `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700` → `btn-primary`
   - `text-lg font-semibold text-primary mb-4` → `card-title`
4. **Test Thoroughly**: Ensure all components render correctly
5. **Update Component Library**: Create reusable React components using these classes

---

## Benefits of This Approach

✅ **Consistency**: All components use the same styling patterns  
✅ **Maintainability**: Update styles in one place (index.css)  
✅ **Readability**: Cleaner, more semantic class names  
✅ **Performance**: Reduced class name strings  
✅ **Type Safety**: Can add TypeScript types for class names  
✅ **Design System**: Foundation for a proper design system  

---

## Next Steps

1. Create reusable React components using these classes
2. Add more specialized classes as needed for your specific use cases
3. Consider creating a component library with Storybook
4. Document component variations in your design system
