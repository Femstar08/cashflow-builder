# Design Requirements Document
## Beacon & Ledger Cashflow Builder

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Awaiting Design Input  
**Based on PRD:** PRD.md v1.0

---

## 1. Design Scope

This document outlines the design requirements for the Beacon & Ledger Cashflow Builder, covering:
- User interface layouts
- Component designs
- Visual design system
- Interaction patterns
- Responsive breakpoints
- Accessibility requirements

---

## 2. Brand Identity

### 2.1 Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Navy (Primary) | #15213C | Headers, primary buttons, navigation |
| Aqua (Accent) | #53E9C5 | Highlights, CTAs, key metrics, charts |
| Slate (Secondary) | #5C6478 | Labels, secondary text, borders |
| White (Background) | #FFFFFF | Cards, main content areas |
| Red (Danger) | #E85C5C | Negative values, warnings, errors |
| Green (Success) | #10B981 | Positive indicators (if needed) |

### 2.2 Typography

- **Primary Font:** Inter or Outfit
- **Base Text:** `text-slate-700`
- **Headings:** `text-2xl font-semibold` (h1), `text-xl font-semibold` (h2)
- **Body:** `text-base` (16px)
- **Small Text:** `text-sm` (14px)

### 2.3 Spacing System

- Use Tailwind spacing scale (4px base unit)
- Consistent padding: `p-6` for cards, `px-6` for containers
- Section spacing: `space-y-6` for vertical rhythm

---

## 3. Key Screens Requiring Design

### 3.1 Homepage / Landing
- **Purpose:** Entry point, guided journey introduction
- **Elements:**
  - Hero section with value proposition
  - "Create Profile" CTA
  - Journey steps: Profile → Cashflow → Export
  - Quick access to existing profiles

### 3.2 Business Profile Intake Form
- **Purpose:** Multi-step form for business profile creation
- **Steps:**
  1. Business basics (name, URL, industry)
  2. Business details (description, headquarters)
  3. Settings configuration (entity type, accounting basis, tax toggles)
  4. Collaboration notes
- **Design Requirements:**
  - Progress indicator
  - Step navigation (back/next)
  - AI generation toggle/button
  - Form validation feedback

### 3.3 Dashboard / Cashflow Workspace
- **Purpose:** Main working area for building forecasts
- **Layout:**
  - Sidebar navigation
  - Top navigation bar
  - Main content area with:
    - Cashflow grid (AG Grid)
    - Metrics panel
    - Settings panel
    - Collaborator panel
  - Horizon selector (1/3/5/10 years)
  - Presenter Mode toggle

### 3.4 Business Settings Form
- **Purpose:** Configure accounting and tax settings
- **Sections:**
  - Entity Type selector
  - Accounting Basis toggle
  - VAT section (enable + basis)
  - Tax toggles (CT, PAYE/NIC, Dividends)
  - Working Capital inputs
  - Dividend settings (if applicable)
- **Design Requirements:**
  - Conditional field visibility
  - Real-time validation feedback
  - Clear section grouping
  - Help text/tooltips

### 3.5 Event Tree / Event Management
- **Purpose:** Create and manage forecast events
- **Components:**
  - Event creation form
  - Event timeline visualization
  - Event cards with details
  - Event editing/deletion
- **Design Requirements:**
  - Visual timeline across months
  - Color-coded event types
  - Drag-and-drop or form-based creation
  - Impact visualization

### 3.6 Presenter Mode
- **Purpose:** Clean presentation view for client meetings
- **Layout:** (Detailed in PRD Section 4.5)
  - Header Bar (fixed)
  - Metric Cards Row
  - Charts Section
  - Event Timeline
  - Assumptions Panel
  - Footer Bar
- **Design Requirements:**
  - Full-screen capable
  - Print-friendly
  - No edit controls
  - Professional advisory tool aesthetic

### 3.7 AI Recommendations Panel
- **Purpose:** Display AI-generated suggestions
- **Components:**
  - Recommendation cards
  - Category grouping
  - "Add to model" buttons
  - Explanation text
  - Confidence indicators

---

## 4. Component Design Requirements

### 4.1 Navigation Components

#### Sidebar
- Logo/brand
- Navigation links (Home, Profiles, Dashboard)
- User info (if applicable)
- Collapsible on mobile

#### Top Navigation
- Breadcrumbs or page title
- Action buttons (Export, Presenter Mode)
- User menu (if applicable)

### 4.2 Form Components

#### Input Fields
- Consistent styling
- Label above or floating
- Error states (red border, error message)
- Success states (green border)
- Help text below field

#### Toggle Switches
- Clear on/off states
- Label with description
- Disabled state styling

#### Select Dropdowns
- Native or custom styled
- Searchable for long lists
- Clear selected value display

### 4.3 Data Display Components

#### Metric Cards
- Large number display
- Label/title
- Optional trend indicator
- Optional icon
- Hover state for tooltips

#### Charts
- Consistent color scheme
- Responsive containers
- Tooltips on hover
- Legend (if needed)
- Axis labels

#### Data Grid (AG Grid)
- Sortable columns
- Editable cells
- Row highlighting
- Column resizing
- Export options

### 4.4 Feedback Components

#### Loading States
- Skeleton screens for content
- Spinner for actions
- Progress bars for multi-step

#### Error Messages
- Inline form errors
- Toast notifications for actions
- Error boundaries for crashes

#### Success Messages
- Toast notifications
- Inline confirmations

---

## 5. Responsive Design Requirements

### 5.1 Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px - 1024px | Two columns where appropriate |
| Desktop | > 1024px | Full multi-column layout |

### 5.2 Mobile Considerations
- Touch-friendly targets (min 44px)
- Collapsible navigation
- Stacked forms
- Simplified charts
- Bottom sheet for modals

### 5.3 Tablet Considerations
- Two-column layouts
- Side-by-side forms
- Medium-sized charts

### 5.4 Desktop Considerations
- Full multi-column layouts
- Large charts
- Side-by-side panels
- Hover states

---

## 6. Interaction Patterns

### 6.1 Navigation
- Clear visual hierarchy
- Active state indicators
- Breadcrumbs for deep navigation
- Back button support

### 6.2 Forms
- Progressive disclosure
- Inline validation
- Save drafts automatically
- Clear submit actions

### 6.3 Data Entry
- Auto-save where possible
- Undo/redo for grid edits
- Bulk operations where applicable
- Keyboard shortcuts

### 6.4 Feedback
- Immediate visual feedback
- Loading states for async operations
- Success confirmations
- Error recovery guidance

---

## 7. Accessibility Requirements

### 7.1 WCAG 2.1 Level AA Compliance
- Color contrast ratios meet standards
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators visible
- Alt text for images/icons

### 7.2 Specific Requirements
- All interactive elements keyboard accessible
- Form labels properly associated
- Error messages announced to screen readers
- Charts have text alternatives
- Color not sole indicator of state

---

## 8. Animation and Transitions

### 8.1 Principles
- Subtle and purposeful
- Performance-conscious
- Respect reduced motion preferences

### 8.2 Specific Animations
- Page transitions: Fade in (200ms)
- Modal appearance: Slide up + fade (300ms)
- Button hover: Scale 1.02 (150ms)
- Chart updates: Smooth transitions
- Event timeline: Fade-in stagger

### 8.3 Framer Motion Usage
- Use for complex animations
- Page transitions
- List item animations
- Modal/drawer animations

---

## 9. Design Deliverables Needed

### 9.1 Wireframes
- Low-fidelity layouts for all key screens
- Component placement
- Information hierarchy

### 9.2 High-Fidelity Mockups
- Pixel-perfect designs
- Color and typography applied
- All states (hover, active, disabled, error)
- Responsive breakpoints

### 9.3 Component Library
- Reusable component designs
- Variants and states
- Usage guidelines

### 9.4 Design System Documentation
- Color usage guidelines
- Typography scale
- Spacing system
- Component specifications

---

## 10. Design Approval Process

1. **Wireframe Review:** Stakeholder approval of layouts
2. **High-Fidelity Review:** Stakeholder approval of visual design
3. **Component Review:** Developer handoff preparation
4. **Final Approval:** Ready for implementation

---

## 11. Questions for Design Phase

Before creating detailed designs, please confirm:

1. **Design Tool Preference:** Figma, Sketch, Adobe XD, or handoff via design files?
2. **Designer Availability:** Will designs be provided, or should we create based on requirements?
3. **Design Assets:** Are there existing brand assets (logos, icons) to use?
4. **Design Timeline:** When are designs needed?
5. **Design Iterations:** How many rounds of feedback expected?

---

## 12. Next Steps

Once design requirements are approved:
1. Create detailed wireframes
2. Create high-fidelity mockups
3. Document component specifications
4. Create design system documentation
5. Validate with stakeholders
6. Hand off to development

---

**Status:** Awaiting Design Input/Approval

**Approved By:**
- [ ] Design Lead
- [ ] Product Owner
- [ ] Stakeholder

**Date:** ___________

