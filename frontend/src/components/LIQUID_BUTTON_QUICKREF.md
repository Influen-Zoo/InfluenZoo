# Liquid Button - Quick Reference

## 🚀 Quick Start

```jsx
import LiquidButton from './components/LiquidButton';

<LiquidButton variant="primary">
  Click Me!
</LiquidButton>
```

## 🎨 All Variants

```jsx
<LiquidButton variant="primary">Primary</LiquidButton>
<LiquidButton variant="secondary">Secondary</LiquidButton>
<LiquidButton variant="success">Success</LiquidButton>
<LiquidButton variant="error">Error</LiquidButton>
<LiquidButton variant="warning">Warning</LiquidButton>
```

## 📏 Sizes

```jsx
<LiquidButton size="small">Small</LiquidButton>
<LiquidButton size="medium">Medium</LiquidButton>
<LiquidButton size="large">Large</LiquidButton>
```

## 🎯 Common Use Cases

### Submit Button
```jsx
<LiquidButton 
  variant="success" 
  onClick={handleSubmit}
  fullWidth
>
  Submit
</LiquidButton>
```

### Delete Button
```jsx
<LiquidButton 
  variant="error" 
  onClick={handleDelete}
>
  Delete
</LiquidButton>
```

### Link Navigation
```jsx
<LiquidButton 
  variant="primary"
  onClick={() => navigate('/page')}
>
  Go to Page
</LiquidButton>
```

### With Icon
```jsx
import { Save } from '@mui/icons-material';

<LiquidButton 
  variant="success"
  startIcon={<Save />}
>
  Save
</LiquidButton>
```

### Disabled State
```jsx
<LiquidButton disabled>
  Disabled Button
</LiquidButton>
```

### Loading State
```jsx
<LiquidButton 
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</LiquidButton>
```

### Full Width (Forms)
```jsx
<LiquidButton fullWidth variant="primary">
  Full Width Button
</LiquidButton>
```

## 🎨 Color Codes

| Variant | Main Color | Gradient |
|---------|-----------|----------|
| Primary | #0066ff | #0066ff → #00d4ff |
| Secondary | #00d4ff | #00d4ff → #00b8ff |
| Success | #00d084 | #00d084 → #00ffaa |
| Error | #ff3366 | #ff3366 → #ff6699 |
| Warning | #ffb800 | #ffb800 → #ff9500 |

## ✨ Features

✔️ Liquid ripple animation on click
✔️ Smooth hover effects
✔️ Gradient backgrounds
✔️ Glowing shadows
✔️ Responsive design
✔️ Keyboard accessible
✔️ Touch-friendly
✔️ No extra dependencies

## 📝 Props Summary

```jsx
<LiquidButton
  variant="primary"          // primary | secondary | success | error | warning
  size="medium"              // small | medium | large
  onClick={() => {}}         // Click handler
  disabled={false}           // Disable button
  fullWidth={false}          // Take full width
  className=""               // Additional CSS classes
  startIcon={<Icon />}       // Icon before text
  endIcon={<Icon />}         // Icon after text
>
  Button Text
</LiquidButton>
```

## 🔧 Installation Steps

1. ✅ Component file already created: `src/components/LiquidButton.jsx`
2. ✅ Styles file already created: `src/components/LiquidButton.css`
3. ✅ Demo component created: `src/components/LiquidButtonDemo.jsx`
4. ✅ Full guide available: `LIQUID_BUTTON_GUIDE.md`

## 👁️ View Demo

```jsx
import LiquidButtonDemo from './components/LiquidButtonDemo';

// Add to your app or route
<LiquidButtonDemo />
```

## 📦 Using in Your Pages

### Example: Auth Page
```jsx
import LiquidButton from '../components/LiquidButton';

function AuthPage() {
  return (
    <div>
      <LiquidButton 
        variant="primary" 
        fullWidth
        onClick={handleLogin}
      >
        Login
      </LiquidButton>
      <LiquidButton 
        variant="secondary" 
        fullWidth
        onClick={handleSignup}
      >
        Sign Up
      </LiquidButton>
    </div>
  );
}
```

### Example: Dashboard
```jsx
import LiquidButton from '../components/LiquidButton';

function Dashboard() {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <LiquidButton variant="primary">Save Changes</LiquidButton>
      <LiquidButton variant="secondary">Preview</LiquidButton>
      <LiquidButton variant="error">Delete</LiquidButton>
    </div>
  );
}
```

## 🎯 Next Steps

1. Import the component wherever you need buttons
2. Replace existing buttons with `<LiquidButton>`
3. Adjust `variant` prop to match action type
4. Test on different screen sizes
5. Customize colors if needed by editing the `colorMap` in `LiquidButton.jsx`

---

**Need more details?** Check `LIQUID_BUTTON_GUIDE.md` for comprehensive documentation.
