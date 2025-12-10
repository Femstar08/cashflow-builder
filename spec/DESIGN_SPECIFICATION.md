# Design Specification Document
## Beacon & Ledger Cashflow Builder

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Draft - Awaiting Approval  
**Based on PRD:** spec.md v1.0  
**Design System:** Beacon & Ledger Brand Guidelines

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Component Specifications](#2-component-specifications)
3. [Screen Layouts](#3-screen-layouts)
4. [User Flows](#4-user-flows)
5. [Interaction Patterns](#5-interaction-patterns)
6. [Responsive Design](#6-responsive-design)
7. [Accessibility](#7-accessibility)
8. [Animation Guidelines](#8-animation-guidelines)
9. [Technical Implementation Notes](#9-technical-implementation-notes)

---

## 1. Design System

### 1.1 Color Palette

| Color Name | Hex Code | Tailwind Class | Usage |
|------------|----------|----------------|-------|
| **Navy (Primary)** | #15213C | `bg-[#15213C]` | Headers, primary buttons, navigation bars, footer |
| **Aqua (Accent)** | #53E9C5 | `bg-[#53E9C5]` | CTAs, highlights, key metrics, chart lines, active states |
| **Slate (Secondary)** | #5C6478 | `text-[#5C6478]` | Labels, secondary text, borders, badges |
| **White (Background)** | #FFFFFF | `bg-white` | Cards, main content areas, button text |
| **Red (Danger)** | #E85C5C | `bg-[#E85C5C]` | Negative values, warnings, errors, delete actions |
| **Green (Success)** | #10B981 | `bg-[#10B981]` | Positive indicators, success states |
| **Slate Light** | #E2E8F0 | `border-slate-200` | Subtle borders, dividers |
| **Slate Dark** | #1E293B | `bg-slate-800` | Dark mode backgrounds |

**Color Usage Rules:**
- Navy: Use for primary navigation, headers, and key action buttons
- Aqua: Use sparingly for emphasis - CTAs, active states, key metrics
- Slate: Use for secondary information, labels, and non-critical text
- Red: Only for negative financial values, errors, and destructive actions
- White: Primary background for content cards and modals

### 1.2 Typography

**Font Family:**
- Primary: `Inter` (fallback: `system-ui, -apple-system, sans-serif`)
- Monospace: `'JetBrains Mono', 'Courier New', monospace` (for code/data)

**Type Scale:**

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 (Page Title) | 32px (2xl) | 700 (bold) | 1.2 | Page headers, main titles |
| H2 (Section Title) | 24px (xl) | 600 (semibold) | 1.3 | Section headers, card titles |
| H3 (Subsection) | 20px (lg) | 600 (semibold) | 1.4 | Subsection headers |
| Body Large | 18px (lg) | 400 (normal) | 1.6 | Important body text |
| Body | 16px (base) | 400 (normal) | 1.5 | Standard body text |
| Body Small | 14px (sm) | 400 (normal) | 1.5 | Secondary text, captions |
| Caption | 12px (xs) | 400 (normal) | 1.4 | Labels, timestamps |

**Text Colors:**
- Primary Text: `text-slate-900` (dark mode: `text-white`)
- Secondary Text: `text-slate-600` (dark mode: `text-slate-400`)
- Muted Text: `text-slate-500` (dark mode: `text-slate-500`)
- Accent Text: `text-[#53E9C5]`
- Error Text: `text-[#E85C5C]`

### 1.3 Spacing System

Based on 4px base unit (Tailwind default):

| Size | Value | Usage |
|------|-------|-------|
| xs | 4px (1) | Tight spacing, icon padding |
| sm | 8px (2) | Small gaps, compact layouts |
| md | 16px (4) | Standard gaps, form fields |
| lg | 24px (6) | Section spacing, card padding |
| xl | 32px (8) | Large sections, major gaps |
| 2xl | 48px (12) | Page sections, hero spacing |

**Component Padding:**
- Cards: `p-6` (24px)
- Buttons: `px-6 py-3` (horizontal 24px, vertical 12px)
- Inputs: `px-4 py-3` (horizontal 16px, vertical 12px)
- Containers: `px-6` (horizontal 24px)

### 1.4 Border Radius

| Size | Value | Usage |
|------|-------|-------|
| sm | 4px | Small elements, badges |
| md | 8px | Buttons, inputs, standard cards |
| lg | 12px | Large cards, modals |
| xl | 16px | Metric cards, presenter mode cards |
| 2xl | 24px | Extra large cards, hero sections |

### 1.5 Shadows

| Level | Value | Usage |
|-------|-------|-------|
| sm | `shadow-sm` | Subtle elevation, inputs |
| md | `shadow-md` | Cards, dropdowns |
| lg | `shadow-lg` | Modals, popovers |
| xl | `shadow-xl` | Large modals, drawers |

### 1.6 Icons

- **Library:** Lucide React (or similar)
- **Size:** 16px (sm), 20px (md), 24px (lg)
- **Color:** Inherit from parent text color, or use `text-slate-600`
- **Accent Icons:** Use `text-[#53E9C5]` for important actions

---

## 2. Component Specifications

### 2.1 Buttons

#### Primary Button
```tsx
// Aqua background, white text
className="bg-[#53E9C5] text-white font-semibold px-6 py-3 rounded-lg 
           hover:bg-[#45D9B3] active:scale-[0.98] transition-all 
           focus:outline-none focus:ring-2 focus:ring-[#53E9C5] focus:ring-offset-2"
```
- **Usage:** Primary CTAs, "Save", "Export", "Create Profile"
- **States:** Default, Hover, Active, Focus, Disabled
- **Sizes:** sm (h-8), md (h-10), lg (h-12)

#### Secondary Button
```tsx
// Transparent, slate border
className="bg-transparent border-2 border-slate-300 text-slate-700 
           font-semibold px-6 py-3 rounded-lg hover:bg-slate-50 
           active:scale-[0.98] transition-all"
```
- **Usage:** Secondary actions, "Cancel", "Back"
- **States:** Same as primary

#### Ghost Button
```tsx
// No border, subtle hover
className="bg-transparent text-slate-700 font-medium px-4 py-2 
           rounded-lg hover:bg-slate-100 active:scale-[0.98] transition-all"
```
- **Usage:** Tertiary actions, inline actions

#### Danger Button
```tsx
// Red background
className="bg-[#E85C5C] text-white font-semibold px-6 py-3 rounded-lg 
           hover:bg-[#D94A4A] active:scale-[0.98] transition-all"
```
- **Usage:** Delete, remove, destructive actions

### 2.2 Input Fields

#### Text Input
```tsx
className="w-full px-4 py-3 border border-slate-300 rounded-lg 
           focus:outline-none focus:ring-2 focus:ring-[#53E9C5] 
           focus:border-transparent transition-all 
           placeholder:text-slate-400"
```
- **States:** Default, Focus, Error (red border), Disabled
- **Error State:** Red border + error message below
- **Label:** Above input, `text-sm font-medium text-slate-700`

#### Select Dropdown
- Same styling as text input
- Custom dropdown arrow (chevron-down icon)
- Options: White background, hover state `bg-slate-50`

#### Textarea
- Same as text input
- Min height: `min-h-[100px]`
- Resizable: `resize-y`

#### Toggle Switch
```tsx
// Container
className="relative inline-flex h-6 w-11 items-center rounded-full 
           bg-slate-300 transition-colors focus:outline-none 
           focus:ring-2 focus:ring-[#53E9C5] focus:ring-offset-2"
// When checked
className="bg-[#53E9C5]"
// Thumb
className="inline-block h-5 w-5 transform rounded-full bg-white 
           transition-transform translate-x-1"
// When checked, thumb moves
className="translate-x-6"
```
- **Label:** Right side with description
- **States:** Off (slate), On (aqua), Disabled (grayed)

### 2.3 Cards

#### Metric Card
```tsx
className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md 
           hover:shadow-lg transition-shadow"
```
- **Structure:**
  - Aqua accent line: `h-1 bg-[#53E9C5] rounded-t-2xl -mt-6 -mx-6 mb-4`
  - Title: `text-sm font-medium text-slate-600 mb-2`
  - Value: `text-3xl font-bold text-slate-900`
  - Optional trend: Icon + percentage below value

#### Content Card
```tsx
className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
```
- **Header:** Optional title + actions
- **Body:** Content area
- **Footer:** Optional actions

### 2.4 Badges

#### Status Badge
```tsx
// Default (slate)
className="inline-flex items-center px-3 py-1 rounded-full 
           text-xs font-medium bg-slate-100 text-slate-700"

// Active (aqua)
className="bg-[#53E9C5]/10 text-[#53E9C5]"

// Entity Type (slate)
className="bg-slate-100 text-slate-700"

// Accounting Basis (aqua highlight)
className="bg-[#53E9C5]/20 text-[#53E9C5] border border-[#53E9C5]/30"
```

### 2.5 Data Grid (AG Grid)

**Styling:**
- Header: Navy background `#15213C`, white text
- Rows: Alternating `bg-white` and `bg-slate-50`
- Editable cells: Highlight on focus with aqua border
- Selected row: Aqua background tint
- Borders: `border-slate-200`

**Column Types:**
- Text: Left-aligned
- Numbers: Right-aligned, formatted with commas
- Currency: Right-aligned, `£` prefix, formatted

### 2.6 Charts (Recharts)

**Color Scheme:**
- Revenue: Aqua `#53E9C5`
- Expenses: Slate `#5C6478`
- Net Cash: Navy `#15213C`
- Negative Zone: Red `#E85C5C` with opacity
- Grid Lines: `#E2E8F0`

**Styling:**
- Background: White
- Border: `border-slate-200`
- Padding: `p-6`
- Responsive: Use `ResponsiveContainer`

**Tooltips:**
- White background, shadow-lg
- Border: `border-slate-200`
- Text: `text-slate-700`

---

## 3. Screen Layouts

### 3.1 Homepage / Landing

**Layout Structure:**
```
┌─────────────────────────────────────────────┐
│  NAVIGATION BAR (Navy #15213C)              │
│  Logo | Home | Profiles | Dashboard        │
├─────────────────────────────────────────────┤
│                                             │
│  HERO SECTION                               │
│  ┌─────────────────────────────────────┐   │
│  │  Title: "Build Professional        │   │
│  │         Cashflow Forecasts"         │   │
│  │  Subtitle: AI-powered, Excel-ready │   │
│  │  [Create Profile] (Aqua button)    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  JOURNEY STEPS                              │
│  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │  1   │→ │  2   │→ │  3   │             │
│  │Profile│  │Build │  │Export│             │
│  └──────┘  └──────┘  └──────┘             │
│                                             │
│  RECENT PROFILES (if any)                   │
│  ┌──────────┐ ┌──────────┐                 │
│  │ Profile  │ │ Profile  │                 │
│  │ Card     │ │ Card     │                 │
│  └──────────┘ └──────────┘                 │
│                                             │
└─────────────────────────────────────────────┘
```

**Component Specifications:**
- Hero: Centered, max-width 800px, padding `py-24`
- Journey Steps: Horizontal cards with arrows, `flex gap-6`
- Profile Cards: Grid layout, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### 3.2 Business Profile Intake Form

**Multi-Step Layout:**
```
┌─────────────────────────────────────────────┐
│  NAVIGATION                                  │
├─────────────────────────────────────────────┤
│  PROGRESS INDICATOR                          │
│  [Step 1] → [Step 2] → [Step 3]            │
├─────────────────────────────────────────────┤
│                                             │
│  STEP CONTENT (Centered, max-w-2xl)         │
│  ┌─────────────────────────────────────┐   │
│  │  Step Title                         │   │
│  │  Step Description                   │   │
│  │                                     │   │
│  │  [Form Fields]                     │   │
│  │                                     │   │
│  │  [Back] [Next / Save]              │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Step 1: Business Basics**
- Business name (text input)
- Business URL (text input, optional)
- Industry (select dropdown)
- Description (textarea, optional)
- AI generation toggle

**Step 2: Business Settings**
- Entity type (radio: Limited Company / Sole Trader)
- Accounting basis (toggle: Accrual / Cash)
- VAT settings (toggle + basis selector)
- Tax toggles (CT, PAYE/NIC, Dividends)
- Working capital inputs (debtor/creditor days)

**Step 3: Review & Edit**
- AI-generated fields displayed in cards
- Edit buttons for each section
- Notes field (textarea)
- [Save Profile] button

### 3.3 Dashboard / Cashflow Workspace

**Layout Structure:**
```
┌─────────────────────────────────────────────┐
│  NAVIGATION BAR                             │
│  Profile Name | [Presenter Mode] [Export]  │
├─────────────────────────────────────────────┤
│  METRICS ROW                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ARR │ │GM% │ │Burn│ │Run │ │EBIT│      │
│  └────┘ └────┘ └────┘ └────┘ └────┘      │
├─────────────────────────────────────────────┤
│  MAIN CONTENT AREA                          │
│  ┌──────────────────┐ ┌─────────────────┐  │
│  │                 │ │  AI SUGGESTIONS │  │
│  │  CASHFLOW GRID  │ │  Sidebar        │  │
│  │  (AG Grid)      │ │                 │  │
│  │                 │ │  [Recommendations│  │
│  │                 │ │   Cards]        │  │
│  └──────────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────┤
│  CHARTS SECTION                             │
│  ┌──────────────────┐ ┌─────────────────┐  │
│  │  Net Cashflow   │ │  Revenue vs     │  │
│  │  Line Chart     │ │  Expenses       │  │
│  └──────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────┘
```

**Component Specifications:**
- Metrics Row: 5 cards, responsive grid `grid-cols-1 md:grid-cols-3 lg:grid-cols-5`
- Cashflow Grid: Full width, scrollable, AG Grid component
- AI Sidebar: Collapsible drawer, width `w-80`, slides in from right
- Charts: Two-column grid on desktop, stacked on mobile

### 3.4 Business Settings Form

**Layout:**
```
┌─────────────────────────────────────────────┐
│  SETTINGS FORM (Card)                       │
│  ┌─────────────────────────────────────┐   │
│  │  Entity Type                        │   │
│  │  ○ Limited Company  ○ Sole Trader   │   │
│  │                                     │   │
│  │  Accounting Basis                  │   │
│  │  [Accrual] [Cash]                  │   │
│  │                                     │   │
│  │  VAT Settings                       │   │
│  │  [Enable VAT]                       │   │
│  │  Basis: [Accrual ▼] [Cash]         │   │
│  │                                     │   │
│  │  Tax Settings                       │   │
│  │  ☑ Corporation Tax                  │   │
│  │  ☑ PAYE/NIC                        │   │
│  │  ☑ Dividends                        │   │
│  │                                     │   │
│  │  Working Capital                   │   │
│  │  Debtor Days: [30]                 │   │
│  │  Creditor Days: [45]               │   │
│  │                                     │   │
│  │  [Save Settings]                   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Validation:**
- Real-time validation feedback
- Disabled states when conditions not met
- Help text below fields

### 3.5 Event Tree / Timeline

**Layout:**
```
┌─────────────────────────────────────────────┐
│  EVENT TIMELINE                              │
│  ┌─────────────────────────────────────┐   │
│  │  [+ Add Event] Button (Aqua)        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Timeline Visualization                     │
│  ────────────────────────────────────────  │
│  M1  M2  M3  M4  M5  M6  M7  M8  ...       │
│      │   │       │   │                    │
│      💰  👤      📈  💰                    │
│      │   │       │   │                    │
│  ┌───┴───┴───┐ ┌───┴───┐                │
│  │ Funding    │ │ Hire   │                │
│  │ £50k       │ │ +£3k/mo│                │
│  └───────────┘ └────────┘                 │
│                                             │
└─────────────────────────────────────────────┘
```

**Event Card:**
- Icon (color-coded by type)
- Event name
- Month tag
- Impact description
- Hover: Tooltip with full details
- Click: Edit/Delete options

### 3.6 Presenter Mode (Detailed)

**Full Layout:**
```
┌─────────────────────────────────────────────┐
│  HEADER BAR (Navy #15213C, Fixed Top)       │
│  ┌───────────────────────────────────────┐   │
│  │ Business Name (text-xl, bold)       │   │
│  │ [Ltd] [Accrual Basis]               │   │
│  │ [1Y] [3Y] [5Y] [10Y]                │   │
│  │ [VAT] [CT] [PAYE] [Div]             │   │
│  │                          [Edit Mode]│   │
│  └───────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  METRIC CARDS ROW                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Net  │ │ Peak │ │ Break│ │ Run- │      │
│  │ Cash │ │ Neg  │ │ Even │ │ way  │      │
│  │£120k │ │-£25k │ │ M8   │ │ 14mo │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│  ┌──────┐                                  │
│  │ Rev  │                                  │
│  │Growth│                                  │
│  │ +68% │                                  │
│  └──────┘                                  │
├─────────────────────────────────────────────┤
│  CHARTS SECTION                              │
│  ┌──────────────────┐ ┌─────────────────┐  │
│  │  Net Cashflow    │ │  Revenue &      │  │
│  │  Line Chart      │ │  Expenses       │  │
│  │  (with negative  │ │  Stacked Bar    │  │
│  │   zones)         │ │                 │  │
│  └──────────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────┤
│  EVENT TIMELINE & ASSUMPTIONS                │
│  ┌──────────────────┐ ┌─────────────────┐  │
│  │  Event Timeline  │ │  Assumptions     │  │
│  │  (Visual)         │ │  Panel           │  │
│  │                   │ │  (Collapsible)   │  │
│  └──────────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────┤
│  FOOTER BAR                                  │
│  ┌───────────────────────────────────────┐ │
│  │ Disclaimer | Last Updated | [Export]  │ │
│  │ [Back to Dashboard]                   │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Header Bar Specifications:**
- Background: `bg-[#15213C]`
- Text: `text-white`
- Padding: `px-6 py-4`
- Fixed position: `fixed top-0 left-0 right-0 z-50`
- Content: Flex layout, space-between

**Metric Cards:**
- Grid: `grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6`
- Card: White background, rounded-2xl, shadow-md
- Aqua accent line: `h-1 bg-[#53E9C5]` at top
- Title: `text-sm font-medium text-slate-600`
- Value: `text-3xl font-bold text-slate-900`

**Charts:**
- Grid: `grid-cols-1 lg:grid-cols-2 gap-6`
- Container: White background, rounded-xl, padding `p-6`
- Responsive: Use `ResponsiveContainer` from Recharts

**Event Timeline:**
- Horizontal scrollable timeline
- Event cards with icons and colors
- Framer Motion fade-in animations
- Hover tooltips

**Assumptions Panel:**
- Collapsible accordion (shadcn/ui)
- Sections: Tax rates, Working capital, Growth rates
- White background, rounded-lg

**Footer:**
- Background: `bg-slate-50`
- Padding: `px-6 py-4`
- Flex layout: space-between items-center
- Export button: Large aqua button
- Back button: Outline secondary

---

## 4. User Flows

### 4.1 Creating a Business Profile

```
1. Homepage
   ↓ Click "Create Profile"
2. Step 1: Business Basics
   - Enter business name
   - (Optional) Enter URL
   - Select industry
   - Toggle AI generation
   ↓ Click "Next"
3. Step 2: Business Settings
   - Select entity type
   - Select accounting basis
   - Configure VAT
   - Configure taxes
   - Set working capital
   ↓ Click "Next"
4. Step 3: Review & Edit
   - Review AI-generated fields
   - Edit as needed
   - Add notes
   ↓ Click "Save Profile"
5. Redirect to Dashboard
```

### 4.2 Building a Cashflow

```
1. Dashboard
   ↓ Click "Add Line Item"
2. Line Item Form
   - Enter name
   - Select type (revenue/expense)
   - Enter monthly values
   ↓ Click "Save"
3. Grid Updates
   - Line item appears in grid
   - Metrics recalculate
   - Charts update
4. (Optional) Add Events
   ↓ Click "Add Event"
5. Event Form
   - Select event type
   - Enter month
   - Enter amount/percentage
   ↓ Click "Save"
6. Forecast Recalculates
```

### 4.3 Entering Presenter Mode

```
1. Dashboard
   ↓ Click "Presenter Mode" button
2. Presenter Mode Opens
   - Full-screen layout
   - All edit controls hidden
   - Charts and metrics displayed
3. User Can:
   - Change forecast horizon (1Y/3Y/5Y/10Y)
   - View event timeline
   - View assumptions
   - Export to Excel
   ↓ Click "Edit Mode"
4. Return to Dashboard
```

---

## 5. Interaction Patterns

### 5.1 Form Interactions

**Progressive Disclosure:**
- Multi-step forms reveal one step at a time
- Progress indicator shows current step
- "Back" button available (except step 1)
- Validation on "Next" click

**Inline Validation:**
- Real-time validation on blur
- Error messages appear below fields
- Success state (green checkmark) on valid input
- Disabled submit until all required fields valid

**Auto-save:**
- Profile drafts auto-save every 30 seconds
- Line item edits auto-save on blur
- Settings auto-save on change

### 5.2 Data Grid Interactions

**Editing:**
- Click cell to edit
- Enter to save, Escape to cancel
- Tab to move to next cell
- Arrow keys to navigate

**Selection:**
- Click row to select
- Ctrl/Cmd+Click for multi-select
- Selected rows highlighted with aqua tint

**Bulk Operations:**
- Select multiple rows
- Context menu: Delete, Duplicate, Export

### 5.3 Chart Interactions

**Hover:**
- Show tooltip with exact values
- Highlight corresponding data point
- Crosshair on line charts

**Click:**
- (Future) Drill down to monthly detail

**Zoom:**
- (Future) Pan and zoom on large datasets

### 5.4 Modal/Drawer Interactions

**Opening:**
- Fade in + slide up animation (300ms)
- Backdrop: `bg-black/50` with blur
- Focus trap inside modal

**Closing:**
- Click backdrop to close
- Escape key to close
- Close button (X) in top-right
- Slide down + fade out animation

---

## 6. Responsive Design

### 6.1 Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 640px | Single column, stacked layout |
| Tablet | 640px - 1024px | Two columns where appropriate |
| Desktop | > 1024px | Full multi-column layout |
| Large Desktop | > 1280px | Maximum content width |

### 6.2 Mobile Adaptations

**Navigation:**
- Hamburger menu instead of full nav
- Bottom sheet for modals
- Swipe gestures for drawers

**Forms:**
- Full-width inputs
- Stacked form fields
- Bottom-fixed action buttons

**Charts:**
- Single column
- Simplified tooltips
- Touch-friendly interactions

**Grid:**
- Horizontal scroll
- Sticky first column
- Simplified column headers

### 6.3 Tablet Adaptations

**Layout:**
- Two-column grids
- Side-by-side forms
- Medium-sized charts

**Navigation:**
- Collapsible sidebar
- Top navigation bar

### 6.4 Desktop Optimizations

**Layout:**
- Multi-column grids (3-5 columns)
- Side-by-side panels
- Large charts with full detail

**Interactions:**
- Hover states
- Keyboard shortcuts
- Right-click context menus

---

## 7. Accessibility

### 7.1 WCAG 2.1 Level AA Compliance

**Color Contrast:**
- Text on white: Minimum 4.5:1
- Text on navy: Minimum 4.5:1
- Interactive elements: Minimum 3:1

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Tab order logical and intuitive
- Focus indicators visible (aqua ring)
- Skip links for main content

**Screen Readers:**
- Semantic HTML (headings, landmarks)
- ARIA labels for icons and buttons
- Form labels properly associated
- Error messages announced
- Live regions for dynamic content

**Visual:**
- Color not sole indicator of state
- Icons have text labels or aria-labels
- Charts have text alternatives
- Focus indicators visible

### 7.2 Specific Requirements

**Forms:**
- All inputs have associated labels
- Error messages linked to inputs via `aria-describedby`
- Required fields marked with asterisk + aria-required

**Buttons:**
- Descriptive text (not just "Click here")
- Loading states announced
- Disabled state communicated

**Charts:**
- Data tables available as alternative
- Chart titles and descriptions
- Axis labels clearly marked

---

## 8. Animation Guidelines

### 8.1 Principles

- **Purposeful:** Animations should enhance understanding, not distract
- **Performance:** Use CSS transforms and opacity for smooth 60fps
- **Respectful:** Honor `prefers-reduced-motion` media query
- **Consistent:** Use same timing and easing across similar elements

### 8.2 Timing Functions

- **Ease-out:** Default for most animations (`ease-out`)
- **Ease-in-out:** For state changes (`ease-in-out`)
- **Linear:** For progress indicators

### 8.3 Specific Animations

**Page Transitions:**
- Duration: 200ms
- Effect: Fade in
- Implementation: Framer Motion `fadeIn`

**Modal Appearance:**
- Duration: 300ms
- Effect: Slide up + fade
- Implementation: Framer Motion `slideUp`

**Button Hover:**
- Duration: 150ms
- Effect: Scale 1.02
- Implementation: CSS `transform: scale(1.02)`

**Chart Updates:**
- Duration: 500ms
- Effect: Smooth transition
- Implementation: Recharts `animationDuration`

**Event Timeline:**
- Duration: 300ms per item
- Effect: Fade in with stagger
- Implementation: Framer Motion `staggerChildren`

**Loading States:**
- Skeleton screens: Pulse animation
- Spinners: Rotate animation (1s linear infinite)

### 8.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Technical Implementation Notes

### 9.1 Component Architecture

**Structure:**
```
src/
  components/
    ui/              # Base components (Button, Card, Input)
    profile/         # Profile-related components
    cashflow/        # Cashflow-related components
    dashboard/       # Dashboard components
    presenter/       # Presenter mode components
    events/          # Event tree components
```

**Component Patterns:**
- Use `forwardRef` for form components
- Use `React.memo` for expensive components
- Extract logic to custom hooks
- Use TypeScript for type safety

### 9.2 State Management

**Client State:**
- React state for UI state
- Zustand for global app state
- TanStack Query for server state

**Server State:**
- Server actions for mutations
- API routes for data fetching
- InstantDB for persistence

### 9.3 Styling Approach

**Tailwind CSS:**
- Utility-first approach
- Custom colors in `tailwind.config.js`
- Component classes in separate files if needed

**Custom Styles:**
- Global styles in `globals.css`
- Component-specific styles inline with Tailwind
- Avoid CSS modules (use Tailwind)

### 9.4 Performance Considerations

**Code Splitting:**
- Dynamic imports for heavy components (charts, grid)
- Route-based code splitting (Next.js automatic)

**Optimization:**
- Lazy load charts
- Virtualize long lists
- Debounce search inputs
- Memoize expensive calculations

**Bundle Size:**
- Tree-shake unused code
- Use smaller chart libraries if possible
- Lazy load AG Grid

---

## 10. Design Approval Checklist

- [ ] Color palette approved
- [ ] Typography system approved
- [ ] Component specifications approved
- [ ] Screen layouts approved
- [ ] User flows validated
- [ ] Interaction patterns approved
- [ ] Responsive design approach approved
- [ ] Accessibility requirements approved
- [ ] Animation guidelines approved
- [ ] Technical implementation approach approved

---

## Next Steps

1. **Review this design specification**
2. **Provide feedback and approval**
3. **Create detailed user stories** (next phase)
4. **Begin implementation** (one user story at a time)

---

**Document Status:** Draft - Awaiting Approval  
**Last Updated:** 2025-01-27  
**Version:** 1.0

