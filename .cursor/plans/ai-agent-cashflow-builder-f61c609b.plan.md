<!-- f61c609b-8c99-4404-91f7-84341bc98f72 7bb1c4c8-a18b-4c85-8cb8-8d8c9862f3d1 -->
# Beacon & Ledger Design System Implementation Plan

## Overview

Apply the complete Beacon & Ledger design system to transform the Cashflow Builder into a professional, calm, and trustworthy UK advisory tool. This includes updating colors, typography, spacing, components, and layouts across the entire application.

## 1. Design System Foundation

### 1.1 Update Global Styles (`src/app/globals.css`)

- Remove playful animations (float, pulse-glow) or make them subtle
- Update color variables to match exact Beacon & Ledger palette
- Set typography to Inter font family
- Define consistent spacing scale (16px/24px grid)
- Update border radius values (8px-12px for cards)
- Remove gradient backgrounds, use clean white/slate backgrounds
- Set base text color to Slate (#5C6478)

### 1.2 Typography System

- Ensure Inter font is loaded (check `src/app/layout.tsx`)
- Define typography scale:
- H1: Navy (#15213C), bold, 24-32px
- H2: Navy (#15213C), semibold, 20-24px
- Body: Slate (#5C6478), 14-16px
- Caption: Slate (#5C6478), 12-14px

## 2. Core Component Updates

### 2.1 Button Component (`src/components/ui/button.tsx`)

- Primary: Aqua background (#53E9C5), Navy text (#15213C)
- Secondary: Navy outline, Navy text
- Disabled: Pale slate background
- Update hover states to be subtle
- Remove dark mode variants, use consistent light theme

### 2.2 Card Component (`src/components/ui/card.tsx`)

- White background (#FFFFFF)
- Soft shadow (subtle, not heavy)
- 12px rounded corners
- Thin slate border (1px #E1E4EA or similar)
- Navy headings (#15213C)
- Slate text for descriptions (#5C6478)
- Consistent padding (p-6)

### 2.3 Toggle Component (`src/components/ui/toggle.tsx`)

- Rounded pill toggles
- Aqua (#53E9C5) for "on" state
- Slate (#5C6478) for "off" state
- Smooth slide animation (subtle)

### 2.4 Segment Control (`src/components/ui/segment-control.tsx`)

- For 1Y/3Y/5Y/10Y period selector
- Aqua underline for active state
- Navy text
- Clean, minimal design

## 3. Screen Layout Updates

### 3.1 Homepage (`src/app/page.tsx`)

- Remove excessive gradients and playful elements
- Use clean white background with Navy accents
- Update hero section: Navy background, white text, Aqua CTA
- Journey steps: Clean cards with Navy headings, Slate descriptions
- Remove floating animations or make very subtle
- Update button styles to match design system

### 3.2 Dashboard Layout (`src/components/dashboard/enhanced-dashboard.tsx`)

- Implement two-pane structure:
- Left panel: Settings, tax toggles, revenue/expense inputs, working capital
- Right panel: Charts, metrics, forecast output
- Fixed header bar with business summary and period selector
- Clear grouping of related settings
- Consistent 16px/24px spacing
- Navy headings throughout
- Aqua highlights only for CTAs and active states

### 3.3 Profile Creation (`src/components/profile/guided-profile-wizard.tsx`, `src/components/profile/profile-intake-form.tsx`)

- Clean, structured layout
- White cards with slate borders
- Navy headings
- Chip-style selectors for entity type
- Modular toggles for tax settings
- Professional, accountant-friendly tone

### 3.4 Presenter Mode (`src/components/presenter/presenter-mode.tsx`)

- Full-screen, minimal controls
- Large charts with clean styling
- Bold metric cards
- Event timeline at bottom
- Aqua accents on key numbers
- Premium, professional aesthetic

## 4. Chart and Visualization Updates

### 4.1 Cashflow Chart (`src/components/dashboard/cashflow-chart.tsx`)

- Clean line charts
- Aqua (#53E9C5) for positive values
- Navy (#15213C) for net cash line
- Red (#E85C5C) with opacity for negative zones
- Minimal axis labels
- Simple, uncluttered tooltips
- White background
- Slate grid lines (#E2E8F0)

### 4.2 Revenue/Expense Charts

- Aqua for revenue
- Slate for expenses
- Clean bar charts
- Minimal styling

### 4.3 Metrics Bar (`src/components/dashboard/metrics-bar.tsx`)

- Clean metric cards
- Navy headings
- Aqua for key positive metrics
- Red for negative metrics
- White background, subtle borders

## 5. Form and Input Components

### 5.1 Business Settings Form (`src/components/profile/business-settings-form.tsx`)

- Clean form layout
- Navy labels
- Slate helper text
- Aqua focus states
- White input backgrounds
- Slate borders

### 5.2 Revenue/Expense Panels (`src/components/cashflow/revenue-expense-panels.tsx`)

- Side-by-side panels
- Clear visual separation
- Aqua for revenue panel accent
- Slate for expense panel
- Clean "Add" buttons with Aqua background

## 6. Navigation and Layout

### 6.1 Top Navigation (`src/components/layout/top-nav.tsx`)

- Navy background (#15213C)
- White text
- Clean, minimal design
- Aqua for active states

### 6.2 Sidebar (`src/components/layout/sidebar.tsx`)

- Slate text
- Navy for active items
- Clean, structured

### 6.3 App Shell (`src/components/layout/app-shell.tsx`)

- Light background (white or very light slate)
- Consistent spacing
- Two-pane structure where applicable

## 7. Event Tree and Special Components

### 7.1 Event Tree (`src/components/events/event-tree.tsx`)

- Clean event cards
- Simple icons (outline style, slate colored)
- Funding: upward arrow or money icon
- Hire: person plus icon
- Price increase: trending arrow
- Client win: handshake/contract icon
- Minimal, professional styling

### 7.2 AI Chat Panel (`src/components/ai/ai-chat-panel.tsx`)

- Clean chat interface
- Navy headings
- Slate text
- Aqua for AI messages accent
- White background

### 7.3 Agent Chat (`src/components/agent/agent-chat.tsx`)

- Professional chat interface
- Navy header
- Clean message bubbles
- Aqua accents for agent

## 8. Color Consistency Audit

### 8.1 Replace All Color References

- Search for hardcoded colors and replace with design system colors
- Update all `bg-neutral-*` to appropriate Beacon colors
- Update all `text-neutral-*` to Navy or Slate
- Ensure Aqua is used sparingly (CTAs, highlights, active states only)
- Red (#E85C5C) only for negative cash values

### 8.2 Remove Dark Mode Inconsistencies

- Standardize on light theme (professional UK advisory aesthetic)
- Remove dark mode variants where they conflict with design system

## 9. Spacing and Layout Consistency

### 9.1 Spacing Updates

- Use 16px/24px grid consistently
- Card padding: p-6 (24px)
- Section spacing: space-y-6 (24px)
- Component gaps: gap-4 (16px) or gap-6 (24px)

### 9.2 Border Radius

- Cards: 12px (rounded-xl)
- Buttons: 8px (rounded-lg)
- Inputs: 8px (rounded-lg)
- Small elements: 4px (rounded)

## 10. Animation and Interaction Updates

### 10.1 Remove Excessive Animations

- Remove or tone down floating animations
- Remove pulse-glow effects
- Keep subtle hover elevations on cards
- Keep smooth toggle transitions
- Keep chart transitions (minimal)
- Panel fade-ins (subtle)

### 10.2 Micro-interactions

- Cards: slight elevation on hover (subtle shadow increase)
- Buttons: subtle color transition
- Toggles: smooth slide animation
- Nothing playful - everything intentional and calm

## 11. Typography Updates Throughout

### 11.1 Headings

- All H1: Navy (#15213C), bold, 24-32px
- All H2: Navy (#15213C), semibold, 20-24px
- All H3: Navy (#15213C), semibold, 18-20px

### 11.2 Body Text

- Primary text: Slate (#5C6478), 14-16px
- Captions: Slate (#5C6478), 12-14px
- Labels: Slate (#5C6478), 14px

## 12. Accessibility and Professionalism

### 12.1 Contrast Checks

- Ensure WCAG AA contrast for all text
- Navy on white: sufficient
- Slate on white: verify contrast
- Aqua on Navy: verify contrast

### 12.2 Information Visibility

- Never hide critical information behind hover-only
- Clear headings for all financial sections
- Avoid jargon unless accounting-relevant

## Implementation Order

1. **Foundation** (globals.css, typography, colors)
2. **Core Components** (Button, Card, Toggle, Segment Control)
3. **Layout Components** (App Shell, Navigation, Sidebar)
4. **Dashboard** (Two-pane layout, charts, metrics)
5. **Forms** (Profile creation, settings)
6. **Special Components** (Event tree, AI panels)
7. **Homepage** (Clean up playful elements)
8. **Presenter Mode** (Premium styling)
9. **Color Audit** (Replace all hardcoded colors)
10. **Final Polish** (Spacing, animations, accessibility)

## Files to Update

### Core Design System

- `src/app/globals.css` - Design tokens, animations
- `src/app/layout.tsx` - Font loading

### UI Components

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/toggle.tsx`
- `src/components/ui/segment-control.tsx`

### Layout Components

- `src/components/layout/app-shell.tsx`
- `src/components/layout/top-nav.tsx`
- `src/components/layout/sidebar.tsx`

### Dashboard Components

- `src/components/dashboard/enhanced-dashboard.tsx`
- `src/components/dashboard/cashflow-chart.tsx`
- `src/components/dashboard/metrics-bar.tsx`
- `src/components/cashflow/revenue-expense-panels.tsx`
- `src/components/cashflow/cashflow-grid.tsx`

### Profile Components

- `src/components/profile/guided-profile-wizard.tsx`
- `src/components/profile/profile-intake-form.tsx`
- `src/components/profile/business-settings-form.tsx`

### Special Components

- `src/components/presenter/presenter-mode.tsx`
- `src/components/events/event-tree.tsx`
- `src/components/ai/ai-chat-panel.tsx`
- `src/components/agent/agent-chat.tsx`
- `src/components/agent/floating-agent-bubble.tsx`

### Pages

- `src/app/page.tsx` - Homepage

## Success Criteria

- All components use Beacon & Ledger color palette consistently
- Typography follows Inter font with specified sizes
- Spacing uses 16px/24px grid consistently
- Two-pane layout implemented for dashboard
- Playful elements removed or toned down significantly
- Professional, calm, trustworthy aesthetic throughout
- WCAG AA contrast maintained
- Clean, minimal, accountant-friendly interface

### To-dos

- [x] Fix working capital calculations in enhanced-calculations.ts - ensure debtor/creditor days properly shift cash timing
- [x] Update dashboard components to use buildEnhancedForecast instead of buildSeries (CashflowChart, MetricsBar)
- [x] Enhance Excel export formulas - add proper VAT, CT, PAYE/NIC, Dividend, and working capital formulas
- [x] Update AI recommendations to return structured suggestions per PRD spec (suggested_revenue_items, suggested_expense_items, etc.)
- [x] Complete internal-only access control - add proper authentication checks and disable public routes
- [x] Update README with Phase 2 features documentation
- [x] Add JSDoc comments to forecast engine functions
- [x] Create agent prompt system with comprehensive prompt structure (src/lib/ai/agent-prompt.ts)
- [x] Build agent API route for conversational interactions (src/app/api/agent/chat/route.ts)
- [x] Create agent chat UI component with conversation interface (src/components/agent/agent-chat.tsx)
- [x] Implement agent state management for conversation and profile building (src/stores/agent-store.ts)
- [x] Build profile generation integration to save agent-created profiles (src/app/api/agent/generate-profile/route.ts)
- [x] Create agent landing page/route for user entry point (src/app/agent/page.tsx)
- [x] Add structured data parsing to extract business profile and assumptions from agent responses
- [x] Integrate agent with existing profile creation flow and InstantDB