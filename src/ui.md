# UI Development Guide

This document provides guidelines and best practices for creating UI components in our application.

## Project Structure

### App Router and Grouped Routes

- `/app/(auth)/` - Authentication-related pages (login, register, etc.)
  - Example: `/app/(auth)/login/page.tsx`
- `/app/(authenticated)/` - Pages that require user authentication
  - Example: `/app/(authenticated)/dashboard/page.tsx`
- `/app/(public)/` - Publicly accessible pages
  - Example: `/app/(public)/about/page.tsx`
- `/app/features/` - Feature-specific implementations
  - Example: `/app/features/chat/components/ChatWindow.tsx`
- `/app/api/` - API route handlers
  - Implementation should follow existing patterns in the codebase

### Component Organization

- `/components/` - Re-usable individual components
  - Example: `SignOutButton.tsx`, `EmailVerificationStatus.tsx`
- `/components/ui/` - Reusable UI primitives (buttons, inputs, cards)

## Component Structure

### Component Naming Conventions

- Use PascalCase for component files and function names
- Use descriptive names that reflect the component's purpose
- Suffix with the component type when applicable (e.g., `UserAvatar`, `ChatSidebar`)

## Styling Guidelines

### Tailwind CSS

- Use Tailwind classes directly in JSX for styling
- Follow the project's color scheme using Tailwind's theme variables:
  - Use `bg-primary`, `text-primary-foreground` for primary elements
  - Use `bg-muted`, `text-muted-foreground` for secondary/inactive elements
  - Use `bg-accent`, `text-accent-foreground` for highlighted elements

### Class Organization

- Group related classes together
- Use string templates for conditional classes
- For complex components, use `clsx` or `tailwind-merge` utilities:

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base classes here",
  conditional && "conditional classes",
  className
)}>
```

### Responsive Design

- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Mobile-first approach: start with mobile styling, then add responsive variants
- Consider navigation patterns for different screen sizes

## Component Implementation

### Props and TypeScript

- Always define proper TypeScript interfaces for component props
- Extend from HTML element props when appropriate:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}
```

- Use existing types and follow the established structure
- Use `React.ComponentProps<>` for extending existing components:

```typescript
interface MyComponentProps
  extends React.ComponentProps<typeof ExistingComponent> {
  // Additional props
}
```

### Importing Types

- Use `import type` for importing types to avoid bundling:

```typescript
import type { TMessage } from "@/types/chat"
import { TMessageRole } from "@/types/chat" // Import enum as a value
```

### Component Exports

- Export each component as a named export
- Use barrel exports (index.ts) for related component groups
- Avoid default exports to maintain consistency

## State Management

### Local Component State

- Use React hooks (`useState`, `useReducer`) for component-specific state
- Keep state as close as possible to where it's used
- Extract complex state logic into custom hooks

### Loading & Error States

- Always handle loading states with appropriate UI feedback:
  - Skeleton loaders for content
  - Spinner indicators for actions
  - Disabled states for buttons
- Provide meaningful error messages and recovery options
- Use error boundaries for catching rendering errors

## API Integration

### API Implementation

- All API routes should be implemented in `/app/api/`
- Follow existing API implementations for consistency
- Ensure proper error handling and response formatting
- Reference existing implementations when creating new endpoints

### API Consumption

- Always use axios instead of the native fetch API for all HTTP requests
- Use the utility functions in `/utils/api.ts` (fetchFromApi, postToApi, etc.) when possible
- For custom API calls, import and use the configured apiClient from `/utils/apiClient.ts`
- Maintain consistent error handling across API calls

## Accessibility

### Basic Requirements

- Ensure proper contrast ratios for text (WCAG AA compliance)
- Use semantic HTML elements (`button`, `nav`, `main`, etc.)
- Provide alternative text for images and icons
- Ensure keyboard navigability for all interactive elements

### ARIA Attributes

- Use ARIA attributes when native HTML semantics aren't sufficient
- Follow these principles:
  - Use native HTML elements when possible
  - Only add ARIA when necessary
  - Test with screen readers for verification

## Forms and Validation

### Form Components

- Group related form controls within a `form` element
- Use the `Label` component for form labels
- Implement consistent validation feedback:
  - Real-time validation when appropriate
  - Error messages below input fields
  - Form-level error summaries for complex forms

### Validation Patterns

- Implement client-side validation using Zod or similar
- Show validation errors inline with the relevant form control
- Use consistent styling for error states

## Icons and Visual Elements

### Icons

- Use Lucide React icons for consistent styling
- Set appropriate sizes based on context (e.g., `h-4 w-4` for small icons)
- Include accessible labels for icons used as interactive elements

### Images and Media

- Use responsive images with appropriate sizing
- Implement lazy loading for off-screen images
- Provide fallbacks for unavailable media

## Testing UI Components

### Component Testing

- Write tests for component rendering and behavior
- Test all interactive elements and state changes
- Verify accessibility properties

## Performance Considerations

### Rendering Optimization

- Use React's memoization features (`memo`, `useMemo`, `useCallback`)
- Implement virtualization for long lists
- Avoid unnecessary re-renders by optimizing state updates

## Example Component Structure

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { TData } from "@/types/data"

interface MyComponentProps {
  data: TData
  onAction: (id: string) => void
  variant?: "default" | "alternative"
}

export function MyComponent({
  data,
  onAction,
  variant = "default",
  ...props
}: MyComponentProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Component implementation
}
```
