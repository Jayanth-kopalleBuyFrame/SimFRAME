# Logo Setup Instructions

## Current Setup
The header now displays an image logo instead of an icon, and the "SimFRAME" text is displayed in black.

## How to Replace the Logo

1. **Save your logo image** (the buyFRAME logo from your screenshot) as one of these formats:
   - PNG (recommended): `logo.png`
   - SVG (vector, best for scaling): `logo.svg`
   - JPG: `logo.jpg`

2. **Place the logo file** in the `public` folder:
   ```
   SimFRAME/public/logo.png
   ```
   Or
   ```
   SimFRAME/public/logo.svg
   ```

3. **Update the image path** in `src/App.tsx` if needed (line 24):
   ```tsx
   <img src="/logo.svg" alt="Logo" className="nav-bar-brand-icon" />
   ```
   Change `/logo.svg` to `/logo.png` or `/logo.jpg` depending on your file format.

4. **Adjust size if needed** by updating the CSS in `src/index.css`:
   ```css
   .nav-bar-brand-icon {
     @apply w-8 h-8;  /* Change these values as needed */
   }
   ```

## Current Placeholder
A temporary placeholder logo (dark blue with white lines) has been created at `public/logo.svg`. Replace this with your actual buyFRAME logo.

## Changes Made
- ✅ Removed the BarChart3 icon from the header
- ✅ Added image logo support
- ✅ Changed "SimFRAME" text color from blue (#003D6B) to black
- ✅ Updated navigation icons (Cohort Analysis now uses TrendingUp icon)

