# Detailed Design Document
## Beacon & Ledger Cashflow Builder

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Awaiting Approval  
**Based on:** PRD.md v1.0, DESIGN_REQUIREMENTS.md v1.0

---

## 1. Design System

### 1.1 Color System

```css
/* Primary Colors */
--color-navy: #15213C;        /* Headers, primary buttons */
--color-aqua: #53E9C5;        /* Accents, CTAs, highlights */
--color-slate: #5C6478;       /* Secondary text, borders */
--color-white: #FFFFFF;       /* Backgrounds, cards */
--color-red: #E85C5C;         /* Errors, negative values */
--color-green: #10B981;       /* Success, positive values */

/* Semantic Colors */
--color-bg-primary: var(--color-white);
--color-bg-secondary: #F8F9FA;
--color-bg-header: var(--color-navy);
--color-text-primary: #1F2937;
--color-text-secondary: var(--color-slate);
--color-border: #E5E7EB;
--color-border-focus: var(--color-aqua);
```

### 1.2 Typography Scale

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 1.3 Spacing System

```css
/* Base unit: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 1.4 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

### 1.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 2. Screen Layouts

### 2.1 Homepage / Landing Page

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  HEADER (Navy)                          │
│  [Logo]  Navigation                     │
├─────────────────────────────────────────┤
│                                         │
│  HERO SECTION                           │
│  ┌─────────────────────────────────┐   │
│  │  Cashflow Builder               │   │
│  │  Build accurate forecasts...     │   │
│  │  [Create Profile Button]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  JOURNEY STEPS                          │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  1   │→ │  2   │→ │  3   │         │
│  │Profile│  │Build │  │Export│         │
│  └──────┘  └──────┘  └──────┘         │
│                                         │
│  RECENT PROFILES (if any)              │
│  ┌─────────────────────────────────┐   │
│  │  Profile Card 1                 │   │
│  │  Profile Card 2                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Component Specifications:**
- **Header:** Fixed top, navy background, white text, 64px height
- **Hero:** Centered, max-width 800px, padding 48px vertical
- **Journey Steps:** Horizontal cards, 3 columns on desktop, stacked on mobile
- **CTA Button:** Aqua background, white text, 48px height, rounded-lg

---

### 2.2 Business Profile Intake Form

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  HEADER                                 │
│  [Back]  Create Business Profile        │
├─────────────────────────────────────────┤
│                                         │
│  PROGRESS INDICATOR                     │
│  [●]────[○]────[○]────[○]              │
│   Step 1  Step 2  Step 3  Step 4       │
│                                         │
│  FORM CONTENT                           │
│  ┌─────────────────────────────────┐   │
│  │  Step Title                     │   │
│  │                                 │   │
│  │  [Input Field]                  │   │
│  │  [Input Field]                  │   │
│  │  [Input Field]                  │   │
│  │                                 │   │
│  │  [AI Generate Button] (optional)│   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  NAVIGATION                             │
│  [Back]              [Next / Save]     │
│                                         │
└─────────────────────────────────────────┘
```

**Step 1: Business Basics**
- Business Name (required, text input)
- Business URL (optional, text input with validation)
- Industry (required, select dropdown)
- AI Generate toggle/button

**Step 2: Business Details**
- Description (textarea, 4-6 rows)
- Headquarters (text input)
- Additional notes (textarea, optional)

**Step 3: Settings Configuration**
- Entity Type (radio: Limited Company / Sole Trader)
- Accounting Basis (toggle: Accrual / Cash)
- VAT Section:
  - VAT Enabled (toggle)
  - VAT Basis (conditional: Accrual / Cash, only if enabled)
- Tax Toggles:
  - Corporation Tax (toggle, disabled if Sole Trader)
  - PAYE/NIC (toggle)
  - Dividends (toggle, disabled if Sole Trader)
- Working Capital (only if Accrual):
  - Debtor Days (number input, 0-365)
  - Creditor Days (number input, 0-365)
- Dividend Settings (only if Dividends enabled):
  - Director Salary (currency input)
  - Payout Ratio (slider 0-100% or number 0-1)

**Step 4: Collaboration Notes**
- Notes (textarea, unlimited, optional)

**Component Specifications:**
- **Progress Indicator:** Horizontal stepper, active step highlighted in aqua
- **Form Fields:** Label above, input below, error message below input
- **Validation:** Real-time, red border + error text on invalid
- **Navigation:** Fixed bottom bar or inline buttons

---

### 2.3 Dashboard / Cashflow Workspace

**Layout Structure:**
```
┌──────┬──────────────────────────────────┐
│      │  TOP NAV                          │
│ SIDE │  [Profile Name]  [Export] [Pres] │
│ BAR  ├──────────────────────────────────┤
│      │                                  │
│ [Home│  HORIZON SELECTOR                │
│ [Prof│  [1 Y] [3 Y] [5 Y] [10 Y]        │
│ [Dash│                                  │
│      │  METRICS PANEL                   │
│      │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│      │  │ARR │ │GM% │ │Burn│ │Run │    │
│      │  └────┘ └────┘ └────┘ └────┘    │
│      │                                  │
│      │  CASHFLOW GRID (AG Grid)         │
│      │  ┌────────────────────────────┐   │
│      │  │ Line Item │ M1 │ M2 │ ... │   │
│      │  │ Revenue   │    │    │     │   │
│      │  │ COGS      │    │    │     │   │
│      │  │ ...       │    │    │     │   │
│      │  └────────────────────────────┘   │
│      │                                  │
│      │  SETTINGS PANEL (collapsible)    │
│      │  COLLABORATOR PANEL (collapsible)│
│      │                                  │
└──────┴──────────────────────────────────┘
```

**Component Specifications:**
- **Sidebar:** Fixed left, 240px width, navy background, white text, collapsible on mobile
- **Top Nav:** Fixed top, white background, 64px height, shadow-sm
- **Horizon Selector:** Toggle group, active state in aqua
- **Metrics Panel:** 4 cards in row, white background, slate border, rounded-xl
- **Cashflow Grid:** Full width, editable cells, sortable columns
- **Settings Panel:** Right drawer or collapsible section
- **Collaborator Panel:** Right drawer or collapsible section

---

### 2.4 Business Settings Form

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  SETTINGS                                │
├─────────────────────────────────────────┤
│                                         │
│  ENTITY TYPE                            │
│  ○ Limited Company  ○ Sole Trader     │
│                                         │
│  ACCOUNTING BASIS                       │
│  [Accrual] [Cash]                       │
│                                         │
│  VAT SETTINGS                           │
│  ┌─────────────────────────────────┐   │
│  │ ☑ VAT Enabled                   │   │
│  │   VAT Basis: [Accrual] [Cash]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  TAX SETTINGS                           │
│  ┌─────────────────────────────────┐   │
│  │ ☑ Corporation Tax               │   │
│  │ ☑ PAYE/NIC                      │   │
│  │ ☑ Dividends                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  WORKING CAPITAL (if Accrual)          │
│  Debtor Days:  [30] days                │
│  Creditor Days: [45] days               │
│                                         │
│  DIVIDEND SETTINGS (if enabled)        │
│  Director Salary: £[50,000]            │
│  Payout Ratio: [60]%                   │
│                                         │
│  [Save Settings]                       │
│                                         │
└─────────────────────────────────────────┘
```

**Component Specifications:**
- **Section Headers:** text-xl, font-semibold, slate-700, margin-bottom 16px
- **Toggle Switches:** Large, accessible, with description text
- **Conditional Fields:** Fade in/out with animation, disabled when not applicable
- **Number Inputs:** With increment/decrement buttons, validation
- **Save Button:** Aqua background, fixed bottom or inline

---

### 2.5 Event Tree / Event Management

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  EVENT TREE                              │
├─────────────────────────────────────────┤
│                                         │
│  [Add Event Button]                     │
│                                         │
│  EVENT TIMELINE                         │
│  ┌─────────────────────────────────┐   │
│  │ M1  M2  M3  M4  M5  M6  ...    │   │
│  │  │   │   │   │   │   │          │   │
│  │  │   💰  │   │   👤  │          │   │
│  │  │   │   │   │   │   │          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  EVENT LIST                             │
│  ┌─────────────────────────────────┐   │
│  │ 💰 Funding Round                │   │
│  │    Month 2 | +£50,000           │   │
│  │    [Edit] [Delete]              │   │
│  ├─────────────────────────────────┤   │
│  │ 👤 Hire Senior Developer        │   │
│  │    Month 5 | +£3,000/mo         │   │
│  │    [Edit] [Delete]              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Event Creation Modal:**
```
┌─────────────────────────────────────────┐
│  Create Event                    [×]   │
├─────────────────────────────────────────┤
│                                         │
│  Event Name: [________________]         │
│                                         │
│  Event Type:                            │
│  ○ Funding  ○ Hire  ○ Client Win       │
│  ○ Price Increase                       │
│                                         │
│  Event Month: [Month 2]                 │
│                                         │
│  Amount: £[50,000] (if funding/hire)    │
│  OR                                     │
│  Percent Change: [10]% (if price)       │
│  OR                                     │
│  Target: [revenue] (if client win)     │
│                                         │
│  [Cancel]  [Create Event]               │
│                                         │
└─────────────────────────────────────────┘
```

**Component Specifications:**
- **Timeline:** Horizontal scrollable, months as columns, events as markers
- **Event Cards:** Color-coded by type (funding=aqua, hire=slate, price=amber)
- **Modal:** Centered, max-width 500px, shadow-xl, rounded-xl

---

### 2.6 Presenter Mode

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  HEADER BAR (Fixed, Navy)                │
│  [Business Name] [Ltd] [Accrual]        │
│  [1Y] [3Y] [5Y] [10Y]                   │
│  [VAT] [CT] [PAYE] [Dividends]          │
│                              [Edit Mode]│
├─────────────────────────────────────────┤
│                                         │
│  METRIC CARDS                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │Net │ │Peak│ │BE  │ │Run │ │Rev │   │
│  │Cash│ │Neg │ │Mo  │ │way │ │Grw │   │
│  │£120│ │£-25│ │M8  │ │14mo│ │+68%│   │
│  └────┘ └────┘ └────┘ └────┘ └────┘   │
│                                         │
│  CHARTS SECTION                         │
│  ┌──────────────────┬─────────────────┐ │
│  │ Net Cashflow     │ Revenue/Expense │ │
│  │ [Line Chart]     │ [Stacked Bar]   │ │
│  └──────────────────┴─────────────────┘ │
│                                         │
│  EVENT TIMELINE                         │
│  ┌─────────────────────────────────┐   │
│  │ Timeline visualization          │   │
│  │ Event cards with details        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ASSUMPTIONS PANEL                      │
│  ┌─────────────────────────────────┐   │
│  │ ▼ Tax Rates                     │   │
│  │   VAT: 20%, CT: 19%, NIC: 13.8%│   │
│  ├─────────────────────────────────┤   │
│  │ ▼ Working Capital               │   │
│  │   Debtor: 30d, Creditor: 45d   │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  FOOTER BAR                             │
│  Disclaimer | Last Updated: ...         │
│  [Export to Excel]  [Back to Dashboard]│
└─────────────────────────────────────────┘
```

**Component Specifications:**
- **Header:** Fixed top, navy background, white text, 80px height, z-index high
- **Metric Cards:** 5 cards, white background, rounded-2xl, shadow-md, aqua accent line
- **Charts:** Responsive containers, Recharts, tooltips on hover
- **Event Timeline:** Horizontal scrollable, Framer Motion animations
- **Assumptions:** Accordion component, collapsible sections
- **Footer:** Fixed bottom or sticky, navy background, white text

---

### 2.7 AI Recommendations Panel

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  AI Recommendations            [Refresh] │
├─────────────────────────────────────────┤
│                                         │
│  REVENUE SUGGESTIONS                    │
│  ┌─────────────────────────────────┐   │
│  │ 💡 Subscription Revenue         │   │
│  │    Consider adding recurring... │   │
│  │    [Add to Model]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  EXPENSE SUGGESTIONS                    │
│  ┌─────────────────────────────────┐   │
│  │ 💡 Marketing Costs              │   │
│  │    Industry standard suggests...│   │
│  │    [Add to Model]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  SETTINGS SUGGESTIONS                   │
│  ┌─────────────────────────────────┐   │
│  │ 💡 Enable VAT                   │   │
│  │    Your revenue suggests...     │   │
│  │    [Apply]                      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Component Specifications:**
- **Panel:** Right drawer or collapsible section
- **Recommendation Cards:** White background, rounded-lg, shadow-sm, icon + text + action button
- **Categories:** Grouped with headers, expandable
- **Action Buttons:** Aqua background, small size

---

## 3. Component Library

### 3.1 Buttons

**Primary Button:**
- Background: Aqua (#53E9C5)
- Text: White
- Padding: 12px 24px
- Border radius: 8px
- Font: 16px, semibold
- Hover: Scale 1.02, shadow-md

**Secondary Button:**
- Background: Transparent
- Border: 2px slate
- Text: Slate
- Same padding/radius
- Hover: Background slate-50

**Danger Button:**
- Background: Red (#E85C5C)
- Text: White
- Same styling as primary

### 3.2 Input Fields

**Text Input:**
- Border: 1px slate-300
- Border radius: 8px
- Padding: 12px 16px
- Focus: Border aqua, ring-2 aqua-200
- Error: Border red, error text below

**Select Dropdown:**
- Same as text input
- Dropdown arrow on right
- Options: White background, hover slate-50

**Textarea:**
- Same as text input
- Min height: 100px
- Resizable vertical

### 3.3 Toggle Switches

**Toggle:**
- Width: 48px, Height: 24px
- Background: Slate-300 (off), Aqua (on)
- Thumb: White, 20px circle
- Transition: 200ms
- Label on right with description

### 3.4 Cards

**Metric Card:**
- Background: White
- Border: 1px slate-200
- Border radius: 16px
- Padding: 24px
- Shadow: shadow-md
- Aqua accent line: 3px height, full width top

**Content Card:**
- Same as metric card
- No accent line
- Padding: 32px

### 3.5 Badges

**Status Badge:**
- Background: Slate-100
- Text: Slate-700
- Padding: 4px 12px
- Border radius: 12px
- Font: 12px, medium

**Active Badge:**
- Background: Aqua
- Text: Navy
- Same styling

---

## 4. Responsive Breakpoints

### Mobile (< 640px)
- Single column layouts
- Stacked forms
- Collapsible sidebar (drawer)
- Full-width cards
- Simplified charts
- Bottom navigation for actions

### Tablet (640px - 1024px)
- Two-column where appropriate
- Side-by-side forms
- Collapsible sidebar (drawer)
- Medium-sized charts
- Horizontal metric cards (2-3 per row)

### Desktop (> 1024px)
- Full multi-column layouts
- Fixed sidebar
- Large charts
- All metric cards in row
- Side-by-side panels

---

## 5. Animation Specifications

### Page Transitions
- Duration: 200ms
- Easing: ease-in-out
- Effect: Fade in

### Modal/Drawer
- Duration: 300ms
- Easing: ease-out
- Effect: Slide up + fade

### Button Hover
- Duration: 150ms
- Effect: Scale 1.02

### List Items
- Stagger: 50ms
- Effect: Fade in + slide up

### Chart Updates
- Duration: 500ms
- Easing: ease-in-out
- Effect: Smooth transition

---

## 6. Accessibility Specifications

### Keyboard Navigation
- Tab order: Logical flow
- Focus indicators: 2px aqua outline
- Skip links: Available
- Escape: Closes modals

### Screen Readers
- ARIA labels on all interactive elements
- Form labels properly associated
- Error messages announced
- Status updates announced

### Color Contrast
- Text on white: Meets WCAG AA (4.5:1)
- Text on navy: Meets WCAG AA
- Aqua on white: Meets WCAG AA
- All interactive elements: Meets contrast requirements

---

## 7. Design Validation Checklist

- [ ] All screens have defined layouts
- [ ] All components have specifications
- [ ] Color system is consistent
- [ ] Typography scale is defined
- [ ] Spacing system is consistent
- [ ] Responsive breakpoints are defined
- [ ] Animation specifications are clear
- [ ] Accessibility requirements are met
- [ ] Brand identity is maintained
- [ ] User flows are logical

---

**Status:** Awaiting Approval

**Approved By:**
- [ ] Design Lead
- [ ] Product Owner
- [ ] Stakeholder

**Date:** ___________

---

## 8. Traceability

This design document traces to:
- **PRD Requirements:** All FR-* requirements
- **Design Requirements:** All sections from DESIGN_REQUIREMENTS.md
- **Implementation:** Will trace to user stories and tasks

