# Tailwind CSS Theming Guide

## Introduction

This document explains how theming works in our application using Tailwind CSS and CSS variables. This guide is intended for developers who are new to Tailwind CSS or theming systems in general.

## How Our Theming System Works

Our application uses a theme system that combines:

- CSS Variables (custom properties)
- Tailwind CSS configuration
- React context for theme state management

This allows us to switch between light and dark modes seamlessly while maintaining a consistent design language throughout the application.

## Key Files and Their Purpose

### 1. `src/app/globals.css`

This file contains CSS variables that define our theme colors:

```css
/* Light theme (default) */
:root {
  --background: #f7f7f8;
  --foreground: #2d2d2d;

  --card: #ffffff;
  --card-foreground: #2d2d2d;

  --popover: #ffffff;
  --popover-foreground: #2d2d2d;

  --primary: #3a7afe;
  --primary-foreground: #ffffff;

  /* more colors... */
}

/* Dark theme */
.dark {
  --background: #1e1e2e;
  --foreground: #e0e0e0;

  --card: #2a2a3b;
  --card-foreground: #e0e0e0;

  --primary: #7aa2f7;
  --primary-foreground: #1e1e2e;

  /* more colors... */
}
```

The CSS variables defined in `:root` apply to the light theme, while those in the `.dark` selector apply when the `dark` class is present on the `html` element.

### 2. `tailwind.config.ts`

This file maps Tailwind utility classes to our CSS variables:

```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class", // Enables toggling dark mode by adding .dark class to the html element
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        // more color mappings...
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}

export default config
```

With this configuration, when you use a class like `bg-primary` in your JSX, Tailwind will apply the CSS variable `var(--primary)` as the background color.

### 3. `src/providers/theme-provider.tsx`

This React component manages the theme state:

```tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

// Context to manage and provide theme state across the app
export const ThemeProvider = ({ children, defaultTheme = "light" }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  // Effect to load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("ui-theme") as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Effect to apply theme class to HTML element
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("ui-theme", theme)
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Hook to use the theme in components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
```

### 4. `src/components/ui/theme-toggle.tsx`

A button component that toggles between light and dark themes:

```tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/providers/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## How to Use Theme-Aware Colors

### Basic Usage

Instead of using hardcoded color classes like `text-gray-700` or `bg-blue-500`, use our theme variables:

```jsx
// ❌ Don't use hardcoded colors
<div className="bg-gray-100 text-gray-900">
  <p className="text-blue-500">Hardcoded colors</p>
</div>

// ✅ Do use theme variables
<div className="bg-background text-foreground">
  <p className="text-primary">Theme-aware colors</p>
</div>
```

### Common Theme Color Classes

| Purpose          | Class to Use                             | Avoid                         |
| ---------------- | ---------------------------------------- | ----------------------------- |
| Background       | `bg-background`                          | `bg-white`, `bg-gray-100`     |
| Text             | `text-foreground`                        | `text-black`, `text-gray-900` |
| Subtle Text      | `text-muted-foreground`                  | `text-gray-500`               |
| Primary Button   | `bg-primary text-primary-foreground`     | `bg-blue-500 text-white`      |
| Secondary Button | `bg-secondary text-secondary-foreground` | `bg-gray-200 text-gray-800`   |
| Borders          | `border-border`                          | `border-gray-200`             |
| Success Message  | `bg-primary/10 text-primary`             | `bg-green-100 text-green-700` |
| Error Message    | `bg-destructive/10 text-destructive`     | `bg-red-100 text-red-700`     |
| Card Background  | `bg-card text-card-foreground`           | `bg-white text-gray-900`      |

### Variable Opacity

You can use opacity modifiers with theme colors:

```jsx
<div className="bg-primary/10">10% opacity primary background</div>
<div className="text-primary/80">80% opacity primary text</div>
```

## Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Check the design system components first** - many components like Button, Card, and Alert are already styled with theme variables
3. **Use semantic color names** based on purpose, not visual appearance:

   - `primary` for main brand color/actions
   - `destructive` for errors/delete actions
   - `muted` for subtle backgrounds/text

4. **Test in both themes** to ensure good contrast and readability

## Extending the Theme

To add new theme variables:

1. Add the variable in both light and dark sections of `globals.css`:

   ```css
   :root {
     /* existing variables */
     --new-color: #value;
   }

   .dark {
     /* existing variables */
     --new-color: #dark-value;
   }
   ```

2. Add it to the tailwind config:

   ```ts
   colors: {
     // existing colors
     newColor: "var(--new-color)",
   }
   ```

3. Use it in your components:
   ```jsx
   <div className="bg-newColor">Theme-aware!</div>
   ```

## Troubleshooting

If your theme colors aren't working:

1. Ensure the `ThemeProvider` wraps your application in `layout.tsx`
2. Check if you're using the correct class names (e.g., `bg-primary` not `bg-primary-color`)
3. Verify that your component is within the client-side rendered tree if using the theme toggle

## How Tailwind Config Gets Applied (Behind the Scenes)

You might wonder: "Where do we import `tailwind.config.ts`? How does it actually work?"

### The Build Process

1. **Automatic Discovery**: Next.js and Tailwind are configured to work together out of the box. During the build process, Tailwind automatically looks for a configuration file in your project root:

   - `tailwind.config.js`
   - `tailwind.config.ts`
   - `tailwind.config.mjs`
   - `tailwind.config.cjs`

2. **PostCSS Integration**: Tailwind runs as a [PostCSS](https://postcss.org/) plugin. In our project, this is configured in `postcss.config.mjs`:

   ```js
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```

3. **CSS Processing Pipeline**:
   - When you import `globals.css` in your application, Next.js processes it through its build system
   - The build system runs PostCSS with the Tailwind plugin
   - Tailwind reads your configuration file and generates the appropriate CSS
   - The final CSS (with all utility classes) is included in your application bundle

### How CSS Variables and Tailwind Connect

1. **CSS Variables Definition**: In `globals.css`, we define CSS variables (like `--primary: #3a7afe`)
2. **Tailwind Configuration Mapping**: In `tailwind.config.ts`, we map Tailwind utility classes to these variables:

   ```ts
   colors: {
     primary: "var(--primary)"
   }
   ```

3. **CSS Generation**: Tailwind generates CSS rules for all your configured colors:

   ```css
   /* Generated by Tailwind during build */
   .bg-primary {
     background-color: var(--primary);
   }
   .text-primary {
     color: var(--primary);
   }
   /* and so on for all utility classes */
   ```

4. **Dynamic Theme Switching**: When your theme provider toggles between light and dark mode:
   - It adds/removes the `.dark` class on the HTML element
   - This activates different CSS variable values (from `:root` vs `.dark`)
   - The utility classes continue to use the same CSS variables, but their values change
   - No JavaScript re-rendering is needed for the color changes

This is why the system is both performant and elegant - the theme switch only changes CSS classes and variables, not the actual structure of your components.
