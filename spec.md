# Cashflow Builder - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Draft - Awaiting Approval  
**Product:** Beacon & Ledger Cashflow Builder  
**Target Users:** Accountants, Financial Advisors, Business Owners

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Stakeholders](#stakeholders)
4. [User Personas](#user-personas)
5. [Business Requirements](#business-requirements)
6. [Functional Requirements](#functional-requirements)
7. [Non-Functional Requirements](#non-functional-requirements)
8. [User Journeys](#user-journeys)
9. [Technical Requirements](#technical-requirements)
10. [Constraints and Assumptions](#constraints-and-assumptions)
11. [Success Criteria](#success-criteria)
12. [Requirements Traceability Matrix](#requirements-traceability-matrix)

---

## 1. Executive Summary

The Cashflow Builder is an interactive financial forecasting tool designed for accountants and financial advisors to create, analyze, and present cashflow projections for their clients. The system supports multiple accounting bases, tax calculations, working capital management, and event-based scenario modeling.

**Key Value Propositions:**
- AI-assisted business profile creation
- Real-time collaborative cashflow modeling
- Professional presenter mode for client meetings
- Excel export with full formula support
- Multi-year forecasting (1/3/5/10 years)

---

## 2. Product Overview

### 2.1 Product Vision
Enable financial professionals to create accurate, professional cashflow forecasts quickly and present them effectively to clients, supporting better financial decision-making.

### 2.2 Product Scope
**In Scope:**
- Business profile creation with AI assistance
- Cashflow modeling with accrual/cash basis
- Tax calculations (VAT, Corporation Tax, PAYE/NIC)
- Working capital adjustments
- Event tree system for scenario modeling
- Presenter mode for client presentations
- Excel export with formulas
- AI-powered recommendations

**Out of Scope (v1.0):**
- Multi-currency support
- Real-time collaboration (sequential only)
- Mobile native apps
- Integration with accounting software
- User authentication system (internal-only mode)

### 2.3 Product Goals
1. Reduce cashflow forecast creation time by 70%
2. Enable real-time client presentations
3. Ensure 100% Excel formula accuracy
4. Support UK tax regulations compliance

---

## 3. Stakeholders

| Stakeholder | Role | Interest |
|------------|------|----------|
| Accountants | Primary Users | Create accurate forecasts efficiently |
| Financial Advisors | Primary Users | Present forecasts to clients |
| Business Owners | End Beneficiaries | Understand financial projections |
| Beacon & Ledger | Product Owner | Deliver professional tool |
| Development Team | Builders | Implement requirements |

---

## 4. User Personas

### 4.1 Persona 1: Sarah - Senior Accountant
- **Age:** 42
- **Role:** Senior Accountant at mid-size firm
- **Experience:** 15 years in accounting
- **Goals:** Create accurate forecasts quickly, present professionally
- **Pain Points:** Manual Excel work, time-consuming client meetings
- **Tech Comfort:** High

### 4.2 Persona 2: James - Financial Advisor
- **Age:** 35
- **Role:** Independent financial advisor
- **Experience:** 8 years
- **Goals:** Impress clients with professional presentations
- **Pain Points:** Lack of visual tools, difficulty explaining forecasts
- **Tech Comfort:** Medium

### 4.3 Persona 3: Michael - Business Owner
- **Age:** 48
- **Role:** CEO of growing SaaS company
- **Experience:** Business owner for 10 years
- **Goals:** Understand cashflow, make informed decisions
- **Pain Points:** Complex financial jargon, unclear projections
- **Tech Comfort:** Low-Medium

---

## 5. Business Requirements

### BR-1: Business Profile Management
**Priority:** High  
**Description:** System must allow creation and management of business profiles with AI assistance.

**Business Value:** Reduces data entry time and ensures consistency.

### BR-2: Multi-Basis Accounting Support
**Priority:** High  
**Description:** System must support both cash and accrual accounting bases with appropriate calculations.

**Business Value:** Meets UK accounting standards and client requirements.

### BR-3: Tax Compliance
**Priority:** High  
**Description:** System must accurately calculate VAT, Corporation Tax, PAYE/NIC, and Dividends per UK regulations.

**Business Value:** Ensures compliance and reduces risk.

### BR-4: Professional Presentation
**Priority:** High  
**Description:** System must provide a clean, professional presenter mode for client meetings.

**Business Value:** Enhances advisor credibility and client understanding.

### BR-5: Excel Compatibility
**Priority:** High  
**Description:** System must export forecasts to Excel with working formulas.

**Business Value:** Allows offline analysis and client distribution.

### BR-6: Scenario Modeling
**Priority:** Medium  
**Description:** System must support event-based scenario modeling (funding, hires, price changes).

**Business Value:** Enables "what-if" analysis for strategic planning.

### BR-7: AI Recommendations
**Priority:** Medium  
**Description:** System must provide intelligent suggestions for revenue/expense items and tax optimizations.

**Business Value:** Improves forecast completeness and accuracy.

---

## 6. Functional Requirements

### FR-1: Business Profile Creation

#### FR-1.1: Profile Intake
- **ID:** FR-1.1
- **Description:** User can create a business profile by providing URL or text description
- **Priority:** High
- **Acceptance Criteria:**
  - User can enter business URL or free-form text
  - AI generates structured profile fields
  - User can review and edit AI-generated fields
  - Profile is saved with all required fields

#### FR-1.2: Entity Type Selection
- **ID:** FR-1.2
- **Description:** User must select entity type (Limited Company or Sole Trader)
- **Priority:** High
- **Acceptance Criteria:**
  - Dropdown/selector for entity type
  - Selection affects available tax options
  - Validation prevents invalid combinations

#### FR-1.3: Collaboration Notes
- **ID:** FR-1.3
- **Description:** User can add free-form notes visible to team members
- **Priority:** Medium
- **Acceptance Criteria:**
  - Text area for notes input
  - Notes persist with profile
  - Notes visible in dashboard

### FR-2: Accounting Basis Configuration

#### FR-2.1: Basis Selection
- **ID:** FR-2.1
- **Description:** User can select accounting basis (Cash or Accrual)
- **Priority:** High
- **Acceptance Criteria:**
  - Toggle/selector for accounting basis
  - Selection affects working capital options
  - Cash basis disables debtor/creditor days

#### FR-2.2: Working Capital Settings
- **ID:** FR-2.2
- **Description:** User can set debtor days and creditor days (accrual only)
- **Priority:** High
- **Acceptance Criteria:**
  - Input fields for debtor/creditor days
  - Fields disabled when cash basis selected
  - Values default to 0 for cash basis
  - Validation ensures non-negative values

### FR-3: VAT Configuration

#### FR-3.1: VAT Toggle
- **ID:** FR-3.1
- **Description:** User can enable/disable VAT calculations
- **Priority:** High
- **Acceptance Criteria:**
  - Toggle switch for VAT enabled
  - When disabled, VAT basis selector is hidden
  - When enabled, VAT basis selector appears

#### FR-3.2: VAT Basis Selection
- **ID:** FR-3.2
- **Description:** User can select VAT basis (Accrual or Cash) when VAT enabled
- **Priority:** High
- **Acceptance Criteria:**
  - Dropdown for VAT basis (only visible if VAT enabled)
  - Accrual: VAT on invoiced amounts
  - Cash: VAT on cash received/paid
  - Selection affects VAT calculation timing

### FR-4: Tax Configuration

#### FR-4.1: Corporation Tax Toggle
- **ID:** FR-4.1
- **Description:** User can enable/disable Corporation Tax (Limited Company only)
- **Priority:** High
- **Acceptance Criteria:**
  - Toggle only available for Limited Company
  - Disabled for Sole Trader
  - When enabled, CT calculated on taxable profit
  - Payment timing: 9 months after year-end

#### FR-4.2: PAYE/NIC Toggle
- **ID:** FR-4.2
- **Description:** User can enable/disable PAYE and NIC calculations
- **Priority:** High
- **Acceptance Criteria:**
  - Toggle for PAYE/NIC enabled
  - When enabled, monthly employer NIC calculated
  - Monthly PAYE calculated as cash outflow
  - Follows cash timing rules

#### FR-4.3: Dividend Configuration
- **ID:** FR-4.3
- **Description:** User can enable dividends and configure payout ratio (Limited Company only)
- **Priority:** Medium
- **Acceptance Criteria:**
  - Toggle only available for Limited Company
  - Director salary input field
  - Dividend payout ratio slider (0-100%)
  - Dividends calculated from post-tax profit
  - Dividends cannot exceed available cash

### FR-5: Forecast Engine

#### FR-5.1: Multi-Year Forecasting
- **ID:** FR-5.1
- **Description:** System supports 1, 3, 5, and 10-year forecast horizons
- **Priority:** High
- **Acceptance Criteria:**
  - User can select forecast horizon
  - Forecast recalculates when horizon changes
  - Monthly granularity maintained across all horizons
  - Year-end boundaries handled correctly

#### FR-5.2: Accrual Basis Calculations
- **ID:** FR-5.2
- **Description:** When accrual basis selected, apply working capital adjustments
- **Priority:** High
- **Acceptance Criteria:**
  - Revenue shifted forward by debtor days
  - Expenses shifted forward by creditor days
  - AR/AP balances calculated monthly
  - Cashflow adjusted for working capital timing

#### FR-5.3: Cash Basis Calculations
- **ID:** FR-5.3
- **Description:** When cash basis selected, recognize revenue/expenses on cash receipt/payment
- **Priority:** High
- **Acceptance Criteria:**
  - Revenue recognized when cash received
  - Expenses recognized when cash paid
  - No working capital adjustments
  - Debtor/creditor days set to 0

#### FR-5.4: VAT Calculations
- **ID:** FR-5.4
- **Description:** System calculates VAT based on enabled status and basis
- **Priority:** High
- **Acceptance Criteria:**
  - If disabled: no VAT rows, zero VAT
  - If enabled + accrual: VAT on invoiced sales/expenses
  - If enabled + cash: VAT on cash received/paid
  - VAT payable calculated per VAT quarter
  - VAT line items added to forecast

#### FR-5.5: Corporation Tax Calculations
- **ID:** FR-5.5
- **Description:** System calculates CT when enabled for Limited Company
- **Priority:** High
- **Acceptance Criteria:**
  - CT calculated on taxable profit (accrual basis)
  - Payment in month 21 for Year 1 (9 months after year-end)
  - Annual CT calculations for multi-year forecasts
  - CT cash outflow row added

#### FR-5.6: PAYE/NIC Calculations
- **ID:** FR-5.6
- **Description:** System calculates PAYE and NIC when enabled
- **Priority:** High
- **Acceptance Criteria:**
  - Monthly employer NIC calculated
  - Monthly PAYE calculated
  - Cash timing rules applied
  - Monthly cash outflows added

#### FR-5.7: Dividend Calculations
- **ID:** FR-5.7
- **Description:** System calculates dividends when enabled for Limited Company
- **Priority:** Medium
- **Acceptance Criteria:**
  - Post-tax profit calculated
  - Dividend = post-tax profit × payout ratio
  - Dividend constrained by available cash
  - Dividend cash outflow added monthly

### FR-6: Event Tree System

#### FR-6.1: Event Creation
- **ID:** FR-6.1
- **Description:** User can create events (funding, hire, client win, price increase)
- **Priority:** Medium
- **Acceptance Criteria:**
  - Form to create new event
  - Event name, month, type required
  - Amount or percent change based on type
  - Target field for applicable events
  - Events saved to profile

#### FR-6.2: Event Application
- **ID:** FR-6.2
- **Description:** System applies events to forecast in correct order
- **Priority:** Medium
- **Acceptance Criteria:**
  - Funding events: one-off cash injection
  - Hire events: increase payroll from event month forward
  - Client win: add recurring revenue from event month
  - Price increase: apply % uplift from event month
  - Events cumulative and re-applied on recalculation

#### FR-6.3: Event Timeline Display
- **ID:** FR-6.3
- **Description:** User can view events in timeline format
- **Priority:** Medium
- **Acceptance Criteria:**
  - Visual timeline across forecast months
  - Event cards with icon, label, month, impact
  - Category colors (funding=aqua, hire=slate, price=amber)
  - Hover tooltips with details

### FR-7: Presenter Mode

#### FR-7.1: Enter Presenter Mode
- **ID:** FR-7.1
- **Description:** User can toggle into presenter mode
- **Priority:** High
- **Acceptance Criteria:**
  - Toggle button in dashboard
  - All edit controls hidden
  - Clean, read-only view displayed
  - Full-screen layout

#### FR-7.2: Header Bar
- **ID:** FR-7.2
- **Description:** Presenter mode displays header with business info and toggles
- **Priority:** High
- **Acceptance Criteria:**
  - Business name (large, bold)
  - Entity type badge
  - Accounting basis badge (aqua highlight if active)
  - Forecast selector (1Y/3Y/5Y/10Y)
  - Tax module status chips
  - Exit button top-right
  - Navy background (#15213C)

#### FR-7.3: Metric Cards
- **ID:** FR-7.3
- **Description:** Presenter mode displays 5 key metric cards
- **Priority:** High
- **Acceptance Criteria:**
  - Net Cash Position (end of period)
  - Peak Negative Cash Requirement
  - Break-Even Month
  - Cash Runway (months)
  - Revenue Growth (Y1-Y3 CAGR)
  - Cards: white background, slate border, rounded-2xl
  - Aqua accent line under titles

#### FR-7.4: Charts Display
- **ID:** FR-7.4
- **Description:** Presenter mode displays cashflow and financial charts
- **Priority:** High
- **Acceptance Criteria:**
  - Net Cashflow line chart (Recharts)
  - Negative zones highlighted in red
  - Revenue & Expenses stacked bar chart
  - P&L summary chart (optional)
  - Tooltips on hover
  - Responsive grid layout

#### FR-7.5: Event Timeline in Presenter
- **ID:** FR-7.5
- **Description:** Presenter mode displays event timeline
- **Priority:** Medium
- **Acceptance Criteria:**
  - Visual timeline across months
  - Event cards with details
  - Category color coding
  - Framer Motion animations

#### FR-7.6: Assumptions Panel
- **ID:** FR-7.6
- **Description:** Presenter mode displays assumptions summary
- **Priority:** Medium
- **Acceptance Criteria:**
  - Tax rate summaries
  - Debtor/Creditor days (if accrual)
  - Accounting basis summary
  - Growth rates and margins
  - Collapsible accordion

#### FR-7.7: Footer Bar
- **ID:** FR-7.7
- **Description:** Presenter mode displays footer with actions
- **Priority:** High
- **Acceptance Criteria:**
  - Disclaimer text
  - Last updated timestamp
  - Export to Excel button (aqua, large)
  - Back to Dashboard button (outline)

### FR-8: Excel Export

#### FR-8.1: Multi-Sheet Workbook
- **ID:** FR-8.1
- **Description:** Excel export creates workbook with multiple sheets
- **Priority:** High
- **Acceptance Criteria:**
  - Profile sheet with business details
  - Assumptions sheet with all settings
  - Forecast sheet with monthly data
  - Summary sheet with key metrics

#### FR-8.2: Formula Implementation
- **ID:** FR-8.2
- **Description:** Excel export includes working formulas
- **Priority:** High
- **Acceptance Criteria:**
  - Monthly totals: =SUM(Bx:My)
  - Cash balance: Balance_M2 = Balance_M1 + NetCash_M2
  - VAT formulas respect vat_basis
  - CT formulas with proper timing
  - Dividend formulas with cash constraints
  - Working capital formulas (if accrual)

#### FR-8.3: Conditional Rows
- **ID:** FR-8.3
- **Description:** Excel export hides/zeros rows when toggles off
- **Priority:** Medium
- **Acceptance Criteria:**
  - VAT rows hidden if VAT disabled
  - CT rows hidden if CT disabled
  - Dividend rows hidden if dividends disabled
  - Formula consistency maintained

### FR-9: AI Recommendations

#### FR-9.1: Recommendation Generation
- **ID:** FR-9.1
- **Description:** System generates AI recommendations for revenue/expense items
- **Priority:** Medium
- **Acceptance Criteria:**
  - API endpoint: POST /api/ai/recommendations
  - Input: profile, revenue items, expense items, settings
  - Output: structured suggestions JSON
  - Recommendations consider entity type, basis, tax settings

#### FR-9.2: Recommendation Display
- **ID:** FR-9.2
- **Description:** User can view and accept AI recommendations
- **Priority:** Medium
- **Acceptance Criteria:**
  - Recommendations displayed in sidebar/panel
  - Explanations for each suggestion
  - "Add to model" buttons
  - Grouped by category
  - Confidence indicators

### FR-10: Internal-Only Access

#### FR-10.1: Access Control
- **ID:** FR-10.1
- **Description:** System restricts access to internal users only
- **Priority:** High
- **Acceptance Criteria:**
  - Environment variable for internal-only mode
  - Public signup routes disabled
  - API routes protected
  - Simple authentication check

---

## 7. Non-Functional Requirements

### NFR-1: Performance
- **ID:** NFR-1
- **Description:** Forecast recalculation must complete within 2 seconds for 10-year horizon
- **Priority:** High

### NFR-2: Usability
- **ID:** NFR-2
- **Description:** New users can create first forecast within 10 minutes
- **Priority:** High

### NFR-3: Reliability
- **ID:** NFR-3
- **Description:** System uptime must be 99.5%
- **Priority:** Medium

### NFR-4: Security
- **ID:** NFR-4
- **Description:** All API keys and tokens must be stored securely
- **Priority:** High

### NFR-5: Compatibility
- **ID:** NFR-5
- **Description:** Excel exports must open correctly in Excel 2016+
- **Priority:** High

### NFR-6: Accessibility
- **ID:** NFR-6
- **Description:** UI must meet WCAG 2.1 AA standards
- **Priority:** Medium

---

## 8. User Journeys

### Journey 1: Creating First Forecast
1. User navigates to profile creation
2. Enters business URL or description
3. Reviews AI-generated profile
4. Configures accounting basis and tax settings
5. Adds revenue and expense line items
6. Reviews forecast in dashboard
7. Exports to Excel

### Journey 2: Client Presentation
1. User opens existing profile
2. Enters presenter mode
3. Selects forecast horizon (e.g., 3 years)
4. Reviews metrics and charts
5. Explains assumptions to client
6. Shows event timeline
7. Exports Excel for client

### Journey 3: Scenario Modeling
1. User opens forecast
2. Adds funding event (Month 3, £50k)
3. Adds hire event (Month 6, +£3k/month)
4. Reviews updated forecast
5. Compares scenarios
6. Presents best case to client

---

## 9. Technical Requirements

### TR-1: Technology Stack
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- InstantDB (no Supabase)
- OpenAI API
- ExcelJS
- Recharts
- Framer Motion

### TR-2: Data Storage
- InstantDB schema for profiles, scenarios, line items, events
- In-memory calculations (no external DB queries during forecast)

### TR-3: API Requirements
- RESTful API routes
- Server actions for profile management
- Excel export endpoint

---

## 10. Constraints and Assumptions

### Constraints
- UK tax regulations only
- English language only
- Desktop-first design (mobile responsive)
- No real-time multi-user collaboration

### Assumptions
- Users have basic accounting knowledge
- Internet connection required
- Modern browser support (Chrome, Firefox, Safari, Edge)

---

## 11. Success Criteria

1. **Time Savings:** 70% reduction in forecast creation time
2. **Accuracy:** 100% Excel formula correctness
3. **Adoption:** 80% of users use presenter mode
4. **Satisfaction:** 4.5+ star rating from users

---

## 12. Requirements Traceability Matrix

| Requirement ID | Source | Priority | Status | Design Ref | Implementation Ref |
|---------------|--------|----------|--------|------------|-------------------|
| BR-1 | Business Need | High | Draft | - | - |
| FR-1.1 | BR-1 | High | Draft | - | - |
| FR-1.2 | BR-1 | High | Draft | - | - |
| ... | ... | ... | ... | ... | ... |

---

## Approval Status

- [ ] Product Owner Approval
- [ ] Technical Lead Approval
- [ ] Design Approval
- [ ] Stakeholder Sign-off

---

**Next Steps:**
1. Review and approve this PRD
2. Create detailed design specifications
3. Generate user stories and tasks
4. Begin implementation

